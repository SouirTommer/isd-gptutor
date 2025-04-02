import React, { useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './pages/Home';
import AppLayout from './components/layout/AppLayout';
import UploadPDF from './components/pdf/UploadPDF';
import PDFResults from './components/pdf/PDFResults';
import Dashboard from './pages/Dashboard';

// Only import Tailwind
import './index.css';

function App() {
  // Force dark mode
  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  return (
    <Router>
      <Routes>
        {/* Public route for landing page */}
        <Route path="/" element={<Home />} />
        
        {/* Protected routes with sidebar */}
        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/upload" element={<UploadPDF />} />
          <Route path="/results/:id" element={<PDFResults />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
