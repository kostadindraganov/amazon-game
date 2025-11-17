-- Casino Wheel Game Database Schema
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Products Table
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  price NUMERIC NOT NULL CHECK (price >= 0),
  image_url TEXT NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'won')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  won_at TIMESTAMP WITH TIME ZONE
);

-- Create index for faster queries
CREATE INDEX idx_products_status ON products(status);
CREATE INDEX idx_products_created_at ON products(created_at DESC);

-- Settings Table
CREATE TABLE IF NOT EXISTS settings (
  id INT PRIMARY KEY DEFAULT 1,
  slider_item_count INT DEFAULT 100 CHECK (slider_item_count > 0),
  spin_count_to_win INT DEFAULT 100 CHECK (spin_count_to_win > 0),
  min_points_for_play INT DEFAULT 300 CHECK (min_points_for_play > 0),
  headline_text TEXT DEFAULT 'Играй за тези награди',
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT single_row CHECK (id = 1)
);

-- Insert default settings
INSERT INTO settings (id) VALUES (1)
ON CONFLICT (id) DO NOTHING;

-- Spin State Table
CREATE TABLE IF NOT EXISTS spin_state (
  id INT PRIMARY KEY DEFAULT 1,
  current_spin_count INT DEFAULT 0,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT single_row_spin CHECK (id = 1)
);

-- Insert default spin state
INSERT INTO spin_state (id) VALUES (1)
ON CONFLICT (id) DO NOTHING;

-- Winners Table
CREATE TABLE IF NOT EXISTS winners (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  username TEXT NOT NULL,
  product_id uuid REFERENCES products(id) ON DELETE SET NULL,
  product_title TEXT NOT NULL,
  product_price NUMERIC NOT NULL,
  product_image_url TEXT NOT NULL,
  won_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for winners
CREATE INDEX idx_winners_won_at ON winners(won_at DESC);
CREATE INDEX idx_winners_username ON winners(username);

-- Game Queue Table
CREATE TABLE IF NOT EXISTS game_queue (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  username TEXT NOT NULL,
  plays INT DEFAULT 1 CHECK (plays > 0),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'done')),
  processed_at TIMESTAMP WITH TIME ZONE
);

-- Create indexes for queue
CREATE INDEX idx_queue_status ON game_queue(status, created_at);

-- Insert Sample Products
INSERT INTO products (title, price, image_url, status) VALUES
('iPhone 15 Pro', 1600, 'https://images.unsplash.com/photo-1696446702326-35e833f8f0be?w=400', 'active'),
('PlayStation 5', 900, 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=400', 'active'),
('AirPods Pro 2', 350, 'https://images.unsplash.com/photo-1606841837239-c5a1a4a07af7?w=400', 'active'),
('MacBook Air M2', 1800, 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400', 'active'),
('Apple Watch Ultra', 1200, 'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=400', 'active'),
('iPad Pro 12.9"', 1500, 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400', 'active'),
('Sony WH-1000XM5', 450, 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=400', 'active'),
('Nintendo Switch OLED', 500, 'https://images.unsplash.com/photo-1578303512597-81e6cc155b3e?w=400', 'active'),
('Samsung Galaxy S24', 1300, 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=400', 'active'),
('DJI Mini 3 Pro', 900, 'https://images.unsplash.com/photo-1473968512647-3e447244af8f?w=400', 'active'),
('GoPro Hero 12', 600, 'https://images.unsplash.com/photo-1606041008023-472dfb5e530f?w=400', 'active'),
('Bose QuietComfort', 400, 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=400', 'active'),
('Meta Quest 3', 700, 'https://images.unsplash.com/photo-1622979135225-d2ba269cf1ac?w=400', 'active'),
('Kindle Paperwhite', 200, 'https://images.unsplash.com/photo-1592496001020-d31bd830651f?w=400', 'active'),
('Logitech MX Master 3S', 150, 'https://images.unsplash.com/photo-1527814050087-3793815479db?w=400', 'active'),
('Apple Magic Keyboard', 250, 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=400', 'active'),
('JBL Flip 6', 180, 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400', 'active'),
('Dyson V15 Detect', 850, 'https://images.unsplash.com/photo-1558317374-067fb5f30001?w=400', 'active'),
('Nespresso Vertuo', 300, 'https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=400', 'active'),
('Philips Hue Starter Kit', 220, 'https://images.unsplash.com/photo-1558089687-f282ffcbc126?w=400', 'active')
ON CONFLICT DO NOTHING;

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for settings table
CREATE TRIGGER update_settings_updated_at BEFORE UPDATE ON settings
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to increment spin count
CREATE OR REPLACE FUNCTION increment_spin_count()
RETURNS INT AS $$
DECLARE
  new_count INT;
BEGIN
  UPDATE spin_state
  SET current_spin_count = current_spin_count + 1,
      last_updated = NOW()
  WHERE id = 1
  RETURNING current_spin_count INTO new_count;

  RETURN new_count;
END;
$$ LANGUAGE plpgsql;

-- Function to reset spin count
CREATE OR REPLACE FUNCTION reset_spin_count()
RETURNS VOID AS $$
BEGIN
  UPDATE spin_state
  SET current_spin_count = 0,
      last_updated = NOW()
  WHERE id = 1;
END;
$$ LANGUAGE plpgsql;

-- TikTok Settings Table
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
CREATE INDEX idx_tiktok_gift_logs_received_at ON tiktok_gift_logs(received_at DESC);
CREATE INDEX idx_tiktok_gift_logs_username ON tiktok_gift_logs(username);
CREATE INDEX idx_tiktok_gift_logs_unique_id ON tiktok_gift_logs(unique_id);

-- Trigger for tiktok_settings table
CREATE TRIGGER update_tiktok_settings_updated_at BEFORE UPDATE ON tiktok_settings
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (Optional - configure based on your needs)
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE spin_state ENABLE ROW LEVEL SECURITY;
ALTER TABLE winners ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE tiktok_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE tiktok_gift_logs ENABLE ROW LEVEL SECURITY;

-- Public read access for products and settings
CREATE POLICY "Public read access for products" ON products FOR SELECT USING (true);
CREATE POLICY "Public read access for settings" ON settings FOR SELECT USING (true);
CREATE POLICY "Public read access for winners" ON winners FOR SELECT USING (true);

-- You can add more restrictive policies for INSERT/UPDATE/DELETE based on authentication
-- For now, allowing all operations (adjust based on your security requirements)
CREATE POLICY "Allow all on products" ON products FOR ALL USING (true);
CREATE POLICY "Allow all on settings" ON settings FOR ALL USING (true);
CREATE POLICY "Allow all on spin_state" ON spin_state FOR ALL USING (true);
CREATE POLICY "Allow all on winners" ON winners FOR ALL USING (true);
CREATE POLICY "Allow all on game_queue" ON game_queue FOR ALL USING (true);
CREATE POLICY "Allow all on tiktok_settings" ON tiktok_settings FOR ALL USING (true);
CREATE POLICY "Allow all on tiktok_gift_logs" ON tiktok_gift_logs FOR ALL USING (true);
