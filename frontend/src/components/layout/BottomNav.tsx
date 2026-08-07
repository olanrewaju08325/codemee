import { Home, BookOpen, User, Settings } from 'lucide-react';
import { NavLink } from 'react-router-dom';

interface BottomNavProps {
  userRole?: 'student' | 'teacher' | 'admin';
}

export const BottomNav = ({ userRole = 'student' }: BottomNavProps) => {
  // We use similar routing logic to sidebar for the core routes
  // (userRole will be used to conditionally render items like the Teacher dashboard)
    const navItems = [
      { id: 'dashboard', path: '/dashboard', label: 'Home', icon: <Home size={24} /> },
      { id: 'courses', path: '/courses', label: 'Courses', icon: <BookOpen size={24} /> },
      ...(userRole === 'teacher' ? [{ id: 'teacher-panel', path: '/teacher-panel', label: 'Teacher Panel', icon: <BookOpen size={24} /> }] : []),
      { id: 'settings', path: '/settings', label: 'Settings', icon: <Settings size={24} /> },
      { id: 'profile', path: '/profile', label: 'Profile', icon: <User size={24} /> },
    ];

  return (
      <nav className="app-bottom-nav">
        {navItems.map(item => (
          <NavLink 
            key={item.id}
            to={item.path}
            className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}
            style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}
          >
            {item.icon}
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
  );
};
