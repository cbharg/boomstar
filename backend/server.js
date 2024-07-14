const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const playlistRoutes = require('./routes/playlists');
const songRoutes = require('./routes/songs');
const authMiddleware = require('./middleware/authMiddleware');
const authRoutes = require('./routes/auth');

require('dotenv').config();
require('./models/Song');
require('./models/Playlist');

console.log('MONGODB_URI:', process.env.MONGODB_URI);

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use('/api/playlists', playlistRoutes);
app.use('/api/songs', songRoutes);
app.use('/api/auth',authRoutes);

// Add this new route for testing authentication
app.get('/api/test-auth', authMiddleware, (req, res) => {
  res.json({ message: 'You are authenticated!', userId: req.user.id });
});

// Connect to MongoDB (you'll need to set up your MONGODB_URI in .env file)
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected'))
.catch(err => {
  console.error('MongoDB connection error:', err);
  console.error('MongoDB URI: process.env.MONGODB_URI');
  console.error('Full error object:', JSON.stringify(err,null, 2));
});

// Basic route
app.get('/', (req, res) => {
  res.send('Fanrise Music Platform API');
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
