import type { ReactNode } from 'react';

interface PageContainerProps {
  children: ReactNode;
  variant?: 'full' | 'standard' | 'reading' | 'dashboard';
  className?: string;
}

export const PageContainer = ({ children, variant = 'standard', className = '' }: PageContainerProps) => {
  return (
    <div className={`page-container page-container-${variant} ${className}`}>
      {children}
    </div>
  );
};
