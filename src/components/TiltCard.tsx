import { type HTMLAttributes, type ReactNode } from 'react';
import { useTilt } from '../hooks/useTilt';

type TiltCardProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
  className?: string;
};

/**
 * Kartu glassmorphism dengan efek 3D tilt mengikuti kursor + glare highlight.
 */
export default function TiltCard({ children, className = '', ...rest }: TiltCardProps) {
  const ref = useTilt<HTMLDivElement>();

  return (
    <div ref={ref} className={`tilt-card ${className}`.trim()} {...rest}>
      {children}
    </div>
  );
}
