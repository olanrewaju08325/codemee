import { Card } from '../../ui/Card';

interface WelcomeWidgetProps {
  fullName: string;
  studentId: string;
  batchName: string;
  avatarUrl: string | null;
}

const initials = (name: string) => {
  const parts = (name || '').trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'S';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

const renderAvatar = (avatarUrl: string | null, fullName: string, size = 64) => {
  if (avatarUrl && (avatarUrl.startsWith('data:image') || avatarUrl.startsWith('http'))) {
    return <img src={avatarUrl} alt={fullName || 'Avatar'} style={{ width: `${size}px`, height: `${size}px`, borderRadius: '50%', objectFit: 'cover' }} />;
  }
  return (
    <span style={{ fontFamily: 'var(--font-headings)', fontWeight: 'var(--weight-extrabold)', fontSize: `${size * 0.36}px`, color: '#FFFFFF', letterSpacing: '0.5px' }}>
      {initials(fullName)}
    </span>
  );
};

export const WelcomeWidget = ({ fullName, studentId, batchName, avatarUrl }: WelcomeWidgetProps) => {
  return (
    <Card style={{
      background: 'var(--brand-gradient-deep)',
      color: '#FFFFFF',
      border: 'none',
      height: '100%',
      display: 'flex',
      alignItems: 'center'
    }}>
      <div style={{ display: 'flex', gap: 'var(--space-4)', alignItems: 'center' }}>
        <div style={{
          width: '64px',
          height: '64px',
          borderRadius: '50%',
          backgroundColor: 'rgba(255, 255, 255, 0.18)',
          border: '2px solid rgba(255, 255, 255, 0.35)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          flexShrink: 0
        }}>
          {renderAvatar(avatarUrl, fullName, 64)}
        </div>
        <div>
          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-accent-500)', fontWeight: 'var(--weight-bold)', letterSpacing: '1px', textTransform: 'uppercase' }}>
            Student Profile
          </span>
          <h2 style={{ color: '#FFFFFF', fontSize: 'var(--text-xl)', fontWeight: 'var(--weight-extrabold)', marginTop: 'var(--space-1)', fontFamily: 'var(--font-headings)' }}>
            {fullName || 'Student'}
          </h2>
          <div style={{ display: 'flex', gap: 'var(--space-2)', marginTop: 'var(--space-2)', flexWrap: 'wrap' }}>
            <span style={{ fontSize: 'var(--text-xs)', backgroundColor: 'rgba(255, 255, 255, 0.15)', color: '#FFFFFF', padding: 'var(--space-1) var(--space-2)', borderRadius: 'var(--radius-sm)', fontWeight: 'var(--weight-semibold)' }}>
              ID: {studentId || 'Pending'}
            </span>
            <span style={{ fontSize: 'var(--text-xs)', backgroundColor: 'rgba(255, 255, 255, 0.15)', color: '#FFFFFF', padding: 'var(--space-1) var(--space-2)', borderRadius: 'var(--radius-sm)', fontWeight: 'var(--weight-semibold)' }}>
              {batchName || 'Waitlisted'}
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
};
