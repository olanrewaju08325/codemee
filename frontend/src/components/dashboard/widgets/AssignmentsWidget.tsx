import { motion } from 'framer-motion';
import { ClipboardList, Clock, CheckCircle } from 'lucide-react';
import { Card } from '../../ui/Card';
import { EmptyState } from '../../ui/EmptyState';

interface AssignmentsWidgetProps {
  assignments: any[];
  onViewAssignments: () => void;
}

export const AssignmentsWidget = ({ assignments, onViewAssignments }: AssignmentsWidgetProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
      style={{ height: '100%' }}
    >
      <Card style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
          <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--weight-bold)', fontFamily: 'var(--font-headings)' }}>
            Assignments
          </h3>
          <button onClick={onViewAssignments} style={{ background: 'none', border: 'none', color: 'var(--color-blue)', fontSize: 'var(--text-xs)', fontWeight: 'var(--weight-semibold)', cursor: 'pointer' }}>
            View all
          </button>
        </div>

        {assignments.length === 0 ? (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <EmptyState 
              title="No assignments"
              description="You have no pending assignments right now."
              icon={<ClipboardList size={32} />}
            />
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            {assignments.map((assignment) => (
              <div key={assignment.id} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', padding: 'var(--space-3)', backgroundColor: 'var(--bg-primary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-default)' }}>
                <div style={{ color: assignment.status === 'graded' ? 'var(--color-success)' : assignment.status === 'submitted' ? 'var(--color-blue)' : 'var(--color-warning)' }}>
                  {assignment.status === 'graded' || assignment.status === 'submitted' ? <CheckCircle size={20} /> : <Clock size={20} />}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h4 style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-semibold)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{assignment.assignment?.title || 'Assignment'}</h4>
                  <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>Status: <span style={{ textTransform: 'capitalize' }}>{assignment.status}</span></p>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </motion.div>
  );
};
