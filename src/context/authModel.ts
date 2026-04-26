import { createContext } from 'react';

export type UserRole = 'verifikator' | 'admin' | 'viewer';

export interface AuthUser {
  id: string;
  nama: string;
  email?: string;
  nip?: string;
  unit: string;
  provinsi?: string;
  role: UserRole;
  initials: string;
}

export interface SignUpData {
  nama: string;
  email: string;
  unit: string;
  provinsi?: string;
}

export interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  /** Login admin/verifikator (form username+password match ADMIN_ACCOUNTS). */
  login: (username: string, password: string) => boolean;
  logout: () => Promise<void>;
  /** Set user dari penyedia auth eksternal (mis. Clerk Google sign-in). */
  signInExternal: (user: AuthUser) => void;
}

export const AuthContext = createContext<AuthContextValue>({
  user: null,
  loading: false,
  login: () => false,
  logout: async () => {},
  signInExternal: () => {},
});
