import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Driver APIs
export const driverAPI = {
  register: (data) => api.post('/drivers/register', data),
  login: (data) => api.post('/auth/driver/login', data),
  getAvailable: (pincode) => api.get(`/drivers/available?pincode=${pincode}`),
  updateAvailability: (driverId, available) => 
    api.patch(`/drivers/${driverId}/availability?available=${available}`),
  updateProfile: (driverId, data) => 
    api.put(`/drivers/${driverId}/profile`, data),
};

// Booking APIs
export const bookingAPI = {
  create: (data) => api.post('/bookings', data),
  getMyBookings: () => api.get('/bookings/me'),
  updateStatus: (bookingId, status) => 
    api.patch(`/bookings/${bookingId}/status`, { status }),
};

// Rating APIs
export const ratingAPI = {
  create: (data) => api.post('/ratings', data),
  getDriverRatings: (driverId) => api.get(`/ratings/driver/${driverId}`),
  getDriverRatingSummary: (driverId) => api.get(`/ratings/driver/${driverId}/summary`),
};

// Admin APIs
export const adminAPI = {
  getDrivers: (page = 0, size = 20) => 
    api.get(`/admin/drivers?page=${page}&size=${size}`),
  getDriver: (driverId) => api.get(`/admin/drivers/${driverId}`),
  blockDriver: (driverId) => api.post(`/admin/drivers/${driverId}/block`),
  unblockDriver: (driverId) => api.post(`/admin/drivers/${driverId}/unblock`),
  getBookings: (page = 0, size = 20) => 
    api.get(`/admin/bookings?page=${page}&size=${size}`),
  getBooking: (bookingId) => api.get(`/admin/bookings/${bookingId}`),
  getStats: () => api.get('/admin/stats'),
};

export default api;
