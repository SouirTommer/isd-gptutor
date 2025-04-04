const express = require('express');
const router = express.Router();
const audioController = require('../controllers/audioController');

// @route   POST api/audio/upload
// @desc    Upload and process audio file
// @access  Public
router.post('/upload', audioController.uploadAudio);

// @route   POST api/audio/transcribe
// @desc    Transcribe audio to text
// @access  Public
router.post('/transcribe', audioController.transcribeAudio);

module.exports = router;
