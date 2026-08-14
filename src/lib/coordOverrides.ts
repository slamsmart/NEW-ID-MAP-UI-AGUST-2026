/**
 * coordOverrides — verifikator dapat override koordinat lokasi peta
 * tanpa harus edit source code. Disimpan di localStorage.
 */

const KEY = 'idmap_coord_overrides';

export interface CoordOverride {
  lat: number;
  lng: number;
  updatedAt: string;
  updatedBy?: string;
}

export type CoordOverrideMap = Record<string, CoordOverride>;

export function getOverrides(): CoordOverrideMap {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function setOverride(id: string, lat: number, lng: number, by?: string): void {
  const overrides = getOverrides();
  overrides[id] = {
    lat,
    lng,
    updatedAt: new Date().toISOString(),
    updatedBy: by,
  };
  localStorage.setItem(KEY, JSON.stringify(overrides));
  window.dispatchEvent(new CustomEvent('idmap:coord-override-changed', { detail: { id } }));
}

export function removeOverride(id: string): void {
  const overrides = getOverrides();
  delete overrides[id];
  localStorage.setItem(KEY, JSON.stringify(overrides));
  window.dispatchEvent(new CustomEvent('idmap:coord-override-changed', { detail: { id } }));
}

export function applyOverride<T extends { id: string; lat: number; lng: number }>(
  loc: T,
): T {
  const overrides = getOverrides();
  const o = overrides[loc.id];
  if (o) {
    return { ...loc, lat: o.lat, lng: o.lng };
  }
  return loc;
}

export function applyOverridesToList<T extends { id: string; lat: number; lng: number }>(
  list: T[],
): T[] {
  const overrides = getOverrides();
  return list.map(loc => {
    const o = overrides[loc.id];
    if (o) {
      return { ...loc, lat: o.lat, lng: o.lng };
    }
    return loc;
  });
}
