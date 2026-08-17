import { useEffect, useRef } from 'react';

const DEFAULT_MAX_TILT = 8; // derajat rotasi maksimal

/**
 * Efek tilt 3D mengikuti kursor (seperti kartu "liquid glass").
 * Mengisi CSS variables pada elemen:
 *   --rx / --ry → rotasi rotateX/rotateY (dipakai CSS .tilt-card)
 *   --gx / --gy → posisi glare highlight (dipakai .tilt-card::before)
 */
export function useTilt<T extends HTMLElement = HTMLDivElement>(maxTilt = DEFAULT_MAX_TILT) {
  const ref = useRef<T | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let raf = 0;

    const onMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;
      const px = (e.clientX - rect.left) / rect.width;
      const py = (e.clientY - rect.top) / rect.height;
      const rx = (0.5 - py) * maxTilt; // hover di atas → miring ke belakang
      const ry = (px - 0.5) * maxTilt; // hover di kanan → miring ke kanan

      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        el.style.setProperty('--rx', `${rx.toFixed(2)}deg`);
        el.style.setProperty('--ry', `${ry.toFixed(2)}deg`);
        el.style.setProperty('--gx', `${(px * 100).toFixed(1)}%`);
        el.style.setProperty('--gy', `${(py * 100).toFixed(1)}%`);
      });
    };

    const onLeave = () => {
      cancelAnimationFrame(raf);
      el.style.setProperty('--rx', '0deg');
      el.style.setProperty('--ry', '0deg');
    };

    el.addEventListener('mousemove', onMove);
    el.addEventListener('mouseleave', onLeave);
    return () => {
      cancelAnimationFrame(raf);
      el.removeEventListener('mousemove', onMove);
      el.removeEventListener('mouseleave', onLeave);
    };
  }, [maxTilt]);

  return ref;
}
