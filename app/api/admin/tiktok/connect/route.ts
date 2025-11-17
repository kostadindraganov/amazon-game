import { NextRequest, NextResponse } from 'next/server';
import { tiktokService } from '@/lib/tiktok-service';

export async function POST(request: NextRequest) {
  try {
    const { username } = await request.json();

    if (!username || typeof username !== 'string') {
      return NextResponse.json(
        { error: 'Username is required' },
        { status: 400 }
      );
    }

    // Trim and validate username
    const cleanUsername = username.trim();
    if (!cleanUsername) {
      return NextResponse.json(
        { error: 'Username cannot be empty' },
        { status: 400 }
      );
    }

    // Connect to TikTok Live
    const result = await tiktokService.connect(cleanUsername);

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: `Connected to ${cleanUsername}'s live stream`,
        roomId: result.roomId,
      });
    } else {
      return NextResponse.json(
        { error: result.error || 'Failed to connect' },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('Error connecting to TikTok:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to connect to TikTok Live' },
      { status: 500 }
    );
  }
}
