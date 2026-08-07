import type { ReactNode } from 'react';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  breadcrumbs?: ReactNode;
  actions?: ReactNode;
}

export const PageHeader = ({ title, subtitle, breadcrumbs, actions }: PageHeaderProps) => {
  return (
    <div className="page-header">
      <div>
        {breadcrumbs && <div style={{ marginBottom: 'var(--space-2)' }}>{breadcrumbs}</div>}
        <h1 className="page-title">{title}</h1>
        {subtitle && <p className="page-subtitle">{subtitle}</p>}
      </div>
      
      {actions && (
        <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
          {actions}
        </div>
      )}
    </div>
  );
};
