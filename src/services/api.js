import axios from 'axios';

// Backend base URL
const API_BASE_URL = 'https://localhost:7044/api';

// Axios instance oluştur
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  // HTTPS sertifika hatalarını geliştirme ortamında ignore et
  // Production'da bunu kaldır!
});

// Request interceptor - tüm isteklere token eklemek için
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - hata yönetimi
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token geçersiz, logout yap
      localStorage.removeItem('authToken');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

// API Methods
const api = {
  // Movie Search
  searchMovies: async (query) => {
    try {
      const response = await apiClient.get(`/movies/search`, {
        params: { query }
      });
      return response.data;
    } catch (error) {
      console.error('Movie search error:', error);
      throw error;
    }
  },

  // Movie Detail
  getMovieDetail: async (movieId) => {
    try {
      const response = await apiClient.get(`/movies/${movieId}`);
      return response.data;
    } catch (error) {
      console.error('Movie detail error:', error);
      throw error;
    }
  },

  // Movie Mood Analysis & Song Recommendations
  getMovieMoodAndSongs: async (movieId) => {
    try {
      const response = await apiClient.get(`/movies/${movieId}/mood-songs`);
      return response.data;
    } catch (error) {
      console.error('Mood and songs error:', error);
      throw error;
    }
  },

  // Popular Movies
  getPopularMovies: async (page = 1) => {
    try {
      const response = await apiClient.get(`/movies/popular`, {
        params: { page }
      });
      return response.data;
    } catch (error) {
      console.error('Popular movies error:', error);
      throw error;
    }
  },

  // Movie Categories/Genres
  getCategories: async () => {
    try {
      const response = await apiClient.get(`/movies/categories`);
      return response.data;
    } catch (error) {
      console.error('Categories error:', error);
      throw error;
    }
  },

  // Movies by Category
  getMoviesByCategory: async (categoryId, page = 1) => {
    try {
      const response = await apiClient.get(`/movies/category/${categoryId}`, {
        params: { page }
      });
      return response.data;
    } catch (error) {
      console.error('Movies by category error:', error);
      throw error;
    }
  },

  // User Playlists
  getUserPlaylists: async () => {
    try {
      const response = await apiClient.get(`/playlists`);
      return response.data;
    } catch (error) {
      console.error('Playlists error:', error);
      throw error;
    }
  },

  // Top Public Playlists (most favorited)
  getTopPublicPlaylists: async (limit = 10) => {
    try {
      const response = await apiClient.get(`/playlists/public/top`, {
        params: { limit }
      });
      return response.data;
    } catch (error) {
      console.error('Top public playlists error:', error);
      throw error;
    }
  },

  // Create Playlist from Movie
  createPlaylistFromMovie: async (movieId, playlistName) => {
    try {
      const response = await apiClient.post(`/playlists/create`, {
        movieId,
        playlistName
      });
      return response.data;
    } catch (error) {
      console.error('Create playlist error:', error);
      throw error;
    }
  },

  // Endpoint for getting current authenticated user
  getUserProfile: async () => {
    try {
      // Backendde '/Users/profile' veya benzeri olabilir, ama genellikle '/Users/me' olur .NET'te eğer profile yoksa.
      // Eger calismazsa diye hata firlatmiyor da bazi fallback ler yapalim
      const response = await apiClient.get(`/Users/profile`).catch(() => apiClient.get(`/user/profile`));
      return response.data;
    } catch (error) {
      console.error('User profile error:', error);
      throw error;
    }
  },

  // User Recent Searches
  getUserRecentSearches: async () => {
    try {
      const response = await apiClient.get(`/user/recent-searches`);
      return response.data;
    } catch (error) {
      console.error('Recent searches error:', error);
      throw error;
    }
  },

  // Save Movie Search
  saveMovieSearch: async (movieId, movieTitle) => {
    try {
      const response = await apiClient.post(`/user/save-search`, {
        movieId,
        movieTitle
      });
      return response.data;
    } catch (error) {
      console.error('Save search error:', error);
      throw error;
    }
  },

  // Update User Settings
  updateUserSettings: async (settings) => {
    try {
      const response = await apiClient.put(`/user/settings`, settings);
      return response.data;
    } catch (error) {
      console.error('Update settings error:', error);
      throw error;
    }
  },

  // Auth - Login
  login: async (email, password) => {
    try {
      const response = await apiClient.post(`/Users/login`, {
        email,
        password
      });
      const data = response.data;
      const token = data.token || data?.data?.token || data.accessToken || data?.data?.accessToken;
      if (token) {
        localStorage.setItem('authToken', token);
      }
      return data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

  // Auth - Register
  register: async (userData) => {
    try {
      const response = await apiClient.post(`/Users/register`, userData);
      return response.data;
    } catch (error) {
      console.error('Register error:', error);
      throw error;
    }
  },

  // Auth - Logout
  logout: async () => {
    try {
      const response = await apiClient.get(`/Users/logout`);
      localStorage.removeItem('authToken');
      return response.data;
    } catch (error) {
      console.error('Logout error:', error);
      localStorage.removeItem('authToken');
      throw error;
    }
  },

  // Forgot Password
  forgotPassword: async (email) => {
    try {
      const response = await apiClient.post(`/Users/forgotpassword`, {
        email
      });
      return response.data;
    } catch (error) {
      console.error('Forgot password error:', error);
      throw error;
    }
  },

  // Reset Password
  resetPassword: async (userId, token, newPassword) => {
    try {
      const response = await apiClient.post(
        `/Users/resetpassword?userId=${userId}&token=${encodeURIComponent(token)}`,
        { password: newPassword }
      );
      return response.data;
    } catch (error) {
      console.error('Reset password error:', error);
      throw error;
    }
  }
};

export default api;
