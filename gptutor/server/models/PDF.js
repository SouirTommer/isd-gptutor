const mongoose = require('mongoose');

const PDFSchema = new mongoose.Schema({
  fileName: {
    type: String,
    required: true
  },
  originalText: {
    type: String,
    required: true
  },
  flashcards: [{
    question: String,
    answer: String
  }],
  summary: {
    type: String
  },
  cornellNotes: {
    cues: [String],
    notes: [String],
    summary: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('PDF', PDFSchema);
