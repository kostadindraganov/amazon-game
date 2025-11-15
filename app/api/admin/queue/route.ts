import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET() {
  try {
    const supabase = supabaseAdmin;

    // Get all queue entries ordered by creation date
    const { data: queueEntries, error } = await supabase
      .from('game_queue')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching queue:', error);
      return NextResponse.json(
        { error: 'Failed to fetch queue entries' },
        { status: 500 }
      );
    }

    return NextResponse.json({ queue: queueEntries });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
