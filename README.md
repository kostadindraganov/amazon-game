# 🎰 Casino Wheel Game - Next.js 16

A horizontal Wheel-of-Fortune style casino game built with Next.js 16, TypeScript, GSAP, Tailwind CSS, Supabase, and Cloudflare R2.

## 📚 Documentation

For comprehensive project documentation, see:

| Document | Description |
|----------|-------------|
| **[PRD.md](./PRD.md)** | Complete Product Requirements Document with all specifications |
| **[PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md)** | Detailed file/folder structure and organization guidelines |
| **[GAME_FLOW.md](./GAME_FLOW.md)** | Visual flow diagrams and game logic explanations |
| **[TECHNICAL_ARCHITECTURE.md](./TECHNICAL_ARCHITECTURE.md)** | System architecture, data flow, and component interactions |
| **[IMPLEMENTATION_CHECKLIST.md](./IMPLEMENTATION_CHECKLIST.md)** | Step-by-step implementation guide for developers |
| **[CONTRIBUTING.md](./CONTRIBUTING.md)** | **🚨 REQUIRED READING** - Guidelines for contributing and updating docs before PRs |

**💡 Tip:** If you're new to the project, start with [IMPLEMENTATION_CHECKLIST.md](./IMPLEMENTATION_CHECKLIST.md) for a guided walkthrough.

**⚠️ IMPORTANT:** Before creating any PR, read [CONTRIBUTING.md](./CONTRIBUTING.md) and update all relevant documentation!

## 🎯 Features

### Game Features
- **Horizontal GSAP-powered carousel** with smooth animations
- **Casino-style design** with neon effects and glowing text
- **Smart winning system** - Configure win frequency (e.g., every 100th spin)
- **Queue system** - Multiple users can play sequentially via API
- **Real-time leaderboard** - Shows last 5 winners
- **Winner animations** - Celebratory modals with product details
- **Player announcements** - Modal shows current player before spin

### Admin Panel Features
- **Product management** - Upload products with images to Cloudflare R2
- **Settings control** - Configure slider items, win frequency, and point requirements
- **Winners history** - View all past winners with pagination and delete functionality
- **Status tracking** - See which products are active or already won
- **Queue management** - View and manage the player queue in real-time
- **TikTok Live integration** - Connect to TikTok Live streams, receive gifts, and auto-queue players based on gift points

## 📦 Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **UI Library:** React 19
- **Styling:** Tailwind CSS
- **Animations:** GSAP (GreenSock)
- **Database:** Supabase (PostgreSQL)
- **Storage:** Cloudflare R2
- **Image Optimization:** Next.js Image
- **Live Integration:** TikTok Live Connector

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- Supabase account
- Cloudflare R2 account

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd amazon-game
npm install
```

### 2. Environment Setup

Create a `.env.local` file in the root directory:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Cloudflare R2 Configuration
R2_ACCOUNT_ID=your-account-id
R2_ACCESS_KEY_ID=your-access-key-id
R2_SECRET_ACCESS_KEY=your-secret-access-key
R2_BUCKET_NAME=casino-game-products
R2_PUBLIC_URL=https://your-bucket.r2.dev
```

### 3. Supabase Database Setup

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Copy the contents of `supabase/schema.sql`
4. Paste and run the SQL script

This will create:
- `products` table - Stores product information
- `settings` table - Game configuration
- `spin_state` table - Tracks spin counter
- `winners` table - Records all winners
- `game_queue` table - Manages player queue
- `tiktok_settings` table - TikTok Live connection settings
- `tiktok_gift_logs` table - Logs all TikTok gifts received
- Sample products with demo data
- Database functions for spin count management

### 4. Cloudflare R2 Setup

#### Create R2 Bucket

1. Log in to Cloudflare Dashboard
2. Go to **R2 Object Storage**
3. Click **Create bucket**
4. Name it (e.g., `casino-game-products`)
5. Click **Create bucket**

#### Configure Public Access

1. Go to **Settings** for your bucket
2. Under **Public access**, enable public access
3. Note your public bucket URL (e.g., `https://pub-xxx.r2.dev`)

#### Create API Token

1. Click **Manage R2 API Tokens**
2. Click **Create API token**
3. Select **Edit** permissions
4. Note the following values:
   - Access Key ID
   - Secret Access Key
   - Account ID (from the R2 overview page)

#### Configure CORS (Important!)

Add CORS rules to allow uploads from your domain:

```json
[
  {
    "AllowedOrigins": ["http://localhost:3000", "https://your-domain.com"],
    "AllowedMethods": ["GET", "PUT", "HEAD"],
    "AllowedHeaders": ["*"],
    "ExposeHeaders": ["ETag"],
    "MaxAgeSeconds": 3000
  }
]
```

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the game.

## 📁 Project Structure

```
amazon-game/
├── app/
│   ├── api/                  # API routes
│   │   ├── game/            # Game logic endpoints
│   │   │   ├── play/        # Add player to queue
│   │   │   ├── spin/        # Process a spin
│   │   │   ├── current/     # Get current game state
│   │   │   ├── queue/next/  # Get next player
│   │   │   ├── leaderboard/ # Get winners
│   │   │   ├── settings/    # Get game settings
│   │   │   └── slider-items/# Get carousel items
│   │   └── admin/           # Admin endpoints
│   │       ├── products/    # CRUD products
│   │       ├── settings/    # Update settings
│   │       ├── winners/     # View/delete winners
│   │       ├── queue/       # Manage queue
│   │       ├── tiktok/      # TikTok Live integration
│   │       └── upload-url/  # Generate R2 upload URL
│   ├── admin/               # Admin panel pages
│   │   ├── page.tsx        # Products management
│   │   ├── settings/       # Settings page
│   │   ├── winners/        # Winners history
│   │   ├── queues/         # Queue management
│   │   └── tiktok/         # TikTok Live settings
│   ├── globals.css         # Global styles
│   ├── layout.tsx          # Root layout
│   └── page.tsx            # Game homepage
├── components/
│   ├── GameCarousel.tsx    # GSAP carousel
│   ├── Leaderboard.tsx     # Winners leaderboard
│   ├── PlayerModal.tsx     # Current player modal
│   └── WinnerModal.tsx     # Winner announcement modal
├── lib/
│   ├── supabase.ts         # Supabase client & types
│   └── r2.ts               # R2 upload utilities
├── supabase/
│   └── schema.sql          # Database schema
└── public/
    └── try-again.png       # Placeholder filler image
```

## 🎮 How to Use

### Playing the Game

#### Option 1: Manual Spin (Admin Testing)

1. Go to the homepage
2. Click the **ЗАВЪРТИ** (Spin) button
3. The next player from the queue will be selected

#### Option 2: API Integration (Recommended)

Send a POST request to add players to the queue:

```bash
curl -X POST http://localhost:3000/api/game/play \
  -H "Content-Type: application/json" \
  -d '{"username": "KOKO", "points": 600}'
```

**API Response:**
```json
{
  "success": true,
  "queued": true,
  "playsQueued": 2,
  "queueId": 123,
  "message": "KOKO added to queue with 2 play(s)"
}
```

If `points = 600` and `min_points_for_play = 300`, the user gets **2 spins**.

#### Option 3: TikTok Live Integration (Automatic)

1. Go to admin panel → **TikTok Live** tab
2. Enter your TikTok username and click "Connect"
3. When viewers send gifts during your live stream:
   - Gifts are automatically detected
   - Points calculated from gift diamond count
   - Players auto-queued based on points
   - Spins happen automatically in sequence

### Admin Panel

Access the admin panel at [http://localhost:3000/admin](http://localhost:3000/admin)

#### Managing Products

1. **Add Product:**
   - Fill in title and price
   - Upload image (automatically uploaded to R2)
   - Click "Add Product"

2. **View Products:**
   - See all products with status (Active/Won)
   - Pagination for 50+ products

3. **Delete Products:**
   - Click "Delete" button on any product

#### Configuring Settings

Go to **Settings** tab:

- **Total Slider Items:** Total items in carousel (e.g., 100)
- **Win Frequency:** Award a prize every N spins (e.g., 100)
- **Min Points:** Points required per spin (e.g., 300)
- **Headline Text:** Text shown above carousel

#### Viewing Winners

Go to **Winners** tab to see all past winners with:
- Username
- Product won
- Prize value
- Timestamp
- Delete functionality for individual entries

#### Managing Queue

Go to **Queues** tab to:
- View all pending, processing, and completed queue entries
- See real-time queue status
- Remove specific entries from the queue
- Monitor player turns in real-time

#### TikTok Live Integration

Go to **TikTok Live** tab to:
1. **Connect to TikTok Live:**
   - Enter TikTok username
   - Click "Connect to Live Stream"
   - System connects to live stream and listens for gifts

2. **Auto-Queue from Gifts:**
   - When viewers send gifts, they're automatically added to the game queue
   - Points calculated based on gift diamond count
   - All gifts logged in database with viewer information

3. **View Gift Logs:**
   - See all received gifts with pagination
   - Track username, gift name, points, and timestamp
   - Monitor which viewers sent gifts

4. **Connection Status:**
   - Real-time connection status (connected/disconnected/error)
   - Error messages if connection fails
   - Reconnection functionality

## 🎯 Game Logic Explained

### How Winning Works

1. **Spin Counter:** Global counter increments on each spin
2. **Win Frequency:** Set in admin (e.g., 100)
3. **Winning Spin:** When `spin_count % win_frequency === 0`
4. **Prize Selection:** Random active product is selected
5. **Product Status:** Marked as "won" and removed from future spins
6. **Winner Record:** Saved to database

### Example Scenarios

**Scenario 1:** Single User
```
User sends: {username: "Alice", points: 300}
→ 1 spin queued
→ Spin #47 → "Try Again"
```

**Scenario 2:** Multiple Spins
```
User sends: {username: "Bob", points: 900}
→ 3 spins queued
→ Spin automatically after each result
```

**Scenario 3:** Winning Spin
```
Spin #100 (win_frequency = 100)
→ Random product selected
→ Product marked as "won"
→ Winner modal displayed
→ Added to leaderboard
```

**Scenario 4:** Queue System
```
User A sends 300 points → Queued
User B sends 300 points → Queued
User C sends 300 points → Queued

→ User A plays (2 sec delay)
→ After spin completes → User B plays
→ After spin completes → User C plays
```

**Scenario 5:** TikTok Live Integration
```
TikTok viewer sends Rose gift (1 diamond = 1 point)
→ Not enough for a spin (min 300 points)

TikTok viewer sends Galaxy gift (1000 diamonds = 1000 points)
→ 3 spins queued (1000 / 300 = 3 plays)
→ Automatically added to game queue
→ Logged in tiktok_gift_logs table
→ Spins happen automatically in sequence
```

## 🎥 TikTok Live Integration

### How It Works

The casino wheel game integrates directly with TikTok Live streams using the `tiktok-live-connector` package. When connected, the system:

1. **Connects to Live Stream:**
   - Admin enters their TikTok username in the admin panel
   - System connects to the live stream in real-time
   - Connection status displayed in admin panel

2. **Listens for Gifts:**
   - Monitors all gifts sent by viewers during the stream
   - Captures gift metadata (name, diamond count, sender info)
   - Stores all gifts in `tiktok_gift_logs` table

3. **Auto-Queues Players:**
   - Calculates points based on gift diamond count
   - If points ≥ `min_points_for_play`, adds viewer to queue
   - Multiple spins awarded based on total points
   - Example: 1000 diamonds with 300 min points = 3 spins

4. **Processes Spins:**
   - Queue automatically processes in FIFO order
   - Each viewer's spins happen sequentially
   - Winner announcements displayed on stream overlay (if configured)

### Gift Points Calculation

```javascript
totalPoints = giftDiamondCount * repeatCount
playsAwarded = Math.floor(totalPoints / minPointsForPlay)
```

**Example Gifts:**
- Rose (1 diamond) × 100 = 100 points → 0 spins (if min = 300)
- Heart (10 diamonds) × 50 = 500 points → 1 spin (if min = 300)
- Galaxy (1000 diamonds) × 1 = 1000 points → 3 spins (if min = 300)

### TikTok Live Features

- **Real-time connection** - Instant gift detection
- **Automatic player queue** - No manual input needed
- **Gift logging** - Full history of all gifts received
- **Connection monitoring** - Auto-reconnect on errors
- **Viewer profile data** - Stores username and profile picture
- **Raw data storage** - Complete gift metadata in JSONB format

### Use Cases

1. **Live Stream Giveaways:**
   - Run the game during TikTok Live
   - Viewers send gifts to enter
   - Automatic winner selection and announcement

2. **Point-Based Raffles:**
   - Higher-value gifts = more spins
   - Encourages larger gift donations
   - Fair distribution based on contribution

3. **Viewer Engagement:**
   - Interactive live stream experience
   - Real-time visual feedback on wheel
   - Community participation

### Important Notes

- **TikTok Account Requirements:**
  - Account must allow receiving gifts
  - Must be actively live streaming for connection to work
  - Some regions may have restrictions

- **Connection Stability:**
  - TikTok may occasionally block connections
  - System includes auto-reconnect logic
  - Connection status visible in admin panel

- **Rate Limiting:**
  - Gift detection is real-time but may have slight delays
  - Queue processing happens sequentially to prevent race conditions

## 🔧 API Reference

### Game Endpoints

#### `POST /api/game/play`
Add user to queue
```json
// Request
{
  "username": "KOKO",
  "points": 300
}

// Response
{
  "success": true,
  "queued": true,
  "playsQueued": 1,
  "queueId": 123
}
```

#### `POST /api/game/spin`
Process a spin
```json
// Request
{
  "queueId": 123
}

// Response
{
  "success": true,
  "isWinner": true,
  "winner": {...},
  "product": {...},
  "spinCount": 100,
  "remainingPlays": 0
}
```

#### `POST /api/game/queue/next`
Get next player from queue
```json
// Response
{
  "hasNext": true,
  "player": {
    "id": 123,
    "username": "KOKO",
    "plays": 1,
    "status": "processing"
  }
}
```

#### `GET /api/game/current`
Get current game state
```json
// Response
{
  "currentPlayer": {...},
  "queueLength": 5,
  "spinState": {...}
}
```

#### `GET /api/game/leaderboard`
Get last 5 winners
```json
// Response
[
  {
    "id": "uuid",
    "username": "Alice",
    "product_title": "iPhone 15",
    "product_price": 1600,
    "won_at": "2025-11-15T10:30:00Z"
  }
]
```

### Admin Endpoints

#### `GET /api/admin/products?page=1&limit=50`
Get paginated products

#### `POST /api/admin/products`
Create product
```json
{
  "title": "iPhone 15",
  "price": 1600,
  "image_url": "https://..."
}
```

#### `DELETE /api/admin/products/:id`
Delete product

#### `PATCH /api/admin/settings`
Update settings
```json
{
  "slider_item_count": 100,
  "spin_count_to_win": 100,
  "min_points_for_play": 300,
  "headline_text": "Играй за награди!"
}
```

#### `POST /api/admin/upload-url`
Generate R2 upload URL
```json
// Request
{
  "fileName": "image.jpg",
  "fileType": "image/jpeg"
}

// Response
{
  "uploadUrl": "https://...",
  "fileUrl": "https://..."
}
```

#### `GET /api/admin/queue`
Get all queue entries

#### `DELETE /api/admin/queue/:id`
Delete queue entry by ID

#### `GET /api/admin/winners?page=1&limit=50`
Get paginated winners

#### `DELETE /api/admin/winners/:id`
Delete winner entry

### TikTok Live Endpoints

#### `GET /api/admin/tiktok/settings`
Get TikTok connection settings
```json
// Response
{
  "id": 1,
  "username": "tiktok_username",
  "is_connected": true,
  "connection_status": "connected",
  "room_id": "7123456789",
  "last_connected_at": "2025-11-17T10:30:00Z"
}
```

#### `POST /api/admin/tiktok/connect`
Connect to TikTok Live stream
```json
// Request
{
  "username": "tiktok_username"
}

// Response
{
  "success": true,
  "message": "Connected to TikTok Live"
}
```

#### `POST /api/admin/tiktok/disconnect`
Disconnect from TikTok Live stream

#### `PATCH /api/admin/tiktok/settings`
Update TikTok settings
```json
// Request
{
  "username": "new_username"
}
```

#### `GET /api/admin/tiktok/logs?page=1&limit=50`
Get paginated gift logs
```json
// Response
{
  "logs": [
    {
      "id": "uuid",
      "username": "viewer_name",
      "gift_name": "Rose",
      "gift_points": 1,
      "gift_diamond_count": 1,
      "total_points": 1,
      "received_at": "2025-11-17T10:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 100,
    "totalPages": 2
  }
}
```

## 🎨 Customization

### Changing Colors

Edit `tailwind.config.ts`:

```typescript
casino: {
  gold: "#FFD700",
  purple: "#8B5CF6",
  darkPurple: "#581C87",
  neon: "#FF10F0",
  darkBg: "#0F0A1E",
}
```

### Adjusting Carousel Speed

Edit `components/GameCarousel.tsx`:

```typescript
gsap.to(carouselRef.current, {
  x: totalDistance,
  duration: 5, // Change this value (seconds)
  ease: 'power3.out',
  // ...
});
```

### Changing Item Size

Edit `components/GameCarousel.tsx`:

```typescript
const itemWidth = 300; // Change width + gap
```

```tsx
<div style={{ width: '250px' }}> // Change item width
```

## 🚀 Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

### Environment Variables for Production

Make sure to add all `.env.local` variables to your hosting platform:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `R2_ACCOUNT_ID`
- `R2_ACCESS_KEY_ID`
- `R2_SECRET_ACCESS_KEY`
- `R2_BUCKET_NAME`
- `R2_PUBLIC_URL`

## 🐛 Troubleshooting

### Images not loading
- Check R2 bucket CORS settings
- Verify `R2_PUBLIC_URL` is correct
- Ensure images are publicly accessible

### Uploads failing
- Verify R2 API credentials
- Check CORS allows PUT requests
- Ensure bucket name is correct

### Supabase connection issues
- Verify environment variables
- Check Supabase project is active
- Ensure RLS policies allow access

### Carousel not animating
- Check GSAP is installed: `npm install gsap`
- Verify slider items are loading
- Check browser console for errors

### Queue not processing
- Check API endpoint `/api/game/current`
- Verify queue table has entries
- Check browser console for polling errors

### TikTok Live connection issues
- Verify the TikTok username is correct and the user is currently live
- Check server logs for connection errors
- Ensure `tiktok-live-connector` package is installed
- TikTok may block connections - try reconnecting
- Check that the TikTok account allows viewers to send gifts

### TikTok gifts not adding players to queue
- Verify game settings are configured (min_points_for_play)
- Check `tiktok_gift_logs` table to see if gifts are being logged
- Ensure gift diamond count is sufficient for at least 1 play
- Check server logs for queue insertion errors

## 📝 Database Schema Overview

### `products`
- Stores all prize products
- Status: `active` or `won`
- Won products excluded from future spins
- Includes title, price, image URL, and optional win_at_spin_count

### `settings`
- Single row configuration
- Controls game behavior (slider count, win frequency, min points)
- Can be updated via admin panel

### `spin_state`
- Global spin counter
- Increments on each spin
- Used to determine winning spins

### `winners`
- Historical record of all winners
- Includes denormalized product data (title, price, image)
- Sorted by timestamp for leaderboard
- Can be deleted by admin

### `game_queue`
- FIFO queue for players
- Status: `pending`, `processing`, `done`
- Tracks number of plays per user
- Automatically processed by game logic

### `tiktok_settings`
- Single row configuration for TikTok Live
- Connection status, username, room ID
- Last connected timestamp and error messages

### `tiktok_gift_logs`
- Historical record of all TikTok gifts received
- Includes username, unique_id, gift details
- Gift points, diamond count, and repeat count
- Profile picture URL and raw data (JSONB)
- Used for analytics and player queue integration

## 🎓 Learning Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [GSAP Documentation](https://greensock.com/docs/)
- [Supabase Documentation](https://supabase.com/docs)
- [Cloudflare R2 Documentation](https://developers.cloudflare.com/r2/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

## ⚠️ Important Development Notes

### Documentation Maintenance

**🚨 CRITICAL: Before Creating Any Pull Request**

If you make changes to the project, you **MUST** update the relevant documentation files:

1. **Update PRD.md** - If you change features, APIs, database schema, or requirements
2. **Update GAME_FLOW.md** - If you modify game logic or flows
3. **Update TECHNICAL_ARCHITECTURE.md** - If you change architecture or data flow
4. **Update PROJECT_STRUCTURE.md** - If you add/remove files or restructure folders
5. **Update IMPLEMENTATION_CHECKLIST.md** - If you change implementation steps
6. **Update README.md** - If you change setup, deployment, or API endpoints

**Documentation Review Checklist Before PR:**
- [ ] All affected documentation files updated
- [ ] PRD.md reflects current features
- [ ] Code structure matches PROJECT_STRUCTURE.md
- [ ] Game flows documented in GAME_FLOW.md
- [ ] API changes reflected in README and PRD

### UI Reminder

**⚠️ TODO: Remove Bottom Spin Button**

Before finalizing the UI, remember to:
- Remove the manual "Spin" button from the homepage bottom
- The game should primarily be triggered via API calls
- Keep the admin testing functionality if needed, but remove from production UI

## 📄 License

This project is proprietary. Do not distribute without permission.

## 🤝 Support

For issues or questions:
1. Check this README
2. Review the PRD document
3. Check browser console for errors
4. Verify environment variables
5. Test API endpoints with curl/Postman

## 🎉 Credits

Built with ❤️ using Claude Code and the latest web technologies.
