import { Menu, Bell, User as UserIcon, Flame } from 'lucide-react';
import { Button } from '../ui/Button';
import { GlobalSearch } from '../navigation/GlobalSearch';

interface HeaderProps {
  onMenuToggle: () => void;
  userName?: string;
  streakCount?: number;
  unreadNotifications?: number;
  onNotificationsClick?: () => void;
}

const getTimeGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
};

export const Header = ({ 
  onMenuToggle, 
  userName = 'User',
  streakCount = 1,
  unreadNotifications = 0,
  onNotificationsClick
}: HeaderProps) => {
  return (
    <header className="app-header">
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
        <button 
          onClick={onMenuToggle}
          className="btn btn-ghost"
          style={{ padding: 'var(--space-2)', minHeight: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          aria-label="Toggle menu"
        >
          <Menu size={24} />
        </button>

        <GlobalSearch />
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
        
        {/* Streak Indicator */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 'var(--space-1)', 
          background: 'rgba(245, 158, 11, 0.1)', 
          padding: 'var(--space-1) var(--space-3)', 
          borderRadius: 'var(--radius-full)',
          marginRight: 'var(--space-2)'
        }}>
          <Flame size={16} color="#F59E0B" />
          <span style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-bold)', color: '#F59E0B' }}>
            {streakCount}
          </span>
        </div>

        <div style={{ position: 'relative' }}>
          <Button variant="ghost" size="icon" aria-label="Notifications" onClick={onNotificationsClick}>
            <Bell size={20} />
          </Button>
          {unreadNotifications > 0 && (
            <span style={{
              position: 'absolute',
              top: '4px',
              right: '4px',
              background: 'var(--color-danger)',
              color: 'white',
              fontSize: '10px',
              fontWeight: 'bold',
              minWidth: '16px',
              height: '16px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '0 4px',
              pointerEvents: 'none'
            }}>
              {unreadNotifications > 99 ? '99+' : unreadNotifications}
            </span>
          )}
        </div>
        <div style={{ width: '1px', height: '24px', background: 'var(--border-default)', margin: '0 var(--space-2)' }} />
        
        <button 
          style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', background: 'transparent', border: 'none', cursor: 'pointer' }}
        >
          <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--bg-surface-hover)', border: '1px solid var(--border-default)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <UserIcon size={16} color="var(--text-secondary)" />
          </div>
          <div className="hidden-mobile" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
            <span style={{ fontSize: '10px', color: 'var(--text-tertiary)', fontWeight: 'var(--weight-medium)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {getTimeGreeting()},
            </span>
            <span style={{ fontFamily: 'var(--font-headings)', fontWeight: 'var(--weight-semibold)', fontSize: 'var(--text-sm)', color: 'var(--text-primary)', lineHeight: 1.2 }}>
              {userName}
            </span>
          </div>
        </button>
      </div>
    </header>
  );
};
