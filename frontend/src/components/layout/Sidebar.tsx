import { Home, BookOpen, User, Settings, LayoutDashboard, Database, Activity, Download, Inbox, Calendar, LifeBuoy, MessagesSquare, ClipboardCheck } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import type { ReactNode } from 'react';
import { ThemeSwitcher } from '../ThemeSwitcher';

interface SidebarProps {
  isCollapsed: boolean;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
  userRole?: 'student' | 'teacher' | 'admin';
}

type NavItem = { id: string; path: string; label: string; icon: ReactNode };

export const Sidebar = ({ isCollapsed, isMobileOpen, onCloseMobile, userRole }: SidebarProps) => {

    // Only routes that actually exist in AppRouter per role — linking to a
    // route outside the role would trip the RoleGuard and 403.
    const menuItems: Record<'student' | 'teacher' | 'admin', NavItem[]> = {
      student: [
        { id: 'dashboard', path: '/dashboard', label: 'Today', icon: <Home size={20} /> },
        { id: 'courses', path: '/courses', label: 'My Courses', icon: <BookOpen size={20} /> },
        { id: 'inbox', path: '/inbox', label: 'Inbox', icon: <Inbox size={20} /> },
        { id: 'calendar', path: '/calendar', label: 'Calendar', icon: <Calendar size={20} /> },
        { id: 'forums', path: '/forums', label: 'Community', icon: <MessagesSquare size={20} /> },
        { id: 'analytics', path: '/analytics/student', label: 'Progress', icon: <Activity size={20} /> },
        { id: 'support', path: '/support', label: 'Support', icon: <LifeBuoy size={20} /> },
        { id: 'profile', path: '/profile', label: 'Profile', icon: <User size={20} /> },
      ],
      teacher: [
        { id: 'teacher-panel', path: '/teacher-panel', label: 'Workspace', icon: <LayoutDashboard size={20} /> },
        { id: 'grading', path: '/teacher-panel/grading', label: 'Grading', icon: <ClipboardCheck size={20} /> },
        { id: 'analytics', path: '/analytics/teacher', label: 'Analytics', icon: <Activity size={20} /> },
        { id: 'profile', path: '/profile', label: 'Profile', icon: <User size={20} /> },
      ],
      admin: [
        { id: 'admin', path: '/admin', label: 'Command Centre', icon: <Database size={20} /> },
        { id: 'analytics', path: '/analytics/admin', label: 'Executive Analytics', icon: <Activity size={20} /> },
        { id: 'profile', path: '/profile', label: 'Profile', icon: <User size={20} /> },
      ]
    };

    const currentMenu = menuItems[userRole || 'student'];

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div className="app-sidebar-overlay visible-mobile" onClick={onCloseMobile} />
      )}

      <aside className={`app-sidebar ${isCollapsed ? 'collapsed' : ''} ${isMobileOpen ? 'mobile-open' : ''}`}>
        <div className="app-sidebar-header">
          {/* Logo or Brand */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', width: '100%' }}>
            <img src="/codeme.jpg" alt="CodeMe Academy" style={{ width: 32, height: 32, borderRadius: 'var(--radius-md)', border: '2px solid var(--primary)', flexShrink: 0, objectFit: 'contain' }} />
            {!isCollapsed && (
              <span style={{ fontFamily: 'var(--font-headings)', fontWeight: 'var(--weight-bold)', fontSize: 'var(--text-lg)', color: 'var(--text-primary)' }}>CodeMe</span>
            )}
          </div>
        </div>

          <nav className="app-sidebar-content">
            {currentMenu.map((item) => (
              <NavLink 
                key={item.id}
                to={item.path}
                className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}
                title={isCollapsed ? item.label : undefined}
                onClick={onCloseMobile}
              >
                <div className="sidebar-icon">{item.icon}</div>
                <span className="sidebar-text">{item.label}</span>
              </NavLink>
            ))}
          </nav>
  
          <div className="app-sidebar-footer">
            {!isCollapsed && (
              <div style={{ marginBottom: 'var(--space-3)' }}>
                <ThemeSwitcher fullWidth />
              </div>
            )}
            <button
              onClick={() => window.dispatchEvent(new Event("codeme-install"))}
              className="sidebar-item"
              title={isCollapsed ? 'Install App' : undefined}
              style={{ background: 'transparent', border: 'none', width: '100%', textAlign: 'left', cursor: 'pointer', fontFamily: 'inherit' }}
            >
              <div className="sidebar-icon"><Download size={20} /></div>
              <span className="sidebar-text">Install App</span>
            </button>
            <NavLink 
              to="/settings"
              className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}
              title={isCollapsed ? 'Settings' : undefined}
              onClick={onCloseMobile}
            >
              <div className="sidebar-icon"><Settings size={20} /></div>
              <span className="sidebar-text">Settings</span>
            </NavLink>
          </div>
      </aside>
    </>
  );
};
