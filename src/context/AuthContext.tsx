import { useState, useCallback, useEffect, useRef } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { EMAILJS_CONFIG } from '../lib/emailjs';
import { ADMIN_ACCOUNTS } from './authAccounts';
import { AuthContext, type AuthUser, type SignUpData, type UserRole } from './authModel';

interface OtpEntry {
  otp: string;
  expiresAt: number;
  type: 'login' | 'signup';
  signupData?: SignUpData;
  demoUser?: AuthUser & { email: string };
}

const localOtpStore: Record<string, OtpEntry> = {};
const USE_EMAILJS_ONLY_OTP = true;

function genOTP() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

function makeInitials(nama: string) {
  return nama.split(' ').filter(Boolean).slice(0, 2).map(w => w[0].toUpperCase()).join('');
}

function getLocalUsers(): (AuthUser & { email: string })[] {
  try {
    return JSON.parse(localStorage.getItem('idmap_registered_users') ?? '[]');
  } catch {
    return [];
  }
}

function saveLocalUsers(users: (AuthUser & { email: string })[]) {
  localStorage.setItem('idmap_registered_users', JSON.stringify(users));
}

interface OtpDeliveryResult {
  delivered: boolean;
  warning?: string;
}

async function sendOTPEmail(toEmail: string, otpCode: string): Promise<OtpDeliveryResult> {
  try {
    const res = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        service_id:  EMAILJS_CONFIG.SERVICE_ID,
        template_id: EMAILJS_CONFIG.TEMPLATE_ID,
        user_id:     EMAILJS_CONFIG.PUBLIC_KEY,
        template_params: {
          to_email:     toEmail,
          user_name:    toEmail.split('@')[0],
          otp_code:     otpCode,
          otp_exp:      '15',
          email:        toEmail,
          passcode:     otpCode,
          time:         '15',
          from_name:    'ID MAP Admin',
          from_email:   'id.map.admin@gmail.com',
          company_name: 'ID-MAP',
          reply_to:     'id.map.admin@gmail.com',
        },
      }),
    });
    if (!res.ok) {
      const body = await res.text();
      console.error('[EmailJS] Error:', res.status, body);
      return { delivered: false, warning: 'Layanan email OTP sedang bermasalah. Gunakan kode OTP yang ditampilkan di layar ini.' };
    }
    return { delivered: true };
  } catch (err) {
    console.error('[EmailJS] Fetch gagal:', err);
    return { delivered: false, warning: 'Koneksi ke layanan email OTP gagal. Gunakan kode OTP yang ditampilkan di layar ini.' };
  }
}

function buildOtpResponse(otp: string, delivery: OtpDeliveryResult) {
  if (delivery.delivered) return { success: true } as const;
  return { success: true, demoOtp: otp, warning: delivery.warning } as const;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => {
    try {
      const saved = localStorage.getItem('idmap_auth');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState<boolean>(() => isSupabaseConfigured() && !USE_EMAILJS_ONLY_OTP);
  const initialized = useRef(false);

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

  const ensureProfile = useCallback(async (userId: string, email: string): Promise<AuthUser | null> => {
    let profile = await fetchProfile(userId, email);
    if (profile) return profile;

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
        profile = await fetchProfile(userId, email);
      } catch (e) {
        console.error('Error creating profile:', e);
      }
    }

    return profile;
  }, [fetchProfile]);

  useEffect(() => {
    if (!isSupabaseConfigured() || USE_EMAILJS_ONLY_OTP) return;
    if (initialized.current) return;
    initialized.current = true;

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
  }, [ensureProfile]);

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

  const loginWithEmail = useCallback(async (email: string): Promise<{ success: boolean; demoOtp?: string; error?: string; warning?: string }> => {
    const emailNorm = email.trim().toLowerCase();

    if (isSupabaseConfigured() && !USE_EMAILJS_ONLY_OTP) {
      const { data } = await supabase.from('user_profiles').select('id, nama').eq('email', emailNorm).maybeSingle();
      if (!data) return { success: false, error: 'Email belum terdaftar. Silakan Sign Up terlebih dahulu.' };

      const otp = genOTP();
      localOtpStore[emailNorm] = { otp, type: 'login', expiresAt: Date.now() + 15 * 60 * 1000 };
      const delivery = await sendOTPEmail(emailNorm, otp);
      return buildOtpResponse(otp, delivery);
    }

    const users = getLocalUsers();
    const found = users.find(u => u.email.toLowerCase() === emailNorm);
    if (!found) return { success: false, error: 'Email belum terdaftar. Silakan Sign Up terlebih dahulu.' };

    const otp = genOTP();
    localOtpStore[emailNorm] = { otp, type: 'login', demoUser: found, expiresAt: Date.now() + 15 * 60 * 1000 };
    const delivery = await sendOTPEmail(emailNorm, otp);
    return buildOtpResponse(otp, delivery);
  }, []);

  const verifyOTP = useCallback(async (email: string, otp: string): Promise<boolean> => {
    const emailNorm = email.trim().toLowerCase();
    const entry = localOtpStore[emailNorm];
    if (!entry || Date.now() > entry.expiresAt || entry.otp !== otp.trim()) return false;
    delete localOtpStore[emailNorm];

    if (isSupabaseConfigured() && !USE_EMAILJS_ONLY_OTP) {
      setLoading(true);
      const isSignup = entry.type === 'signup';
      const { error } = await supabase.auth.signInWithOtp({
        email: emailNorm,
        options: {
          shouldCreateUser: isSignup,
          data: isSignup && entry.signupData ? {
            nama: entry.signupData.nama,
            unit: entry.signupData.unit || 'Pengguna Umum',
            provinsi: entry.signupData.provinsi ?? '',
          } : undefined,
        },
      });
      if (error) {
        setLoading(false);
        return false;
      }

      await new Promise(r => setTimeout(r, 800));
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        setLoading(false);
        return false;
      }

      const authUser = await ensureProfile(session.user.id, session.user.email ?? emailNorm);
      if (authUser) {
        setUser(authUser);
        localStorage.setItem('idmap_auth', JSON.stringify(authUser));
      }
      setLoading(false);
      return true;
    }

    if (entry.type === 'signup' && entry.signupData) {
      const users = getLocalUsers();
      const authUser: AuthUser & { email: string } = {
        id: `USR-${Date.now()}`,
        nama: entry.signupData.nama.trim(),
        email: emailNorm,
        unit: entry.signupData.unit || 'Pengguna Umum',
        provinsi: entry.signupData.provinsi,
        role: 'viewer',
        initials: makeInitials(entry.signupData.nama),
      };
      const existing = users.findIndex(u => u.email.toLowerCase() === emailNorm);
      if (existing >= 0) users[existing] = authUser; else users.push(authUser);
      saveLocalUsers(users);
      setUser(authUser);
      localStorage.setItem('idmap_auth', JSON.stringify(authUser));
      return true;
    }

    if (entry.demoUser) {
      setUser(entry.demoUser);
      localStorage.setItem('idmap_auth', JSON.stringify(entry.demoUser));
      return true;
    }

    const existingUser = getLocalUsers().find(u => u.email.toLowerCase() === emailNorm);
    if (existingUser) {
      setUser(existingUser);
      localStorage.setItem('idmap_auth', JSON.stringify(existingUser));
      return true;
    }

    return false;
  }, [ensureProfile]);

  const signUp = useCallback(async (data: SignUpData): Promise<{ success: boolean; demoOtp?: string; error?: string; warning?: string }> => {
    const emailNorm = data.email.trim().toLowerCase();
    const nama = data.nama.trim();

    if (isSupabaseConfigured() && !USE_EMAILJS_ONLY_OTP) {
      const { data: existing } = await supabase.from('user_profiles').select('id').eq('email', emailNorm).maybeSingle();
      if (existing) return { success: false, error: 'Email sudah terdaftar. Silakan Login.' };

      const otp = genOTP();
      localOtpStore[emailNorm] = {
        otp,
        type: 'signup',
        expiresAt: Date.now() + 15 * 60 * 1000,
        signupData: data,
      };
      localStorage.setItem('idmap_signup_pending', JSON.stringify({
        email: emailNorm,
        nama,
        unit: data.unit,
        provinsi: data.provinsi,
      }));
      const delivery = await sendOTPEmail(emailNorm, otp);
      return buildOtpResponse(otp, delivery);
    }

    const users = getLocalUsers();
    const existing = users.find(u => u.email.toLowerCase() === emailNorm);
    if (existing) return { success: false, error: 'Email sudah terdaftar. Silakan Login.' };

    const otp = genOTP();
    localOtpStore[emailNorm] = {
      otp,
      type: 'signup',
      expiresAt: Date.now() + 15 * 60 * 1000,
      signupData: { ...data, nama, email: emailNorm },
    };
    const delivery = await sendOTPEmail(emailNorm, otp);
    return buildOtpResponse(otp, delivery);
  }, []);

  const logout = useCallback(async () => {
    if (isSupabaseConfigured() && !USE_EMAILJS_ONLY_OTP) await supabase.auth.signOut();
    setUser(null);
    localStorage.removeItem('idmap_auth');
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, loginWithEmail, verifyOTP, signUp, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
