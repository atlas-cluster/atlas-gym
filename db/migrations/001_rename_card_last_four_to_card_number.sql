-- Migration: Rename card_last_four to card_number and increase size
-- This migration updates the payment_methods table to store full credit card numbers

BEGIN;

-- Rename the column and change its type
ALTER TABLE gym_manager.payment_methods 
  RENAME COLUMN card_last_four TO card_number;

-- Increase the column size to hold full card numbers (up to 19 digits)
ALTER TABLE gym_manager.payment_methods 
  ALTER COLUMN card_number TYPE VARCHAR(19);

COMMIT;
