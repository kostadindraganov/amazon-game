# 🎮 Game Flow Documentation

This document describes the complete flow of the casino-style horizontal slider game.

---

## 1. Game Start Flow

```
User Action / API Call
        ↓
[POST /api/game/play]
{username, points}
        ↓
Calculate Plays:
plays = floor(points / minPointsForPlay)
        ↓
Add to Queue (Supabase)
game_queue table
status: 'pending'
        ↓
Queue Processor Picks Up
(if no game active)
        ↓
Show Player Modal
"Currently playing: {username}"
(2 seconds)
        ↓
Start Spin Animation
(GSAP)
```

---

## 2. Queue Processing Flow

```
Game Ends
   ↓
Wait 2 seconds
   ↓
Check queue for next pending entry
   ↓
┌─────────────┬─────────────┐
│ Queue Empty │ Queue Has   │
│             │ Next Player │
└─────────────┴─────────────┘
      ↓               ↓
   [IDLE]      Update status to
              'processing'
                     ↓
              Start new game
              (Show Player Modal)
```

---

## 3. Spin Logic Flow

```
Spin Starts
    ↓
Increment spin_state.current_spin_count
    ↓
Check Win Condition:
current_spin_count % spin_count_to_win == 0
    ↓
┌──────────────┬──────────────┐
│   WIN = YES  │   WIN = NO   │
└──────────────┴──────────────┘
       ↓                ↓
Select Random       Land on
Active Product    "Try Again"
       ↓                ↓
Mark Product      No DB Write
status = 'won'         ↓
       ↓           Animation
Save to           Completes
winners table          ↓
       ↓           Mark queue
Show Winner       entry 'done'
Modal (5s)             ↓
       ↓           Next in Queue
Add to
Leaderboard
       ↓
Mark queue
entry 'done'
       ↓
Next in Queue
```

---

## 4. Slider Construction Flow

```
Load Game Settings
(slider_item_count)
        ↓
Fetch Active Products
(status = 'active')
        ↓
Calculate Fillers:
fillers = slider_item_count - activeProducts.length
        ↓
Construct Array:
[
  ...activeProducts,
  ...Array(fillers).fill({
    type: "filler",
    title: "Try Again",
    image: "/try-again.png"
  })
]
        ↓
Shuffle Array
(for randomness)
        ↓
Render Slider with GSAP
```

---

## 5. GSAP Animation Flow

```
Spin Triggered
      ↓
Calculate Target Position
(based on win/lose)
      ↓
GSAP Timeline:
1. Fast acceleration (0-2s)
2. Constant speed (2-8s)
3. Ease-out deceleration (8-12s)
      ↓
Apply Effects:
- Center item: scale(1.3)
- Side items: scale(1.0)
- Spotlight on center
      ↓
Stop at Target
      ↓
Trigger Callback:
- Show winner modal (if win)
- Process next in queue
```

---

## 6. Admin Product Upload Flow

```
Admin Fills Form
(title, price, image)
      ↓
[POST /api/admin/upload]
Generate R2 signed URL
      ↓
Upload Image to R2
(client-side)
      ↓
Receive image URL
      ↓
[POST /api/admin/products]
Save to Supabase:
{
  title,
  price,
  image_url,
  status: 'active'
}
      ↓
Refresh Product Table
```

---

## 7. Winning Product Lifecycle

```
Product Created
status: 'active'
      ↓
Added to Slider Pool
      ↓
User Wins Product
      ↓
Update Product:
status: 'won'
      ↓
Save Winner Record:
{
  username,
  product_id,
  won_at
}
      ↓
Remove from Slider Pool
      ↓
Show in Admin as "Won"
      ↓
Display in Leaderboard
```

---

## 8. Modal Display Timeline

### Player Modal
```
Game Starts
    ↓
Show Modal: "Currently playing: {username}"
    ↓
Wait 2 seconds
    ↓
Hide Modal
    ↓
Start Spin
```

### Winner Modal
```
Spin Ends (Win)
    ↓
Show Modal:
- Username
- Product image
- Title
- Price
    ↓
Wait 5 seconds
    ↓
Hide Modal
    ↓
Update Leaderboard
    ↓
Process Next Queue
```

---

## 9. Leaderboard Update Flow

```
Winner Determined
      ↓
Insert into winners table
      ↓
Query last 5 winners:
SELECT * FROM winners
ORDER BY won_at DESC
LIMIT 5
      ↓
Join with products table
(for title, price, image)
      ↓
Update Leaderboard UI
(real-time or polling)
```

---

## 10. Multi-Play Scenario

**Example:** User sends 600 points, minPointsForPlay = 300

```
API Call: {username: "KOKO", points: 600}
        ↓
Calculate: 600 / 300 = 2 plays
        ↓
Insert Queue Entry:
{
  username: "KOKO",
  plays: 2,
  status: 'pending'
}
        ↓
First Play Processes:
- Decrement plays to 1
- Run spin
- Update status: 'processing'
        ↓
First Play Ends
        ↓
Check: plays > 0?
YES → Create new queue entry:
{
  username: "KOKO",
  plays: 1,
  status: 'pending'
}
        ↓
Process continues until plays = 0
```

---

## 11. Error Handling Flow

### Insufficient Points
```
API Call: {username: "KOKO", points: 100}
minPointsForPlay: 300
        ↓
Validation: points < minPointsForPlay
        ↓
Return Error:
{
  error: "Insufficient points",
  required: 300,
  provided: 100
}
```

### No Active Products
```
Spin Triggered (Win Condition)
        ↓
Query active products
        ↓
Result: 0 products
        ↓
Fallback to "Try Again"
Log Error/Alert Admin
```

### R2 Upload Failure
```
Image Upload to R2
        ↓
Network Error / Invalid Response
        ↓
Show Error to Admin
Do NOT save to Supabase
        ↓
Allow Retry
```

---

## 12. Real-Time Updates

The game uses polling for real-time updates:

```
Frontend Component
      ↓
setInterval every 2 seconds
      ↓
[GET /api/game/current]
      ↓
Response:
{
  currentPlayer: "KOKO",
  queueLength: 3,
  gameStatus: "spinning"
}
      ↓
Update UI accordingly
```

**Alternative:** Use Supabase real-time subscriptions for live updates.
