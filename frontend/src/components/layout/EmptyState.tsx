import type { ReactNode } from 'react';
import { Button } from '../ui/Button';

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const EmptyState = ({ icon, title, description, actionLabel, onAction }: EmptyStateProps) => {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
      padding: 'var(--space-10) var(--space-4)',
      background: 'var(--bg-surface)',
      borderRadius: 'var(--radius-xl)',
      border: '1px dashed var(--border-default)'
    }}>
      {icon && (
        <div style={{ color: 'var(--text-tertiary)', marginBottom: 'var(--space-4)' }}>
          {icon}
        </div>
      )}
      <h3 style={{ fontFamily: 'var(--font-headings)', fontSize: 'var(--text-lg)', fontWeight: 'var(--weight-semibold)', color: 'var(--text-primary)', marginBottom: 'var(--space-2)' }}>
        {title}
      </h3>
      {description && (
        <p style={{ color: 'var(--text-secondary)', maxWidth: '400px', marginBottom: 'var(--space-6)' }}>
          {description}
        </p>
      )}
      {actionLabel && onAction && (
        <Button onClick={onAction}>{actionLabel}</Button>
      )}
    </div>
  );
};
