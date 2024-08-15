const express = require('express');
const { check, validationResult } = require('express-validator');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { protect } = require('../middleware/authMiddleware');

console.log('auth.js is loaded');

function validatePassword(password) {
  const regex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9]).{8,}$/;
  console.log('Password being validated:', password);
  console.log('Regex test result:', regex.test(password));
  return regex.test(password);
}

// Registration route
router.post(
  '/register',
  [
    check('username', 'Username is required').not().isEmpty()
      .isLength({ min: 3, max: 30 }).withMessage('Username must be between 3 and 30 characters'),
    check('email', 'Please include a valid email').isEmail(),
    check('password')
      .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
      .custom((value) => {
        if (!validatePassword(value)) {
          throw new Error('Password must contain at least one uppercase letter, one lowercase letter, one number and one special character');
        }
        return true;
      })
  ],
  async (req, res) => {
    console.log('Registration attempt:', req.body);
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Validation errors:', errors.array());
      return res.status(400).json({ message: 'Validation failed', errors: errors.array() });
    }

    const { username, email, password } = req.body;

    try {
      // Check if user already exists
      let user = await User.findOne({ $or: [{ email }, { username }] });
      if (user) {
        console.log('User already exists:', { email, username });
        return res.status(400).json({ message: 'User with this email or username already exists' });
      }

      // Create new user
      user = new User({
        username,
        email,
        password
      });

      // Hash password
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);

      // Save user to database
      await user.save();

      // Generate JWT
      const accessToken = jwt.sign(
        { user: { id: user.id } },
        process.env.JWT_SECRET,
        { expiresIn: '15m' }
      );

      // Generate Refresh Token
      const refreshToken = jwt.sign(
        { id: user.id },
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: '7d' }
      );

      console.log('User registered successfully and tokens generated:', { email, username });
      res.status(201).json({ 
        accessToken, 
        refreshToken,
        user: { id: user.id, name: user.username, email: user.email },
        message: 'User registered successfully' 
      });
    } catch (err) {
      console.error('Error generating tokens:', err);
      res.status(500).json({ message: 'Error during registration' });
    }
  }
);

// Login route
router.post(
  '/login',
  [
    check('email', 'Please include a valid email or username')
      .not()
      .isEmpty(),
    check('password', 'Password is required').exists()
  ],
  async (req, res) => {
    console.log('Login route hit');
    console.log('Request body:', req.body);

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    console.log('Extracted email or username:', email);
    console.log('Extracted password:', password);

    try {
      // Check if user exists by email or username
      const user = await User.findOne({
        $or: [{ email: email }, { username: email }]
      });
      if (!user) {
        console.log('User not found');
        return res.status(400).json({ message: 'Invalid credentials' });
      }

      console.log('User found:', user);

      // Validate password
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        console.log('Password does not match');
        return res.status(400).json({ message: 'Invalid credentials' });
      }

      console.log('Password matched');

       // Generate JWT (Access Token)
       const payload = {
        user: {
          id: user.id
        }
      };

      try {
        const accessToken = jwt.sign(
          payload,
          process.env.JWT_SECRET,
          { expiresIn: '15m' } // Access token expires in 15 minutes
        );

        // Generate Refresh Token
        const refreshToken = jwt.sign(
          { id: user.id },
          process.env.REFRESH_TOKEN_SECRET,
          { expiresIn: '7d' } // Refresh token expires in 7 days
        );

        console.log('JWT and Refresh Token generated successfully');
        console.log('Sending response with tokens');
        res.json({ 
          accessToken, 
          refreshToken, 
          user: { id: user.id, name: user.name, email: user.email },
          message: 'Login successful' 
        });
      } catch (error) {
        console.error('Unexpected error:', error);
        res.status(500).json({ message: 'Unexpected error occurred' });
      }
    } catch (err) {
      console.error(err.message);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// Refresh Token route
router.post('/refresh-token', async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(401).json({ message: 'Refresh Token is required' });
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const newAccessToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '15m', // Token expires in 15 minutes
    });

    res.json({ token: newAccessToken });
  } catch (error) {
    console.error('Error refreshing token:', error);
    res.status(403).json({ message: 'Invalid refresh token' });
  }
});

// New route to get user data
router.get('/user', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
