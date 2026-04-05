import { createContext, useContext, useState } from 'react';

export type UserRole = 'admin_nasional' | 'petugas_daerah' | 'viewer';

export interface AuthUser {
  id: string;
  nama: string;
  nip?: string;
  unit: string;
  provinsi?: string;
  role: UserRole;
  initials: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  login: (username: string, password: string) => boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  login: () => false,
  logout: () => {},
});

export const DEMO_ACCOUNTS: (AuthUser & { password: string; username: string })[] = [
  {
    id: 'USR-001',
    username: 'admin',
    password: 'admin123',
    nama: 'Admin Nasional KKP',
    unit: 'Direktorat Pengelolaan Ruang Laut — KKP',
    role: 'admin_nasional',
    initials: 'ADM',
  },
  {
    id: 'USR-002',
    username: 'petugas',
    password: 'dkp2025',
    nama: 'Slamet Abdullah, S.Pi',
    nip: '198905012015031002',
    unit: 'Cabang Dinas Kelautan dan Perikanan Provinsi Jawa Timur',
    provinsi: 'Jawa Timur',
    role: 'petugas_daerah',
    initials: 'AR',
  },
  {
    id: 'USR-003',
    username: 'viewer',
    password: 'lihat123',
    nama: 'Publik / Pemangku Kepentingan',
    unit: 'Akses Publik',
    role: 'viewer',
    initials: 'PB',
  },
];

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => {
    try {
      const saved = localStorage.getItem('idmap_auth');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const login = (username: string, password: string): boolean => {
    const match = DEMO_ACCOUNTS.find(
      a => a.username === username && a.password === password
    );
    if (!match) return false;
    const { password: _p, username: _u, ...authUser } = match;
    setUser(authUser);
    localStorage.setItem('idmap_auth', JSON.stringify(authUser));
    return true;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('idmap_auth');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
