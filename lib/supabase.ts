import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Server-side client with service role (for admin operations)
export const supabaseAdmin = createClient(
  supabaseUrl,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

// Database types
export interface Product {
  id: string;
  title: string;
  price: number;
  image_url: string;
  win_at_spin_count?: number;
  status: 'active' | 'won';
  created_at: string;
  won_at?: string;
}

export interface Settings {
  id: number;
  slider_item_count: number;
  spin_count_to_win: number;
  min_points_for_play: number;
  headline_text: string;
  updated_at: string;
}

export interface SpinState {
  id: number;
  current_spin_count: number;
  last_updated: string;
}

export interface Winner {
  id: string;
  username: string;
  product_id: string | null;
  product_title: string;
  product_price: number;
  product_image_url: string;
  won_at: string;
}

export interface GameQueue {
  id: number;
  username: string;
  plays: number;
  created_at: string;
  status: 'pending' | 'processing' | 'done';
  processed_at?: string;
}

export interface SliderItem extends Product {
  type?: 'product' | 'filler';
}

export interface TikTokSettings {
  id: number;
  username: string | null;
  is_connected: boolean;
  connection_status: 'disconnected' | 'connecting' | 'connected' | 'error';
  error_message: string | null;
  room_id: string | null;
  last_connected_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface TikTokGiftLog {
  id: string;
  username: string;
  unique_id: string;
  gift_id: number;
  gift_name: string | null;
  gift_points: number;
  gift_diamond_count: number;
  repeat_count: number;
  total_points: number;
  profile_picture_url: string | null;
  raw_data: any;
  received_at: string;
}
