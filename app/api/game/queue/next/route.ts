import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST() {
  try {
    console.log('⏭️  [POST /api/game/queue/next] Fetching next pending queue entry...');

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
      console.log('⚠️  [POST /api/game/queue/next] No pending entries found');
      return NextResponse.json({
        hasNext: false,
        message: 'No pending entries in queue'
      });
    }

    console.log('📋 [POST /api/game/queue/next] Next pending entry found:', {
      id: nextEntry.id,
      username: nextEntry.username,
      plays: nextEntry.plays,
      status: nextEntry.status
    });

    // Mark as processing
    const { error: updateError } = await supabaseAdmin
      .from('game_queue')
      .update({ status: 'processing' })
      .eq('id', nextEntry.id);

    if (updateError) throw updateError;

    console.log('✅ [POST /api/game/queue/next] Entry marked as processing:', nextEntry.id);

    return NextResponse.json({
      hasNext: true,
      player: {
        ...nextEntry,
        status: 'processing'
      }
    });

  } catch (error) {
    console.error('❌ [POST /api/game/queue/next] Error getting next queue entry:', error);
    return NextResponse.json(
      { error: 'Failed to get next queue entry' },
      { status: 500 }
    );
  }
}
