import React from 'react';
import { useLocation, Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

const AppLayout = () => {
  const location = useLocation();
  
  // Determine active page from current URL
  const getActivePage = () => {
    const path = location.pathname;
    if (path.includes('/upload')) return 'new';
    if (path.includes('/dashboard')) return 'dashboard';
    if (path.includes('/results')) return 'results';
    if (path.includes('/settings')) return 'settings';
    if (path.includes('/profile')) return 'profile';
    return 'dashboard';
  };

  return (
    <div className="flex">
      <Sidebar activePage={getActivePage()} />
      <main className="ml-56 p-4 min-h-screen w-full bg-gray-50 dark:bg-gray-900">
        <Outlet />
      </main>
    </div>
  );
};

export default AppLayout;
