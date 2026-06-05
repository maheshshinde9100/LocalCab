import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

function getTokenForRequest(url) {
  if (url.includes('/admin/') || url.includes('/auth/admin')) {
    return localStorage.getItem('adminToken');
  }
  if (url.includes('/riders/') || url.includes('/bookings/rider/') || url.includes('razorpay')) {
    return localStorage.getItem('riderToken');
  }
  if (url.includes('/drivers/me') || url.includes('/bookings/me') || url.includes('/status') || url.includes('/location')) {
    return localStorage.getItem('token');
  }
  return localStorage.getItem('riderToken') || localStorage.getItem('token') || localStorage.getItem('adminToken');
}

api.interceptors.request.use(
  (config) => {
    const url = config.url || '';
    const token = getTokenForRequest(url);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Driver APIs
export const driverAPI = {
  register: (data) => api.post('/drivers/register', data),
  login: (data) => api.post('/auth/driver/login', data),
  getAvailable: (query) => api.get(`/drivers/available?query=${query}`),
  getMyProfile: () => api.get('/drivers/me'),
  getProfile: (driverId) => api.get(`/drivers/${driverId}`),
  updateAvailability: (driverId, available) =>
    api.patch(`/drivers/${driverId}/availability?available=${available}`),
  updateProfile: (driverId, data) =>
    api.put(`/drivers/${driverId}/profile`, data),
  updateLocation: (driverId, data) =>
    api.put(`/drivers/${driverId}/location`, data),
};

// Rider APIs
export const riderAPI = {
  register: (data) => api.post('/riders/register', data),
  login: (data) => api.post('/riders/login', data),
  getMyProfile: () => api.get('/riders/me'),
  getProfile: (riderId) => api.get(`/riders/profile/${riderId}`),
  updateLocation: (riderId, data) =>
    api.put(`/riders/profile/${riderId}/location`, data),
};

// Booking APIs
export const bookingAPI = {
  create: (data) => api.post('/bookings', data),
  getMyBookings: () => api.get('/bookings/me'),
  getMyRiderBookings: () => api.get('/bookings/rider/me'),
  getBookingsByRiderId: (riderId) => api.get(`/bookings/rider/${riderId}`),
  getBookingById: (bookingId) => api.get(`/bookings/${bookingId}`),
  updateStatus: (bookingId, status, cancellationReason) =>
    api.patch(`/bookings/${bookingId}/status`, { status, cancellationReason }),
  cancelByRider: (bookingId, riderId, cancellationReason) =>
    api.patch(`/bookings/${bookingId}/cancel/${riderId}`, { cancellationReason }),
  createRazorpayOrder: (bookingId) => api.post(`/bookings/${bookingId}/razorpay-order`),
  verifyRazorpayPayment: (bookingId, razorpayPaymentId, razorpaySignature) =>
    api.post(`/bookings/${bookingId}/razorpay-verify`, { razorpayPaymentId, razorpaySignature }),
  getPublicConfig: () => api.get('/bookings/config'),
  updateLocation: (bookingId, latitude, longitude) =>
    api.patch(`/bookings/${bookingId}/location?latitude=${latitude}&longitude=${longitude}`),
};

// Rating APIs
export const ratingAPI = {
  create: (data) => api.post('/ratings', data),
  getDriverRatings: (driverId) => api.get(`/ratings/driver/${driverId}`),
  getDriverRatingSummary: (driverId) => api.get(`/ratings/driver/${driverId}/summary`),
};

// Admin APIs
export const adminAPI = {
  login: (data) => api.post('/auth/admin/login', data),
  getDrivers: (page = 0, size = 20) =>
    api.get(`/admin/drivers?page=${page}&size=${size}`),
  getPendingDrivers: () => api.get('/admin/drivers/pending'),
  getDriver: (driverId) => api.get(`/admin/drivers/${driverId}`),
  verifyDriver: (driverId) => api.post(`/admin/drivers/${driverId}/verify`),
  blockDriver: (driverId) => api.post(`/admin/drivers/${driverId}/block`),
  getBookings: (page = 0, size = 20) =>
    api.get(`/admin/bookings?page=${page}&size=${size}`),
  getBooking: (bookingId) => api.get(`/admin/bookings/${bookingId}`),
  getRiders: () => api.get('/admin/riders'),
  getStats: () => api.get('/admin/stats'),
};

// AI APIs
export const aiAPI = {
  suggestFare: (data) => api.post('/ai/suggest-fare', data),
};

export default api;
