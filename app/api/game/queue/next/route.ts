import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST() {
  try {
    // Get the next pending entry
    const { data: nextEntry, error: fetchError } = await supabaseAdmin
      .from('game_queue')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: true })
      .limit(1)
      .maybeSingle();

    if (fetchError) throw fetchError;

    if (!nextEntry) {
      return NextResponse.json({
        hasNext: false,
        message: 'No pending entries in queue'
      });
    }

    // Mark as processing
    const { error: updateError } = await supabaseAdmin
      .from('game_queue')
      .update({ status: 'processing' })
      .eq('id', nextEntry.id);

    if (updateError) throw updateError;

    return NextResponse.json({
      hasNext: true,
      player: {
        ...nextEntry,
        status: 'processing'
      }
    });

  } catch (error) {
    console.error('Error getting next queue entry:', error);
    return NextResponse.json(
      { error: 'Failed to get next queue entry' },
      { status: 500 }
    );
  }
}
