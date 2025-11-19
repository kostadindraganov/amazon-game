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

export async function DELETE() {
  try {
    const supabase = supabaseAdmin;

    // Delete all entries from game_queue
    const { error } = await supabase
      .from('game_queue')
      .delete()
      .neq('id', 0); // Hack to delete all rows since we need a where clause usually, or just use a condition that is always true if policy allows

    // Note: Supabase delete requires a WHERE clause usually. 
    // If .neq('id', 0) doesn't work or if we want to be safer, we can use .gt('id', -1) assuming id is positive integer.
    // Or better, if we want to clear everything, we might need to check RLS policies but this is admin api.

    if (error) {
      console.error('Error clearing queue:', error);
      return NextResponse.json(
        { error: 'Failed to clear queue' },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: 'Queue cleared successfully' });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
