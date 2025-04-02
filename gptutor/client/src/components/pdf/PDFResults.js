import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import ChatPanel from './ChatPanel';

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
        const response = await axios.get(`/api/pdf/results/${id}`);
        setResults(response.data);
        
        // Set active tab to the first available format
        if (response.data) {
          if (response.data.flashcards) setActiveTab('flashcards');
          else if (response.data.summary) setActiveTab('summary');
          else if (response.data.cornellNotes) setActiveTab('cornellNotes');
        }
        
        setLoading(false);
      } catch (err) {
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

  if (loading) {
    return (
      <div className="container">
        <article aria-busy="true">
          <h2>Loading results...</h2>
        </article>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container">
        <article>
          <header>
            <h1>Error</h1>
          </header>
          <p>{error}</p>
          <footer>
            <Link to="/upload" role="button">Try Again</Link>
          </footer>
        </article>
      </div>
    );
  }

  if (!results) {
    return (
      <div className="container">
        <article>
          <header>
            <h1>No Results Found</h1>
          </header>
          <p>The requested results could not be found.</p>
          <footer>
            <Link to="/upload" role="button">Upload New PDF</Link>
          </footer>
        </article>
      </div>
    );
  }

  return (
    <div className="container-fluid">
      <article>
        <header>
          <hgroup>
            <h1 className="mb-0">Study Materials</h1>
            <h2 className="text-muted" style={{ fontSize: '1rem', fontWeight: 'normal' }}>
              <i className="fas fa-file-pdf"></i> {results.fileName}
            </h2>
          </hgroup>
        </header>

        <nav aria-label="breadcrumb">
          <ul>
            {results.flashcards && (
              <li>
                <a 
                  href="#flashcards" 
                  onClick={(e) => { e.preventDefault(); setActiveTab('flashcards'); }}
                  className={activeTab === 'flashcards' ? 'secondary' : ''}
                  role="button"
                >
                  <i className="fas fa-clone"></i> Flashcards
                </a>
              </li>
            )}
            {results.summary && (
              <li>
                <a 
                  href="#summary" 
                  onClick={(e) => { e.preventDefault(); setActiveTab('summary'); }}
                  className={activeTab === 'summary' ? 'secondary' : ''}
                  role="button"
                >
                  <i className="fas fa-file-alt"></i> Summary
                </a>
              </li>
            )}
            {results.cornellNotes && (
              <li>
                <a 
                  href="#cornell" 
                  onClick={(e) => { e.preventDefault(); setActiveTab('cornellNotes'); }}
                  className={activeTab === 'cornellNotes' ? 'secondary' : ''}
                  role="button"
                >
                  <i className="fas fa-columns"></i> Cornell Notes
                </a>
              </li>
            )}
          </ul>
        </nav>

        {/* Main content section with strict 6:4 ratio */}
        <div style={{ 
          display: "flex", 
          width: "100%", 
          gap: "1rem",
          minHeight: "700px"
        }}>
          {/* Study materials - exactly 60% width */}
          <div style={{ width: "60%", overflow: "auto" }}>
            <article>
              {activeTab === 'flashcards' && renderFlashcards()}
              {activeTab === 'summary' && renderSummary()}
              {activeTab === 'cornellNotes' && renderCornellNotes()}
            </article>
          </div>
          
          {/* Vertical divider */}
          <div 
            aria-hidden="true" 
            style={{ 
              width: "2px",
              background: "var(--card-border-color)",
              margin: "0" 
            }}
          ></div>
          
          {/* Chat panel section - exactly 40% width */}
          <div style={{ width: "40%", padding: "0" }}>
            <ChatPanel pdfId={id} fileName={results.fileName} />
          </div>
        </div>

        <footer className="mt-4">
          <Link to="/upload" role="button" className="contrast outline">
            <i className="fas fa-arrow-left"></i> Process Another PDF
          </Link>
        </footer>
      </article>
    </div>
  );
};

export default PDFResults;
