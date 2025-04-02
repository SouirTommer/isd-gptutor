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

// Middleware
app.use(cors());
app.use(express.json());
app.use(fileUpload({
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max file size
  useTempFiles: true,
  tempFileDir: '/tmp/'
}));

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

// Define port
const PORT = process.env.PORT || 5001;

// Start server
app.listen(PORT, () => console.log(`GPTutor server running on port ${PORT}`));
