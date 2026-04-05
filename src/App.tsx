import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import PetaInteraktif from './pages/PetaInteraktif';
import MonitoringEkosistem from './pages/MonitoringEkosistem';
import AnalisisLingkungan from './pages/AnalisisLingkungan';
import TekananSosial from './pages/TekananSosial';
import Laporan from './pages/Laporan';
import InputLapangan from './pages/InputLapangan';

function ProtectedLayout() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return <Layout />;
}

function LoginGuard() {
  const { user } = useAuth();
  if (user) return <Navigate to="/" replace />;
  return <Login />;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginGuard />} />
      <Route element={<ProtectedLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="/peta" element={<PetaInteraktif />} />
        <Route path="/ekosistem" element={<MonitoringEkosistem />} />
        <Route path="/lingkungan" element={<AnalisisLingkungan />} />
        <Route path="/tekanan-sosial" element={<TekananSosial />} />
        <Route path="/laporan" element={<Laporan />} />
        <Route path="/input-lapangan" element={<InputLapangan />} />
      </Route>
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
