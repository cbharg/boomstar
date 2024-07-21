const express = require('express');
const router = express.Router();
const Song = require('../models/Song');
const { getPaginatedSongs, getSongById, createSong, updateSong, deleteSong } = require('../controllers/songController');//other functions will be implemented in near future so lets keep them
const { protect } = require('../middleware/authMiddleware');
const {
  checkValidationErrors,
  searchValidation,
  createSongValidation,
  updateSongValidation,
  deleteSongValidation
} = require('../middleware/songValidation');

// Get paginated songs
router.get('/', getPaginatedSongs);

// Get all songs
router.get('/', async (req, res) => {
  try {
    const songs = await Song.find();
    res.json(songs);
  } catch (err) {
    console.error('Error fetching songs:', err);
    res.status(500).json({ message: 'Server Error', error: err.message });
  }
});

// Search for songs
router.get('/search', protect, searchValidation, checkValidationErrors, async (req, res) => {
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
router.post('/', protect, createSongValidation, checkValidationErrors, async (req, res) => {
  try {
    const { title, artist, album, genre, duration, releaseYear, audioUrl, coverImageUrl } = req.body;
    const newSong = new Song({
      title,
      artist,
      album,
      genre,
      duration,
      releaseYear,
      audioUrl,
      coverImageUrl,
      createdBy: req.user.id
    });
    const song = await newSong.save();
    res.json(song);
  } catch (err) {
    console.error('Error creating song:', err);
    res.status(400).json({ message: 'Error creating song', error: err.message });
  }
});

// Get a single song by ID
router.get('/:id', async (req, res) => {
  try {
    const song = await Song.findById(req.params.id);
    if (!song) {
      return res.status(404).json({ message: 'Song not found' });
    }
    res.json(song);
  } catch (err) {
    console.error('Error fetching song:', err);
    res.status(500).json({ message: 'Server Error', error: err.message });
  }
});

// Update a song
router.put('/:id', protect, updateSongValidation, checkValidationErrors, async (req, res) => {
  try {
    const { title, artist, album, genre, duration, releaseYear, audioUrl, coverImageUrl } = req.body;
    const updatedSong = await Song.findByIdAndUpdate(
      req.params.id,
      { title, artist, album, genre, duration, releaseYear, audioUrl, coverImageUrl },
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

// Delete a song
router.delete('/:id', protect, deleteSongValidation, checkValidationErrors, async (req, res) => {
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