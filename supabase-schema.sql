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

-- Create wedding_details table to persist configurations in production
CREATE TABLE IF NOT EXISTS wedding_details (
  id              INT PRIMARY KEY DEFAULT 1,
  bride_name      TEXT NOT NULL,
  groom_name      TEXT NOT NULL,
  date            TEXT NOT NULL,
  time            TEXT NOT NULL,
  iso_date        TEXT NOT NULL,
  venue           TEXT NOT NULL,
  city            TEXT NOT NULL,
  address         TEXT NOT NULL,
  google_maps_url TEXT,
  registry_url    TEXT,
  CONSTRAINT one_row CHECK (id = 1)
);

-- Seed default wedding configurations
INSERT INTO wedding_details (
  id, bride_name, groom_name, date, time, iso_date, venue, city, address, google_maps_url, registry_url
) VALUES (
  1,
  'Oshidhie',
  'Kaveen',
  'Saturday, September 19, 2026',
  '4:00 PM',
  '2026-09-19T16:00:00',
  'Grand Monarch',
  'Colombo, Sri Lanka',
  '123 Galle Road, Colombo 03',
  'https://maps.google.com',
  'https://weddingregistry.com'
) ON CONFLICT (id) DO NOTHING;

ALTER TABLE wedding_details ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access to wedding_details" ON wedding_details FOR SELECT USING (true);
CREATE POLICY "Allow admin write access to wedding_details" ON wedding_details FOR ALL USING (true);
