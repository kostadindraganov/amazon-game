import { NextRequest, NextResponse } from 'next/server';
import { supabase, supabaseAdmin } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { queueId } = body;

    console.log('🎰 [POST /api/game/spin] Starting spin for queueId:', queueId);

    if (!queueId) {
      console.error('❌ [POST /api/game/spin] No queueId provided');
      return NextResponse.json(
        { error: 'queueId is required' },
        { status: 400 }
      );
    }

    // Get queue entry
    const { data: queueEntry, error: queueError } = await supabase
      .from('game_queue')
      .select('*')
      .eq('id', queueId)
      .single();

    if (queueError || !queueEntry) {
      console.error('❌ [POST /api/game/spin] Queue entry not found:', queueId, queueError);
      return NextResponse.json(
        { error: 'Queue entry not found' },
        { status: 404 }
      );
    }

    console.log('📋 [POST /api/game/spin] Queue entry loaded:', {
      id: queueEntry.id,
      username: queueEntry.username,
      plays: queueEntry.plays,
      status: queueEntry.status
    });

    // Get settings
    const { data: settings, error: settingsError } = await supabase
      .from('settings')
      .select('*')
      .eq('id', 1)
      .single();

    if (settingsError) throw settingsError;

    console.log('⚙️  [POST /api/game/spin] Settings loaded:', {
      spin_count_to_win: settings.spin_count_to_win,
      min_points_for_play: settings.min_points_for_play
    });

    // Increment spin count using stored function
    const { data: newCount, error: incrementError } = await supabaseAdmin
      .rpc('increment_spin_count');

    if (incrementError) throw incrementError;

    const currentSpinCount = newCount as number;

    console.log('🔢 [POST /api/game/spin] Spin count incremented to:', currentSpinCount);

    // Determine if this is a winning spin
    const isWinningSpin = currentSpinCount % settings.spin_count_to_win === 0;

    console.log('🎲 [POST /api/game/spin] Is winning spin?', isWinningSpin, `(${currentSpinCount} % ${settings.spin_count_to_win} === 0)`);

    let winnerData = null;
    let winningProduct = null;

    if (isWinningSpin) {
      console.log('🏆 [POST /api/game/spin] WINNING SPIN! Fetching active products...');

      // Get active products
      const { data: activeProducts, error: productsError } = await supabase
        .from('products')
        .select('*')
        .eq('status', 'active');

      if (productsError) throw productsError;

      console.log('📦 [POST /api/game/spin] Active products count:', activeProducts?.length || 0);

      if (activeProducts && activeProducts.length > 0) {
        // Randomly select a product
        const randomIndex = Math.floor(Math.random() * activeProducts.length);
        winningProduct = activeProducts[randomIndex];

        console.log('🎁 [POST /api/game/spin] Selected winning product:', {
          id: winningProduct.id,
          title: winningProduct.title,
          price: winningProduct.price
        });

        // Mark product as won
        const { error: updateError } = await supabaseAdmin
          .from('products')
          .update({
            status: 'won',
            won_at: new Date().toISOString()
          })
          .eq('id', winningProduct.id);

        if (updateError) throw updateError;

        console.log('✅ [POST /api/game/spin] Product marked as won');

        // Insert winner record
        const { data: winner, error: winnerError } = await supabaseAdmin
          .from('winners')
          .insert({
            username: queueEntry.username,
            product_id: winningProduct.id,
            product_title: winningProduct.title,
            product_price: winningProduct.price,
            product_image_url: winningProduct.image_url
          })
          .select()
          .single();

        if (winnerError) throw winnerError;

        winnerData = winner;

        console.log('🏅 [POST /api/game/spin] Winner record created:', {
          id: winner.id,
          username: queueEntry.username,
          product: winningProduct.title
        });
      } else {
        console.warn('⚠️  [POST /api/game/spin] No active products available for winning!');
      }
    } else {
      console.log('🎯 [POST /api/game/spin] Not a winning spin, player gets "Try Again"');
    }

    // Decrement plays or mark as done
    if (queueEntry.plays > 1) {
      console.log('🔄 [POST /api/game/spin] Player has multiple plays, decrementing...', {
        currentPlays: queueEntry.plays,
        newPlays: queueEntry.plays - 1,
        willKeepStatus: 'processing'
      });

      await supabaseAdmin
        .from('game_queue')
        .update({ plays: queueEntry.plays - 1 })
        .eq('id', queueId);

      console.log('✅ [POST /api/game/spin] Plays decremented, status remains PROCESSING');
    } else {
      console.log('✅ [POST /api/game/spin] Last play for this user, marking as DONE', {
        queueId: queueId,
        username: queueEntry.username
      });

      await supabaseAdmin
        .from('game_queue')
        .update({
          status: 'done',
          processed_at: new Date().toISOString()
        })
        .eq('id', queueId);

      console.log('✅ [POST /api/game/spin] Queue entry marked as DONE');
    }

    const response = {
      success: true,
      isWinner: isWinningSpin && winningProduct !== null,
      winner: winnerData,
      product: winningProduct,
      spinCount: currentSpinCount,
      remainingPlays: Math.max(0, queueEntry.plays - 1)
    };

    console.log('📤 [POST /api/game/spin] Returning response:', {
      success: response.success,
      isWinner: response.isWinner,
      remainingPlays: response.remainingPlays,
      username: queueEntry.username
    });

    return NextResponse.json(response);

  } catch (error) {
    console.error('❌ [POST /api/game/spin] Error processing spin:', error);
    return NextResponse.json(
      { error: 'Failed to process spin' },
      { status: 500 }
    );
  }
}
