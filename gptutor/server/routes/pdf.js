const express = require('express');
const router = express.Router();
const pdfController = require('../controllers/pdfController');

// @route   POST api/pdf/upload
// @desc    Upload and process a PDF file
// @access  Public
router.post('/upload', pdfController.uploadPDF);

// @route   GET api/pdf/results/:id
// @desc    Get processed PDF results by ID
// @access  Public
router.get('/results/:id', pdfController.getResults);

module.exports = router;
