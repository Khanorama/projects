-- Run this in the Supabase SQL editor (Database > SQL Editor > New query)
-- It creates the plant_scans history table and adds image support to community posts.

-- plant_scans
CREATE TABLE IF NOT EXISTS plant_scans (
  id              UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id         UUID        REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  image_url       TEXT,
  plant_name      TEXT        NOT NULL DEFAULT 'Unknown Plant',
  scientific_name TEXT        NOT NULL DEFAULT 'Unknown',
  plant_family    TEXT        NOT NULL DEFAULT 'Unknown',
  confidence      FLOAT       NOT NULL DEFAULT 0,
  is_healthy      BOOLEAN     NOT NULL DEFAULT TRUE,
  diseases        JSONB       NOT NULL DEFAULT '[]'::jsonb,
  created_at      TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- If the table already exists, add the column without recreating it:
ALTER TABLE plant_scans ADD COLUMN IF NOT EXISTS scientific_name TEXT NOT NULL DEFAULT 'Unknown';

-- Row-Level Security: each user only sees/writes their own scans
ALTER TABLE plant_scans ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users read own scans"   ON plant_scans;
DROP POLICY IF EXISTS "Users insert own scans" ON plant_scans;
DROP POLICY IF EXISTS "Users delete own scans" ON plant_scans;

CREATE POLICY "Users read own scans"
  ON plant_scans FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users insert own scans"
  ON plant_scans FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users delete own scans"
  ON plant_scans FOR DELETE
  USING (auth.uid() = user_id);

-- posts: add an image_url column
ALTER TABLE posts
  ADD COLUMN IF NOT EXISTS image_url TEXT;
