import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = (page - 1) * limit;

    // Get total count
    const { count } = await supabaseAdmin
      .from('tiktok_gift_logs')
      .select('*', { count: 'exact', head: true });

    // Get paginated logs
    const { data, error } = await supabaseAdmin
      .from('tiktok_gift_logs')
      .select('*')
      .order('received_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    return NextResponse.json({
      logs: data || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
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
