import { useEffect, useState, type ReactNode } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Global page/text fade wrapper.
 * Re-triggers fade animation on every route change.
 */
export default function PageFade({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) {
  const location = useLocation();
  const [tick, setTick] = useState(0);

  useEffect(() => {
    setTick(t => t + 1);
  }, [location.pathname]);

  return (
    <div
      key={tick}
      className={`page-fade text-fade-scope ${className}`.trim()}
    >
      {children}
    </div>
  );
}
