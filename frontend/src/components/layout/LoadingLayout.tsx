import { Spinner } from '../ui/Spinner';

interface LoadingLayoutProps {
  message?: string;
}

export const LoadingLayout = ({ message = 'Loading...' }: LoadingLayoutProps) => {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '400px',
      width: '100%',
      gap: 'var(--space-4)'
    }}>
      <Spinner size={32} />
      <span style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-medium)' }}>
        {message}
      </span>
    </div>
  );
};
