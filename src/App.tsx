import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout/Layout';
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import PetaInteraktif from './pages/PetaInteraktif';
import MonitoringEkosistem from './pages/MonitoringEkosistem';
import AnalisisLingkungan from './pages/AnalisisLingkungan';
import TekananSosial from './pages/TekananSosial';
import Laporan from './pages/Laporan';
import InputLapangan from './pages/InputLapangan';

/** Hanya bisa diakses admin_nasional */
function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/" replace />;
  if (user.role !== 'admin_nasional') return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}

/** Hanya bisa diakses admin_nasional atau petugas_daerah */
function PetugasRoute({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/" replace />;
  if (user.role === 'viewer') return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}

/** Sudah login → ke dashboard, belum → landing page */
function RootRoute() {
  const { user } = useAuth();
  return user ? <Navigate to="/dashboard" replace /> : <LandingPage />;
}

/** Sudah login → ke dashboard (tidak bisa akses /login lama) */
function LoginRedirect() {
  const { user } = useAuth();
  return user ? <Navigate to="/dashboard" replace /> : <Navigate to="/" replace />;
}

/** Semua route dalam layout memerlukan login */
function ProtectedLayout() {
  const { user, loading } = useAuth();
  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f0fdf4' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: 40, height: 40, border: '3px solid #16a34a', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 12px' }} />
        <p style={{ color: '#16a34a', fontSize: 14, fontWeight: 600 }}>Memuat...</p>
      </div>
    </div>
  );
  if (!user) return <Navigate to="/" replace />;
  return <Layout />;
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<RootRoute />} />
      <Route path="/login" element={<LoginRedirect />} />

      {/* Protected — dalam Layout */}
      <Route element={<ProtectedLayout />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/peta" element={<PetaInteraktif />} />
        <Route path="/ekosistem" element={<MonitoringEkosistem />} />
        <Route path="/lingkungan" element={<AnalisisLingkungan />} />
        <Route path="/tekanan-sosial" element={<TekananSosial />} />

        {/* Admin only */}
        <Route path="/laporan" element={<AdminRoute><Laporan /></AdminRoute>} />

        {/* Petugas + Admin */}
        <Route path="/input-lapangan" element={<PetugasRoute><InputLapangan /></PetugasRoute>} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}
