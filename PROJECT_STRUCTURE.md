# 📁 Project Structure

This document outlines the expected file and folder structure for the casino-style horizontal slider game.

```
amazon-game/
├── src/
│   ├── app/
│   │   ├── page.tsx                    # Home page with game slider
│   │   ├── layout.tsx                  # Root layout
│   │   ├── globals.css                 # Global styles with Tailwind
│   │   │
│   │   ├── admin/
│   │   │   ├── page.tsx                # Admin dashboard (redirect to products)
│   │   │   ├── layout.tsx              # Admin layout wrapper
│   │   │   ├── products/
│   │   │   │   └── page.tsx            # Products management page
│   │   │   ├── settings/
│   │   │   │   └── page.tsx            # Global settings page
│   │   │   └── winners/
│   │   │       └── page.tsx            # Winners management page
│   │   │
│   │   └── api/
│   │       ├── game/
│   │       │   ├── play/
│   │       │   │   └── route.ts        # POST - Add user to queue
│   │       │   └── current/
│   │       │       └── route.ts        # GET - Current game status
│   │       │
│   │       └── admin/
│   │           ├── products/
│   │           │   ├── route.ts        # GET/POST - List/Create products
│   │           │   └── [id]/
│   │           │       └── route.ts    # DELETE - Delete product
│   │           ├── settings/
│   │           │   └── route.ts        # GET/POST - Settings CRUD
│   │           └── upload/
│   │               └── route.ts        # POST - Generate R2 signed URL
│   │
│   ├── components/
│   │   ├── game/
│   │   │   ├── GameSlider.tsx          # Main GSAP horizontal slider
│   │   │   ├── SliderItem.tsx          # Individual slider item
│   │   │   ├── SpinButton.tsx          # Spin button component
│   │   │   ├── Leaderboard.tsx         # Last 5 winners display
│   │   │   └── Pointer.tsx             # Center pointer overlay
│   │   │
│   │   ├── modals/
│   │   │   ├── PlayerModal.tsx         # "Currently playing: {username}"
│   │   │   └── WinnerModal.tsx         # Winner announcement modal
│   │   │
│   │   └── admin/
│   │       ├── ProductForm.tsx         # Add/edit product form
│   │       ├── ProductTable.tsx        # Products table with pagination
│   │       ├── SettingsForm.tsx        # Global settings form
│   │       └── WinnersTable.tsx        # Winners table with pagination
│   │
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts               # Supabase browser client
│   │   │   ├── server.ts               # Supabase server client
│   │   │   └── types.ts                # Database types
│   │   │
│   │   ├── r2/
│   │   │   └── client.ts               # Cloudflare R2 client config
│   │   │
│   │   └── utils/
│   │       ├── queue.ts                # Queue processing logic
│   │       ├── gameLogic.ts            # Win/lose determination
│   │       └── animations.ts           # GSAP animation helpers
│   │
│   ├── hooks/
│   │   ├── useGameQueue.ts             # Hook for queue management
│   │   ├── useGameStatus.ts            # Hook for current game state
│   │   └── useSettings.ts              # Hook for global settings
│   │
│   └── types/
│       ├── database.ts                 # Supabase generated types
│       ├── game.ts                     # Game-specific types
│       └── api.ts                      # API request/response types
│
├── public/
│   ├── try-again.png                   # Default "Try Again" filler image
│   └── pointer.svg                     # Center pointer graphic
│
├── supabase/
│   ├── migrations/
│   │   └── 001_initial_schema.sql      # Database schema
│   └── seed.sql                        # Demo data for testing
│
├── .claude/                            # Claude Code configuration
│   ├── README.md                       # Documentation automation guide
│   ├── rules.md                        # Project-specific rules (auto-loaded)
│   └── commands/
│       └── update-docs.md              # /update-docs slash command
│
├── .git/
│   └── hooks/
│       └── pre-commit                  # Documentation enforcement hook
│
├── docs/
│   ├── PRD.md                          # Product Requirements Document
│   ├── PROJECT_STRUCTURE.md            # This file
│   ├── GAME_FLOW.md                    # Game flow diagrams
│   ├── TECHNICAL_ARCHITECTURE.md       # Architecture overview
│   └── IMPLEMENTATION_CHECKLIST.md     # Step-by-step guide
│
├── .env.local.example                  # Environment variables template
├── .env.local                          # Actual environment variables (gitignored)
├── .gitignore
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── next.config.ts
├── CONTRIBUTING.md                     # Contribution guidelines
└── README.md
```

## Key Directories Explained

### `/src/app`
Next.js 16 App Router structure. Each folder represents a route.

### `/src/components`
Reusable React components organized by feature:
- **game/** - Game-related UI components
- **modals/** - Modal dialogs
- **admin/** - Admin panel components

### `/src/lib`
Utility functions and external service integrations:
- **supabase/** - Database client and types
- **r2/** - Cloudflare R2 configuration
- **utils/** - Business logic helpers

### `/src/hooks`
Custom React hooks for state management and data fetching.

### `/src/types`
TypeScript type definitions for type safety.

### `/public`
Static assets (images, icons, etc.)

### `/supabase`
Database migrations and seed data for Supabase.

### `/.claude`
Claude Code configuration for automated documentation support:
- **rules.md** - Auto-loaded project rules (documentation requirements)
- **commands/update-docs.md** - Custom slash command for updating docs
- **README.md** - Documentation automation guide

This directory enables:
1. Automatic reminders to update documentation
2. `/update-docs` slash command for guided updates
3. Integration with pre-commit hook

### `/.git/hooks`
Git hooks for repository quality control:
- **pre-commit** - Enforces documentation updates before commits

### `/docs`
All project documentation.

## Environment Variables

Required in `.env.local`:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Cloudflare R2
R2_ACCOUNT_ID=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET_NAME=
R2_PUBLIC_URL=
```

## File Naming Conventions

- **Components**: PascalCase (e.g., `GameSlider.tsx`)
- **Utilities**: camelCase (e.g., `gameLogic.ts`)
- **API Routes**: lowercase with route.ts (e.g., `route.ts`)
- **Types**: PascalCase for interfaces/types
