import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import ChatPanel from './ChatPanel';
import MultipleChoice from './MultipleChoice';
import { recordLearningActivity } from '../../utils/streakUtils';
// import './PDFStyles.css'; // Import the CSS file

const PDFResults = () => {
  const { id } = useParams();
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('flashcards');
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [slideAnimation, setSlideAnimation] = useState('');
  const [cardLoading, setCardLoading] = useState(false); // Added state for flashcard loading
  const [tabLoading, setTabLoading] = useState(false); // New state for loading animation
  const [showChatPanel, setShowChatPanel] = useState(true); // New state for toggling chat panel
  
  // Feynman mode state variables
  const [feynmanMode, setFeynmanMode] = useState({
    active: false,
    loading: false,
    questions: [],
    currentQuestionIndex: 0,
    userResponses: {},
    evaluation: null,
    showEvaluation: false
  });
  const [userTeachingInput, setUserTeachingInput] = useState('');

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
        
        // Record learning activity when materials are viewed
        recordLearningActivity();
        
        // Add a slight delay before removing the loading state
        // to make the loading animation more noticeable
        setTimeout(() => {
          setLoading(false);
        }, 800);
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

  // Function to handle tab changes with more visible and longer loading animation
  const handleTabChange = (tab) => {
    if (tab === activeTab) return;
    
    setTabLoading(true);
    setActiveTab(tab); // Set the active tab immediately to update visual state
    setActiveTab(tab);
    // Use short delay to show loading animation
    setTimeout(() => {
      setTabLoading(false);
    }, 400);
  };

  const handleNextCard = () => {
    if (!results?.flashcards) return;
    // Simply move to next card without animations
    if (currentCardIndex < results.flashcards.length - 1) {
      setCurrentCardIndex(currentCardIndex + 1);
    } else {
      setCurrentCardIndex(0); // Loop back to the first card
    }
    // Reset flip state
    setIsFlipped(false);
  };

  const handlePrevCard = () => {
    if (!results?.flashcards) return;
    // Simply move to previous card without animations
    if (currentCardIndex > 0) {
      setCurrentCardIndex(currentCardIndex - 1);
    } else {
      setCurrentCardIndex(results.flashcards.length - 1); // Loop to the last card
    }
    // Reset flip state
    setIsFlipped(false);
  };

  const toggleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  // Loading placeholder component with improved animation
  const renderLoadingPlaceholder = () => (
    <div className="flex flex-col items-center justify-center p-12 h-64 tab-loading">
      <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mb-4 loading-spinner"></div>
      <p className="text-github-text-secondary dark:text-gray-400 mt-2">Loading content...</p>
    </div>
  );

  const renderFlashcards = () => {
    if (!results?.flashcards || results.flashcards.length === 0) {
      return (
        <div className="text-center py-8">
          <i className="fas fa-exclamation-circle text-4xl text-gray-400 mb-3"></i>
          <p>No flashcards available</p>
        </div>
      );
    }
    const currentCard = results.flashcards[currentCardIndex];
    return (
      <div className="flashcards-container">
        <div className="flashcard-wrapper" onClick={toggleFlip}>
          <div className={`flashcard ${isFlipped ? 'flipped' : ''}`}>
            <div className="flashcard-side flashcard-front flex flex-col">
              <div className="text-xl font-bold w-full text-center py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-center">
                <i className="fas fa-question-circle text-primary-500 mr-2"></i> Question {currentCardIndex + 1}
              </div>
              <div className="card-content flex-1 flex items-center justify-center p-4">
                {currentCard.question}
              </div>
            </div>
            <div className="flashcard-side flashcard-back flex flex-col">
              <div className="text-xl font-bold w-full text-center py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-center">
                <i className="fas fa-lightbulb text-yellow-500 mr-2"></i> Answer
              </div>
              <div className="card-content flex-1 flex items-center justify-center p-4">
                {currentCard.answer}
              </div>
            </div>
          </div>
        </div>
        <div className="flashcard-navigation flex justify-center items-center space-x-3 mt-4">
          <button 
            onClick={(e) => { e.stopPropagation(); handlePrevCard(); }}
            className="btn btn-outline flex items-center px-4 py-2"
          >
            <i className="fas fa-chevron-left mr-2"></i> Previous
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); toggleFlip(); }}
            className="btn btn-primary flex items-center px-4 py-2"
          >
            {isFlipped ? 
              <><i className="fas fa-sync-alt mr-2"></i> Show Question</> : 
              <><i className="fas fa-eye mr-2"></i> Show Answer</>}
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); handleNextCard(); }}
            className="btn btn-outline flex items-center px-4 py-2"
          >
            Next <i className="fas fa-chevron-right ml-2"></i>
          </button>
        </div>
        <div className="flashcard-progress text-center mt-3 flex items-center justify-center">
          <i className="fas fa-book-open mr-2 text-primary-500"></i>
          <span>Card {currentCardIndex + 1} of {results.flashcards.length}</span>
          <i className="fas fa-graduation-cap ml-2 text-primary-500"></i>
        </div>
      </div>
    );
  };

  const renderSummary = () => {
    if (!results?.summary) return (
      <div className="text-center py-8">
        <i className="fas fa-file-alt text-4xl text-gray-400 mb-3"></i>
        <p>No summary available</p>
      </div>
    );
    // Split the summary into paragraphs
    const paragraphs = results.summary.split(/\n+/).filter(p => p.trim() !== '');
    return (
      <div className="summary">
        <h3 className="mb-4">
          <i className="fas fa-file-alt text-primary-500 mr-2"></i> Document Summary
        </h3>
        <div className="summary-content">
          {paragraphs.map((paragraph, index) => (
            <p key={index} className="text-gray-800 dark:text-gray-200">
              {paragraph}
            </p>
          ))}
        </div>
      </div>
    );
  };

  const renderCornellNotes = () => {
    if (!results?.cornellNotes) return (
      <div className="text-center py-8">
        <i className="fas fa-columns text-4xl text-gray-400 mb-3"></i>
        <p>No Cornell notes available</p>
      </div>
    );
    // Get the arrays or default to empty arrays
    const cues = results.cornellNotes.cues || [];
    const notes = results.cornellNotes.notes || [];
    // Process notes to detect multi-line content
    // This will create a proper data structure that maps cues to corresponding notes
    const processedData = [];
    // First, create a map to collect all notes for each cue index
    const cueToNotesMap = {};
    // If notes and cues are mismatched, we need to handle that
    for (let i = 0; i < Math.max(cues.length, notes.length); i++) {
      const cue = i < cues.length ? cues[i] : '';
      const note = i < notes.length ? notes[i] : '';
      if (cue) {
        // New cue - start a new entry
        if (!cueToNotesMap[i]) {
          cueToNotesMap[i] = [];
        }
        cueToNotesMap[i].push(note);
      } else if (note && i > 0) {
        // No cue but has a note - this is likely a continuation
        // Add this note to the previous cue
        const lastCueIndex = Math.max(...Object.keys(cueToNotesMap).map(Number));
        if (cueToNotesMap[lastCueIndex]) {
          cueToNotesMap[lastCueIndex].push(note);
        }
      }
    }
    // Now convert the map to an array of objects for rendering
    Object.keys(cueToNotesMap).forEach(cueIndex => {
      processedData.push({
        cue: cues[cueIndex],
        notes: cueToNotesMap[cueIndex].filter(note => note) // Remove empty notes
      });
    });
    return (
      <div className="cornell-notes">
        <div className="cornell-header mb-4">
          <h3 className="text-xl font-bold mb-2"><i className="fas fa-columns text-primary-500 mr-2"></i> Cornell Notes</h3>
        </div>
        <div className="cornell-table-container overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
          <table className="cornell-table w-full">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="w-1/3 px-4 py-3 text-left text-sm font-semibold text-primary-700 dark:text-primary-400 border-r border-gray-200 dark:border-gray-700">
                  <i className="fas fa-list-ul mr-2"></i> Cues/Questions
                </th>
                <th className="w-2/3 px-4 py-3 text-left text-sm font-semibold text-primary-700 dark:text-primary-400">
                  <i className="fas fa-sticky-note mr-2"></i> Notes/Answers
                </th>
              </tr>
            </thead>
            <tbody>
              {processedData.map((item, index) => (
                <tr key={index} className={index % 2 === 0 ? 'bg-white dark:bg-gray-900' : 'bg-gray-50 dark:bg-gray-800'}>
                  <td className="cue-cell px-4 py-3 border-r border-gray-200 dark:border-gray-700">
                    {item.cue && (
                      <div className="cue-content text-gray-800 dark:text-gray-200">
                        <div className="bullet text-primary-500">
                          <i className="fas fa-circle text-xs"></i>
                        </div>
                        <div className="flex-1">{item.cue}</div>
                      </div>
                    )}
                  </td>
                  <td className="note-cell px-4 py-3 text-gray-800 dark:text-gray-200">
                    {item.notes.map((note, noteIndex) => (
                      <div key={noteIndex} className="note-paragraph">
                        {note}
                      </div>
                    ))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="summary-section mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold mb-2 text-primary-700 dark:text-primary-400">
            <i className="fas fa-bookmark mr-2"></i> Summary
          </h3>
          <p className="text-gray-800 dark:text-gray-200">{results.cornellNotes.summary}</p>
        </div>
      </div>
    );
  };

  const renderMultipleChoice = () => {
    console.log("Rendering multiple choice section with data:", results?.multipleChoice);
    // Always render the component even if no questions, it will handle the empty state
    return <MultipleChoice questions={results?.multipleChoice || []} />;
  };

  // Function to start Feynman mode
  const startFeynmanMode = async () => {
    setFeynmanMode(prev => ({ ...prev, active: true, loading: true }));
    
    try {
      // Use the document's content stored in results to generate questions
      const response = await axios.post('/api/pdf/feynman-questions', { 
        pdfId: id,
        text: results.originalText || results.summary
      });
      
      if (response.data && response.data.questions) {
        setFeynmanMode(prev => ({ 
          ...prev, 
          questions: response.data.questions,
          loading: false 
        }));
      } else {
        throw new Error('Failed to generate questions');
      }
    } catch (err) {
      console.error('Error starting Feynman mode:', err);
      setFeynmanMode(prev => ({ 
        ...prev, 
        loading: false,
        active: false,
        error: 'Failed to start Feynman mode. Please try again.' 
      }));
    }
  };
  
  // Function to handle user teaching submission
  const submitTeaching = async () => {
    if (!userTeachingInput.trim()) return;
    
    const currentQuestion = feynmanMode.questions[feynmanMode.currentQuestionIndex];
    const updatedResponses = {
      ...feynmanMode.userResponses,
      [feynmanMode.currentQuestionIndex]: userTeachingInput
    };
    
    setFeynmanMode(prev => ({
      ...prev,
      userResponses: updatedResponses
    }));
    
    // Move to next question or evaluate if it's the last question
    if (feynmanMode.currentQuestionIndex < feynmanMode.questions.length - 1) {
      setFeynmanMode(prev => ({
        ...prev,
        currentQuestionIndex: prev.currentQuestionIndex + 1
      }));
      setUserTeachingInput('');
    } else {
      // Last question, send for evaluation
      setFeynmanMode(prev => ({ ...prev, loading: true }));
      
      try {
        const evaluationResponse = await axios.post('/api/pdf/feynman-evaluate', {
          pdfId: id,
          responses: updatedResponses,
          questions: feynmanMode.questions
        });
        
        if (evaluationResponse.data && evaluationResponse.data.evaluation) {
          setFeynmanMode(prev => ({
            ...prev,
            evaluation: evaluationResponse.data.evaluation,
            showEvaluation: true,
            loading: false
          }));
        } else {
          throw new Error('Failed to get evaluation');
        }
      } catch (err) {
        console.error('Error evaluating teaching:', err);
        setFeynmanMode(prev => ({
          ...prev,
          loading: false,
          error: 'Failed to evaluate your teaching. Please try again.'
        }));
      }
    }
  };
  
  // Function to reset Feynman mode
  const resetFeynmanMode = () => {
    setFeynmanMode({
      active: false,
      loading: false,
      questions: [],
      currentQuestionIndex: 0,
      userResponses: {},
      evaluation: null,
      showEvaluation: false,
      error: null
    });
    setUserTeachingInput('');
  };
  
  // Render Feynman mode UI
  const renderFeynmanMode = () => {
    if (feynmanMode.loading) {
      return (
        <div className="flex flex-col items-center justify-center p-12 h-64">
          <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-github-text-secondary">
            {feynmanMode.active ? 'Processing your teaching...' : 'Preparing questions...'}
          </p>
        </div>
      );
    }
    
    if (feynmanMode.error) {
      return (
        <div className="text-center py-8">
          <i className="fas fa-exclamation-circle text-4xl text-red-500 mb-3"></i>
          <p className="text-red-500 mb-4">{feynmanMode.error}</p>
          <button 
            onClick={resetFeynmanMode}
            className="btn btn-primary"
          >
            Try Again
          </button>
        </div>
      );
    }
    
    // Wrap all Feynman mode content in a centered container with 2/4 width
    const feynmanContainer = (content) => (
      <div className="flex justify-center w-full">
        <div className="w-2/4">
          {content}
        </div>
      </div>
    );
    
    if (!feynmanMode.active) {
      return feynmanContainer(
        <div className="feynman-intro flex flex-col items-center justify-center text-center">
          <i className="fas fa-chalkboard-teacher text-6xl text-primary-500 mb-6"></i>
          <h3 className="text-2xl font-bold mb-3">Feynman Learning Technique</h3>
          <p className="text-lg mb-6 max-w-2xl">
            "If you can't explain it simply, you don't understand it well enough."
            <br />
            - Richard Feynman
          </p>
          <div className="bg-github-light p-8 rounded-lg mb-6 w-full">
            <h4 className="font-bold mb-2">How it works:</h4>
            <ol className="list-decimal list-inside space-y-2">
              <li>The AI will ask you questions about the document</li>
              <li>You explain the concepts as if teaching a student</li>
              <li>Complete all questions to receive an evaluation</li>
              <li>This technique helps solidify your understanding</li>
            </ol>
          </div>
          <button 
            onClick={startFeynmanMode}
            className="btn btn-primary flex items-center px-6 py-3"
          >
            <i className="fas fa-play-circle mr-2"></i> Start Feynman Mode
          </button>
        </div>
      );
    }
    
    if (feynmanMode.showEvaluation) {
      // Get the rating value with a default if it's undefined
      const rating = feynmanMode.evaluation && typeof feynmanMode.evaluation.rating !== 'undefined' 
                     ? feynmanMode.evaluation.rating 
                     : 3; // Default to 3 stars if rating is missing
      
      return feynmanContainer(
        <div className="feynman-evaluation">
          <div className="mb-6 text-center">
            <i className="fas fa-award text-4xl text-yellow-500 mb-3"></i>
            <h3 className="text-xl font-bold">Teaching Evaluation</h3>
          </div>
          
          {/* Star rating display with support for half stars */}
          <div className="text-center mb-6">
            <div className="star-rating text-2xl mb-2">
              {/* Render 5 stars, with support for half stars */}
              {[1, 2, 3, 4, 5].map(star => {
                // Check if we need a full, half, or empty star
                if (rating >= star) {
                  // Full star
                  return (
                    <i 
                      key={star}
                      className="fas fa-star mx-1 text-yellow-500"
                      title={`${rating} out of 5 stars`}
                    ></i>
                  );
                } else if (rating >= star - 0.5) {
                  // Half star 
                  return (
                    <i 
                      key={star}
                      className="fas fa-star-half-alt mx-1 text-yellow-500"
                      title={`${rating} out of 5 stars`}
                    ></i>
                  );
                } else {
                  // Empty star
                  return (
                    <i 
                      key={star}
                      className="far fa-star mx-1 text-gray-400"
                      title={`${rating} out of 5 stars`}
                    ></i>
                  );
                }
              })}
            </div>
            <div className="text-sm text-github-text-secondary">
              Rating: {typeof rating === 'number' ? rating.toFixed(1) : '3.0'} out of 5 stars
            </div>
          </div>
          
          <div className="bg-github-light p-8 px-10 rounded-lg mb-6">
            <h4 className="font-bold mb-3">Overall Assessment:</h4>
            <p className="mb-4">{feynmanMode.evaluation.overall}</p>
            
            <h4 className="font-bold mb-3">Strengths:</h4>
            <ul className="list-disc list-inside mb-4">
              {feynmanMode.evaluation.strengths.map((strength, idx) => (
                <li key={idx} className="mb-1">{strength}</li>
              ))}
            </ul>
            
            <h4 className="font-bold mb-3">Areas for Improvement:</h4>
            <ul className="list-disc list-inside mb-4">
              {feynmanMode.evaluation.improvements.map((improvement, idx) => (
                <li key={idx} className="mb-1">{improvement}</li>
              ))}
            </ul>
          </div>
          
          <div className="flex justify-center">
            <button 
              onClick={resetFeynmanMode}
              className="btn btn-primary flex items-center"
            >
              <i className="fas fa-redo mr-2"></i> Try Again
            </button>
          </div>
        </div>
      );
    }
    
    return feynmanContainer(
      <div className="feynman-active">
        <div className="mb-4 text-center pb-4">
          <h3 className="text-xl font-bold">
            Question {feynmanMode.currentQuestionIndex + 1} of {feynmanMode.questions.length}
          </h3>
          <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4 mt-2">
            <div 
              className="bg-primary-500 h-2.5 rounded-full transition-all duration-300" 
              style={{ width: `${((feynmanMode.currentQuestionIndex + 1) / feynmanMode.questions.length) * 100}%` }}
            ></div>
          </div>
        </div>
        
        <div className="student-question bg-github-light p-7 px-10 rounded-lg mb-6">
          <div className="flex items-start mb-3">
            <i className="fas fa-user-graduate text-xl text-github-text-secondary mt-1 mr-3"></i>
            <div>
              <p className="font-semibold text-sm text-github-text-secondary mb-1">Student asks:</p>
              <p className="text-github-text-primary">{feynmanMode.questions[feynmanMode.currentQuestionIndex]}</p>
            </div>
          </div>
        </div>
        
        <div className="teacher-response mb-4 pt-8">
          <div className="flex items-start mb-2">
            <i className="fas fa-chalkboard-teacher text-xl text-primary-500 mt-1 mr-3"></i>
            <p className="font-semibold text-sm text-github-text-secondary">Your explanation:</p>
          </div>
          <textarea
            value={userTeachingInput}
            onChange={(e) => setUserTeachingInput(e.target.value)}
            placeholder="Explain this concept in simple terms..."
            className="w-full h-40 p-4 border border-github-border rounded-lg resize-none focus:ring-2 focus:ring-primary-500 focus:outline-none bg-github-dark text-github-text-primary"
          />
        </div>
        
        <div className="flex justify-end">
          <button 
            onClick={submitTeaching}
            disabled={!userTeachingInput.trim()}
            className="btn btn-primary flex items-center px-6 py-2 disabled:opacity-50"
          >
            {feynmanMode.currentQuestionIndex < feynmanMode.questions.length - 1 ? (
              <>Next <i className="fas fa-arrow-right ml-2"></i></>
            ) : (
              <>Submit <i className="fas fa-check ml-2"></i></>
            )}
          </button>
        </div>
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
        <h1 className="text-3xl font-bold mb-1 flex items-center">
          <i className="fas fa-graduation-cap text-primary-500 mr-3"></i>
          Study Materials
        </h1>
        <h2 className="text-sm text-gray-500 flex items-center ml-1">
          <i className="fas fa-file-pdf mr-2"></i> {results.fileName}
        </h2>
      </div>
      <div className="mb-6">
        <nav className="flex space-x-1 border-b border-gray-200 dark:border-gray-700">
          {results?.flashcards && results.flashcards.length > 0 && (
            <button
              onClick={() => handleTabChange('flashcards')}
              className={`px-4 py-2 font-medium text-sm rounded-t-lg ${
                activeTab === 'flashcards' 
                  ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 border-b-2 border-primary-500'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              <i className="fas fa-clone mr-2"></i> Flashcards
            </button>
          )}
          
          {results && 'multipleChoice' in results && (
            <button
              onClick={() => handleTabChange('multipleChoice')}
              className={`px-4 py-2 font-medium text-sm rounded-t-lg ${
                activeTab === 'multipleChoice' 
                  ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 border-b-2 border-primary-500'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              <i className="fas fa-tasks mr-2"></i> Quiz
            </button>
          )}
          
          {results.summary && (
            <button
              onClick={() => handleTabChange('summary')}
              className={`px-4 py-2 font-medium text-sm rounded-t-lg ${
                activeTab === 'summary' 
                  ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 border-b-2 border-primary-500'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              <i className="fas fa-file-alt mr-2"></i> Summary
            </button>
          )}
          
          {results.cornellNotes && (
            <button
              onClick={() => handleTabChange('cornellNotes')}
              className={`px-4 py-2 font-medium text-sm rounded-t-lg ${
                activeTab === 'cornellNotes' 
                  ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 border-b-2 border-primary-500'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              <i className="fas fa-columns mr-2"></i> Cornell Notes
            </button>
          )}
          
          {/* Feynman Mode tab - moved to the end */}
          <button
            onClick={() => handleTabChange('feynman')}
            className={`px-4 py-2 font-medium text-sm rounded-t-lg ${
              activeTab === 'feynman' 
                ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 border-b-2 border-primary-500'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            <i className="fas fa-chalkboard-teacher mr-2"></i> Feynman Mode
          </button>
        </nav>
      </div>

      {/* Main content section with 6:4 ratio */}
      <div className="flex flex-col md:flex-row gap-6">
        {/* Study materials - width changes based on chat panel visibility */}
        <div className={`w-full ${showChatPanel && activeTab !== 'feynman' ? 'md:w-3/5' : 'md:w-full'} transition-all duration-300`}>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 h-full overflow-hidden">
            {/* Chat toggle button - don't show in Feynman mode */}
            {activeTab !== 'feynman' && (
              <div className="flex justify-end mb-4">
                <button
                  onClick={() => setShowChatPanel(!showChatPanel)}
                  className="text-sm px-3 py-1 bg-gray-200 hover:bg-gray-300 dark:bg-github-light dark:hover:bg-gray-700 text-gray-800 dark:text-white rounded-md inline-flex items-center"
                >
                  {showChatPanel ? (
                    <>
                      <i className="fas fa-comment-slash mr-1"></i> Hide Chat
                    </>
                  ) : (
                    <>
                      <i className="fas fa-comment mr-1"></i> Show Chat
                    </>
                  )}
                </button>
              </div>
            )}
            
            {tabLoading ? (
              renderLoadingPlaceholder()
            ) : (
              <>
                {activeTab === 'flashcards' && renderFlashcards()}
                {activeTab === 'feynman' && renderFeynmanMode()}
                {activeTab === 'multipleChoice' && renderMultipleChoice()}
                {activeTab === 'summary' && renderSummary()}
                {activeTab === 'cornellNotes' && renderCornellNotes()}
              </>
            )}
          </div>
        </div>
        
        {/* Chat panel section - only shown when showChatPanel is true and not in Feynman mode */}
        {showChatPanel && activeTab !== 'feynman' && (
          <div className="w-full md:w-2/5 transition-all duration-300">
            <ChatPanel pdfId={id} fileName={results?.fileName} />
          </div>
        )}
      </div>

      <div className="mt-6">
        <Link 
          to="/upload" 
          className="btn-outline flex items-center w-auto inline-flex"
        >
          <i className="fas fa-arrow-left mr-2"></i> Process Another PDF
        </Link>
        <Link 
          to="/dashboard" 
          className="btn-outline flex items-center w-auto inline-flex ml-3"
        >
          <i className="fas fa-home mr-2"></i> Back to Dashboard
        </Link>
      </div>
    </div>
  );
};

export default PDFResults;