/**
 * Offline Queue — ID-MAP EcoTrack
 *
 * Strategi:
 * 1. Data survei selalu disimpan ke localStorage dulu (instant, offline-safe)
 * 2. Jika online + Convex terkonfigurasi → upload ke Convex
 * 3. Jika offline → masuk queue, ditandai 'pending'
 * 4. Saat koneksi kembali (event 'online') → proses queue otomatis
 * 5. Foto: disimpan sebagai base64 lokal saat offline, upload ke Cloudinary saat online
 *
 * GPS: navigator.geolocation menggunakan satelit, bukan internet.
 * → Koordinat tetap bisa diambil meski sinyal HP tidak ada.
 * → Yang butuh internet: Convex sync + Cloudinary upload.
 */

import type { DbSurvey, DbLocation } from '../types/db';
import { convex, isConvexConfigured, dbSurveyToConvexArgs, dbLocationToConvexArgs, convexSurveyToDbSurvey } from './convexClient';
import { api } from '../../convex/_generated/api';

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
 * Simpan survei: coba Convex dulu, fallback ke localStorage queue
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

  if (!navigator.onLine || !isConvexConfigured()) {
    return { success: true, offline: true };
  }

  return _uploadSurveyToConvex(queued);
}

/**
 * Simpan lokasi baru: coba Convex, fallback ke queue
 */
export async function enqueueLocation(loc: DbLocation): Promise<{ success: boolean; offline: boolean }> {
  const locQueue = getLocQueue();
  if (!locQueue.find(l => l.id === loc.id)) {
    locQueue.push(loc);
    setLocQueue(locQueue);
  }

  if (!navigator.onLine || !isConvexConfigured()) {
    return { success: true, offline: true };
  }

  return _uploadLocationToConvex(loc);
}

async function _uploadSurveyToConvex(survey: QueuedSurvey): Promise<{ success: boolean; offline: boolean }> {
  try {
    const { _queued_at, _offline_photos, ...dbSurvey } = survey;
    void _queued_at;
    void _offline_photos;
    const args = dbSurveyToConvexArgs(dbSurvey as DbSurvey);
    await convex.mutation(api.surveys.upsert, args);

    // Update status di queue lokal
    const q = getQueue();
    const idx = q.findIndex(s => s.id === survey.id);
    if (idx >= 0) q[idx].sync_status = 'synced';
    setQueue(q);

    return { success: true, offline: false };
  } catch (err) {
    console.warn('[ID-MAP] Convex upload survey gagal, tetap di queue:', err);
    return { success: true, offline: true };
  }
}

async function _uploadLocationToConvex(loc: DbLocation): Promise<{ success: boolean; offline: boolean }> {
  try {
    await convex.mutation(api.locations.upsert, dbLocationToConvexArgs(loc));

    // Hapus dari loc queue setelah berhasil
    const q = getLocQueue().filter(l => l.id !== loc.id);
    setLocQueue(q);

    return { success: true, offline: false };
  } catch (err) {
    console.warn('[ID-MAP] Convex upload location gagal:', err);
    return { success: true, offline: true };
  }
}

/**
 * Proses semua pending items saat kembali online.
 * Dipanggil dari event listener window 'online'.
 */
export async function syncPendingQueue(): Promise<{ synced: number; failed: number }> {
  if (!navigator.onLine || !isConvexConfigured()) return { synced: 0, failed: 0 };

  let synced = 0;
  let failed = 0;

  // Sync lokasi dulu (karena survey bisa referensi lokasi baru)
  const locQueue = getLocQueue();
  for (const loc of locQueue) {
    const { success } = await _uploadLocationToConvex(loc);
    if (success) synced++;
    else failed++;
  }

  // Sync surveys
  const surveyQueue = getQueue().filter(s => s.sync_status === 'pending');
  for (const survey of surveyQueue) {
    const { offline } = await _uploadSurveyToConvex(survey);
    if (!offline) synced++;
    else failed++;
  }

  return { synced, failed };
}

/**
 * Ambil semua survei — gabungan dari Convex (jika online) + queue lokal
 */
export async function getAllSurveys(): Promise<DbSurvey[]> {
  const localSurveys = getQueue() as DbSurvey[];

  if (!navigator.onLine || !isConvexConfigured()) {
    return localSurveys;
  }

  try {
    const rows = await convex.query(api.surveys.list, { limit: 200 });
    const remote = (rows ?? []).map(r => convexSurveyToDbSurvey(r as unknown as Record<string, unknown>));
    // Gabung: prioritaskan remote, tambah yang hanya ada di lokal
    const remoteIds = new Set(remote.map(s => s.id));
    const onlyLocal = localSurveys.filter(s => !remoteIds.has(s.id));
    return [...remote, ...onlyLocal];
  } catch {
    return localSurveys;
  }
}

/**
 * Stats agregat dari Convex (digunakan Header EcoTrack badge).
 */
export async function getStatsFromDB() {
  if (!isConvexConfigured()) return null;
  try {
    return await convex.query(api.surveys.stats, {});
  } catch {
    return null;
  }
}
