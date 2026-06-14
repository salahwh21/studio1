-- Migration: 011
-- Description: Add ui_preferences JSONB column to users table for storing per-user UI state

ALTER TABLE users ADD COLUMN IF NOT EXISTS ui_preferences JSONB DEFAULT '{}';
