/**
 * Utility functions for managing learning streaks
 */

// Constants
const STREAK_STORAGE_KEY = 'gptutor_learning_streak';
const ACTIVITY_STORAGE_KEY = 'gptutor_learning_activity';

/**
 * Records a learning activity and updates the streak
 */
export const recordLearningActivity = () => {
  try {
    // Get today's date in YYYY-MM-DD format
    const today = new Date().toISOString().split('T')[0];
    
    // Get existing activity log
    const activityLog = getActivityLog();
    
    // If today's date is already recorded, just return
    if (activityLog.includes(today)) {
      return getStreakInfo();
    }
    
    // Add today's date to activity log
    activityLog.push(today);
    
    // Sort dates chronologically and keep only most recent 100 days
    activityLog.sort();
    const recentActivity = activityLog.slice(-100);
    
    // Save updated activity log
    localStorage.setItem(ACTIVITY_STORAGE_KEY, JSON.stringify(recentActivity));
    
    // Update streak information
    updateStreak(today);
    
    return getStreakInfo();
  } catch (error) {
    console.error('Error recording learning activity:', error);
    return {
      currentStreak: 0,
      longestStreak: 0,
      lastActivity: null,
      streakUpdatedToday: false
    };
  }
};

/**
 * Updates the user's streak based on the current activity
 */
const updateStreak = (today) => {
  try {
    const streakInfo = getStreakInfo();
    const { currentStreak, lastActivity } = streakInfo;
    
    // If this is the first activity ever
    if (!lastActivity) {
      localStorage.setItem(STREAK_STORAGE_KEY, JSON.stringify({
        currentStreak: 1,
        longestStreak: 1,
        lastActivity: today,
        streakUpdatedToday: true
      }));
      return;
    }
    
    // Calculate if yesterday was the last activity day
    const lastDate = new Date(lastActivity);
    const todayDate = new Date(today);
    const yesterdayDate = new Date(todayDate);
    yesterdayDate.setDate(todayDate.getDate() - 1);
    
    const isYesterday = lastDate.toISOString().split('T')[0] === yesterdayDate.toISOString().split('T')[0];
    const isToday = lastDate.toISOString().split('T')[0] === today;
    
    let newStreak;
    
    if (isToday) {
      // Already recorded today, no streak change
      newStreak = currentStreak;
    } else if (isYesterday) {
      // Continuing streak
      newStreak = currentStreak + 1;
    } else {
      // Streak broken, starting new streak
      newStreak = 1;
    }
    
    // Update streak information
    const updatedStreakInfo = {
      currentStreak: newStreak,
      longestStreak: Math.max(newStreak, streakInfo.longestStreak),
      lastActivity: today,
      streakUpdatedToday: true
    };
    
    localStorage.setItem(STREAK_STORAGE_KEY, JSON.stringify(updatedStreakInfo));
  } catch (error) {
    console.error('Error updating streak:', error);
  }
};

/**
 * Gets the current streak information
 */
export const getStreakInfo = () => {
  try {
    const storedStreak = localStorage.getItem(STREAK_STORAGE_KEY);
    if (!storedStreak) {
      return {
        currentStreak: 0,
        longestStreak: 0,
        lastActivity: null,
        streakUpdatedToday: false
      };
    }
    
    return JSON.parse(storedStreak);
  } catch (error) {
    console.error('Error getting streak info:', error);
    return {
      currentStreak: 0,
      longestStreak: 0,
      lastActivity: null,
      streakUpdatedToday: false
    };
  }
};

/**
 * Gets all recorded activity dates
 */
export const getActivityLog = () => {
  try {
    const storedActivity = localStorage.getItem(ACTIVITY_STORAGE_KEY);
    if (!storedActivity) {
      return [];
    }
    
    return JSON.parse(storedActivity);
  } catch (error) {
    console.error('Error getting activity log:', error);
    return [];
  }
};

/**
 * Gets the last 30 days of activity for the heatmap
 */
export const getActivityHeatmap = () => {
  try {
    const activityLog = getActivityLog();
    
    // Create a map of dates with activity
    const activityMap = {};
    activityLog.forEach(date => {
      activityMap[date] = true;
    });
    
    // Create data for the last 30 days
    const today = new Date();
    const last30Days = [];
    
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const dateString = date.toISOString().split('T')[0];
      
      last30Days.push({
        date: dateString,
        dayOfWeek: date.getDay(),
        hasActivity: !!activityMap[dateString]
      });
    }
    
    return last30Days;
  } catch (error) {
    console.error('Error getting activity heatmap:', error);
    return [];
  }
};
