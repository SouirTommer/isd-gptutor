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

// @route   GET api/pdf/all
// @desc    Get all PDFs
// @access  Public
router.get('/all', pdfController.getAllPDFs);

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

// Add a test endpoint that creates a PDF record with dummy multiple choice questions
router.get('/create-test-record', (req, res) => {
  const fileName = "Test-Document.pdf";
  
  // Generate dummy data
  const mockData = {
    flashcards: [
      { question: "What is the capital of France?", answer: "Paris" },
      { question: "What is 2+2?", answer: "4" }
    ],
    summary: "This is a test summary.",
    cornellNotes: {
      cues: ["Test cue 1", "Test cue 2"],
      notes: ["Test note 1", "Test note 2"],
      summary: "Cornell notes summary"
    },
    multipleChoice: [
      {
        question: "What is the capital of France?",
        options: ["London", "Paris", "Berlin", "Madrid"],
        correctAnswer: 1
      },
      {
        question: "Which planet is closest to the sun?",
        options: ["Earth", "Mars", "Venus", "Mercury"],
        correctAnswer: 3
      }
    ]
  };
  
  // Create the PDF record
  const pdfRecord = {
    id: "test-" + Date.now().toString(),
    fileName: fileName,
    originalText: "This is test text content.",
    flashcards: mockData.flashcards,
    summary: mockData.summary,
    cornellNotes: mockData.cornellNotes,
    multipleChoice: mockData.multipleChoice,
    createdAt: new Date().toISOString()
  };
  
  // Save to JSON DB
  const db = require('../utils/dbUtils');
  const savedPdf = db.savePdf(pdfRecord);
  
  // Return the created record ID
  res.json({
    message: "Test record created successfully",
    id: savedPdf.id,
    data: savedPdf
  });
});

// Add a simple endpoint to create test data with guaranteed multiple choice
router.get('/create-test-data', pdfController.createTestData);

// Add a debug endpoint to show the raw data in db.json
router.get('/debug-db', (req, res) => {
  const db = require('../utils/dbUtils');
  const allData = db.readDb();
  
  // Return the entire database content
  res.json({
    totalPdfs: allData.pdfs.length,
    pdfs: allData.pdfs.map(pdf => ({
      id: pdf.id,
      fileName: pdf.fileName,
      hasOriginalText: !!pdf.originalText,
      originalTextLength: pdf.originalText?.length || 0,
      createdAt: pdf.createdAt,
      hasFlashcards: Array.isArray(pdf.flashcards),
      flashcardsCount: pdf.flashcards?.length || 0,
      hasSummary: !!pdf.summary,
      hasCornellNotes: !!pdf.cornellNotes,
      hasMultipleChoice: Array.isArray(pdf.multipleChoice),
      multipleChoiceCount: pdf.multipleChoice?.length || 0
    }))
  });
});

// Add Feynman mode routes
router.post('/feynman-questions', pdfController.generateFeynmanQuestions);
router.post('/feynman-evaluate', pdfController.evaluateFeynmanTeaching);

// Add this with your other route imports
const audioRoutes = require('./routes/audio');

// Add this with your other app.use statements
app.use('/api/audio', audioRoutes);

module.exports = router;