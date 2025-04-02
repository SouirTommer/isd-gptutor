import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import ChatPanel from './ChatPanel';
import MultipleChoice from './MultipleChoice';

const PDFResults = () => {
  const { id } = useParams();
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('flashcards');
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [slideAnimation, setSlideAnimation] = useState('');

  useEffect(() => {
    const fetchResults = async () => {
      try {
        console.log('Fetching results for ID:', id);
        const response = await axios.get(`/api/pdf/results/${id}`);
        console.log('API response data:', response.data);
        
        // Debug logging for multiple choice data
        console.log('Multiple Choice exists:', 'multipleChoice' in response.data);
        
        setResults(response.data);
        
        // Set active tab based on available data
        if (response.data) {
          if (response.data.flashcards && response.data.flashcards.length > 0) {
            setActiveTab('flashcards');
          } else if ('multipleChoice' in response.data) {  // Just check if property exists
            setActiveTab('multipleChoice');
          } else if (response.data.summary) {
            setActiveTab('summary');
          } else if (response.data.cornellNotes) {
            setActiveTab('cornellNotes');
          }
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching results:', err);
        setError('Error fetching results. Please try again.');
        setLoading(false);
      }
    };

    fetchResults();
  }, [id]);

  // Reset states when changing tabs
  useEffect(() => {
    setIsFlipped(false);
    setSlideAnimation('');
    setCurrentCardIndex(0);
  }, [activeTab]);

  const handleNextCard = () => {
    if (!results?.flashcards) return;
    
    // First slide out current card
    setSlideAnimation('slide-out-left');
    setIsFlipped(false);
    
    // After animation completes, change card and slide in
    setTimeout(() => {
      if (currentCardIndex < results.flashcards.length - 1) {
        setCurrentCardIndex(currentCardIndex + 1);
      } else {
        setCurrentCardIndex(0); // Loop back to the first card
      }
      
      setSlideAnimation('slide-in-right');
      
      // Clear animation class after it completes
      setTimeout(() => {
        setSlideAnimation('');
      }, 150);
    }, 150);
  };

  const handlePrevCard = () => {
    if (!results?.flashcards) return;
    
    // First slide out current card
    setSlideAnimation('slide-out-right');
    setIsFlipped(false);
    
    // After animation completes, change card and slide in
    setTimeout(() => {
      if (currentCardIndex > 0) {
        setCurrentCardIndex(currentCardIndex - 1);
      } else {
        setCurrentCardIndex(results.flashcards.length - 1); // Loop to the last card
      }
      
      setSlideAnimation('slide-in-left');
      
      // Clear animation class after it completes
      setTimeout(() => {
        setSlideAnimation('');
      }, 150);
    }, 150);
  };

  const toggleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const renderFlashcards = () => {
    if (!results?.flashcards || results.flashcards.length === 0) {
      return <p>No flashcards available</p>;
    }
    
    const currentCard = results.flashcards[currentCardIndex];
    
    return (
      <div className="flashcards-container">
        <div className="flashcard-wrapper" onClick={toggleFlip}>
          <div className={`flashcard ${isFlipped ? 'flipped' : ''}`}>
            <div className={`flashcard-side flashcard-front ${slideAnimation}`}>
              <span className="card-label">Question {currentCardIndex + 1} <i className="fas fa-question-circle"></i></span>
              <div className="card-content">{currentCard.question}</div>
            </div>
            <div className={`flashcard-side flashcard-back ${slideAnimation}`}>
              <span className="card-label">Answer <i className="fas fa-lightbulb"></i></span>
              <div className="card-content">{currentCard.answer}</div>
            </div>
          </div>
        </div>
        
        <div className="flashcard-navigation">
          <button onClick={(e) => { e.stopPropagation(); handlePrevCard(); }}><i className="fas fa-chevron-left"></i> Previous</button>
          <button onClick={(e) => { e.stopPropagation(); toggleFlip(); }}>
            {isFlipped ? <><i className="fas fa-eye"></i> Show Question</> : <><i className="fas fa-eye"></i> Show Answer</>}
          </button>
          <button onClick={(e) => { e.stopPropagation(); handleNextCard(); }}>Next <i className="fas fa-chevron-right"></i></button>
        </div>
        
        <div className="flashcard-progress">
          <i className="fas fa-book-open"></i> Card {currentCardIndex + 1} of {results.flashcards.length}
        </div>
      </div>
    );
  };

  const renderSummary = () => {
    if (!results?.summary) return <p>No summary available</p>;
    
    // Split the summary into paragraphs
    const paragraphs = results.summary.split(/\n+/).filter(p => p.trim() !== '');
    
    return (
      <div className="summary">
        <h3><i className="fas fa-file-alt"></i> Document Summary</h3>
        <div className="summary-content">
          {paragraphs.map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
        </div>
      </div>
    );
  };

  const renderCornellNotes = () => {
    if (!results?.cornellNotes) return <p>No Cornell notes available</p>;
    
    // Get the arrays or default to empty arrays
    const cues = results.cornellNotes.cues || [];
    const notes = results.cornellNotes.notes || [];
    
    // Create pairs with matching indices
    const maxLength = Math.max(cues.length, notes.length);
    const rows = [];
    
    for (let i = 0; i < maxLength; i++) {
      rows.push({
        cue: i < cues.length ? cues[i] : '',
        note: i < notes.length ? notes[i] : ''
      });
    }
    
    return (
      <div className="cornell-notes">
        <table className="cornell-table">
          <thead>
            <tr>
              <th className="cues-header"><i className="fas fa-list-ul"></i> Cues</th>
              <th className="notes-header"><i className="fas fa-sticky-note"></i> Notes</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr key={index}>
                <td className="cue-cell">
                  <div className="cue-content">
                    {row.cue && <span className="bullet"><i className="fas fa-circle-dot"></i></span>}
                    {row.cue}
                  </div>
                </td>
                <td className="note-cell">{row.note}</td>
              </tr>
            ))}
          </tbody>
        </table>
        
        <div className="summary-section">
          <h3><i className="fas fa-bookmark"></i> Summary</h3>
          <p>{results.cornellNotes.summary}</p>
        </div>
      </div>
    );
  };

  const renderMultipleChoice = () => {
    console.log("Rendering multiple choice section with data:", results?.multipleChoice);
    
    // Always render the component even if no questions, it will handle the empty state
    return <MultipleChoice questions={results?.multipleChoice || []} />;
  };

  // Debug component to check data structure
  const renderDebugInfo = () => {
    if (!results) return null;
    
    return (
      <div className="mt-4 p-4 bg-gray-800 rounded-lg text-xs overflow-auto max-h-40">
        <h4 className="font-bold mb-2">Available study formats:</h4>
        <ul>
          <li>Flashcards: {results.flashcards ? results.flashcards.length : 0} cards</li>
          <li>Multiple Choice: {results.multipleChoice ? results.multipleChoice.length : 0} questions</li>
          <li>Summary: {results.summary ? 'Yes' : 'No'}</li>
          <li>Cornell Notes: {results.cornellNotes ? 'Yes' : 'No'}</li>
        </ul>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse flex flex-col items-center justify-center min-h-[400px]">
          <div className="h-10 w-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-700">Loading results...</h2>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
          <div className="p-6">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
            <p className="text-gray-700 dark:text-gray-300 mb-6">{error}</p>
            <Link to="/upload" className="btn-primary">
              Try Again
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!results) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
          <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">No Results Found</h1>
            <p className="text-gray-700 dark:text-gray-300 mb-6">The requested results could not be found.</p>
            <Link to="/upload" className="btn-primary">
              Upload New PDF
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-1">Study Materials</h1>
        <h2 className="text-sm text-gray-500 flex items-center">
          <i className="fas fa-file-pdf mr-2"></i> {results.fileName}
        </h2>
      </div>

      <div className="mb-6">
        <nav className="flex space-x-1 border-b border-gray-200">
          {results?.flashcards && results.flashcards.length > 0 && (
            <button
              onClick={() => setActiveTab('flashcards')}
              className={`px-4 py-2 font-medium text-sm rounded-t-lg ${
                activeTab === 'flashcards'
                  ? 'bg-primary-100 text-primary-700 border-b-2 border-primary-500'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
              }`}
            >
              <i className="fas fa-clone mr-2"></i> Flashcards
            </button>
          )}
          
          {/* FIXED: Remove array length check - just check if property exists */}
          {results && 'multipleChoice' in results && (
            <button
              onClick={() => setActiveTab('multipleChoice')}
              className={`px-4 py-2 font-medium text-sm rounded-t-lg ${
                activeTab === 'multipleChoice'
                  ? 'bg-primary-100 text-primary-700 border-b-2 border-primary-500'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
              }`}
            >
              <i className="fas fa-tasks mr-2"></i> Quiz
            </button>
          )}
          
          {results.summary && (
            <button
              onClick={() => setActiveTab('summary')}
              className={`px-4 py-2 font-medium text-sm rounded-t-lg ${
                activeTab === 'summary'
                  ? 'bg-primary-100 text-primary-700 border-b-2 border-primary-500'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
              }`}
            >
              <i className="fas fa-file-alt mr-2"></i> Summary
            </button>
          )}
          
          {results.cornellNotes && (
            <button
              onClick={() => setActiveTab('cornellNotes')}
              className={`px-4 py-2 font-medium text-sm rounded-t-lg ${
                activeTab === 'cornellNotes'
                  ? 'bg-primary-100 text-primary-700 border-b-2 border-primary-500'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
              }`}
            >
              <i className="fas fa-columns mr-2"></i> Cornell Notes
            </button>
          )}
        </nav>
      </div>

      {/* Main content section with 6:4 ratio */}
      <div className="flex flex-col md:flex-row gap-6">
        {/* Study materials - 60% width */}
        <div className="w-full md:w-3/5">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 h-full">
            {activeTab === 'flashcards' && renderFlashcards()}
            {activeTab === 'multipleChoice' && renderMultipleChoice()}
            {activeTab === 'summary' && renderSummary()}
            {activeTab === 'cornellNotes' && renderCornellNotes()}
            
            {/* Add a debug section that shows what tabs should be visible */}
            <div className="mt-8 p-4 bg-gray-100 dark:bg-gray-700 rounded-lg text-xs">
              <p>Debug Info:</p>
              <ul>
                <li>Active Tab: {activeTab}</li>
                <li>Flashcards available: {results?.flashcards ? 'Yes' : 'No'} (Count: {results?.flashcards?.length || 0})</li>
                <li>Multiple Choice available: {results?.multipleChoice ? 'Yes' : 'No'} (Count: {results?.multipleChoice?.length || 0})</li>
                <li>Summary available: {results?.summary ? 'Yes' : 'No'}</li>
                <li>Cornell Notes available: {results?.cornellNotes ? 'Yes' : 'No'}</li>
              </ul>
            </div>
          </div>
        </div>
        
        {/* Chat panel section - 40% width */}
        <div className="w-full md:w-2/5">
          <ChatPanel pdfId={id} fileName={results.fileName} />
        </div>
      </div>

      <div className="mt-6">
        <Link 
          to="/upload" 
          className="btn-outline flex items-center w-auto inline-flex"
        >
          <i className="fas fa-arrow-left mr-2"></i> Process Another PDF
        </Link>
      </div>
    </div>
  );
};

export default PDFResults;
