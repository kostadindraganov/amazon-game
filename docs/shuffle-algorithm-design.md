# Shuffle Algorithm Design for Product-Specific Wins

**Date:** 2025-11-19  
**Feature:** Smart card reordering during "Разбъркване" (shuffle) based on product-specific win conditions

---

## Overview

The shuffle algorithm determines which card should win BEFORE the shuffle animation begins, then intelligently reorders all cards so that the predetermined winning card ends up at the winning position after the shuffle completes.

---

## Database Schema

### Products Table
```sql
products (
  id uuid PRIMARY KEY,
  title TEXT,
  price NUMERIC,
  image_url TEXT,
  win_at_spin_count INT,  -- Optional: specific spin count for this product to win
  current_spin_state INT DEFAULT 0,  -- Track spins for this specific product
  status TEXT DEFAULT 'active',
  ...
)
```

### Settings Table
```sql
settings (
  id INT PRIMARY KEY DEFAULT 1,
  slider_item_count INT DEFAULT 100,  -- Total cards in carousel
  spin_count_to_win INT DEFAULT 100,  -- Global win frequency
  ...
)
```

### Spin State Table
```sql
spin_state (
  id INT PRIMARY KEY DEFAULT 1,
  current_spin_count INT DEFAULT 0  -- Global spin counter
)
```

---

## Win Determination Logic

### Priority Order:
1. **Product-Specific Win** (Highest Priority)
   - Check if any active product has `win_at_spin_count` matching `current_spin_count`
   - If multiple products match, select randomly from matches
   
2. **Global Win Frequency** (Fallback)
   - Check if `current_spin_count % spin_count_to_win === 0`
   - Select random active product

3. **No Win** (Default)
   - Land on "Опитай пак" (Try Again) filler

---

## Algorithm Flow

```
┌─────────────────────────────────────┐
│ 1. Spin API Called                  │
│    POST /api/game/spin              │
└──────────────┬──────────────────────┘
               ↓
┌─────────────────────────────────────┐
│ 2. Increment Global Spin Counter    │
│    current_spin_count++             │
└──────────────┬──────────────────────┘
               ↓
┌─────────────────────────────────────┐
│ 3. Check Product-Specific Wins      │
│    Find products where:             │
│    win_at_spin_count =              │
│      current_spin_count             │
└──────────────┬──────────────────────┘
               ↓
         ┌─────┴─────┐
         │ Found?    │
         └─────┬─────┘
         Yes ↓     ↓ No
    ┌─────────┐   ┌──────────────────┐
    │ Select  │   │ 4. Check Global  │
    │ Product │   │    Win Frequency │
    │ (Random │   │    current % N   │
    │ if mult)│   └────────┬─────────┘
    └────┬────┘            ↓
         │           ┌─────┴─────┐
         │           │ Is Win?   │
         │           └─────┬─────┘
         │           Yes ↓     ↓ No
         │          ┌────────┐  ┌────────┐
         │          │ Random │  │ Filler │
         │          │Product │  │ "Try   │
         │          └────┬───┘  │ Again" │
         │               │      └────┬───┘
         └───────────────┴───────────┘
                         ↓
┌─────────────────────────────────────┐
│ 5. Fetch Fresh Slider Items         │
│    - Active products                │
│    - Fill remaining with fillers    │
└──────────────┬──────────────────────┘
               ↓
┌─────────────────────────────────────┐
│ 6. Show "Разбъркване" Overlay       │
│    (Blur + Animated Text)           │
└──────────────┬──────────────────────┘
               ↓
┌─────────────────────────────────────┐
│ 7. Perform Visual Shuffle Animation │
│    - Multiple shuffle iterations    │
│    - Cards reorder 6 times          │
│    - 200ms between each shuffle     │
└──────────────┬──────────────────────┘
               ↓
┌─────────────────────────────────────┐
│ 8. Calculate Final Card Order       │
│    - Shuffle all cards              │
│    - Find winning item index        │
│    - Ensure it's in final array     │
└──────────────┬──────────────────────┘
               ↓
┌─────────────────────────────────────┐
│ 9. Set Winning Index                │
│    - Position in final array        │
│    - SpinRoulette targets this      │
└──────────────┬──────────────────────┘
               ↓
┌─────────────────────────────────────┐
│ 10. Hide Overlay & Start Spin       │
│     - Carousel animates to winner   │
│     - 8 second spin duration        │
└──────────────┬──────────────────────┘
               ↓
┌─────────────────────────────────────┐
│ 11. Show Result                     │
│     - Winner modal (if win)         │
│     - Try again (if loss)           │
└─────────────────────────────────────┘
```

---

## Implementation Details

### Modified Spin API (`/api/game/spin`)

```typescript
export async function POST(request: NextRequest) {
  // 1. Get queue entry and settings
  const { queueId } = await request.json();
  const queueEntry = await getQueueEntry(queueId);
  const settings = await getSettings();
  
  // 2. Increment global spin counter
  const currentSpinCount = await incrementSpinCount();
  
  // 3. Check for product-specific wins (NEW LOGIC)
  const productSpecificWinners = await supabase
    .from('products')
    .select('*')
    .eq('status', 'active')
    .eq('win_at_spin_count', currentSpinCount);
  
  let winningProduct = null;
  let isWinner = false;
  
  if (productSpecificWinners.data && productSpecificWinners.data.length > 0) {
    // Product-specific win takes priority
    const randomIndex = Math.floor(Math.random() * productSpecificWinners.data.length);
    winningProduct = productSpecificWinners.data[randomIndex];
    isWinner = true;
    
    console.log('🎯 Product-specific win!', {
      product: winningProduct.title,
      spinCount: currentSpinCount,
      configuredWinAt: winningProduct.win_at_spin_count
    });
  } else {
    // 4. Fallback to global win frequency
    const isGlobalWin = currentSpinCount % settings.spin_count_to_win === 0;
    
    if (isGlobalWin) {
      const activeProducts = await getActiveProducts();
      if (activeProducts.length > 0) {
        const randomIndex = Math.floor(Math.random() * activeProducts.length);
        winningProduct = activeProducts[randomIndex];
        isWinner = true;
        
        console.log('🎲 Global frequency win!', {
          product: winningProduct.title,
          spinCount: currentSpinCount,
          frequency: settings.spin_count_to_win
        });
      }
    }
  }
  
  // 5. Mark product as won and create winner record (if applicable)
  if (isWinner && winningProduct) {
    await markProductAsWon(winningProduct.id);
    await createWinnerRecord(queueEntry.username, winningProduct);
  }
  
  // 6. Return result to frontend
  return NextResponse.json({
    success: true,
    isWinner,
    product: winningProduct,
    spinCount: currentSpinCount,
    remainingPlays: queueEntry.plays - 1
  });
}
```

### Frontend Shuffle Logic (`GameCarousel.tsx`)

The frontend already has shuffle logic, but we need to ensure:

1. **Winning item is always in the shuffled array**
2. **Winning index points to the correct item**
3. **Shuffle animation is smooth and visible**

```typescript
const spinCarousel = async (queueId: number) => {
  // 1. Call spin API to determine winner
  const spinRes = await fetch('/api/game/spin', {
    method: 'POST',
    body: JSON.stringify({ queueId })
  });
  const spinData = await spinRes.json();
  
  // 2. Fetch fresh slider items
  const itemsRes = await fetch('/api/game/slider-items');
  const { items: freshItems } = await itemsRes.json();
  
  // 3. Determine winning item ID
  let winningItemId = null;
  if (spinData.isWinner && spinData.product) {
    winningItemId = spinData.product.id;
  }
  
  // 4. Show shuffle overlay
  setIsShuffling(true);
  
  // 5. Perform animated shuffle (visual only)
  // Multiple shuffle iterations during overlay
  for (let i = 0; i < 6; i++) {
    const shuffled = shuffleArray(freshItems);
    setSliderItems(shuffled);
    await sleep(200);
  }
  
  // 6. Final shuffle and winning index calculation
  const finalShuffled = shuffleArray(freshItems);
  
  // 7. Find winning index in final array
  let targetIndex;
  if (winningItemId) {
    // Ensure winning product is in the array
    targetIndex = finalShuffled.findIndex(item => item.id === winningItemId);
    
    if (targetIndex === -1) {
      // Fallback: if winner not found, select random filler
      targetIndex = findRandomFillerIndex(finalShuffled);
    }
  } else {
    // No winner: select random filler
    targetIndex = findRandomFillerIndex(finalShuffled);
  }
  
  // 8. Apply final state
  setSliderItems(finalShuffled);
  setWinningIndex(targetIndex);
  
  // 9. Hide overlay and start spin
  await sleep(1000);
  setIsShuffling(false);
  setIsSpinning(true);
  playSpinSound();
};
```

---

## Key Considerations

### 1. **Product Availability**
- What if a product with `win_at_spin_count = 100` is already won?
  - **Solution**: Only check products with `status = 'active'`
  - If no active products match, fall back to global win logic

### 2. **Multiple Products with Same Win Count**
- What if two products have `win_at_spin_count = 100`?
  - **Solution**: Randomly select one from the matches

### 3. **Slider Items Refresh**
- When should we fetch fresh items?
  - **Solution**: Fetch at the START of `spinCarousel()` before shuffle
  - This ensures cards only change during shuffle overlay, not after spin

### 4. **Winning Item Not in Slider**
- What if the winning product isn't in the current slider items?
  - **Solution**: The `/api/game/slider-items` endpoint should include ALL active products
  - If `slider_item_count` is less than active products, we need to ensure winner is included

### 5. **Current Spin State per Product**
- Should each product track its own spin count?
  - **Current Design**: Uses global `current_spin_count` only
  - **Alternative**: Add `current_spin_state` to products table for per-product tracking
  - **Recommendation**: Keep it simple with global counter for now

---

## Database Migration (Optional Enhancement)

If you want to track per-product spin states:

```sql
-- Add current_spin_state to products
ALTER TABLE products
ADD COLUMN IF NOT EXISTS current_spin_state INT DEFAULT 0;

-- Function to increment product-specific spin state
CREATE OR REPLACE FUNCTION increment_product_spin_state(product_uuid uuid)
RETURNS INT AS $$
DECLARE
  new_state INT;
BEGIN
  UPDATE products
  SET current_spin_state = current_spin_state + 1
  WHERE id = product_uuid
  RETURNING current_spin_state INTO new_state;
  
  RETURN new_state;
END;
$$ LANGUAGE plpgsql;
```

**Note**: This is optional and adds complexity. The simpler approach is to use only the global `current_spin_count`.

---

## Testing Scenarios

### Scenario 1: Product-Specific Win
- **Setup**: Product A has `win_at_spin_count = 50`
- **Action**: Spin until `current_spin_count = 50`
- **Expected**: Product A wins (appears at center after shuffle)

### Scenario 2: Global Win
- **Setup**: No products have specific win counts, `spin_count_to_win = 100`
- **Action**: Spin until `current_spin_count = 100`
- **Expected**: Random active product wins

### Scenario 3: Product Already Won
- **Setup**: Product A has `win_at_spin_count = 50` but `status = 'won'`
- **Action**: Spin until `current_spin_count = 50`
- **Expected**: Falls back to global win logic (or no win if not global win spin)

### Scenario 4: Multiple Products Match
- **Setup**: Product A and B both have `win_at_spin_count = 75`
- **Action**: Spin until `current_spin_count = 75`
- **Expected**: One of them wins randomly

### Scenario 5: No Win
- **Setup**: Current spin doesn't match any conditions
- **Action**: Regular spin
- **Expected**: "Опитай пак" (Try Again) filler wins

---

## Performance Considerations

1. **Database Query Optimization**
   - Index on `products(status, win_at_spin_count)` for fast lookups
   - Single query to check product-specific wins

2. **Frontend Shuffle Performance**
   - Fisher-Yates shuffle is O(n) - very efficient
   - 6 shuffle iterations × 200ms = 1.2s animation time
   - Total shuffle overlay: ~2.2s (1s pre + 1.2s animation + 1s post)

3. **Race Conditions**
   - Use database transactions for spin count increment
   - Atomic operations prevent duplicate wins

---

## Summary

This algorithm provides:
- ✅ Product-specific win control via `win_at_spin_count`
- ✅ Global win frequency fallback
- ✅ Smooth shuffle animation during "Разбъркване"
- ✅ Guaranteed winner placement at correct position
- ✅ Handles edge cases (no products, already won, etc.)
- ✅ Maintains existing game flow and UX
