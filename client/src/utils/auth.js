export const auth = {
  getToken: () => localStorage.getItem('token'),
  setToken: (token) => localStorage.setItem('token', token),
  removeToken: () => localStorage.removeItem('token'),
  isAuthenticated: () => !!localStorage.getItem('token'),
  getDriverId: () => localStorage.getItem('driverId'),
  setDriverId: (id) => localStorage.setItem('driverId', id),
  removeDriverId: () => localStorage.removeItem('driverId'),
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('driverId');
    localStorage.removeItem('driverName');
    localStorage.removeItem('driverPhone');
  },
};
