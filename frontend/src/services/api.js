// Note: 'api' is assumed to be an Axios instance available in the broader scope
// createErrorObject is assumed to be defined or imported elsewhere
import axios from 'axios';

const API_URL = 'http://localhost:5000/api'; // Adjust this URL to match your backend
console.log('api.js loaded');
const api = axios.create({
  baseURL: API_URL,
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    if (error.response.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({resolve, reject});
        }).then(token => {
          originalRequest.headers['Authorization'] = 'Bearer ' + token;
          return api(originalRequest);
        }).catch(err => {
          return Promise.reject(err);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      return new Promise((resolve, reject) => {
        const refreshToken = localStorage.getItem('refreshToken');
        api.post('/auth/refresh-token', { refreshToken })
          .then(({data}) => {
            localStorage.setItem('accessToken', data.accessToken);
            api.defaults.headers.common['Authorization'] = 'Bearer ' + data.accessToken;
            originalRequest.headers['Authorization'] = 'Bearer ' + data.accessToken;
            processQueue(null, data.accessToken);
            resolve(api(originalRequest));
          })
          .catch((err) => {
            processQueue(err, null);
            reject(err);
          })
          .finally(() => {
            isRefreshing = false;
          });
      });
    }

    return Promise.reject(error);
  }
);

const createErrorObject = (message, statusCode, details = null) => ({
  message,
  statusCode,
  details,
});

export const getPaginatedSongs = async (page = 1, limit = 10, search = '', sortBy = 'title', sortOrder = 'asc') => {
  try {
    console.log(`Calling API: ${API_URL}/songs?page=${page}&limit=${limit}&search=${encodeURIComponent(search)}&sortBy=${sortBy}&sortOrder=${sortOrder}`);
    const response = await api.get(`/songs`, {
      params: {
        page,
        limit,
        search,
        sortBy,
        sortOrder
      }
    });
    console.log('API response:', response.data);
    return response.data;
  } catch (error) {
    console.error('API error:', error);
    if (error.response) {
      console.error('Error response:', error.response.data);
      throw new Error(`Server error: ${error.response.status} - ${error.response.data.message || 'Unknown error'}`);
    } else if (error.request) {
      console.error('No response received:', error.request);
      throw new Error('Network error: Unable to reach the server. Please check your internet connection and try again.');
    } else {
      console.error('Error setting up request:', error.message);
      throw new Error(`Request setup error: ${error.message}`);
    }
  }
};

const reorderPlaylistSongs = async (playlistId, songIds) => {
  try {
    console.log('Reordering playlist songs:', { playlistId, songIds });
    const response = await api.put(`/playlists/${playlistId}/reorder`, { songIds });
    console.log('Reorder response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error reordering playlist songs:', error);
    throw error.response ? error.response.data : error;
  }
};

const apiService = {
  getPaginatedSongs,
  
  setAuthToken: (accessToken, refreshToken) => {
    if (accessToken && refreshToken) {
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
      console.log('Auth tokens set');
    } else {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      delete api.defaults.headers.common['Authorization'];
      console.log('Auth tokens removed');
    }
  },

  register: async (userData) => {
    try {
      console.log('Attempting registration with data:', userData);
      const response = await api.post('/auth/register', userData);
      console.log('Registration successful:', response.data);
      if (!response.data.accessToken || !response.data.refreshToken) {
        throw new Error('No token received from server');
      }
      apiService.setAuthToken(response.data.accessToken, response.data.refreshToken);
      return response.data;
    } catch (error) {
      console.error('Registration failed:', error);
      if (error.response) {
        console.error('Server responded with:', error.response.data);
        throw createErrorObject(
          error.response.data.message || 'Failed to Register. Please try again.',
          error.response.status,
          error.response.data
        );
      } else if (error.request) {
        console.error('No response received:', error.request);
        throw createErrorObject('No response from server. Please try again.', 500);
      } else {
        console.error('Error setting up request:', error.message);
        throw createErrorObject('Error setting up request. Please try again.', 500);
      }
    }
  },
  
  login: async (email, password) => {
    console.log('apiService: login function called');
    console.log(`apiService: Attempting to reach ${API_URL}/auth/login`);
    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        console.log('apiService: Login request timed out');
        reject(new Error('Login request timed out'));
      }, 10000); // 10 seconds timeout
  
      api.post('/auth/login', { email, password })
        .then(response => {
          clearTimeout(timeoutId);
          console.log('apiService: Received response:', response);
          if (response.data.accessToken && response.data.refreshToken) {
            apiService.setAuthToken(response.data.accessToken, response.data.refreshToken);
            console.log('apiService: Login successful');
            resolve(response.data);
          } else {
            console.log('apiService: Login failed - no tokens in response');
            reject(new Error('Login response did not contain expected tokens'));
          }
        })
        .catch(error => {
          clearTimeout(timeoutId);
          console.error('apiService: Login failed:', error);
          if (error.response) {
            console.log('apiService: Server responded with error:', error.response.data);
            reject(createErrorObject(
              error.response.data.message || 'Invalid credentials',
              error.response.status,
              error.response.data
            ));
          } else if (error.request) {
            console.log('apiService: No response received from server');
            reject(createErrorObject('No response from server. Please try again.', 500));
          } else {
            console.log('apiService: Request setup error:', error.message);
            reject(createErrorObject(error.message || 'Error setting up request. Please try again.', 500));
          }
        });
    });
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
      throw createErrorObject(
        'Failed to fetch user data. Please try again.',
        error.response?.status || 500,
        error.response?.data
      );
    }
  },

  logout: () => {
    console.log('Logging out user');
    apiService.setAuthToken(null, null);
  },

  //method to check if the token is present and valid
  isAuthenticated: () => {
    const token = localStorage.getItem('userToken');
    return !!token; //Returns true if token exists, false otherwise
  },

  //method to get the token (if needed elsewhere in the app)
  getToken: () => {
    return localStorage.getItem('userToken');
  },

  // Playlist methods
  createPlaylist: async (playlistData) => {
    try {
      const response = await api.post('/playlists', playlistData);
      return response.data;
    } catch (error) {
      console.error('Failed to create playlist:', error);
      throw createErrorObject(
        'Failed to create playlist. Please try again.',
        error.response?.status,
        error.response?.data
      );
    }
  },

  getUserPlaylists: async () => {
    try {
      const response = await api.get('/playlists');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch user playlists:', error);
      throw createErrorObject(
        'Failed to fetch user playlists, Please try again.',
        error.response?.status,
        error.response?.data
      );
    }
  },

  getPlaylist: async (playlistId) => {
    try {
      const response = await api.get(`/playlists/${playlistId}`);
      console.log('API getPlaylist response:', JSON.stringify(response.data, null, 2));
      return response.data;
    } catch (error) {
      console.error('Failed to fetch playlist:', error);
      throw createErrorObject(
        'Failed to fetch playlist. Please try again.',
        error.response?.status,
        error.response?.data
      );
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
      throw createErrorObject(
        'Failed to update playlist. Please try again.',
        error.response?.status,
        error.response?.data
      );
    }
  },

  reorderPlaylistSongs,

  deletePlaylist: async (playlistId) => {
    try {
      const response = await api.delete(`/playlists/${playlistId}`);
      return response.data;
    } catch (error) {
      console.error('Failed to delete playlist:', error);
      throw createErrorObject(
        'Failed to delete playlist. Please try again.',
        error.response?.status,
        error.response?.data
      );
    }
  },

  testAuth: async () => {
    try {
      const response = await api.get('/test-auth');
      console.log('Auth test successful:', response.data);
      return response.data;
    } catch (error) {
      console.error('Auth test failed:', error);
      throw createErrorObject(
        'Auth test failed. Please try again.',
        error.response?.status,
        error.response?.data
      );
    }
  },

  getAllSongs: async (page = 1, limit = 10) => {
    try {
      console.log(`Fetching songs: page ${page}, limit ${limit}`);
      const response = await api.get('/songs', {
        params: { page, limit }
      });
      console.log('getAllSongs response:', JSON.stringify(response.data, null, 2));
      if (!response.data || !Array.isArray(response.data.songs)) {
        console.error('getAllSongs: response.data.songs is not an array', response.data);
        throw new Error('Invalid response format');
      }
      return response.data;
    } catch (error) {
      console.error('Failed to fetch songs:', error);
      throw error; // Rethrow the error to be handled by the caller
    }
  },

  addSongToPlaylist: async (playlistId, songId) => {
    try {
      const response = await api.post(`/playlists/${playlistId}/songs`, { songId });
      if (response.data.message === 'Song already in playlist') {
        throw new Error('Song already exists in the playlist');
      }
      return response.data;
    } catch (error) {
      console.error('Failed to add song to playlist:', error);
      if (error.response && error.response.status === 400) {
        throw new Error('Song already exists in the playlist');
      }
      throw createErrorObject(
        error.message || 'Failed to add song to playlist. Please try again.',
        error.response?.status,
        error.response?.data
      );
    }
  },

  removeSongFromPlaylist: async (playlistId, songId) => {
    try {
      console.log(`Removing song ${songId} from playlist ${playlistId}`);
      const response = await api.delete(`/playlists/${playlistId}/songs/${songId}`);
      console.log('Song removed successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('Failed to remove song from playlist:', error);
      throw createErrorObject(
        'Failed to remove song from playlist. Please try again.',
        error.response?.status,
        error.response?.data
      );
    }
  }
}; 

export default apiService;