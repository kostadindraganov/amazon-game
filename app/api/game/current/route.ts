import { NextResponse } from 'next/server';
import { supabase, supabaseAdmin } from '@/lib/supabase';

export async function GET() {
  try {


    // Get current processing game
    let { data: processing, error: processingError } = await supabase
      .from('game_queue')
      .select('*')
      .eq('status', 'processing')
      .order('created_at', { ascending: true })
      .limit(1)
      .maybeSingle();

    if (processingError) throw processingError;



    // If no processing game, check for pending and auto-advance
    if (!processing) {


      const { data: nextPending, error: pendingError } = await supabaseAdmin
        .from('game_queue')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: true })
        .limit(1)
        .maybeSingle();

      if (pendingError) throw pendingError;



      if (nextPending) {


        // Move pending to processing
        const { data: updated, error: updateError } = await supabaseAdmin
          .from('game_queue')
          .update({ status: 'processing' })
          .eq('id', nextPending.id)
          .select()
          .single();

        if (updateError) throw updateError;
        processing = updated;



      }

    }


    // Get pending queue count
    const { count: pendingCount, error: countError } = await supabase
      .from('game_queue')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending');

    if (countError) throw countError;



    // Get current spin state
    const { data: spinState, error: spinError } = await supabase
      .from('spin_state')
      .select('*')
      .eq('id', 1)
      .single();

    if (spinError) throw spinError;



    const response = {
      currentPlayer: processing,
      queueLength: pendingCount || 0,
      spinState
    };



    return NextResponse.json(response);

  } catch (error) {
    console.error('❌ [GET /api/game/current] Error fetching current game state:', error);
    return NextResponse.json(
      { error: 'Failed to fetch game state' },
      { status: 500 }
    );
  }
}
