import { NextResponse } from 'next/server';
import { supabase, supabaseAdmin } from '@/lib/supabase';

export async function GET() {
  try {
    console.log('🔍 [GET /api/game/current] Starting current game check');

    // Get current processing game
    let { data: processing, error: processingError } = await supabase
      .from('game_queue')
      .select('*')
      .eq('status', 'processing')
      .order('created_at', { ascending: true })
      .limit(1)
      .maybeSingle();

    if (processingError) throw processingError;

    console.log('📊 [GET /api/game/current] Processing entry found:', processing ? {
      id: processing.id,
      username: processing.username,
      plays: processing.plays,
      status: processing.status
    } : 'None');

    // If no processing game, check for pending and auto-advance
    if (!processing) {
      console.log('⏭️  [GET /api/game/current] No processing entry, checking for pending...');

      const { data: nextPending, error: pendingError } = await supabaseAdmin
        .from('game_queue')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: true })
        .limit(1)
        .maybeSingle();

      if (pendingError) throw pendingError;

      console.log('📋 [GET /api/game/current] Pending entry found:', nextPending ? {
        id: nextPending.id,
        username: nextPending.username,
        plays: nextPending.plays,
        status: nextPending.status
      } : 'None');

      if (nextPending) {
        console.log('🔄 [GET /api/game/current] Moving pending to processing...', nextPending.id);

        // Move pending to processing
        const { data: updated, error: updateError } = await supabaseAdmin
          .from('game_queue')
          .update({ status: 'processing' })
          .eq('id', nextPending.id)
          .select()
          .single();

        if (updateError) throw updateError;
        processing = updated;

        console.log('✅ [GET /api/game/current] Successfully updated to processing:', processing.id);
      } else {
        console.log('⚠️  [GET /api/game/current] No pending entries in queue');
      }
    }

    // Get pending queue count
    const { count: pendingCount, error: countError } = await supabase
      .from('game_queue')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending');

    if (countError) throw countError;

    console.log('📊 [GET /api/game/current] Pending queue count:', pendingCount);

    // Get current spin state
    const { data: spinState, error: spinError } = await supabase
      .from('spin_state')
      .select('*')
      .eq('id', 1)
      .single();

    if (spinError) throw spinError;

    console.log('🎰 [GET /api/game/current] Current spin state:', spinState);

    const response = {
      currentPlayer: processing,
      queueLength: pendingCount || 0,
      spinState
    };

    console.log('✅ [GET /api/game/current] Returning response:', {
      hasCurrentPlayer: !!processing,
      currentPlayerId: processing?.id,
      currentPlayerUsername: processing?.username,
      currentPlayerPlays: processing?.plays,
      queueLength: response.queueLength
    });

    return NextResponse.json(response);

  } catch (error) {
    console.error('❌ [GET /api/game/current] Error fetching current game state:', error);
    return NextResponse.json(
      { error: 'Failed to fetch game state' },
      { status: 500 }
    );
  }
}
