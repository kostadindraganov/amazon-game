import { NextResponse } from 'next/server';
import { supabase, type SliderItem } from '@/lib/supabase';

export async function GET() {
  try {
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

    // Fetch active products
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('*')
      .eq('status', 'active');

    if (productsError) {
      console.error('❌ [API /slider-items] Products error:', productsError);
      throw productsError;
    }

    const activeProducts = products || [];
    const totalItems = settings.slider_item_count;
    const fillersNeeded = Math.max(0, totalItems - activeProducts.length);

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
