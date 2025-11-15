# ✅ Implementation Checklist

This is a step-by-step guide for implementing the casino-style horizontal slider game.

---

## Phase 1: Project Setup

### 1.1 Initialize Next.js Project
- [ ] Create Next.js 16 app with TypeScript
  ```bash
  npx create-next-app@latest amazon-game --typescript --tailwind --app
  ```
- [ ] Configure `tsconfig.json` for strict type checking
- [ ] Set up ESLint and Prettier
- [ ] Initialize git repository

### 1.2 Install Dependencies
- [ ] Install GSAP
  ```bash
  npm install gsap
  ```
- [ ] Install Supabase client
  ```bash
  npm install @supabase/supabase-js
  ```
- [ ] Install AWS SDK for R2
  ```bash
  npm install @aws-sdk/client-s3 @aws-sdk/s3-request-presigner
  ```
- [ ] Install additional utilities
  ```bash
  npm install clsx tailwind-merge
  ```

### 1.3 Environment Setup
- [ ] Create `.env.local` file
- [ ] Add Supabase credentials
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY`
- [ ] Add Cloudflare R2 credentials
  - `R2_ACCOUNT_ID`
  - `R2_ACCESS_KEY_ID`
  - `R2_SECRET_ACCESS_KEY`
  - `R2_BUCKET_NAME`
  - `R2_PUBLIC_URL`
- [ ] Create `.env.local.example` template

### 1.4 Project Structure
- [ ] Create folder structure as per PROJECT_STRUCTURE.md
- [ ] Set up path aliases in `tsconfig.json`
  ```json
  {
    "compilerOptions": {
      "paths": {
        "@/*": ["./src/*"]
      }
    }
  }
  ```

---

## Phase 2: Database & Backend Setup

### 2.1 Supabase Configuration
- [ ] Create Supabase project
- [ ] Set up authentication (if needed)
- [ ] Configure project URL and keys

### 2.2 Database Schema
- [ ] Create `products` table
  ```sql
  CREATE TABLE products (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    price NUMERIC NOT NULL,
    image_url TEXT NOT NULL,
    status TEXT DEFAULT 'active',
    created_at TIMESTAMP DEFAULT NOW()
  );
  ```
- [ ] Create `settings` table
- [ ] Create `spin_state` table
- [ ] Create `winners` table
- [ ] Create `game_queue` table
- [ ] Add indexes for performance
  ```sql
  CREATE INDEX idx_products_status ON products(status);
  CREATE INDEX idx_winners_won_at ON winners(won_at DESC);
  CREATE INDEX idx_queue_status ON game_queue(status, created_at);
  ```

### 2.3 Seed Data
- [ ] Insert demo products
- [ ] Insert default settings row
  ```sql
  INSERT INTO settings (id, slider_item_count, spin_count_to_win, min_points_for_play, headline_text)
  VALUES (1, 100, 100, 300, 'Play for these rewards');
  ```
- [ ] Initialize spin_state
  ```sql
  INSERT INTO spin_state (id, current_spin_count) VALUES (1, 0);
  ```

### 2.4 Supabase Client Setup
- [ ] Create `src/lib/supabase/client.ts` (browser client)
- [ ] Create `src/lib/supabase/server.ts` (server client)
- [ ] Generate TypeScript types from database
  ```bash
  npx supabase gen types typescript --project-id YOUR_PROJECT_ID > src/types/database.ts
  ```

### 2.5 Cloudflare R2 Setup
- [ ] Create R2 bucket in Cloudflare dashboard
- [ ] Generate API token with Read & Write permissions
- [ ] Configure CORS settings
  ```json
  {
    "AllowedOrigins": ["*"],
    "AllowedMethods": ["GET", "PUT", "HEAD"],
    "AllowedHeaders": ["*"],
    "MaxAgeSeconds": 3600
  }
  ```
- [ ] Create R2 client in `src/lib/r2/client.ts`

---

## Phase 3: API Routes

### 3.1 Game API Routes
- [ ] Create `POST /api/game/play`
  - [ ] Validate request (username, points)
  - [ ] Calculate number of plays
  - [ ] Insert into game_queue
  - [ ] Return success response

- [ ] Create `GET /api/game/current`
  - [ ] Get current processing queue entry
  - [ ] Get queue length
  - [ ] Get current game status
  - [ ] Return status object

### 3.2 Admin API Routes
- [ ] Create `GET /api/admin/products`
  - [ ] Fetch all products with pagination
  - [ ] Return products array

- [ ] Create `POST /api/admin/products`
  - [ ] Validate product data
  - [ ] Insert into products table
  - [ ] Return created product

- [ ] Create `DELETE /api/admin/products/[id]`
  - [ ] Validate product ID
  - [ ] Delete from products table
  - [ ] Return success

- [ ] Create `GET /api/admin/settings`
  - [ ] Fetch settings (id = 1)
  - [ ] Return settings object

- [ ] Create `POST /api/admin/settings`
  - [ ] Validate settings data
  - [ ] Update settings row
  - [ ] Clear cache if implemented
  - [ ] Return updated settings

- [ ] Create `POST /api/admin/upload`
  - [ ] Generate S3 presigned URL for R2
  - [ ] Return signed URL and fields
  - [ ] Set expiration (e.g., 5 minutes)

### 3.3 Test API Routes
- [ ] Test with Postman/Thunder Client
- [ ] Verify error handling
- [ ] Verify data validation

---

## Phase 4: Core Game Logic

### 4.1 Queue Processor
- [ ] Create `src/lib/utils/queue.ts`
- [ ] Implement queue polling function
  ```typescript
  async function processQueue() {
    // Get next pending entry
    // Mark as processing
    // Trigger game
    // Mark as done
  }
  ```
- [ ] Handle queue state transitions
- [ ] Add error handling and retries

### 4.2 Game Logic
- [ ] Create `src/lib/utils/gameLogic.ts`
- [ ] Implement spin counter increment
  ```typescript
  async function incrementSpinCount(): Promise<number>
  ```
- [ ] Implement win determination
  ```typescript
  async function isWinningSpin(spinCount: number, settings: Settings): Promise<boolean>
  ```
- [ ] Implement random product selection
  ```typescript
  async function selectRandomProduct(): Promise<Product | null>
  ```
- [ ] Implement winner recording
  ```typescript
  async function recordWinner(username: string, productId: string)
  ```
- [ ] Update product status to 'won'

### 4.3 Slider Construction Logic
- [ ] Create slider builder function
  ```typescript
  function buildSliderItems(products: Product[], totalCount: number): SliderItem[]
  ```
- [ ] Shuffle algorithm for randomness
- [ ] Handle edge case: no active products

---

## Phase 5: Frontend - Admin Panel

### 5.1 Admin Layout
- [ ] Create `src/app/admin/layout.tsx`
- [ ] Add navigation menu (Products, Settings, Winners)
- [ ] Add authentication check (optional)

### 5.2 Products Page
- [ ] Create `src/app/admin/products/page.tsx`
- [ ] Create `ProductForm` component
  - [ ] Title input
  - [ ] Price input
  - [ ] Image upload with preview
  - [ ] Submit handler (upload to R2 → save to DB)
- [ ] Create `ProductTable` component
  - [ ] Display products with pagination
  - [ ] Show thumbnail, title, price, status
  - [ ] Delete button with confirmation
  - [ ] Status badge (Active/Won)
- [ ] Implement pagination (50 per page)
- [ ] Add loading states
- [ ] Add error handling

### 5.3 Settings Page
- [ ] Create `src/app/admin/settings/page.tsx`
- [ ] Create `SettingsForm` component
  - [ ] slider_item_count input (number)
  - [ ] spin_count_to_win input (number)
  - [ ] min_points_for_play input (number)
  - [ ] headline_text input (text)
  - [ ] Save button
- [ ] Fetch current settings on mount
- [ ] Update settings on submit
- [ ] Show success/error messages

### 5.4 Winners Page
- [ ] Create `src/app/admin/winners/page.tsx`
- [ ] Create `WinnersTable` component
  - [ ] Display winners with pagination
  - [ ] Join with products to show details
  - [ ] Show username, prize, price, image, timestamp
- [ ] Implement pagination
- [ ] Sort by most recent first

---

## Phase 6: Frontend - Game UI

### 6.1 Home Page Layout
- [ ] Create `src/app/page.tsx`
- [ ] Add headline text from settings
- [ ] Add min points text
- [ ] Layout: Headline → Slider → Leaderboard → Spin Button

### 6.2 Game Slider Component
- [ ] Create `src/components/game/GameSlider.tsx`
- [ ] Initialize GSAP timeline
- [ ] Render slider items in horizontal layout
- [ ] Create `SliderItem` component
  - [ ] Display product image or "Try Again"
  - [ ] Apply scaling based on position
  - [ ] Center item: scale 1.3
  - [ ] Side items: scale 1.0
- [ ] Add pointer overlay in center
- [ ] Create `Pointer` component (arrow SVG)

### 6.3 GSAP Animations
- [ ] Create `src/lib/utils/animations.ts`
- [ ] Implement spin animation
  ```typescript
  function spinAnimation(targetPosition: number): gsap.core.Timeline
  ```
- [ ] Add acceleration phase (2s)
- [ ] Add constant speed phase (6s)
- [ ] Add deceleration phase (4s)
- [ ] Add easing: `power4.out` for smooth stop
- [ ] Implement center item scaling animation
- [ ] Add spotlight effect on center item

### 6.4 Spin Button
- [ ] Create `src/components/game/SpinButton.tsx`
- [ ] Disable during animation
- [ ] Click handler: trigger API call with test user
- [ ] Show loading state

### 6.5 Leaderboard
- [ ] Create `src/components/game/Leaderboard.tsx`
- [ ] Fetch last 5 winners from API
- [ ] Display username and prize price
- [ ] Auto-refresh on new winner (polling or real-time)
- [ ] Style with casino theme

### 6.6 Modals
- [ ] Create `src/components/modals/PlayerModal.tsx`
  - [ ] Show "Currently playing: {username}"
  - [ ] Auto-hide after 2 seconds
  - [ ] Animate entrance/exit

- [ ] Create `src/components/modals/WinnerModal.tsx`
  - [ ] Show username, product image, title, price
  - [ ] Auto-hide after 5 seconds
  - [ ] Confetti animation (optional)
  - [ ] Animate entrance/exit

---

## Phase 7: Game Orchestration

### 7.1 Game State Hook
- [ ] Create `src/hooks/useGameStatus.ts`
- [ ] Poll `GET /api/game/current` every 2 seconds
- [ ] Return current player, queue length, game status

### 7.2 Game Flow Integration
- [ ] On queue entry added → trigger queue processor
- [ ] Show PlayerModal when game starts
- [ ] Trigger spin animation
- [ ] Determine win/loss from backend
- [ ] Show WinnerModal if win
- [ ] Update leaderboard
- [ ] Process next in queue after 2s delay

### 7.3 Queue Processor Integration
- [ ] Option 1: Client-side interval checking queue
- [ ] Option 2: Server-side background job
- [ ] Option 3: Supabase real-time subscription
- [ ] Choose and implement one approach

---

## Phase 8: Styling & UX

### 8.1 Casino Theme Design
- [ ] Choose color scheme (gold, red, black)
- [ ] Add gradient backgrounds
- [ ] Add glow effects on buttons
- [ ] Add card-style components with shadows
- [ ] Use casino-inspired fonts (Google Fonts)

### 8.2 Responsive Design
- [ ] Test on mobile, tablet, desktop
- [ ] Adjust slider size for different screens
- [ ] Make admin panel responsive
- [ ] Test modals on small screens

### 8.3 Animations & Transitions
- [ ] Add page transitions
- [ ] Smooth hover effects on buttons
- [ ] Animate modal entrances
- [ ] Add loading spinners
- [ ] Pulse effect on Spin button

### 8.4 Accessibility
- [ ] Add ARIA labels
- [ ] Keyboard navigation support
- [ ] Focus states for interactive elements
- [ ] Alt text for images

---

## Phase 9: Testing

### 9.1 Unit Tests
- [ ] Test game logic functions
- [ ] Test queue processing
- [ ] Test win determination
- [ ] Test slider builder

### 9.2 Integration Tests
- [ ] Test API endpoints
- [ ] Test database operations
- [ ] Test R2 upload flow

### 9.3 E2E Tests
- [ ] Test complete game flow
- [ ] Test multi-player queue
- [ ] Test admin CRUD operations
- [ ] Test edge cases (no products, queue overflow)

### 9.4 Manual Testing
- [ ] Play multiple games
- [ ] Test with multiple concurrent users
- [ ] Verify win rate matches settings
- [ ] Test admin panel thoroughly

---

## Phase 10: Deployment

### 10.1 Pre-Deployment
- [ ] Verify all environment variables
- [ ] Run production build locally
  ```bash
  npm run build
  ```
- [ ] Fix any build errors/warnings
- [ ] Test production build locally
  ```bash
  npm run start
  ```

### 10.2 Vercel Deployment
- [ ] Connect GitHub repository to Vercel
- [ ] Configure environment variables in Vercel
- [ ] Set Next.js version to 16
- [ ] Configure image domains for R2
  ```javascript
  // next.config.ts
  images: {
    domains: ['your-r2-bucket.r2.dev']
  }
  ```
- [ ] Deploy to production

### 10.3 Supabase Production Setup
- [ ] Review Row-Level Security policies
- [ ] Enable connection pooling if needed
- [ ] Set up database backups
- [ ] Monitor query performance

### 10.4 Cloudflare R2 Production
- [ ] Verify CORS settings
- [ ] Set up custom domain (optional)
- [ ] Configure cache headers

### 10.5 Post-Deployment
- [ ] Verify all features work in production
- [ ] Test API endpoints
- [ ] Monitor error logs
- [ ] Set up monitoring/alerting

---

## Phase 11: Documentation

### 11.1 README.md
- [ ] Add project description
- [ ] Add installation instructions
- [ ] Add environment variables setup
- [ ] Add deployment guide
- [ ] Add screenshots

### 11.2 API Documentation
- [ ] Document all API endpoints
- [ ] Add request/response examples
- [ ] Document error codes

### 11.3 User Guide
- [ ] How to play the game
- [ ] How to use admin panel
- [ ] Troubleshooting common issues

---

## Phase 12: Optional Enhancements

### 12.1 Advanced Features
- [ ] User authentication for admin panel
- [ ] Real-time updates with Supabase subscriptions
- [ ] Sound effects for spins and wins
- [ ] Particle effects/confetti on win
- [ ] Daily/weekly leaderboards
- [ ] Product categories
- [ ] Game statistics dashboard

### 12.2 Performance Optimizations
- [ ] Implement Redis for queue (if high traffic)
- [ ] Add caching layer (settings, products)
- [ ] Optimize images (WebP format)
- [ ] Lazy load components
- [ ] Server-side rendering for SEO

### 12.3 Analytics
- [ ] Track game plays
- [ ] Track win rate
- [ ] User behavior analytics
- [ ] Admin dashboard with charts

---

## Completion Checklist

- [ ] All features from PRD implemented
- [ ] All tests passing
- [ ] Production deployment successful
- [ ] Documentation complete
- [ ] No critical bugs
- [ ] Performance acceptable
- [ ] Security reviewed
- [ ] Code reviewed
- [ ] README updated
- [ ] Project ready for handoff

---

## Notes

- Prioritize core functionality first
- Test incrementally as you build
- Keep commits small and focused
- Document any deviations from the plan
- Ask for clarification if requirements are unclear
