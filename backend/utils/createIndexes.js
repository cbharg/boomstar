 // utils/createIndexes.js

const mongoose = require('mongoose');
const Song = require('../models/Song');

const createIndexes = async () => {
  try {
    await Song.createIndexes();
    console.log('Indexes created successfully');
  } catch (error) {
    console.error('Error creating indexes:', error);
  }
};

module.exports = createIndexes;