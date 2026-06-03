-- Migration: Enable Row Level Security on the analyses table
-- Run this in the Supabase dashboard: SQL Editor → New query → paste → Run

-- Step 1: Enable RLS on the table.
-- This immediately blocks all access from the anon and authenticated roles
-- via the public API, while the service_role key continues to work
-- unaffected (it bypasses RLS at the Postgres level by design).
ALTER TABLE analyses ENABLE ROW LEVEL SECURITY;

-- Step 2: Explicit full-access policy for the service_role.
-- service_role already bypasses RLS by default in Supabase, but this
-- policy documents intent and satisfies stricter security scanners.
CREATE POLICY "service_role_full_access"
  ON analyses
  AS PERMISSIVE
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
