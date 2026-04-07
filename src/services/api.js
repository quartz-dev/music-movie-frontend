import axios from 'axios';

// Backend base URL
const API_BASE_URL = 'https://localhost:7044/api';

const inFlightRequests = new Map();
const recommendationResponseCache = new Map();
const RECOMMENDATION_CACHE_PREFIX = 'recommendation-cache:';

const persistRecommendationCache = (key, value) => {
    if (!key || typeof window === 'undefined') return;
    try {
        window.sessionStorage.setItem(`${RECOMMENDATION_CACHE_PREFIX}${key}`, JSON.stringify(value));
    } catch {
        // Ignore storage failures (quota/private mode)
    }
};

const readPersistedRecommendationCache = (key) => {
    if (!key || typeof window === 'undefined') return null;
    try {
        const raw = window.sessionStorage.getItem(`${RECOMMENDATION_CACHE_PREFIX}${key}`);
        if (!raw) return null;
        return JSON.parse(raw);
    } catch {
        return null;
    }
};

const requestOnce = (key, requestFn) => {
    if (inFlightRequests.has(key)) {
        return inFlightRequests.get(key);
    }

    const request = Promise.resolve()
        .then(requestFn)
        .finally(() => {
            inFlightRequests.delete(key);
        });

    inFlightRequests.set(key, request);
    return request;
};

const cacheRecommendationResponse = (key, responseData) => {
    if (key) {
        recommendationResponseCache.set(key, responseData);
        persistRecommendationCache(key, responseData);
    }
    return responseData;
};

const getCachedRecommendationResponse = (key) => {
    if (!key) return null;
    const inMemory = recommendationResponseCache.get(key) ?? null;
    if (inMemory) return inMemory;

    const persisted = readPersistedRecommendationCache(key);
    if (persisted) recommendationResponseCache.set(key, persisted);
    return persisted ?? null;
};

// Axios instance oluştur
const apiClient = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true, // ÇOK ÖNEMLİ: Cookie'lerin otomatik gidip gelmesini sağlar
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor'ı kaldırdık!
// Çünkü artık token'ı localStorage'dan okuyup 'Authorization: Bearer' 
// eklememize gerek yok. Tarayıcı cookie'leri otomatik olarak kendi gönderecek.

// Response interceptor - hata yönetimi
apiClient.interceptors.response.use(
    (response) => response,
    (error) => Promise.reject(error)
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

    // Movie Search (Recommendations endpoint)
    searchMoviesFromRecommendations: async (query) => {
        try {
            const response = await requestOnce(`recommendations:${query}`, () => apiClient.get(`/Recommendations`, {
                params: {
                    movieTitle: query,
                },
            }));

            const data = response.data;
            if (Array.isArray(data)) return cacheRecommendationResponse(`recommendations:${query}`, data);
            if (Array.isArray(data?.data)) return cacheRecommendationResponse(`recommendations:${query}`, data.data);
            if (Array.isArray(data?.items)) return cacheRecommendationResponse(`recommendations:${query}`, data.items);
            if (Array.isArray(data?.results)) return cacheRecommendationResponse(`recommendations:${query}`, data.results);
            return cacheRecommendationResponse(`recommendations:${query}`, data);
        } catch (error) {
            console.error('Recommendations search error:', error);
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
            const response = await requestOnce(`mood-songs:${movieId}`, () => apiClient.get(`/movies/${movieId}/mood-songs`));
            return cacheRecommendationResponse(`mood-songs:${movieId}`, response.data);
        } catch (error) {
            console.error('Mood and songs error:', error);
            throw error;
        }
    },

    getCachedRecommendationResponse: (key) => getCachedRecommendationResponse(key),

    cacheRecommendationResponse: (key, responseData) => cacheRecommendationResponse(key, responseData),

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
    getUserPlaylists: async (userId, getPrivate = true) => {
        try {
            const response = userId
                ? await apiClient.get(`/playlists/getbyuser/${userId}`, {
                    params: {
                        userId,
                        getPrivate,
                    },
                })
                : await apiClient.get(`/playlists`, {
                    params: { getPrivate },
                });

            return response.data?.data ?? response.data;
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
            const response = await apiClient.post(`/playlists`, {
                movieId,
                playlistName
            });
            return response.data;
        } catch (error) {
            console.error('Create playlist error:', error);
            throw error;
        }
    },

    createPlaylist: async (payload) => {
        try {
            const response = await apiClient.post(`/playlists`, payload);
            if (response.data?.success === false) {
                throw new Error((response.data?.messages || []).join(' ') || 'Create playlist failed');
            }
            return response.data;
        } catch (error) {
            console.error('Create playlist error:', error);
            throw error;
        }
    },

    // Endpoint for getting current authenticated user
    getUserProfile: async () => {
        try {
            // Tarayıcı bu isteğe cookie'yi otomatik ekleyecektir.
            const response = await apiClient
                .get(`/Users/me`)
                .catch(() => apiClient.get(`/Users/profile`))
                .catch(() => apiClient.get(`/user/profile`));
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
            // İstek başarılı olduğunda, backend 'Set-Cookie' header'ı dönecek 
            // ve tarayıcı cookie'yi kendi kendine kaydedecektir.
            const response = await apiClient.post(`/Users/login`, {
                email,
                password
            });
            return response.data;
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
            // İstek atıldığında backend'in mevcut session/cookie'yi silecek bir işlem yapması beklenir.
            const response = await apiClient.get(`/Users/logout`);
            return response.data;
        } catch (error) {
            console.error('Logout error:', error);
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