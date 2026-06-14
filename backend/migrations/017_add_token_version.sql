-- Migration: 017 Add token_version to users
-- Used to invalidate all existing tokens when password changes

ALTER TABLE users ADD COLUMN IF NOT EXISTS token_version INTEGER NOT NULL DEFAULT 1;
