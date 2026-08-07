import { Calendar, ChevronRight } from 'lucide-react';
import { Card } from '../../ui/Card';
import { EmptyState } from '../../ui/EmptyState';

interface UpcomingClassesWidgetProps {
  classes: any[];
  onViewAll: () => void;
}

export const UpcomingClassesWidget = ({ classes, onViewAll }: UpcomingClassesWidgetProps) => {
  return (
    <Card style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
        <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--weight-bold)', fontFamily: 'var(--font-headings)' }}>
          Upcoming Live Classes
        </h3>
        <button onClick={onViewAll} style={{ background: 'none', border: 'none', color: 'var(--color-blue)', fontSize: 'var(--text-xs)', fontWeight: 'var(--weight-semibold)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
          View all <ChevronRight size={14} />
        </button>
      </div>

      {classes.length === 0 ? (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <EmptyState 
            title="No live classes scheduled"
            description="Your instructor will schedule live webinars soon."
            icon={<Calendar size={32} />}
          />
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          {classes.map((cls, index) => (
            <div key={index} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', padding: 'var(--space-3)', backgroundColor: 'var(--bg-primary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-default)' }}>
              <div style={{ backgroundColor: 'rgba(139, 92, 246, 0.1)', color: 'var(--color-purple)', width: '36px', height: '36px', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Calendar size={18} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <h4 style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-semibold)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{cls.title}</h4>
                <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>{new Date(cls.scheduled_at).toLocaleString()}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};
