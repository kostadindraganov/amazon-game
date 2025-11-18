# React Spin Roulette Migration Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Migrate GameCarousel.tsx from GSAP-based animation to react-spin-roulette package

**Architecture:** Replace manual GSAP animation with react-spin-roulette's SpinRoulette component using custom prize renderer and indicator. Maintain all backend API integration (slider-items, spin, queue polling). Transform SliderItem[] to Prize[] format. Use default animation behavior with 5-second duration and 5 minimum spins.

**Tech Stack:** React, Next.js, react-spin-roulette, TypeScript

---

## Task 1: Install react-spin-roulette Package

**Files:**
- Modify: `package.json`

**Step 1: Install react-spin-roulette**

Run:
```bash
npm install react-spin-roulette
```

Expected: Package added to dependencies in package.json

**Step 2: Verify installation**

Run:
```bash
npm list react-spin-roulette
```

Expected: Shows installed version (e.g., `react-spin-roulette@1.x.x`)

**Step 3: Commit package installation**

Run:
```bash
git add package.json package-lock.json
git commit -m "deps: add react-spin-roulette package"
```

---

## Task 2: Create Data Transformation Function

**Files:**
- Modify: `components/GameCarousel.tsx:16-42`

**Step 1: Add Prize import**

At the top of the file, add after existing imports:

```typescript
import { SpinRoulette } from 'react-spin-roulette';
```

**Step 2: Add state for winningIndex**

After line 16 (`const [sliderItems, setSliderItems] = useState<SliderItem[]>([]);`), add:

```typescript
const [winningIndex, setWinningIndex] = useState<number>(0);
```

**Step 3: Remove unused refs and state**

Delete lines 17-18:
- `const [currentQueueId, setCurrentQueueId] = useState<number | null>(null);`
- `const animationFrameRef = useRef<number | undefined>(undefined);`

Actually, keep `currentQueueId` - it's still needed for tracking. Only remove `animationFrameRef`.

Delete line 18:
```typescript
const animationFrameRef = useRef<number | undefined>(undefined);
```

**Step 4: Create transformation function**

After the state declarations, add this function:

```typescript
// Transform SliderItem[] to Prize[] for react-spin-roulette
const prizes = sliderItems.map((item, index) => ({
  id: item.id,
  label: item.title,
  image: item.type === 'product' ? item.image_url : undefined,
  value: item, // Store full item for rendering
}));
```

**Step 5: Commit data transformation setup**

Run:
```bash
git add components/GameCarousel.tsx
git commit -m "refactor: add react-spin-roulette import and prize transformation"
```

---

## Task 3: Create Custom Prize Renderer

**Files:**
- Modify: `components/GameCarousel.tsx`

**Step 1: Remove updateItemTransforms callback**

Delete lines 44-48 (the `updateItemTransforms` callback function).

**Step 2: Remove useEffect for animation frames**

Delete lines 64-72 (the useEffect that manages animation frames).

**Step 3: Create renderPrize function**

After the `prizes` transformation (around line 42), add:

```typescript
// Custom prize renderer for cards
const renderPrize = useCallback((prize: any, index: number) => {
  const item = prize.value as SliderItem;
  const isFiller = item.type === 'filler';

  // Determine card color
  let cardColor = '#2D3035'; // dark (default for products)
  if (isFiller) {
    cardColor = '#F95146'; // red for fillers
  } else if (index % 3 === 0) {
    cardColor = '#00C74D'; // green for some products
  }

  return (
    <div
      className="flex flex-col items-center justify-between rounded-lg overflow-hidden"
      style={{
        width: '240px',
        height: '340px',
        backgroundColor: cardColor,
        border: '2px solid rgba(255, 255, 255, 0.1)',
        padding: '16px',
      }}
    >
      {isFiller ? (
        <div className="flex items-center justify-center h-full">
          <div className="text-white font-bold text-2xl text-center leading-tight">
            {item.title}
          </div>
        </div>
      ) : (
        <>
          <div className="text-white text-sm font-semibold text-center leading-tight">
            {item.title}
          </div>
          <div className="relative flex-shrink-0" style={{ width: '180px', height: '180px' }}>
            <Image
              src={item.image_url}
              alt={item.title}
              fill
              className="object-contain"
              unoptimized
            />
          </div>
          <div className="text-yellow-400 text-xl font-bold">
            {item.price} лв
          </div>
        </>
      )}
    </div>
  );
}, []);
```

**Step 4: Create renderIndicator function**

After `renderPrize`, add:

```typescript
// Custom indicator (center selection line)
const renderIndicator = useCallback(() => (
  <div
    className="absolute top-0 bottom-0 z-20"
    style={{
      left: '50%',
      width: '3px',
      backgroundColor: '#666',
      transform: 'translateX(-1.5px)',
    }}
  />
), []);
```

**Step 5: Commit custom renderers**

Run:
```bash
git add components/GameCarousel.tsx
git commit -m "feat: add custom prize and indicator renderers"
```

---

## Task 4: Update Spin Logic for react-spin-roulette

**Files:**
- Modify: `components/GameCarousel.tsx:159-334` (spinCarousel function)

**Step 1: Remove GSAP imports and refs from dependencies**

In the `spinCarousel` useCallback (line 159), update dependencies array at the end (line 334):

Change from:
```typescript
}, [sliderItems, setIsSpinning, updateItemTransforms]);
```

To:
```typescript
}, [sliderItems, setIsSpinning]);
```

**Step 2: Update spinCarousel function - Part 1 (setup)**

Replace lines 159-213 with:

```typescript
const spinCarousel = useCallback(async (queueId: number) => {
  console.log('🎰 [GameCarousel.spinCarousel] Starting spin for queueId:', queueId);

  if (sliderItems.length === 0) {
    console.error('❌ [GameCarousel.spinCarousel] Cannot spin - no slider items');
    setIsSpinning(false);
    setCurrentQueueId(null);
    return;
  }

  try {
    console.log('📡 [GameCarousel.spinCarousel] Calling /api/game/spin...');

    // Call spin API to determine outcome
    const spinRes = await fetch('/api/game/spin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ queueId })
    });

    const spinData = await spinRes.json();

    console.log('📥 [GameCarousel.spinCarousel] Spin API response:', {
      success: spinData.success,
      isWinner: spinData.isWinner,
      remainingPlays: spinData.remainingPlays,
      spinCount: spinData.spinCount
    });

    // Calculate target index
    let targetIndex;
    if (spinData.isWinner && spinData.product) {
      console.log('🏆 [GameCarousel.spinCarousel] WINNER! Finding product in slider:', spinData.product.title);
      targetIndex = sliderItems.findIndex(item => item.id === spinData.product.id);

      if (targetIndex === -1) {
        console.warn('⚠️  [GameCarousel.spinCarousel] Product not found in slider, using random filler');
        const fillerIndices = sliderItems
          .map((item, idx) => item.type === 'filler' ? idx : -1)
          .filter(idx => idx !== -1);
        targetIndex = fillerIndices[Math.floor(Math.random() * fillerIndices.length)] || 0;
      } else {
        console.log('✅ [GameCarousel.spinCarousel] Product found at index:', targetIndex);
      }
    } else {
      console.log('🎯 [GameCarousel.spinCarousel] Not a winner, selecting "Try Again" filler');
      const fillerIndices = sliderItems
        .map((item, idx) => item.type === 'filler' ? idx : -1)
        .filter(idx => idx !== -1);
      targetIndex = fillerIndices[Math.floor(Math.random() * fillerIndices.length)] || 0;
      console.log('✅ [GameCarousel.spinCarousel] Filler selected at index:', targetIndex);
    }

    console.log('🎯 [GameCarousel.spinCarousel] Setting winning index:', targetIndex);

    // Store spinData for onComplete callback
    (window as any).__currentSpinData = spinData;
    (window as any).__currentQueueId = queueId;

    // Set winning index and trigger spin
    setWinningIndex(targetIndex);
    setIsSpinning(true);

  } catch (error) {
    console.error('❌ [GameCarousel.spinCarousel] Error during spin:', error);
    setIsSpinning(false);
    setCurrentQueueId(null);
  }
}, [sliderItems, setIsSpinning]);
```

**Step 3: Create handleSpinComplete callback**

After `spinCarousel`, add new callback:

```typescript
const handleSpinComplete = useCallback(async () => {
  console.log('🏁 [GameCarousel.handleSpinComplete] Animation complete!');

  const spinData = (window as any).__currentSpinData;
  const queueId = (window as any).__currentQueueId;

  setIsSpinning(false);
  setCurrentQueueId(null);

  console.log('🔓 [GameCarousel.handleSpinComplete] Spinning state reset, queue ID cleared');

  // Show winner modal if applicable
  if (spinData?.isWinner) {
    console.log('🎉 [GameCarousel.handleSpinComplete] Showing winner modal');
    window.dispatchEvent(new CustomEvent('showWinner', {
      detail: {
        username: spinData.winner?.username,
        product: spinData.product
      }
    }));
  }

  // Refresh slider items
  console.log('🔄 [GameCarousel.handleSpinComplete] Refreshing slider items...');
  fetchSliderItems();

  // Check if same player has more plays
  console.log('🔍 [GameCarousel.handleSpinComplete] Checking for remaining plays:', spinData?.remainingPlays);
  if (spinData?.remainingPlays > 0) {
    console.log('🔄 [GameCarousel.handleSpinComplete] Player has more plays!', {
      remainingPlays: spinData.remainingPlays,
      isWinner: spinData.isWinner,
      waitTime: spinData.isWinner ? 5000 : 0
    });

    const waitTime = spinData.isWinner ? 5000 : 0;
    setTimeout(async () => {
      console.log('⏰ [GameCarousel.handleSpinComplete] Wait time elapsed, fetching current player...');
      const currentRes = await fetch('/api/game/current');
      const currentData = await currentRes.json();

      console.log('📊 [GameCarousel.handleSpinComplete] Current player data:', {
        hasCurrentPlayer: !!currentData.currentPlayer,
        playerId: currentData.currentPlayer?.id,
        username: currentData.currentPlayer?.username,
        plays: currentData.currentPlayer?.plays
      });

      if (currentData.currentPlayer) {
        console.log('🎭 [GameCarousel.handleSpinComplete] Showing player modal for next play');
        window.dispatchEvent(new CustomEvent('showPlayer', {
          detail: { username: currentData.currentPlayer.username }
        }));

        console.log('⏰ [GameCarousel.handleSpinComplete] Waiting 3 seconds before next spin...');
        setTimeout(() => {
          console.log('🔁 [GameCarousel.handleSpinComplete] Recursively calling spinCarousel for queueId:', queueId);
          spinCarousel(queueId);
        }, 3000);
      } else {
        console.warn('⚠️  [GameCarousel.handleSpinComplete] No current player found for next spin!');
      }
    }, waitTime);
  } else {
    console.log('✅ [GameCarousel.handleSpinComplete] No more plays for this player, spin complete');
  }

  // Cleanup
  delete (window as any).__currentSpinData;
  delete (window as any).__currentQueueId;
}, [spinCarousel, setIsSpinning]);
```

**Step 4: Commit spin logic updates**

Run:
```bash
git add components/GameCarousel.tsx
git commit -m "refactor: update spin logic for react-spin-roulette"
```

---

## Task 5: Replace Carousel Rendering

**Files:**
- Modify: `components/GameCarousel.tsx:336-465` (render section)

**Step 1: Remove old carousel refs**

Delete lines 14-15:
```typescript
const carouselRef = useRef<HTMLDivElement>(null);
const containerRef = useRef<HTMLDivElement>(null);
```

**Step 2: Remove infiniteItems calculation**

Delete lines 39-42:
```typescript
// Create infinite loop by triplicating items
const infiniteItems = sliderItems.length > 0
  ? [...sliderItems, ...sliderItems, ...sliderItems]
  : [];
```

**Step 3: Remove initial position useEffect**

Delete lines 50-62 (the useEffect that sets initial carousel position).

**Step 4: Replace render section**

Replace lines 344-465 (the entire return statement) with:

```typescript
return (
  <div className="relative mb-4">
    {/* Roulette Wrapper */}
    <div
      className="relative overflow-hidden"
      style={{
        background: '#191B28',
        height: '400px',
        borderRadius: '12px',
      }}
    >
      {/* Gradient Overlays */}
      <div
        className="absolute left-0 top-0 bottom-0 z-10 pointer-events-none"
        style={{
          width: '300px',
          background: 'linear-gradient(to right, #191B28 0%, transparent 100%)',
        }}
      />
      <div
        className="absolute right-0 top-0 bottom-0 z-10 pointer-events-none"
        style={{
          width: '300px',
          background: 'linear-gradient(to left, #191B28 0%, transparent 100%)',
        }}
      />

      {/* React Spin Roulette Component */}
      <SpinRoulette
        prizes={prizes}
        winningIndex={winningIndex}
        isSpinning={isSpinning}
        onComplete={handleSpinComplete}
        duration={5000}
        orientation="horizontal"
        prizeSize={264}
        minSpins={5}
        className="w-full h-full"
        renderPrize={renderPrize}
        renderIndicator={renderIndicator}
      />
    </div>

    {/* Status indicator */}
    {isSpinning && (
      <div className="text-center mt-6">
        <div
          className="inline-block px-6 py-3 rounded-full"
          style={{
            background: 'linear-gradient(to right, #F95146, #00C74D)',
            border: '2px solid rgba(255, 255, 255, 0.3)',
          }}
        >
          <span className="text-xl font-bold text-white animate-pulse">🎰 SPINNING...</span>
        </div>
      </div>
    )}
  </div>
);
```

**Step 5: Commit render replacement**

Run:
```bash
git add components/GameCarousel.tsx
git commit -m "refactor: replace GSAP carousel with SpinRoulette component"
```

---

## Task 6: Remove GSAP Dependency

**Files:**
- Modify: `components/GameCarousel.tsx:4`
- Modify: `package.json`

**Step 1: Remove GSAP import**

Delete line 4:
```typescript
import gsap from 'gsap';
```

**Step 2: Verify no GSAP references remain**

Run:
```bash
grep -n "gsap" components/GameCarousel.tsx
```

Expected: No output (no matches found)

**Step 3: Uninstall GSAP package**

Run:
```bash
npm uninstall gsap
```

Expected: Package removed from package.json

**Step 4: Commit GSAP removal**

Run:
```bash
git add components/GameCarousel.tsx package.json package-lock.json
git commit -m "refactor: remove GSAP dependency"
```

---

## Task 7: Test the Implementation

**Files:**
- None (testing only)

**Step 1: Start development server**

Run:
```bash
npm run dev
```

Expected: Server starts on http://localhost:3000

**Step 2: Manual testing checklist**

Test the following scenarios:

1. **Carousel loads properly**
   - Navigate to the game page
   - Verify cards are visible with correct layout
   - Verify product cards show: title (top), image (center), price (bottom)
   - Verify filler cards show centered "Опитай пак" text
   - Verify colors: products (dark/green), fillers (red)

2. **Spin functionality**
   - Add a player to queue (via admin or TikTok gift)
   - Verify player modal appears
   - Verify carousel spins after 3 seconds
   - Verify animation is smooth (5 seconds duration)
   - Verify carousel stops at correct item

3. **Winner scenario**
   - Force a winning spin (adjust spin count if needed)
   - Verify winner modal appears
   - Verify correct product is shown

4. **Loser scenario**
   - Verify "Опитай пак" card is selected
   - Verify no winner modal appears

5. **Multi-play scenario**
   - Add player with multiple plays (e.g., 3 plays)
   - Verify first spin completes
   - Verify player modal appears again
   - Verify second spin starts automatically
   - Verify process repeats for all plays

6. **Edge cases**
   - No products available (all won)
   - Single product available
   - Many products (20+) with high total slider items (100)

**Step 3: Check browser console**

- Verify no errors in console
- Verify logging shows correct flow
- Verify no GSAP-related warnings

**Step 4: Stop development server**

Press `Ctrl+C` in terminal

---

## Task 8: Final Integration Test and Documentation

**Files:**
- None (verification only)

**Step 1: Build the project**

Run:
```bash
npm run build
```

Expected: Build completes successfully with no errors

**Step 2: Verify package changes**

Run:
```bash
npm list gsap
```

Expected: Error message "gsap@... extraneous" or not found

Run:
```bash
npm list react-spin-roulette
```

Expected: Shows installed version

**Step 3: Review git diff**

Run:
```bash
git diff origin/main --stat
```

Expected: Shows changes to GameCarousel.tsx and package files

**Step 4: Verify design document matches implementation**

Open: `docs/plans/2025-11-19-react-spin-roulette-migration-design.md`

Check:
- ✅ Uses react-spin-roulette instead of GSAP
- ✅ Backend API calls unchanged
- ✅ Card dimensions: 240px × 340px
- ✅ Image size: 180px × 180px
- ✅ Product layout: title (top), image (center), price (bottom)
- ✅ Filler layout: centered text
- ✅ Colors match design
- ✅ Horizontal orientation
- ✅ 5-second duration, 5 min spins

---

## Task 9: Final Commit

**Files:**
- All modified files

**Step 1: Review all changes**

Run:
```bash
git status
git diff
```

Expected: All changes look correct, no unexpected modifications

**Step 2: Final commit (if any uncommitted changes)**

Run:
```bash
git add -A
git commit -m "refactor: complete migration from GSAP to react-spin-roulette

- Replace GSAP animation with react-spin-roulette SpinRoulette component
- Add custom prize renderer with updated card dimensions (240x340)
- Add custom indicator renderer (center selection line)
- Implement winner/loser logic with react-spin-roulette
- Maintain all backend API integration unchanged
- Remove GSAP dependency from package.json
- Update card layout: products (title/image/price), fillers (centered text)
- Set animation: 5s duration, 5 min spins, horizontal orientation

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"
```

**Step 3: View commit log**

Run:
```bash
git log --oneline -10
```

Expected: Shows all commits from this implementation

---

## Success Criteria

After completing all tasks, verify:

- ✅ `npm list react-spin-roulette` shows package installed
- ✅ `npm list gsap` shows package NOT installed
- ✅ GameCarousel.tsx imports from 'react-spin-roulette'
- ✅ GameCarousel.tsx has NO gsap imports
- ✅ Cards are 240px × 340px with correct layouts
- ✅ Images are 180px × 180px
- ✅ Spinning animation works smoothly
- ✅ Winner/loser logic functions correctly
- ✅ Multi-play logic works as expected
- ✅ Visual design matches original (colors, gradients, center line)
- ✅ No console errors
- ✅ Build succeeds
- ✅ All commits are clear and incremental

---

## Rollback Plan

If issues occur:

```bash
# Revert all changes
git reset --hard origin/main

# Reinstall dependencies
npm install
```
