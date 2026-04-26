/**
 * AuthContext — disederhanakan untuk dual-track auth:
 *  - Admin / Verifikator → form username+password yang match `ADMIN_ACCOUNTS`
 *    (hardcoded). Role bisa 'admin' / 'verifikator'.
 *  - User umum → Clerk (Google/TikTok/X). Role otomatis 'viewer'.
 *    Dipanggil via `signInExternal()` oleh `ClerkBridge`.
 */
import { useState, useCallback } from 'react';
import { ADMIN_ACCOUNTS } from './authAccounts';
import { AuthContext, type AuthUser } from './authModel';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => {
    try {
      const saved = localStorage.getItem('idmap_auth');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const login = useCallback((username: string, password: string): boolean => {
    const match = ADMIN_ACCOUNTS.find(a => a.username === username && a.password === password);
    if (!match) return false;

    const authUser: AuthUser = {
      id: match.id,
      nama: match.nama,
      email: match.email,
      nip: match.nip,
      unit: match.unit,
      provinsi: match.provinsi,
      role: match.role,
      initials: match.initials,
    };
    setUser(authUser);
    localStorage.setItem('idmap_auth', JSON.stringify(authUser));
    return true;
  }, []);

  const logout = useCallback(async () => {
    setUser(null);
    localStorage.removeItem('idmap_auth');
  }, []);

  const signInExternal = useCallback((u: AuthUser) => {
    setUser(u);
    localStorage.setItem('idmap_auth', JSON.stringify(u));
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading: false, login, logout, signInExternal }}>
      {children}
    </AuthContext.Provider>
  );
}
