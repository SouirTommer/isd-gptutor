const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const pdfParse = require('pdf-parse');
const OpenAI = require('openai');
const axios = require('axios');
const db = require('../utils/dbUtils');

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// GitHub API configuration
const githubApiEndpoint = process.env.GITHUB_API_ENDPOINT;
const githubApiKey = process.env.GITHUB_API_KEY;

// In-memory storage as backup (optional)
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
  if (formats.multipleChoice) {
    results.multipleChoice = [
      { 
        question: "What is the primary purpose of GPTutor?", 
        options: ["Creating presentations", "Transforming PDFs into study materials", "Writing essays", "Taking notes"], 
        correctAnswer: 1 
      },
      { 
        question: "Which of these formats is NOT supported by GPTutor?", 
        options: ["Flashcards", "Cornell Notes", "Mind Maps", "Summaries"], 
        correctAnswer: 2 
      },
      { 
        question: "What AI technology does GPTutor integrate with?", 
        options: ["Only OpenAI", "Only GitHub API", "Both OpenAI and GitHub API", "Neither OpenAI nor GitHub API"], 
        correctAnswer: 2 
      }
    ];
  }
  debugLog("Generated mock data:", results);
  return results;
};

// Process text with API (OpenAI or GitHub)
const processWithAPI = async (text, formats, modelType = 'openai') => {
  console.log("\n\n=============================================");
  console.log(`🔄 PROCESSING WITH ${modelType.toUpperCase()} API`);
  console.log("=============================================");
  debugLog(`Processing text with ${modelType} API. Text length: ${text.length}, Formats:`, formats);
  
  // Add this flag to indicate if mock data was used
  let isMockData = false;
  
  // Check if API keys and endpoints are properly configured
  if (modelType === 'github') {
    console.log("\n🔍 GitHub/Azure API configuration check:");
    console.log("- API endpoint:", githubApiEndpoint || "NOT SET");
    console.log("- API key present:", !!githubApiKey);
    console.log("- API key length:", githubApiKey ? githubApiKey.length : 0, "characters");
    
    if (!githubApiEndpoint || !githubApiKey) {
      console.error("\n❌ USING MOCK DATA: GitHub API credentials missing or invalid");
      console.error("   Check your .env file and make sure GITHUB_API_ENDPOINT and GITHUB_API_KEY are set");
      isMockData = true;
      const mockResult = generateMockData("api_credentials_missing.pdf", formats);
      mockResult.isMockData = true;
      return mockResult;
    }
  } else if (modelType === 'openai') {
    console.log("\n🔍 OpenAI API configuration check:");
    console.log("- API key present:", !!process.env.OPENAI_API_KEY);
    console.log("- API key length:", process.env.OPENAI_API_KEY ? process.env.OPENAI_API_KEY.length : 0, "characters");
    
    if (!process.env.OPENAI_API_KEY) {
      console.error("\n❌ USING MOCK DATA: OpenAI API key missing");
      console.error("   Check your .env file and make sure OPENAI_API_KEY is set");
      isMockData = true;
      const mockResult = generateMockData("api_credentials_missing.pdf", formats);
      mockResult.isMockData = true;
      return mockResult;
    }
  }
  
  // Validate that we have text to process
  if (!text || text.trim().length < 100) {
    console.error("\n❌ USING MOCK DATA: Text too short for meaningful processing");
    console.error(`   Text length: ${text?.length || 0} characters (minimum 100 required)`);
    isMockData = true;
    const mockResult = generateMockData("insufficient_text.pdf", formats);
    mockResult.isMockData = true;
    return mockResult;
  }

  const truncatedText = text.length > 15000 ? text.substring(0, 15000) + '...' : text;
  
  try {
    let results;
    if (modelType === 'github') {
      console.log("\n🚀 Attempting GitHub/Azure API call...");
      results = await processWithGitHubAPI(truncatedText, formats);
      console.log("\n✅ GITHUB/AZURE API CALL SUCCESSFUL");
      console.log("   Results generated for formats:", Object.keys(results).join(", "));
    } else {
      console.log("\n🚀 Attempting OpenAI API call...");
      results = await processWithOpenAI(truncatedText, formats);
      console.log("\n✅ OPENAI API CALL SUCCESSFUL");
      console.log("   Results generated for formats:", Object.keys(results).join(", "));
    }
    
    // Mark as real API data
    results.isMockData = false;
    return results;
  } catch (err) {
    console.error("\n❌ USING MOCK DATA: API call failed with error:");
    console.error(`   Error: ${err.message}`);
    if (err.response) {
      console.error(`   Status: ${err.response.status}`);
      console.error(`   Response data: ${JSON.stringify(err.response.data).substring(0, 200)}...`);
    }
    
    // Generate mock data as fallback
    isMockData = true;
    const mockResult = generateMockData("api_error.pdf", formats);
    mockResult.isMockData = true;
    return mockResult;
  }
};

// Process text with GitHub API
const processWithGitHubAPI = async (text, formats) => {
  console.log("\n📝 GITHUB/AZURE API PROCESSING START");
  
  try {
    // Validate the API endpoint format
    if (!githubApiEndpoint || !githubApiEndpoint.startsWith("https://")) {
      console.error(`\n❌ Invalid API endpoint format: ${githubApiEndpoint}`);
      throw new Error(`Invalid API endpoint format: ${githubApiEndpoint}`);
    }
    
    // Determine the deployment name based on the endpoint structure
    let model = "gpt-4o-mini"; // Changed from gpt-4 to gpt-4o-mini
    let deploymentName = "gpt-4o-mini"; // Changed from gpt-4 to gpt-4o-mini
    
    // If the endpoint already includes a deployment path, extract the deployment name
    if (githubApiEndpoint.includes("/openai/deployments/")) {
      const parts = githubApiEndpoint.split("/openai/deployments/");
      if (parts.length > 1) {
        const subParts = parts[1].split("/");
        deploymentName = subParts[0];
        console.log(`\n🔍 Found deployment name in endpoint: ${deploymentName}`);
      }
    }
    
    // Build the base endpoint (without the deployment)
    let baseEndpoint;
    if (githubApiEndpoint.includes("/openai/deployments/")) {
      baseEndpoint = githubApiEndpoint.split("/openai/deployments/")[0];
    } else {
      baseEndpoint = githubApiEndpoint;
    }
    
    // Construct the complete API URL
    const azureEndpoint = `${baseEndpoint}/openai/deployments/${deploymentName}/chat/completions?api-version=2023-05-15`;
    
    console.log(`\n🌐 Using Azure OpenAI endpoint: ${azureEndpoint}`);
    console.log(`\n🧩 Deployment name: ${deploymentName}`);
    
    const results = {};
    const headers = {
      'api-key': githubApiKey,
      'Content-Type': 'application/json',
      'x-ms-model-mesh-model-name': deploymentName // Add this header for model-mesh systems
    };
    
    console.log("\n🔑 Using API key (last 4 chars):", githubApiKey.slice(-4));

    // Test connection with a simple request before proceeding
    try {
      console.log("\n🔍 Testing API connectivity with a simple request...");
      const testBody = {
        messages: [
          { role: "system", content: "You are a test assistant." },
          { role: "user", content: "Respond with 'API connection successful' if you receive this message." }
        ],
        temperature: 0.7,
        max_tokens: 50,
        model: deploymentName // Add the model explicitly in the request body
      };
      
      console.log("🔄 Test request payload:", JSON.stringify(testBody));
      
      const testResponse = await axios.post(
        azureEndpoint,
        testBody,
        { headers, timeout: 15000 }
      );
      
      if (testResponse && testResponse.status === 200) {
        const content = testResponse.data.choices[0].message.content.trim();
        console.log("\n✅ TEST REQUEST SUCCESSFUL");
        console.log(`   Response: "${content}"`);
      } else {
        console.error("\n⚠️ Test request returned unexpected status:", testResponse.status);
      }
    } catch (testErr) {
      console.error("\n❌ TEST REQUEST FAILED");
      console.error(`   Error: ${testErr.message}`);
      if (testErr.response) {
        console.error(`   Status: ${testErr.response.status}`);
        console.error(`   Data: ${JSON.stringify(testErr.response.data).substring(0, 200)}...`);
      }
      throw testErr; // Re-throw to handle in the parent function
    }

    // Process each format sequentially
    
    // Process flashcards if requested
    if (formats.flashcards) {
      console.log("\n🎴 Generating flashcards...");
      const flashcardsPrompt = `
        Create 5-10 flashcards based on the following text. 
        Format your response as a JSON array of objects with 'question' and 'answer' fields.
        Make the flashcards educational and focus on key concepts.
        
        Text: ${text.substring(0, 6000)}
        
        Response format:
        [
          {
            "question": "Question 1?",
            "answer": "Answer 1"
          },
          {
            "question": "Question 2?",
            "answer": "Answer 2"
          }
        ]
      `;
      
      const requestBody = {
        messages: [
          { 
            role: "system", 
            content: "You are an educational assistant that creates high-quality flashcards."
          },
          { 
            role: "user", 
            content: flashcardsPrompt
          }
        ],
        temperature: 0.7,
        max_tokens: 2000,
        model: deploymentName // Add the model explicitly in the request body
      };
      
      try {
        console.log("\n📤 Sending flashcards request to Azure API...");
        const response = await axios.post(
          azureEndpoint, 
          requestBody, 
          { headers, timeout: 30000 }
        );
        
        console.log("\n📥 Received flashcards response");
        
        if (response && response.data && response.data.choices && response.data.choices[0]) {
          const responseContent = response.data.choices[0].message.content.trim();
          console.log(`\n📝 Response content sample (first 100 chars): ${responseContent.substring(0, 100)}...`);
          
          // Try to extract JSON from the response text
          try {
            // First attempt to parse the content directly
            results.flashcards = JSON.parse(responseContent);
            console.log(`\n✅ Successfully parsed flashcards JSON with ${results.flashcards.length} cards`);
          } catch (parseErr) {
            console.error("\n❌ Direct JSON parse failed:", parseErr.message);
            
            // Try to extract JSON from markdown code blocks if present
            if (responseContent.includes("```json")) {
              const jsonContent = responseContent.replace(/```json\n|\n```/g, "");
              console.log("\n🔍 Extracting JSON from markdown code block");
              try {
                results.flashcards = JSON.parse(jsonContent);
                console.log(`\n✅ Successfully parsed flashcards JSON from code block with ${results.flashcards.length} cards`);
              } catch (codeErr) {
                console.error("\n❌ Code block JSON parse failed:", codeErr.message);
                throw new Error("Failed to parse flashcards JSON from code block");
              }
            } else if (responseContent.includes("```")) {
              const jsonContent = responseContent.replace(/```\n|\n```/g, "");
              console.log("\n🔍 Extracting from generic code block");
              try {
                results.flashcards = JSON.parse(jsonContent);
                console.log(`\n✅ Successfully parsed flashcards JSON from generic block with ${results.flashcards.length} cards`);
              } catch (codeErr) {
                console.error("\n❌ Generic code block parse failed:", codeErr.message);
                throw new Error("Failed to parse flashcards JSON from generic code block");
              }
            } else {
              // Try with regex to extract JSON array
              const jsonRegex = /\[\s*{\s*"question"[\s\S]*\}\s*\]/;
              const match = responseContent.match(jsonRegex);
              if (match) {
                try {
                  results.flashcards = JSON.parse(match[0]);
                  console.log(`\n✅ Successfully extracted flashcards JSON with regex, found ${results.flashcards.length} cards`);
                } catch (regexErr) {
                  console.error("\n❌ Regex extraction failed:", regexErr.message);
                  throw new Error("Failed to parse flashcards JSON with regex");
                }
              } else {
                throw new Error("No valid JSON array found in flashcards response");
              }
            }
          }
        } else {
          console.error("\n❌ Invalid or empty flashcards API response structure");
          throw new Error("Invalid flashcards API response structure");
        }
      } catch (err) {
        console.error('\n❌ Error processing flashcards:', err.message);
        console.log("\n⚠️ Will continue processing other formats despite flashcard failure");
        // Don't rethrow - continue with other formats
      }
    }

    // Process summary if requested
    if (formats.summary) {
      console.log("\n📋 Generating summary...");
      const summaryPrompt = `
        Create a comprehensive summary of the following text. 
        The summary should be about 250-300 words and cover the main points.
        
        Text: ${text.substring(0, 8000)}
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
        model: deploymentName // Add the model explicitly in the request body
      };
      
      try {
        console.log("\n📤 Sending summary request to Azure API...");
        const response = await axios.post(
          azureEndpoint, 
          requestBody, 
          { headers, timeout: 30000 }
        );
        
        console.log("\n📥 Received summary response");
        
        if (response && response.data && response.data.choices && response.data.choices[0]) {
          results.summary = response.data.choices[0].message.content.trim();
          console.log(`\n✅ Successfully generated summary (${results.summary.length} chars)`);
        } else {
          console.error("\n❌ Invalid or empty summary API response structure");
          throw new Error("Invalid summary API response structure");
        }
      } catch (err) {
        console.error('\n❌ Error processing summary:', err.message);
        console.log("\n⚠️ Will continue processing other formats despite summary failure");
        // Don't rethrow - continue with other formats
      }
    }

    // Process Cornell notes if requested
    if (formats.cornellNotes) {
      console.log("\n📒 Generating Cornell notes...");
      const cornellPrompt = `
        Create Cornell notes for the following text.
        Format your response as a JSON object with the following structure:
        {
          "cues": ["Cue 1", "Cue 2", ...],
          "notes": ["Note 1", "Note 2", ...],
          "summary": "Summary text"
        }
        
        Text: ${text.substring(0, 6000)}
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
        model: deploymentName // Add the model explicitly in the request body
      };
      
      try {
        console.log("\n📤 Sending Cornell notes request to Azure API...");
        const response = await axios.post(
          azureEndpoint, 
          requestBody, 
          { headers, timeout: 30000 }
        );
        
        console.log("\n📥 Received Cornell notes response");
        
        if (response && response.data && response.data.choices && response.data.choices[0]) {
          const responseContent = response.data.choices[0].message.content.trim();
          console.log(`\n📝 Response content sample (first 100 chars): ${responseContent.substring(0, 100)}...`);
          
          // Try to extract JSON from the response text
          try {
            // First attempt to parse the content directly
            results.cornellNotes = JSON.parse(responseContent);
            console.log("\n✅ Successfully parsed Cornell notes JSON");
          } catch (parseErr) {
            console.error("\n❌ Direct JSON parse failed:", parseErr.message);
            
            // Try to extract JSON from markdown code blocks if present
            if (responseContent.includes("```json")) {
              const jsonContent = responseContent.replace(/```json\n|\n```/g, "");
              console.log("\n🔍 Extracting JSON from markdown code block");
              try {
                results.cornellNotes = JSON.parse(jsonContent);
                console.log("\n✅ Successfully parsed Cornell notes JSON from code block");
              } catch (codeErr) {
                console.error("\n❌ Code block JSON parse failed:", codeErr.message);
                throw new Error("Failed to parse Cornell notes JSON from code block");
              }
            } else if (responseContent.includes("```")) {
              const jsonContent = responseContent.replace(/```\n|\n```/g, "");
              console.log("\n🔍 Extracting from generic code block");
              try {
                results.cornellNotes = JSON.parse(jsonContent);
                console.log("\n✅ Successfully parsed Cornell notes JSON from generic block");
              } catch (codeErr) {
                console.error("\n❌ Generic code block parse failed:", codeErr.message);
                throw new Error("Failed to parse Cornell notes JSON from generic code block");
              }
            } else {
              // Try with regex to extract JSON array
              const jsonRegex = /\[\s*{\s*"question"[\s\S]*\}\s*\]/;
              const match = responseContent.match(jsonRegex);
              if (match) {
                try {
                  results.cornellNotes = JSON.parse(match[0]);
                  console.log("\n✅ Successfully extracted Cornell notes JSON with regex");
                } catch (regexErr) {
                  console.error("\n❌ Regex extraction failed:", regexErr.message);
                  throw new Error("Failed to parse Cornell notes JSON with regex");
                }
              } else {
                throw new Error("No valid JSON array found in Cornell notes response");
              }
            }
          }
        } else {
          console.error("\n❌ Invalid or empty Cornell notes API response structure");
          throw new Error("Invalid Cornell notes API response structure");
        }
      } catch (err) {
        console.error('\n❌ Error processing Cornell notes:', err.message);
        console.log("\n⚠️ Will continue processing other formats despite Cornell notes failure");
        // Don't rethrow - continue with other formats
      }
    }

    // Process multiple choice questions if requested
    if (formats.multipleChoice) {
      console.log("\n📊 Generating multiple choice questions");
      const mcPrompt = `
        Create 5 multiple choice questions based on the following text.
        Each question should have 4 possible answers with only one correct answer.
        Format your response as a JSON array of objects with the following structure:
        [
          {
            "question": "Question text here?",
            "options": ["Option A", "Option B", "Option C", "Option D"],
            "correctAnswer": 0  // Index of the correct answer (0-based)
          }
        ]
        Make sure the questions test important concepts from the text.
        
        Text: ${text.substring(0, 4000)}
      `;
      
      const requestBody = {
        messages: [
          {
            role: "system",
            content: "You are an educational assistant that creates high-quality multiple choice questions."
          },
          {
            role: "user",
            content: mcPrompt
          }
        ],
        temperature: 0.7,
        max_tokens: 2000,
        model: deploymentName // Add the model explicitly to the request body
      };
      
      console.log("\n📤 Sending multiple choice request to API...");
      console.log("🔄 Request payload:", JSON.stringify(requestBody).substring(0, 300) + "...");
      
      try {
        const mcResponse = await axios.post(
          azureEndpoint, 
          requestBody, 
          { headers, timeout: 30000 }
        );
        
        console.log(`\n📥 Multiple choice API response received (status: ${mcResponse.status})`);
        
        if (mcResponse && mcResponse.data && mcResponse.data.choices && mcResponse.data.choices[0]) {
          const responseContent = mcResponse.data.choices[0].message.content.trim();
          console.log("\n📝 Response content preview:", responseContent.substring(0, 100) + "...");
          
          let jsonContent = responseContent;
          
          // Try to extract JSON from markdown code blocks if present
          if (responseContent.includes("```json")) {
            jsonContent = responseContent.replace(/```json\n|\n```/g, "");
            console.log("\n🔍 Extracted JSON from markdown code block");
          } else if (responseContent.includes("```")) {
            jsonContent = responseContent.replace(/```\n|\n```/g, "");
            console.log("\n🔍 Extracted from generic code block");
          }
          
          // Clean up any trailing commas which can cause JSON parse errors
          jsonContent = jsonContent.replace(/,(\s*[\]}])/g, '$1');
          
          try {
            results.multipleChoice = JSON.parse(jsonContent);
            console.log(`\n✅ Successfully parsed multiple choice JSON with ${results.multipleChoice.length} questions`);
          } catch (parseErr) {
            console.error("\n❌ JSON parse failed:", parseErr.message);
            console.log("\n🔍 Trying alternative parsing approaches...");
            
            // Try to extract anything that looks like JSON array
            const jsonMatch = jsonContent.match(/\[\s*\{.*\}\s*\]/s);
            if (jsonMatch) {
              try {
                results.multipleChoice = JSON.parse(jsonMatch[0]);
                console.log("\n✅ Successfully extracted JSON with regex");
              } catch (matchErr) {
                console.error("\n❌ Regex extraction failed:", matchErr.message);
                throw new Error("Failed to parse even with regex extraction");
              }
            } else {
              throw new Error("No JSON array pattern found");
            }
          }
        } else {
          console.error("\n❌ Invalid or empty API response structure");
          throw new Error("Invalid API response structure");
        }
      } catch (err) {
        console.error('\n❌ Error processing multiple choice response:', err.message);
        throw err; // Rethrow to trigger the fallback in the parent function
      }
    }
    
    console.log("\n✅ GITHUB/AZURE API PROCESSING COMPLETED SUCCESSFULLY");
    return results;
  } catch (err) {
    console.error('\n❌ ERROR WITH GITHUB/AZURE API:', err.message);
    
    // Log detailed error information
    if (err.response) {
      console.error('\n🔴 API response error:');
      console.error(`   Status: ${err.response.status}`);
      console.error(`   Status text: ${err.response.statusText}`);
      console.error(`   Data: ${JSON.stringify(err.response.data).substring(0, 500)}...`);
    } else if (err.request) {
      console.error('\n🔴 API request error - no response received');
    } else {
      console.error('\n🔴 Error setting up API request:', err.message);
    }
    
    throw err; // Rethrow to trigger the fallback in the parent function
  }
};

// Process text with OpenAI
const processWithOpenAI = async (text, formats) => {
  debugLog("Processing with OpenAI API");
  const results = {};
  try {
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
          }
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
    if (formats.multipleChoice) {
      debugLog("Generating multiple choice questions with OpenAI API");
      const mcPrompt = `
        Create 5-10 multiple choice questions based on the following text.
        Each question should have 4 possible answers with only one correct answer.
        Format your response as a JSON array of objects with the following structure:
        [
          {
            "question": "Question text here?",
            "options": ["Option A", "Option B", "Option C", "Option D"],
            "correctAnswer": 0  // Index of the correct answer (0-based)
          }
        ]
        Make sure the questions test important concepts from the text, and include a mix of difficulty levels.
        Text: ${text}
      `;
      const mcResponse = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "You are an educational assistant that creates high-quality multiple choice questions." },
          { role: "user", content: mcPrompt }
        ],
        temperature: 0.7,
      });
      debugLog("OpenAI MC response received");
      try {
        results.multipleChoice = JSON.parse(mcResponse.choices[0].message.content.trim());
        debugLog("Successfully parsed multiple choice JSON");
      } catch (err) {
        console.error('Error parsing multiple choice JSON:', err);
        debugLog("Error parsing multiple choice JSON. Response content:", mcResponse.choices[0].message.content);
        results.multipleChoice = [
          { 
            question: "Error generating multiple choice questions", 
            options: ["Try again", "Refresh the page", "Upload a different document", "Contact support"], 
            correctAnswer: 2 
          }
        ];
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
  
  console.log("\n===========================================");
  console.log("📊 PROCESSED RESULTS SUMMARY");
  console.log("===========================================");
  console.log(`📄 File: ${fileName}`);
  console.log(`📝 Text length: ${text?.length || 0} characters`);
  console.log(`🎴 Flashcards: ${processedResults.flashcards?.length || 0}`);
  console.log(`📋 Summary: ${processedResults.summary ? 'Yes' : 'No'}`);
  console.log(`📝 Cornell Notes: ${processedResults.cornellNotes ? 'Yes' : 'No'}`);
  console.log(`❓ Multiple Choice: ${processedResults.multipleChoice?.length || 0} questions`);
  console.log(`🤖 Using Mock Data: ${processedResults.isMockData ? 'YES' : 'No'}`);
  console.log("===========================================\n");
  
  // Force multipleChoice to be included
  if (!processedResults.multipleChoice) {
    // Always include a multipleChoice property even if it's an empty array
    processedResults.multipleChoice = [];
  }
  
  // Create the PDF record with all required properties
  const pdfRecord = {
    id: Date.now().toString(),
    fileName: fileName,
    originalText: text,
    flashcards: processedResults.flashcards || [],
    summary: processedResults.summary || "",
    cornellNotes: processedResults.cornellNotes || null,
    multipleChoice: processedResults.multipleChoice, // Will never be undefined
    createdAt: new Date().toISOString(),
    isMockData: processedResults.isMockData || false
  };
  
  // Save to JSON DB
  const savedPdf = db.savePdf(pdfRecord);
  debugLog(`Results saved to JSON DB with ID: ${savedPdf.id}`);
  
  // Also keep in memory as backup
  inMemoryStorage.set(savedPdf.id, savedPdf);
  
  res.json({ 
    id: savedPdf.id,
    message: 'PDF processed successfully',
    isMockData: savedPdf.isMockData || false
  });
};

// Get processed results
exports.getResults = async (req, res) => {
  const id = req.params.id;
  debugLog(`Get results request for ID: ${id}`);
  
  try {
    // First try to get from local JSON database
    const jsonDbResult = db.getPdf(id);
    
    if (jsonDbResult) {
      debugLog(`Results found in JSON database`);
      
      // Convert the results to ensure multipleChoice exists
      const resultWithMC = {
        id: jsonDbResult.id,
        fileName: jsonDbResult.fileName,
        flashcards: jsonDbResult.flashcards || [],
        summary: jsonDbResult.summary || "",
        cornellNotes: jsonDbResult.cornellNotes || null,
        multipleChoice: jsonDbResult.multipleChoice || [], // Ensure this exists
        createdAt: jsonDbResult.createdAt
      };
      
      // Log available formats for debugging
      debugLog(`Available formats: flashcards=${!!resultWithMC.flashcards}, summary=${!!resultWithMC.summary}, cornellNotes=${!!resultWithMC.cornellNotes}, multipleChoice=${!!resultWithMC.multipleChoice}`);
      
      return res.json(resultWithMC);
    }
    
    // Check memory storage as backup
    const memoryResult = inMemoryStorage.get(id);
    if (memoryResult) {
      debugLog(`Results found in memory storage`);
      // Return results from in-memory storage
      const { id: resultId, fileName, flashcards, summary, cornellNotes, multipleChoice, createdAt } = memoryResult;
      
      return res.json({
        id: resultId,
        fileName,
        flashcards: flashcards || [],
        summary,
        cornellNotes,
        multipleChoice: multipleChoice || [],
        createdAt
      });
    }
    
    // Not found in any storage
    debugLog(`Results not found in any storage`);
    return res.status(404).json({ message: 'Results not found' });
    
  } catch (err) {
    console.error('Error fetching results:', err);
    debugLog("Error in getResults:", {
      message: err.message,
      stack: err.stack
    });
    res.status(500).json({ message: 'Server error fetching results' });
  }
};

// Get all PDFs
exports.getAllPDFs = async (req, res) => {
  debugLog('Get all PDFs request received');
  
  try {
    // Get PDFs from JSON DB
    const pdfs = db.getAllPdfs().map(pdf => ({
      id: pdf.id,
      fileName: pdf.fileName,
      createdAt: pdf.createdAt
    }));
    
    // Sort by createdAt (newest first)
    pdfs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    debugLog(`Found ${pdfs.length} PDFs in JSON DB`);
    res.json(pdfs);
  } catch (err) {
    console.error('Error getting all PDFs:', err);
    res.status(500).json({ message: 'Server error getting all PDFs' });
  }
};

// Add helper for creating test data
exports.createTestData = async (req, res) => {
  try {
    // Generate some test data with guaranteed multiple choice questions
    const mockData = {
      fileName: "Test-Document-" + new Date().toISOString().split('T')[0] + ".pdf",
      originalText: "This is a test document created to verify multiple choice functionality.",
      flashcards: [
        { question: "What is GPTutor?", answer: "An AI-powered educational tool" },
        { question: "What formats does it support?", answer: "Flashcards, Summaries, Cornell Notes, and Multiple Choice" }
      ],
      summary: "This is a test summary to demonstrate GPTutor's functionality.",
      cornellNotes: {
        cues: ["GPTutor Features", "Benefits"],
        notes: ["Supports multiple study formats", "Makes studying from PDFs easier"],
        summary: "GPTutor transforms PDFs into various study formats."
      },
      multipleChoice: [
        {
          question: "What type of application is GPTutor?",
          options: ["Video editor", "Study tool", "Programming IDE", "Game"],
          correctAnswer: 1
        },
        {
          question: "Which of these is NOT a feature of GPTutor?",
          options: ["Flashcards", "Multiple Choice Questions", "Video Tutorials", "Cornell Notes"],
          correctAnswer: 2
        },
        {
          question: "What does GPTutor process?",
          options: ["Images", "Videos", "PDFs", "Audio files"],
          correctAnswer: 2
        }
      ]
    };
    
    // Save to database
    const savedPdf = db.savePdf(mockData);
    
    // Also save in memory
    inMemoryStorage.set(savedPdf.id, savedPdf);
    
    res.json({
      success: true,
      message: 'Test data created successfully',
      id: savedPdf.id,
      testData: {
        fileName: savedPdf.fileName,
        hasMultipleChoice: Array.isArray(savedPdf.multipleChoice) && savedPdf.multipleChoice.length > 0,
        multipleChoiceCount: savedPdf.multipleChoice?.length || 0
      }
    });
  } catch (err) {
    console.error('Error creating test data:', err);
    res.status(500).json({ success: false, message: 'Error creating test data' });
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
    
    // Look for PDF in JSON DB
    const jsonDbResult = db.getPdf(pdfId);
    if (jsonDbResult) {
      pdfText = jsonDbResult.originalText;
      pdfFileName = jsonDbResult.fileName;
      debugLog(`Found PDF in JSON DB: ${pdfFileName}`);
      console.log(`✅ Found PDF in JSON DB: ${pdfFileName}, text length: ${pdfText.length}`);
    } else {
      // Check in-memory storage as backup
      console.log('Looking for PDF in memory storage');
      const memoryResult = inMemoryStorage.get(pdfId);
      if (memoryResult) {
        pdfText = memoryResult.originalText;
        pdfFileName = memoryResult.fileName;
        debugLog(`Found PDF in memory storage: ${pdfFileName}`);
        console.log(`✅ Found PDF in memory storage: ${pdfFileName}, text length: ${pdfText.length}`);
      } else {
        console.log('❌ PDF NOT found in any storage');
        debugLog("PDF not found in either JSON DB or memory storage");
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
    
    const apiEndpoint = githubApiEndpoint;
    
    // Determine the deployment name
    let deploymentName = "gpt-4o-mini"; // Changed from gpt-4 to gpt-4o-mini
    if (apiEndpoint.includes("/openai/deployments/")) {
      const parts = apiEndpoint.split("/openai/deployments/");
      if (parts.length > 1) {
        const subParts = parts[1].split("/");
        deploymentName = subParts[0];
      }
    }
    
    // Build the base endpoint (without the deployment)
    let baseEndpoint = apiEndpoint;
    if (apiEndpoint.includes("/openai/deployments/")) {
      baseEndpoint = apiEndpoint.split("/openai/deployments/")[0];
    }
    
    // Construct the complete API URL
    const azureEndpoint = `${baseEndpoint}/openai/deployments/${deploymentName}/chat/completions?api-version=2023-05-15`;
    console.log("🔄 Using endpoint for chat:", azureEndpoint);
    
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
      model: deploymentName // Add the model explicitly to the request body
    };
    
    const headers = {
      'api-key': githubApiKey,
      'Content-Type': 'application/json',
      'x-ms-model-mesh-model-name': deploymentName // Add this header for model-mesh systems
    };
    
    let reply;
    try {
      const response = await axios.post(
        azureEndpoint, 
        requestBody, 
        { headers }
      );
      debugLog("AI response generated");
      reply = response.data.choices[0].message.content.trim();
      res.json({ reply });
    } catch (err) {
      console.error("Error generating AI response:", err);
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