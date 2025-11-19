import { NextRequest, NextResponse } from 'next/server';
import { supabase, supabaseAdmin } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { queueId } = body;



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



    // Get settings
    const { data: settings, error: settingsError } = await supabase
      .from('settings')
      .select('*')
      .eq('id', 1)
      .single();

    if (settingsError) throw settingsError;



    // Increment spin count using stored function
    const { data: newCount, error: incrementError } = await supabaseAdmin
      .rpc('increment_spin_count');

    if (incrementError) throw incrementError;

    const currentSpinCount = newCount as number;



    // ============================================
    // WINNING LOGIC - Priority Order:
    // 1. Product-Specific Win (win_at_spin_count matches current_spin_count)
    // 2. Global Win Frequency (current_spin_count % spin_count_to_win === 0)
    // 3. No Win (Try Again)
    // ============================================

    let winnerData = null;
    let winningProduct = null;
    let isWinner = false;
    let winType = 'none'; // 'product-specific', 'global-frequency', or 'none'

    // STEP 1: Check for product-specific wins (HIGHEST PRIORITY)

    const { data: productSpecificWinners, error: specificWinError } = await supabase
      .from('products')
      .select('*')
      .eq('status', 'active')
      .eq('win_at_spin_count', currentSpinCount);

    if (specificWinError) {
      console.error('❌ [POST /api/game/spin] Error checking product-specific wins:', specificWinError);
    }

    if (productSpecificWinners && productSpecificWinners.length > 0) {
      // Product-specific win found!
      isWinner = true;
      winType = 'product-specific';

      // If multiple products match, select randomly
      const randomIndex = Math.floor(Math.random() * productSpecificWinners.length);
      winningProduct = productSpecificWinners[randomIndex];

      console.log('🎊 [POST /api/game/spin] PRODUCT-SPECIFIC WIN!', {
        spinCount: currentSpinCount,
        product: winningProduct.title
      });
    } else {

    }

    // STEP 3: Process winner (if applicable)
    if (isWinner && winningProduct) {


      // Mark product as won
      const { error: updateError } = await supabaseAdmin
        .from('products')
        .update({
          status: 'won',
          won_at: new Date().toISOString()
        })
        .eq('id', winningProduct.id);

      if (updateError) throw updateError;



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
        username: queueEntry.username,
        product: winningProduct.title
      });
    }

    // Decrement plays or mark as done
    if (queueEntry.plays > 1) {


      await supabaseAdmin
        .from('game_queue')
        .update({ plays: queueEntry.plays - 1 })
        .eq('id', queueId);


    } else {


      await supabaseAdmin
        .from('game_queue')
        .update({
          status: 'done',
          processed_at: new Date().toISOString()
        })
        .eq('id', queueId);


    }

    const response = {
      success: true,
      isWinner: isWinner && winningProduct !== null,
      winner: winnerData,
      product: winningProduct,
      spinCount: currentSpinCount,
      remainingPlays: Math.max(0, queueEntry.plays - 1)
    };



    return NextResponse.json(response);

  } catch (error) {
    console.error('❌ [POST /api/game/spin] Error processing spin:', error);
    return NextResponse.json(
      { error: 'Failed to process spin' },
      { status: 500 }
    );
  }
}
