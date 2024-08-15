// middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { createErrorObject } = require('../utils/errorHandler');

const protect = async (req, res, next) => {
  let token;

  console.log('Headers:', req.headers);

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
    console.log('Token extracted:', token);
  }

  if (!token) {
    console.log('No token found');
    return res.status(401).json(createErrorObject('Not authorized, no token'));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Decoded token:', decoded);
    
    // Fetch the user from the database
    const user = await User.findById(decoded.user.id).select('-password');
    console.log('User found:', user);
    
    if (!user) {
      console.log('User not found in database');
      return res.status(401).json(createErrorObject('User not found'));
    }

    // Attach the user object to the request
    req.user = user;
    
    console.log('User attached to request:', req.user);

    next();
  } catch (error) {
    console.error('Error in auth middleware:', error);
    res.status(401).json(createErrorObject('Not authorized, token failed'));
  }
};

module.exports = { protect };