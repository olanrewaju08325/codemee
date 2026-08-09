import { Home, BookOpen, User, Inbox, LayoutDashboard, ClipboardCheck, Database, Activity, LifeBuoy } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import type { ReactNode } from 'react';

interface BottomNavProps {
  userRole?: 'student' | 'teacher' | 'admin';
}

type NavItem = { id: string; path: string; label: string; icon: ReactNode };

// Mobile bottom bar. Each role only links to routes that exist for it in
// AppRouter, so a tab can never land the user on a 403 from the RoleGuard.
const NAV: Record<'student' | 'teacher' | 'admin', NavItem[]> = {
  student: [
    { id: 'dashboard', path: '/dashboard', label: 'Home', icon: <Home size={22} /> },
    { id: 'courses', path: '/courses', label: 'Courses', icon: <BookOpen size={22} /> },
    { id: 'inbox', path: '/inbox', label: 'Inbox', icon: <Inbox size={22} /> },
    { id: 'support', path: '/support', label: 'Support', icon: <LifeBuoy size={22} /> },
    { id: 'profile', path: '/profile', label: 'Profile', icon: <User size={22} /> },
  ],
  teacher: [
    { id: 'teacher-panel', path: '/teacher-panel', label: 'Workspace', icon: <LayoutDashboard size={22} /> },
    { id: 'grading', path: '/teacher-panel/grading', label: 'Grading', icon: <ClipboardCheck size={22} /> },
    { id: 'analytics', path: '/analytics/teacher', label: 'Analytics', icon: <Activity size={22} /> },
    { id: 'profile', path: '/profile', label: 'Profile', icon: <User size={22} /> },
  ],
  admin: [
    { id: 'admin', path: '/admin', label: 'Ops', icon: <Database size={22} /> },
    { id: 'analytics', path: '/analytics/admin', label: 'Analytics', icon: <Activity size={22} /> },
    { id: 'profile', path: '/profile', label: 'Profile', icon: <User size={22} /> },
  ],
};

export const BottomNav = ({ userRole = 'student' }: BottomNavProps) => {
  const navItems = NAV[userRole] ?? NAV.student;

  return (
    <nav className="app-bottom-nav" aria-label="Primary">
      {navItems.map(item => (
        <NavLink
          key={item.id}
          to={item.path}
          end={item.path === '/dashboard' || item.path === '/teacher-panel' || item.path === '/admin'}
          className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}
        >
          {item.icon}
          <span>{item.label}</span>
        </NavLink>
      ))}
    </nav>
  );
};
