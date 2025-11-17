-- Migration Rollback: Remove TikTok Live Integration
-- Description: Removes all TikTok Live related tables and policies
-- Date: 2025-11-17
-- WARNING: This will permanently delete all TikTok connection settings and gift logs

-- Drop policies first
DROP POLICY IF EXISTS "Allow all on tiktok_gift_logs" ON tiktok_gift_logs;
DROP POLICY IF EXISTS "Allow all on tiktok_settings" ON tiktok_settings;
DROP POLICY IF EXISTS "Public read access for tiktok_gift_logs" ON tiktok_gift_logs;
DROP POLICY IF EXISTS "Public read access for tiktok_settings" ON tiktok_settings;

-- Drop trigger
DROP TRIGGER IF EXISTS update_tiktok_settings_updated_at ON tiktok_settings;

-- Drop indexes
DROP INDEX IF EXISTS idx_tiktok_gift_logs_unique_id;
DROP INDEX IF EXISTS idx_tiktok_gift_logs_username;
DROP INDEX IF EXISTS idx_tiktok_gift_logs_received_at;

-- Drop tables
DROP TABLE IF EXISTS tiktok_gift_logs;
DROP TABLE IF EXISTS tiktok_settings;
