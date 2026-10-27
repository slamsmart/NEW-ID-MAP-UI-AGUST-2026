import { describe, it, expect } from 'vitest';
import { buildPolicyAnalysis, classifyRisk, urgencyScore } from './policyAnalysis';
import type { MangroveLocation, EkosistemData, TekananSosialData } from '../types';
import type { KebijakanLokasi } from '../data/kebijakan';

const locations: MangroveLocation[] = [
  { id: 'L1', name: 'Sehat', province: 'Jawa Timur', district: 'Malang', lat: 0, lng: 0, areaHa: 100, status: 'lebat', kawasan: 'konservasi', lastSurvey: '2025-01' },
  { id: 'L2', name: 'Darurat', province: 'Jawa Timur', district: 'Malang', lat: 0, lng: 0, areaHa: 50, status: 'kritis', kawasan: 'apl', lastSurvey: '2025-01' },
];

const eco: EkosistemData[] = [
  { locationId: 'L1', tutupanTajuk: 90, kerapatanPohon: 1200, komposisiJenis: [], lajuRegenerasi: 'tinggi', skorKesehatan: 90, tahun: 2025 },
  { locationId: 'L2', tutupanTajuk: 25, kerapatanPohon: 200, komposisiJenis: [], lajuRegenerasi: 'rendah', skorKesehatan: 28, tahun: 2025 },
];

const tekanan: TekananSosialData[] = [
  { locationId: 'L1', jarakPemukiman: 5, luasTambak: 0, indeksAncaman: 2, statusTenurial: 'aman', nurseryTerdekat: 'A', stokBibit: 1000 },
  { locationId: 'L2', jarakPemukiman: 1, luasTambak: 50, indeksAncaman: 9, statusTenurial: 'bersengketa', nurseryTerdekat: 'B', stokBibit: 100 },
];

const kebijakan: KebijakanLokasi[] = [
  { locationId: 'L2', prioritas: 1, statusRisiko: 'kritis', ringkasan: 'Darurat', rekomendasiPendek: ['Hentikan konversi', 'Tanam bibit', 'Koordinasi hukum'], rekomendasiMenengah: [], rekomendasiPanjang: [], dasarHukum: [{ nomor: 'UU X', keterangan: 'Y' }], targetCapaian: 'Pulih 2 tahun', instansiPJ: ['DKP'], estimasiAnggaran: 'Rp 1M', catatanKhusus: '' },
];

describe('classifyRisk', () => {
  it('flags kritis on low score or high threat', () => {
    expect(classifyRisk('lebat', 30, 0)).toBe('kritis');
    expect(classifyRisk('lebat', 90, 8)).toBe('kritis');
  });
  it('flags baik only when healthy', () => {
    expect(classifyRisk('lebat', 90, 2)).toBe('baik');
  });
});

describe('urgencyScore', () => {
  it('ranks critical higher than healthy', () => {
    const sehat = urgencyScore('lebat', 90, 2, 'aman');
    const darurat = urgencyScore('kritis', 28, 9, 'bersengketa');
    expect(darurat).toBeGreaterThan(sehat);
    expect(darurat).toBeLessThanOrEqual(100);
    expect(sehat).toBeGreaterThanOrEqual(0);
  });
});

describe('buildPolicyAnalysis', () => {
  it('sorts most urgent first and summarizes', () => {
    const result = buildPolicyAnalysis(locations, eco, tekanan, kebijakan);
    expect(result.items[0].id).toBe('L2');
    expect(result.summary.totalLokasi).toBe(2);
    expect(result.summary.kritis).toBe(1);
    expect(result.summary.totalAreaHa).toBe(150);
    expect(result.summary.tenurialBermasalah).toBe(1);
  });

  it('uses kebijakan recommendations when available, falls back otherwise', () => {
    const result = buildPolicyAnalysis(locations, eco, tekanan, kebijakan);
    const darurat = result.items.find((i) => i.id === 'L2')!;
    expect(darurat.aksiPrioritas).toContain('Hentikan konversi');
    const sehat = result.items.find((i) => i.id === 'L1')!;
    expect(sehat.aksiPrioritas.length).toBeGreaterThan(0);
  });
});
