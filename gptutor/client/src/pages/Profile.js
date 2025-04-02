import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const Profile = () => {
  const [user, setUser] = useState({
    id: '1',
    username: 'demo_user',
    email: 'demo@example.com',
    name: 'Demo User',
    bio: "I'm a student using GPTutor to enhance my learning experience.",
    profileImage: 'https://ui-avatars.com/api/?name=Demo+User&background=0D8ABC&color=fff',
    preferences: {
      darkMode: true,
      emailNotifications: true,
      defaultModelType: 'github'
    },
    joinDate: '2023-11-15T12:00:00.000Z',
    lastLogin: '2023-12-01T10:30:00.000Z'
  });
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    bio: ''
  });

  useEffect(() => {
    // Simulate loading data
    setTimeout(() => {
      setFormData({
        name: user.name,
        email: user.email,
        bio: user.bio
      });
      setLoading(false);
    }, 800);
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate API call with a delay
    setTimeout(() => {
      // Update local user state with form data
      setUser(prev => ({
        ...prev,
        name: formData.name,
        email: formData.email,
        bio: formData.bio
      }));
      
      setEditMode(false);
      setSuccess('Profile updated successfully!');
      setLoading(false);
      
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
          <i className="fas fa-user text-primary-500 mr-3"></i>
          Profile
        </h2>
        <p className="text-github-text-secondary dark:text-gray-400 flex items-center ml-1">
          <i className="fas fa-info-circle mr-2"></i>
          Manage your profile information
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

      {loading && !editMode ? (
        <div className="bg-white dark:bg-github-medium border border-gray-200 dark:border-github-border rounded-lg shadow-sm p-6 flex justify-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-primary-500 border-t-transparent"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-github-medium border border-gray-200 dark:border-github-border rounded-lg shadow-sm sticky top-4">
              <div className="p-4 border-b border-gray-200 dark:border-github-border bg-gray-50 dark:bg-github-light">
                <h3 className="text-md font-semibold text-github-text-primary dark:text-white">
                  Settings Menu
                </h3>
              </div>
              <div className="p-2">
                <nav className="flex flex-col">
                  <Link to="/settings" className="px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 text-github-text-primary dark:text-gray-200">
                    <i className="fas fa-palette mr-2"></i> Appearance
                  </Link>
                  <Link to="/settings" className="px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 text-github-text-primary dark:text-gray-200">
                    <i className="fas fa-bell mr-2"></i> Notifications
                  </Link>
                  <Link to="/settings" className="px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 text-github-text-primary dark:text-gray-200">
                    <i className="fas fa-sliders-h mr-2"></i> Default Settings
                  </Link>
                  <a href="#profile" className="px-3 py-2 rounded-md bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 font-medium">
                    <i className="fas fa-user mr-2"></i> Profile
                  </a>
                </nav>
              </div>
            </div>
          </div>

          {/* Main content area */}
          <div className="lg:col-span-3">
            <div className="bg-white dark:bg-github-medium border border-gray-200 dark:border-github-border rounded-lg shadow-sm">
              <div className="p-4 border-b border-gray-200 dark:border-github-border bg-gray-50 dark:bg-github-light flex justify-between items-center">
                <h3 className="text-lg font-semibold text-github-text-primary dark:text-white flex items-center">
                  <i className="fas fa-user-circle text-primary-500 mr-2"></i>
                  User Profile
                </h3>
                {!editMode && (
                  <button 
                    onClick={() => setEditMode(true)}
                    className="text-sm px-3 py-1 bg-gray-200 hover:bg-gray-300 dark:bg-github-light dark:hover:bg-gray-700 text-gray-800 dark:text-white rounded-md inline-flex items-center"
                  >
                    <i className="fas fa-edit mr-1"></i> Edit
                  </button>
                )}
              </div>

              <div className="p-6">
                {editMode ? (
                  <form onSubmit={handleSubmit}>
                    <div className="flex flex-col lg:flex-row gap-6 mb-6">
                      <div className="flex-shrink-0 flex flex-col items-center">
                        <img 
                          src={user.profileImage} 
                          alt={user.name} 
                          className="w-32 h-32 rounded-full object-cover border-4 border-primary-100 dark:border-primary-900"
                        />
                        <span className="text-xs text-github-text-secondary dark:text-gray-400 mt-2">Profile image cannot be changed</span>
                      </div>
                      <div className="flex-grow space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-github-text-primary dark:text-white mb-1">
                            Full Name
                          </label>
                          <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-github-medium text-github-text-primary dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-github-text-primary dark:text-white mb-1">
                            Email Address
                          </label>
                          <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-github-medium text-github-text-primary dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                            required
                          />
                        </div>
                      </div>
                    </div>

                    <div className="mb-6">
                      <label className="block text-sm font-medium text-github-text-primary dark:text-white mb-1">
                        Bio
                      </label>
                      <textarea
                        name="bio"
                        value={formData.bio}
                        onChange={handleInputChange}
                        rows={4}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-github-medium text-github-text-primary dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                        placeholder="Tell us about yourself..."
                      />
                    </div>

                    <div className="flex space-x-3 justify-end">
                      <button
                        type="button"
                        onClick={() => {
                          setEditMode(false);
                          setFormData({
                            name: user.name,
                            email: user.email,
                            bio: user.bio || ''
                          });
                        }}
                        className="px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-github-light dark:hover:bg-gray-700 text-gray-800 dark:text-white rounded-md inline-flex items-center"
                      >
                        <i className="fas fa-times mr-2"></i> Cancel
                      </button>
                      <button
                        type="submit"
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
                            <i className="fas fa-save mr-2"></i> Save Profile
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                ) : (
                  <>
                    <div className="flex flex-col lg:flex-row gap-6 mb-6">
                      <div className="flex-shrink-0">
                        <img 
                          src={user.profileImage} 
                          alt={user.name} 
                          className="w-32 h-32 rounded-full object-cover border-4 border-primary-100 dark:border-primary-900"
                        />
                      </div>
                      <div className="flex-grow">
                        <h2 className="text-2xl font-bold text-github-text-primary dark:text-white mb-1">{user.name}</h2>
                        <p className="text-github-text-secondary dark:text-gray-400 mb-3">{user.username}</p>
                        <p className="flex items-center text-github-text-secondary dark:text-gray-400 mb-1">
                          <i className="fas fa-envelope mr-2"></i> {user.email}
                        </p>
                        <p className="flex items-center text-github-text-secondary dark:text-gray-400">
                          <i className="fas fa-calendar mr-2"></i> Joined {new Date(user.joinDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <div className="mb-6 p-4 bg-gray-50 dark:bg-github-light rounded-lg">
                      <h3 className="text-lg font-medium text-github-text-primary dark:text-white mb-2">
                        <i className="fas fa-user-tag text-primary-500 mr-2"></i> Bio
                      </h3>
                      <p className="text-github-text-secondary dark:text-gray-300">
                        {user.bio || "No bio provided."}
                      </p>
                    </div>

                    <h3 className="text-lg font-medium text-github-text-primary dark:text-white mb-3">
                      <i className="fas fa-medal text-primary-500 mr-2"></i> Achievements
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="flex items-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                        <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mr-3">
                          <i className="fas fa-user-graduate text-green-600 dark:text-green-400"></i>
                        </div>
                        <div>
                          <h4 className="font-medium text-github-text-primary dark:text-white">New Learner</h4>
                          <p className="text-xs text-github-text-secondary dark:text-gray-400">Welcome to GPTutor</p>
                        </div>
                      </div>
                      <div className="flex items-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mr-3">
                          <i className="fas fa-book-reader text-blue-600 dark:text-blue-400"></i>
                        </div>
                        <div>
                          <h4 className="font-medium text-github-text-primary dark:text-white">Knowledge Seeker</h4>
                          <p className="text-xs text-github-text-secondary dark:text-gray-400">Created first study material</p>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
