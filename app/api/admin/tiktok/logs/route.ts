import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    // Get logs (limit to 1000 for performance, but effectively "all" for recent session)
    const { data, error } = await supabaseAdmin
      .from('tiktok_gift_logs')
      .select('*')
      .order('received_at', { ascending: false })
      .limit(1000);

    if (error) throw error;

    return NextResponse.json({
      logs: data || [],
      total: data?.length || 0
    });
  } catch (error: any) {
    console.error('Error fetching TikTok logs:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch TikTok logs' },
      { status: 500 }
    );
  }
}

// Clear all logs
export async function DELETE() {
  try {
    const { error } = await supabaseAdmin
      .from('tiktok_gift_logs')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all rows

    if (error) throw error;

    return NextResponse.json({
      success: true,
      message: 'All logs cleared',
    });
  } catch (error: any) {
    console.error('Error clearing TikTok logs:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to clear logs' },
      { status: 500 }
    );
  }
}
