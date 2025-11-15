import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    // Get current processing game
    const { data: processing, error: processingError } = await supabase
      .from('game_queue')
      .select('*')
      .eq('status', 'processing')
      .order('created_at', { ascending: true })
      .limit(1)
      .maybeSingle();

    if (processingError) throw processingError;

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

    return NextResponse.json({
      currentPlayer: processing,
      queueLength: pendingCount || 0,
      spinState
    });

  } catch (error) {
    console.error('Error fetching current game state:', error);
    return NextResponse.json(
      { error: 'Failed to fetch game state' },
      { status: 500 }
    );
  }
}
