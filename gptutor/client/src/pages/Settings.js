import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const Settings = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [preferences, setPreferences] = useState({
    darkMode: true,
    emailNotifications: false,
    defaultModelType: 'github'
  });

  useEffect(() => {
    // Simulate loading data for UI demonstration
    const timer = setTimeout(() => {
      setLoading(false);
    }, 800);
    
    return () => clearTimeout(timer);
  }, []);

  const handleToggle = (setting) => {
    setPreferences(prev => ({
      ...prev,
      [setting]: !prev[setting]
    }));
  };

  const handleModelTypeChange = (e) => {
    setPreferences(prev => ({
      ...prev,
      defaultModelType: e.target.value
    }));
  };

  const savePreferences = () => {
    // Simulate saving preferences
    setLoading(true);
    
    setTimeout(() => {
      setLoading(false);
      setSuccess('Settings saved successfully!');
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess(null);
      }, 3000);
    }, 1000);
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <header className="mb-8">
        <h2 className="text-2xl font-bold text-github-text-primary dark:text-white flex items-center">
          <i className="fas fa-cog text-primary-500 mr-3"></i>
          Settings
        </h2>
        <p className="text-github-text-secondary dark:text-gray-400 flex items-center ml-1">
          <i className="fas fa-info-circle mr-2"></i>
          Customize your experience
        </p>
      </header>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          <i className="fas fa-exclamation-circle mr-2"></i>
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">
          <i className="fas fa-check-circle mr-2"></i>
          {success}
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        {/* Left sidebar with navigation */}
        <div className="xl:col-span-1">
          <div className="bg-white dark:bg-github-medium border border-gray-200 dark:border-github-border rounded-lg shadow-sm sticky top-4">
            <div className="p-4 border-b border-gray-200 dark:border-github-border bg-gray-50 dark:bg-github-light">
              <h3 className="text-md font-semibold text-github-text-primary dark:text-white">
                Settings Menu
              </h3>
            </div>
            <div className="p-2">
              <nav className="flex flex-col">
                <a href="#appearance" className="px-3 py-2 rounded-md bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 font-medium">
                  <i className="fas fa-palette mr-2"></i> Appearance
                </a>
                <a href="#notifications" className="px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 text-github-text-primary dark:text-gray-200">
                  <i className="fas fa-bell mr-2"></i> Notifications
                </a>
                <a href="#default-settings" className="px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 text-github-text-primary dark:text-gray-200">
                  <i className="fas fa-sliders-h mr-2"></i> Default Settings
                </a>
                <Link to="/profile" className="px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 text-github-text-primary dark:text-gray-200">
                  <i className="fas fa-user mr-2"></i> Profile
                </Link>
              </nav>
            </div>
          </div>
        </div>

        {/* Main content area */}
        <div className="xl:col-span-3 space-y-6">
          {loading ? (
            <div className="bg-white dark:bg-github-medium border border-gray-200 dark:border-github-border rounded-lg shadow-sm p-6 flex justify-center">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-primary-500 border-t-transparent"></div>
            </div>
          ) : (
            <>
              {/* Appearance section */}
              <div id="appearance" className="bg-white dark:bg-github-medium border border-gray-200 dark:border-github-border rounded-lg shadow-sm">
                <div className="p-4 border-b border-gray-200 dark:border-github-border bg-gray-50 dark:bg-github-light">
                  <h3 className="text-lg font-semibold text-github-text-primary dark:text-white flex items-center">
                    <i className="fas fa-palette text-primary-500 mr-2"></i>
                    Appearance
                  </h3>
                </div>
                <div className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-github-text-primary dark:text-white">Dark Mode</h4>
                      <p className="text-sm text-github-text-secondary dark:text-gray-400">Enable dark mode for a low-light UI</p>
                    </div>
                    <label className="inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={preferences.darkMode} 
                        onChange={() => handleToggle('darkMode')} 
                        className="sr-only peer"
                      />
                      <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
                    </label>
                  </div>
                </div>
              </div>

              {/* Notifications section */}
              <div id="notifications" className="bg-white dark:bg-github-medium border border-gray-200 dark:border-github-border rounded-lg shadow-sm">
                <div className="p-4 border-b border-gray-200 dark:border-github-border bg-gray-50 dark:bg-github-light">
                  <h3 className="text-lg font-semibold text-github-text-primary dark:text-white flex items-center">
                    <i className="fas fa-bell text-primary-500 mr-2"></i>
                    Notifications
                  </h3>
                </div>
                <div className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-github-text-primary dark:text-white">Email Notifications</h4>
                      <p className="text-sm text-github-text-secondary dark:text-gray-400">Receive emails about your account activity</p>
                    </div>
                    <label className="inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={preferences.emailNotifications} 
                        onChange={() => handleToggle('emailNotifications')} 
                        className="sr-only peer"
                      />
                      <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
                    </label>
                  </div>
                </div>
              </div>

              {/* Default Settings section */}
              <div id="default-settings" className="bg-white dark:bg-github-medium border border-gray-200 dark:border-github-border rounded-lg shadow-sm">
                <div className="p-4 border-b border-gray-200 dark:border-github-border bg-gray-50 dark:bg-github-light">
                  <h3 className="text-lg font-semibold text-github-text-primary dark:text-white flex items-center">
                    <i className="fas fa-sliders-h text-primary-500 mr-2"></i>
                    Default Settings
                  </h3>
                </div>
                <div className="p-6">
                  <div className="mb-4">
                    <h4 className="font-medium text-github-text-primary dark:text-white mb-2">Default AI Model</h4>
                    <p className="text-sm text-github-text-secondary dark:text-gray-400 mb-3">Select which AI model to use by default when generating study materials</p>
                    
                    <div className="space-y-2">
                      <label className="flex items-center p-3 rounded border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 opacity-50 cursor-not-allowed">
                        <input
                          type="radio"
                          name="defaultModel"
                          value="openai"
                          checked={preferences.defaultModelType === 'openai'}
                          onChange={handleModelTypeChange}
                          disabled={true}
                          className="w-4 h-4 text-gray-400 cursor-not-allowed"
                        />
                        <span className="ml-3 text-gray-500 dark:text-gray-500">
                          <i className="fas fa-robot mr-2 text-gray-400"></i> OpenAI (Not Available)
                        </span>
                      </label>

                      <label className="flex items-center p-3 rounded border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 bg-blue-50 dark:bg-blue-900/20">
                        <input
                          type="radio"
                          name="defaultModel"
                          value="github"
                          checked={preferences.defaultModelType === 'github'}
                          onChange={handleModelTypeChange}
                          className="w-4 h-4 text-primary-600"
                        />
                        <span className="ml-3 text-github-text-primary dark:text-gray-200">
                          <i className="fab fa-github mr-2 text-github-text-secondary"></i> GitHub/Azure
                        </span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Save button */}
              <div className="flex justify-end mt-6">
                <button
                  onClick={savePreferences}
                  disabled={loading}
                  className="px-4 py-2 bg-primary-600 hover:bg-primary-700 dark:bg-primary-700 dark:hover:bg-primary-800 text-white rounded-md inline-flex items-center"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Saving...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-save mr-2"></i> Save Settings
                    </>
                  )}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;
