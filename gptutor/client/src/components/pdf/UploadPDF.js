import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const UploadPDF = () => {
  const [file, setFile] = useState(null);
  const [outputFormats, setOutputFormats] = useState({
    flashcards: true,
    summary: true,
    cornellNotes: false,
    multipleChoice: true  // Add multiple choice option, default to enabled
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

    if (!outputFormats.flashcards && !outputFormats.summary && !outputFormats.cornellNotes && !outputFormats.multipleChoice) {
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
      console.log('Uploading PDF with model type:', modelType);
      console.log('Selected output formats:', outputFormats);
      
      const response = await axios.post('/api/pdf/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      if (response.data.isMockData) {
        console.warn('⚠️ SERVER USED MOCK DATA - API call failed');
        setError('Warning: Using mock data. The API request failed. Results may not be specific to your document.');
        
        // Still navigate, but after a delay to ensure the warning is seen
        setTimeout(() => {
          navigate(`/results/${response.data.id}`);
        }, 3000);
      } else {
        console.log('✅ API call successful, navigating to results');
        navigate(`/results/${response.data.id}`);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error uploading PDF. Please try again.');
      console.error('Upload error:', err);
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Upload PDF</h1>
        <p className="text-gray-600 dark:text-gray-400">Upload a PDF document to generate study materials</p>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/30 border-l-4 border-red-500 p-4 mb-6">
          <p className="text-red-700 dark:text-red-400">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* File upload section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
          <div className="p-4 bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
            <h3 className="font-semibold">1. Select PDF File</h3>
          </div>
          <div className="p-6">
            <label className="block">
              <span className="text-gray-700 dark:text-gray-300 mb-2 block">Choose a PDF file to upload</span>
              <input
                type="file"
                id="pdfFile"
                name="pdfFile"
                accept=".pdf"
                onChange={handleFileChange}
                required
                className="block w-full text-gray-700 dark:text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-primary-500 file:text-white hover:file:bg-primary-600"
              />
            </label>
            {file && (
              <p className="mt-2 text-sm text-green-600 dark:text-green-400">
                <i className="fas fa-check-circle mr-1"></i> Selected: {file.name}
              </p>
            )}
          </div>
        </div>
        
        {/* AI Model section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
          <div className="p-4 bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
            <h3 className="font-semibold">2. Choose AI Model</h3>
          </div>
          <div className="p-6">
            <div className="space-y-3">
              <label className="flex items-center space-x-3">
                <input
                  type="radio"
                  name="modelType"
                  value="github"
                  checked={modelType === 'github'}
                  onChange={handleModelChange}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500"
                />
                <span className="text-gray-700 dark:text-gray-300"><i className="fab fa-github mr-2"></i> GitHub API</span>
              </label>
              
              <label className="flex items-center space-x-3">
                <input
                  type="radio"
                  name="modelType"
                  value="openai"
                  checked={modelType === 'openai'}
                  onChange={handleModelChange}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500"
                />
                <span className="text-gray-700 dark:text-gray-300"><i className="fas fa-brain mr-2"></i> OpenAI</span>
              </label>
            </div>
          </div>
        </div>
        
        {/* Output Formats section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
          <div className="p-4 bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
            <h3 className="font-semibold">3. Select Output Formats</h3>
          </div>
          <div className="p-6">
            <div className="space-y-3">
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  name="flashcards"
                  checked={outputFormats.flashcards}
                  onChange={handleCheckboxChange}
                  className="h-4 w-4 rounded text-primary-600 focus:ring-primary-500"
                />
                <span className="text-gray-700 dark:text-gray-300"><i className="fas fa-clone mr-2"></i> Flashcards</span>
              </label>
              
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  name="multipleChoice"
                  checked={outputFormats.multipleChoice}
                  onChange={handleCheckboxChange}
                  className="h-4 w-4 rounded text-primary-600 focus:ring-primary-500"
                />
                <span className="text-gray-700 dark:text-gray-300"><i className="fas fa-tasks mr-2"></i> Multiple Choice</span>
              </label>
              
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  name="summary"
                  checked={outputFormats.summary}
                  onChange={handleCheckboxChange}
                  className="h-4 w-4 rounded text-primary-600 focus:ring-primary-500"
                />
                <span className="text-gray-700 dark:text-gray-300"><i className="fas fa-file-alt mr-2"></i> Summary</span>
              </label>
              
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  name="cornellNotes"
                  checked={outputFormats.cornellNotes}
                  onChange={handleCheckboxChange}
                  className="h-4 w-4 rounded text-primary-600 focus:ring-primary-500"
                />
                <span className="text-gray-700 dark:text-gray-300"><i className="fas fa-columns mr-2"></i> Cornell Notes</span>
              </label>
            </div>
          </div>
        </div>

        <button 
          type="submit" 
          className="btn-primary w-full flex items-center justify-center"
          disabled={loading}
        >
          {loading ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Processing...
            </>
          ) : (
            <>
              <i className="fas fa-upload mr-2"></i> Upload and Process
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default UploadPDF;
