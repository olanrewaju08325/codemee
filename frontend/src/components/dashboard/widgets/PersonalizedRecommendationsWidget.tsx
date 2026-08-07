import { motion } from 'framer-motion';
import { Lightbulb } from 'lucide-react';
import { Card } from '../../ui/Card';
import { Button } from '../../ui/Button';

interface PersonalizedRecommendationsWidgetProps {
  recommendation?: {
    title: string;
    description: string;
    actionLabel: string;
    actionId: string;
  };
  onAction: (id: string) => void;
}

export const PersonalizedRecommendationsWidget = ({ recommendation, onAction }: PersonalizedRecommendationsWidgetProps) => {
  if (!recommendation) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Card style={{ 
        background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(52, 211, 153, 0.05))',
        border: '1px solid rgba(16, 185, 129, 0.3)'
      }}>
        <div style={{ display: 'flex', gap: 'var(--space-4)' }}>
          <div style={{ color: '#10B981', flexShrink: 0 }}>
            <Lightbulb size={24} />
          </div>
          <div style={{ flex: 1 }}>
            <h4 style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-bold)', color: 'var(--text-primary)' }}>
              {recommendation.title}
            </h4>
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', marginTop: 'var(--space-1)', marginBottom: 'var(--space-3)' }}>
              {recommendation.description}
            </p>
            <Button size="sm" variant="outline" onClick={() => onAction(recommendation.actionId)}>
              {recommendation.actionLabel}
            </Button>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};
