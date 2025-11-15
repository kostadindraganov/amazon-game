# 🎰 Web Game Platform PRD
### **Casino-Style Horizontal Slider Game**
### Technologies: **Next.js 16, TypeScript, TailwindCSS, GSAP, Supabase, Cloudflare R2**

---

# 1. Overview

This document describes the full Product Requirements for a casino-style horizontal slider game built with:

- Next.js 16 (App Router)
- TypeScript
- TailwindCSS
- GSAP Animation Library
- Supabase (Database & Auth)
- Cloudflare R2 (Image Uploads)

The game works like a horizontal "Wheel of Fortune". Product images rotate leftwards until the slider stops, and a pointer in the center determines the winning item.

---

# 2. Game Concept & Key Features

## Home Screen (User Game Page)

### Main Elements
- Full-width horizontal slider (carousel) with GSAP animations.
- Center image is larger than others and contains a pointer overlay.
- The slider reads products from the database (admin uploads).
- If admin defines the slider to have more items than available products:
  - Remaining items become "Try Again" filler images.
- Casino-like, modern UI/UX styling.
- Above the slider:
  - Text from admin: "Play for these rewards"
  - Text showing required minimum points: "Play by sending {minPoints} points"
- Below the slider:
  - Leaderboard of last 5 winning users.
  - Button "Spin" that triggers the game (disabled during animation).

### Gameplay Logic
- Game starts when:
  - User clicks "Spin", OR
  - The platform receives an API POST request with `{username, points}`.
- If the provided points are ≥ minimum points for a game:
  - Number of plays = `points / minPoints`.
  - Each play enters the game queue.
- A queue system ensures only one game is active at a time.

### Queue System
- Multiple users may send API requests to start games.
- Requests go into a FIFO queue stored in Supabase.
- When current game ends:
  - After a 2-second pause, next user in queue automatically plays.
- Before each spin:
  - Modal appears for 2 seconds:
    **"Currently playing: USERNAME"**

### Winning Logic
- Admin sets how many spins should pass before a winning spin occurs (e.g., `spinCountToWin = 100`).
- Each spin increments a global spin counter.
- If current spin number % spinCountToWin == 0:
  - A random active (non-won) product is selected.
  - Product becomes "won" and will no longer appear in future spins.
  - Winner data is stored in Supabase.
  - Winner modal appears:
    - Username
    - Product image
    - Title and price
  - Modal hides after 5 seconds.
  - Item is added to leaderboard.

### If Not Winning Spin
- The pointer lands on a "Try Again" filler item.
- No database write is made.

---

# 3. Admin Panel Requirements

Admin Panel located at `/admin`.

## 3.1 Products Management
- Form to add a new product:
  - Title (text)
  - Price (number)
  - Image upload:
    - Upload to Cloudflare R2
    - Store image URL in Supabase
- Product Table:
  - Thumbnail
  - Title
  - Price
  - Status (Active / Won)
  - Delete button
- Pagination: 50 rows per page
- When product is won:
  - Status changes to "Won"
  - Removed from slider

## 3.2 Global Settings Page
Fields include:
- `sliderItemCount` (example: 100)
- `spinCountToWin` (how many spins per win)
- `minPointsForPlay` (minimum points required per game)
- `headlineText` (displayed on main screen)

## 3.3 Winners Management Page
- Paginated list of all winners
- Columns:
  - Username
  - Prize name
  - Price
  - Image
  - Timestamp

---

# 4. Database Schema (Supabase)

```sql
-- products
CREATE TABLE products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  price NUMERIC NOT NULL,
  image_url TEXT NOT NULL,
  status TEXT DEFAULT 'active', -- active | won
  created_at TIMESTAMP DEFAULT NOW()
);

-- settings
CREATE TABLE settings (
  id INT PRIMARY KEY DEFAULT 1,
  slider_item_count INT DEFAULT 100,
  spin_count_to_win INT DEFAULT 100,
  min_points_for_play INT DEFAULT 300,
  headline_text TEXT DEFAULT 'Play for these rewards'
);

-- spin state
CREATE TABLE spin_state (
  id INT PRIMARY KEY DEFAULT 1,
  current_spin_count INT DEFAULT 0
);

-- winners
CREATE TABLE winners (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT NOT NULL,
  product_id uuid REFERENCES products(id),
  won_at TIMESTAMP DEFAULT NOW()
);

-- queue
CREATE TABLE game_queue (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  username TEXT NOT NULL,
  plays INT DEFAULT 1,
  created_at TIMESTAMP DEFAULT NOW(),
  status TEXT DEFAULT 'pending' -- pending | processing | done
);
```

---

# 5. APIs

## POST /api/game/play

Adds new play(s) for a user.

**Request:**
```json
{
  "username": "KOKO",
  "points": 300
}
```

**Response:**
```json
{
  "queued": true,
  "playsQueued": 1
}
```

## POST /api/admin/products

Creates a product.

## DELETE /api/admin/products/:id

Deletes a product.

## POST /api/admin/settings

Updates settings.

## GET /api/game/current

Returns:
- Current active user
- Queue length
- Game status (idle/spinning)

---

# 6. Slider Logic

## Constructing slider items:

1. Load active products
2. Count fillers needed:
   ```
   fillers = sliderItemCount - activeProducts.length
   ```
3. Generate slider array:

```javascript
const sliderItems = [
  ...activeProducts,
  ...Array(fillers).fill({
    type: "filler",
    title: "Try Again",
    image: "/try-again.png"
  })
];
```

## GSAP Animation Requirements:

- Smooth horizontal movement.
- Ease-out slow finish.
- Center item scale: 1.3
- Side items scale: 1.0
- Item spotlight effect on center item.

---

# 7. Modal Requirements

## Start Game Modal

- Show for 2 seconds
- Text: "Currently playing: {username}"

## Winner Modal

- Display for 5 seconds
- Contains:
  - Username
  - Prize image
  - Prize title
  - Price

---

# 8. Leaderboard

Shows last 5 entries from winners table.

Each row:
- Username
- Prize price

---

# 9. Development Phases

## Phase 1 — Project Setup

- Next.js 16 + TypeScript
- TailwindCSS
- GSAP
- Supabase client
- Cloudflare R2 setup

## Phase 2 — Database & Backend

- Implement Supabase tables
- Implement API routes
- Implement queue logic

## Phase 3 — Admin Panel

- CRUD operations
- Upload to R2
- Settings page
- Winners page

## Phase 4 — Core Game Logic

- Queue processor
- Spin counter
- Prize selection
- Winner recording

## Phase 5 — Front-End Game Implementation

- GSAP slider
- Modals
- Spin button
- API polling
- Leaderboard

## Phase 6 — Polish & Deployment

- Casino-style design
- Responsive improvements
- Documentation

---

# 10. Demo Product Data

```sql
INSERT INTO products (title, price, image_url) VALUES
('iPhone 15', 1600, 'https://example.com/iphone.jpg'),
('PS5 Console', 900, 'https://example.com/ps5.jpg'),
('AirPods Pro', 350, 'https://example.com/airpods.jpg');
```

---

# 11. Cloudflare R2 Instructions

1. Create R2 bucket.
2. Create API token with Read and Write permissions.
3. Add environment variables:

```
R2_ACCOUNT_ID=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET_NAME=
R2_PUBLIC_URL=
```

4. Implement API endpoint to generate a signed upload URL.
5. Front-end:
   - Upload image to signed URL.
   - Store returned image URL into Supabase.

---

# 12. Deployment Requirements

## Vercel

- Add all .env variables
- Ensure image domains include Cloudflare R2 public URL

## Supabase

- Ensure row-level security is appropriately configured

## Cloudflare R2

- CORS:
  - `PUT`, `GET`, `HEAD`
