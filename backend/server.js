const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const playlistRoutes = require('./routes/playlists');
const songRoutes = require('./routes/songs');
const { protect } = require('./middleware/authMiddleware');
const authRoutes = require('./routes/auth');
const seedDatabase = require('./utils/databaseSeed');
const connectDB = require('./config/db');
const createIndexes = require('./utils/createIndexes');

require('dotenv').config();
require('./models/Song');
require('./models/Playlist');

console.log('MONGODB_URI:', process.env.MONGODB_URI);

const app = express();
const PORT = process.env.PORT || 5000;

connectDB()
  .then(() => {
    console.log('MongoDB connected');
    createIndexes();
    if (process.argv.includes('--seed')) {
      seedDatabase();
    }
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
    console.error('MongoDB URI:', process.env.MONGODB_URI);
    console.error('Full error object:', JSON.stringify(err, null, 2));
  });


app.use(cors());
app.use(express.json());
app.use('/api/playlists', playlistRoutes);
app.use('/api/songs', songRoutes);
app.use('/api/auth',authRoutes);

// Add this new route for testing authentication
app.get('/api/test-auth', protect, (req, res) => {
  res.json({ message: 'You are authenticated!', userId: req.user.id });
});

// Connect to MongoDB and seed if necessary
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('MongoDB connected');
  if (process.argv.includes('--seed')) {
    seedDatabase();
  }
})
.catch(err => {
  console.error('MongoDB connection error:', err);
  console.error('MongoDB URI:', process.env.MONGODB_URI);
  console.error('Full error object:', JSON.stringify(err, null, 2));
});

// Basic route
app.get('/', (req, res) => {
  res.send('Dumdum Platform API');
});
  
//Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({message: 'Something went wrong on the server'});
});

//start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

//test route
app.get('/api/test-user', protect, (req, res) => {
  console.log('Test-user route hit');
  console.log('User in request:', req.user);
  res.json({ 
    message: 'You are authenticated!', 
    userId: req.user ? req.user.id : 'No user ID',
    user: req.user || 'No user object'
  });
});