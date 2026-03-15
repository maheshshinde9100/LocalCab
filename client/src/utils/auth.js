export const auth = {
  getToken: () => localStorage.getItem('token'),
  setToken: (token) => localStorage.setItem('token', token),
  removeToken: () => localStorage.removeItem('token'),
  isAuthenticated: () => !!localStorage.getItem('token'),
  getDriverId: () => localStorage.getItem('driverId'),
  setDriverId: (id) => localStorage.setItem('driverId', id),
  removeDriverId: () => localStorage.removeItem('driverId'),
  
  // Rider (Client) Mock Session
  isRiderAuthenticated: () => !!localStorage.getItem('riderPhone'),
  getRiderDetails: () => ({
    name: localStorage.getItem('riderName'),
    phone: localStorage.getItem('riderPhone'),
  }),
  setRiderSession: (name, phone) => {
    localStorage.setItem('riderName', name);
    localStorage.setItem('riderPhone', phone);
  },
  
  logout: () => {
    localStorage.clear();
  },
};
