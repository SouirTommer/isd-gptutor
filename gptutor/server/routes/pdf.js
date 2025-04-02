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

// @route   POST api/pdf/chat
// @desc    Chat with the AI about a specific PDF
// @access  Public
router.post('/chat', pdfController.chatWithPDF);

// @route   GET api/pdf/test
// @desc    Simple test endpoint to check API connectivity
// @access  Public
router.get('/test', (req, res) => {
  console.log('Test endpoint hit');
  res.json({ message: 'API is working correctly' });
});

// Add a simple echo endpoint for chat to test without the full AI processing
router.post('/chat-test', (req, res) => {
  const { pdfId, message } = req.body;
  console.log('Chat test endpoint hit:', { pdfId, message });
  res.json({ 
    reply: `Echo: You sent pdfId=${pdfId} and message="${message}"`,
    received: { pdfId, message }
  });
});

// Super simplified chat test that always works
router.post('/chat-simple', (req, res) => {
  console.log('Simple chat endpoint hit with body:', req.body);
  
  // Always return a successful response regardless of input
  return res.json({
    reply: "This is a test response from the server. Your message was received successfully.",
    success: true
  });
});

module.exports = router;
