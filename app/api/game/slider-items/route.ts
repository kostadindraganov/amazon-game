import { NextResponse } from 'next/server';
import { supabase, type SliderItem } from '@/lib/supabase';

export async function GET() {
  try {
    console.log('📡 [API /slider-items] Fetching settings...');
    // Fetch settings
    const { data: settings, error: settingsError } = await supabase
      .from('settings')
      .select('*')
      .eq('id', 1)
      .single();

    if (settingsError) {
      console.error('❌ [API /slider-items] Settings error:', settingsError);
      throw settingsError;
    }

    console.log('📊 [API /slider-items] Settings:', settings);

    // Fetch active products
    console.log('📡 [API /slider-items] Fetching active products...');
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('*')
      .eq('status', 'active');

    if (productsError) {
      console.error('❌ [API /slider-items] Products error:', productsError);
      throw productsError;
    }

    console.log('📊 [API /slider-items] Products found:', products?.length || 0);

    const activeProducts = products || [];
    const totalItems = settings.slider_item_count;
    const fillersNeeded = Math.max(0, totalItems - activeProducts.length);

    console.log('📊 [API /slider-items] Calculation:', { totalItems, activeProducts: activeProducts.length, fillersNeeded });

    // Create slider items array
    const sliderItems: SliderItem[] = [
      ...activeProducts.map(p => ({ ...p, type: 'product' as const })),
      ...Array(fillersNeeded).fill({
        id: 'filler',
        title: 'Опитай пак',
        price: 0,
        image_url: '/try-again.png',
        status: 'active',
        type: 'filler',
        created_at: new Date().toISOString()
      })
    ];

    // Shuffle the array for randomness
    const shuffled = sliderItems.sort(() => Math.random() - 0.5);

    console.log('✅ [API /slider-items] Returning items:', shuffled.length);

    return NextResponse.json({
      items: shuffled,
      totalItems,
      activeProducts: activeProducts.length,
      fillers: fillersNeeded
    });

  } catch (error) {
    console.error('Error fetching slider items:', error);
    return NextResponse.json(
      { error: 'Failed to fetch slider items' },
      { status: 500 }
    );
  }
}
