import { Plus, PlayCircle, FileText, Upload } from 'lucide-react';
import { Button } from '../ui/Button';

interface QuickAction {
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  roles: ('student' | 'teacher' | 'admin')[];
}

interface QuickActionsProps {
  userRole: 'student' | 'teacher' | 'admin';
}

export const QuickActions = ({ userRole }: QuickActionsProps) => {
  const actions: QuickAction[] = [
    { label: 'Continue Learning', icon: <PlayCircle size={16} />, onClick: () => {}, roles: ['student'] },
    { label: 'Create Course', icon: <Plus size={16} />, onClick: () => {}, roles: ['teacher', 'admin'] },
    { label: 'Upload Lesson', icon: <Upload size={16} />, onClick: () => {}, roles: ['teacher', 'admin'] },
    { label: 'View Reports', icon: <FileText size={16} />, onClick: () => {}, roles: ['admin'] },
  ];

  const allowedActions = actions.filter(action => action.roles.includes(userRole));

  if (allowedActions.length === 0) return null;

  return (
    <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
      {allowedActions.map((action, idx) => (
        <Button 
          key={idx} 
          variant={idx === 0 ? 'primary' : 'secondary'} 
          size="sm"
          onClick={action.onClick}
        >
          {action.icon}
          <span className="hidden-mobile" style={{ marginLeft: 'var(--space-2)' }}>{action.label}</span>
        </Button>
      ))}
    </div>
  );
};
