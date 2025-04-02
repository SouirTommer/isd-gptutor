import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  
  // Determine active page from current URL
  const getActivePage = () => {
    const path = location.pathname;
    if (path.includes('/upload')) return 'new';
    if (path.includes('/dashboard')) return 'dashboard';
    if (path.includes('/deck')) return 'decks';
    if (path.includes('/settings')) return 'settings';
    if (path.includes('/profile')) return 'profile';
    return '';
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="app-container">
      <Sidebar 
        activePage={getActivePage()} 
        className={sidebarOpen ? 'open' : ''}
      />
      
      <button 
        className="sidebar-toggle" 
        onClick={toggleSidebar}
        aria-label="Toggle menu"
      >
        <i className={`fas fa-${sidebarOpen ? 'times' : 'bars'}`}></i>
      </button>
      
      <main className="main-with-sidebar">
        {children}
      </main>
    </div>
  );
};

export default Layout;
