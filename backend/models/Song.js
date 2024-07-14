// models/Song.js
const mongoose = require('mongoose');

const SongSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  artist: {
    type: String,
    required: true
  },
  album: {
    type: String
  },
  duration: {
    type: Number
  }
  // Add other fields as needed

}, { timestamps: true });


module.exports = mongoose.model('Song', SongSchema); 
