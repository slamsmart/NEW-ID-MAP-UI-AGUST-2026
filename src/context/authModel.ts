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
  login: (username: string, password: string) => boolean;
  loginWithEmail: (email: string) => Promise<{ success: boolean; demoOtp?: string; error?: string; warning?: string }>;
  verifyOTP: (email: string, otp: string) => Promise<boolean>;
  signUp: (data: SignUpData) => Promise<{ success: boolean; demoOtp?: string; error?: string; warning?: string }>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue>({
  user: null,
  loading: true,
  login: () => false,
  loginWithEmail: async () => ({ success: false }),
  verifyOTP: async () => false,
  signUp: async () => ({ success: false }),
  logout: async () => {},
});
