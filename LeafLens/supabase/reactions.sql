-- Run in Supabase SQL Editor after plant_scans.sql
-- Creates the post_reactions table (one reaction per user per post).

CREATE TABLE IF NOT EXISTS post_reactions (
  id          UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id     UUID        REFERENCES posts(id) ON DELETE CASCADE NOT NULL,
  user_id     UUID        REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  reaction    TEXT        NOT NULL
                          CHECK (reaction IN ('like','love','sprout','fire','wow')),
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (post_id, user_id)   -- one reaction per user per post
);

ALTER TABLE post_reactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read reactions"   ON post_reactions;
DROP POLICY IF EXISTS "Users insert own reactions" ON post_reactions;
DROP POLICY IF EXISTS "Users update own reactions" ON post_reactions;
DROP POLICY IF EXISTS "Users delete own reactions" ON post_reactions;

CREATE POLICY "Anyone can read reactions"
  ON post_reactions FOR SELECT USING (true);

CREATE POLICY "Users insert own reactions"
  ON post_reactions FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own reactions"
  ON post_reactions FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users delete own reactions"
  ON post_reactions FOR DELETE USING (auth.uid() = user_id);
