import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { getStreakInfo, getActivityHeatmap } from '../utils/streakUtils';

const Dashboard = () => {
  const [studyMaterials, setStudyMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [streakInfo, setStreakInfo] = useState({ currentStreak: 0, longestStreak: 0 });
  const [activityHeatmap, setActivityHeatmap] = useState([]);
  const [userRanking, setUserRanking] = useState({
    level: 1,
    title: 'Beginner Learner',
    progress: 0,
    nextLevel: 'Dedicated Student',
    achievements: []
  });

  useEffect(() => {
    // Get streak information
    const streak = getStreakInfo();
    setStreakInfo(streak);
    
    // Get activity heatmap data
    const heatmapData = getActivityHeatmap();
    setActivityHeatmap(heatmapData);
    
    // Calculate user level and ranking based on activity and materials
    calculateUserRanking(streak);
    
    // Fetch all PDFs from the server
    const fetchStudyMaterials = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/api/pdf/all');
        console.log('API response:', response.data); // Debug log to see the structure
        
        // Get detailed information for each PDF to count items correctly
        const detailedMaterials = await Promise.all(
          response.data.map(async (material) => {
            try {
              const detailResponse = await axios.get(`/api/pdf/results/${material.id}`);
              return detailResponse.data;
            } catch (err) {
              console.error(`Error fetching details for ${material.id}:`, err);
              return material; // Return original if details can't be fetched
            }
          })
        );
        
        setStudyMaterials(detailedMaterials);
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

  // Calculate total flashcards and quiz questions
  const totalFlashcards = studyMaterials.reduce((sum, material) => 
    sum + countItems(material.flashcards), 0);

  const totalQuizQuestions = studyMaterials.reduce((sum, material) => 
    sum + countItems(material.multipleChoice), 0);

  // Calculate user ranking based on streak and study materials
  const calculateUserRanking = (streak) => {
    // Define levels and titles
    const levels = [
      { threshold: 0, title: 'Beginner Learner' },
      { threshold: 3, title: 'Dedicated Student' },
      { threshold: 7, title: 'Knowledge Seeker' },
      { threshold: 14, title: 'Study Master' },
      { threshold: 30, title: 'Learning Expert' },
      { threshold: 60, title: 'Knowledge Sage' },
      { threshold: 100, title: 'Academic Wizard' }
    ];
    
    // Determine current level based on streak
    const currentStreak = streak.currentStreak || 0;
    const longestStreak = streak.longestStreak || 0;
    const combinedScore = currentStreak + Math.floor(longestStreak / 2);
    
    let level = 1;
    let title = levels[0].title;
    let nextTitle = levels[1].title;
    let progress = 0;
    let threshold = levels[1].threshold;
    
    for (let i = levels.length - 1; i >= 0; i--) {
      if (combinedScore >= levels[i].threshold) {
        level = i + 1;
        title = levels[i].title;
        nextTitle = i < levels.length - 1 ? levels[i + 1].title : null;
        threshold = i < levels.length - 1 ? levels[i + 1].threshold : levels[i].threshold;
        break;
      }
    }
    
    // Calculate progress to next level (as percentage)
    if (level < levels.length) {
      const currentThreshold = levels[level - 1].threshold;
      const nextThreshold = levels[level].threshold;
      progress = Math.min(100, Math.floor((combinedScore - currentThreshold) / (nextThreshold - currentThreshold) * 100));
    } else {
      progress = 100;
    }
    
    // Generate achievements based on activity
    const achievements = [];
    
    if (longestStreak >= 3) achievements.push({ name: 'Three-Day Streak', icon: 'fa-fire' });
    if (longestStreak >= 7) achievements.push({ name: 'Week-long Scholar', icon: 'fa-calendar-week' });
    if (longestStreak >= 30) achievements.push({ name: 'Monthly Dedication', icon: 'fa-calendar-alt' });
    if (studyMaterials.length >= 5) achievements.push({ name: 'Five Documents Mastered', icon: 'fa-file-alt' });
    if (studyMaterials.length >= 10) achievements.push({ name: 'Ten Documents Mastered', icon: 'fa-books' });
    
    setUserRanking({
      level,
      title,
      progress,
      nextLevel: nextTitle,
      achievements
    });
  };

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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white dark:bg-github-medium border border-gray-200 dark:border-github-border rounded-lg shadow-sm">
          <div className="p-4 border-b border-gray-200 dark:border-github-border bg-gray-50 dark:bg-github-light">
            <h3 className="text-xl font-semibold text-github-text-primary dark:text-white flex items-center">
              <i className="fas fa-chart-bar text-primary-500 mr-2"></i>
              Stats
            </h3>
          </div>
          <div className="p-6 flex items-center justify-center">
            <div className="grid grid-cols-3 gap-4 w-full">
              <div className="flex flex-col items-center justify-center text-center p-3 h-full">
                <div className="text-3xl font-bold text-primary-600 dark:text-primary-400 flex items-center justify-center mb-2">
                  <i className="fas fa-folder-open text-primary-500 mr-2"></i>
                  {studyMaterials.length}
                </div>
                <p className="text-github-text-secondary dark:text-gray-400">Study Decks</p>
              </div>
              <div className="flex flex-col items-center justify-center text-center p-3 h-full">
                <div className="text-3xl font-bold text-primary-600 dark:text-primary-400 flex items-center justify-center mb-2">
                  <i className="fas fa-clone text-primary-500 mr-2"></i>
                  {totalFlashcards}
                </div>
                <p className="text-github-text-secondary dark:text-gray-400">Flashcards</p>
              </div>
              <div className="flex flex-col items-center justify-center text-center p-3 h-full">
                <div className="text-3xl font-bold text-primary-600 dark:text-primary-400 flex items-center justify-center mb-2">
                  <i className="fas fa-tasks text-primary-500 mr-2"></i>
                  {totalQuizQuestions}
                </div>
                <p className="text-github-text-secondary dark:text-gray-400">Quiz Questions</p>
              </div>
            </div>
          </div>
        </div>

        {/* Replace Recent Study Materials with Learning Streak */}
        <div className="bg-white dark:bg-github-medium border border-gray-200 dark:border-github-border rounded-lg shadow-sm">
          <div className="p-4 border-b border-gray-200 dark:border-github-border bg-gray-50 dark:bg-github-light">
            <h3 className="text-xl font-semibold text-github-text-primary dark:text-white flex items-center">
              <i className="fas fa-fire text-primary-500 mr-2"></i>
              Learning Streak
            </h3>
          </div>
          <div className="p-6">
            <div className="flex items-center justify-around mb-6">
              <div className="text-center">
                <div className="text-4xl font-bold text-primary-600 dark:text-primary-400 mb-1">
                  {streakInfo.currentStreak}
                </div>
                <p className="text-sm text-github-text-secondary dark:text-gray-400">Current Streak</p>
              </div>
              
              <div className="h-16 border-l border-gray-200 dark:border-gray-700"></div>
              
              <div className="text-center">
                <div className="text-4xl font-bold text-primary-600 dark:text-primary-400 mb-1">
                  {streakInfo.longestStreak}
                </div>
                <p className="text-sm text-github-text-secondary dark:text-gray-400">Longest Streak</p>
              </div>
            </div>
            
            {/* Activity Heatmap */}
            <div>
              <h4 className="text-sm font-medium text-github-text-secondary dark:text-gray-400 mb-2">Activity (Last 30 Days)</h4>
              <div className="flex flex-wrap gap-1 justify-center">
                {activityHeatmap.map((day, index) => (
                  <div 
                    key={index}
                    className={`w-4 h-4 rounded-sm ${
                      day.hasActivity 
                        ? 'bg-primary-500 dark:bg-primary-600' 
                        : 'bg-gray-100 dark:bg-gray-700'
                    }`}
                    title={`${day.date}${day.hasActivity ? ' - Activity recorded' : ''}`}
                  />
                ))}
              </div>
              
              <div className="flex justify-center items-center mt-4">
                <div className="flex items-center mr-4">
                  <div className="w-3 h-3 bg-gray-100 dark:bg-gray-700 rounded-sm mr-1"></div>
                  <span className="text-xs text-github-text-secondary dark:text-gray-400">No activity</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-primary-500 dark:bg-primary-600 rounded-sm mr-1"></div>
                  <span className="text-xs text-github-text-secondary dark:text-gray-400">Active</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* New Ranking Card - 1/3 width */}
        <div className="bg-white dark:bg-github-medium border border-gray-200 dark:border-github-border rounded-lg shadow-sm">
          <div className="p-4 border-b border-gray-200 dark:border-github-border bg-gray-50 dark:bg-github-light">
            <h3 className="text-xl font-semibold text-github-text-primary dark:text-white flex items-center">
              <i className="fas fa-trophy text-primary-500 mr-2"></i>
              Your Learning Rank
            </h3>
          </div>
          <div className="p-6">
            <div className="flex flex-col items-center mb-4">
              <div className="w-24 h-24 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center mb-3">
                <span className="text-4xl font-bold text-primary-600 dark:text-primary-400">{userRanking.level}</span>
              </div>
              <h4 className="text-xl font-bold text-github-text-primary dark:text-white mb-1">{userRanking.title}</h4>
              
              {userRanking.nextLevel && (
                <div className="w-full mt-3">
                  <div className="flex justify-between text-xs text-github-text-secondary dark:text-gray-400 mb-1">
                    <span>{userRanking.title}</span>
                    <span>{userRanking.nextLevel}</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                    <div 
                      className="bg-primary-600 dark:bg-primary-500 h-2.5 rounded-full" 
                      style={{ width: `${userRanking.progress}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-github-text-secondary dark:text-gray-400 mt-1 text-center">
                    {userRanking.progress}% to next level
                  </p>
                </div>
              )}
            </div>
            
            {userRanking.achievements.length > 0 && (
              <div className="mt-4">
                <h5 className="text-sm font-medium text-github-text-secondary dark:text-gray-400 mb-3">Achievements</h5>
                <div className="space-y-2">
                  {userRanking.achievements.map((achievement, idx) => (
                    <div key={idx} className="flex items-center p-2 bg-gray-50 dark:bg-gray-800 rounded-md">
                      <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center mr-3">
                        <i className={`fas ${achievement.icon} text-primary-600 dark:text-primary-400`}></i>
                      </div>
                      <span className="text-sm text-github-text-primary dark:text-gray-200">{achievement.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Study Materials - add as a new row */}
      <div className="bg-white dark:bg-github-medium border border-gray-200 dark:border-github-border rounded-lg shadow-sm mb-6">
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
            <ul className="divide-y divide-gray-200 dark:divide-gray-700">
              {studyMaterials.slice(0, 5).map(material => (
                <li key={material.id} className="hover:bg-gray-50 dark:hover:bg-github-light/50">
                  <Link 
                    to={`/results/${material.id}`} 
                    className="flex items-center px-4 py-3 text-github-text-primary dark:text-gray-200"
                  >
                    <i className="fas fa-file-alt mr-3 text-gray-500"></i>
                    <span className="text-primary-600 dark:text-primary-400 hover:underline">{material.fileName}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
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
