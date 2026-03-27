-- V7: Add discount fields to promotions table
ALTER TABLE promotions 
ADD COLUMN discount_type VARCHAR(50),
ADD COLUMN discount_value DOUBLE PRECISION;

-- Update existing records if necessary (optional - usually for migrations)
-- UPDATE promotions SET discount_type = 'FIXED', discount_value = 0 WHERE discount_type IS NULL;
