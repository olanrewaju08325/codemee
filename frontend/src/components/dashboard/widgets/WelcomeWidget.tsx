import { Card } from '../../ui/Card';

interface WelcomeWidgetProps {
  fullName: string;
  studentId: string;
  batchName: string;
  avatarUrl: string | null;
}

const renderAvatar = (avatarUrl: string | null, size = 48) => {
  if (!avatarUrl) return <span style={{ fontSize: `${size * 0.55}px` }}>🇳🇬👨‍💻</span>;
  if (avatarUrl.startsWith('data:image') || avatarUrl.startsWith('http')) {
    return <img src={avatarUrl} alt="Avatar" style={{ width: `${size}px`, height: `${size}px`, borderRadius: '50%', objectFit: 'cover' }} />;
  }
  const presets: Record<string, string> = {
    'Lagos Developer': '🇳🇬👨‍💻',
    'Abuja Coder': '🇳🇬👩‍💻',
    'Ibadan Hacker': '🇳🇬🚀',
    'Benin Techie': '🇳🇬💡'
  };
  return <span style={{ fontSize: `${size * 0.55}px` }}>{presets[avatarUrl] || '🇳🇬👨‍💻'}</span>;
};

export const WelcomeWidget = ({ fullName, studentId, batchName, avatarUrl }: WelcomeWidgetProps) => {
  return (
    <Card style={{ 
      background: 'linear-gradient(135deg, var(--color-blue) 0%, var(--color-purple) 100%)', 
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
          backgroundColor: 'rgba(255, 255, 255, 0.2)', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          overflow: 'hidden', 
          flexShrink: 0 
        }}>
          {renderAvatar(avatarUrl, 64)}
        </div>
        <div>
          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-cyan)', fontWeight: 'var(--weight-bold)', letterSpacing: '1px', textTransform: 'uppercase' }}>
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
