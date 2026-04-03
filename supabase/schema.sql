-- Users
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nickname TEXT NOT NULL UNIQUE,
  character_type TEXT NOT NULL,
  frame_color TEXT NOT NULL,
  room_style TEXT NOT NULL DEFAULT 'oneroom',
  last_poop_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Poops
CREATE TABLE IF NOT EXISTS poops (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  house_owner_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  depositor_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  deposited_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  is_cleaned BOOLEAN DEFAULT FALSE NOT NULL
);

-- Disable RLS for simplicity (no auth)
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE poops DISABLE ROW LEVEL SECURITY;

-- Index for fetching a house's poops quickly
CREATE INDEX IF NOT EXISTS poops_house_owner_idx ON poops(house_owner_id) WHERE is_cleaned = FALSE;

-- Notes
CREATE TABLE IF NOT EXISTS notes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  house_owner_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  sender_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  sender_nickname TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE notes DISABLE ROW LEVEL SECURITY;

-- Enable realtime on all tables
ALTER PUBLICATION supabase_realtime ADD TABLE users;
ALTER PUBLICATION supabase_realtime ADD TABLE poops;
ALTER PUBLICATION supabase_realtime ADD TABLE notes;
