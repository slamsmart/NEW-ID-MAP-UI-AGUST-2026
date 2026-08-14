import { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import PageFade from '../PageFade';

const pageTitles: Record<string, { title: string; subtitle: string }> = {
  '/': { title: 'Dashboard Nasional', subtitle: 'Ringkasan kondisi mangrove & pesisir Indonesia' },
  '/peta': { title: 'Peta Interaktif', subtitle: 'Visualisasi spasial sebaran mangrove & kawasan pesisir' },
  '/ekosistem': { title: 'Monitoring Kondisi Ekosistem', subtitle: 'Parameter evaluasi kesehatan ekosistem mangrove' },
  '/lingkungan': { title: 'Analisis Lingkungan & Biofisik', subtitle: 'Kualitas perairan, substrat, dan regime pasang surut' },
  '/tekanan-sosial': { title: 'Tekanan & Sosial-Ekonomi', subtitle: 'Pemetaan risiko dan faktor keberlanjutan program' },
  '/laporan': { title: 'Laporan & Analitik', subtitle: 'Laporan komprehensif, rekomendasi kebijakan, dan analisis tren multi-temporal' },
  '/input-lapangan': { title: 'Input Data Lapangan (EcoTrack)', subtitle: '' },
  '/rekomendasi-lokasi': { title: 'Rekomendasi Lokasi Penanaman', subtitle: '' },
  '/pembibitan-mangrove': { title: 'Lokasi Pembibitan Mangrove', subtitle: 'Nursery mangrove tersertifikasi BRGM/KLHK – SNI 7604:2011 · Data 2025' },
  '/mangrove-nasional': { title: 'Luasan Mangrove Nasional', subtitle: 'Data Peta Mangrove Nasional (PMN) 2025 per Kabupaten/Kota se-Indonesia – KLHK / BRGM [ADMIN]' },
};

export default function Layout() {
  const location = useLocation();
  const pageInfo = pageTitles[location.pathname] || { title: 'ID-MAP', subtitle: '' };
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Dynamic document title per page
  useEffect(() => {
    document.title = `${pageInfo.title} — ID-MAP`;
  }, [pageInfo.title]);

  return (
    <div
      className="flex h-dvh text-gray-900 bg-[#f4fcf0]"
    >
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col min-w-0 min-h-0">
        <Header
          title={pageInfo.title}
          subtitle={pageInfo.subtitle}
          onMenuClick={() => setSidebarOpen(true)}
        />
        <main className="flex-1 min-h-0 overflow-y-auto p-4 md:p-8 bg-[#f4fcf0] pb-safe">
          <PageFade>
            <Outlet />
          </PageFade>
        </main>
      </div>
    </div>
  );
}
