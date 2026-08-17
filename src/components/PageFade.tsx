import { type ReactNode, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Global page/text fade wrapper.
 * Re-triggers fade animation on every route change.
 *
 * Juga menjalankan scroll-reveal (IntersectionObserver) untuk:
 *  - Semua elemen `.reveal` di dalam halaman (manual / eksplisit), dan
 *  - Blok konten utama halaman (anak langsung wrapper) — otomatis diberi
 *    class `.reveal` sehingga fade-in terjadi saat scroll ke bawah MAUPUN
 *    ke atas (class `visible` dilepas saat elemen keluar viewport).
 *
 * Blok setinggi (hampir) satu layar penuh — mis. halaman peta/login —
 * otomatis dilewati agar tidak berkedip, kecuali diberi data-no-reveal.
 */
export default function PageFade({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) {
  const location = useLocation();
  const routeKey = `${location.pathname}${location.search}`;
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = containerRef.current;
    if (!root) return;

    // 1) Auto-mark direct children (blok konten halaman) sebagai reveal target.
    const auto: HTMLElement[] = [];
    Array.from(root.children).forEach((el) => {
      if (!(el instanceof HTMLElement)) return;
      if (el.dataset.noReveal !== undefined) return;
      // Lewati blok full-screen (peta, login, dll) — menghindari kedipan.
      if (el.clientHeight >= window.innerHeight * 0.9) return;
      el.classList.add('reveal');
      auto.push(el);
    });

    // 2) Amati semua reveal target: otomatis + eksplisit (.reveal) di dalamnya.
    const targets = Array.from(root.querySelectorAll<HTMLElement>('.reveal'));

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          } else if (!entry.target.classList.contains('reveal-once')) {
            // Reset saat keluar viewport → animasi ulang saat scroll ke atas.
            entry.target.classList.remove('visible');
          }
        });
      },
      { threshold: 0.12 }
    );

    targets.forEach((el) => observer.observe(el));
    return () => {
      observer.disconnect();
      // Bersihkan class otomatis agar tidak menumpuk saat route berganti.
      auto.forEach((el) => el.classList.remove('reveal', 'visible'));
    };
  }, [routeKey]);

  return (
    <div
      ref={containerRef}
      key={routeKey}
      className={`page-fade text-fade-scope ${className}`.trim()}
    >
      {children}
    </div>
  );
}
