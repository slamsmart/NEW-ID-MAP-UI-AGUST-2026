-- ============================================================
-- ID-MAP — Setup Autentikasi Email + Sign Up
-- Jalankan di: Supabase Dashboard → SQL Editor → New Query
-- Project: bglddttfivmvnyosbidj
-- ============================================================

-- ─────────────────────────────────────────────────────────────
-- 1. TABEL USER PROFILES
--    Terhubung ke auth.users (Supabase Auth)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id           UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nama         TEXT NOT NULL,
  email        TEXT NOT NULL,
  unit         TEXT NOT NULL DEFAULT 'Pengguna Umum',
  provinsi     TEXT,
  role         TEXT NOT NULL DEFAULT 'viewer'
                 CHECK (role IN ('admin_nasional', 'petugas_daerah', 'viewer')),
  is_verified  BOOLEAN DEFAULT FALSE,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────────────────────
-- 2. ROW LEVEL SECURITY
-- ─────────────────────────────────────────────────────────────
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Hapus policy lama jika ada (agar bisa re-run)
DROP POLICY IF EXISTS "profiles_select_own"   ON public.user_profiles;
DROP POLICY IF EXISTS "profiles_insert_own"   ON public.user_profiles;
DROP POLICY IF EXISTS "profiles_update_own"   ON public.user_profiles;
DROP POLICY IF EXISTS "profiles_admin_all"    ON public.user_profiles;

-- User bisa baca profil sendiri
CREATE POLICY "profiles_select_own" ON public.user_profiles
  FOR SELECT USING (auth.uid() = id);

-- User bisa insert profil sendiri (saat pertama sign up)
CREATE POLICY "profiles_insert_own" ON public.user_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- User bisa update profil sendiri
CREATE POLICY "profiles_update_own" ON public.user_profiles
  FOR UPDATE USING (auth.uid() = id);

-- Admin nasional bisa baca semua profil
CREATE POLICY "profiles_admin_all" ON public.user_profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin_nasional'
    )
  );

-- ─────────────────────────────────────────────────────────────
-- 3. TRIGGER: auto-update updated_at
-- ─────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_profiles_updated_at ON public.user_profiles;
CREATE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ─────────────────────────────────────────────────────────────
-- 4. TRIGGER: auto-create profil saat user baru verify OTP
--    Dipanggil otomatis setelah auth.users insert
-- ─────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  -- Ambil data dari raw_user_meta_data (dikirim saat signUp)
  INSERT INTO public.user_profiles (id, nama, email, unit, provinsi, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'nama', split_part(NEW.email, '@', 1)),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'unit', 'Pengguna Umum'),
    NULLIF(NEW.raw_user_meta_data->>'provinsi', ''),
    'viewer'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_new_user_profile ON auth.users;
CREATE TRIGGER trg_new_user_profile
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ─────────────────────────────────────────────────────────────
-- 5. INDEX untuk performa
-- ─────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_profiles_email  ON public.user_profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_role   ON public.user_profiles(role);

-- ─────────────────────────────────────────────────────────────
-- 6. PASTIKAN tabel locations & surveys sudah ada
--    (Skip jika sudah dijalankan sebelumnya)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.locations (
  id            TEXT PRIMARY KEY,
  name          TEXT NOT NULL,
  province      TEXT NOT NULL,
  district      TEXT NOT NULL,
  lat           DOUBLE PRECISION NOT NULL,
  lng           DOUBLE PRECISION NOT NULL,
  area_ha       NUMERIC DEFAULT 0,
  status        TEXT CHECK (status IN ('kritis','jarang','sedang','lebat')) DEFAULT 'sedang',
  kawasan       TEXT CHECK (kawasan IN ('konservasi','hutan_lindung','apl')) DEFAULT 'apl',
  last_survey   DATE,
  is_custom     BOOLEAN DEFAULT FALSE,
  created_by    TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.locations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "locations_read_all"    ON public.locations;
DROP POLICY IF EXISTS "locations_insert_anon" ON public.locations;
CREATE POLICY "locations_read_all"    ON public.locations FOR SELECT USING (TRUE);
CREATE POLICY "locations_insert_anon" ON public.locations FOR INSERT WITH CHECK (TRUE);

CREATE TABLE IF NOT EXISTS public.surveys (
  id                   TEXT PRIMARY KEY,
  created_at           TIMESTAMPTZ DEFAULT NOW(),
  petugas_nama         TEXT NOT NULL,
  petugas_nip          TEXT,
  petugas_unit         TEXT,
  location_id          TEXT REFERENCES public.locations(id),
  location_name        TEXT NOT NULL,
  province             TEXT,
  tanggal              DATE,
  metode_survei        TEXT,
  koordinat_lat        DOUBLE PRECISION,
  koordinat_lng        DOUBLE PRECISION,
  gps_accuracy         NUMERIC,
  tutupan_tajuk        NUMERIC,
  kerapatan_estimasi   NUMERIC,
  spesies_dominan      TEXT,
  spesies_lain         TEXT,
  laju_regenerasi      TEXT,
  kondisi_serasah      TEXT,
  salinitas            NUMERIC,
  ph                   NUMERIC,
  suhu                 NUMERIC,
  kekeruhan            NUMERIC,
  substrat             TEXT,
  elevasi              NUMERIC,
  pasang_surut         TEXT,
  ancaman_utama        TEXT[] DEFAULT '{}',
  jarak_pemukiman      NUMERIC,
  luas_tambak_estimasi NUMERIC,
  aktivitas_manusia    TEXT,
  status_tenurial      TEXT,
  kondisi_umum         TEXT,
  rekomendasi_lapangan TEXT,
  photo_urls           TEXT[] DEFAULT '{}',
  sync_status          TEXT DEFAULT 'synced' CHECK (sync_status IN ('synced','pending'))
);

ALTER TABLE public.surveys ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "surveys_read_all"    ON public.surveys;
DROP POLICY IF EXISTS "surveys_insert_anon" ON public.surveys;
DROP POLICY IF EXISTS "surveys_update_sync" ON public.surveys;
CREATE POLICY "surveys_read_all"    ON public.surveys FOR SELECT USING (TRUE);
CREATE POLICY "surveys_insert_anon" ON public.surveys FOR INSERT WITH CHECK (TRUE);
CREATE POLICY "surveys_update_sync" ON public.surveys FOR UPDATE USING (TRUE) WITH CHECK (TRUE);

-- ─────────────────────────────────────────────────────────────
-- 7. SEED lokasi awal (skip jika sudah ada)
-- ─────────────────────────────────────────────────────────────
INSERT INTO public.locations (id, name, province, district, lat, lng, area_ha, status, kawasan, last_survey, is_custom) VALUES
  ('LOC-001','Taman Nasional Baluran',    'Jawa Timur',        'Situbondo',         -7.84,114.41,1240,'lebat',  'konservasi',   '2025-02-18',FALSE),
  ('LOC-002','Segara Anakan Cilacap',     'Jawa Tengah',       'Cilacap',           -7.71,108.82, 895,'sedang', 'hutan_lindung','2025-01-14',FALSE),
  ('LOC-003','Teluk Bintuni',             'Papua Barat',       'Bintuni',           -2.12,133.52,4900,'lebat',  'konservasi',   '2025-03-05',FALSE),
  ('LOC-004','Pantai Timur Sumatera',     'Sumatera Utara',    'Langkat',            3.82, 98.47, 620,'kritis', 'apl',          '2025-03-20',FALSE),
  ('LOC-005','Muara Sungai Mahakam',      'Kalimantan Timur',  'Kutai Kartanegara', -0.44,117.18,2300,'sedang', 'hutan_lindung','2025-02-28',FALSE),
  ('LOC-006','Taman Nasional Kutai',      'Kalimantan Timur',  'Kutai Timur',        0.55,117.88,3800,'lebat',  'konservasi',   '2025-01-30',FALSE),
  ('LOC-007','Pesisir Raja Ampat',        'Papua Barat',       'Raja Ampat',        -0.23,130.52, 580,'lebat',  'konservasi',   '2025-03-12',FALSE),
  ('LOC-008','Pantai Selatan Kalimantan', 'Kalimantan Selatan','Tanah Bumbu',       -3.67,115.72, 740,'jarang', 'apl',          '2025-02-05',FALSE),
  ('LOC-009','Teluk Palu',               'Sulawesi Tengah',   'Kota Palu',         -0.87,119.87, 210,'kritis', 'apl',          '2025-01-22',FALSE),
  ('LOC-010','Pesisir Barat Lombok',      'Nusa Tenggara Barat','Lombok Barat',     -8.62,116.08, 180,'jarang', 'hutan_lindung','2025-03-08',FALSE)
ON CONFLICT (id) DO NOTHING;

-- ─────────────────────────────────────────────────────────────
-- 8. VIEW survey_stats
-- ─────────────────────────────────────────────────────────────
CREATE OR REPLACE VIEW public.survey_stats AS
SELECT
  COUNT(*)                                              AS total_surveys,
  COUNT(*) FILTER (WHERE tanggal = CURRENT_DATE)       AS today_surveys,
  COUNT(DISTINCT location_id)                          AS unique_locations,
  COUNT(DISTINCT province)                             AS unique_provinces,
  ROUND(AVG(tutupan_tajuk), 1)                        AS avg_tutupan,
  MAX(created_at)                                      AS last_survey_at,
  COUNT(*) FILTER (WHERE sync_status = 'pending')     AS pending_sync
FROM public.surveys;

-- ─────────────────────────────────────────────────────────────
-- SELESAI ✓
-- Setelah ini:
-- 1. Authentication → Providers → Email → Enable OTP
-- 2. Authentication → URL Configuration → tambah redirect URL
-- ─────────────────────────────────────────────────────────────
SELECT 'Schema ID-MAP berhasil dibuat ✓' AS status;
