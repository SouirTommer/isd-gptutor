import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const Sidebar = ({ activePage }) => {
  const [decksExpanded, setDecksExpanded] = useState(false);
  const [studyMaterials, setStudyMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  
  useEffect(() => {
    // Fetch all PDFs from the server
    const fetchStudyMaterials = async () => {
      try {
        const response = await axios.get('/api/pdf/all');
        setStudyMaterials(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching study materials:', err);
        setLoading(false);
      }
    };

    fetchStudyMaterials();
  }, []);
  
  const toggleDecks = () => setDecksExpanded(!decksExpanded);

  return (
    <aside className="fixed top-0 left-0 z-40 w-56 h-screen bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
      {/* Logo */}
      <div className="p-5 border-b border-gray-200 dark:border-gray-700">
        <Link to="/dashboard" className="flex items-center">
          <i className="fas fa-brain text-2xl text-primary-600 mr-3"></i>
          <span className="text-xl font-bold text-gray-900 dark:text-white">GPTutor</span>
        </Link>
      </div>
      
      {/* Navigation */}
      <div className="py-5 px-3 h-[calc(100vh-64px)] flex flex-col">
        <nav className="space-y-1 flex-1 overflow-y-auto">
          <Link 
            to="/dashboard" 
            className={`flex items-center px-4 py-3 text-gray-700 rounded-lg ${
              activePage === 'dashboard'
                ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400'
                : 'hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
            }`}
          >
            <i className="fas fa-chart-line w-6"></i>
            <span className="ml-3">Dashboard</span>
          </Link>
          
          <Link 
            to="/upload" 
            className={`flex items-center px-4 py-3 text-gray-700 rounded-lg ${
              activePage === 'new'
                ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400'
                : 'hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
            }`}
          >
            <i className="fas fa-file-upload w-6"></i>
            <span className="ml-3">New Deck</span>
          </Link>
          
          <div>
            <button
              onClick={toggleDecks}
              className={`flex items-center justify-between w-full px-4 py-3 text-gray-700 rounded-lg hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700`}
            >
              <div className="flex items-center">
                <i className="fas fa-bookmark w-6"></i>
                <span className="ml-3">Your Decks</span>
              </div>
              <i className={`fas fa-chevron-${decksExpanded ? 'down' : 'right'} text-sm`}></i>
            </button>
            
            {decksExpanded && (
              <div className="mt-1 ml-6 pl-3 border-l-2 border-gray-200 dark:border-gray-700 space-y-1">
                {loading ? (
                  <div className="py-2 px-3 text-sm text-gray-500 flex items-center">
                    <i className="fas fa-spinner fa-pulse mr-2"></i> Loading...
                  </div>
                ) : studyMaterials.length === 0 ? (
                  <div className="py-2 px-3 text-sm text-gray-500 flex items-center">
                    <i className="fas fa-folder-open mr-2"></i> No study materials
                  </div>
                ) : (
                  <>
                    {studyMaterials.map((material) => (
                      <Link
                        key={material.id}
                        to={`/results/${material.id}`}
                        className="flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg dark:text-gray-300 dark:hover:bg-gray-700"
                      >
                        <i className="fas fa-file-alt mr-2 text-gray-500"></i>
                        {material.fileName.length > 20 
                          ? material.fileName.substring(0, 20) + '...' 
                          : material.fileName}
                      </Link>
                    ))}
                    {studyMaterials.length > 0 && (
                      <Link
                        to="/dashboard"
                        className="flex items-center px-3 py-2 text-sm text-primary-600 hover:bg-gray-100 rounded-lg dark:text-primary-400 dark:hover:bg-gray-700"
                      >
                        <i className="fas fa-list-alt mr-2"></i> View all materials
                      </Link>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
          
          <div className="pt-5 mt-5 border-t border-gray-200 dark:border-gray-700">
            <Link 
              to="/settings" 
              className={`flex items-center px-4 py-3 text-gray-700 rounded-lg ${
                activePage === 'settings'
                  ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400'
                  : 'hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
              }`}
            >
              <i className="fas fa-cog w-6"></i>
              <span className="ml-3">Settings</span>
            </Link>
            
            <Link 
              to="/profile" 
              className={`flex items-center px-4 py-3 text-gray-700 rounded-lg ${
                activePage === 'profile'
                  ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400'
                  : 'hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
              }`}
            >
              <i className="fas fa-user w-6"></i>
              <span className="ml-3">Profile</span>
            </Link>
          </div>
        </nav>
        
        <div className="text-xs text-center py-4 text-gray-500 flex items-center justify-center">
          <i className="fas fa-code mr-1"></i>
          <p>© {new Date().getFullYear()} GPTutor</p>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
