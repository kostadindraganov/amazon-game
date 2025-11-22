import { WebcastPushConnection } from 'tiktok-live-connector';
import { supabaseAdmin } from './supabase';

// Singleton TikTok connection manager
class TikTokLiveService {
  private connection: WebcastPushConnection | null = null;
  private username: string | null = null;

  private isConnecting: boolean = false;
  private isIntentionalDisconnect: boolean = false;
  private reconnectTimer: NodeJS.Timeout | null = null;

  async connect(username: string): Promise<{ success: boolean; error?: string; roomId?: string }> {
    try {
      this.isIntentionalDisconnect = false;
      if (this.reconnectTimer) {
        clearTimeout(this.reconnectTimer);
        this.reconnectTimer = null;
      }

      // Disconnect existing connection if any
      if (this.connection) {
        await this.disconnect();
      }

      this.isConnecting = true;
      this.username = username;

      // Update status to connecting
      await supabaseAdmin
        .from('tiktok_settings')
        .update({
          username,
          connection_status: 'connecting',
          error_message: null,
        })
        .eq('id', 1);

      // Create new connection
      this.connection = new WebcastPushConnection(username);

      // Set up event listeners before connecting
      this.setupEventListeners();

      // Connect to TikTok Live
      const state = await this.connection.connect();

      this.isConnecting = false;

      // Update status to connected
      await supabaseAdmin
        .from('tiktok_settings')
        .update({
          is_connected: true,
          connection_status: 'connected',
          room_id: state.roomId,
          last_connected_at: new Date().toISOString(),
          error_message: null,
        })
        .eq('id', 1);



      return { success: true, roomId: state.roomId };
    } catch (error: any) {
      this.isConnecting = false;
      const errorMessage = error.message || 'Failed to connect to TikTok Live';

      // Update status to error
      await supabaseAdmin
        .from('tiktok_settings')
        .update({
          is_connected: false,
          connection_status: 'error',
          error_message: errorMessage,
        })
        .eq('id', 1);

      console.error('❌ TikTok connection error:', errorMessage);

      return { success: false, error: errorMessage };
    }
  }

  async disconnect(): Promise<void> {
    try {
      this.isIntentionalDisconnect = true;
      if (this.reconnectTimer) {
        clearTimeout(this.reconnectTimer);
        this.reconnectTimer = null;
      }

      // Disconnect the connection if it exists
      if (this.connection) {
        this.connection.disconnect();
        this.connection = null;
        this.username = null;
      }

      // Always update the database to ensure consistent state
      // This handles cases where connection is null but DB shows connected
      // (e.g., after server restart or connection cleanup)
      await supabaseAdmin
        .from('tiktok_settings')
        .update({
          is_connected: false,
          connection_status: 'disconnected',
          error_message: null,
        })
        .eq('id', 1);


    } catch (error) {
      console.error('❌ Error disconnecting:', error);
      // Re-throw error so API endpoint can return proper error response
      throw error;
    }
  }

  private setupEventListeners(): void {
    if (!this.connection) return;

    // Listen for gift events
    this.connection.on('gift', async (data) => {
      try {
        // Calculate total points (gift value * repeat count)
        const totalPoints = (data.diamondCount || 0) * (data.repeatCount || 1);

        // Log gift to database
        const { error } = await supabaseAdmin.from('tiktok_gift_logs').insert({
          username: data.nickname || 'Unknown',
          unique_id: data.uniqueId || 'unknown',
          gift_id: data.giftId || 0,
          gift_name: data.giftName || null,
          gift_points: data.diamondCount || 0,
          gift_diamond_count: data.diamondCount || 0,
          repeat_count: data.repeatCount || 1,
          total_points: totalPoints,
          profile_picture_url: data.profilePictureUrl || null,
          raw_data: data,
        });

        if (error) {
          console.error('❌ Error logging gift:', error);
        } else {

        }

        // Fetch minimum points required to play from settings
        const { data: settings, error: settingsError } = await supabaseAdmin
          .from('settings')
          .select('min_points_for_play')
          .eq('id', 1)
          .single();

        if (settingsError) {
          console.error('❌ Error fetching settings:', settingsError);
          return;
        }

        const minPointsForPlay = settings.min_points_for_play;

        // Check if gift points meet or exceed minimum required points
        if (totalPoints >= minPointsForPlay) {


          // Trigger game by calling /api/game/play endpoint
          const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
          const username = data.nickname || data.uniqueId || 'Unknown';

          const response = await fetch(`${siteUrl}/api/game/play`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              username: username,
              points: totalPoints,
            }),
          });

          if (response.ok) {
            const result = await response.json();

          } else {
            const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
            console.error(`❌ Failed to trigger game:`, errorData);
          }
        } else {

        }
      } catch (error) {
        console.error('❌ Error processing gift event:', error);
      }
    });

    // Listen for connection state changes
    this.connection.on('connected', (state) => {

    });

    this.connection.on('disconnected', async () => {
      // If disconnect was not intentional and we have a username, try to reconnect
      if (!this.isIntentionalDisconnect && this.username) {
        await this.handleAutoReconnect(this.username);
      } else {
        // Normal disconnect logic
        await supabaseAdmin
          .from('tiktok_settings')
          .update({
            is_connected: false,
            connection_status: 'disconnected',
            error_message: null,
          })
          .eq('id', 1);
      }
    });

    this.connection.on('error', async (err) => {
      console.error('❌ TikTok Live error:', err);

      // Update status in database
      await supabaseAdmin
        .from('tiktok_settings')
        .update({
          is_connected: false,
          connection_status: 'error',
          error_message: err.message || 'Connection error',
        })
        .eq('id', 1);
    });

    // Optional: Listen for other events for debugging
    this.connection.on('chat', (data) => {

    });

    this.connection.on('member', (data) => {

    });

    this.connection.on('like', (data) => {

    });
  }

  private async handleAutoReconnect(username: string) {
    if (this.isIntentionalDisconnect) return;

    console.log(`🔄 Connection lost. Auto-reconnecting to ${username} in 5s...`);

    // Update status in database to connecting
    await supabaseAdmin
      .from('tiktok_settings')
      .update({
        connection_status: 'connecting',
        error_message: 'Connection lost. Auto-reconnecting in 5s...',
      })
      .eq('id', 1);

    // Schedule reconnect
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);

    this.reconnectTimer = setTimeout(async () => {
      if (this.isIntentionalDisconnect) return;

      console.log(`🔄 Attempting auto-reconnect to ${username}...`);
      const result = await this.connect(username);

      // If connection failed and it wasn't intentional disconnect, retry
      if (!result.success && !this.isIntentionalDisconnect) {
        console.log(`❌ Auto-reconnect failed. Retrying in 5s...`);
        this.handleAutoReconnect(username);
      }
    }, 5000);
  }

  getConnectionStatus(): { isConnected: boolean; username: string | null } {
    return {
      isConnected: this.connection !== null && !this.isConnecting,
      username: this.username,
    };
  }

  isCurrentlyConnected(): boolean {
    return this.connection !== null;
  }
}

// Export singleton instance
export const tiktokService = new TikTokLiveService();
