import type { HTMLAttributes } from 'react';

interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  width?: string | number;
  height?: string | number;
  borderRadius?: string | number;
  variant?: 'text' | 'circular' | 'rectangular';
}

export const Skeleton = ({ 
  width, 
  height, 
  borderRadius,
  variant = 'text',
  className = '',
  style,
  ...props 
}: SkeletonProps) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'circular':
        return { borderRadius: '50%', height: height || width || '40px', width: width || height || '40px' };
      case 'rectangular':
        return { borderRadius: borderRadius || 'var(--radius-md)', height: height || '100px', width: width || '100%' };
      case 'text':
      default:
        return { borderRadius: borderRadius || 'var(--radius-sm)', height: height || '1em', width: width || '100%' };
    }
  };

  return (
    <div 
      className={`skeleton-loader ${className}`}
      style={{ 
        ...getVariantStyles(),
        background: 'var(--bg-surface-hover)',
        backgroundImage: 'linear-gradient(90deg, var(--bg-surface-hover) 0px, var(--border-default) 40px, var(--bg-surface-hover) 80px)',
        backgroundSize: '200% 100%',
        animation: 'shimmer 1.5s infinite linear',
        ...style 
      }}
      {...props}
    />
  );
};

// Add shimmer keyframes to document if not present
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.innerHTML = `
    @keyframes shimmer {
      0% { background-position: -200% 0; }
      100% { background-position: 200% 0; }
    }
  `;
  document.head.appendChild(style);
}
