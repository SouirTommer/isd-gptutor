const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, '../data/db.json');

// Make sure the data directory exists
const ensureDataDir = () => {
  const dataDir = path.join(__dirname, '../data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
};

// Create the db.json file if it doesn't exist
const ensureDbFile = () => {
  if (!fs.existsSync(dbPath)) {
    const initialData = { pdfs: [] };
    fs.writeFileSync(dbPath, JSON.stringify(initialData, null, 2));
  }
};

// Initialize the database
const initDb = () => {
  ensureDataDir();
  ensureDbFile();
  console.log('Local JSON database initialized');
};

// Read the database
const readDb = () => {
  try {
    initDb();
    const data = fs.readFileSync(dbPath, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Error reading database file:', err);
    return { pdfs: [] };
  }
};

// Write to the database
const writeDb = (data) => {
  try {
    fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
    return true;
  } catch (err) {
    console.error('Error writing to database file:', err);
    return false;
  }
};

// Get a PDF by ID
const getPdf = (id) => {
  try {
    const db = readDb();
    const pdf = db.pdfs.find(pdf => pdf.id === id);
    
    if (pdf) {
      console.log(`[${new Date().toISOString()}] Found PDF with ID ${id} in JSON database`);
    } else {
      console.log(`[${new Date().toISOString()}] PDF with ID ${id} not found in JSON database`);
    }
    
    return pdf;
  } catch (err) {
    console.error(`[${new Date().toISOString()}] Error getting PDF with ID ${id}:`, err);
    return null;
  }
};

// Save a PDF
const savePdf = (pdfData) => {
  try {
    const db = readDb();
    
    // Generate a unique ID if not provided
    if (!pdfData.id) {
      pdfData.id = Date.now().toString();
    }
    
    // Add created timestamp if not present
    if (!pdfData.createdAt) {
      pdfData.createdAt = new Date().toISOString();
    }
    
    // Validate important fields to make sure we have valid data
    if (!pdfData.fileName) {
      console.error('Attempted to save PDF with no fileName');
      pdfData.fileName = 'unknown-' + pdfData.id + '.pdf';
    }
    
    // Ensure all required arrays exist even if empty
    pdfData.flashcards = pdfData.flashcards || [];
    pdfData.multipleChoice = pdfData.multipleChoice || [];
    
    // Log the data we're saving
    console.log(`[${new Date().toISOString()}] Saving PDF: ${pdfData.fileName}`);
    console.log(`  - Text length: ${pdfData.originalText ? pdfData.originalText.length : 0} characters`);
    console.log(`  - Flashcards: ${pdfData.flashcards.length}`);
    console.log(`  - Multiple choice questions: ${pdfData.multipleChoice.length}`);
    console.log(`  - Has summary: ${!!pdfData.summary}`);
    console.log(`  - Has cornell notes: ${!!pdfData.cornellNotes}`);
    
    // Find and replace if ID already exists
    const existingIndex = db.pdfs.findIndex(pdf => pdf.id === pdfData.id);
    if (existingIndex >= 0) {
      db.pdfs[existingIndex] = pdfData;
      console.log(`[${new Date().toISOString()}] Updated PDF with ID ${pdfData.id} in JSON database`);
    } else {
      db.pdfs.push(pdfData);
      console.log(`[${new Date().toISOString()}] Added new PDF with ID ${pdfData.id} to JSON database`);
    }
    
    // Write to disk and confirm success
    const writeSuccess = writeDb(db);
    if (!writeSuccess) {
      console.error(`[${new Date().toISOString()}] Failed to write PDF with ID ${pdfData.id} to JSON database`);
    }
    
    return pdfData;
  } catch (err) {
    console.error(`[${new Date().toISOString()}] Error saving PDF:`, err);
    return pdfData; // Return the data anyway so in-memory storage can be used
  }
};

// Get all PDFs
const getAllPdfs = () => {
  const db = readDb();
  return db.pdfs;
};

module.exports = {
  initDb,
  readDb,
  writeDb,
  getPdf,
  savePdf,
  getAllPdfs
};
