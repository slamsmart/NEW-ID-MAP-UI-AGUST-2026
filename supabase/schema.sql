-- ============================================================
-- ID-MAP — Supabase Schema
-- Jalankan di: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─────────────────────────────────────────────────────────────
-- TABLE: user_profiles
-- Data profil pengguna yang mendaftar via Sign Up (email OTP)
-- Terhubung ke Supabase Auth (auth.users) via id
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS user_profiles (
  id           UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nama         TEXT NOT NULL,
  email        TEXT NOT NULL UNIQUE,
  unit         TEXT DEFAULT 'Pengguna Umum',
  provinsi     TEXT,
  role         TEXT DEFAULT 'viewer' CHECK (role IN ('admin_nasional', 'petugas_daerah', 'viewer')),
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- User hanya bisa baca & edit profil sendiri
CREATE POLICY "profiles_select_own" ON user_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "profiles_insert_own" ON user_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_update_own" ON user_profiles
  FOR UPDATE USING (auth.uid() = id);

-- Admin bisa lihat semua profil (untuk manajemen user)
CREATE POLICY "profiles_admin_read" ON user_profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = 'admin_nasional'
    )
  );

-- Trigger: update timestamp otomatis
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ─────────────────────────────────────────────────────────────
-- TABLE: locations
-- Lokasi mangrove — gabungan data resmi + lokasi baru dari petugas
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS locations (
  id            TEXT PRIMARY KEY,
  name          TEXT NOT NULL,
  province      TEXT NOT NULL,
  district      TEXT NOT NULL,
  lat           DOUBLE PRECISION NOT NULL,
  lng           DOUBLE PRECISION NOT NULL,
  area_ha       NUMERIC DEFAULT 0,
  status        TEXT CHECK (status IN ('kritis', 'jarang', 'sedang', 'lebat')) DEFAULT 'sedang',
  kawasan       TEXT CHECK (kawasan IN ('konservasi', 'hutan_lindung', 'apl')) DEFAULT 'apl',
  last_survey   DATE,
  is_custom     BOOLEAN DEFAULT FALSE,
  created_by    TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE locations ENABLE ROW LEVEL SECURITY;

-- Baca: semua orang (termasuk viewer & anon)
CREATE POLICY "locations_read_all" ON locations FOR SELECT USING (TRUE);

-- Insert: user yang sudah login (anon juga boleh untuk offline sync)
CREATE POLICY "locations_insert_anon" ON locations FOR INSERT WITH CHECK (TRUE);

-- ─────────────────────────────────────────────────────────────
-- TABLE: surveys
-- Data survei lapangan EcoTrack dari petugas DKP
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS surveys (
  id                    TEXT PRIMARY KEY,
  created_at            TIMESTAMPTZ DEFAULT NOW(),

  -- Identitas
  petugas_nama          TEXT NOT NULL,
  petugas_nip           TEXT,
  petugas_unit          TEXT,

  -- Lokasi
  location_id           TEXT REFERENCES locations(id),
  location_name         TEXT NOT NULL,
  province              TEXT,
  tanggal               DATE,
  metode_survei         TEXT,
  koordinat_lat         DOUBLE PRECISION,
  koordinat_lng         DOUBLE PRECISION,
  gps_accuracy          NUMERIC,

  -- Ekosistem
  tutupan_tajuk         NUMERIC,
  kerapatan_estimasi    NUMERIC,
  spesies_dominan       TEXT,
  spesies_lain          TEXT,
  laju_regenerasi       TEXT,
  kondisi_serasah       TEXT,

  -- Lingkungan
  salinitas             NUMERIC,
  ph                    NUMERIC,
  suhu                  NUMERIC,
  kekeruhan             NUMERIC,
  substrat              TEXT,
  elevasi               NUMERIC,
  pasang_surut          TEXT,

  -- Tekanan
  ancaman_utama         TEXT[] DEFAULT '{}',
  jarak_pemukiman       NUMERIC,
  luas_tambak_estimasi  NUMERIC,
  aktivitas_manusia     TEXT,
  status_tenurial       TEXT,

  -- Catatan & media
  kondisi_umum          TEXT,
  rekomendasi_lapangan  TEXT,
  photo_urls            TEXT[] DEFAULT '{}',

  -- Sync
  sync_status           TEXT DEFAULT 'synced' CHECK (sync_status IN ('synced', 'pending'))
);

ALTER TABLE surveys ENABLE ROW LEVEL SECURITY;

-- Baca: semua
CREATE POLICY "surveys_read_all" ON surveys FOR SELECT USING (TRUE);

-- Insert & update: semua (termasuk offline sync via anon key)
CREATE POLICY "surveys_insert_anon" ON surveys FOR INSERT WITH CHECK (TRUE);
CREATE POLICY "surveys_update_sync" ON surveys FOR UPDATE USING (TRUE) WITH CHECK (TRUE);

-- ─────────────────────────────────────────────────────────────
-- SEED DATA: 10 lokasi mangrove resmi
-- ─────────────────────────────────────────────────────────────
INSERT INTO locations (id, name, province, district, lat, lng, area_ha, status, kawasan, last_survey, is_custom) VALUES
  ('LOC-001', 'Taman Nasional Baluran',    'Jawa Timur',        'Situbondo',          -7.84,  114.41, 1240, 'lebat',  'konservasi',    '2025-02-18', FALSE),
  ('LOC-002', 'Segara Anakan Cilacap',     'Jawa Tengah',       'Cilacap',            -7.71,  108.82,  895, 'sedang', 'hutan_lindung', '2025-01-14', FALSE),
  ('LOC-003', 'Teluk Bintuni',             'Papua Barat',       'Bintuni',            -2.12,  133.52, 4900, 'lebat',  'konservasi',    '2025-03-05', FALSE),
  ('LOC-004', 'Pantai Timur Sumatera',     'Sumatera Utara',    'Langkat',             3.82,   98.47,  620, 'kritis', 'apl',           '2025-03-20', FALSE),
  ('LOC-005', 'Muara Sungai Mahakam',      'Kalimantan Timur',  'Kutai Kartanegara',  -0.44,  117.18, 2300, 'sedang', 'hutan_lindung', '2025-02-28', FALSE),
  ('LOC-006', 'Taman Nasional Kutai',      'Kalimantan Timur',  'Kutai Timur',         0.55,  117.88, 3800, 'lebat',  'konservasi',    '2025-01-30', FALSE),
  ('LOC-007', 'Pesisir Raja Ampat',        'Papua Barat',       'Raja Ampat',         -0.23,  130.52,  580, 'lebat',  'konservasi',    '2025-03-12', FALSE),
  ('LOC-008', 'Pantai Selatan Kalimantan', 'Kalimantan Selatan','Tanah Bumbu',        -3.67,  115.72,  740, 'jarang', 'apl',           '2025-02-05', FALSE),
  ('LOC-009', 'Teluk Palu',               'Sulawesi Tengah',   'Kota Palu',          -0.87,  119.87,  210, 'kritis', 'apl',           '2025-01-22', FALSE),
  ('LOC-010', 'Pesisir Barat Lombok',      'Nusa Tenggara Barat','Lombok Barat',      -8.62,  116.08,  180, 'jarang', 'hutan_lindung', '2025-03-08', FALSE)
ON CONFLICT (id) DO NOTHING;

-- ─────────────────────────────────────────────────────────────
-- VIEW: survey_stats
-- ─────────────────────────────────────────────────────────────
CREATE OR REPLACE VIEW survey_stats AS
SELECT
  COUNT(*)                                                    AS total_surveys,
  COUNT(*) FILTER (WHERE tanggal = CURRENT_DATE)             AS today_surveys,
  COUNT(DISTINCT location_id)                                AS unique_locations,
  COUNT(DISTINCT province)                                   AS unique_provinces,
  ROUND(AVG(tutupan_tajuk), 1)                              AS avg_tutupan,
  MAX(created_at)                                            AS last_survey_at,
  COUNT(*) FILTER (WHERE sync_status = 'pending')           AS pending_sync
FROM surveys;

-- ─────────────────────────────────────────────────────────────
-- INDEX untuk performa query
-- ─────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_surveys_location    ON surveys(location_id);
CREATE INDEX IF NOT EXISTS idx_surveys_province    ON surveys(province);
CREATE INDEX IF NOT EXISTS idx_surveys_tanggal     ON surveys(tanggal DESC);
CREATE INDEX IF NOT EXISTS idx_surveys_created_at  ON surveys(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_locations_province  ON locations(province);
CREATE INDEX IF NOT EXISTS idx_locations_is_custom ON locations(is_custom);
CREATE INDEX IF NOT EXISTS idx_profiles_email      ON user_profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_role       ON user_profiles(role);

-- ─────────────────────────────────────────────────────────────
-- REALTIME: aktifkan di Supabase Dashboard →
--   Database → Replication → aktifkan tabel:
--   ✅ surveys
--   ✅ locations
--   ✅ user_profiles
-- ─────────────────────────────────────────────────────────────
