import type { AuthUser } from './authModel';

export const ADMIN_ACCOUNTS: (AuthUser & { password: string; username: string })[] = [
  {
    id: 'USR-001',
    username: 'verifikator',
    password: 'verif123',
    nama: 'Verifikator',
    unit: 'Tim Verifikasi Data Lingkungan',
    role: 'verifikator',
    initials: 'VRF',
  },
  {
    id: 'USR-002',
    username: 'admin',
    password: 'admin123',
    nama: 'Admin',
    unit: 'Koordinator Survei Wilayah Jawa Timur',
    provinsi: 'Jawa Timur',
    role: 'admin',
    initials: 'ADM',
  },
];

export const DEMO_ACCOUNTS = ADMIN_ACCOUNTS;
