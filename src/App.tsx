import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { useAuth } from './context/useAuth';
import Layout from './components/Layout/Layout';
import ClerkBridge from './components/ClerkBridge';
import { AccountNoticeProvider } from './components/AccountRequiredNotice';
import LoginSuccessToast from './components/LoginSuccessToast';
import PWAInstallPrompt from './components/PWAInstallPrompt';
import PageFade from './components/PageFade';

const LandingPage = lazy(() => import('./pages/LandingPage'));
const Login = lazy(() => import('./pages/Login'));
const PetaPublik = lazy(() => import('./pages/PetaPublik'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const MonitoringEkosistem = lazy(() => import('./pages/MonitoringEkosistem'));
const InputLapangan = lazy(() => import('./pages/InputLapangan'));
const RekomendasiLokasi = lazy(() => import('./pages/RekomendasiLokasi'));
const VegetasiMangrove = lazy(() => import('./pages/VegetasiMangrove'));
const PendaratanPenyu = lazy(() => import('./pages/PendaratanPenyu'));
const VerifikasiData = lazy(() => import('./pages/VerifikasiData'));
const DataPokmaswas = lazy(() => import('./pages/DataPokmaswas'));
const Laporan = lazy(() => import('./pages/Laporan'));
const PembibitanMangrove = lazy(() => import('./pages/PembibitanMangrove'));
const TekananSosial = lazy(() => import('./pages/TekananSosial'));
const AnalisisLingkungan = lazy(() => import('./pages/AnalisisLingkungan'));
const MangroveNasional = lazy(() => import('./pages/MangroveNasional'));
const PedomanTeknisPage = lazy(() => import('./pages/PedomanTeknisPage'));
const SyaratKetentuan = lazy(() => import('./pages/SyaratKetentuan'));
const KebijakanPrivasi = lazy(() => import('./pages/KebijakanPrivasi'));

function AppShellFallback() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#071520' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: 40, height: 40, border: '3px solid #f06424', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 12px' }} />
        <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 14, fontWeight: 600, letterSpacing: '0.02em' }}>Memuat...</p>
      </div>
    </div>
  );
}

/** Only verifikator can access */
function VerifikatorRoute({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/" replace />;
  if (user.role !== 'verifikator') return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}

/** Admin & verifikator can input data */
function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/" replace />;
  if (user.role !== 'admin' && user.role !== 'verifikator') return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}

function RootRoute() {
  const { loading } = useAuth();
  if (loading) return <AppShellFallback />;
  // Landing page tetap bisa diakses walau sudah login —
  // klik logo/brand di sidebar mengarah ke sini (jangan redirect ke /dashboard).
  return (
    <PageFade>
      <LandingPage />
    </PageFade>
  );
}

function LoginRedirect() {
  const { user } = useAuth();
  // Sudah login → langsung dashboard. Belum login → render form admin/verifikator.
  if (user) return <Navigate to="/dashboard" replace />;
  return (
    <PageFade>
      <Login />
    </PageFade>
  );
}

function PublicPeta() {
  return (
    <PageFade className="min-h-screen">
      <PetaPublik />
    </PageFade>
  );
}

function ProtectedLayout() {
  const { user, loading } = useAuth();
  if (loading) return <AppShellFallback />;
  if (!user) return <Navigate to="/" replace />;
  return <Layout />;
}

function AppRoutes() {
  return (
    <Suspense fallback={<AppShellFallback />}>
      <Routes>
        <Route path="/" element={<RootRoute />} />
        <Route path="/peta" element={<PublicPeta />} />
        <Route path="/login" element={<LoginRedirect />} />
        <Route path="/admin" element={<LoginRedirect />} />
        <Route path="/pedoman-teknis" element={<PedomanTeknisPage />} />
        <Route path="/syarat-ketentuan" element={<SyaratKetentuan />} />
        <Route path="/kebijakan-privasi" element={<KebijakanPrivasi />} />

        <Route element={<ProtectedLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/ekosistem" element={<MonitoringEkosistem />} />
          <Route path="/input-lapangan" element={<AdminRoute><InputLapangan /></AdminRoute>} />
          <Route path="/rekomendasi-lokasi" element={<RekomendasiLokasi />} />
          <Route path="/vegetasi-mangrove" element={<VegetasiMangrove />} />
          <Route path="/pendaratan-penyu" element={<PendaratanPenyu />} />
          <Route path="/verifikasi-data" element={<VerifikatorRoute><VerifikasiData /></VerifikatorRoute>} />
          <Route path="/data-pokmaswas" element={<AdminRoute><DataPokmaswas /></AdminRoute>} />
          <Route path="/laporan" element={<Laporan />} />
          <Route path="/pembibitan-mangrove" element={<PembibitanMangrove />} />
          <Route path="/tekanan-sosial" element={<TekananSosial />} />
          <Route path="/lingkungan" element={<AnalisisLingkungan />} />
          <Route path="/mangrove-nasional" element={<AdminRoute><MangroveNasional /></AdminRoute>} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ClerkBridge />
      <BrowserRouter>
        <AccountNoticeProvider>
          <LoginSuccessToast />
          <AppRoutes />
          <PWAInstallPrompt />
        </AccountNoticeProvider>
      </BrowserRouter>
    </AuthProvider>
  );
}
