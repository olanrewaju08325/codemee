import { forwardRef } from 'react';
import type { HTMLAttributes } from 'react';

export interface GridProps extends HTMLAttributes<HTMLDivElement> {
  columns?: 1 | 2 | 3 | 4 | { sm?: number; md?: number; lg?: number };
  gap?: 'sm' | 'md' | 'lg' | string;
}

export const Grid = forwardRef<HTMLDivElement, GridProps>(
  ({ className = '', columns = 1, gap = 'md', children, ...props }, ref) => {
    
    // We handle grid logic via inline style for maximum flexibility in this iteration
    const gapMap = {
      sm: 'var(--space-3)',
      md: 'var(--space-5)',
      lg: 'var(--space-8)'
    };

    // Handle responsive grid columns via CSS variables (which requires a small addition to ui.css or inline style)
    // For simplicity without a CSS-in-JS library, if columns is an object, we default to the lg value inline
    // and rely on a className for actual responsiveness. If it's a number, we use it directly.
    const gridCols = typeof columns === 'number' ? columns : (columns.lg || 3);
    const customGap = gapMap[gap as keyof typeof gapMap] || gap;

    return (
      <div 
        ref={ref} 
        className={`responsive-grid ${className}`}
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${gridCols}, minmax(0, 1fr))`, // Default fallback
          gap: customGap,
          ...(typeof columns === 'object' ? {
            '--grid-cols-sm': columns.sm || 1,
            '--grid-cols-md': columns.md || 2,
            '--grid-cols-lg': columns.lg || 3,
          } as React.CSSProperties : {}),
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
