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
  getRiderDetails: () => ({
    name: localStorage.getItem('riderName') || '',
    phone: localStorage.getItem('riderPhone') || '',
  }),
  setRiderSession: (name, phone) => {
    localStorage.setItem('riderName', name);
    localStorage.setItem('riderPhone', phone);
    if (!localStorage.getItem('riderToken')) {
      localStorage.setItem('riderToken', 'localcab-mock-rider-token');
    }
  },
  setRiderDetails: (name, phone) => {
    localStorage.setItem('riderName', name);
    localStorage.setItem('riderPhone', phone);
  },
  
  // Admin Session
  isAdminAuthenticated: () => !!localStorage.getItem('adminToken'),
  getAdminToken: () => localStorage.getItem('adminToken'),
  setAdminToken: (token) => localStorage.setItem('adminToken', token),

  logout: () => {
    localStorage.clear();
  },
};
