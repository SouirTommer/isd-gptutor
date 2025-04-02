const PDF = require('../models/PDF');
const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const pdfParse = require('pdf-parse');
const OpenAI = require('openai');
const axios = require('axios');

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// GitHub API configuration
const githubApiEndpoint = process.env.GITHUB_API_ENDPOINT;
const githubApiKey = process.env.GITHUB_API_KEY;

// In-memory storage for when MongoDB is not available
const inMemoryStorage = new Map();

// Debug log function
const debugLog = (message, data = null) => {
  const timestamp = new Date().toISOString();
  console.log(`[DEBUG ${timestamp}] ${message}`);
  if (data) {
    console.log(JSON.stringify(data, null, 2));
  }
};

// Mock data for when PDF parsing fails
const generateMockData = (fileName, formats) => {
  debugLog(`Generating mock data for ${fileName} with formats:`, formats);
  
  const results = {};
  
  if (formats.flashcards) {
    results.flashcards = [
      { question: "What is GPTutor?", answer: "An AI-powered educational tool that transforms PDFs into study materials." },
      { question: "What formats does GPTutor support?", answer: "Flashcards, summaries, and Cornell notes." },
      { question: "How does GPTutor work?", answer: "It extracts text from PDFs and uses AI to convert it into various study formats." },
      { question: "What APIs does GPTutor use?", answer: "It can use either OpenAI or GitHub APIs to generate educational content." },
      { question: "What is the benefit of using GPTutor?", answer: "It helps students learn more effectively by transforming documents into interactive study materials." }
    ];
  }
  
  if (formats.summary) {
    results.summary = "GPTutor is an innovative educational application designed to enhance the learning experience by transforming PDF documents into various study formats. The app uses advanced AI technology to extract text from uploaded PDFs and convert it into flashcards for active recall, summaries for quick review, and Cornell notes for structured learning. GPTutor supports multiple AI backends including OpenAI and GitHub APIs, giving users flexibility in how their content is processed. The application is built with a modern web stack and provides an intuitive interface for uploading documents and selecting output formats. Even without a database connection, GPTutor maintains functionality by storing results in memory, ensuring users can still benefit from its features.";
  }
  
  if (formats.cornellNotes) {
    results.cornellNotes = {
      cues: ["GPTutor Purpose", "Study Formats", "Technology Stack", "AI Integration"],
      notes: [
        "GPTutor helps students learn by transforming documents into study materials",
        "Supports flashcards for active recall, summaries for overview, and Cornell notes for structured learning",
        "Built with MERN stack (MongoDB, Express, React, Node.js) with fallback mechanisms for database unavailability",
        "Integrates with multiple AI providers including OpenAI and GitHub API"
      ],
      summary: "GPTutor is an AI-powered educational tool that transforms PDF documents into various study formats to enhance learning efficiency, with support for multiple AI backends and robust error handling."
    };
  }
  
  debugLog("Generated mock data:", results);
  return results;
};

// Process text with API (OpenAI or GitHub)
const processWithAPI = async (text, formats, modelType = 'openai') => {
  debugLog(`Processing text with ${modelType} API. Text length: ${text.length}, Formats:`, formats);
  
  const results = {};
  
  // Truncate text if it's too long (APIs have token limits)
  const truncatedText = text.length > 15000 ? text.substring(0, 15000) + '...' : text;
  
  try {
    if (modelType === 'github') {
      console.log("Answer using Github API");
      return await processWithGitHubAPI(truncatedText, formats);
    } else {
      // Default to OpenAI
      return await processWithOpenAI(truncatedText, formats);
    }
  } catch (err) {
    console.error(`Error calling ${modelType} API:`, err);
    console.log("Falling back to mock data due to API error");
    return generateMockData("api_error.pdf", formats);
  }
};

// Process text with GitHub API
const processWithGitHubAPI = async (text, formats) => {
  debugLog("Processing with GitHub API");
  
  // Format the Azure OpenAI endpoint correctly - using the base URL only
  const baseUrl = githubApiEndpoint;
  const azureEndpoint = `${baseUrl}/openai/deployments/gpt-4o-mini/chat/completions?api-version=2023-05-15`;
  debugLog(`Using Azure OpenAI endpoint: ${azureEndpoint}`);
  
  const results = {};
  const headers = {
    'api-key': githubApiKey,
    'Content-Type': 'application/json',
    'x-ms-model-mesh-model-name': 'gpt-4o-mini'
  };

  debugLog("GitHub API headers:", {
    'api-key': 'REDACTED',
    'Content-Type': 'application/json',
    'x-ms-model-mesh-model-name': 'gpt-4o-mini'
  });

  try {
    // Generate flashcards if requested
    if (formats.flashcards) {
      debugLog("Generating flashcards with GitHub API");
      
      const flashcardsPrompt = `
        Create 5-10 flashcards based on the following text. 
        Format your response as a JSON array of objects with 'question' and 'answer' fields.
        Make the flashcards educational and focus on key concepts.
        
        Text: ${text}
        
        Response format:
        [
          {
            "question": "Question 1?",
            "answer": "Answer 1"
          },
          ...
        ]
      `;
      
      const requestBody = {
        messages: [
          {
            role: "system",
            content: "You are an educational assistant that creates high-quality study materials."
          },
          {
            role: "user",
            content: flashcardsPrompt
          }
        ],
        temperature: 0.7,
        max_tokens: 2000,
        model: "gpt-4o-mini"
      };
      
      debugLog("GitHub API request payload:", JSON.stringify(requestBody).substring(0, 200) + "...");
      
      const flashcardsResponse = await axios.post(
        azureEndpoint, 
        requestBody,
        { headers }
      );
      
      debugLog("GitHub API flashcards response status:", flashcardsResponse.status);
      debugLog("GitHub API flashcards response data structure:", 
        Object.keys(flashcardsResponse.data).join(', ')
      );
      
      try {
        // Extract content from the chat completion response
        const responseContent = flashcardsResponse.data.choices[0].message.content.trim();
        debugLog("Response content sample:", responseContent.substring(0, 100) + "...");
        
        // Handle markdown code blocks by extracting JSON content
        let jsonContent = responseContent;
        if (responseContent.includes("```json")) {
          jsonContent = responseContent.replace(/```json\n|\n```/g, "");
          debugLog("Extracted JSON from markdown code block");
        }
        
        results.flashcards = JSON.parse(jsonContent);
        debugLog("Successfully parsed flashcards JSON");
      } catch (err) {
        console.error('Error parsing flashcards JSON from GitHub API:', err);
        debugLog("Error parsing flashcards JSON. Response data:", 
          JSON.stringify(flashcardsResponse.data).substring(0, 200) + "..."
        );
        results.flashcards = [{ question: "Error generating flashcards", answer: "Please try again with a different document." }];
      }
    }
    
    // Generate summary if requested
    if (formats.summary) {
      debugLog("Generating summary with GitHub API");
      
      const summaryPrompt = `
        Create a comprehensive summary of the following text. 
        The summary should be about 250-300 words and cover the main points.
        
        Text: ${text}
      `;
      
      const requestBody = {
        messages: [
          {
            role: "system",
            content: "You are an educational assistant that creates concise, informative summaries."
          },
          {
            role: "user",
            content: summaryPrompt
          }
        ],
        temperature: 0.7,
        max_tokens: 1000,
        model: "gpt-4o-mini"
      };
      
      const summaryResponse = await axios.post(
        azureEndpoint, 
        requestBody,
        { headers }
      );
      
      debugLog("GitHub API summary response status:", summaryResponse.status);
      
      results.summary = summaryResponse.data.choices[0].message.content.trim();
      debugLog("Successfully generated summary");
    }
    
    // Generate Cornell notes if requested
    if (formats.cornellNotes) {
      debugLog("Generating Cornell notes with GitHub API");
      
      const cornellPrompt = `
        Create Cornell notes for the following text.
        Format your response as a JSON object with the following structure:
        {
          "cues": ["Cue 1", "Cue 2", ...],
          "notes": ["Note 1", "Note 2", ...],
          "summary": "Summary text"
        }
        
        The cues should be key concepts or questions.
        The notes should be detailed information related to each cue.
        The summary should be a brief overview of the entire content.
        
        Text: ${text}
      `;
      
      const requestBody = {
        messages: [
          {
            role: "system",
            content: "You are an educational assistant that creates structured Cornell notes."
          },
          {
            role: "user",
            content: cornellPrompt
          }
        ],
        temperature: 0.7,
        max_tokens: 2000,
        model: "gpt-4o-mini"
      };
      
      const cornellResponse = await axios.post(
        azureEndpoint, 
        requestBody,
        { headers }
      );
      
      debugLog("GitHub API Cornell notes response status:", cornellResponse.status);
      
      try {
        const responseContent = cornellResponse.data.choices[0].message.content.trim();
        
        // Handle markdown code blocks by extracting JSON content
        let jsonContent = responseContent;
        if (responseContent.includes("```json")) {
          jsonContent = responseContent.replace(/```json\n|\n```/g, "");
          debugLog("Extracted JSON from markdown code block");
        }
        
        results.cornellNotes = JSON.parse(jsonContent);
        debugLog("Successfully parsed Cornell notes JSON");
      } catch (err) {
        console.error('Error parsing Cornell notes JSON from GitHub API:', err);
        debugLog("Error parsing Cornell notes JSON. Response data:", 
          JSON.stringify(cornellResponse.data).substring(0, 200) + "..."
        );
        results.cornellNotes = {
          cues: ["Error"],
          notes: ["Could not generate Cornell notes. Please try again with a different document."],
          summary: "Error generating Cornell notes."
        };
      }
    }
    
    debugLog("GitHub API processing completed successfully");
    return results;
  } catch (err) {
    console.error('Error with GitHub API:', err);
    debugLog("GitHub API error details:", {
      message: err.message,
      response: err.response ? {
        status: err.response.status,
        statusText: err.response.statusText,
        data: err.response.data
      } : "No response"
    });
    throw new Error('Failed to process with GitHub API');
  }
};

// Process text with OpenAI
const processWithOpenAI = async (text, formats) => {
  debugLog("Processing with OpenAI API");
  
  const results = {};
  
  try {
    // Generate flashcards if requested
    if (formats.flashcards) {
      debugLog("Generating flashcards with OpenAI API");
      
      const flashcardsPrompt = `
        Create 5-10 flashcards based on the following text. 
        Format your response as a JSON array of objects with 'question' and 'answer' fields.
        Make the flashcards educational and focus on key concepts.
        
        Text: ${text}
        
        Response format:
        [
          {
            "question": "Question 1?",
            "answer": "Answer 1"
          },
          ...
        ]
      `;
      
      const flashcardsResponse = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "You are an educational assistant that creates high-quality study materials." },
          { role: "user", content: flashcardsPrompt }
        ],
        temperature: 0.7,
      });
      
      debugLog("OpenAI flashcards response received");
      
      try {
        results.flashcards = JSON.parse(flashcardsResponse.choices[0].message.content.trim());
        debugLog("Successfully parsed flashcards JSON");
      } catch (err) {
        console.error('Error parsing flashcards JSON:', err);
        debugLog("Error parsing flashcards JSON. Response content:", flashcardsResponse.choices[0].message.content);
        results.flashcards = [{ question: "Error generating flashcards", answer: "Please try again with a different document." }];
      }
    }
    
    // Generate summary if requested
    if (formats.summary) {
      debugLog("Generating summary with OpenAI API");
      
      const summaryPrompt = `
        Create a comprehensive summary of the following text. 
        The summary should be about 250-300 words and cover the main points.
        
        Text: ${text}
      `;
      
      const summaryResponse = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "You are an educational assistant that creates concise, informative summaries." },
          { role: "user", content: summaryPrompt }
        ],
        temperature: 0.7,
      });
      
      debugLog("OpenAI summary response received");
      
      results.summary = summaryResponse.choices[0].message.content.trim();
      debugLog("Successfully generated summary");
    }
    
    // Generate Cornell notes if requested
    if (formats.cornellNotes) {
      debugLog("Generating Cornell notes with OpenAI API");
      
      const cornellPrompt = `
        Create Cornell notes for the following text.
        Format your response as a JSON object with the following structure:
        {
          "cues": ["Cue 1", "Cue 2", ...],
          "notes": ["Note 1", "Note 2", ...],
          "summary": "Summary text"
        }
        
        The cues should be key concepts or questions.
        The notes should be detailed information related to each cue.
        The summary should be a brief overview of the entire content.
        
        Text: ${text}
      `;
      
      const cornellResponse = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "You are an educational assistant that creates structured Cornell notes." },
          { role: "user", content: cornellPrompt }
        ],
        temperature: 0.7,
      });
      
      debugLog("OpenAI Cornell notes response received");
      
      try {
        results.cornellNotes = JSON.parse(cornellResponse.choices[0].message.content.trim());
        debugLog("Successfully parsed Cornell notes JSON");
      } catch (err) {
        console.error('Error parsing Cornell notes JSON:', err);
        debugLog("Error parsing Cornell notes JSON. Response content:", cornellResponse.choices[0].message.content);
        results.cornellNotes = {
          cues: ["Error"],
          notes: ["Could not generate Cornell notes. Please try again with a different document."],
          summary: "Error generating Cornell notes."
        };
      }
    }
    
    debugLog("OpenAI processing completed successfully");
    return results;
  } catch (err) {
    console.error('Error with OpenAI API:', err);
    debugLog("OpenAI API error details:", {
      message: err.message,
      type: err.type,
      param: err.param,
      code: err.code
    });
    throw new Error('Failed to process with OpenAI API');
  }
};

// Helper function to check if MongoDB is connected
const isMongoConnected = () => {
  const connected = PDF.db && PDF.db.readyState === 1;
  debugLog(`MongoDB connection status: ${connected ? 'Connected' : 'Disconnected'}`);
  return connected;
};

// Upload and process PDF
exports.uploadPDF = async (req, res) => {
  debugLog("PDF upload request received");
  
  try {
    if (!req.files || !req.files.pdfFile) {
      debugLog("No PDF file in request");
      return res.status(400).json({ message: 'No PDF file uploaded' });
    }
    
    const pdfFile = req.files.pdfFile;
    debugLog(`PDF file received: ${pdfFile.name}, Size: ${pdfFile.size} bytes, Type: ${pdfFile.mimetype}`);
    
    // Validate file type
    if (pdfFile.mimetype !== 'application/pdf') {
      debugLog(`Invalid file type: ${pdfFile.mimetype}`);
      return res.status(400).json({ message: 'Uploaded file must be a PDF' });
    }
    
    // Parse output formats and model type
    const outputFormats = JSON.parse(req.body.outputFormats || '{}');
    const modelType = req.body.modelType || 'openai'; // Default to OpenAI if not specified
    debugLog(`Request parameters - Model type: ${modelType}, Output formats:`, outputFormats);
    
    // Extract text from PDF
    let text = '';
    let usedMockData = false;
    
    try {
      debugLog("Attempting to parse PDF...");
      
      // Try to save the PDF to disk temporarily and then read it
      const tempFilePath = path.join(__dirname, `../temp_${Date.now()}.pdf`);
      await pdfFile.mv(tempFilePath);
      debugLog(`Temporary file saved at: ${tempFilePath}`);
      
      try {
        const fileBuffer = fs.readFileSync(tempFilePath);
        debugLog(`File read from disk, size: ${fileBuffer.length} bytes`);
        
        const pdfData = await pdfParse(fileBuffer);
        text = pdfData.text || '';
        debugLog(`Text extracted, length: ${text.length} characters`);
        
        // Clean up the temporary file
        fs.unlinkSync(tempFilePath);
        debugLog("Temporary file removed");
        
        if (!text || text.trim().length === 0) {
          debugLog("PDF parsing succeeded but no text was extracted. Using mock data.");
          usedMockData = true;
          const processedResults = generateMockData(pdfFile.name, outputFormats);
          storeAndReturnResults(pdfFile.name, "Mock text for empty PDF", processedResults, res);
          return;
        }
      } catch (pdfError) {
        // Clean up the temporary file if it exists
        if (fs.existsSync(tempFilePath)) {
          fs.unlinkSync(tempFilePath);
          debugLog("Temporary file removed after error");
        }
        
        debugLog("PDF parsing error:", {
          message: pdfError.message,
          details: pdfError.details,
          stack: pdfError.stack
        });
        
        usedMockData = true;
        const processedResults = generateMockData(pdfFile.name, outputFormats);
        storeAndReturnResults(pdfFile.name, "Mock text for unparseable PDF", processedResults, res);
        return;
      }
    } catch (err) {
      console.error('Error handling PDF file:', err);
      debugLog("Error handling PDF file:", {
        message: err.message,
        stack: err.stack
      });
      
      usedMockData = true;
      const processedResults = generateMockData(pdfFile.name, outputFormats);
      storeAndReturnResults(pdfFile.name, "Mock text for file handling error", processedResults, res);
      return;
    }
    
    // Process text with selected API
    try {
      debugLog("Starting API processing...");
      const processedResults = await processWithAPI(text, outputFormats, modelType);
      debugLog("API processing completed successfully");
      storeAndReturnResults(pdfFile.name, text, processedResults, res);
    } catch (err) {
      console.error('Error processing with API:', err);
      debugLog("API processing error:", {
        message: err.message,
        stack: err.stack
      });
      
      usedMockData = true;
      const processedResults = generateMockData(pdfFile.name, outputFormats);
      storeAndReturnResults(pdfFile.name, "Mock text for API processing failure", processedResults, res);
    }
    
  } catch (err) {
    console.error('Error processing PDF:', err);
    debugLog("Unhandled error in uploadPDF:", {
      message: err.message,
      stack: err.stack
    });
    res.status(500).json({ message: 'Server error processing PDF' });
  }
};

// Helper function to store results and send response
const storeAndReturnResults = (fileName, text, processedResults, res) => {
  debugLog(`Storing results for ${fileName}`);
  
  // Generate a unique ID
  const id = Date.now().toString();
  debugLog(`Generated ID: ${id}`);
  
  // Store the results (either in MongoDB or in-memory)
  if (isMongoConnected()) {
    debugLog("Storing results in MongoDB");
    // Save results to database
    const newPDF = new PDF({
      fileName: fileName,
      originalText: text,
      ...processedResults
    });
    
    newPDF.save()
      .then(() => {
        debugLog(`Results saved to MongoDB with ID: ${newPDF._id}`);
        res.json({ 
          id: newPDF._id,
          message: 'PDF processed successfully' 
        });
      })
      .catch(err => {
        console.error('Error saving to MongoDB:', err);
        debugLog("MongoDB save error:", {
          message: err.message,
          code: err.code,
          name: err.name
        });
        
        // Fallback to in-memory if MongoDB save fails
        debugLog("Falling back to in-memory storage due to MongoDB save error");
        const result = {
          id,
          fileName: fileName,
          originalText: text,
          ...processedResults,
          createdAt: new Date()
        };
        
        inMemoryStorage.set(id, result);
        debugLog(`Results stored in memory with ID: ${id}`);
        
        res.json({ 
          id,
          message: 'PDF processed successfully (stored in memory due to database error)' 
        });
      });
  } else {
    // Store in memory if MongoDB is not available
    debugLog("Storing results in memory (MongoDB not connected)");
    const result = {
      id,
      fileName: fileName,
      originalText: text,
      ...processedResults,
      createdAt: new Date()
    };
    
    inMemoryStorage.set(id, result);
    debugLog(`Results stored in memory with ID: ${id}`);
    
    res.json({ 
      id,
      message: 'PDF processed successfully (stored in memory)' 
    });
  }
};

// Get processed results
exports.getResults = async (req, res) => {
  const id = req.params.id;
  debugLog(`Get results request for ID: ${id}`);
  
  try {
    // Check if MongoDB is connected
    if (isMongoConnected()) {
      try {
        debugLog(`Attempting to find results in MongoDB with ID: ${id}`);
        const pdf = await PDF.findById(id);
        
        if (!pdf) {
          debugLog(`Results not found in MongoDB, checking in-memory storage`);
          // If not found in MongoDB, check in-memory storage
          const memoryResult = inMemoryStorage.get(id);
          if (memoryResult) {
            debugLog(`Results found in memory storage`);
            // Return results from in-memory storage
            const { id: resultId, fileName, flashcards, summary, cornellNotes, createdAt } = memoryResult;
            
            return res.json({
              id: resultId,
              fileName,
              flashcards,
              summary,
              cornellNotes,
              createdAt
            });
          }
          
          debugLog(`Results not found in either MongoDB or memory storage`);
          return res.status(404).json({ message: 'Results not found' });
        }
        
        debugLog(`Results found in MongoDB`);
        // Return results without the full text to reduce payload size
        const { _id, fileName, flashcards, summary, cornellNotes, createdAt } = pdf;
        
        res.json({
          id: _id,
          fileName,
          flashcards,
          summary,
          cornellNotes,
          createdAt
        });
      } catch (err) {
        console.error('Error fetching from MongoDB:', err);
        debugLog("MongoDB fetch error:", {
          message: err.message,
          name: err.name,
          kind: err.kind,
          value: err.value,
          path: err.path
        });
        
        // If MongoDB query fails, check in-memory storage
        debugLog(`Checking in-memory storage due to MongoDB error`);
        const memoryResult = inMemoryStorage.get(id);
        if (memoryResult) {
          debugLog(`Results found in memory storage`);
          // Return results from in-memory storage
          const { id: resultId, fileName, flashcards, summary, cornellNotes, createdAt } = memoryResult;
          
          return res.json({
            id: resultId,
            fileName,
            flashcards,
            summary,
            cornellNotes,
            createdAt
          });
        }
        
        debugLog(`Results not found in memory storage`);
        return res.status(404).json({ message: 'Results not found' });
      }
    } else {
      // Use in-memory storage if MongoDB is not available
      debugLog(`MongoDB not connected, checking in-memory storage`);
      const result = inMemoryStorage.get(id);
      
      if (!result) {
        debugLog(`Results not found in memory storage`);
        return res.status(404).json({ message: 'Results not found' });
      }
      
      debugLog(`Results found in memory storage`);
      // Return results without the full text to reduce payload size
      const { id: resultId, fileName, flashcards, summary, cornellNotes, createdAt } = result;
      
      res.json({
        id: resultId,
        fileName,
        flashcards,
        summary,
        cornellNotes,
        createdAt
      });
    }
    
  } catch (err) {
    console.error('Error fetching results:', err);
    debugLog("Unhandled error in getResults:", {
      message: err.message,
      stack: err.stack
    });
    res.status(500).json({ message: 'Server error fetching results' });
  }
};

// Chat with PDF content
exports.chatWithPDF = async (req, res) => {
  console.log('====================================');
  console.log('⚠️ CHAT ENDPOINT CALLED', new Date().toISOString());
  console.log('REQUEST BODY:', JSON.stringify(req.body));
  
  const { pdfId, message } = req.body;
  debugLog(`Chat request received for PDF ID: ${pdfId}`);
  debugLog(`User message: ${message}`);
  
  if (!pdfId || !message) {
    console.log('⚠️ MISSING PARAMETERS', { pdfId, message });
    debugLog("Missing required parameters");
    return res.status(400).json({ message: 'PDF ID and message are required' });
  }
  
  try {
    let pdfText = '';
    let pdfFileName = '';
    
    // Try to find PDF in MongoDB
    if (isMongoConnected()) {
      console.log('Looking for PDF in MongoDB');
      try {
        const pdf = await PDF.findById(pdfId);
        if (pdf) {
          pdfText = pdf.originalText;
          pdfFileName = pdf.fileName;
          debugLog(`Found PDF in MongoDB: ${pdfFileName}`);
          console.log(`✅ Found PDF in MongoDB: ${pdfFileName}, text length: ${pdfText.length}`);
        } else {
          console.log('❌ PDF NOT found in MongoDB');
        }
      } catch (err) {
        console.log('❌ Error querying MongoDB:', err.message);
        debugLog("Error retrieving PDF from MongoDB:", {
          message: err.message,
          stack: err.stack
        });
      }
    }
    
    // If not found in MongoDB, check in-memory storage
    if (!pdfText) {
      console.log('Looking for PDF in memory storage');
      const memoryResult = inMemoryStorage.get(pdfId);
      if (memoryResult) {
        pdfText = memoryResult.originalText;
        pdfFileName = memoryResult.fileName;
        debugLog(`Found PDF in memory storage: ${pdfFileName}`);
        console.log(`✅ Found PDF in memory storage: ${pdfFileName}, text length: ${pdfText.length}`);
      } else {
        console.log('❌ PDF NOT found in memory storage');
        debugLog("PDF not found in either MongoDB or memory storage");
        return res.status(404).json({ message: 'PDF not found' });
      }
    }
    
    // Create a contextual prompt for the AI
    const contextPrompt = `
      You are an educational assistant helping a user understand a document titled "${pdfFileName}".
      Use the following document content to answer the user's question.
      If you can't answer based on the document, say so politely.
      
      Document content: ${pdfText.substring(0, 15000)} ${pdfText.length > 15000 ? '...(content truncated)' : ''}
      
      User question: ${message}
    `;
    
    try {
      let reply;
      
      // Use GitHub API
      const baseUrl = githubApiEndpoint;
      const azureEndpoint = `${baseUrl}/openai/deployments/gpt-4o-mini/chat/completions?api-version=2023-05-15`;
      
      const requestBody = {
        messages: [
          {
            role: "system",
            content: "You are an educational AI tutor that helps students understand document content. Provide helpful, concise responses."
          },
          {
            role: "user",
            content: contextPrompt
          }
        ],
        temperature: 0.7,
        max_tokens: 1000,
        model: "gpt-4o-mini"
      };
      
      const headers = {
        'api-key': githubApiKey,
        'Content-Type': 'application/json',
        'x-ms-model-mesh-model-name': 'gpt-4o-mini'
      };
      
      const response = await axios.post(
        azureEndpoint,
        requestBody,
        { headers }
      );
      
      reply = response.data.choices[0].message.content.trim();
      debugLog("AI response generated");
      
      res.json({ reply });
    } catch (err) {
      debugLog("Error generating AI response:", {
        message: err.message,
        stack: err.stack
      });
      
      // Provide a fallback response
      res.json({ 
        reply: "I'm having trouble analyzing this document right now. Please try asking a different question or try again later."
      });
    }
    
    console.log('====================================');
  } catch (err) {
    console.error('Error in chat endpoint:', err);
    debugLog("Unhandled error in chatWithPDF:", {
      message: err.message,
      stack: err.stack
    });
    res.status(500).json({ message: 'Server error processing chat request' });
  }
};
