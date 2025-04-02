import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './pages/Home';
import AppLayout from './components/layout/AppLayout';
import UploadPDF from './pages/Upload.js';
import PDFResults from './components/pdf/PDFResults';
import Dashboard from './pages/Dashboard';
import Settings from './pages/Settings';
import Profile from './pages/Profile';
import Sidebar from './components/layout/Sidebar';

// Only import Tailwind
import './index.css';

function App() {
  // State for dark mode
  const [darkMode, setDarkMode] = useState(true);
  
  // Force dark mode
  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  return (
    <Router>
      <div className={`min-h-screen ${darkMode ? 'dark' : ''}`}>
        <div className="flex dark:bg-github-dark min-h-screen">
          <Sidebar activePage={getActivePage()} />
          <div className="pl-56 w-full">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/upload" element={<UploadPDF />} />
              <Route path="/results/:id" element={<PDFResults />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/profile" element={<Profile />} />
              {/* Add other routes as needed */}
            </Routes>
          </div>
        </div>
      </div>
    </Router>
  );
}

// Helper function to determine active page for sidebar
function getActivePage() {
  const path = window.location.pathname;
  if (path === '/' || path === '/dashboard') return 'dashboard';
  if (path === '/upload') return 'new';
  if (path.startsWith('/results')) return '';
  if (path === '/settings') return 'settings';
  if (path === '/profile') return 'profile';
  return '';
}

export default App;
