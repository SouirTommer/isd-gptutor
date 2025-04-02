const axios = require('axios');
const OpenAI = require('openai');

// GitHub/Azure API configuration
const githubApiEndpoint = process.env.GITHUB_API_ENDPOINT;
const githubApiKey = process.env.GITHUB_API_KEY;

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Test GitHub/Azure API connectivity
exports.testGitHubApi = async (req, res) => {
  console.log("\n🔍 Testing Azure OpenAI API connectivity...");
  
  try {
    // Validate API credentials
    if (!githubApiEndpoint || !githubApiKey) {
      return res.status(400).json({
        success: false,
        message: "GitHub/Azure API credentials missing",
        details: {
          endpointSet: !!githubApiEndpoint,
          keySet: !!githubApiKey
        }
      });
    }

    // Determine deployment name
    let deploymentName = "gpt-4o-mini"; // Changed from gpt-4 to gpt-4o-mini
    if (githubApiEndpoint.includes("/openai/deployments/")) {
      const parts = githubApiEndpoint.split("/openai/deployments/");
      if (parts.length > 1) {
        const subParts = parts[1].split("/");
        deploymentName = subParts[0];
        console.log(`🔍 Found deployment name in endpoint: ${deploymentName}`);
      }
    }
    
    // Build the base endpoint (without the deployment)
    let baseEndpoint = githubApiEndpoint;
    if (githubApiEndpoint.includes("/openai/deployments/")) {
      baseEndpoint = githubApiEndpoint.split("/openai/deployments/")[0];
    }
    
    // Construct the complete API URL
    const azureEndpoint = `${baseEndpoint}/openai/deployments/${deploymentName}/chat/completions?api-version=2023-05-15`;
    
    console.log(`🌐 Testing Azure endpoint: ${azureEndpoint}`);
    console.log(`🧩 Using deployment: ${deploymentName}`);
    
    const headers = {
      'api-key': githubApiKey,
      'Content-Type': 'application/json',
      'x-ms-model-mesh-model-name': deploymentName // Add this header for model-mesh systems
    };
    
    const testBody = {
      messages: [
        { role: "system", content: "You are a test assistant." },
        { role: "user", content: "Respond with 'API connection successful' if you receive this message." }
      ],
      temperature: 0.7,
      max_tokens: 50,
      model: deploymentName // Add the model explicitly to the request body
    };
    
    console.log("Request payload:", JSON.stringify(testBody));
    
    // Start a timer to measure response time
    const startTime = Date.now();
    
    const response = await axios.post(azureEndpoint, testBody, { 
      headers,
      timeout: 15000 // 15 second timeout
    });
    
    // Calculate response time
    const responseTime = Date.now() - startTime;
    
    if (response && response.status === 200 && response.data && response.data.choices) {
      const content = response.data.choices[0].message.content.trim();
      
      console.log(`✅ API test successful! Response: "${content}"`);
      console.log(`⏱️ Response time: ${responseTime}ms`);
      
      return res.json({
        success: true,
        message: "API connection test successful",
        response: content,
        responseTime,
        apiDetails: {
          endpoint: githubApiEndpoint,
          keyLength: githubApiKey.length,
          model: deploymentName
        }
      });
    } else {
      console.error("❌ Unexpected API response format");
      return res.status(500).json({
        success: false,
        message: "API connection test failed - unexpected response format",
        responseData: response.data
      });
    }
  } catch (err) {
    console.error("❌ API test failed:", err.message);
    
    // Detailed error logging
    if (err.response) {
      console.error('API response error:', {
        status: err.response.status,
        statusText: err.response.statusText,
        data: JSON.stringify(err.response.data).substring(0, 500)
      });
      
      return res.status(500).json({
        success: false,
        message: "API connection test failed",
        error: err.message,
        responseDetails: {
          status: err.response.status,
          statusText: err.response.statusText,
          data: err.response.data
        }
      });
    } else if (err.request) {
      console.error('API request error - no response received');
      
      return res.status(500).json({
        success: false,
        message: "API connection test failed - no response received",
        error: err.message,
        requestDetails: {
          url: azureEndpoint,
          timeout: 15000
        }
      });
    } else {
      console.error('Error setting up API request:', err.message);
      
      return res.status(500).json({
        success: false,
        message: "Error setting up API request",
        error: err.message
      });
    }
  }
};

// Test OpenAI API connectivity
exports.testOpenAiApi = async (req, res) => {
  console.log("\n🔍 Testing OpenAI API connectivity...");
  
  try {
    // Validate API key
    if (!process.env.OPENAI_API_KEY) {
      return res.status(400).json({
        success: false,
        message: "OpenAI API key missing"
      });
    }
    
    // Start a timer to measure response time
    const startTime = Date.now();
    
    // Send a simple test request
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: "You are a test assistant." },
        { role: "user", content: "Respond with 'API connection successful' if you receive this message." }
      ],
      temperature: 0.7,
      max_tokens: 50
    });
    
    // Calculate response time
    const responseTime = Date.now() - startTime;
    
    if (response && response.choices && response.choices.length > 0) {
      const content = response.choices[0].message.content.trim();
      
      console.log(`✅ OpenAI API test successful! Response: "${content}"`);
      console.log(`⏱️ Response time: ${responseTime}ms`);
      
      return res.json({
        success: true,
        message: "API connection test successful",
        response: content,
        responseTime,
        model: response.model
      });
    } else {
      console.error("❌ Unexpected OpenAI API response format");
      return res.status(500).json({
        success: false,
        message: "OpenAI API connection test failed - unexpected response format",
        responseData: response
      });
    }
  } catch (err) {
    console.error("❌ OpenAI API test failed:", err);
    
    return res.status(500).json({
      success: false,
      message: "OpenAI API connection test failed",
      error: err.message
    });
  }
};

// Get API configuration status
exports.getApiConfig = (req, res) => {
  return res.json({
    githubApi: {
      endpointPresent: !!githubApiEndpoint,
      endpoint: githubApiEndpoint ? `${githubApiEndpoint.slice(0, 15)}...` : null,
      keyPresent: !!githubApiKey,
      keyLength: githubApiKey ? githubApiKey.length : 0
    },
    openaiApi: {
      keyPresent: !!process.env.OPENAI_API_KEY,
      keyLength: process.env.OPENAI_API_KEY ? process.env.OPENAI_API_KEY.length : 0
    },
    debug: {
      debugEnabled: process.env.DEBUG_API === 'true'
    }
  });
};
