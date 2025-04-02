const User = require('../models/User');
const fs = require('fs');
const path = require('path');

// Path to users.json file
const usersFilePath = path.join(__dirname, '../data/users.json');

// Helper to read users from JSON file
const getUsers = () => {
  try {
    const usersData = fs.readFileSync(usersFilePath, 'utf8');
    return JSON.parse(usersData);
  } catch (error) {
    console.error('Error reading users data:', error);
    return [];
  }
};

// Helper to write users to JSON file
const saveUsers = (users) => {
  try {
    fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2), 'utf8');
    return true;
  } catch (error) {
    console.error('Error saving users data:', error);
    return false;
  }
};

// Get all users
exports.getUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// Get user by ID
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    res.json(user);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'User not found' });
    }
    res.status(500).send('Server Error');
  }
};

// Create a new user
exports.createUser = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ msg: 'User already exists' });
    }

    // Create new user
    user = new User({
      name,
      email,
      password, // In a real app, you would hash this password
    });

    await user.save();
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// Update user
exports.updateUser = async (req, res) => {
  const { name, email } = req.body;
  
  try {
    let user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    
    if (name) user.name = name;
    if (email) user.email = email;
    
    await user.save();
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// Delete user
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    
    await user.remove();
    res.json({ msg: 'User removed' });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'User not found' });
    }
    res.status(500).send('Server Error');
  }
};

// Get current user (demo implementation - in a real app this would use auth tokens)
exports.getCurrentUser = (req, res) => {
  try {
    const users = getUsers();
    // For demo purposes, always return the first user
    if (users.length > 0) {
      return res.json(users[0]);
    }
    return res.status(404).json({ message: 'User not found' });
  } catch (error) {
    console.error('Error getting current user:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// Update user profile
exports.updateProfile = (req, res) => {
  try {
    const { name, email, bio } = req.body;
    
    // In a real app, you would get the userId from authenticated session
    const userId = "1"; // Demo user ID
    
    const users = getUsers();
    const userIndex = users.findIndex(user => user.id === userId);
    
    if (userIndex === -1) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Update user data
    users[userIndex] = {
      ...users[userIndex],
      name: name || users[userIndex].name,
      email: email || users[userIndex].email,
      bio: bio || users[userIndex].bio,
    };
    
    // Save updated users
    if (saveUsers(users)) {
      return res.json(users[userIndex]);
    } else {
      return res.status(500).json({ message: 'Failed to save user data' });
    }
  } catch (error) {
    console.error('Error updating user profile:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// Update user preferences
exports.updatePreferences = (req, res) => {
  try {
    const { darkMode, emailNotifications, defaultModelType } = req.body;
    
    // In a real app, you would get the userId from authenticated session
    const userId = "1"; // Demo user ID
    
    const users = getUsers();
    const userIndex = users.findIndex(user => user.id === userId);
    
    if (userIndex === -1) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Update user preferences
    users[userIndex].preferences = {
      ...users[userIndex].preferences,
      darkMode: darkMode !== undefined ? darkMode : users[userIndex].preferences.darkMode,
      emailNotifications: emailNotifications !== undefined ? emailNotifications : users[userIndex].preferences.emailNotifications,
      defaultModelType: defaultModelType || users[userIndex].preferences.defaultModelType,
    };
    
    // Save updated users
    if (saveUsers(users)) {
      return res.json(users[userIndex]);
    } else {
      return res.status(500).json({ message: 'Failed to save user preferences' });
    }
  } catch (error) {
    console.error('Error updating user preferences:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};
