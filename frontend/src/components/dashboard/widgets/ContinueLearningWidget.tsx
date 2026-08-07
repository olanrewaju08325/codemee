import { BookOpen, ChevronRight } from 'lucide-react';
import { Card } from '../../ui/Card';
import { Button } from '../../ui/Button';

interface ContinueLearningWidgetProps {
  courseName: string;
  lessonName: string;
  progressPercent: number;
  completedLessons: number;
  totalLessons: number;
  onResume: () => void;
  isWaitlisted?: boolean;
}

export const ContinueLearningWidget = ({
  courseName,
  lessonName,
  progressPercent,
  completedLessons,
  totalLessons,
  onResume,
  isWaitlisted
}: ContinueLearningWidgetProps) => {
  return (
    <Card style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)', height: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--weight-bold)', fontFamily: 'var(--font-headings)' }}>
          Continue Learning
        </h3>
        <div style={{ backgroundColor: 'rgba(12, 74, 140, 0.1)', color: 'var(--color-blue)', width: '40px', height: '40px', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <BookOpen size={20} />
        </div>
      </div>

      <div style={{ flex: 1 }}>
        <h4 style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--weight-semibold)', color: 'var(--text-primary)' }}>{courseName}</h4>
        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', marginTop: 'var(--space-1)' }}>Up next: {lessonName}</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--text-xs)', fontWeight: 'var(--weight-semibold)' }}>
          <span>Course Progress</span>
          <span>{progressPercent}% ({completedLessons}/{totalLessons} lessons)</span>
        </div>
        <div style={{ width: '100%', height: '8px', backgroundColor: 'var(--bg-surface-hover)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
          <div style={{ width: `${progressPercent}%`, height: '100%', backgroundColor: 'var(--color-blue)', transition: 'width 0.5s ease-out' }} />
        </div>
      </div>

      <Button 
        variant={isWaitlisted ? 'outline' : 'primary'} 
        fullWidth 
        onClick={onResume}
        disabled={isWaitlisted}
        style={{ display: 'flex', justifyContent: 'space-between' }}
      >
        {isWaitlisted ? 'Waitlist Active' : 'Resume Learning'} 
        <ChevronRight size={18} />
      </Button>
    </Card>
  );
};
