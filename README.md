# isd-gptutor

# Installation Guide

This guide will help you set up the project, which consists of a React frontend with Tailwind CSS and a Node.js backend.

## Setup Instructions

Set Up the Frontend

### Step 2: Set Up the Frontend

**Navigate to the Client Folder:**

1. Open your terminal and run:

   ```bash
   cd client
   npm install
   npm start
   ```

### Step 3: Set Up the Backend

**Navigate to the Server Folder:**

1. Create a .env File
  ```bash
  # Azure OpenAI Configuration
  # Format: https://YOUR_RESOURCE_NAME.openai.azure.com/openai/deployments/YOUR_DEPLOYMENT_NAME
  GITHUB_API_ENDPOINT=https://your-resource-name.openai.azure.com/openai/deployments/your-deployment-name
  GITHUB_API_KEY=your-azure-openai-api-key
  
  # Server Configuration
  PORT=5001
  
  # OpenAI Configuration (optional backup)
  OPENAI_API_KEY=your-openai-api-key
 ```

2. Open your terminal and run:

   ```bash
   cd server
   npm install
   npm run
   ```

3. Access the Application
The frontend will be accessible at http://localhost:3000
The backend server will run on http://localhost:5001
