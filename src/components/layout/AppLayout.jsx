import React from 'react';
import AppSidebar from './AppSidebar';
import AppHeader from './AppHeader';

/**
 * AppLayout - Standardized application layout shell.
 * Provides the floating glass sidebar, dynamic app header, and responsive page container.
 */
export default function AppLayout({
  children,
  headerProps = {},
  showHeader = true,
  className = '',
  style = {},
}) {
  return (
    <div
      className={`app-layout-shell ${className}`.trim()}
      style={{
        display: 'flex',
        minHeight: '100vh',
        width: '100%',
        background: 'transparent',
        boxSizing: 'border-box',
        ...style,
      }}
    >
      <AppSidebar />
      <main
        className="nba-layout-main"
        style={{
          position: 'relative',
          flex: 1,
          minWidth: 0,
          minHeight: '100vh',
          overflowX: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {showHeader && <AppHeader {...headerProps} />}
        <div className="page-container" style={{ flex: 1, boxSizing: 'border-box' }}>
          {children}
        </div>
      </main>
    </div>
  );
}
