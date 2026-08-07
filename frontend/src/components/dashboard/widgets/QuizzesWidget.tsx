import { motion } from 'framer-motion';
import { HelpCircle, Clock, CheckCircle } from 'lucide-react';
import { Card } from '../../ui/Card';
import { EmptyState } from '../../ui/EmptyState';

interface QuizzesWidgetProps {
  attempts: any[];
  onViewQuizzes: () => void;
}

export const QuizzesWidget = ({ attempts, onViewQuizzes }: QuizzesWidgetProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
      style={{ height: '100%' }}
    >
      <Card style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
          <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--weight-bold)', fontFamily: 'var(--font-headings)' }}>
            Recent Quizzes
          </h3>
          <button onClick={onViewQuizzes} style={{ background: 'none', border: 'none', color: 'var(--color-blue)', fontSize: 'var(--text-xs)', fontWeight: 'var(--weight-semibold)', cursor: 'pointer' }}>
            View all
          </button>
        </div>

        {attempts.length === 0 ? (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <EmptyState 
              title="No quiz attempts"
              description="You haven't taken any quizzes yet."
              icon={<HelpCircle size={32} />}
            />
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            {attempts.slice(0, 3).map((attempt) => {
              const isPassed = attempt.score >= 70;
              return (
                <div key={attempt.id} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', padding: 'var(--space-3)', backgroundColor: 'var(--bg-primary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-default)' }}>
                  <div style={{ color: isPassed ? 'var(--color-success)' : 'var(--color-danger)' }}>
                    {isPassed ? <CheckCircle size={20} /> : <Clock size={20} />}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h4 style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-semibold)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{attempt.quiz?.title || 'Quiz'}</h4>
                    <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>Score: {attempt.score}%</p>
                  </div>
                  <div style={{ fontSize: 'var(--text-xs)', fontWeight: 'var(--weight-bold)', color: isPassed ? 'var(--color-success)' : 'var(--color-danger)' }}>
                    {isPassed ? 'Passed' : 'Failed'}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </motion.div>
  );
};
