import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { useAuth } from './context/useAuth';
import Layout from './components/Layout/Layout';
import ClerkBridge from './components/ClerkBridge';

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

function AppShellFallback() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f0fdf4' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: 40, height: 40, border: '3px solid #16a34a', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 12px' }} />
        <p style={{ color: '#16a34a', fontSize: 14, fontWeight: 600 }}>Memuat...</p>
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
  const { user } = useAuth();
  return user ? <Navigate to="/dashboard" replace /> : <LandingPage />;
}

function LoginRedirect() {
  const { user } = useAuth();
  // Sudah login → langsung dashboard. Belum login → render form admin/verifikator.
  return user ? <Navigate to="/dashboard" replace /> : <Login />;
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
        <Route path="/peta" element={<PetaPublik />} />
        <Route path="/login" element={<LoginRedirect />} />

        <Route element={<ProtectedLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/ekosistem" element={<MonitoringEkosistem />} />
          <Route path="/input-lapangan" element={<AdminRoute><InputLapangan /></AdminRoute>} />
          <Route path="/rekomendasi-lokasi" element={<RekomendasiLokasi />} />
          <Route path="/vegetasi-mangrove" element={<VegetasiMangrove />} />
          <Route path="/pendaratan-penyu" element={<PendaratanPenyu />} />
          <Route path="/verifikasi-data" element={<VerifikatorRoute><VerifikasiData /></VerifikatorRoute>} />
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
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}
