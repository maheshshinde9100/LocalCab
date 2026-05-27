export const auth = {
  getToken: () => localStorage.getItem('token'),
  setToken: (token) => localStorage.setItem('token', token),
  removeToken: () => localStorage.removeItem('token'),
  isAuthenticated: () => !!localStorage.getItem('token'),
  getDriverId: () => localStorage.getItem('driverId'),
  setDriverId: (id) => localStorage.setItem('driverId', id),
  removeDriverId: () => localStorage.removeItem('driverId'),
  
  // Rider (Client) Session
  getRiderToken: () => localStorage.getItem('riderToken'),
  setRiderToken: (token) => localStorage.setItem('riderToken', token),
  removeRiderToken: () => localStorage.removeItem('riderToken'),
  isRiderAuthenticated: () => !!localStorage.getItem('riderToken'),
  getRiderId: () => localStorage.getItem('riderId'),
  setRiderId: (id) => localStorage.setItem('riderId', id),
  removeRiderId: () => localStorage.removeItem('riderId'),
  
  // Admin Session
  isAdminAuthenticated: () => !!localStorage.getItem('adminToken'),
  getAdminToken: () => localStorage.getItem('adminToken'),
  setAdminToken: (token) => localStorage.setItem('adminToken', token),

  logout: () => {
    localStorage.clear();
  },
};
