# isd-gptutor

# Overview

GPTutor is an advanced learning application that provides personalized tutoring and study materials. Designed to enhance your educational experience, GPTutor offers various tools to help you study effectively.

# Features

 <p>GPTutor offers a robust set of tools to supercharge your study sessions:</p>
 <ul>
     <li>
         <strong>Dashboard:</strong>
         <ul>
             <li>View key stats: Study Decks, Flashcards, Quiz Questions.</li>
             <li>Track your Learning Streak (current and longest).</li>
             <li>See your activity over the last 30 days.</li>
             <li>Monitor your Learning Rank (e.g., Beginner Learner) and progress to the next level.</li>
             <li>Quick access to Recent Study Materials</li>
         </ul>
     </li>
     <li>
         <strong>Study Materials Management:</strong>
         <ul>
             <li>Organized table of all study decks, showing name, flashcard count, quiz count, and creation date.</li>
             <li>Example: <code>Lec8A IP Management F1 - notes.pdf</code> - 10 flashcards, 5 quiz questions, 2025/4/1.</li>
         </ul>
     </li>
     <li>
         <strong>Create Study Materials:</strong>
         <ul>
             <li>Upload any educational PDF via drag-and-drop or file selection.</li>
             <li>Select formats: Flashcards, Quiz, Summary, or Cornell Notes.</li>
             <li>Customize: 1-50 Flashcards, 1-30 Quiz Questions</li>
             <li>AI-powered generation using GitHub/Azure models</li>
         </ul>
     </li>
     <li>
         <strong>Interactive Study Decks:</strong>
         <ul>
             <li>Chat with an AI Tutor about your content (e.g., ask about <code>Lec0 - Introduction of COMP 3511A 2024 v1a.pdf</code>).</li>
         </ul>
     </li>
     <li>
         <strong>Leaderboard:</strong>
         <ul>
             <li>Compete globally: e.g., Daniel Lee (Lvl 10, 92 points) vs. You (Lvl 1, 0 points).</li>
             <li>Track your rank and climb the levels.</li>
         </ul>
     </li>
 </ul>

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
   npm start
   ```

3. Access the Application
The frontend will be accessible at http://localhost:3000
The backend server will run on http://localhost:5001
