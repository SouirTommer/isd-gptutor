import React, { useState, useEffect } from 'react';

const MultipleChoice = ({ questions = [] }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);

  useEffect(() => {
    // Reset state when questions change
    setCurrentQuestionIndex(0);
    setSelectedAnswers({});
    setShowResults(false);
    setScore(0);
  }, [questions]);

  const handleAnswerSelect = (questionIndex, answerIndex) => {
    setSelectedAnswers({
      ...selectedAnswers,
      [questionIndex]: answerIndex
    });
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleSubmit = () => {
    let correctAnswers = 0;
    questions.forEach((question, index) => {
      if (selectedAnswers[index] === question.correctAnswer) {
        correctAnswers++;
      }
    });
    
    setScore(correctAnswers);
    setShowResults(true);
  };

  const resetQuiz = () => {
    setSelectedAnswers({});
    setCurrentQuestionIndex(0);
    setShowResults(false);
    setScore(0);
  };

  if (!questions || questions.length === 0) {
    return <div className="text-center p-8">No multiple choice questions available.</div>;
  }

  if (showResults) {
    return (
      <div className="bg-github-medium border border-github-border rounded-lg p-8">
        <h3 className="text-2xl font-bold mb-6 text-center">Quiz Results</h3>
        
        <div className="text-center mb-8">
          <div className="text-4xl font-bold mb-2 text-github-text-link">
            {score} / {questions.length}
          </div>
          <div className="text-xl">
            {score === questions.length ? 'Perfect score!' : 
             score > questions.length / 2 ? 'Good job!' : 
             'Keep studying!'}
          </div>
        </div>
        
        <div className="space-y-6">
          {questions.map((question, qIndex) => {
            const isCorrect = selectedAnswers[qIndex] === question.correctAnswer;
            
            return (
              <div 
                key={qIndex} 
                className={`p-4 rounded-lg ${isCorrect ? 'bg-opacity-20 bg-green-900' : 'bg-opacity-20 bg-red-900'}`}
              >
                <div className="font-semibold mb-2">
                  {qIndex + 1}. {question.question}
                </div>
                
                <div className="ml-4">
                  {question.options.map((option, oIndex) => (
                    <div 
                      key={oIndex} 
                      className={`py-1 ${
                        oIndex === question.correctAnswer ? 'text-green-400' : 
                        oIndex === selectedAnswers[qIndex] ? 'text-red-400' : ''
                      }`}
                    >
                      {oIndex === question.correctAnswer && <i className="fas fa-check-circle mr-1"></i>}
                      {oIndex === selectedAnswers[qIndex] && oIndex !== question.correctAnswer && <i className="fas fa-times-circle mr-1"></i>}
                      {option}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
        
        <div className="mt-8 text-center">
          <button 
            onClick={resetQuiz} 
            className="btn-primary inline-flex items-center justify-center"
          >
            <i className="fas fa-redo mr-2"></i> Try Again
          </button>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div className="bg-github-medium border border-github-border rounded-lg p-6">
      <div className="mb-6 text-center">
        <h3 className="text-xl font-semibold">Multiple Choice Quiz</h3>
        <p className="text-github-text-secondary text-sm mt-1">
          Question {currentQuestionIndex + 1} of {questions.length}
        </p>
      </div>
      
      <div className="mb-8">
        <h4 className="text-xl mb-4 font-medium">{currentQuestion.question}</h4>
        
        <div className="space-y-3">
          {currentQuestion.options.map((option, index) => (
            <label 
              key={index}
              className={`flex items-center p-3 rounded-lg cursor-pointer border ${
                selectedAnswers[currentQuestionIndex] === index 
                  ? 'border-primary-500 bg-primary-900 bg-opacity-10' 
                  : 'border-github-border hover:bg-github-light'
              }`}
            >
              <input
                type="radio"
                name={`question-${currentQuestionIndex}`}
                checked={selectedAnswers[currentQuestionIndex] === index}
                onChange={() => handleAnswerSelect(currentQuestionIndex, index)}
                className="sr-only" // Hide the default radio button
              />
              <div className={`w-5 h-5 rounded-full border mr-3 flex items-center justify-center ${
                selectedAnswers[currentQuestionIndex] === index 
                  ? 'border-primary-500 bg-primary-500' 
                  : 'border-github-border'
              }`}>
                {selectedAnswers[currentQuestionIndex] === index && (
                  <div className="w-2 h-2 rounded-full bg-white"></div>
                )}
              </div>
              <span>{option}</span>
            </label>
          ))}
        </div>
      </div>
      
      <div className="flex justify-between items-center">
        <button
          onClick={handlePrevious}
          disabled={currentQuestionIndex === 0}
          className={`btn-secondary ${currentQuestionIndex === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <i className="fas fa-arrow-left mr-2"></i> Previous
        </button>
        
        <div className="text-github-text-secondary">
          {Object.keys(selectedAnswers).length} of {questions.length} answered
        </div>
        
        {currentQuestionIndex < questions.length - 1 ? (
          <button
            onClick={handleNext}
            className="btn-secondary"
          >
            Next <i className="fas fa-arrow-right ml-2"></i>
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={Object.keys(selectedAnswers).length < questions.length}
            className={`btn-primary ${
              Object.keys(selectedAnswers).length < questions.length 
                ? 'opacity-50 cursor-not-allowed' 
                : ''
            }`}
            title={
              Object.keys(selectedAnswers).length < questions.length 
                ? 'Answer all questions to submit' 
                : 'Submit answers'
            }
          >
            Submit <i className="fas fa-check ml-2"></i>
          </button>
        )}
      </div>
      
      {Object.keys(selectedAnswers).length < questions.length && (
        <div className="mt-4 text-center text-github-text-secondary text-sm">
          Answer all questions to submit
        </div>
      )}
    </div>
  );
};

export default MultipleChoice;
