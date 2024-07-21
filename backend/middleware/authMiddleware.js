// middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
const { createErrorObject } = require('../utils/errorHandler');

const protect = (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json(createErrorObject('Not authorized, no token'));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded.user;
    next();
  } catch (error) {
    console.error('Error in auth middleware:', error);
    res.status(401).json(createErrorObject('Not authorized, token failed'));
  }
};

module.exports = { protect };