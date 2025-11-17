-- Add win_at_spin_count column to products table
-- This migration adds the ability to specify at which spin count a product should be awarded

ALTER TABLE products
ADD COLUMN IF NOT EXISTS win_at_spin_count INT CHECK (win_at_spin_count > 0);

-- Add a comment to document the column
COMMENT ON COLUMN products.win_at_spin_count IS 'Specific spin count at which this product will be awarded (optional)';
