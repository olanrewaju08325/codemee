import { AlertTriangle, RefreshCcw } from 'lucide-react';
import { Button } from './Button';

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
}

export const ErrorState = ({ 
  title = "Something went wrong", 
  message = "We couldn't load this information. Please try again.", 
  onRetry,
  className = ''
}: ErrorStateProps) => {
  // Prevent stack traces or technical paths from leaking to users
  const isTechnicalError = message.includes('at ') || message.includes('.tsx') || message.includes('Error:') || message.includes('500');
  const safeMessage = isTechnicalError ? "A critical infrastructure error occurred. Support has been notified." : message;

  return (
    <div className={`error-state ${className}`} style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center', 
      padding: 'var(--space-6) var(--space-4)',
      textAlign: 'center',
      background: 'var(--color-danger-subtle)',
      borderRadius: 'var(--radius-lg)',
      border: '1px solid var(--color-danger)'
    }}>
      <div style={{ 
        width: 48, 
        height: 48, 
        borderRadius: '50%', 
        background: 'var(--color-danger)', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        color: 'white',
        marginBottom: 'var(--space-4)'
      }}>
        <AlertTriangle size={24} />
      </div>
      
      <h3 style={{ 
        fontSize: 'var(--text-base)', 
        fontWeight: 'var(--weight-bold)', 
        color: 'var(--text-primary)',
        marginBottom: 'var(--space-1)'
      }}>
        {title}
      </h3>
      
      <p style={{ 
        fontSize: 'var(--text-sm)', 
        color: 'var(--text-secondary)',
        maxWidth: '300px',
        marginBottom: onRetry ? 'var(--space-4)' : 0
      }}>
        {safeMessage}
      </p>
      
      {onRetry && (
        <Button onClick={onRetry} variant="primary" style={{ display: 'flex', gap: 'var(--space-2)' }}>
          <RefreshCcw size={16} /> Retry
        </Button>
      )}
    </div>
  );
};
