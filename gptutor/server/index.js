const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const fileUpload = require('express-fileupload');
const path = require('path');

// Load environment variables
dotenv.config();

// Create Express app
const app = express();

// Configure CORS more explicitly
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002'],
  credentials: true
}));

// Add a pre-flight response for complex requests
app.options('*', cors());

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(fileUpload({
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max file size
  useTempFiles: true,
  tempFileDir: '/tmp/'
}));

// Debugging middleware to log all requests
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Connect to MongoDB
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/gptutor';
mongoose.connect(MONGO_URI)
  .then(() => console.log('GPTutor MongoDB connected'))
  .catch(err => {
    console.error('GPTutor MongoDB connection error:', err);
    console.log('Running without database. Some features may be limited.');
  });

// Define routes
app.get('/', (req, res) => {
  res.send('GPTutor API is running...');
});

// Import routes
const pdfRoutes = require('./routes/pdf');

// Use routes
app.use('/api/pdf', pdfRoutes);

// Add a debug route to test the chat endpoint directly
app.get('/test-chat', (req, res) => {
  res.json({ message: "Chat endpoint test route" });
});

// Add a global error handler
app.use((err, req, res, next) => {
  console.error('Global error handler caught:', err);
  res.status(500).json({ 
    message: 'Server error occurred', 
    error: err.message 
  });
});

// Define port
const PORT = process.env.PORT || 5001;

// Start server
app.listen(PORT, () => {
  console.log(`GPTutor server running on port ${PORT}`);
  console.log('Available endpoints:');
  console.log('- GET /api/pdf/test');
  console.log('- GET /api/pdf/results/:id');
  console.log('- POST /api/pdf/upload');
  console.log('- POST /api/pdf/chat');
});
