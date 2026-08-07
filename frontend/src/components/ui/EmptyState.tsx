import type { ReactNode } from 'react';
import { Button } from './Button';
import { Inbox } from 'lucide-react';

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: ReactNode;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState = ({ 
  title, 
  description, 
  icon = <Inbox size={48} strokeWidth={1} />,
  actionLabel, 
  onAction,
  className = ''
}: EmptyStateProps) => {
  return (
    <div className={`empty-state ${className}`} style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center', 
      padding: 'var(--space-8) var(--space-4)',
      textAlign: 'center',
      background: 'var(--bg-primary)',
      borderRadius: 'var(--radius-lg)',
      border: '1px dashed var(--border-default)'
    }}>
      <div style={{ color: 'var(--text-tertiary)', marginBottom: 'var(--space-4)' }}>
        {icon}
      </div>
      <h3 style={{ 
        fontSize: 'var(--text-lg)', 
        fontWeight: 'var(--weight-semibold)', 
        color: 'var(--text-primary)',
        marginBottom: 'var(--space-2)'
      }}>
        {title}
      </h3>
      <p style={{ 
        fontSize: 'var(--text-sm)', 
        color: 'var(--text-secondary)',
        maxWidth: '400px',
        marginBottom: actionLabel ? 'var(--space-6)' : 0
      }}>
        {description}
      </p>
      
      {actionLabel && onAction && (
        <Button onClick={onAction} variant="outline">
          {actionLabel}
        </Button>
      )}
    </div>
  );
};
