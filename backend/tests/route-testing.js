const axios = require('axios');

const BASE_URL = 'http://localhost:5000'; // Adjust if your server runs on a different port

async function testAuth() {
  console.log('Testing Authentication...');
  
  // Test registration with valid data
  try {
    const regResponse = await axios.post(`${BASE_URL}/api/auth/register`, {
      username: 'testuser',
      email: 'testuser@example.com',
      password: 'TestPass123!'
    });
    console.log('Registration successful:', regResponse.data);
  } catch (error) {
    console.error('Registration failed:', error.response ? error.response.data : error.message);
  }

  // Test registration with invalid data
  try {
    await axios.post(`${BASE_URL}/api/auth/register`, {
      username: 'te',
      email: 'invalid-email',
      password: 'weak'
    });
  } catch (error) {
    console.log('Expected registration failure:', error.response.data);
  }

  // Test login with valid credentials
  try {
    const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
      email: 'testuser@example.com',
      password: 'TestPass123!'
    });
    console.log('Login successful:', loginResponse.data);
    return loginResponse.data.token; // Return token for use in other tests
  } catch (error) {
    console.error('Login failed:', error.response ? error.response.data : error.message);
  }

  // Test login with invalid credentials
  try {
    await axios.post(`${BASE_URL}/api/auth/login`, {
      email: 'testuser@example.com',
      password: 'WrongPassword'
    });
  } catch (error) {
    console.log('Expected login failure:', error.response.data);
  }
}

async function testSongs(token) {
  console.log('Testing Song Routes...');

  let createdSongId;

  // Test creating a song with valid data
  try {
    const createResponse = await axios.post(`${BASE_URL}/api/songs`, {
      title: 'Test Song',
      artist: 'Test Artist',
      album: 'Test Album',
      year: 2023
    }, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    console.log('Song creation successful:', createResponse.data);
    createdSongId = createResponse.data._id;
  } catch (error) {
    console.error('Song creation failed:', error.response ? error.response.data : error.message);
  }

  // Test creating a song with invalid data
  try {
    await axios.post(`${BASE_URL}/api/songs`, {
      title: '',
      artist: ''
    }, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
  } catch (error) {
    console.log('Expected song creation failure:', error.response.data);
  }

  // Test getting all songs
  try {
    const getAllResponse = await axios.get(`${BASE_URL}/api/songs`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    console.log('Get all songs successful:', getAllResponse.data);
  } catch (error) {
    console.error('Get all songs failed:', error.response ? error.response.data : error.message);
  }

  // Test searching for a song
  try {
    const searchResponse = await axios.get(`${BASE_URL}/api/songs/search?query=Test`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    console.log('Song search successful:', searchResponse.data);
  } catch (error) {
    console.error('Song search failed:', error.response ? error.response.data : error.message);
  }

  // Test updating a song
  if (createdSongId) {
    try {
      const updateResponse = await axios.put(`${BASE_URL}/api/songs/${createdSongId}`, {
        title: 'Updated Test Song',
        artist: 'Updated Test Artist'
      }, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      console.log('Song update successful:', updateResponse.data);
    } catch (error) {
      console.error('Song update failed:', error.response ? error.response.data : error.message);
    }
  }

  // Test deleting a song
  if (createdSongId) {
    try {
      const deleteResponse = await axios.delete(`${BASE_URL}/api/songs/${createdSongId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      console.log('Song deletion successful:', deleteResponse.data);
    } catch (error) {
      console.error('Song deletion failed:', error.response ? error.response.data : error.message);
    }
  }
}

async function testPlaylists(token) {
  console.log('Testing Playlist Routes...');

  let createdPlaylistId;

  // Test creating a playlist with valid data
  try {
    const createResponse = await axios.post(`${BASE_URL}/api/playlists`, {
      name: 'Test Playlist',
      description: 'A test playlist'
    }, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    console.log('Playlist creation successful:', createResponse.data);
    createdPlaylistId = createResponse.data._id;
  } catch (error) {
    console.error('Playlist creation failed:', error.response ? error.response.data : error.message);
  }

  // Test creating a playlist with invalid data
  try {
    await axios.post(`${BASE_URL}/api/playlists`, {
      name: '',
      description: ''
    }, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
  } catch (error) {
    console.log('Expected playlist creation failure:', error.response.data);
  }

  // Test getting all playlists
  try {
    const getAllResponse = await axios.get(`${BASE_URL}/api/playlists`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    console.log('Get all playlists successful:', getAllResponse.data);
  } catch (error) {
    console.error('Get all playlists failed:', error.response ? error.response.data : error.message);
  }

  // Test updating a playlist
  if (createdPlaylistId) {
    try {
      const updateResponse = await axios.put(`${BASE_URL}/api/playlists/${createdPlaylistId}`, {
        name: 'Updated Test Playlist',
        description: 'An updated test playlist'
      }, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      console.log('Playlist update successful:', updateResponse.data);
    } catch (error) {
      console.error('Playlist update failed:', error.response ? error.response.data : error.message);
    }
  }

  // Test deleting a playlist
  if (createdPlaylistId) {
    try {
      const deleteResponse = await axios.delete(`${BASE_URL}/api/playlists/${createdPlaylistId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      console.log('Playlist deletion successful:', deleteResponse.data);
    } catch (error) {
      console.error('Playlist deletion failed:', error.response ? error.response.data : error.message);
    }
  }
}

async function runTests() {
  const token = await testAuth();
  if (token) {
    await testSongs(token);
    await testPlaylists(token);
  }
}

runTests();