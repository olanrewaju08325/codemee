import { motion } from 'framer-motion';
import { Target, CheckCircle, BookOpen, Clock } from 'lucide-react';
import { Card } from '../../ui/Card';

interface LearningProgressWidgetProps {
  stats: any;
}

export const LearningProgressWidget = ({ stats }: LearningProgressWidgetProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      style={{ height: '100%' }}
    >
      <Card style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--weight-bold)', fontFamily: 'var(--font-headings)', marginBottom: 'var(--space-4)' }}>
          Learning Progress
        </h3>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)', flex: 1 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', color: 'var(--text-secondary)' }}>
              <BookOpen size={16} />
              <span style={{ fontSize: 'var(--text-xs)' }}>Lessons</span>
            </div>
            <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--weight-bold)' }}>{stats?.lessons_completed || 0}</div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', color: 'var(--text-secondary)' }}>
              <CheckCircle size={16} />
              <span style={{ fontSize: 'var(--text-xs)' }}>Quizzes</span>
            </div>
            <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--weight-bold)' }}>{stats?.quizzes_passed || 0}</div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', color: 'var(--text-secondary)' }}>
              <Target size={16} />
              <span style={{ fontSize: 'var(--text-xs)' }}>Streak</span>
            </div>
            <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--weight-bold)', color: '#F59E0B' }}>{stats?.streak_count || 0}</div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', color: 'var(--text-secondary)' }}>
              <Clock size={16} />
              <span style={{ fontSize: 'var(--text-xs)' }}>Hours</span>
            </div>
            <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--weight-bold)' }}>{stats?.study_hours || 0}</div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};
