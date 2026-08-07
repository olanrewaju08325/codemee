import { motion } from 'framer-motion';
import { Activity } from 'lucide-react';
import { Card } from '../../ui/Card';
import { EmptyState } from '../../ui/EmptyState';

interface RecentActivityWidgetProps {
  activities?: any[];
}

export const RecentActivityWidget = ({ activities = [] }: RecentActivityWidgetProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.3 }}
      style={{ height: '100%' }}
    >
      <Card style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--weight-bold)', fontFamily: 'var(--font-headings)', marginBottom: 'var(--space-4)' }}>
          Recent Activity
        </h3>

        {activities.length === 0 ? (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <EmptyState 
              title="No recent activity"
              description="Your recent learning actions will appear here."
              icon={<Activity size={32} />}
            />
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            {/* Real implementation will map activities here */}
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>Activity feed coming soon.</p>
          </div>
        )}
      </Card>
    </motion.div>
  );
};
