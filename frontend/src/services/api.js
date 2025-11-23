import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL;
console.log('🚀 [API] API base URL:', API_BASE_URL);

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 seconds
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Add language preference
    const language = localStorage.getItem('preferredLanguage') || 'urdu';
    config.headers['Accept-Language'] = language;
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle different error types
    if (error.response) {
      const { status, data } = error.response;
      
      switch (status) {
        case 401:
          // Unauthorized - clear token and redirect to login
          localStorage.removeItem('authToken');
          localStorage.removeItem('user');
          window.location.href = '/login';
          break;
        case 429:
          // Rate limit exceeded
          throw new Error(data.message || 'Too many requests. Please try again later.');
        case 500:
          // Server error
          throw new Error(data.message || 'Server error. Please try again later.');
        default:
          throw new Error(data.message || 'An error occurred');
      }
    } else if (error.request) {
      // Network error
      throw new Error('Network error. Please check your internet connection.');
    } else {
      // Other errors
      throw new Error(error.message || 'An unexpected error occurred');
    }
    
    return Promise.reject(error);
  }
);

// API methods
export const authAPI = {
  requestOTP: (email) => api.post('/auth/request-otp', { email }),
  verifyOTP: (email, otp) => api.post('/auth/verify-otp', { email, otp }),
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (profileData) => api.put('/auth/profile', profileData),
};

export const chatAPI = {
  sendMessage: (content, type = 'text', language = 'urdu') => 
    api.post('/chat/send', { content, type, language }),
  getMessages: (params = {}) => 
    api.get('/chat/messages', { params }),
  getMessageById: (id) => 
    api.get(`/chat/messages/${id}`),
  clearMessages: () => 
    api.delete('/chat/messages'),
};

export const uploadAPI = {
  uploadImage: (formData) => 
    api.post('/upload/image', formData, {
      headers: { 
        'Content-Type': 'multipart/form-data',
      },
      timeout: 120000 // 2 minutes for AI processing
    }),
  uploadVoice: (formData) => 
    api.post('/upload/voice', formData, {
      headers: { 
        'Content-Type': 'multipart/form-data',
      },
      timeout: 120000 // 2 minutes for AI processing
    }),
  transcribeVoice: (formData) => 
    api.post('/upload/transcribe', formData, {
      headers: { 
        'Content-Type': 'multipart/form-data',
      },
      timeout: 60000 // 1 minute for transcription
    }),
};

// Health check
export const healthCheck = () => api.get('/health');

export default api;
