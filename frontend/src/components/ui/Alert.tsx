import { forwardRef } from 'react';
import type { HTMLAttributes, ReactNode } from 'react';

export interface AlertProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'info' | 'success' | 'warning' | 'danger';
  icon?: ReactNode;
  title?: string;
}

export const Alert = forwardRef<HTMLDivElement, AlertProps>(
  ({ className = '', variant = 'info', icon, title, children, ...props }, ref) => {
    return (
      <div ref={ref} className={`ui-alert ui-alert-${variant} ${className}`} role="alert" {...props}>
        {icon && <div className="ui-alert-icon">{icon}</div>}
        <div className="ui-alert-content">
          {title && <h5 className="ui-alert-title">{title}</h5>}
          <div className="ui-alert-desc">{children}</div>
        </div>
      </div>
    );
  }
);
Alert.displayName = 'Alert';
