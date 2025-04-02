import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      {/* Hero Section */}
      <div className="container mx-auto px-4 pt-24 pb-16">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-6xl md:text-7xl font-bold mb-6 text-primary-600 dark:text-primary-400 tracking-tight">
            <i className="fas fa-brain mr-3"></i>GPTutor
          </h1>
          <p className="text-2xl md:text-3xl text-gray-700 dark:text-gray-300 mb-10 leading-relaxed">
            Transform your PDFs into interactive study materials with AI
          </p>
          <Link 
            to="/dashboard" 
            className="inline-flex items-center justify-center px-8 py-4 text-xl font-medium rounded-lg shadow-lg bg-primary-600 hover:bg-primary-700 text-white transition-all transform hover:scale-105"
          >
            Get Started Now <i className="fas fa-arrow-right ml-3"></i>
          </Link>
        </div>
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-4 py-16">
        <h2 className="text-4xl font-bold text-center mb-12 text-gray-800 dark:text-gray-100">
          Powerful Study Tools
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Flashcards Feature */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl overflow-hidden transform transition-all hover:shadow-2xl hover:-translate-y-1">
            <div className="p-8">
              <div className="bg-primary-100 dark:bg-primary-900 w-20 h-20 rounded-full mb-6 mx-auto flex items-center justify-center">
                <i className="fas fa-clone text-3xl text-primary-600 dark:text-primary-400"></i>
              </div>
              <h3 className="text-2xl font-bold text-center mb-4">Flashcards</h3>
              <p className="text-gray-600 dark:text-gray-300 text-center text-lg">
                Create interactive flashcards to test your knowledge and improve recall through active learning.
              </p>
            </div>
          </div>
          
          {/* Summaries Feature */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl overflow-hidden transform transition-all hover:shadow-2xl hover:-translate-y-1">
            <div className="p-8">
              <div className="bg-primary-100 dark:bg-primary-900 w-20 h-20 rounded-full mb-6 mx-auto flex items-center justify-center">
                <i className="fas fa-file-alt text-3xl text-primary-600 dark:text-primary-400"></i>
              </div>
              <h3 className="text-2xl font-bold text-center mb-4">Summaries</h3>
              <p className="text-gray-600 dark:text-gray-300 text-center text-lg">
                Generate concise summaries of complex materials to enhance comprehension and retention.
              </p>
            </div>
          </div>
          
          {/* Cornell Notes Feature */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl overflow-hidden transform transition-all hover:shadow-2xl hover:-translate-y-1">
            <div className="p-8">
              <div className="bg-primary-100 dark:bg-primary-900 w-20 h-20 rounded-full mb-6 mx-auto flex items-center justify-center">
                <i className="fas fa-columns text-3xl text-primary-600 dark:text-primary-400"></i>
              </div>
              <h3 className="text-2xl font-bold text-center mb-4">Cornell Notes</h3>
              <p className="text-gray-600 dark:text-gray-300 text-center text-lg">
                Structure your study notes in the proven Cornell format for better organization and recall.
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <footer className="mt-16 py-10 text-center text-gray-500 dark:text-gray-400">
        <p className="text-lg">Powered by AI • Fast and Efficient • Free to Use</p>
      </footer>
    </div>
  );
};

export default Home;
