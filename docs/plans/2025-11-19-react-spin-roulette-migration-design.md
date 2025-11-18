# React Spin Roulette Migration Design

**Date:** 2025-11-19
**Component:** GameCarousel.tsx
**Goal:** Replace GSAP-based carousel with react-spin-roulette package

---

## Overview

Complete rewrite of GameCarousel.tsx using the react-spin-roulette package with Custom Layout feature. This migration removes GSAP animation dependency while maintaining all backend API integration and game logic.

---

## 1. Architecture & Component Structure

### Component Replacement Strategy

- **Remove:** GSAP dependency and all manual animation code
- **Remove:** `carouselRef`, `containerRef`, `animationFrameRef`
- **Add:** react-spin-roulette's `SpinRoulette` component
- **Keep:** All backend API integration logic (fetching slider items, checking queue, spinning)
- **Keep:** External API (`isSpinning` and `setIsSpinning` props)

### Component Structure

```
GameCarousel
├── State Management
│   ├── sliderItems (from /api/game/slider-items)
│   ├── currentQueueId (track current player)
│   └── winningIndex (new - for react-spin-roulette)
├── API Integration
│   ├── fetchSliderItems() - GET /api/game/slider-items
│   ├── checkForNextPlayer() - GET /api/game/current
│   └── spinCarousel() - POST /api/game/spin
└── Rendering
    ├── SpinRoulette component
    └── Custom prize renderer
```

### Data Transformation

Transform backend `SliderItem[]` to react-spin-roulette `Prize[]`:

```typescript
interface Prize {
  id: string;           // SliderItem.id
  label: string;        // SliderItem.title
  image?: string;       // SliderItem.image_url (optional for fillers)
  value?: any;          // Full SliderItem object
}
```

---

## 2. Custom Card Rendering

### Card Dimensions

- **Card size:** 240px width × 340px height
- **Gap:** 24px between cards
- **Total prizeSize:** 264px (240 + 24)

### Card Layout

**Product Cards:**
- **Top:** Title (text-sm, font-semibold, 2-3 lines max, centered, padded)
- **Center:** Image (180px × 180px, object-contain)
- **Bottom:** Price (text-yellow-400, text-xl, font-bold)

**"Опитай пак" (Try Again) Cards:**
- **Center only:** "Опитай пак" text (vertically centered, text-2xl, font-bold)
- No title section or price section

### Color Scheme

- **Product cards:** Alternating dark (#2D3035) and green (#00C74D) based on index
- **Filler cards:** Red (#F95146)
- **Borders:** 2px solid rgba(255, 255, 255, 0.1)

### Custom Renderer Implementation

```typescript
const renderPrize = (prize: Prize) => {
  const item = prize.value as SliderItem;
  const isFiller = item.type === 'filler';

  return (
    <div className="flex flex-col items-center justify-between h-full p-4">
      {isFiller ? (
        <div className="flex items-center justify-center h-full">
          <div className="text-white font-bold text-2xl text-center">
            {item.title}
          </div>
        </div>
      ) : (
        <>
          <div className="text-white text-sm font-semibold text-center">
            {item.title}
          </div>
          <Image src={item.image_url} width={180} height={180} />
          <div className="text-yellow-400 text-xl font-bold">
            {item.price} лв
          </div>
        </>
      )}
    </div>
  );
};
```

---

## 3. Spin Logic & Winner Determination

### Spin Flow

1. **Trigger:** `checkForNextPlayer()` detects player in queue via `/api/game/current`
2. **Pre-spin:** Dispatch `showPlayer` event, wait 3 seconds
3. **API Call:** POST to `/api/game/spin` with `queueId`
4. **Response Processing:**
   - Backend determines winner (based on spin count)
   - Returns `isWinner`, `product`, `remainingPlays`
5. **Calculate winningIndex:**
   - If winner: Find product in `sliderItems` array
   - If not winner: Find random "Опитай пак" filler
6. **Trigger Animation:** `setWinningIndex(index)` + `setIsSpinning(true)`
7. **React-spin-roulette:** Animates to winning index
8. **Completion:** `onComplete` callback handles post-spin logic

### Winner Index Calculation

```typescript
// After receiving spinData from POST /api/game/spin
let targetIndex;

if (spinData.isWinner && spinData.product) {
  // Find winning product in sliderItems
  targetIndex = sliderItems.findIndex(item => item.id === spinData.product.id);

  if (targetIndex === -1) {
    // Fallback: product not found, use random filler
    const fillerIndices = sliderItems
      .map((item, idx) => item.type === 'filler' ? idx : -1)
      .filter(idx => idx !== -1);
    targetIndex = fillerIndices[Math.floor(Math.random() * fillerIndices.length)] || 0;
  }
} else {
  // Not a winner: select random filler
  const fillerIndices = sliderItems
    .map((item, idx) => item.type === 'filler' ? idx : -1)
    .filter(idx => idx !== -1);
  targetIndex = fillerIndices[Math.floor(Math.random() * fillerIndices.length)] || 0;
}

setWinningIndex(targetIndex);
setIsSpinning(true);
```

### Key Changes from Current Implementation

- **Remove:** Triplicating items logic (infinite loop)
- **Remove:** Manual position calculations and GSAP animations
- **Simplify:** Use single array of items, let react-spin-roulette handle scrolling effect

---

## 4. React-Spin-Roulette Configuration

### Component Props

```typescript
<SpinRoulette
  prizes={prizes}                    // Transformed from sliderItems
  winningIndex={winningIndex}        // Calculated from spin API
  isSpinning={isSpinning}            // Controlled by parent state
  onComplete={handleSpinComplete}    // Post-spin logic
  onSpinStart={handleSpinStart}      // Optional: logging
  duration={5000}                    // 5 second spin animation
  orientation="horizontal"           // Left-to-right scrolling
  prizeSize={264}                    // 240px card + 24px gap
  minSpins={5}                       // Minimum 5 full rotations
  className="w-full h-[400px] bg-[#191B28] rounded-xl overflow-hidden"
  prizeClassName="rounded-lg border-2 border-white/10"
  renderPrize={renderPrize}          // Custom card renderer
  renderIndicator={renderIndicator}  // Custom center line
/>
```

### Container Styling

- **Background:** `#191B28`
- **Height:** `400px`
- **Border radius:** `12px`
- **Overflow:** `hidden`
- **Gradient overlays:** Left/right fade effect (300px width each)

### Custom Indicator (Center Line)

```typescript
const renderIndicator = () => (
  <div
    className="absolute top-0 bottom-0 w-[3px] bg-gray-600 z-20"
    style={{ left: '50%', transform: 'translateX(-1.5px)' }}
  />
);
```

### Gradient Overlays

Positioned outside SpinRoulette component for proper layering:

```jsx
{/* Left gradient */}
<div className="absolute left-0 top-0 bottom-0 z-10 pointer-events-none w-[300px]"
     style={{ background: 'linear-gradient(to right, #191B28 0%, transparent 100%)' }} />

{/* Right gradient */}
<div className="absolute right-0 top-0 bottom-0 z-10 pointer-events-none w-[300px]"
     style={{ background: 'linear-gradient(to left, #191B28 0%, transparent 100%)' }} />
```

---

## 5. Edge Cases & State Management

### Edge Cases

1. **No slider items loaded**
   - Show loading state with neon text animation
   - Prevent spin attempts

2. **Product not found in slider**
   - Fallback to random filler card
   - Log warning for debugging

3. **No filler cards available**
   - Use first available item (index 0)
   - Should not happen with proper backend logic

4. **API errors during spin**
   - Catch in try/catch block
   - Reset `isSpinning` and `currentQueueId`
   - Log error for debugging

### Multi-Play Logic

When player has multiple plays (`remainingPlays > 0`):

1. Spin completes → `onComplete` fires
2. Check `spinData.remainingPlays > 0`
3. Wait based on outcome:
   - **Winner:** 5 seconds (for winner modal)
   - **Not winner:** 0 seconds (immediate)
4. Fetch current player data (`/api/game/current`)
5. Dispatch `showPlayer` event again
6. Wait 3 seconds
7. Call `spinCarousel(queueId)` recursively
8. Repeat until `remainingPlays === 0`

### State Cleanup (onComplete)

```typescript
const handleSpinComplete = () => {
  setIsSpinning(false);           // Allow next player
  setCurrentQueueId(null);        // Reset tracking
  fetchSliderItems();             // Refresh items (remove won products)

  // Show winner modal if applicable
  if (spinData.isWinner) {
    window.dispatchEvent(new CustomEvent('showWinner', {
      detail: {
        username: spinData.winner?.username,
        product: spinData.product
      }
    }));
  }

  // Check for remaining plays
  if (spinData.remainingPlays > 0) {
    // Multi-play logic...
  }
};
```

### Polling Behavior

Maintain existing 2-second polling:

```typescript
useEffect(() => {
  const interval = setInterval(() => {
    if (!isSpinning) {
      checkForNextPlayer();
    }
  }, 2000);

  return () => clearInterval(interval);
}, [isSpinning, checkForNextPlayer]);
```

- Only runs when `!isSpinning`
- Prevents duplicate processing with `currentQueueId` check
- Ensures slider items are loaded before spinning

---

## Data Flow Summary

```
1. Backend API (/api/game/slider-items)
   ↓
2. sliderItems state (SliderItem[])
   ↓
3. Transform to prizes (Prize[])
   ↓
4. Pass to SpinRoulette component
   ↓
5. User in queue → checkForNextPlayer()
   ↓
6. Call /api/game/spin → Backend determines winner
   ↓
7. Calculate winningIndex from API response
   ↓
8. Set winningIndex + isSpinning = true
   ↓
9. SpinRoulette animates to winner
   ↓
10. onComplete → Modals, multi-play check, refresh items
```

---

## Backend API Integration (No Changes)

### GET /api/game/slider-items

Returns array of items based on:
- `settings.slider_item_count` (Total Slider Items setting)
- Active products from Product Management
- Fills remaining slots with "Опитай пак" fillers

### POST /api/game/spin

Input: `{ queueId: number }`

Returns:
```typescript
{
  success: boolean;
  isWinner: boolean;
  winner: Winner | null;
  product: Product | null;
  spinCount: number;
  remainingPlays: number;
}
```

### GET /api/game/current

Returns current player in queue (status: 'processing')

---

## Dependencies

### Add

```bash
npm install react-spin-roulette
```

### Remove

```bash
npm uninstall gsap
```

---

## Implementation Notes

1. **Import changes:**
   - Remove: `import gsap from 'gsap'`
   - Add: `import { SpinRoulette } from 'react-spin-roulette'`

2. **No triplicating items:** Single array passed to SpinRoulette

3. **Animation control:** Fully managed by react-spin-roulette (no manual GSAP timelines)

4. **Styling:** Maintain current visual design (colors, gradients, center line)

5. **Card colors:** Apply via `prizeClassName` or inline styles in `renderPrize`

6. **Testing:** Verify multi-play logic, winner/loser outcomes, edge cases

---

## Success Criteria

- ✅ Carousel uses react-spin-roulette instead of GSAP
- ✅ All backend API calls work unchanged
- ✅ Product cards show: title (top), image (180×180, center), price (bottom)
- ✅ Filler cards show: "Опитай пак" (centered vertically)
- ✅ Cards are 240px × 340px with proper spacing
- ✅ Winner determination works correctly
- ✅ Multi-play logic functions as before
- ✅ Visual design matches current style (colors, gradients, center line)
- ✅ No GSAP dependency in package.json
