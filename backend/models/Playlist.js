const mongoose = require('mongoose');
// Remove this line if Song.js is not directly used in this file
// const Song = require('./Song');

const PlaylistSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  songs: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Song'
  }],
  description: {
    type: String,
    trim: true
  }
}, { timestamps: true }); // This replaces createdAt and updatedAt fields

// Add pre-find hooks to automatically populate songs
PlaylistSchema.pre('findOne', function(next) {
  this.populate('songs');
  next();
});

PlaylistSchema.pre('find', function(next) {
  this.populate('songs');
  next();
});

module.exports = mongoose.model('Playlist', PlaylistSchema);