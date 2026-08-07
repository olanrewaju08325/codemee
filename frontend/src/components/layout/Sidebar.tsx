import { Home, BookOpen, User, Settings, LayoutDashboard, Database, Activity, Download } from 'lucide-react';
import { NavLink } from 'react-router-dom';

interface SidebarProps {
  isCollapsed: boolean;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
  userRole?: 'student' | 'teacher' | 'admin';
}

export const Sidebar = ({ isCollapsed, isMobileOpen, onCloseMobile, userRole }: SidebarProps) => {

    const menuItems = {
      student: [
        { id: 'dashboard', path: '/dashboard', label: 'Dashboard', icon: <Home size={20} /> },
        { id: 'courses', path: '/courses', label: 'My Courses', icon: <BookOpen size={20} /> },
        { id: 'analytics', path: '/analytics/student', label: 'Analytics', icon: <Activity size={20} /> },
        { id: 'profile', path: '/profile', label: 'Profile', icon: <User size={20} /> },
      ],
      teacher: [
        { id: 'teacher-panel', path: '/teacher-panel', label: 'Teacher Panel', icon: <LayoutDashboard size={20} /> },
        { id: 'courses', path: '/teacher/courses', label: 'Course Management', icon: <BookOpen size={20} /> },
        { id: 'analytics', path: '/analytics/teacher', label: 'Analytics', icon: <Activity size={20} /> },
        { id: 'profile', path: '/profile', label: 'Profile', icon: <User size={20} /> },
      ],
      admin: [
        { id: 'admin', path: '/admin', label: 'Admin Portal', icon: <Database size={20} /> },
        { id: 'analytics', path: '/analytics/admin', label: 'Executive Analytics', icon: <Activity size={20} /> },
        { id: 'activity', path: '/admin/activity', label: 'Activity Logs', icon: <Activity size={20} /> },
        { id: 'settings', path: '/admin/settings', label: 'System Settings', icon: <Settings size={20} /> },
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
            <div style={{ width: 32, height: 32, background: 'var(--color-primary-500)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 'bold', flexShrink: 0 }}>
              C
            </div>
            {!isCollapsed && (
              <span style={{ fontFamily: 'var(--font-headings)', fontWeight: 'var(--weight-bold)', fontSize: 'var(--text-lg)' }}>CodeMe</span>
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
