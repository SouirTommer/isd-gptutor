import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';

// Layout Components
import Navbar from './components/layout/Navbar';
import Home from './pages/Home';
import About from './pages/About';
import UploadPDF from './components/pdf/UploadPDF';
import PDFResults from './components/pdf/PDFResults';
import NotFound from './pages/NotFound';

function App() {
  return (
    <Router>
      <main className="container-fluid">
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/upload" element={<UploadPDF />} />
          <Route path="/results/:id" element={<PDFResults />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
    </Router>
  );
}

export default App;
