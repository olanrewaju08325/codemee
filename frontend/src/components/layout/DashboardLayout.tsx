import type { ReactNode } from 'react';

interface DashboardLayoutProps {
  statsRow?: ReactNode;
  mainContent: ReactNode;
  sideContent?: ReactNode;
}

export const DashboardLayout = ({ statsRow, mainContent, sideContent }: DashboardLayoutProps) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      {/* Stats Row */}
      {statsRow && (
        <div>
          {statsRow}
        </div>
      )}

      {/* Main & Side Content Grid */}
      <div style={{ 
        display: 'grid', 
        gap: 'var(--space-6)', 
        gridTemplateColumns: sideContent ? 'repeat(auto-fit, minmax(300px, 1fr))' : '1fr' 
      }}>
        {/* We use inline styles for the complex dashboard specific layout here, or we can use generic CSS. 
            A common pattern is Main (2fr) Side (1fr) on desktop, stacking on mobile. */}
        <div style={{ gridColumn: sideContent ? '1 / -1' : '1 / -1' }} className={sideContent ? 'dashboard-main-col' : ''}>
          {mainContent}
        </div>
        
        {sideContent && (
          <div className="dashboard-side-col">
            {sideContent}
          </div>
        )}
      </div>

      <style>{`
        @media (min-width: 1024px) {
          .dashboard-main-col { grid-column: span 2; }
          .dashboard-side-col { grid-column: span 1; }
        }
      `}</style>
    </div>
  );
};
