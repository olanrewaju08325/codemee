import { forwardRef } from 'react';
import type { HTMLAttributes } from 'react';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info';
}

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className = '', variant = 'default', children, ...props }, ref) => {
    return (
      <span ref={ref} className={`ui-badge ui-badge-${variant} ${className}`} {...props}>
        {children}
      </span>
    );
  }
);
Badge.displayName = 'Badge';
