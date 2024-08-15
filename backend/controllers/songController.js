// controllers/songController.js
const Song = require('../models/Song');
const { createErrorObject } = require('../utils/errorHandler');
const CacheService = require('../utils/cacheService');

const cache = new CacheService(300); // Cache for 5 minutes

// Create a new song
exports.createSong = async (req, res) => {
  try {
    const newSong = new Song({
      ...req.body,
      createdBy: req.user.id // Assuming we have authentication middleware that adds user to req
    });
    const savedSong = await newSong.save();
    res.status(201).json(savedSong);
  } catch (error) {
    console.error('Error in createSong:', error);
    res.status(400).json(createErrorObject('Failed to create song', error));
  }
};

// Get all songs
exports.getAllSongs = async (req, res) => {
  try {
    const songs = await Song.find().populate('createdBy', 'username');
    res.json(songs);
  } catch (error) {
    console.error('Error in getAllSongs:', error);
    res.status(500).json(createErrorObject('Failed to fetch songs', error));
  }
};

// Get paginated songs
exports.getPaginatedSongs = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const searchQuery = req.query.search || '';
    const sortBy = req.query.sortBy || 'title';
    const sortOrder = req.query.sortOrder === 'desc' ? -1 : 1;
    const skipIndex = (page - 1) * limit;

    const cacheKey = `songs_${page}_${limit}_${searchQuery}_${sortBy}_${sortOrder}`;

    const result = await cache.get(cacheKey, async () => {
    let query = {};
    if (searchQuery) {
      query = {
        $or: [
          { title: { $regex: searchQuery, $options: 'i' } },
          { artist: { $regex: searchQuery, $options: 'i' } }
        ]
      };
    }

    const songs = await Song.find(query)
      .sort({ [sortBy]: sortOrder })
      .limit(limit)
      .skip(skipIndex)
      .exec();

    const totalSongs = await Song.countDocuments(query);
    const totalPages = Math.ceil(totalSongs / limit);

    return {
      songs,
      currentPage: page,
      totalPages,
      totalSongs
    };
    });
    res.json(result);
  } catch (error) {
    res.status(500).json(createErrorObject('Failed to fetch songs', error));
  }
};

// Get a single song by ID
exports.getSongById = async (req, res) => {
  try {
    const song = await Song.findById(req.params.id).populate('createdBy', 'username');
    if (!song) {
      return res.status(404).json(createErrorObject('Song not found'));
    }
    res.json(song);
  } catch (error) {
    console.error('Error in getSongById:', error);
    res.status(500).json(createErrorObject('Failed to fetch song', error));
  }
};

// Update a song
exports.updateSong = async (req, res) => {
  try {
    const updatedSong = await Song.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!updatedSong) {
      return res.status(404).json(createErrorObject('Song not found'));
    }
    res.json(updatedSong);
  } catch (error) {
    console.error('Error in updateSong:', error);
    res.status(400).json(createErrorObject('Failed to update song', error));
  }
};

// Delete a song
exports.deleteSong = async (req, res) => {
  try {
    const deletedSong = await Song.findByIdAndDelete(req.params.id);
    if (!deletedSong) {
      return res.status(404).json(createErrorObject('Song not found'));
    }
    res.json({ message: 'Song deleted successfully' });
  } catch (error) {
    console.error('Error in deleteSong:', error);
    res.status(500).json(createErrorObject('Failed to delete song', error));
  }
}; 
