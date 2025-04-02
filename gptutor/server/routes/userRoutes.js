const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// Get current user
router.get('/current', userController.getCurrentUser);

// Update profile
router.put('/profile', userController.updateProfile);

// Update preferences
router.put('/preferences', userController.updatePreferences);

module.exports = router;
