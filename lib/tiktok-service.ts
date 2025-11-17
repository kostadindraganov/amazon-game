import { WebcastPushConnection } from 'tiktok-live-connector';
import { supabaseAdmin } from './supabase';

// Singleton TikTok connection manager
class TikTokLiveService {
  private connection: WebcastPushConnection | null = null;
  private username: string | null = null;
  private isConnecting: boolean = false;

  async connect(username: string): Promise<{ success: boolean; error?: string; roomId?: string }> {
    try {
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

      console.log(`✅ Connected to TikTok Live: ${username} (Room ID: ${state.roomId})`);

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

      console.log('✅ Disconnected from TikTok Live');
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
          console.log(`🎁 Gift received: ${data.uniqueId} sent ${data.giftName} x${data.repeatCount} (${totalPoints} points)`);
        }
      } catch (error) {
        console.error('❌ Error processing gift event:', error);
      }
    });

    // Listen for connection state changes
    this.connection.on('connected', (state) => {
      console.log('✅ TikTok Live connected:', state);
    });

    this.connection.on('disconnected', async () => {
      console.log('❌ TikTok Live disconnected');

      // Update status in database
      await supabaseAdmin
        .from('tiktok_settings')
        .update({
          is_connected: false,
          connection_status: 'disconnected',
        })
        .eq('id', 1);
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
      console.log(`💬 ${data.uniqueId}: ${data.comment}`);
    });

    this.connection.on('member', (data) => {
      console.log(`👋 ${data.uniqueId} joined`);
    });

    this.connection.on('like', (data) => {
      console.log(`❤️ ${data.uniqueId} liked (total: ${data.likeCount})`);
    });
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
