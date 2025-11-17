-- Migration: Add TikTok Live Integration
-- Description: Adds tables and policies for TikTok Live stream monitoring and gift tracking
-- Date: 2025-11-17

-- TikTok Settings Table
-- Stores connection configuration for TikTok Live streams
CREATE TABLE IF NOT EXISTS tiktok_settings (
  id INT PRIMARY KEY DEFAULT 1,
  username TEXT,
  is_connected BOOLEAN DEFAULT false,
  connection_status TEXT DEFAULT 'disconnected' CHECK (connection_status IN ('disconnected', 'connecting', 'connected', 'error')),
  error_message TEXT,
  room_id TEXT,
  last_connected_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT single_row_tiktok CHECK (id = 1)
);

-- Insert default TikTok settings
INSERT INTO tiktok_settings (id) VALUES (1)
ON CONFLICT (id) DO NOTHING;

-- TikTok Gift Logs Table
-- Stores all gift events received from TikTok Live streams
CREATE TABLE IF NOT EXISTS tiktok_gift_logs (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  username TEXT NOT NULL,
  unique_id TEXT NOT NULL,
  gift_id BIGINT NOT NULL,
  gift_name TEXT,
  gift_points BIGINT DEFAULT 0,
  gift_diamond_count BIGINT DEFAULT 0,
  repeat_count INT DEFAULT 1,
  total_points BIGINT DEFAULT 0,
  profile_picture_url TEXT,
  raw_data JSONB,
  received_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for TikTok gift logs
CREATE INDEX IF NOT EXISTS idx_tiktok_gift_logs_received_at ON tiktok_gift_logs(received_at DESC);
CREATE INDEX IF NOT EXISTS idx_tiktok_gift_logs_username ON tiktok_gift_logs(username);
CREATE INDEX IF NOT EXISTS idx_tiktok_gift_logs_unique_id ON tiktok_gift_logs(unique_id);

-- Trigger for tiktok_settings table
-- Automatically updates the updated_at timestamp
CREATE TRIGGER update_tiktok_settings_updated_at
  BEFORE UPDATE ON tiktok_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE tiktok_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE tiktok_gift_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for tiktok_settings
-- Allow all operations (adjust based on your security requirements)
CREATE POLICY "Allow all on tiktok_settings"
  ON tiktok_settings
  FOR ALL
  USING (true);

-- RLS Policies for tiktok_gift_logs
-- Allow all operations (adjust based on your security requirements)
CREATE POLICY "Allow all on tiktok_gift_logs"
  ON tiktok_gift_logs
  FOR ALL
  USING (true);

-- Optional: Public read access
-- Uncomment these if you want public read access to the data
-- CREATE POLICY "Public read access for tiktok_settings"
--   ON tiktok_settings
--   FOR SELECT
--   USING (true);

-- CREATE POLICY "Public read access for tiktok_gift_logs"
--   ON tiktok_gift_logs
--   FOR SELECT
--   USING (true);
