import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const queueId = parseInt(id, 10);

    if (isNaN(queueId)) {
      return NextResponse.json(
        { error: 'Invalid queue ID' },
        { status: 400 }
      );
    }

    const supabase = supabaseAdmin;

    // Delete the queue entry
    const { error } = await supabase
      .from('game_queue')
      .delete()
      .eq('id', queueId);

    if (error) {
      console.error('Error deleting queue entry:', error);
      return NextResponse.json(
        { error: 'Failed to delete queue entry' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
