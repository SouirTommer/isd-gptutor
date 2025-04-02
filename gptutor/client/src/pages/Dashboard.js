import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const Dashboard = () => {
  const [studyMaterials, setStudyMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fetch all PDFs from the server
    const fetchStudyMaterials = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/api/pdf/all');
        console.log('API response:', response.data); // Debug log to see the structure
        
        // Ensure each material has the correct properties for counting
        const processedData = response.data.map(material => ({
          ...material,
          flashcards: Array.isArray(material.flashcards) ? material.flashcards : [],
          multipleChoice: Array.isArray(material.multipleChoice) ? material.multipleChoice : []
        }));
        
        setStudyMaterials(processedData);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching study materials:', err);
        setError('Failed to load study materials');
        setLoading(false);
      }
    };

    fetchStudyMaterials();
  }, []);

  // Helper function to safely count items
  const countItems = (array) => {
    if (!array) return 0;
    if (!Array.isArray(array)) return 0;
    return array.length;
  };

  // Calculate total flashcards
  const totalFlashcards = studyMaterials.reduce((sum, material) => 
    sum + (Array.isArray(material.flashcards) ? material.flashcards.length : 0), 0);

  return (
    <div className="container mx-auto px-4 py-6">
      <header className="mb-8">
        <h2 className="text-2xl font-bold text-github-text-primary dark:text-white flex items-center">
          <i className="fas fa-chart-line text-primary-500 mr-3"></i>
          Dashboard
        </h2>
        <p className="text-github-text-secondary dark:text-gray-400 flex items-center ml-1">
          <i className="fas fa-info-circle mr-2"></i>
          Welcome to your GPTutor dashboard
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white dark:bg-github-medium border border-gray-200 dark:border-github-border rounded-lg shadow-sm">
          <div className="p-4 border-b border-gray-200 dark:border-github-border bg-gray-50 dark:bg-github-light">
            <h3 className="text-xl font-semibold text-github-text-primary dark:text-white flex items-center">
              <i className="fas fa-chart-bar text-primary-500 mr-2"></i>
              Stats
            </h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-3xl font-bold text-primary-600 dark:text-primary-400 flex items-center justify-center">
                  <i className="fas fa-folder-open text-primary-500 mr-2"></i>
                  {studyMaterials.length}
                </div>
                <p className="text-github-text-secondary dark:text-gray-400">Study Decks</p>
              </div>
              <div>
                <div className="text-3xl font-bold text-primary-600 dark:text-primary-400 flex items-center justify-center">
                  <i className="fas fa-clone text-primary-500 mr-2"></i>
                  {totalFlashcards}
                </div>
                <p className="text-github-text-secondary dark:text-gray-400">Flashcards</p>
              </div>
              <div>
                <div className="text-3xl font-bold text-primary-600 dark:text-primary-400 flex items-center justify-center">
                  <i className="fas fa-file-pdf text-primary-500 mr-2"></i>
                  {studyMaterials.length}
                </div>
                <p className="text-github-text-secondary dark:text-gray-400">PDFs</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-github-medium border border-gray-200 dark:border-github-border rounded-lg shadow-sm">
          <div className="p-4 border-b border-gray-200 dark:border-github-border bg-gray-50 dark:bg-github-light">
            <h3 className="text-xl font-semibold text-github-text-primary dark:text-white flex items-center">
              <i className="fas fa-history text-primary-500 mr-2"></i>
              Recent Study Materials
            </h3>
          </div>
          <div className="p-0">
            {loading ? (
              <div className="p-6 text-center">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-primary-500 border-t-transparent"></div>
                <p className="mt-2 text-github-text-secondary dark:text-gray-400">Loading study materials...</p>
              </div>
            ) : error ? (
              <div className="p-6 text-center text-red-500">
                <i className="fas fa-exclamation-triangle mb-2 text-xl"></i>
                <p>{error}</p>
              </div>
            ) : studyMaterials.length === 0 ? (
              <div className="p-6 text-center">
                <i className="fas fa-folder-open text-4xl text-github-text-secondary mb-2"></i>
                <p className="text-github-text-secondary dark:text-gray-400">No study materials found.</p>
                <Link to="/upload" className="mt-4 inline-block px-4 py-2 bg-primary-600 hover:bg-primary-700 dark:bg-primary-700 dark:hover:bg-primary-800 text-white rounded-md">
                  <i className="fas fa-plus mr-2"></i> Create your first study material
                </Link>
              </div>
            ) : (
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-github-light">
                  <tr>
                    <th className="px-4 py-2 text-left text-github-text-primary dark:text-white">
                      <i className="fas fa-file-alt mr-2"></i> Name
                    </th>
                    <th className="px-4 py-2 text-left text-github-text-primary dark:text-white">
                      <i className="fas fa-clone mr-2"></i> Cards
                    </th>
                    <th className="px-4 py-2 text-left text-github-text-primary dark:text-white">
                      <i className="fas fa-calendar-alt mr-2"></i> Date
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {studyMaterials.slice(0, 5).map(material => (
                    <tr key={material.id} className="border-t border-gray-200 dark:border-github-border hover:bg-gray-50 dark:hover:bg-github-light/50">
                      <td className="px-4 py-2 text-github-text-primary dark:text-gray-200">
                        <Link to={`/results/${material.id}`} className="text-primary-600 dark:text-primary-400 hover:underline">
                          {material.fileName}
                        </Link>
                      </td>
                      <td className="px-4 py-2 text-github-text-primary dark:text-gray-200">{Array.isArray(material.flashcards) ? material.flashcards.length : 0}</td>
                      <td className="px-4 py-2 text-github-text-primary dark:text-gray-200">{new Date(material.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-github-medium border border-gray-200 dark:border-github-border rounded-lg shadow-sm mb-6">
        <div className="p-4 border-b border-gray-200 dark:border-github-border bg-gray-50 dark:bg-github-light">
          <h3 className="text-xl font-semibold text-github-text-primary dark:text-white flex items-center">
            <i className="fas fa-list-alt text-primary-500 mr-2"></i>
            All Study Materials
          </h3>
        </div>
        <div className="p-0">
          {loading ? (
            <div className="p-6 text-center">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-primary-500 border-t-transparent"></div>
              <p className="mt-2 text-github-text-secondary dark:text-gray-400">Loading study materials...</p>
            </div>
          ) : error ? (
            <div className="p-6 text-center text-red-500">{error}</div>
          ) : studyMaterials.length === 0 ? (
            <div className="p-6 text-center">
              <p className="text-github-text-secondary dark:text-gray-400">No study materials found.</p>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-github-light">
                <tr>
                  <th className="px-4 py-2 text-left text-github-text-primary dark:text-white">
                    <i className="fas fa-file-alt mr-2"></i> Name
                  </th>
                  <th className="px-4 py-2 text-left text-github-text-primary dark:text-white">
                    <i className="fas fa-clone mr-2"></i> Flashcards
                  </th>
                  <th className="px-4 py-2 text-left text-github-text-primary dark:text-white">
                    <i className="fas fa-tasks mr-2"></i> Quiz
                  </th>
                  <th className="px-4 py-2 text-left text-github-text-primary dark:text-white">
                    <i className="fas fa-calendar-alt mr-2"></i> Date
                  </th>
                  <th className="px-4 py-2 text-center text-github-text-primary dark:text-white">
                    <i className="fas fa-cogs mr-2"></i> Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {studyMaterials.map(material => (
                  <tr key={material.id} className="border-t border-gray-200 dark:border-github-border hover:bg-gray-50 dark:hover:bg-github-light/50">
                    <td className="px-4 py-2 text-github-text-primary dark:text-gray-200">
                      <div className="flex items-center">
                        <i className="fas fa-file-alt mr-2 text-gray-500"></i>
                        <Link to={`/results/${material.id}`} className="text-primary-600 dark:text-primary-400 hover:underline">
                          {material.fileName}
                        </Link>
                      </div>
                    </td>
                    <td className="px-4 py-2 text-github-text-primary dark:text-gray-200">
                      <div className="flex items-center">
                        <i className="fas fa-clone mr-2 text-gray-500"></i>
                        {Array.isArray(material.flashcards) ? material.flashcards.length : 0}
                      </div>
                    </td>
                    <td className="px-4 py-2 text-github-text-primary dark:text-gray-200">
                      <div className="flex items-center">
                        <i className="fas fa-tasks mr-2 text-gray-500"></i>
                        {Array.isArray(material.multipleChoice) ? material.multipleChoice.length : 0}
                      </div>
                    </td>
                    <td className="px-4 py-2 text-github-text-primary dark:text-gray-200">
                      <div className="flex items-center">
                        <i className="fas fa-calendar-alt mr-2 text-gray-500"></i>
                        {new Date(material.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-4 py-2 text-center">
                      <Link 
                        to={`/results/${material.id}`} 
                        className="px-3 py-1 bg-primary-600 hover:bg-primary-700 dark:bg-primary-700 dark:hover:bg-primary-800 text-white rounded-md text-sm inline-flex items-center"
                      >
                        <i className="fas fa-eye mr-1"></i> View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <Link 
        to="/upload" 
        className="px-4 py-2 bg-primary-600 hover:bg-primary-700 dark:bg-primary-700 dark:hover:bg-primary-800 text-white rounded-md inline-flex items-center"
      >
        <i className="fas fa-plus mr-2"></i> Create New Study Materials
      </Link>
      <Link 
        to="/settings" 
        className="px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-github-light dark:hover:bg-gray-700 text-gray-800 dark:text-white rounded-md inline-flex items-center ml-3"
      >
        <i className="fas fa-cog mr-2"></i> Settings
      </Link>
    </div>
  );
};

export default Dashboard;
