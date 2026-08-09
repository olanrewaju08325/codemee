import { ClipboardList } from 'lucide-react';
import { Card } from '../../ui/Card';
import { EmptyState } from '../../ui/EmptyState';

interface DeadlinesWidgetProps {
  deadlines: any[];
}

export const DeadlinesWidget = ({ deadlines }: DeadlinesWidgetProps) => {
  return (
    <Card style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
        <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--weight-bold)', fontFamily: 'var(--font-headings)' }}>
          Upcoming Deadlines
        </h3>
      </div>

      {deadlines.length === 0 ? (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <EmptyState 
            title="No impending deadlines"
            description="You're all caught up on your assignments and quizzes!"
            icon={<ClipboardList size={32} />}
          />
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          {deadlines.map((deadline, index) => {
            const accent = deadline.color || 'var(--color-warning)';
            return (
              <div key={index} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', padding: 'var(--space-3)', backgroundColor: 'var(--bg-surface-hover)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-default)' }}>
                <div style={{ width: 34, height: 34, borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, background: 'var(--color-warning-bg)', color: 'var(--color-warning-text)' }}>
                  <ClipboardList size={17} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h4 style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-semibold)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{deadline.label}</h4>
                  <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>{deadline.course}</p>
                </div>
                <div style={{ fontSize: 'var(--text-xs)', fontWeight: 'var(--weight-bold)', color: accent, backgroundColor: 'var(--color-warning-bg)', padding: '4px 8px', borderRadius: 'var(--radius-sm)', whiteSpace: 'nowrap' }}>
                  {deadline.due}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
};
