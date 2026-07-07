// Dynamic API configuration based on environment
const getApiBaseUrl = () => {
  // Check if VITE_API_BASE_URL is set (for Vercel/local dev with env var)
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }

  // Detect environment and set appropriate URL
  const hostname = window.location.hostname;
  
  // Production on Vercel
  if (hostname === 'localcab.vercel.app') {
    return 'https://localcab.onrender.com/api';
  }
  
  // Local development
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return 'http://localhost:8080/api';
  }

  // Default fallback
  return 'http://localhost:8080/api';
};

export const API_BASE_URL = getApiBaseUrl();
