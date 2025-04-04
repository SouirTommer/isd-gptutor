const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const axios = require('axios');
const FormData = require('form-data');
const db = require('../utils/dbUtils');

// Import the PDF controller to reuse text processing functions
const pdfController = require('./pdfController');

// Debug log function
const debugLog = (message, data = null) => {
  const timestamp = new Date().toISOString();
  console.log(`[AUDIO DEBUG ${timestamp}] ${message}`);
  if (data) {
    console.log(JSON.stringify(data, null, 2));
  }
};

// Transcribe audio using OpenAI Whisper API
const transcribeWithWhisper = async (audioFilePath) => {
  try {
    debugLog(`Transcribing audio file: ${audioFilePath}`);
    
    // Using OpenAI API from their Node SDK
    const OpenAI = require('openai');
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
    
    const transcription = await openai.audio.transcriptions.create({
      file: fs.createReadStream(audioFilePath),
      model: "whisper-1",
    });
    
    debugLog("Transcription completed successfully");
    return transcription.text;
  } catch (err) {
    console.error('Error transcribing with Whisper:', err);
    throw new Error(`Transcription error: ${err.message}`);
  }
};

// Alternative: transcribe with Azure Speech API
const transcribeWithAzure = async (audioFilePath) => {
  // Implementation would go here if using Azure
  throw new Error('Azure transcription not implemented');
};

// Upload and process audio
exports.uploadAudio = async (req, res) => {
  debugLog("Audio upload request received");
  
  try {
    if (!req.files || !req.files.audioFile) {
      debugLog("No audio file in request");
      return res.status(400).json({ message: 'No audio file uploaded' });
    }
    
    const audioFile = req.files.audioFile;
    debugLog(`Audio file received: ${audioFile.name}, Size: ${audioFile.size} bytes, Type: ${audioFile.mimetype}`);
    
    // Validate file type
    if (!audioFile.mimetype.startsWith('audio/')) {
      debugLog(`Invalid file type: ${audioFile.mimetype}`);
      return res.status(400).json({ message: 'Uploaded file must be an audio file' });
    }
    
    // Parse output formats and model type
    const outputFormats = JSON.parse(req.body.outputFormats || '{}');
    const modelType = req.body.modelType || 'openai'; // Default to OpenAI if not specified
    debugLog(`Request parameters - Model type: ${modelType}, Output formats:`, outputFormats);
    
    // Save audio file temporarily
    const tempFilePath = path.join(__dirname, `../temp_${Date.now()}.${audioFile.name.split('.').pop()}`);
    await audioFile.mv(tempFilePath);
    debugLog(`Temporary file saved at: ${tempFilePath}`);
    
    // Transcribe audio to text
    let transcribedText = '';
    try {
      transcribedText = await transcribeWithWhisper(tempFilePath);
      debugLog(`Transcription successful, length: ${transcribedText.length} characters`);
      
      // Clean up temp file
      fs.unlinkSync(tempFilePath);
      debugLog("Temporary file removed");
      
    } catch (transcriptionErr) {
      console.error('Error transcribing audio:', transcriptionErr);
      
      if (fs.existsSync(tempFilePath)) {
        fs.unlinkSync(tempFilePath);
        debugLog("Temporary file removed after error");
      }
      
      return res.status(500).json({ message: 'Error transcribing audio: ' + transcriptionErr.message });
    }
    
    if (!transcribedText || transcribedText.trim().length === 0) {
      debugLog("Transcription yielded no text");
      return res.status(400).json({ message: 'No text could be extracted from the audio' });
    }
    
    // Now process the transcribed text just like we would process PDF text
    try {
      debugLog("Starting API processing of transcribed text...");
      // Use the same processWithAPI function from pdfController
      const processedResults = await pdfController.processWithAPI(transcribedText, outputFormats, modelType);
      debugLog("API processing completed successfully");
      
      // Store results in database
      const audioRecord = {
        id: Date.now().toString(),
        fileName: `Audio_${new Date().toISOString().split('T')[0]}`,
        originalText: transcribedText,
        flashcards: processedResults.flashcards || [],
        summary: processedResults.summary || "",
        cornellNotes: processedResults.cornellNotes || null,
        multipleChoice: processedResults.multipleChoice || [],
        createdAt: new Date().toISOString(),
        isAudioTranscription: true,
        isMockData: processedResults.isMockData || false
      };
      
      // Save to JSON DB using the same utilities
      const savedRecord = db.savePdf(audioRecord); // Reusing the PDF DB functions
      debugLog(`Results saved to JSON DB with ID: ${savedRecord.id}`);
      
      res.json({ 
        id: savedRecord.id,
        message: 'Audio processed successfully',
        isMockData: savedRecord.isMockData || false
      });
      
    } catch (err) {
      console.error('Error processing with API:', err);
      debugLog("API processing error:", {
        message: err.message,
        stack: err.stack
      });
      
      res.status(500).json({ message: 'Error processing transcribed text: ' + err.message });
    }
    
  } catch (err) {
    console.error('Error processing audio:', err);
    debugLog("Unhandled error in uploadAudio:", {
      message: err.message,
      stack: err.stack
    });
    res.status(500).json({ message: 'Server error processing audio' });
  }
};

// Standalone transcribe endpoint (optional)
exports.transcribeAudio = async (req, res) => {
  try {
    if (!req.files || !req.files.audioFile) {
      return res.status(400).json({ message: 'No audio file uploaded' });
    }
    
    const audioFile = req.files.audioFile;
    
    // Save audio file temporarily
    const tempFilePath = path.join(__dirname, `../temp_${Date.now()}.${audioFile.name.split('.').pop()}`);
    await audioFile.mv(tempFilePath);
    
    // Transcribe audio to text
    try {
      const transcribedText = await transcribeWithWhisper(tempFilePath);
      
      // Clean up temp file
      fs.unlinkSync(tempFilePath);
      
      res.json({ transcript: transcribedText });
      
    } catch (transcriptionErr) {
      if (fs.existsSync(tempFilePath)) {
        fs.unlinkSync(tempFilePath);
      }
      
      res.status(500).json({ message: 'Error transcribing audio: ' + transcriptionErr.message });
    }
  } catch (err) {
    console.error('Error in transcribe endpoint:', err);
    res.status(500).json({ message: 'Server error processing transcription' });
  }
};
