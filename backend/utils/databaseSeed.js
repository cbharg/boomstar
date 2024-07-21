const mongoose = require('mongoose');
const Song = require('../models/Song');
const User = require('../models/User'); // Assuming you have a User model

const sampleSongs = [
  { title: 'Bohemian Rhapsody', artist: 'Queen', album: 'A Night at the Opera', genre: 'Rock', duration: 355, releaseYear: 1975, audioUrl: 'https://example.com/bohemian-rhapsody.mp3', coverImageUrl: 'https://example.com/bohemian-rhapsody.jpg' },
  { title: 'Imagine', artist: 'John Lennon', album: 'Imagine', genre: 'Rock', duration: 183, releaseYear: 1971, audioUrl: 'https://example.com/imagine.mp3', coverImageUrl: 'https://example.com/imagine.jpg' },
  { title: 'Billie Jean', artist: 'Michael Jackson', album: 'Thriller', genre: 'Pop', duration: 294, releaseYear: 1983, audioUrl: 'https://example.com/billie-jean.mp3', coverImageUrl: 'https://example.com/billie-jean.jpg' },
  { title: 'Like a Rolling Stone', artist: 'Bob Dylan', album: 'Highway 61 Revisited', genre: 'Rock', duration: 369, releaseYear: 1965, audioUrl: 'https://example.com/like-a-rolling-stone.mp3', coverImageUrl: 'https://example.com/like-a-rolling-stone.jpg' },
  { title: 'Smells Like Teen Spirit', artist: 'Nirvana', album: 'Nevermind', genre: 'Rock', duration: 301, releaseYear: 1991, audioUrl: 'https://example.com/smells-like-teen-spirit.mp3', coverImageUrl: 'https://example.com/smells-like-teen-spirit.jpg' },
  { title: 'Bohemian wannabe', artist: 'Queen 2', album: 'A Night', genre: 'pebbles', duration: 55, releaseYear: 1974, audioUrl: 'https://example.com/bohemia.mp3', coverImageUrl: 'https://example.com/bohemian.jpg' },
  { title: 'Imagine mat karo', artist: 'John Bihari', album: 'No', genre: 'Pop', duration: 180, releaseYear: 1971, audioUrl: 'https://example.com/matkaro.mp3', coverImageUrl: 'https://example.com/mat.jpg' },
  { title: 'Billie Pant', artist: 'Michael Dutta', album: 'Thrill', genre: 'Pop', duration: 94, releaseYear: 1973, audioUrl: 'https://example.com/billie.mp3', coverImageUrl: 'https://example.com/billie.jpg' },
  { title: 'Rolling Stone', artist: 'Dylan Bhaiya', album: 'Highway', genre: 'stone', duration: 269, releaseYear: 1965, audioUrl: 'https://example.com/rolling-stone.mp3', coverImageUrl: 'https://example.com/rolling-stone.jpg' },
  { title: 'Smelly Cat', artist: 'Phoebe', album: 'Nevermind', genre: 'Coffee shop', duration: 501, releaseYear: 1997, audioUrl: 'https://example.com/friends.mp3', coverImageUrl: 'https://example.com/friends.jpg' },
  { title: 'Pant-2', artist: 'Micha Dutta', album: 'Sad', genre: 'Classic', duration: 924, releaseYear: 1993, audioUrl: 'https://example.com/pant-2.mp3', coverImageUrl: 'https://example.com/pants.jpg' },
  { title: 'Stoner', artist: 'Bhaiya ji', album: 'High-way', genre: 'bone', duration: 69, releaseYear: 2012, audioUrl: 'https://example.com/bone.mp3', coverImageUrl: 'https://example.com/stone.jpg' },
  { title: 'Cat', artist: 'be', album: 'mind', genre: 'Coffee', duration: 10, releaseYear: 1997, audioUrl: 'https://example.com/friends.mp3', coverImageUrl: 'https://example.com/friends.jpg' },
];

async function seedDatabase() {
  try {
    const count = await Song.estimatedDocumentCount();
    if (count === 0) {
      // Create a dummy user for the createdBy field
      const dummyUser = await User.findOne() || await new User({ username: 'seedUser', email: 'seed@example.com', password: 'password123' }).save();

      for (let song of sampleSongs) {
        const newSong = new Song({
          ...song,
          createdBy: dummyUser._id
        });
        await newSong.save();
        console.log(`Added: ${song.title}`);
      }
      console.log('Sample songs have been added to the database.');
    } else {
      console.log('Database already contains songs. Skipping seed process.');
    }
  } catch (error) {
    console.error('Error seeding database:', error);
  }
}

module.exports = seedDatabase;