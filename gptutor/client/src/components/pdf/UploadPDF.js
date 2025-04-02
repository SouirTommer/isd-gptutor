import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const UploadPDF = () => {
  const [file, setFile] = useState(null);
  const [outputFormats, setOutputFormats] = useState({
    flashcards: true,
    summary: true,
    cornellNotes: false
  });
  const [modelType, setModelType] = useState('github'); // Default to GitHub API
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile);
      setError('');
    } else {
      setFile(null);
      setError('Please select a valid PDF file');
    }
  };

  const handleCheckboxChange = (e) => {
    setOutputFormats({
      ...outputFormats,
      [e.target.name]: e.target.checked
    });
  };

  const handleModelChange = (e) => {
    setModelType(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!file) {
      setError('Please select a PDF file to upload');
      return;
    }

    if (!outputFormats.flashcards && !outputFormats.summary && !outputFormats.cornellNotes) {
      setError('Please select at least one output format');
      return;
    }

    setLoading(true);
    setError('');

    const formData = new FormData();
    formData.append('pdfFile', file);
    formData.append('outputFormats', JSON.stringify(outputFormats));
    formData.append('modelType', modelType);

    try {
      const response = await axios.post('/api/pdf/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      navigate(`/results/${response.data.id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Error uploading PDF. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ maxWidth: '1000px', margin: '0 auto', padding: '2rem 1rem' }}>
      <header className="text-center" style={{ marginBottom: '2rem' }}>
        <h1><i className="fas fa-graduation-cap"></i> Upload PDF Document</h1>
        <p><i className="fas fa-info-circle"></i> Select a PDF file to convert into study materials</p>
      </header>

      {error && (
        <div className="error-container" style={{ 
          color: 'var(--form-element-invalid-active-border-color)',
          padding: '1rem',
          marginBottom: '1.5rem',
          borderRadius: 'var(--border-radius)',
          backgroundColor: 'rgba(var(--form-element-invalid-active-border-color-rgb), 0.1)'
        }}>
          <p><i className="fas fa-exclamation-triangle"></i> {error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* PDF Document Upload Card */}
          <article style={{ padding: '1.5rem', marginBottom: '0' }}>
            <header>
              <h3><i className="fas fa-file-pdf"></i> PDF Document Upload</h3>
            </header>
            <div>
              <label htmlFor="pdfFile">
                Select your PDF file
                <input
                  type="file"
                  id="pdfFile"
                  accept=".pdf"
                  onChange={handleFileChange}
                  required
                />
              </label>
              {file && (
                <p style={{ marginTop: '0.5rem' }}>
                  <i className="fas fa-check-circle" style={{ color: 'var(--form-element-valid-active-border-color)' }}></i> Selected: {file.name}
                </p>
              )}
            </div>
          </article>

          {/* AI Model Card */}
          <article style={{ padding: '1.5rem', marginBottom: '0' }}>
            <header>
              <h3><i className="fas fa-robot"></i> AI Model</h3>
            </header>
            <div className="grid">
              <label htmlFor="github">
                <input
                  type="radio"
                  id="github"
                  name="modelType"
                  value="github"
                  checked={modelType === 'github'}
                  onChange={handleModelChange}
                />
                <i className="fab fa-github"></i> GitHub API
              </label>
              <label htmlFor="openai">
                <input
                  type="radio"
                  id="openai"
                  name="modelType"
                  value="openai"
                  checked={modelType === 'openai'}
                  onChange={handleModelChange}
                />
                <i className="fas fa-brain"></i> OpenAI
              </label>
            </div>
          </article>

          {/* Output Formats Card */}
          <article style={{ padding: '1.5rem', marginBottom: '0' }}>
            <header>
              <h3><i className="fas fa-cogs"></i> Output Formats</h3>
            </header>
            <div>
              <label htmlFor="flashcards">
                <input
                  type="checkbox"
                  id="flashcards"
                  name="flashcards"
                  role="switch"
                  checked={outputFormats.flashcards}
                  onChange={handleCheckboxChange}
                />
                <i className="fas fa-clone"></i> Flashcards
              </label>
              
              <label htmlFor="summary">
                <input
                  type="checkbox"
                  id="summary"
                  name="summary"
                  role="switch"
                  checked={outputFormats.summary}
                  onChange={handleCheckboxChange}
                />
                <i className="fas fa-file-alt"></i> Summary
              </label>
              
              <label htmlFor="cornellNotes">
                <input
                  type="checkbox"
                  id="cornellNotes"
                  name="cornellNotes"
                  role="switch"
                  checked={outputFormats.cornellNotes}
                  onChange={handleCheckboxChange}
                />
                <i className="fas fa-columns"></i> Cornell Notes
              </label>
            </div>
          </article>
        </div>

        <div style={{ textAlign: 'center', marginTop: '2rem' }}>
          <button 
            type="submit" 
            className="primary contrast" 
            aria-busy={loading}
            disabled={loading}
            style={{ fontSize: '1.1rem', padding: '.75rem 2rem', backgroundColor: '#00b4d8', border: 'none' }}
          >
            {loading ? <><i className="fas fa-spinner fa-spin"></i> Processing...</> : <><i className="fas fa-upload"></i> Upload and Process</>}
          </button>
        </div>
      </form>
    </div>
  );
};

export default UploadPDF;
