import React from 'react';
import { Link } from 'react-router-dom';

const LandingPage = () => {
  return (
    <div className="bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 min-h-screen">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-5xl font-extrabold tracking-tight mb-4 text-primary-600 dark:text-primary-400">
            <i className="fas fa-brain mr-2"></i> GPTutor
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
            Transform PDFs into interactive study materials
          </p>
          <Link to="/app" className="btn-primary text-lg px-6 py-3">
            Start Using GPTutor <i className="fas fa-arrow-right ml-2"></i>
          </Link>
        </div>

        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="card hover:shadow-lg transition-shadow">
            <div className="card-body text-center p-6">
              <div className="bg-primary-100 dark:bg-primary-900 w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center">
                <i className="fas fa-clone text-2xl text-primary-600 dark:text-primary-400"></i>
              </div>
              <h3 className="text-xl font-semibold mb-3">Flashcards</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Convert your documents into interactive flashcards for effective study sessions.
              </p>
            </div>
          </div>
          
          <div className="card hover:shadow-lg transition-shadow">
            <div className="card-body text-center p-6">
              <div className="bg-primary-100 dark:bg-primary-900 w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center">
                <i className="fas fa-file-alt text-2xl text-primary-600 dark:text-primary-400"></i>
              </div>
              <h3 className="text-xl font-semibold mb-3">Summaries</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Generate concise summaries of complex materials to enhance comprehension.
              </p>
            </div>
          </div>
          
          <div className="card hover:shadow-lg transition-shadow">
            <div className="card-body text-center p-6">
              <div className="bg-primary-100 dark:bg-primary-900 w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center">
                <i className="fas fa-columns text-2xl text-primary-600 dark:text-primary-400"></i>
              </div>
              <h3 className="text-xl font-semibold mb-3">Cornell Notes</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Create structured Cornell notes to improve retention and understanding.
              </p>
            </div>
          </div>
        </div>
        
        <footer className="mt-16 text-center text-gray-500 dark:text-gray-400">
          <p>Powered by AI • Fast and Efficient • Free to Use</p>
        </footer>
      </div>
    </div>
  );
};

export default LandingPage;
