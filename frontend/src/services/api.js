import axios from 'axios';

const API_URL = 'http://localhost:5000/api'; // Adjust this URL to match your backend

const api = axios.create({
  baseURL: API_URL,
});

// Debug: Log configuration
console.log('API Service initialized with base URL:', API_URL);

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('userToken');
    if (token) {
      config.headers['Authorization'] = token; //token is stored with bearer prefix
    }
    // Debug: Log outgoing request
    console.log('Outgoing Request:', {
      method: config.method.toUpperCase(),
      url: config.url,
      headers: config.headers,
      data: config.data,
    });
    return config;
  },
  (error) => {
    // Debug: Log request error
    console.error('Request Error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for debugging
api.interceptors.response.use(
  (response) => {
    // Debug: Log response
    console.log('Response:', {
      status: response.status,
      statusText: response.statusText,
      data: response.data,
    });
    return response;
  },
  (error) => {
    // Debug: Log response error
    console.error('Response Error:', {
      message: error.message,
      response: error.response ? {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data,
      } : 'No response',
    });
    return Promise.reject(error);
  }
);

const apiService = {
  setAuthToken: (token) => {
    if (token) {
      const fullToken = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
      localStorage.setItem('userToken', fullToken);
      api.defaults.headers.common['Authorization'] = fullToken;
      // Debug: Log token set
      console.log('Auth token set');
    } else {
      localStorage.removeItem('userToken');
      delete api.defaults.headers.common['Authorization'];
      // Debug: Log token removal
      console.log('Auth token removed');
    }
  },

  register: async (userData) => {
    try {
      // Debug: Log registration attempt
      console.log('Attempting registration with data:', userData);
      const response = await api.post('/auth/register', userData);
      // Debug: Log successful registration
      console.log('Registration successful:', response.data);
      return response.data;
    } catch (error) {
      // Debug: Log registration error
      console.error('Registration failed:', error);
      throw error.response ? error.response.data : error.message;
    }
  },

  login: async (email, password) => {
    try {
      // Debug: Log login attempt
      console.log('Attempting login for email:', email);
      const response = await api.post('/auth/login', { email, password });
      if (response.data.token) {
        apiService.setAuthToken(response.data.token);
        // Debug: Log successful login
        console.log('Login successful');
      }
      return response.data;
    } catch (error) {
      // Debug: Log login error
      console.error('Login failed:', error);
      throw error.response ? error.response.data : error.message;
    }
  },

  getUserData: async () => {
    try {
      // Debug: Log user data fetch attempt
      console.log('Fetching user data');
      const response = await api.get('/auth/user');
      // Debug: Log successful user data fetch
      console.log('User data fetched successfully');
      return response.data;
    } catch (error) {
      // Debug: Log user data fetch error
      console.error('Failed to fetch user data:', error);
      throw error.response ? error.response.data : error.message;
    }
  },

  logout: () => {
    // Debug: Log logout
    console.log('Logging out user');
    apiService.setAuthToken(null);
  },

  //method to check if the token is present and valid
  isAuthenticated: () => {
    const token = localStorage.getItem('userToken');
    return!!token; //Returns true if token exists, false otherwise
  },

  //method to get the token (if needed elsewhere in the app)
  getToken: () => {
    return localStorage.getItem('userToken');
  },
  // Add more API methods here as needed

  // Playlist methods
  createPlaylist: async (playlistData) => {
    try {
      const response = await api.post('/playlists', playlistData);
      return response.data;
    } catch (error) {
      console.error('Failed to create playlist:', error);
      throw error.response ? error.response.data : error.message;
    }
  },

  getUserPlaylists: async () => {
    try {
      const response = await api.get('/playlists');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch user playlists:', error);
      throw error.response ? error.response.data : error.message;
    }
  },

  getPlaylist: async (playlistId) => {
    try {
      const response = await api.get(`/playlists/${playlistId}`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch playlist:', error);
      throw error.response ? error.response.data : error.message;
    }
  },

  updatePlaylist: async (playlistId, updateData) => {
    try {
      console.log(`Attempting to update playlist ${playlistId} with data:`, updateData);
      const response = await api.put(`/playlists/${playlistId}`, updateData);
      console.log(`Successfully updated playlist ${playlistId}:`, response.data);
      return response.data;
    } catch (error) {
      console.error(`Failed to update playlist ${playlistId}:`, error);
      if (error.response) {
        console.error('Server responded with:', error.response.data);
      } else if (error.request) {
        console.error('No response received:', error.request);
      } else {
        console.error('Error setting up request:', error.message);
      }
      throw error.response ? error.response.data : error.message;
    }
  },

  deletePlaylist: async (playlistId) => {
    try {
      const response = await api.delete(`/playlists/${playlistId}`);
      return response.data;
    } catch (error) {
      console.error('Failed to delete playlist:', error);
      throw error.response ? error.response.data : error.message;
    }
  },

  testAuth: async () => {
    try {
      const response = await api.get('/test-auth');
      console.log('Auth test successful:', response.data);
      return response.data;
    } catch (error) {
      console.error('Auth test failed:', error);
      throw error.response ? error.response.data : error.message;
    }
  },

  getAllSongs: async () => {
    try {
      const response = await api.get('/songs');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch songs:', error);
      throw error.response ? error.response.data : error.message;
    }
  },

  addSongToPlaylist: async (playlistId, songId) => {
    try {
      const response = await api.post(`/playlists/${playlistId}/songs`, { songId });
      return response.data;
    } catch (error) {
      console.error('Failed to add song to playlist:', error);
      throw error.response ? error.response.data : error.message;
    }
  },

  removeSongFromPlaylist: async (playlistId, songId) => {
    try {
      const response = await api.delete(`/playlists/${playlistId}/songs/${songId}`);
      return response.data;
    } catch (error) {
      console.error('Failed to remove song from playlist:', error);
      throw error.response ? error.response.data : error.message;
    }
  },
};

export default apiService;