const mongoose = require('mongoose');

const SongSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    index: true // Add index
  },
  artist: {
    type: String,
    required: true,
    index: true // Add index
  },
  album: String,
  genre: String,
  duration: Number,
  releaseYear: Number,
  audioUrl: String,
  coverImageUrl: String,
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, { timestamps: true });

// Compound index for title and artist
SongSchema.index({ title: 1, artist: 1 });

module.exports = mongoose.model('Song', SongSchema);