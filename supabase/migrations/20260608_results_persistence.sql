-- Migration: Add result_id and results_data to analyses table
-- Run in Supabase dashboard: SQL Editor → New query → paste → Run

-- Add result_id (UUID) for deep-linking to individual results
ALTER TABLE analyses
  ADD COLUMN IF NOT EXISTS result_id UUID DEFAULT gen_random_uuid();

-- Add results_data (JSONB) to store the full analysis output
ALTER TABLE analyses
  ADD COLUMN IF NOT EXISTS results_data JSONB;

-- Unique index so we can efficiently look up by result_id
CREATE UNIQUE INDEX IF NOT EXISTS analyses_result_id_idx
  ON analyses (result_id);
