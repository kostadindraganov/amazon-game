import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from('tiktok_settings')
      .select('*')
      .eq('id', 1)
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Error fetching TikTok settings:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch TikTok settings' },
      { status: 500 }
    );
  }
}
