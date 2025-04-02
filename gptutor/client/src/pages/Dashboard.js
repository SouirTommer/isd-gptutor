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
  const [leaderboard, setLeaderboard] = useState([]);

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
    generateLeaderboardData();
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

  // Generate mock leaderboard data
  const generateLeaderboardData = () => {
    // Create mock users with various streak levels
    const mockUsers = [
      { id: 1, name: "Alex Johnson", level: 5, streak: 23, title: "Knowledge Seeker" },
      { id: 2, name: "Maria Garcia", level: 7, streak: 42, title: "Study Master" },
      { id: 3, name: "David Kim", level: 3, streak: 14, title: "Dedicated Student" },
      { id: 4, name: "Sarah Smith", level: 9, streak: 78, title: "Learning Expert" },
      { id: 5, name: "James Wilson", level: 2, streak: 9, title: "Dedicated Student" },
      { id: 6, name: "Emily Chen", level: 6, streak: 31, title: "Knowledge Seeker" },
      { id: 7, name: "Mohammed Al-Farsi", level: 8, streak: 53, title: "Study Master" },
      { id: 8, name: "Olivia Brown", level: 4, streak: 18, title: "Dedicated Student" },
      { id: 9, name: "Daniel Lee", level: 10, streak: 92, title: "Knowledge Sage" },
      { id: 10, name: "Sofia Martinez", level: 3, streak: 12, title: "Dedicated Student" }
    ];
    
    // Add current user to the data with a slight randomization
    const userPosition = Math.floor(Math.random() * 4) + 3; // Position 3-6
    const currentUser = { 
      id: 0, 
      name: "You", 
      level: userRanking.level, 
      streak: streakInfo.currentStreak,
      title: userRanking.title,
      isCurrentUser: true
    };
    
    // Sort users by level and streak
    const sortedUsers = [...mockUsers]
      .sort((a, b) => b.level - a.level || b.streak - a.streak);
    
    // Insert current user at the determined position
    sortedUsers.splice(userPosition - 1, 0, currentUser);
    
    // Add rank numbers
    const rankedUsers = sortedUsers.map((user, index) => ({
      ...user,
      rank: index + 1
    }));
    
    setLeaderboard(rankedUsers);
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

      {/* Top row with 3 cards - stats, streak, and ranking */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Stats card */}
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

        {/* Learning Streak card */}
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

        {/* Ranking card - moved to top row */}
        <div className="bg-white dark:bg-github-medium border border-gray-200 dark:border-github-border rounded-lg shadow-sm">
          <div className="p-4 border-b border-gray-200 dark:border-github-border bg-gray-50 dark:bg-github-light">
            <h3 className="text-xl font-semibold text-github-text-primary dark:text-white flex items-center">
              <i className="fas fa-trophy text-primary-500 mr-2"></i>
              Learning Rank
            </h3>
          </div>
          <div className="p-4">
            {/* User's current rank */}
            <div className="flex flex-col items-center mb-4">
              <div className="w-20 h-20 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center mb-3">
                <span className="text-3xl font-bold text-primary-600 dark:text-primary-400">{userRanking.level}</span>
              </div>
              <h4 className="text-lg font-bold text-github-text-primary dark:text-white mb-1">{userRanking.title}</h4>
              
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
          </div>
        </div>
      </div>

      {/* Main content area */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left content area (3/4 width) */}
        <div className="lg:col-span-3 space-y-6">
          {/* Recent Study Materials */}
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

          {/* All Study Materials */}
          <div className="bg-white dark:bg-github-medium border border-gray-200 dark:border-github-border rounded-lg shadow-sm">
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
                      {/* Removed action column header */}
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
                        {/* Removed action column cell */}
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex space-x-3">
            <Link 
              to="/upload" 
              className="px-4 py-2 bg-primary-600 hover:bg-primary-700 dark:bg-primary-700 dark:hover:bg-primary-800 text-white rounded-md inline-flex items-center"
            >
              <i className="fas fa-plus mr-2"></i> Create New Study Materials
            </Link>
            <Link 
              to="/settings" 
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-github-light dark:hover:bg-gray-700 text-gray-800 dark:text-white rounded-md inline-flex items-center"
            >
              <i className="fas fa-cog mr-2"></i> Settings
            </Link>
          </div>
        </div>

        {/* Right sidebar for leaderboard (1/4 width) */}
        <div className="lg:col-span-1">
          {/* Leaderboard Card */}
          <div className="bg-white dark:bg-github-medium border border-gray-200 dark:border-github-border rounded-lg shadow-sm sticky top-4">
            <div className="p-4 border-b border-gray-200 dark:border-github-border bg-gray-50 dark:bg-github-light">
              <h3 className="text-xl font-semibold text-github-text-primary dark:text-white flex items-center">
                <i className="fas fa-list-ol text-primary-500 mr-2"></i>
                Leaderboard
              </h3>
            </div>
            <div className="p-4">
              {/* Achievements section - compact for sidebar */}
              {userRanking.achievements.length > 0 && (
                <div className="mb-4">
                  <h5 className="text-sm font-medium text-github-text-secondary dark:text-gray-400 mb-2">Achievements</h5>
                  <div className="space-y-1">
                    {userRanking.achievements.map((achievement, idx) => (
                      <div key={idx} className="flex items-center p-1.5 bg-gray-50 dark:bg-gray-800 rounded-md">
                        <div className="w-6 h-6 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center mr-2">
                          <i className={`fas ${achievement.icon} text-xs text-primary-600 dark:text-primary-400`}></i>
                        </div>
                        <span className="text-xs text-github-text-primary dark:text-gray-200">{achievement.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Leaderboard section */}
              <div className="space-y-1.5 max-h-[calc(100vh-400px)] overflow-y-auto pr-1">
                {leaderboard.map((user) => (
                  <div 
                    key={user.id} 
                    className={`flex items-center p-1.5 rounded-md ${
                      user.isCurrentUser 
                        ? 'bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800' 
                        : 'bg-gray-50 dark:bg-gray-800'
                    }`}
                  >
                    <div 
                      className={`w-5 h-5 flex-shrink-0 rounded-full flex items-center justify-center text-xs font-bold mr-2 ${
                        user.rank <= 3 
                          ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300' 
                          : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                      }`}
                    >
                      {user.rank}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center">
                        <span className={`text-xs font-medium truncate ${
                          user.isCurrentUser 
                            ? 'text-primary-700 dark:text-primary-400' 
                            : 'text-github-text-primary dark:text-white'
                        }`}>
                          {user.name}
                        </span>
                        <span className="text-xs text-github-text-secondary dark:text-gray-400 ml-1">
                          Lvl {user.level}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-xs text-github-text-secondary dark:text-gray-400 truncate">
                          {user.title}
                        </span>
                        <span className="text-xs text-github-text-secondary dark:text-gray-400 flex items-center ml-1">
                          <i className="fas fa-fire text-orange-500 mr-1 text-xs"></i> {user.streak}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
