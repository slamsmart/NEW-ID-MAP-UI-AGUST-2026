/**
 * Lokasi mangrove: seed statis + custom localStorage + Convex remote (opsional).
 * UI lama yang import `mangroveLocations` dari mockData tetap bisa pakai seed.
 */
import type { MangroveLocation } from '../types';
import { mangroveLocations as seedLocations } from './seedData';
import { getCustomLocations } from './localStore';
import { convex, isConvexConfigured } from '../lib/convexClient';
import { api } from '../../convex/_generated/api';

export { seedLocations };

/** Seed + custom locations (sync, offline-safe). */
export function getLocalLocations(): MangroveLocation[] {
  const custom = getCustomLocations();
  if (!custom.length) return seedLocations;
  const ids = new Set(custom.map(c => c.id));
  return [...seedLocations.filter(s => !ids.has(s.id)), ...custom];
}

function mapConvexLocation(row: {
  legacyId: string;
  name: string;
  province: string;
  district: string;
  lat: number;
  lng: number;
  areaHa: number;
  status: MangroveLocation['status'];
  kawasan: MangroveLocation['kawasan'];
  lastSurvey?: string;
}): MangroveLocation {
  return {
    id: row.legacyId,
    name: row.name,
    province: row.province,
    district: row.district,
    lat: row.lat,
    lng: row.lng,
    areaHa: row.areaHa,
    status: row.status,
    kawasan: row.kawasan,
    lastSurvey: row.lastSurvey ?? '',
  };
}

/**
 * Merge seed + custom + Convex remote.
 * Remote override by legacyId; seed remains baseline when Convex empty/offline.
 */
export async function fetchAllLocations(): Promise<MangroveLocation[]> {
  const local = getLocalLocations();
  if (!navigator.onLine || !isConvexConfigured()) return local;

  try {
    const rows = await convex.query(api.locations.list, {});
    if (!rows?.length) return local;

    const remote = rows.map(mapConvexLocation);
    const byId = new Map<string, MangroveLocation>();
    for (const s of seedLocations) byId.set(s.id, s);
    for (const c of getCustomLocations()) byId.set(c.id, c);
    for (const r of remote) byId.set(r.id, r);
    return Array.from(byId.values());
  } catch {
    return local;
  }
}

/** @deprecated gunakan getLocalLocations / fetchAllLocations */
export const mangroveLocations = seedLocations;
