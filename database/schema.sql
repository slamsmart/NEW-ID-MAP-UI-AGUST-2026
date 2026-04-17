-- ============================================================
--  ID-MAP — Integrasi Data Mangrove Pesisir
--  Database Schema — Supabase PostgreSQL
--  Versi: 2025-04 FIXED
--
--  CARA PAKAI:
--  Supabase Dashboard → SQL Editor → New Query → paste semua → Run
--
--  CATATAN PENTING:
--  App ini pakai EmailJS OTP (bukan Supabase Auth), jadi
--  auth.uid() tidak tersedia. RLS menggunakan anon key
--  dengan service role bypass untuk operasi admin.
-- ============================================================

-- ─────────────────────────────────────────────────────────────
-- EXTENSIONS
-- ─────────────────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";


-- ─────────────────────────────────────────────────────────────
-- CLEANUP (jalankan hanya jika mau reset total)
-- Hapus komentar di bawah ini jika perlu reset dari awal
-- ─────────────────────────────────────────────────────────────
-- DROP TABLE IF EXISTS sync_queue       CASCADE;
-- DROP TABLE IF EXISTS otp_logs         CASCADE;
-- DROP TABLE IF EXISTS custom_nurseries CASCADE;
-- DROP TABLE IF EXISTS survey_photos    CASCADE;
-- DROP TABLE IF EXISTS surveys          CASCADE;
-- DROP TABLE IF EXISTS mangrove_locations CASCADE;
-- DROP TABLE IF EXISTS user_profiles    CASCADE;


-- ============================================================
-- 1. USER PROFILES
-- ============================================================
CREATE TABLE IF NOT EXISTS user_profiles (
  id          UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  nama        TEXT        NOT NULL,
  email       TEXT        NOT NULL UNIQUE,
  unit        TEXT        NOT NULL DEFAULT 'Pengguna Umum',
  provinsi    TEXT,
  role        TEXT        NOT NULL DEFAULT 'viewer'
                          CHECK (role IN ('admin_nasional', 'petugas_daerah', 'viewer')),
  is_active   BOOLEAN     NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- ============================================================
-- 2. MANGROVE LOCATIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS mangrove_locations (
  id          TEXT        PRIMARY KEY,
  name        TEXT        NOT NULL,
  province    TEXT        NOT NULL,
  district    TEXT        NOT NULL,
  lat         DOUBLE PRECISION NOT NULL,
  lng         DOUBLE PRECISION NOT NULL,
  area_ha     DOUBLE PRECISION NOT NULL DEFAULT 0,
  status      TEXT        NOT NULL DEFAULT 'sedang'
                          CHECK (status IN ('kritis', 'jarang', 'sedang', 'lebat')),
  kawasan     TEXT        NOT NULL DEFAULT 'apl'
                          CHECK (kawasan IN ('konservasi', 'hutan_lindung', 'apl')),
  last_survey DATE,
  is_custom   BOOLEAN     NOT NULL DEFAULT FALSE,
  created_by  TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- ============================================================
-- 3. SURVEYS  (5 tipe: monitoring | potensi_penanaman | abrasi | pendaratan_penyu | monitoring_vegetasi)
-- ============================================================
CREATE TABLE IF NOT EXISTS surveys (
  id                    TEXT        PRIMARY KEY,
  tujuan_survei         TEXT        NOT NULL
                                    CHECK (tujuan_survei IN ('monitoring','potensi_penanaman','abrasi','pendaratan_penyu','monitoring_vegetasi')),

  -- Identitas Petugas
  petugas_nama          TEXT        NOT NULL,
  petugas_nip           TEXT,
  petugas_unit          TEXT        NOT NULL DEFAULT '',
  tanggal               DATE        NOT NULL,

  -- Lokasi & GPS
  location_id           TEXT,
  location_name         TEXT        NOT NULL DEFAULT '',
  province              TEXT        NOT NULL DEFAULT '',
  kab_kota              TEXT,
  kecamatan             TEXT,
  koordinat_lat         DOUBLE PRECISION,
  koordinat_lng         DOUBLE PRECISION,
  gps_accuracy          DOUBLE PRECISION,
  google_maps_url       TEXT,

  -- Ekosistem (monitoring)
  metode_survei         TEXT,
  tutupan_tajuk         DOUBLE PRECISION,
  kerapatan_estimasi    DOUBLE PRECISION,
  spesies_dominan       TEXT,
  spesies_lain          TEXT,
  laju_regenerasi       TEXT,
  kondisi_serasah       TEXT,

  -- Parameter Lingkungan
  salinitas             DOUBLE PRECISION,
  ph                    DOUBLE PRECISION,
  suhu                  DOUBLE PRECISION,
  kekeruhan             DOUBLE PRECISION,
  substrat              TEXT,
  elevasi               DOUBLE PRECISION,
  pasang_surut          TEXT,

  -- Tekanan & Lahan
  ancaman_utama         TEXT[]      NOT NULL DEFAULT '{}',
  jarak_pemukiman       DOUBLE PRECISION,
  luas_tambak_estimasi  DOUBLE PRECISION,
  aktivitas_manusia     TEXT,
  status_tenurial       TEXT,

  -- Potensi Penanaman
  nama_area             TEXT,
  luasan_potensi        DOUBLE PRECISION,
  aksesibilitas         TEXT,
  pengaruh_pasang       TEXT,
  skor_potensi          DOUBLE PRECISION,

  -- Abrasi
  nama_pantai           TEXT,
  indikasi_abrasi       TEXT,
  kondisi_sebelum       TEXT,
  kondisi_sesudah       TEXT,
  tingkat_abrasi        TEXT,
  panjang_terdampak     DOUBLE PRECISION,
  luasan_terdampak      DOUBLE PRECISION,
  prioritas_abrasi      TEXT,

  -- Catatan
  kondisi_umum          TEXT,
  rekomendasi_lapangan  TEXT,

  -- Pendaratan Penyu (khusus tujuan_survei = 'pendaratan_penyu')
  jenis_penyu           TEXT,
  jumlah_sarang         INTEGER,
  status_perlindungan   TEXT,
  sarang_points         JSONB       NOT NULL DEFAULT '[]',

  -- Foto & Sync
  foto_dokumentasi      TEXT,
  photo_urls            TEXT[]      NOT NULL DEFAULT '{}',
  sync_status           TEXT        NOT NULL DEFAULT 'pending'
                                    CHECK (sync_status IN ('synced','pending','failed')),
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- ============================================================
-- 4. SURVEY PHOTOS
-- ============================================================
CREATE TABLE IF NOT EXISTS survey_photos (
  id          UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  survey_id   TEXT        NOT NULL REFERENCES surveys(id) ON DELETE CASCADE,
  url         TEXT        NOT NULL,
  cloud_id    TEXT,
  tag         TEXT        NOT NULL DEFAULT 'Kondisi Umum',
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- ============================================================
-- 5. CUSTOM NURSERIES (pembibitan tambahan oleh admin)
-- ============================================================
CREATE TABLE IF NOT EXISTS custom_nurseries (
  id               TEXT        PRIMARY KEY,
  nama             TEXT        NOT NULL,
  institusi        TEXT,
  sertifikat       TEXT        NOT NULL,
  kapasitas_bibit  INTEGER     NOT NULL DEFAULT 0,
  provinsi         TEXT        NOT NULL DEFAULT '',
  kab_kota         TEXT        NOT NULL DEFAULT '',
  lat              DOUBLE PRECISION NOT NULL,
  lng              DOUBLE PRECISION NOT NULL,
  catatan          TEXT,
  added_by         TEXT        NOT NULL,
  is_active        BOOLEAN     NOT NULL DEFAULT TRUE,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- ============================================================
-- 6. OTP LOGS  (audit trail EmailJS)
-- ============================================================
CREATE TABLE IF NOT EXISTS otp_logs (
  id          UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  email       TEXT        NOT NULL,
  type        TEXT        NOT NULL CHECK (type IN ('login','signup')),
  status      TEXT        NOT NULL CHECK (status IN ('sent','verified','expired','failed')),
  delivered   BOOLEAN     NOT NULL DEFAULT FALSE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  verified_at TIMESTAMPTZ
);


-- ============================================================
-- 7. SYNC QUEUE  (offline → online)
-- ============================================================
CREATE TABLE IF NOT EXISTS sync_queue (
  id           UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  record_type  TEXT        NOT NULL CHECK (record_type IN ('survey','location')),
  record_id    TEXT        NOT NULL,
  payload      JSONB       NOT NULL DEFAULT '{}',
  status       TEXT        NOT NULL DEFAULT 'pending'
                           CHECK (status IN ('pending','synced','failed')),
  attempts     INTEGER     NOT NULL DEFAULT 0,
  last_error   TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  synced_at    TIMESTAMPTZ
);


-- ============================================================
-- MIGRASI KOLOM (aman dijalankan ulang — IF NOT EXISTS)
-- Jalankan jika tabel surveys sudah ada dan perlu ditambah kolom baru
-- ============================================================
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='surveys' AND column_name='petugas_nip') THEN
    ALTER TABLE surveys ADD COLUMN petugas_nip TEXT;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='surveys' AND column_name='photo_urls') THEN
    ALTER TABLE surveys ADD COLUMN photo_urls TEXT[] NOT NULL DEFAULT '{}';
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='surveys' AND column_name='jenis_penyu') THEN
    ALTER TABLE surveys ADD COLUMN jenis_penyu TEXT;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='surveys' AND column_name='jumlah_sarang') THEN
    ALTER TABLE surveys ADD COLUMN jumlah_sarang INTEGER;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='surveys' AND column_name='status_perlindungan') THEN
    ALTER TABLE surveys ADD COLUMN status_perlindungan TEXT;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='surveys' AND column_name='sarang_points') THEN
    ALTER TABLE surveys ADD COLUMN sarang_points JSONB NOT NULL DEFAULT '[]';
  END IF;
END $$;

-- Update CHECK constraint untuk tujuan_survei (drop & recreate)
ALTER TABLE surveys DROP CONSTRAINT IF EXISTS surveys_tujuan_survei_check;
ALTER TABLE surveys ADD CONSTRAINT surveys_tujuan_survei_check
  CHECK (tujuan_survei IN ('monitoring','potensi_penanaman','abrasi','pendaratan_penyu','monitoring_vegetasi'));


-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_surveys_tujuan   ON surveys(tujuan_survei);
CREATE INDEX IF NOT EXISTS idx_surveys_province ON surveys(province);
CREATE INDEX IF NOT EXISTS idx_surveys_tanggal  ON surveys(tanggal DESC);
CREATE INDEX IF NOT EXISTS idx_surveys_location ON surveys(location_id);
CREATE INDEX IF NOT EXISTS idx_surveys_sync     ON surveys(sync_status);
CREATE INDEX IF NOT EXISTS idx_surveys_abrasi   ON surveys(prioritas_abrasi);
CREATE INDEX IF NOT EXISTS idx_surveys_potensi  ON surveys(skor_potensi DESC);

CREATE INDEX IF NOT EXISTS idx_locations_prov   ON mangrove_locations(province);
CREATE INDEX IF NOT EXISTS idx_locations_custom ON mangrove_locations(is_custom);

CREATE INDEX IF NOT EXISTS idx_photos_survey    ON survey_photos(survey_id);
CREATE INDEX IF NOT EXISTS idx_otp_email        ON otp_logs(email, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_sync_status      ON sync_queue(status);
CREATE INDEX IF NOT EXISTS idx_nurseries_active ON custom_nurseries(is_active);


-- ============================================================
-- TRIGGER: auto updated_at
-- ============================================================
CREATE OR REPLACE FUNCTION fn_set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_user_profiles_upd') THEN
    CREATE TRIGGER trg_user_profiles_upd
      BEFORE UPDATE ON user_profiles
      FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_locations_upd') THEN
    CREATE TRIGGER trg_locations_upd
      BEFORE UPDATE ON mangrove_locations
      FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_surveys_upd') THEN
    CREATE TRIGGER trg_surveys_upd
      BEFORE UPDATE ON surveys
      FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_nurseries_upd') THEN
    CREATE TRIGGER trg_nurseries_upd
      BEFORE UPDATE ON custom_nurseries
      FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();
  END IF;
END $$;


-- ============================================================
-- ROW LEVEL SECURITY
--
-- PENTING: App ini pakai EmailJS OTP (bukan Supabase Auth),
-- sehingga auth.uid() = NULL. Semua operasi dari app
-- menggunakan anon key. RLS dibuka untuk anon agar data
-- bisa masuk dari perangkat petugas.
--
-- Untuk keamanan produksi penuh: gunakan service_role key
-- di server-side API (bukan expose langsung di frontend).
-- ============================================================

ALTER TABLE user_profiles     ENABLE ROW LEVEL SECURITY;
ALTER TABLE mangrove_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE surveys            ENABLE ROW LEVEL SECURITY;
ALTER TABLE survey_photos      ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_nurseries   ENABLE ROW LEVEL SECURITY;
ALTER TABLE otp_logs           ENABLE ROW LEVEL SECURITY;
ALTER TABLE sync_queue         ENABLE ROW LEVEL SECURITY;

-- ── user_profiles ─────────────────────────────────────────────
DROP POLICY IF EXISTS "up_anon_select" ON user_profiles;
DROP POLICY IF EXISTS "up_anon_insert" ON user_profiles;
DROP POLICY IF EXISTS "up_anon_update" ON user_profiles;

CREATE POLICY "up_anon_select" ON user_profiles
  FOR SELECT TO anon, authenticated USING (TRUE);

CREATE POLICY "up_anon_insert" ON user_profiles
  FOR INSERT TO anon, authenticated WITH CHECK (TRUE);

CREATE POLICY "up_anon_update" ON user_profiles
  FOR UPDATE TO anon, authenticated USING (TRUE) WITH CHECK (TRUE);

-- ── mangrove_locations ────────────────────────────────────────
DROP POLICY IF EXISTS "loc_anon_select" ON mangrove_locations;
DROP POLICY IF EXISTS "loc_anon_insert" ON mangrove_locations;
DROP POLICY IF EXISTS "loc_anon_update" ON mangrove_locations;

CREATE POLICY "loc_anon_select" ON mangrove_locations
  FOR SELECT TO anon, authenticated USING (TRUE);

CREATE POLICY "loc_anon_insert" ON mangrove_locations
  FOR INSERT TO anon, authenticated WITH CHECK (TRUE);

CREATE POLICY "loc_anon_update" ON mangrove_locations
  FOR UPDATE TO anon, authenticated USING (TRUE) WITH CHECK (TRUE);

-- ── surveys ───────────────────────────────────────────────────
DROP POLICY IF EXISTS "srv_anon_select" ON surveys;
DROP POLICY IF EXISTS "srv_anon_insert" ON surveys;
DROP POLICY IF EXISTS "srv_anon_update" ON surveys;

CREATE POLICY "srv_anon_select" ON surveys
  FOR SELECT TO anon, authenticated USING (TRUE);

CREATE POLICY "srv_anon_insert" ON surveys
  FOR INSERT TO anon, authenticated WITH CHECK (TRUE);

CREATE POLICY "srv_anon_update" ON surveys
  FOR UPDATE TO anon, authenticated USING (TRUE) WITH CHECK (TRUE);

-- ── survey_photos ─────────────────────────────────────────────
DROP POLICY IF EXISTS "photo_anon_select" ON survey_photos;
DROP POLICY IF EXISTS "photo_anon_insert" ON survey_photos;

CREATE POLICY "photo_anon_select" ON survey_photos
  FOR SELECT TO anon, authenticated USING (TRUE);

CREATE POLICY "photo_anon_insert" ON survey_photos
  FOR INSERT TO anon, authenticated WITH CHECK (TRUE);

-- ── custom_nurseries ──────────────────────────────────────────
DROP POLICY IF EXISTS "nur_anon_select" ON custom_nurseries;
DROP POLICY IF EXISTS "nur_anon_insert" ON custom_nurseries;
DROP POLICY IF EXISTS "nur_anon_update" ON custom_nurseries;
DROP POLICY IF EXISTS "nur_anon_delete" ON custom_nurseries;

CREATE POLICY "nur_anon_select" ON custom_nurseries
  FOR SELECT TO anon, authenticated USING (TRUE);

CREATE POLICY "nur_anon_insert" ON custom_nurseries
  FOR INSERT TO anon, authenticated WITH CHECK (TRUE);

CREATE POLICY "nur_anon_update" ON custom_nurseries
  FOR UPDATE TO anon, authenticated USING (TRUE) WITH CHECK (TRUE);

CREATE POLICY "nur_anon_delete" ON custom_nurseries
  FOR DELETE TO anon, authenticated USING (TRUE);

-- ── otp_logs ─────────────────────────────────────────────────
DROP POLICY IF EXISTS "otp_anon_insert" ON otp_logs;
DROP POLICY IF EXISTS "otp_anon_select" ON otp_logs;

CREATE POLICY "otp_anon_insert" ON otp_logs
  FOR INSERT TO anon, authenticated WITH CHECK (TRUE);

CREATE POLICY "otp_anon_select" ON otp_logs
  FOR SELECT TO anon, authenticated USING (TRUE);

-- ── sync_queue ────────────────────────────────────────────────
DROP POLICY IF EXISTS "sync_anon_all" ON sync_queue;

CREATE POLICY "sync_anon_all" ON sync_queue
  FOR ALL TO anon, authenticated USING (TRUE) WITH CHECK (TRUE);


-- ============================================================
-- VIEWS
-- ============================================================

CREATE OR REPLACE VIEW v_survey_stats AS
SELECT
  province,
  tujuan_survei,
  COUNT(*)                  AS total_survei,
  AVG(tutupan_tajuk)        AS avg_tutupan_pct,
  AVG(salinitas)            AS avg_salinitas_ppt,
  AVG(skor_potensi)         AS avg_skor_potensi,
  SUM(luasan_potensi)       AS total_luasan_ha,
  SUM(panjang_terdampak)    AS total_panjang_abrasi_m,
  MAX(tanggal)              AS survei_terakhir
FROM surveys
GROUP BY province, tujuan_survei;

CREATE OR REPLACE VIEW v_abrasi_summary AS
SELECT
  province,
  prioritas_abrasi,
  COUNT(*)                  AS jumlah_titik,
  SUM(panjang_terdampak)    AS total_panjang_m,
  SUM(luasan_terdampak)     AS total_luasan_ha
FROM surveys
WHERE tujuan_survei = 'abrasi'
GROUP BY province, prioritas_abrasi;

CREATE OR REPLACE VIEW v_top_potensi AS
SELECT
  id,
  location_name,
  province,
  kab_kota,
  substrat,
  salinitas,
  tutupan_tajuk,
  skor_potensi,
  luasan_potensi,
  koordinat_lat,
  koordinat_lng,
  google_maps_url,
  petugas_nama,
  tanggal
FROM surveys
WHERE tujuan_survei = 'potensi_penanaman'
  AND skor_potensi IS NOT NULL
ORDER BY skor_potensi DESC
LIMIT 50;

CREATE OR REPLACE VIEW v_dashboard_kpi AS
SELECT
  (SELECT COUNT(*) FROM surveys)                                            AS total_surveys,
  (SELECT COUNT(*) FROM surveys WHERE tujuan_survei = 'monitoring')         AS total_monitoring,
  (SELECT COUNT(*) FROM surveys WHERE tujuan_survei = 'potensi_penanaman')  AS total_potensi,
  (SELECT COUNT(*) FROM surveys WHERE tujuan_survei = 'abrasi')             AS total_abrasi,
  (SELECT COUNT(*) FROM surveys WHERE prioritas_abrasi = 'Tinggi')          AS abrasi_prioritas_tinggi,
  (SELECT COUNT(*) FROM surveys WHERE tanggal = CURRENT_DATE)               AS survei_hari_ini,
  (SELECT COUNT(*) FROM mangrove_locations WHERE is_custom = TRUE)          AS custom_locations,
  (SELECT COUNT(*) FROM user_profiles WHERE is_active = TRUE)               AS active_users,
  (SELECT COUNT(*) FROM custom_nurseries WHERE is_active = TRUE)            AS nursery_tambahan,
  (SELECT COUNT(*) FROM surveys WHERE sync_status = 'pending')              AS pending_sync;


-- ============================================================
-- SEED DATA
-- ============================================================
INSERT INTO user_profiles (nama, email, unit, role)
VALUES
  ('Admin Nasional ID-MAP',    'id.map.admin@gmail.com',    'Tim Integrasi Data Mangrove Pesisir', 'admin_nasional'),
  ('Slamet Abdullah, S.Pi',    'slamet.abdullah@gmail.com', 'Koordinator Survei Wilayah Jawa Timur', 'petugas_daerah')
ON CONFLICT (email) DO UPDATE SET
  nama     = EXCLUDED.nama,
  unit     = EXCLUDED.unit,
  role     = EXCLUDED.role,
  updated_at = NOW();


-- ============================================================
-- SELESAI — verifikasi dengan query berikut:
-- SELECT table_name FROM information_schema.tables
-- WHERE table_schema = 'public' ORDER BY table_name;
-- ============================================================
