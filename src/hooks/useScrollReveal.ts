import { useEffect } from 'react';

/**
 * Observes all `.reveal` elements inside `containerRef` (or the entire document
 * when no ref is provided) and adds the `.visible` class when they enter the viewport.
 */
export function useScrollReveal(selector = '.reveal') {
  useEffect(() => {
    const elements = document.querySelectorAll<HTMLElement>(selector);
    if (!elements.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          } else if (!entry.target.classList.contains('reveal-once')) {
            // Reset saat keluar viewport agar animasi ulang saat scroll ke atas
            // Kecuali elemen dengan reveal-once (misal hero)
            entry.target.classList.remove('visible');
          }
        });
      },
      { threshold: 0.12 }
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [selector]);
}
