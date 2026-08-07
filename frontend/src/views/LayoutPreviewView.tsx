import { AppShell } from '../components/layout/AppShell';
import { PageContainer } from '../components/layout/PageContainer';
import { PageHeader } from '../components/layout/PageHeader';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { EmptyState } from '../components/layout/EmptyState';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { BookOpen, FolderOpen, Bell, ArrowRight } from 'lucide-react';

export const LayoutPreviewView = () => {
  return (
    <AppShell userRole="student" userName="Preview User">
      <PageContainer variant="dashboard">
        <PageHeader 
          title="Dashboard Layout Preview" 
          subtitle="This demonstrates the desktop layout engine, responsive sidebars, and grid containers."
          actions={
            <Button>
              New Action
            </Button>
          }
        />
        
        <DashboardLayout 
          statsRow={
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-4)' }}>
              <Card><CardContent style={{ padding: 'var(--space-4)' }}><strong>3</strong> Active Courses</CardContent></Card>
              <Card><CardContent style={{ padding: 'var(--space-4)' }}><strong>12</strong> Lessons Completed</CardContent></Card>
              <Card><CardContent style={{ padding: 'var(--space-4)' }}><strong>85%</strong> Average Score</CardContent></Card>
              <Card><CardContent style={{ padding: 'var(--space-4)' }}><strong>2</strong> Certificates</CardContent></Card>
            </div>
          }
          mainContent={
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              <h2 style={{ fontFamily: 'var(--font-headings)', fontSize: 'var(--text-lg)' }}>Recent Activity</h2>
              <Card>
                <CardContent>
                  <EmptyState 
                    icon={<FolderOpen size={48} />}
                    title="No recent activity"
                    description="You haven't completed any lessons recently. Dive into a course to see your progress here."
                    actionLabel="Browse Courses"
                    onAction={() => alert('Navigate to courses')}
                  />
                </CardContent>
              </Card>

              <h2 style={{ fontFamily: 'var(--font-headings)', fontSize: 'var(--text-lg)', marginTop: 'var(--space-4)' }}>Continue Learning</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: 'var(--space-4)' }}>
                <Card>
                  <CardContent style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                      <div style={{ width: 40, height: 40, background: 'var(--color-primary-50)', color: 'var(--color-primary-600)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <BookOpen size={20} />
                      </div>
                      <strong style={{ fontSize: 'var(--text-md)' }}>Web Dev 101</strong>
                    </div>
                    <Button variant="outline" fullWidth rightIcon={<ArrowRight size={16} />}>Resume</Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          }
          sideContent={
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              <h2 style={{ fontFamily: 'var(--font-headings)', fontSize: 'var(--text-lg)' }}>Notifications</h2>
              <Card>
                <CardContent style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                  <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
                    <Bell size={16} style={{ color: 'var(--color-primary-500)', marginTop: '2px' }} />
                    <div>
                      <strong style={{ fontSize: 'var(--text-sm)', display: 'block' }}>New Course Available</strong>
                      <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>2 hours ago</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
                    <Bell size={16} style={{ color: 'var(--text-tertiary)', marginTop: '2px' }} />
                    <div>
                      <strong style={{ fontSize: 'var(--text-sm)', display: 'block' }}>Assignment Graded</strong>
                      <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>1 day ago</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          }
        />
      </PageContainer>
    </AppShell>
  );
};
