const express = require('express');
const router = express.Router();
const Song = require('../models/Song');
const authMiddleware = require('../middleware/authMiddleware');
const {
  checkValidationErrors,
  searchValidation,
  createSongValidation,
  updateSongValidation,
  deleteSongValidation
} = require('../middleware/songValidation');

// Get all songs
router.get('/', authMiddleware, async (req, res) => {
  try {
    const songs = await Song.find();
    res.json(songs);
  } catch (err) {
    console.error('Error fetching songs:', err);
    res.status(500).json({ message: 'Server Error', error: err.message });
  }
});

// @route   GET api/songs/search
// @desc    Search for songs
// @access  Private
router.get('/search', authMiddleware, searchValidation, checkValidationErrors, async (req, res) => {
  try {
    const { query } = req.query;
    const songs = await Song.find({
      $or: [
        { title: { $regex: query, $options: 'i' } },
        { artist: { $regex: query, $options: 'i' } }
      ]
    }).limit(10);

    res.json(songs);
  } catch (err) {
    console.error('Error searching songs:', err);
    res.status(500).json({ message: 'Server Error', error: err.message });
  }
});

// Add a new song
router.post('/', authMiddleware, createSongValidation, checkValidationErrors, async (req, res) => {
  try {
    const { title, artist, album, year } = req.body;
    const newSong = new Song({
      title,
      artist,
      album,
      year
    });
    const song = await newSong.save();
    res.json(song);
  } catch (err) {
    console.error('Error creating song:', err);
    res.status(400).json({ message: 'Error creating song', error: err.message });
  }
});

// UPDATE route for songs
router.put('/:id', authMiddleware, updateSongValidation, checkValidationErrors, async (req, res) => {
  try {
    const { title, artist, album, year } = req.body;
    const updatedSong = await Song.findByIdAndUpdate(
      req.params.id,
      { title, artist, album, year },
      { new: true, runValidators: true }
    );

    if (!updatedSong) {
      return res.status(404).json({ message: 'Song not found' });
    }

    res.json(updatedSong);
  } catch (error) {
    console.error('Error updating song:', error);
    res.status(400).json({ message: 'Error updating song', error: error.message });
  }
});

// DELETE route for songs
router.delete('/:id', authMiddleware, deleteSongValidation, checkValidationErrors, async (req, res) => {
  try {
    const deletedSong = await Song.findByIdAndDelete(req.params.id);

    if (!deletedSong) {
      return res.status(404).json({ message: 'Song not found' });
    }

    res.json({ message: 'Song deleted successfully' });
  } catch (error) {
    console.error('Error deleting song:', error);
    res.status(400).json({ message: 'Error deleting song', error: error.message });
  }
});

module.exports = router;