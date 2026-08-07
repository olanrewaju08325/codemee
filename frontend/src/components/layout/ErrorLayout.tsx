import { AlertTriangle } from 'lucide-react';
import { Button } from '../ui/Button';

interface ErrorLayoutProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export const ErrorLayout = ({ 
  title = 'Something went wrong', 
  message = 'We encountered an unexpected error. Please try again.',
  onRetry 
}: ErrorLayoutProps) => {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
      padding: 'var(--space-10) var(--space-4)',
      minHeight: '400px'
    }}>
      <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--color-danger-bg)', color: 'var(--color-danger)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 'var(--space-6)' }}>
        <AlertTriangle size={32} />
      </div>
      <h2 style={{ fontFamily: 'var(--font-headings)', fontSize: 'var(--text-xl)', fontWeight: 'var(--weight-bold)', color: 'var(--text-primary)', marginBottom: 'var(--space-2)' }}>
        {title}
      </h2>
      <p style={{ color: 'var(--text-secondary)', maxWidth: '400px', marginBottom: 'var(--space-6)' }}>
        {message}
      </p>
      {onRetry && (
        <Button onClick={onRetry} variant="secondary">
          Try Again
        </Button>
      )}
    </div>
  );
};
