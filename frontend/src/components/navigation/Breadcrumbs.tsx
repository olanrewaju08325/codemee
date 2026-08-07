import { ChevronRight, Home } from 'lucide-react';
import { useLocation, Link } from 'react-router-dom';

export const Breadcrumbs = () => {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter(x => x);

  // We can map route segments to human readable names or let dynamic fetching handle it.
  // For now, this is a basic mapping structure.
  const routeMap: Record<string, string> = {
    'dashboard': 'Dashboard',
    'courses': 'Courses',
    'admin': 'Admin Portal',
    'teacher-panel': 'Teacher Panel',
    'forums': 'Discussions',
    'settings': 'Settings',
  };

  const getReadableLabel = (segment: string) => {
    // If it looks like a UUID or ID, return '...' or omit it (we'd usually fetch the title)
    if (segment.length > 20) return 'Details';
    return routeMap[segment] || segment.charAt(0).toUpperCase() + segment.slice(1);
  };

  return (
    <nav aria-label="Breadcrumb" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
      <Link to="/dashboard" style={{ color: 'var(--text-tertiary)', display: 'flex', alignItems: 'center' }}>
        <Home size={16} />
      </Link>
      
      {pathnames.length > 0 && <ChevronRight size={16} style={{ color: 'var(--text-tertiary)' }} />}
      
      {pathnames.map((segment, index) => {
        const isLast = index === pathnames.length - 1;
        const href = `/${pathnames.slice(0, index + 1).join('/')}`;
        const label = getReadableLabel(segment);

        return (
          <div key={href} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            {isLast ? (
              <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-primary)', fontWeight: 'var(--weight-medium)' }}>
                {label}
              </span>
            ) : (
              <Link to={href} style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', textDecoration: 'none' }}>
                {label}
              </Link>
            )}
            
            {!isLast && <ChevronRight size={16} style={{ color: 'var(--text-tertiary)' }} />}
          </div>
        );
      })}
    </nav>
  );
};
