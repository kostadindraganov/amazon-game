# Database Migrations

This directory contains database migration files for the Amazon Game application.

## Available Migrations

### TikTok Live Integration

**File**: `20251117_add_tiktok_live.sql`

Adds support for TikTok Live stream monitoring and gift tracking.

**Tables Created**:
- `tiktok_settings` - Stores TikTok Live connection configuration
- `tiktok_gift_logs` - Stores all gift events received from TikTok Live

**Rollback**: `20251117_add_tiktok_live_rollback.sql`

## How to Apply Migrations

### Option 1: Using Supabase CLI

```bash
# Apply a specific migration
supabase db push

# Or apply directly
supabase db execute --file supabase/migrations/20251117_add_tiktok_live.sql
```

### Option 2: Using Supabase Dashboard

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Copy the contents of the migration file
4. Paste and execute the SQL

### Option 3: Manual Execution

Connect to your PostgreSQL database and run:

```bash
psql -U postgres -d your_database < supabase/migrations/20251117_add_tiktok_live.sql
```

## How to Rollback Migrations

To remove the TikTok Live integration:

```bash
# Using Supabase CLI
supabase db execute --file supabase/migrations/20251117_add_tiktok_live_rollback.sql
```

Or execute `20251117_add_tiktok_live_rollback.sql` in the SQL Editor.

**⚠️ WARNING**: Rollback will permanently delete all TikTok connection settings and gift logs!

## Migration Naming Convention

Migrations follow the format: `YYYYMMDD_description.sql`

- `YYYYMMDD` - Date of migration creation
- `description` - Brief description of what the migration does
- `_rollback` suffix - Indicates a rollback/down migration

## Prerequisites

Before applying the TikTok Live migration, ensure:

1. The `update_updated_at_column()` function exists in your database (it's included in the main schema.sql)
2. The UUID extension is enabled (`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`)

If these are missing, run the main `schema.sql` first or add them:

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create update timestamp function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ language 'plpgsql';
```

## Testing Migrations

After applying a migration:

1. Verify tables were created:
   ```sql
   \dt tiktok_*
   ```

2. Check indexes:
   ```sql
   \di tiktok_*
   ```

3. Verify RLS policies:
   ```sql
   SELECT * FROM pg_policies WHERE tablename LIKE 'tiktok%';
   ```

4. Test basic operations:
   ```sql
   -- Insert test data
   INSERT INTO tiktok_gift_logs (username, unique_id, gift_id, gift_name, gift_points, total_points)
   VALUES ('testuser', 'test123', 1, 'Rose', 1, 1);

   -- Query test data
   SELECT * FROM tiktok_gift_logs;

   -- Clean up
   DELETE FROM tiktok_gift_logs WHERE unique_id = 'test123';
   ```

## Security Notes

The default policies allow all operations on TikTok tables. In production, you should:

1. Add authentication checks
2. Restrict admin operations to authenticated admin users
3. Consider making gift logs read-only for public users

Example restrictive policy:

```sql
-- Drop the permissive policy
DROP POLICY "Allow all on tiktok_settings" ON tiktok_settings;

-- Add admin-only policy (requires auth.users table)
CREATE POLICY "Admin only access to tiktok_settings"
  ON tiktok_settings
  FOR ALL
  USING (auth.uid() IN (SELECT id FROM auth.users WHERE email = 'admin@example.com'));
```
