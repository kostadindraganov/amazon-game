-- Migration: Add index for product-specific win lookups
-- Date: 2025-11-19
-- Purpose: Optimize queries that check for products with specific win_at_spin_count values

-- Add composite index for fast product-specific win lookups
-- This index helps the query: SELECT * FROM products WHERE status = 'active' AND win_at_spin_count = ?
CREATE INDEX IF NOT EXISTS idx_products_status_win_at_spin_count 
ON products(status, win_at_spin_count) 
WHERE win_at_spin_count IS NOT NULL;

-- Add comment to document the index purpose
COMMENT ON INDEX idx_products_status_win_at_spin_count IS 
'Optimizes product-specific win lookups during spin API calls. Used to find products configured to win at specific spin counts.';
