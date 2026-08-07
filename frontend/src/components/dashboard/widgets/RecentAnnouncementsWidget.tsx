import { Volume2 } from 'lucide-react';
import { Card } from '../../ui/Card';

interface RecentAnnouncementsWidgetProps {
  announcement: any;
}

export const RecentAnnouncementsWidget = ({ announcement }: RecentAnnouncementsWidgetProps) => {
  if (!announcement) return null;
  
  return (
    <Card style={{ 
      backgroundColor: 'rgba(12, 74, 140, 0.1)', 
      border: '1px solid rgba(12, 74, 140, 0.3)',
      padding: 'var(--space-4)',
      display: 'flex',
      gap: 'var(--space-3)',
      alignItems: 'center'
    }}>
      <div style={{ flexShrink: 0, color: 'var(--color-blue)', backgroundColor: '#ffffff', borderRadius: '50%', width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--shadow-sm)' }}>
        <Volume2 size={20} />
      </div>
      <div>
        <h4 style={{ fontSize: 'var(--text-xs)', fontWeight: 'var(--weight-bold)', color: 'var(--color-blue)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Latest Announcement
        </h4>
        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-primary)', marginTop: 'var(--space-1)', fontWeight: 'var(--weight-medium)' }}>
          {announcement.content}
        </p>
      </div>
    </Card>
  );
};
