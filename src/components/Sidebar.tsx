import React from 'react';

interface SidebarProps {
  currentTab: string;
  onChangeTab: (tab: string) => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onChangeTab,
  isDarkMode,
  onToggleDarkMode,
}) => {
  const menuItems = [
    {
      id: 'flows',
      label: 'AI Flows',
      icon: (
        <svg className="menu-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
        </svg>
      ),
    },
    {
      id: 'storyboards',
      label: 'Storyboards',
      icon: (
        <svg className="menu-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <path d="M9 3v18M15 3v18M3 9h18M3 15h18" />
        </svg>
      ),
    },
    {
      id: 'assets',
      label: 'Assets Library',
      icon: (
        <svg className="menu-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7" />
          <line x1="16" y1="5" x2="22" y2="5" />
          <line x1="19" y1="2" x2="19" y2="8" />
          <circle cx="9" cy="9" r="2" />
          <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
        </svg>
      ),
    },
    {
      id: 'voices',
      label: 'Voice Library',
      icon: (
        <svg className="menu-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
          <path d="M19 10v1a7 7 0 0 1-14 0v-1M12 19v4M8 23h8" />
        </svg>
      ),
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: (
        <svg className="menu-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z" />
        </svg>
      ),
    },
  ];

  return (
    <aside className="app-sidebar">
      {/* Brand Logo */}
      <div className="sidebar-brand">
        <div className="brand-logo-container">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
            <rect width="24" height="24" rx="6" fill="url(#brand-grad)" />
            <path d="M7 16V8l5 4 5-4v8" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <defs>
              <linearGradient id="brand-grad" x1="0" y1="0" x2="24" y2="24" gradientUnits="userSpaceOnUse">
                <stop stopColor="#a855f7" />
                <stop offset="1" stopColor="#ec4899" />
              </linearGradient>
            </defs>
          </svg>
        </div>
        <span className="brand-name">RapidStory</span>
        <span className="brand-badge">PRO</span>
      </div>

      {/* Main Menu */}
      <nav className="sidebar-nav">
        <ul>
          {menuItems.map((item) => (
            <li key={item.id}>
              <button
                className={`nav-item-btn ${currentTab === item.id ? 'active' : ''}`}
                onClick={() => onChangeTab(item.id)}
              >
                {item.icon}
                <span className="nav-item-label">{item.label}</span>
                {item.id === 'flows' && <span className="nav-bubble">Beta</span>}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {/* Bottom section */}
      <div className="sidebar-bottom">
        {/* Credit details */}
        <div className="credits-panel">
          <div className="credits-header">
            <span className="credits-title">AI Credits</span>
            <span className="credits-ratio">8,432 / 10K</span>
          </div>
          <div className="credits-bar-container">
            <div className="credits-bar-fill" style={{ width: '84.3%' }}></div>
          </div>
          <button className="upgrade-btn">
            Upgrade Plan
          </button>
        </div>

        {/* Theme and User Profile */}
        <div className="profile-container">
          <div className="theme-toggle-row">
            <span className="theme-label">{isDarkMode ? 'Dark Mode' : 'Light Mode'}</span>
            <button className="theme-toggle-btn" onClick={onToggleDarkMode} aria-label="Toggle theme">
              {isDarkMode ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="5" />
                  <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z" />
                </svg>
              )}
            </button>
          </div>
          <div className="user-profile">
            <img
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&auto=format&fit=crop&q=80"
              alt="User profile"
              className="user-avatar"
            />
            <div className="user-info">
              <span className="user-name">Phan Hoang Bao</span>
              <span className="user-email">bao.phan@company.com</span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};
