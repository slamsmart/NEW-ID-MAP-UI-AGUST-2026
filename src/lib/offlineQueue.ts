/**
 * Offline Queue — ID-MAP EcoTrack
 *
 * Strategi:
 * 1. Data survei selalu disimpan ke localStorage dulu (instant, offline-safe)
 * 2. Jika online + Supabase terkonfigurasi → upload ke Supabase
 * 3. Jika offline → masuk queue, ditandai 'pending'
 * 4. Saat koneksi kembali (event 'online') → proses queue otomatis
 * 5. Foto: disimpan sebagai base64 lokal saat offline, upload ke Cloudinary saat online
 *
 * GPS: navigator.geolocation menggunakan SATELIT, bukan internet.
 * → Koordinat tetap bisa diambil meski sinyal HP tidak ada.
 * → Yang butuh internet: Supabase sync + Cloudinary upload.
 */

import { supabase, isSupabaseConfigured } from './supabase';
import type { DbSurvey, DbLocation } from './supabase';

const QUEUE_KEY = 'idmap_offline_queue';
const LOCS_QUEUE_KEY = 'idmap_offline_locs';

export interface QueuedSurvey extends DbSurvey {
  _queued_at: string;
  _offline_photos: string[]; // base64 data URLs saat offline
}

function getQueue(): QueuedSurvey[] {
  try {
    return JSON.parse(localStorage.getItem(QUEUE_KEY) ?? '[]');
  } catch {
    return [];
  }
}

function setQueue(q: QueuedSurvey[]) {
  localStorage.setItem(QUEUE_KEY, JSON.stringify(q));
}

function getLocQueue(): DbLocation[] {
  try {
    return JSON.parse(localStorage.getItem(LOCS_QUEUE_KEY) ?? '[]');
  } catch {
    return [];
  }
}

function setLocQueue(q: DbLocation[]) {
  localStorage.setItem(LOCS_QUEUE_KEY, JSON.stringify(q));
}

/** Jumlah item pending di queue */
export function getPendingCount(): number {
  return getQueue().filter(s => s.sync_status === 'pending').length +
         getLocQueue().length;
}

/**
 * Simpan survei: coba Supabase dulu, fallback ke localStorage queue
 */
export async function enqueueSurvey(survey: DbSurvey): Promise<{ success: boolean; offline: boolean }> {
  const queued: QueuedSurvey = {
    ...survey,
    _queued_at: new Date().toISOString(),
    _offline_photos: [],
    sync_status: 'pending',
  };

  // Selalu simpan ke queue lokal dulu
  const q = getQueue();
  const existing = q.findIndex(s => s.id === survey.id);
  if (existing >= 0) q[existing] = queued;
  else q.unshift(queued);
  setQueue(q.slice(0, 200));

  if (!navigator.onLine || !isSupabaseConfigured()) {
    return { success: true, offline: true };
  }

  return _uploadSurveyToSupabase(queued);
}

/**
 * Simpan lokasi baru: coba Supabase, fallback ke queue
 */
export async function enqueueLocation(loc: DbLocation): Promise<{ success: boolean; offline: boolean }> {
  const locQueue = getLocQueue();
  if (!locQueue.find(l => l.id === loc.id)) {
    locQueue.push(loc);
    setLocQueue(locQueue);
  }

  if (!navigator.onLine || !isSupabaseConfigured()) {
    return { success: true, offline: true };
  }

  return _uploadLocationToSupabase(loc);
}

async function _uploadSurveyToSupabase(survey: QueuedSurvey): Promise<{ success: boolean; offline: boolean }> {
  try {
    const { _queued_at, _offline_photos, ...dbSurvey } = survey;
    void _queued_at;
    void _offline_photos;
    const { error } = await supabase
      .from('surveys')
      .upsert({ ...dbSurvey, sync_status: 'synced' }, { onConflict: 'id' });

    if (error) throw error;

    // Update status di queue lokal
    const q = getQueue();
    const idx = q.findIndex(s => s.id === survey.id);
    if (idx >= 0) q[idx].sync_status = 'synced';
    setQueue(q);

    return { success: true, offline: false };
  } catch (err) {
    console.warn('[ID-MAP] Supabase upload gagal, tetap di queue:', err);
    return { success: true, offline: true };
  }
}

async function _uploadLocationToSupabase(loc: DbLocation): Promise<{ success: boolean; offline: boolean }> {
  try {
    const { error } = await supabase
      .from('mangrove_locations')
      .upsert(loc, { onConflict: 'id' });

    if (error) throw error;

    // Hapus dari loc queue setelah berhasil
    const q = getLocQueue().filter(l => l.id !== loc.id);
    setLocQueue(q);

    return { success: true, offline: false };
  } catch (err) {
    console.warn('[ID-MAP] Location upload gagal:', err);
    return { success: true, offline: true };
  }
}

/**
 * Proses semua pending items saat kembali online.
 * Dipanggil dari event listener window 'online'.
 */
export async function syncPendingQueue(): Promise<{ synced: number; failed: number }> {
  if (!navigator.onLine || !isSupabaseConfigured()) return { synced: 0, failed: 0 };

  let synced = 0;
  let failed = 0;

  // Sync lokasi dulu (karena survey bisa referensi lokasi baru)
  const locQueue = getLocQueue();
  for (const loc of locQueue) {
    const { success } = await _uploadLocationToSupabase(loc);
    if (success) synced++;
    else failed++;
  }

  // Sync surveys
  const surveyQueue = getQueue().filter(s => s.sync_status === 'pending');
  for (const survey of surveyQueue) {
    const { offline } = await _uploadSurveyToSupabase(survey);
    if (!offline) synced++;
    else failed++;
  }

  return { synced, failed };
}

/**
 * Ambil semua survei — gabungan dari Supabase (jika online) + queue lokal
 */
export async function getAllSurveys(): Promise<DbSurvey[]> {
  const localSurveys = getQueue() as DbSurvey[];

  if (!navigator.onLine || !isSupabaseConfigured()) {
    return localSurveys;
  }

  try {
    const { data, error } = await supabase
      .from('surveys')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(200);

    if (error) throw error;

    // Gabung: prioritaskan Supabase, tambah yang hanya ada di lokal
    const supabaseIds = new Set((data ?? []).map((s: DbSurvey) => s.id));
    const onlyLocal = localSurveys.filter(s => !supabaseIds.has(s.id));
    return [...(data ?? []) as DbSurvey[], ...onlyLocal];
  } catch {
    return localSurveys;
  }
}

/**
 * Ambil statistik survei dari Supabase atau hitung dari lokal
 */
export async function getStatsFromDB() {
  if (!isSupabaseConfigured()) return null;

  try {
    const { data, error } = await supabase.from('survey_stats').select('*').single();
    if (error) throw error;
    return data;
  } catch {
    return null;
  }
}
