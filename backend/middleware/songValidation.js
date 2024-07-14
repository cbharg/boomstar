// In middleware/songValidation.js
const { body, query, param, validationResult } = require('express-validator');

const checkValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

const searchValidation = [
  query('query').trim().notEmpty().withMessage('Search query is required'),
];

const createSongValidation = [
  body('title').trim().notEmpty().withMessage('Song title is required'),
  body('artist').trim().notEmpty().withMessage('Artist name is required'),
  body('album').trim().optional(),
  body('year').optional().isInt({ min: 1900, max: new Date().getFullYear() })
    .withMessage('Year must be a valid year between 1900 and current year'),
];

const updateSongValidation = [
  param('id').isMongoId().withMessage('Invalid song ID'),
  ...createSongValidation,
];

const deleteSongValidation = [
  param('id').isMongoId().withMessage('Invalid song ID'),
];

module.exports = {
  checkValidationErrors,
  searchValidation,
  createSongValidation,
  updateSongValidation,
  deleteSongValidation
};