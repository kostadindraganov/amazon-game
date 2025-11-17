import { NextResponse } from 'next/server';
import { tiktokService } from '@/lib/tiktok-service';

export async function POST() {
  try {
    await tiktokService.disconnect();

    return NextResponse.json({
      success: true,
      message: 'Disconnected from TikTok Live',
    });
  } catch (error: any) {
    console.error('Error disconnecting from TikTok:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to disconnect from TikTok Live' },
      { status: 500 }
    );
  }
}
