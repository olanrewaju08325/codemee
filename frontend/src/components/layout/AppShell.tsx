import { useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { BottomNav } from './BottomNav';
import { InstallPrompt } from '../pwa/InstallPrompt';
import { UpdatePrompt } from '../pwa/UpdatePrompt';
import { NetworkStatus } from '../pwa/NetworkStatus';

interface AppShellProps {
  children: ReactNode;
  userRole?: 'student' | 'teacher' | 'admin';
  userName?: string;
  streakCount?: number;
  unreadNotifications?: number;
}

export const AppShell = ({ 
  children, 
  userRole = 'student', 
  userName = 'User',
  streakCount = 1,
  unreadNotifications = 0
}: AppShellProps) => {
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const [isTabletCollapsed, setIsTabletCollapsed] = useState(false);

  // Responsive checking
  useEffect(() => {
    const checkWidth = () => {
      const width = window.innerWidth;
      if (width < 768) {
        // Mobile
        setIsTabletCollapsed(false);
      } else if (width >= 768 && width < 1280) {
        // Tablet / Laptop
        setIsTabletCollapsed(true);
        setIsMobileDrawerOpen(false);
      } else {
        // Desktop
        setIsTabletCollapsed(false);
        setIsMobileDrawerOpen(false);
      }
    };
    
    checkWidth();
    window.addEventListener('resize', checkWidth);
    return () => window.removeEventListener('resize', checkWidth);
  }, []);

  const toggleSidebar = () => {
    if (window.innerWidth < 768) {
      setIsMobileDrawerOpen(!isMobileDrawerOpen);
    } else {
      setIsTabletCollapsed(!isTabletCollapsed);
    }
  };

  return (
    <div className="app-shell">
      <NetworkStatus />
      <InstallPrompt />
      <UpdatePrompt />
      <Sidebar 
        isCollapsed={isTabletCollapsed} 
        isMobileOpen={isMobileDrawerOpen} 
        onCloseMobile={() => setIsMobileDrawerOpen(false)}
        userRole={userRole}
      />
      
      <div className="app-main">
        <Header 
          onMenuToggle={toggleSidebar} 
          userName={userName}
          streakCount={streakCount}
          unreadNotifications={unreadNotifications}
        />
        
        <main className="app-content-scroll">
          {children}
        </main>
        
        {/* Render bottom nav only on mobile via CSS classes */}
        <div className="visible-mobile">
          <BottomNav userRole={userRole} />
        </div>
      </div>
    </div>
  );
};
