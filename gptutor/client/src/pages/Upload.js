import React, { useState, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Upload = () => {
  const [file, setPdfFile] = useState(null);
  const [fileName, setFileName] = useState('');
  const [flashcardCount, setFlashcardCount] = useState(20);
  const [quizCount, setQuizCount] = useState(10);
  const [outputFormats, setOutputFormats] = useState({
    flashcards: true,
    summary: true,
    cornellNotes: true,
    multipleChoice: true,
  });
  const [modelType, setModelType] = useState('github'); // Changed default to 'github'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showLoadingModal, setShowLoadingModal] = useState(false);
  
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (selectedFile.type === 'application/pdf') {
        setPdfFile(selectedFile);
        setFileName(selectedFile.name);
        setError('');
      } else {
        setPdfFile(null);
        setFileName('');
        setError('Please upload a PDF file');
      }
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      if (droppedFile.type === 'application/pdf') {
        setPdfFile(droppedFile);
        setFileName(droppedFile.name);
        setError('');
      } else {
        setError('Please upload a PDF file');
      }
    }
  };

  const handleFormatChange = (format) => {
    setOutputFormats(prev => ({
      ...prev,
      [format]: !prev[format]
    }));
  };

  const handleFlashcardCountChange = (e) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value > 0) {
      setFlashcardCount(value);
    }
  };

  const handleQuizCountChange = (e) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value > 0) {
      setQuizCount(value);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!file) {
      setError('Please select a PDF file');
      return;
    }

    // Check if at least one format is selected
    if (!Object.values(outputFormats).some(val => val)) {
      setError('Please select at least one output format');
      return;
    }

    setLoading(true);
    setError('');
    setShowLoadingModal(true); // Show the modal overlay

    // Log the values we're sending to help debug
    console.log("Sending request with:", {
      file: file.name,
      flashcardCount,
      quizCount,
      outputFormats,
      modelType
    });

    const formData = new FormData();
    formData.append('pdfFile', file);
    formData.append('outputFormats', JSON.stringify(outputFormats));
    formData.append('modelType', modelType);
    
    // Ensure we're sending the counts as strings
    formData.append('flashcardCount', flashcardCount.toString());
    formData.append('quizCount', quizCount.toString());

    try {
      const response = await axios.post('/api/pdf/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      // Add an artificial delay to make sure loading is visible
      setTimeout(() => {
        setLoading(false);
        setShowLoadingModal(false); // Hide the modal overlay
        navigate(`/results/${response.data.id}`);
      }, 1500); // Additional 1.5 seconds of loading after response
      
    } catch (err) {
      setLoading(false);
      setShowLoadingModal(false); // Hide the modal on error
      setError(err.response?.data?.message || 'Error uploading file');
      console.error('Upload error:', err);
    }
  };
  
  return (
    <div className="container mx-auto px-4 py-6">
      {/* Loading Modal */}
      {showLoadingModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white dark:bg-github-medium p-6 rounded-lg shadow-xl max-w-md w-full text-center">
            <div className="inline-block h-16 w-16 animate-spin rounded-full border-4 border-primary-500 border-t-transparent mb-4"></div>
            <h3 className="text-xl font-semibold text-github-text-primary dark:text-white mb-2">Processing Your PDF</h3>
            <p className="text-github-text-secondary dark:text-gray-400 mb-4">
              Please wait while we analyze your document and generate study materials.
              This may take a minute or two depending on the size of your document.
            </p>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mb-2">
              <div className="bg-primary-600 h-2.5 rounded-full animate-pulse w-full"></div>
            </div>
            <p className="text-sm text-github-text-secondary dark:text-gray-400">
              Please don't close this window
            </p>
          </div>
        </div>
      )}
      
      <header className="mb-6">
        <h2 className="text-2xl font-bold text-github-text-primary dark:text-white flex items-center">
          <i className="fas fa-file-upload text-primary-500 mr-3"></i>
          Create Study Materials
        </h2>
        <p className="text-github-text-secondary dark:text-gray-400 flex items-center ml-1">
          <i className="fas fa-info-circle mr-2"></i>
          Upload a PDF to generate study materials
        </p>
      </header>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          <i className="fas fa-exclamation-circle mr-2"></i>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* File upload area */}
        <div className="bg-white dark:bg-github-medium border border-gray-200 dark:border-github-border rounded-lg shadow-sm mb-6">
          <div className="p-4 border-b border-gray-200 dark:border-github-border bg-gray-50 dark:bg-github-light">
            <h3 className="text-lg font-semibold text-github-text-primary dark:text-white flex items-center">
              <i className="fas fa-file-upload text-primary-500 mr-2"></i>
              Upload PDF
            </h3>
          </div>
          <div className="p-6">
            <div 
              className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center cursor-pointer hover:border-gray-400 dark:hover:border-gray-500 transition-colors"
              onClick={() => fileInputRef.current.click()}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
            >
              <input 
                type="file" 
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="application/pdf"
                className="hidden"
              />
              
              <div className="flex flex-col items-center justify-center">
                {!file ? (
                  <>
                    <i className="fas fa-cloud-upload-alt text-4xl text-github-text-secondary dark:text-gray-400 mb-4"></i>
                    <p className="text-lg mb-2 text-github-text-primary dark:text-white">Drag and drop your PDF here</p>
                    <p className="text-sm text-github-text-secondary dark:text-gray-400 mb-4">or</p>
                    <button type="button" className="px-4 py-2 bg-primary-600 hover:bg-primary-700 dark:bg-primary-700 dark:hover:bg-primary-800 text-white rounded-md">
                      Select file
                    </button>
                  </>
                ) : (
                  <>
                    <i className="fas fa-file-pdf text-4xl text-primary-500 mb-3"></i>
                    <p className="text-lg font-semibold mb-1 text-github-text-primary dark:text-white">{fileName}</p>
                    <p className="text-xs text-github-text-secondary dark:text-gray-400 mb-3">PDF selected</p>
                    <button 
                      type="button" 
                      onClick={(e) => {
                        e.stopPropagation();
                        setPdfFile(null);
                        setFileName('');
                      }} 
                      className="text-sm text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                    >
                      <i className="fas fa-times mr-1"></i> Remove
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Format Selection */}
          <div className="bg-white dark:bg-github-medium border border-gray-200 dark:border-github-border rounded-lg shadow-sm">
            <div className="p-4 border-b border-gray-200 dark:border-github-border bg-gray-50 dark:bg-github-light">
              <h3 className="text-lg font-semibold text-github-text-primary dark:text-white flex items-center">
                <i className="fas fa-list-ul text-primary-500 mr-2"></i>
                Format Selection
              </h3>
            </div>
            <div className="p-4">
              <div className="grid grid-cols-1 gap-2">
                <div className="flex items-center p-3 rounded border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <input
                    type="checkbox"
                    id="flashcards"
                    checked={outputFormats.flashcards}
                    onChange={() => handleFormatChange('flashcards')}
                    className="w-4 h-4 text-primary-600 rounded"
                  />
                  <label htmlFor="flashcards" className="ml-3 text-github-text-primary dark:text-gray-200">
                    <i className="fas fa-clone mr-2 text-github-text-secondary"></i> Flashcards
                  </label>
                </div>

                <div className="flex items-center p-3 rounded border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <input
                    type="checkbox"
                    id="multipleChoice"
                    checked={outputFormats.multipleChoice}
                    onChange={() => handleFormatChange('multipleChoice')}
                    className="w-4 h-4 text-primary-600 rounded"
                  />
                  <label htmlFor="multipleChoice" className="ml-3 text-github-text-primary dark:text-gray-200">
                    <i className="fas fa-tasks mr-2 text-github-text-secondary"></i> Quiz
                  </label>
                </div>

                <div className="flex items-center p-3 rounded border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <input
                    type="checkbox"
                    id="summary"
                    checked={outputFormats.summary}
                    onChange={() => handleFormatChange('summary')}
                    className="w-4 h-4 text-primary-600 rounded"
                  />
                  <label htmlFor="summary" className="ml-3 text-github-text-primary dark:text-gray-200">
                    <i className="fas fa-file-alt mr-2 text-github-text-secondary"></i> Summary
                  </label>
                </div>

                <div className="flex items-center p-3 rounded border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <input
                    type="checkbox"
                    id="cornellNotes"
                    checked={outputFormats.cornellNotes}
                    onChange={() => handleFormatChange('cornellNotes')}
                    className="w-4 h-4 text-primary-600 rounded"
                  />
                  <label htmlFor="cornellNotes" className="ml-3 text-github-text-primary dark:text-gray-200">
                    <i className="fas fa-columns mr-2 text-github-text-secondary"></i> Cornell Notes
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* AI Model Selection */}
          <div className="bg-white dark:bg-github-medium border border-gray-200 dark:border-github-border rounded-lg shadow-sm">
            <div className="p-4 border-b border-gray-200 dark:border-github-border bg-gray-50 dark:bg-github-light">
              <h3 className="text-lg font-semibold text-github-text-primary dark:text-white flex items-center">
                <i className="fas fa-robot text-primary-500 mr-2"></i>
                AI Model
              </h3>
            </div>
            <div className="p-4">
              <div className="space-y-3">
                <label className="flex items-center p-3 rounded border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 opacity-50 cursor-not-allowed">
                  <input
                    type="radio"
                    name="model"
                    value="openai"
                    checked={modelType === 'openai'}
                    disabled={true}
                    className="w-4 h-4 text-gray-400 cursor-not-allowed"
                  />
                  <span className="ml-3 text-gray-500 dark:text-gray-500">
                    <i className="fas fa-robot mr-2 text-gray-400"></i> OpenAI (Not Available)
                  </span>
                </label>

                <label className="flex items-center p-3 rounded border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 bg-blue-50 dark:bg-blue-900/20">
                  <input
                    type="radio"
                    name="model"
                    value="github"
                    checked={modelType === 'github'}
                    onChange={() => setModelType('github')}
                    className="w-4 h-4 text-primary-600"
                  />
                  <span className="ml-3 text-github-text-primary dark:text-gray-200">
                    <i className="fab fa-github mr-2 text-github-text-secondary"></i> GitHub/Azure
                  </span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Count Options */}
        <div className="bg-white dark:bg-github-medium border border-gray-200 dark:border-github-border rounded-lg shadow-sm mb-6">
          <div className="p-4 border-b border-gray-200 dark:border-github-border bg-gray-50 dark:bg-github-light">
            <h3 className="text-lg font-semibold text-github-text-primary dark:text-white flex items-center">
              <i className="fas fa-sliders-h text-primary-500 mr-2"></i>
              Count Options
            </h3>
          </div>
          <div className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Flashcard Count */}
              <div>
                <label className="flex items-center justify-between mb-2 text-github-text-primary dark:text-white font-medium">
                  <span><i className="fas fa-clone mr-2 text-github-text-secondary"></i> Flashcard Count</span>
                  {!outputFormats.flashcards && 
                    <span className="text-xs px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-github-text-secondary">Disabled</span>
                  }
                </label>
                <div className="flex rounded-md shadow-sm">
                  <button
                    type="button"
                    onClick={() => setFlashcardCount(Math.max(1, flashcardCount - 1))}
                    disabled={!outputFormats.flashcards}
                    className="px-3 py-2 border border-r-0 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-github-text-primary dark:text-gray-200 rounded-l-md hover:bg-gray-100 dark:hover:bg-gray-600 disabled:opacity-50"
                  >
                    <i className="fas fa-minus"></i>
                  </button>
                  <input
                    type="number"
                    value={flashcardCount}
                    onChange={handleFlashcardCountChange}
                    min="1"
                    max="50"
                    disabled={!outputFormats.flashcards}
                    className="w-20 py-2 text-center border-y border-gray-300 dark:border-gray-600 text-github-text-primary dark:text-white bg-white dark:bg-github-medium disabled:opacity-50"
                  />
                  <button
                    type="button"
                    onClick={() => setFlashcardCount(Math.min(50, flashcardCount + 1))}
                    disabled={!outputFormats.flashcards}
                    className="px-3 py-2 border border-l-0 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-github-text-primary dark:text-gray-200 rounded-r-md hover:bg-gray-100 dark:hover:bg-gray-600 disabled:opacity-50"
                  >
                    <i className="fas fa-plus"></i>
                  </button>
                </div>
                <p className="mt-1 text-xs text-github-text-secondary dark:text-gray-400">Enter number between 1-50</p>
              </div>

              {/* Quiz Count */}
              <div>
                <label className="flex items-center justify-between mb-2 text-github-text-primary dark:text-white font-medium">
                  <span><i className="fas fa-tasks mr-2 text-github-text-secondary"></i> Quiz Question Count</span>
                  {!outputFormats.multipleChoice && 
                    <span className="text-xs px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-github-text-secondary">Disabled</span>
                  }
                </label>
                <div className="flex rounded-md shadow-sm">
                  <button
                    type="button"
                    onClick={() => setQuizCount(Math.max(1, quizCount - 1))}
                    disabled={!outputFormats.multipleChoice}
                    className="px-3 py-2 border border-r-0 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-github-text-primary dark:text-gray-200 rounded-l-md hover:bg-gray-100 dark:hover:bg-gray-600 disabled:opacity-50"
                  >
                    <i className="fas fa-minus"></i>
                  </button>
                  <input
                    type="number"
                    value={quizCount}
                    onChange={handleQuizCountChange}
                    min="1"
                    max="30"
                    disabled={!outputFormats.multipleChoice}
                    className="w-20 py-2 text-center border-y border-gray-300 dark:border-gray-600 text-github-text-primary dark:text-white bg-white dark:bg-github-medium disabled:opacity-50"
                  />
                  <button
                    type="button"
                    onClick={() => setQuizCount(Math.min(30, quizCount + 1))}
                    disabled={!outputFormats.multipleChoice}
                    className="px-3 py-2 border border-l-0 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-github-text-primary dark:text-gray-200 rounded-r-md hover:bg-gray-100 dark:hover:bg-gray-600 disabled:opacity-50"
                  >
                    <i className="fas fa-plus"></i>
                  </button>
                </div>
                <p className="mt-1 text-xs text-github-text-secondary dark:text-gray-400">Enter number between 1-30</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end mt-6">
          <button 
            type="submit" 
            className="px-6 py-2 bg-primary-600 hover:bg-primary-700 dark:bg-primary-700 dark:hover:bg-primary-800 text-white rounded-md flex items-center"
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
                <i className="fas fa-magic mr-2"></i> Generate Study Materials
              </>
            )}
          </button>
        </div>
      </form>

      {/* How it works section */}
      <div className="mt-8 bg-white dark:bg-github-medium border border-gray-200 dark:border-github-border rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-github-text-primary dark:text-white mb-4 flex items-center">
          <i className="fas fa-info-circle text-primary-500 mr-2"></i>
          How It Works
        </h3>
        <div className="space-y-4">
          <div className="flex items-start">
            <div className="flex-shrink-0 h-8 w-8 rounded-full bg-gray-100 dark:bg-gray-700 text-primary-600 flex items-center justify-center mr-3">
              <i className="fas fa-upload"></i>
            </div>
            <div>
              <p className="font-medium text-github-text-primary dark:text-white">Upload your PDF</p>
              <p className="text-sm text-github-text-secondary dark:text-gray-400">Select any PDF document containing educational content</p>
            </div>
          </div>
          
          <div className="flex items-start">
            <div className="flex-shrink-0 h-8 w-8 rounded-full bg-gray-100 dark:bg-gray-700 text-primary-600 flex items-center justify-center mr-3">
              <i className="fas fa-cog"></i>
            </div>
            <div>
              <p className="font-medium text-github-text-primary dark:text-white">Choose your options</p>
              <p className="text-sm text-github-text-secondary dark:text-gray-400">Select which study materials to generate and how many</p>
            </div>
          </div>
          
          <div className="flex items-start">
            <div className="flex-shrink-0 h-8 w-8 rounded-full bg-gray-100 dark:bg-gray-700 text-primary-600 flex items-center justify-center mr-3">
              <i className="fas fa-robot"></i>
            </div>
            <div>
              <p className="font-medium text-github-text-primary dark:text-white">AI processing</p>
              <p className="text-sm text-github-text-secondary dark:text-gray-400">Our AI analyzes your document to create personalized study materials</p>
            </div>
          </div>
          
          <div className="flex items-start">
            <div className="flex-shrink-0 h-8 w-8 rounded-full bg-gray-100 dark:bg-gray-700 text-primary-600 flex items-center justify-center mr-3">
              <i className="fas fa-graduation-cap"></i>
            </div>
            <div>
              <p className="font-medium text-github-text-primary dark:text-white">Start studying</p>
              <p className="text-sm text-github-text-secondary dark:text-gray-400">Review your materials and chat with AI about the content</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Upload;