const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const fileUpload = require('express-fileupload');
const path = require('path');
const db = require('./utils/dbUtils');

// Load environment variables
dotenv.config();

// Create Express app
const app = express();

// Initialize the local JSON database
db.initDb();

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

// Configure a debug flag for API interactions
const DEBUG_API = process.env.DEBUG_API === 'true' || false;

// Add debug middleware to trace API calls
if (DEBUG_API) {
  app.use((req, res, next) => {
    console.log(`[API DEBUG] ${req.method} ${req.url}`);
    
    // Capture original JSON method to trace response
    const originalJson = res.json;
    res.json = function(data) {
      console.log(`[API DEBUG] Response:`, 
        data && typeof data === 'object' ? 
        JSON.stringify(data).substring(0, 200) + '...' : 
        data);
      originalJson.call(this, data);
    };
    
    next();
  });
}

// Define routes
app.get('/', (req, res) => {
  // Check if Azure/GitHub API is properly configured
  const apiEndpoint = process.env.GITHUB_API_ENDPOINT || "Not configured";
  const hasApiKey = process.env.GITHUB_API_KEY ? "Configured" : "Not configured";

  res.send(`
    GPTutor API is running with JSON file database...
    <br>
    Azure OpenAI API status:
    <br>
    - Endpoint: ${apiEndpoint.includes('http') ? 'Set up correctly' : 'Missing or incorrect'}
    <br>
    - API Key: ${hasApiKey}
    <br>
    <br>
    Using local JSON DB for data storage.
  `);
});

// Import routes
const pdfRoutes = require('./routes/pdf');
const apiRoutes = require('./routes/api'); // Add this line

// Use routes
app.use('/api/pdf', pdfRoutes);
app.use('/api/test', apiRoutes); // Add this line

// Add a debug route to test the chat endpoint directly
app.get('/test-chat', (req, res) => {
  res.json({ message: "Chat endpoint test route" });
});

// Add an API test route shortcut
app.get('/test-api', (req, res) => {
  res.send(`
    <html>
    <head>
      <title>API Connection Test</title>
      <style>
        body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
        h1 { color: #333; }
        button { padding: 10px 15px; margin: 5px; cursor: pointer; }
        .success { color: green; }
        .error { color: red; }
        #results { margin-top: 20px; padding: 10px; border: 1px solid #ddd; }
      </style>
    </head>
    <body>
      <h1>API Connection Test</h1>
      <button id="testGitHub">Test GitHub/Azure API</button>
      <button id="testOpenAI">Test OpenAI API</button>
      <button id="showConfig">Show API Configuration</button>
      <div id="results">Results will appear here...</div>
      
      <script>
        document.getElementById('testGitHub').addEventListener('click', async () => {
          try {
            const res = await fetch('/api/test/github');
            const data = await res.json();
            displayResult(data);
          } catch (err) {
            displayError(err);
          }
        });
        
        document.getElementById('testOpenAI').addEventListener('click', async () => {
          try {
            const res = await fetch('/api/test/openai');
            const data = await res.json();
            displayResult(data);
          } catch (err) {
            displayError(err);
          }
        });
        
        document.getElementById('showConfig').addEventListener('click', async () => {
          try {
            const res = await fetch('/api/test/config');
            const data = await res.json();
            displayResult(data);
          } catch (err) {
            displayError(err);
          }
        });
        
        function displayResult(data) {
          const resultsDiv = document.getElementById('results');
          resultsDiv.innerHTML = '<h3>' + (data.success ? '<span class="success">Success!</span>' : '<span class="error">Failed!</span>') + '</h3>';
          resultsDiv.innerHTML += '<pre>' + JSON.stringify(data, null, 2) + '</pre>';
        }
        
        function displayError(error) {
          const resultsDiv = document.getElementById('results');
          resultsDiv.innerHTML = '<h3 class="error">Error!</h3>';
          resultsDiv.innerHTML += '<pre>' + error + '</pre>';
        }
      </script>
    </body>
    </html>
  `);
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
  console.log(`GPTutor server running on port ${PORT} with local JSON database`);
  
  // Check API configurations with more detail
  console.log('\n======= API Configuration Check =======');
  if (process.env.GITHUB_API_ENDPOINT) {
    console.log('✓ GitHub API endpoint is configured:', process.env.GITHUB_API_ENDPOINT);
    if (process.env.GITHUB_API_ENDPOINT.includes('your-resource-name')) {
      console.log('⚠️  WARNING: The API endpoint appears to still be a placeholder value!');
      console.log('⚠️  Please update with your actual Azure OpenAI endpoint.');
    } else {
      console.log('✓ Endpoint appears to be a valid format');
    }
  } else {
    console.log('✗ GitHub API endpoint is NOT configured');
  }
  
  if (process.env.GITHUB_API_KEY) {
    console.log('✓ GitHub API key is configured (length:', process.env.GITHUB_API_KEY.length, 'chars)');
    if (process.env.GITHUB_API_KEY.includes('your_github_api_key_here') ||
        process.env.GITHUB_API_KEY.includes('github_pat_')) {
      console.log('⚠️  WARNING: The API key appears to still be a placeholder value!');
      console.log('⚠️  Please update with your actual Azure OpenAI API key.');
    }
  } else {
    console.log('✗ GitHub API key is NOT configured');
  }
  
  if (process.env.OPENAI_API_KEY) {
    console.log('✓ OpenAI API key is configured (length:', process.env.OPENAI_API_KEY.length, 'chars)');
    if (process.env.OPENAI_API_KEY.includes('your_openai_api_key_here') ||
        process.env.OPENAI_API_KEY.includes('sk-your_openai')) {
      console.log('⚠️  WARNING: The OpenAI API key appears to still be a placeholder value!');
    }
  } else {
    console.log('✗ OpenAI API key is NOT configured');
  }
  console.log('======================================\n');

  // List available endpoints
  console.log('Available endpoints:');
  console.log('- GET /api/pdf/all');
  console.log('- GET /api/pdf/test');
  console.log('- GET /api/pdf/results/:id');
  console.log('- POST /api/pdf/upload');
  console.log('- POST /api/pdf/chat');
});
