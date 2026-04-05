import type { MangroveLocation } from '../types';

const CUSTOM_LOCS_KEY = 'idmap_custom_locs';
const SURVEYS_KEY = 'idmap_surveys';

export interface SurveyRecord {
  id: string;
  timestamp: string;
  namaPetugas: string;
  unit: string;
  locationId: string;
  locationName: string;
  province: string;
  tutupanTajuk: string;
  kerapatan: string;
  salinitas: string;
  ancamanCount: number;
  kondisiUmum: string;
  isCustomLoc: boolean;
}

export function getCustomLocations(): MangroveLocation[] {
  try {
    const d = localStorage.getItem(CUSTOM_LOCS_KEY);
    return d ? JSON.parse(d) : [];
  } catch {
    return [];
  }
}

export function saveCustomLocation(loc: MangroveLocation): void {
  const existing = getCustomLocations();
  existing.push(loc);
  localStorage.setItem(CUSTOM_LOCS_KEY, JSON.stringify(existing));
}

export function getSurveys(): SurveyRecord[] {
  try {
    const d = localStorage.getItem(SURVEYS_KEY);
    return d ? JSON.parse(d) : [];
  } catch {
    return [];
  }
}

export function saveSurvey(rec: SurveyRecord): void {
  const existing = getSurveys();
  existing.unshift(rec);
  localStorage.setItem(SURVEYS_KEY, JSON.stringify(existing.slice(0, 200)));
}

export function getSurveyStats() {
  const surveys = getSurveys();
  const today = new Date().toISOString().split('T')[0];
  const todayCount = surveys.filter(s => s.timestamp.startsWith(today)).length;
  const customLocs = getCustomLocations();
  return {
    total: surveys.length,
    today: todayCount,
    customLocCount: customLocs.length,
    lastSubmit: surveys[0]?.timestamp ?? null,
  };
}
