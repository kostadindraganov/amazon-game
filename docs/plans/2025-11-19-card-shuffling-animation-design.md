# Card Shuffling Animation Design

**Date:** 2025-11-19
**Feature:** Add card shuffling animation between player modal close and spin start

## Overview

Add a visual shuffling phase that randomizes the card order before every spin, with an animated overlay showing "Разбъркване" (Shuffling) to hide the reordering from users.

## User Flow

### Current Flow
1. Player modal shows username (3s)
2. Modal closes
3. Spin starts immediately

### New Flow
1. Player modal shows username (3s)
2. Modal closes
3. **Call spin API** (get winner result)
4. **Show shuffling overlay** with blur effect + "Разбъркване" text
5. **Shuffle cards array** (Fisher-Yates algorithm)
6. **Recalculate winning index** in shuffled array
7. **Wait 1.5 seconds** for animation
8. **Hide overlay** and start spin

## Technical Architecture

### State Management

Add new state to GameCarousel:
```typescript
const [isShuffling, setIsShuffling] = useState<boolean>(false);
```

### Shuffle Algorithm

Fisher-Yates shuffle for true randomization:
```typescript
const shuffleArray = <T,>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};
```

### Modified spinCarousel Flow

1. Call `/api/game/spin` POST endpoint
2. Get `spinData` response with winner information
3. Determine winning item ID (product or filler)
4. Set `isShuffling(true)` to show overlay
5. Shuffle `sliderItems`: `setSliderItems(shuffleArray(sliderItems))`
6. Recalculate winning index: `shuffled.findIndex(item => item.id === winningItemId)`
7. Wait 1500ms for animation
8. Set `isShuffling(false)` and `setIsSpinning(true)`
9. Spin animation proceeds to recalculated winning index

## Visual Design

### Overlay Component

Conditional render when `isShuffling === true`:

```tsx
{isShuffling && (
  <div className="absolute inset-0 z-30 flex items-center justify-center">
    {/* Blur backdrop */}
    <div className="absolute inset-0 backdrop-blur-md bg-black/60" />

    {/* Animated text */}
    <div className="relative z-40">
      <h2 className="text-6xl font-bold text-casino-gold animate-pulse">
        Разбъркване
      </h2>
    </div>
  </div>
)}
```

### Visual Effects

- **Blur**: `backdrop-blur-md` blurs carousel cards
- **Overlay**: `bg-black/60` semi-transparent dark background
- **Text**:
  - Size: `text-6xl`
  - Color: `text-casino-gold` (matching theme)
  - Animation: `animate-pulse` for pulsing effect
- **Z-index**: `z-30` (above carousel, below modals)
- **Duration**: 1.5 seconds total

## Implementation Details

### Timing Coordination

```typescript
// After API call in spinCarousel
setIsShuffling(true);
const shuffled = shuffleArray(sliderItems);
setSliderItems(shuffled);

const newWinningIndex = shuffled.findIndex(item => item.id === winningItemId);

setTimeout(() => {
  setIsShuffling(false);
  setWinningIndex(newWinningIndex);
  setIsSpinning(true);
}, 1500);
```

### Edge Cases

1. **Winner item not found after shuffle**: Use existing fallback logic to select random filler
2. **API call fails**: Skip shuffle overlay, exit gracefully (existing error handling)
3. **Empty sliderItems**: Already handled by existing guard check
4. **Rapid triggers**: Prevented by existing `isSpinning` and `pendingSpinQueueId` state guards

### Memory Management

- Use `setTimeout` for animation timing (consistent with existing code)
- Shuffle creates new array copy, doesn't mutate original
- No cleanup needed (timeout completes before next trigger)

## Testing Considerations

- Verify shuffle randomizes cards each time
- Confirm winning index recalculation is accurate
- Test overlay appears/disappears at correct times
- Validate timing doesn't interfere with spin animation
- Check visual appearance on different screen sizes

## Success Criteria

✅ Cards are visibly randomized before each spin
✅ Shuffling overlay hides the reordering from users
✅ "Разбъркване" text displays with blur effect
✅ Animation lasts ~1.5 seconds
✅ Spin starts at correct winning position after shuffle
✅ No visual glitches or timing issues
