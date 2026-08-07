import { BookOpen, ChevronRight } from 'lucide-react';
import { Card } from '../../ui/Card';
import { EmptyState } from '../../ui/EmptyState';

interface MyCoursesWidgetProps {
  courses: any[];
  onCourseSelect: (courseId: string) => void;
  onBrowseCourses: () => void;
}

export const MyCoursesWidget = ({ courses, onCourseSelect, onBrowseCourses }: MyCoursesWidgetProps) => {
  return (
    <Card style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
        <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--weight-bold)', fontFamily: 'var(--font-headings)' }}>
          My Enrolled Courses
        </h3>
        <button onClick={onBrowseCourses} style={{ background: 'none', border: 'none', color: 'var(--color-blue)', fontSize: 'var(--text-xs)', fontWeight: 'var(--weight-semibold)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
          Browse all <ChevronRight size={14} />
        </button>
      </div>

      {courses.length === 0 ? (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <EmptyState 
            title="No courses yet"
            description="Explore the catalog and enroll in a course to get started."
            icon={<BookOpen size={32} />}
            actionLabel="Browse Courses"
            onAction={onBrowseCourses}
          />
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          {courses.map((course) => (
            <div 
              key={course.id}
              onClick={() => onCourseSelect(course.id)}
              style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', padding: 'var(--space-3)', backgroundColor: 'var(--bg-primary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-default)', cursor: 'pointer', transition: 'border-color 0.2s' }}
              onMouseOver={(e) => (e.currentTarget.style.borderColor = 'var(--color-blue)')}
              onMouseOut={(e) => (e.currentTarget.style.borderColor = 'var(--border-default)')}
            >
              <div style={{ color: 'var(--color-blue)', flexShrink: 0 }}>
                <BookOpen size={20} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <h4 style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-semibold)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{course.title}</h4>
                <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>{course.language} · {course.level}</p>
              </div>
              <ChevronRight size={18} style={{ color: 'var(--text-tertiary)' }} />
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};
