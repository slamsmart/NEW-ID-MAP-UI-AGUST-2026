import { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

export type UserRole = 'admin_nasional' | 'petugas_daerah' | 'viewer';

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

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  login: (username: string, password: string) => boolean;
  loginWithEmail: (email: string) => Promise<{ success: boolean; demoOtp?: string; error?: string }>;
  verifyOTP: (email: string, otp: string) => Promise<boolean>;
  signUp: (data: SignUpData) => Promise<{ success: boolean; demoOtp?: string; error?: string }>;
  logout: () => Promise<void>;
}

// ── In-memory OTP store (hanya untuk mode demo/localStorage) ────────────────
const localOtpStore: Record<string, { otp: string; user: AuthUser; expiresAt: number }> = {};

function genOTP() { return String(Math.floor(100000 + Math.random() * 900000)); }
function makeInitials(nama: string) {
  return nama.split(' ').filter(Boolean).slice(0, 2).map(w => w[0].toUpperCase()).join('');
}

// ── Local registered users (demo mode saja) ──────────────────────────────────
function getLocalUsers(): (AuthUser & { email: string })[] {
  try { return JSON.parse(localStorage.getItem('idmap_registered_users') ?? '[]'); }
  catch { return []; }
}
function saveLocalUsers(users: (AuthUser & { email: string })[]) {
  localStorage.setItem('idmap_registered_users', JSON.stringify(users));
}

// ── Admin accounts (hardcoded, username + password) ──────────────────────────
export const ADMIN_ACCOUNTS: (AuthUser & { password: string; username: string })[] = [
  {
    id: 'USR-001',
    username: 'admin',
    password: 'admin123',
    nama: 'Admin Nasional',
    unit: 'Tim Integrasi Data Lingkungan',
    role: 'admin_nasional',
    initials: 'ADM',
  },
  {
    id: 'USR-002',
    username: 'petugas',
    password: 'dkp2025',
    nama: 'Slamet Abdullah, S.Pi',
    nip: '198905012015031002',
    unit: 'Koordinator Survei Wilayah Jawa Timur',
    provinsi: 'Jawa Timur',
    role: 'petugas_daerah',
    initials: 'AR',
  },
];

// Keep alias for backward compat
export const DEMO_ACCOUNTS = ADMIN_ACCOUNTS;

// ── Context ───────────────────────────────────────────────────────────────────
const AuthContext = createContext<AuthContextValue>({
  user: null,
  loading: true,
  login: () => false,
  loginWithEmail: async () => ({ success: false }),
  verifyOTP: async () => false,
  signUp: async () => ({ success: false }),
  logout: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => {
    try {
      const saved = localStorage.getItem('idmap_auth');
      return saved ? JSON.parse(saved) : null;
    } catch { return null; }
  });
  // loading = true selama session belum dicek di mount
  const [loading, setLoading] = useState(() => isSupabaseConfigured());
  const initialized = useRef(false);

  // ── Ambil profil dari tabel user_profiles ──
  const fetchProfile = useCallback(async (userId: string, email: string): Promise<AuthUser | null> => {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single();
    if (error || !data) return null;
    return {
      id: data.id,
      nama: data.nama,
      email: data.email ?? email,
      unit: data.unit ?? 'Pengguna Umum',
      provinsi: data.provinsi ?? undefined,
      role: data.role as UserRole,
      initials: makeInitials(data.nama),
    };
  }, []);

  // ── Buat profil jika belum ada (untuk signup baru) ──
  const ensureProfile = useCallback(async (
    userId: string,
    email: string,
  ): Promise<AuthUser | null> => {
    // Cek existing dulu
    let profile = await fetchProfile(userId, email);
    if (profile) return profile;

    // Cek apakah ada pending signup data
    const pendingRaw = localStorage.getItem('idmap_signup_pending');
    if (pendingRaw) {
      try {
        const pending = JSON.parse(pendingRaw);
        await supabase.from('user_profiles').insert({
          id: userId,
          nama: pending.nama,
          email: pending.email ?? email,
          unit: pending.unit || 'Pengguna Umum',
          provinsi: pending.provinsi || null,
          role: 'viewer',
        });
        localStorage.removeItem('idmap_signup_pending');
        // Fetch lagi setelah insert
        profile = await fetchProfile(userId, email);
      } catch (e) {
        console.error('Error creating profile:', e);
      }
    }
    return profile;
  }, [fetchProfile]);

  // ── Sync Supabase Auth session — satu subscription saja ──
  useEffect(() => {
    if (!isSupabaseConfigured()) return;
    if (initialized.current) return;
    initialized.current = true;

    // Cek session yang sudah ada (halaman di-refresh / kembali ke tab)
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        const authUser = await ensureProfile(session.user.id, session.user.email ?? '');
        if (authUser) {
          setUser(authUser);
          localStorage.setItem('idmap_auth', JSON.stringify(authUser));
        }
      }
      setLoading(false);
    });

    // Listen perubahan auth state
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        const authUser = await ensureProfile(session.user.id, session.user.email ?? '');
        if (authUser) {
          setUser(authUser);
          localStorage.setItem('idmap_auth', JSON.stringify(authUser));
        }
        setLoading(false);
      }
      if (event === 'SIGNED_OUT') {
        setUser(null);
        localStorage.removeItem('idmap_auth');
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── 1. Login admin (username + password, hardcoded) ──
  const login = useCallback((username: string, password: string): boolean => {
    const match = ADMIN_ACCOUNTS.find(a => a.username === username && a.password === password);
    if (!match) return false;
    const { password: _p, username: _u, ...authUser } = match;
    setUser(authUser);
    localStorage.setItem('idmap_auth', JSON.stringify(authUser));
    return true;
  }, []);

  // ── 2. Login user biasa via email OTP ──
  const loginWithEmail = useCallback(async (email: string): Promise<{ success: boolean; demoOtp?: string; error?: string }> => {
    const emailNorm = email.trim().toLowerCase();

    if (isSupabaseConfigured()) {
      const { error } = await supabase.auth.signInWithOtp({
        email: emailNorm,
        options: {
          shouldCreateUser: false,
          emailRedirectTo: `${window.location.origin}/dashboard`,
        },
      });
      if (error) {
        if (error.message.includes('not found') || error.message.includes('User not found')) {
          return { success: false, error: 'Email belum terdaftar. Silakan Sign Up terlebih dahulu.' };
        }
        return { success: false, error: error.message };
      }
      return { success: true };
    }

    // ── DEMO MODE ──
    const users = getLocalUsers();
    const found = users.find(u => u.email.toLowerCase() === emailNorm);
    if (!found) return { success: false, error: 'Email belum terdaftar. Silakan Sign Up terlebih dahulu.' };
    const otp = genOTP();
    localOtpStore[emailNorm] = { otp, user: found, expiresAt: Date.now() + 10 * 60 * 1000 };
    console.info(`[ID-MAP OTP] ${emailNorm} → ${otp}`);
    return { success: true, demoOtp: otp };
  }, []);

  // ── 3. Verifikasi OTP ── (set user langsung, tanpa tunggu onAuthStateChange)
  const verifyOTP = useCallback(async (email: string, otp: string): Promise<boolean> => {
    const emailNorm = email.trim().toLowerCase();

    if (isSupabaseConfigured()) {
      setLoading(true);
      const { data, error } = await supabase.auth.verifyOtp({
        email: emailNorm,
        token: otp.trim(),
        type: 'email',
      });

      if (error || !data.session) {
        setLoading(false);
        return false;
      }

      // Set user SEKARANG (jangan tunggu onAuthStateChange) supaya navigate langsung kerja
      const authUser = await ensureProfile(data.session.user.id, data.session.user.email ?? emailNorm);
      if (authUser) {
        setUser(authUser);
        localStorage.setItem('idmap_auth', JSON.stringify(authUser));
      }
      setLoading(false);
      return true;
    }

    // ── DEMO MODE ──
    const entry = localOtpStore[emailNorm];
    if (!entry || Date.now() > entry.expiresAt || entry.otp !== otp.trim()) return false;
    delete localOtpStore[emailNorm];
    setUser(entry.user);
    localStorage.setItem('idmap_auth', JSON.stringify(entry.user));
    return true;
  }, [ensureProfile]);

  // ── 4. Sign Up ──
  const signUp = useCallback(async (data: SignUpData): Promise<{ success: boolean; demoOtp?: string; error?: string }> => {
    const emailNorm = data.email.trim().toLowerCase();
    const nama = data.nama.trim();

    if (isSupabaseConfigured()) {
      const { error } = await supabase.auth.signInWithOtp({
        email: emailNorm,
        options: {
          shouldCreateUser: true,
          emailRedirectTo: `${window.location.origin}/dashboard`,
          data: { nama, unit: data.unit || 'Pengguna Umum', provinsi: data.provinsi ?? '' },
        },
      });
      if (error) return { success: false, error: error.message };

      // Simpan sementara untuk dipakai saat verifikasi OTP
      localStorage.setItem('idmap_signup_pending', JSON.stringify({
        email: emailNorm, nama, unit: data.unit, provinsi: data.provinsi,
      }));
      return { success: true };
    }

    // ── DEMO MODE ──
    const users = getLocalUsers();
    const authUser: AuthUser & { email: string } = {
      id: `USR-${Date.now()}`,
      nama,
      email: emailNorm,
      unit: data.unit || 'Pengguna Umum',
      provinsi: data.provinsi,
      role: 'viewer',
      initials: makeInitials(nama),
    };
    const existing = users.findIndex(u => u.email.toLowerCase() === emailNorm);
    if (existing >= 0) users[existing] = authUser;
    else users.push(authUser);
    saveLocalUsers(users);

    const otp = genOTP();
    localOtpStore[emailNorm] = { otp, user: authUser, expiresAt: Date.now() + 10 * 60 * 1000 };
    console.info(`[ID-MAP OTP Signup] ${emailNorm} → ${otp}`);
    return { success: true, demoOtp: otp };
  }, []);

  // ── 5. Logout ──
  const logout = useCallback(async () => {
    if (isSupabaseConfigured()) {
      await supabase.auth.signOut();
    }
    setUser(null);
    localStorage.removeItem('idmap_auth');
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, loginWithEmail, verifyOTP, signUp, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
