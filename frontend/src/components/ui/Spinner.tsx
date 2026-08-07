
import { Loader2 } from 'lucide-react';

interface SpinnerProps {
  size?: number;
  className?: string;
  color?: string;
}

export const Spinner = ({ size = 24, className = '', color = 'var(--color-primary-500)' }: SpinnerProps) => {
  return (
    <Loader2 
      className={`animate-spin ${className}`} 
      size={size} 
      style={{ color }} 
    />
  );
};
