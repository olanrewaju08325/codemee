import { motion } from 'framer-motion';
import { PlayCircle, FileText, Zap, BookOpen } from 'lucide-react';
import { Card } from '../../ui/Card';

interface QuickActionsWidgetProps {
  onAction: (action: string) => void;
}

export const QuickActionsWidget = ({ onAction }: QuickActionsWidgetProps) => {
  const actions = [
    { id: 'resume', label: 'Resume Learning', icon: <PlayCircle size={20} />, color: 'var(--color-blue)', bg: 'rgba(12, 74, 140, 0.1)' },
    { id: 'assignments', label: 'View Assignments', icon: <FileText size={20} />, color: 'var(--color-purple)', bg: 'rgba(139, 92, 246, 0.1)' },
    { id: 'ai_tutor', label: 'Ask AI Tutor', icon: <Zap size={20} />, color: '#EC4899', bg: 'rgba(236, 72, 153, 0.1)' },
    { id: 'courses', label: 'Browse Courses', icon: <BookOpen size={20} />, color: '#10B981', bg: 'rgba(16, 185, 129, 0.1)' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Card>
        <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--weight-bold)', fontFamily: 'var(--font-headings)', marginBottom: 'var(--space-4)' }}>
          Quick Actions
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 'var(--space-3)' }}>
          {actions.map((action) => (
            <button
              key={action.id}
              onClick={() => onAction(action.id)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 'var(--space-2)',
                padding: 'var(--space-4)',
                backgroundColor: action.bg,
                border: 'none',
                borderRadius: 'var(--radius-md)',
                cursor: 'pointer',
                transition: 'transform 0.2s ease',
              }}
              onMouseOver={(e) => (e.currentTarget.style.transform = 'translateY(-2px)')}
              onMouseOut={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
            >
              <div style={{ color: action.color }}>{action.icon}</div>
              <span style={{ fontSize: 'var(--text-xs)', fontWeight: 'var(--weight-semibold)', color: 'var(--text-primary)' }}>{action.label}</span>
            </button>
          ))}
        </div>
      </Card>
    </motion.div>
  );
};
