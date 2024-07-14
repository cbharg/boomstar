const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const Playlist = require('../models/Playlist');
const { check, validationResult } = require('express-validator');

// @route   POST api/playlists
// @desc    Create a new playlist
// @access  Private
router.post('/', [
  authMiddleware,
  check('name', 'Name is required').not().isEmpty(),
  check('description', 'Description is required').not().isEmpty()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log('Validation errors:', errors.array());
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    console.log('Creating new playlist:', req.body);
    const { name, description } = req.body;
    const newPlaylist = new Playlist({
      name,
      description,
      user: req.user.id
    });
    const playlist = await newPlaylist.save();
    console.log('Playlist created successfully:', playlist);
    res.json(playlist);
  } catch (err) {
    console.error('Error creating playlist:', err);
    res.status(500).json({msg: 'Server Error', error: err.message});
  }
});

// @route   GET api/playlists
// @desc    Get all playlists for a user
// @access  Private
router.get('/', authMiddleware, async (req, res) => {
  try {
    console.log(`Fetching playlists for user ${req.user.id}`);
    const playlists = await Playlist.find({ user: req.user.id }).sort({ createdAt: -1 });
    console.log(`Found ${playlists.length} playlists for user ${req.user.id}`);
    res.json(playlists);
  } catch (err) {
    console.error('Error fetching playlists:', err);
    res.status(500).json({msg: 'Server Error', error: err.message});
  }
});

// @route   GET api/playlists/:id
// @desc    Get a specific playlist
// @access  Private
router.get('/:id', [
  authMiddleware,
  check('id', 'Invalid playlist ID').isMongoId()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log('Validation errors:', errors.array());
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    console.log(`Fetching playlist ${req.params.id}`);
    const playlist = await Playlist.findById(req.params.id);
    if (!playlist) {
      console.log(`Playlist ${req.params.id} not found`);
      return res.status(404).json({ msg: 'Playlist not found' });
    }
    // Check user
    if (playlist.user.toString() !== req.user.id) {
      console.log(`User ${req.user.id} not authorized to access playlist ${req.params.id}`);
      return res.status(401).json({ msg: 'User not authorized' });
    }
    console.log(`Successfully fetched playlist ${req.params.id}`);
    res.json(playlist);
  } catch (err) {
    console.error(`Error fetching playlist ${req.params.id}:`, err);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Playlist not found' });
    }
    res.status(500).json({message: 'Error fetching playlist', error: err.message});
  }
});

// @route   PUT api/playlists/:id
// @desc    Update a playlist
// @access  Private
router.put('/:id', [
  authMiddleware,
  check('id', 'Invalid playlist ID').isMongoId(),
  check('name', 'Name is required').optional().not().isEmpty(),
  check('description', 'Description is required').optional().not().isEmpty()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log('Validation errors:', errors.array());
    return res.status(400).json({ errors: errors.array() });
  }
  const { name, description } = req.body;
  try {
    console.log(`Updating playlist ${req.params.id}:`, req.body);
    let playlist = await Playlist.findById(req.params.id);
    if (!playlist) {
      console.log(`Playlist ${req.params.id} not found`);
      return res.status(404).json({ msg: 'Playlist not found' });
    }
    // Check user
    if (playlist.user.toString() !== req.user.id) {
      console.log(`User ${req.user.id} not authorized to update playlist ${req.params.id}`);
      return res.status(401).json({ msg: 'User not authorized' });
    }
    playlist.name = name || playlist.name;
    playlist.description = description || playlist.description;
    playlist.updatedAt = Date.now();
    await playlist.save();
    console.log('Playlist updated successfully:', playlist);
    res.json(playlist);
  } catch (err) {
    console.error(`Error updating playlist ${req.params.id}:`, err);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Playlist not found' });
    }
    res.status(500).json({msg: 'Server Error', error: err.message});
  }
});

// @route   DELETE api/playlists/:id
// @desc    Delete a playlist
// @access  Private
router.delete('/:id', [
  authMiddleware,
  check('id', 'Invalid playlist ID').isMongoId()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log('Validation errors:', errors.array());
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    console.log(`Attempting to delete playlist ${req.params.id}`);
    const playlist = await Playlist.findById(req.params.id);
    if (!playlist) {
      console.log(`Playlist ${req.params.id} not found`);
      return res.status(404).json({ msg: 'Playlist not found' });
    }
    // Check user
    if (playlist.user.toString() !== req.user.id) {
      console.log(`User ${req.user.id} not authorized to delete playlist ${req.params.id}`);
      return res.status(401).json({ msg: 'User not authorized' });
    }
    await Playlist.findByIdAndDelete(req.params.id);
    console.log(`Playlist ${req.params.id} successfully deleted`);
    res.json({ msg: 'Playlist removed' });
  } catch (err) {
    console.error(`Error deleting playlist ${req.params.id}:`, err);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Playlist not found' });
    }
    res.status(500).json({msg: 'Server Error', error: err.message});
  }
});

// Add song to playlist
router.post('/:id/songs', [
  authMiddleware,
  check('id', 'Invalid playlist ID').isMongoId(),
  check('songId', 'Song ID is required').not().isEmpty().isMongoId()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log('Validation errors:', errors.array());
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    console.log(`Adding song to playlist ${req.params.id}:`, req.body);
    const playlist = await Playlist.findById(req.params.id);
    if (!playlist) {
      console.log(`Playlist ${req.params.id} not found`);
      return res.status(404).json({ message: 'Playlist not found' });
    }
    
    const { songId } = req.body;
    if (playlist.songs.includes(songId)) {
      console.log(`Song ${songId} already in playlist ${req.params.id}`);
      return res.status(400).json({ message: 'Song already in playlist' });
    }
    
    playlist.songs.push(songId);
    await playlist.save();
    
    console.log(`Song ${songId} successfully added to playlist ${req.params.id}`);
    res.json(playlist);
  } catch (err) {
    console.error(`Error adding song to playlist ${req.params.id}:`, err);
    res.status(500).json({msg: 'Server Error', error: err.message});
  }
});

// Remove song from playlist
router.delete('/:id/songs/:songId', [
  authMiddleware,
  check('id', 'Invalid playlist ID').isMongoId(),
  check('songId', 'Invalid song ID').isMongoId()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log('Validation errors:', errors.array());
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    console.log(`Removing song ${req.params.songId} from playlist ${req.params.id}`);
    const playlist = await Playlist.findById(req.params.id);
    if (!playlist) {
      console.log(`Playlist ${req.params.id} not found`);
      return res.status(404).json({ message: 'Playlist not found' });
    }
    
    playlist.songs = playlist.songs.filter(song => song.toString() !== req.params.songId);
    await playlist.save();
    
    console.log(`Song ${req.params.songId} successfully removed from playlist ${req.params.id}`);
    res.json(playlist);
  } catch (err) {
    console.error(`Error removing song from playlist ${req.params.id}:`, err);
    res.status(500).json({msg: 'Server Error', error: err.message});
  }
});

module.exports = router;