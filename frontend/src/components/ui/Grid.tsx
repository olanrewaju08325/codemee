import { forwardRef } from 'react';
import type { HTMLAttributes } from 'react';

export interface GridProps extends HTMLAttributes<HTMLDivElement> {
  columns?: 1 | 2 | 3 | 4 | { sm?: number; md?: number; lg?: number };
  gap?: 'sm' | 'md' | 'lg' | string;
}

export const Grid = forwardRef<HTMLDivElement, GridProps>(
  ({ className = '', columns = 1, gap = 'md', children, ...props }, ref) => {
    
    const gapMap = {
      sm: 'var(--space-3)',
      md: 'var(--space-5)',
      lg: 'var(--space-8)'
    };

    const customGap = gapMap[gap as keyof typeof gapMap] || gap;

    return (
      <div 
        ref={ref} 
        className={`responsive-grid ${className}`}
        style={{
          display: 'grid',
          gap: customGap,
          ...(typeof columns === 'number' ? {
             gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`
          } : {
             // For responsive objects, use CSS variables for a media query fallback in index.css
             // or simply rely on flex-wrap / auto-fit in the parent if index.css isn't set up.
             // We inject the CSS var for the max columns and let CSS handle the break points.
             gridTemplateColumns: `repeat(auto-fit, minmax(min(100%, 320px), 1fr))`,
            '--grid-cols-sm': columns.sm || 1,
            '--grid-cols-md': columns.md || 2,
            '--grid-cols-lg': columns.lg || 3,
          } as React.CSSProperties),
          ...props.style
        }}
        {...props}
      >
        {children}
      </div>
    );
  }
);
Grid.displayName = 'Grid';
