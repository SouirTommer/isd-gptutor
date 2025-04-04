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
import { SidebarProvider, useSidebar } from './contexts/SidebarContext';

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
      <SidebarProvider>
        <div className={`min-h-screen ${darkMode ? 'dark' : ''}`}>
          <Routes>
            {/* Home page rendered without sidebar */}
            <Route path="/" element={<Home />} />
            
            {/* All other routes wrapped with the sidebar layout */}
            <Route path="/*" element={<MainLayoutWithSidebar />} />
          </Routes>
        </div>
      </SidebarProvider>
    </Router>
  );
}

// Separate component for the main layout with sidebar
const MainLayoutWithSidebar = () => {
  const { minimized } = useSidebar();
  
  return (
    <div className="flex dark:bg-github-dark min-h-screen">
      <Sidebar />
      <div className={`${minimized ? 'pl-16' : 'pl-56'} w-full transition-all duration-300`}>
        <Routes>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/upload" element={<UploadPDF />} />
          <Route path="/results/:id" element={<PDFResults />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>
      </div>
    </div>
  );
};

export default App;
