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
    <div className="container">
      <header>
        <h1>Upload PDF</h1>
        <p>Upload a PDF document to generate study materials</p>
      </header>

      {error && (
        <div role="alert">
          <p>{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* File upload section - first card */}
        <article>
          <header>
            <h3>1. Select PDF File</h3>
          </header>
          <input
            type="file"
            id="pdfFile"
            name="pdfFile"
            accept=".pdf"
            onChange={handleFileChange}
            required
          />
          {file && <small>Selected: {file.name}</small>}
        </article>
        
        {/* AI Model section - second card */}
        <article>
          <header>
            <h3>2. Choose AI Model</h3>
          </header>
          <fieldset>
            <label>
              <input
                type="radio"
                name="modelType"
                value="github"
                checked={modelType === 'github'}
                onChange={handleModelChange}
              />
              GitHub API
            </label>
            <label>
              <input
                type="radio"
                name="modelType"
                value="openai"
                checked={modelType === 'openai'}
                onChange={handleModelChange}
              />
              OpenAI
            </label>
          </fieldset>
        </article>
        
        {/* Output Formats section - third card */}
        <article>
          <header>
            <h3>3. Select Output Formats</h3>
          </header>
          <fieldset>
            <label>
              <input
                type="checkbox"
                name="flashcards"
                role="switch"
                checked={outputFormats.flashcards}
                onChange={handleCheckboxChange}
              />
              Flashcards
            </label>
            <label>
              <input
                type="checkbox"
                name="summary"
                role="switch"
                checked={outputFormats.summary}
                onChange={handleCheckboxChange}
              />
              Summary
            </label>
            <label>
              <input
                type="checkbox"
                name="cornellNotes"
                role="switch"
                checked={outputFormats.cornellNotes}
                onChange={handleCheckboxChange}
              />
              Cornell Notes
            </label>
          </fieldset>
        </article>

        {/* Submit button */}
        <button 
          type="submit" 
          className="primary"
          aria-busy={loading}
          disabled={loading}
        >
          {loading ? 'Processing...' : 'Upload and Process'}
        </button>
      </form>
    </div>
  );
};

export default UploadPDF;
