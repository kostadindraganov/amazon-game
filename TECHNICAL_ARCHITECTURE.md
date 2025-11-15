# 🏗️ Technical Architecture

This document describes the technical architecture and component interactions for the casino-style slider game.

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend (Next.js 16)                 │
│  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐ │
│  │   Home Page    │  │  Admin Panel   │  │  API Routes    │ │
│  │  (Game UI)     │  │   (CRUD UI)    │  │  (Backend)     │ │
│  └────────────────┘  └────────────────┘  └────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                              ↓
        ┌─────────────────────┼─────────────────────┐
        ↓                     ↓                     ↓
┌───────────────┐    ┌────────────────┐    ┌──────────────┐
│   Supabase    │    │ Cloudflare R2  │    │ External API │
│  (Database)   │    │ (Image Storage)│    │   Requests   │
└───────────────┘    └────────────────┘    └──────────────┘
```

---

## Component Architecture

### 1. Frontend Layer

#### Home Page (`/`)
```typescript
HomePage
├── GameSlider (GSAP animations)
│   ├── SliderItem[] (products + fillers)
│   └── Pointer (center overlay)
├── SpinButton (trigger game)
├── Leaderboard (last 5 winners)
├── PlayerModal (shows current player)
└── WinnerModal (shows winner)
```

#### Admin Panel (`/admin`)
```typescript
AdminPanel
├── /products
│   ├── ProductForm (create product)
│   └── ProductTable (list, delete)
├── /settings
│   └── SettingsForm (global config)
└── /winners
    └── WinnersTable (view winners)
```

---

## Data Flow Architecture

### Game Play Flow

```
┌──────────────┐
│ User/API     │
│ Sends Points │
└──────┬───────┘
       ↓
┌──────────────────┐
│ POST /api/game/  │
│      play        │
└──────┬───────────┘
       ↓
┌──────────────────┐
│  Queue Service   │
│ (Insert to DB)   │
└──────┬───────────┘
       ↓
┌──────────────────┐
│ Queue Processor  │
│ (Background Job) │
└──────┬───────────┘
       ↓
┌──────────────────┐
│  Game Engine     │
│  (Win Logic)     │
└──────┬───────────┘
       ↓
┌──────────────────┐
│  Update DB       │
│ (Winners/State)  │
└──────┬───────────┘
       ↓
┌──────────────────┐
│  Frontend Update │
│  (Polling/RT)    │
└──────────────────┘
```

---

## Database Architecture

### Tables and Relationships

```
┌────────────────┐
│   settings     │  (1 row - global config)
└────────────────┘

┌────────────────┐
│  spin_state    │  (1 row - current spin count)
└────────────────┘

┌────────────────┐
│   products     │
│  id (PK)       │
│  title         │
│  price         │
│  image_url     │
│  status        │ (active/won)
│  created_at    │
└────────┬───────┘
         │
         │ 1:N
         ↓
┌────────────────┐
│    winners     │
│  id (PK)       │
│  username      │
│  product_id(FK)│  ← Foreign Key
│  won_at        │
└────────────────┘

┌────────────────┐
│  game_queue    │
│  id (PK)       │
│  username      │
│  plays         │
│  created_at    │
│  status        │ (pending/processing/done)
└────────────────┘
```

---

## API Architecture

### API Endpoints

```
/api
├── /game
│   ├── POST /play          → Add to queue
│   └── GET /current        → Get game status
│
└── /admin
    ├── /products
    │   ├── GET             → List products
    │   ├── POST            → Create product
    │   └── DELETE /:id     → Delete product
    │
    ├── /settings
    │   ├── GET             → Get settings
    │   └── POST            → Update settings
    │
    └── /upload
        └── POST            → Generate R2 signed URL
```

### API Request/Response Flow

```
Client Request
      ↓
Next.js API Route
      ↓
Validate Request
      ↓
┌─────────────┬──────────────┐
│  Supabase   │ Cloudflare   │
│  Operation  │ R2 Operation │
└─────────────┴──────────────┘
      ↓
Transform Response
      ↓
Send to Client
```

---

## State Management Architecture

### Game State

```typescript
interface GameState {
  // Current game status
  isSpinning: boolean;
  currentPlayer: string | null;

  // Queue state
  queueLength: number;

  // Settings
  settings: {
    sliderItemCount: number;
    spinCountToWin: number;
    minPointsForPlay: number;
    headlineText: string;
  };

  // Current spin
  currentSpinCount: number;

  // UI state
  showPlayerModal: boolean;
  showWinnerModal: boolean;
  winner: Winner | null;
}
```

### State Updates

```
Polling (every 2s)
      ↓
GET /api/game/current
      ↓
Update React State
      ↓
Re-render Components
```

---

## Animation Architecture (GSAP)

### Animation Timeline

```typescript
// Pseudo-code
const spinTimeline = gsap.timeline();

spinTimeline
  // Phase 1: Acceleration
  .to('.slider', {
    x: -500,
    duration: 2,
    ease: 'power2.in'
  })

  // Phase 2: Constant speed
  .to('.slider', {
    x: -3000,
    duration: 6,
    ease: 'none'
  })

  // Phase 3: Deceleration to target
  .to('.slider', {
    x: targetPosition,
    duration: 4,
    ease: 'power4.out',
    onComplete: handleSpinComplete
  });

// Center item scaling
gsap.to('.center-item', {
  scale: 1.3,
  duration: 0.3,
  ease: 'power2.out'
});
```

---

## Queue Processing Architecture

### Background Queue Processor

```typescript
// Simplified queue processor logic
async function processQueue() {
  while (true) {
    // Get next pending entry
    const nextEntry = await getNextPendingEntry();

    if (!nextEntry) {
      // Queue empty, wait
      await sleep(2000);
      continue;
    }

    // Mark as processing
    await updateQueueStatus(nextEntry.id, 'processing');

    // Run game
    await runGame(nextEntry.username);

    // Mark as done
    await updateQueueStatus(nextEntry.id, 'done');

    // Wait 2 seconds before next
    await sleep(2000);
  }
}
```

### Queue State Machine

```
[PENDING]
    ↓ (picked by processor)
[PROCESSING]
    ↓ (game complete)
[DONE]
```

---

## Image Upload Architecture

### Cloudflare R2 Upload Flow

```
Admin Uploads Image
        ↓
1. Request Signed URL
   POST /api/admin/upload
        ↓
2. Server Generates Signed URL
   (using R2 credentials)
        ↓
3. Return URL to Client
        ↓
4. Client Uploads Directly to R2
   PUT to signed URL
        ↓
5. R2 Returns Success + Image URL
        ↓
6. Client Saves Product with Image URL
   POST /api/admin/products
   {title, price, image_url}
        ↓
7. Save to Supabase
```

**Benefits:**
- No image data passes through Next.js server
- Faster uploads
- Lower server load

---

## Security Architecture

### Authentication
- Admin routes protected by Supabase Auth
- Row-Level Security (RLS) on sensitive tables
- API routes validate authentication

### Data Validation
```typescript
// Example validation middleware
async function validatePlayRequest(req) {
  const { username, points } = req.body;

  if (!username || typeof username !== 'string') {
    throw new Error('Invalid username');
  }

  if (!points || points < 0) {
    throw new Error('Invalid points');
  }

  const settings = await getSettings();
  if (points < settings.minPointsForPlay) {
    throw new Error('Insufficient points');
  }
}
```

### CORS Configuration
```typescript
// R2 CORS for uploads
{
  allowedOrigins: [process.env.NEXT_PUBLIC_APP_URL],
  allowedMethods: ['PUT', 'GET', 'HEAD'],
  allowedHeaders: ['Content-Type'],
  maxAge: 3600
}
```

---

## Performance Optimization

### Database
- Indexes on frequently queried columns:
  - `products.status`
  - `winners.won_at`
  - `game_queue.status`
  - `game_queue.created_at`

### Caching
```typescript
// Cache settings (rarely change)
const settingsCache = {
  data: null,
  expiry: 0,
  ttl: 60000 // 1 minute
};

async function getSettings() {
  if (Date.now() < settingsCache.expiry) {
    return settingsCache.data;
  }

  const data = await fetchFromSupabase();
  settingsCache.data = data;
  settingsCache.expiry = Date.now() + settingsCache.ttl;

  return data;
}
```

### Image Optimization
- Use Next.js Image component
- Lazy load leaderboard images
- Compress images before upload to R2

---

## Deployment Architecture

```
┌─────────────────────────────────────┐
│         Vercel (Frontend)           │
│  - Next.js 16 App                   │
│  - API Routes                       │
│  - Edge Functions                   │
└──────────┬──────────────────────────┘
           │
    ┌──────┴──────┐
    ↓             ↓
┌─────────┐  ┌──────────┐
│Supabase │  │   R2     │
│Database │  │  Images  │
└─────────┘  └──────────┘
```

**Environment:**
- **Frontend:** Vercel
- **Database:** Supabase (PostgreSQL)
- **Storage:** Cloudflare R2
- **Domain:** Custom domain via Vercel

---

## Monitoring & Logging

### Key Metrics to Track
- Queue length
- Average spin time
- Win rate
- API response times
- Error rates

### Logging Strategy
```typescript
// Structured logging
logger.info('Game started', {
  username,
  queuePosition,
  timestamp: Date.now()
});

logger.info('Spin result', {
  username,
  isWin,
  spinCount,
  productId: isWin ? product.id : null
});
```
