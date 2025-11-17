import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, points } = body;

    if (!username || typeof points !== 'number') {
      return NextResponse.json(
        { error: 'Invalid request. username and points are required' },
        { status: 400 }
      );
    }

    // Fetch settings to determine min points
    const { data: settings, error: settingsError } = await supabase
      .from('settings')
      .select('min_points_for_play')
      .eq('id', 1)
      .single();

    if (settingsError) throw settingsError;

    const minPoints = settings.min_points_for_play;

    if (points < minPoints) {
      return NextResponse.json(
        { error: `Insufficient points. Minimum ${minPoints} points required` },
        { status: 400 }
      );
    }

    // Calculate number of plays
    const plays = Math.floor(points / minPoints);

    // Check current queue count (only count pending and processing entries)
    const { count: queueCount, error: countError } = await supabase
      .from('game_queue')
      .select('*', { count: 'exact', head: true })
      .in('status', ['pending', 'processing']);

    if (countError) throw countError;

    // Limit queue to 20 active entries
    if (queueCount && queueCount >= 20) {
      return NextResponse.json(
        { error: 'Queue is full. Please wait for other players to finish.' },
        { status: 400 }
      );
    }

    // Add to queue
    const { data: queueEntry, error: queueError } = await supabase
      .from('game_queue')
      .insert({
        username,
        plays,
        status: 'pending'
      })
      .select()
      .single();

    if (queueError) throw queueError;

    return NextResponse.json({
      success: true,
      queued: true,
      playsQueued: plays,
      queueId: queueEntry.id,
      message: `${username} added to queue with ${plays} play(s)`
    });

  } catch (error) {
    console.error('Error adding to queue:', error);
    return NextResponse.json(
      { error: 'Failed to add to queue' },
      { status: 500 }
    );
  }
}
