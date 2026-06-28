-- Supabase Schema for Digital Wedding Invitation Manager

-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,          -- e.g. "Family", "Friends", "Work"
  colour      TEXT NOT NULL,          -- hex colour for UI label, e.g. "#FF5733"
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security (RLS) or add default policies
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access to categories" ON categories FOR SELECT USING (true);
CREATE POLICY "Allow admin write access to categories" ON categories FOR ALL USING (true); -- In prod, restrict to authenticated users

-- Create guests table
CREATE TABLE IF NOT EXISTS guests (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name           TEXT NOT NULL,
  phone          TEXT,                -- with country code, e.g. +94771234567
  email          TEXT,
  side           TEXT CHECK (side IN ('bride', 'groom')),
  category_id    UUID REFERENCES categories(id) ON DELETE SET NULL,
  invite_token   UUID UNIQUE DEFAULT gen_random_uuid(),  -- used in invite URL
  notes          TEXT,
  created_at     TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE guests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access to guests" ON guests FOR SELECT USING (true);
CREATE POLICY "Allow admin write access to guests" ON guests FOR ALL USING (true); -- In prod, restrict to authenticated users

-- Create rsvps table
CREATE TABLE IF NOT EXISTS rsvps (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  guest_id        UUID UNIQUE REFERENCES guests(id) ON DELETE CASCADE,
  status          TEXT CHECK (status IN ('attending', 'declined', 'pending')) DEFAULT 'pending',
  plus_one        BOOLEAN DEFAULT FALSE,
  plus_one_name   TEXT,
  meal_choice     TEXT,              -- e.g. "veg", "non-veg", "vegan"
  dietary_notes   TEXT,
  message         TEXT,              -- personal note from guest
  responded_at    TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE rsvps ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read/write to rsvps" ON rsvps FOR ALL USING (true);

-- Create invite_links table
CREATE TABLE IF NOT EXISTS invite_links (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  guest_id    UUID REFERENCES guests(id) ON DELETE CASCADE,
  short_code  TEXT UNIQUE NOT NULL,  -- used in short URL
  channel     TEXT DEFAULT 'whatsapp',
  sent_at     TIMESTAMPTZ,
  opened_at   TIMESTAMPTZ            -- set on first page load
);

ALTER TABLE invite_links ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public access to invite_links" ON invite_links FOR ALL USING (true);
