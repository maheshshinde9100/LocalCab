export const auth = {
  getToken: () => localStorage.getItem('token'),
  setToken: (token) => localStorage.setItem('token', token),
  removeToken: () => localStorage.removeItem('token'),
  isAuthenticated: () => !!localStorage.getItem('token'),
  getDriverId: () => localStorage.getItem('driverId'),
  setDriverId: (id) => localStorage.setItem('driverId', id),
  removeDriverId: () => localStorage.removeItem('driverId'),
  getDriverName: () => localStorage.getItem('driverName') || '',
  setDriverName: (name) => localStorage.setItem('driverName', name),
  isDriverVerified: () => localStorage.getItem('driverVerified') === 'true',
  setDriverVerified: (verified) => localStorage.setItem('driverVerified', String(verified)),

  // Rider (Customer) Session
  getRiderToken: () => localStorage.getItem('riderToken'),
  setRiderToken: (token) => localStorage.setItem('riderToken', token),
  removeRiderToken: () => localStorage.removeItem('riderToken'),
  isRiderAuthenticated: () => {
    const token = localStorage.getItem('riderToken');
    return !!token && token !== 'localcab-mock-rider-token';
  },
  getRiderId: () => localStorage.getItem('riderId'),
  setRiderId: (id) => localStorage.setItem('riderId', id),
  removeRiderId: () => localStorage.removeItem('riderId'),
  getRiderDetails: () => ({
    name: localStorage.getItem('riderName') || '',
    phone: localStorage.getItem('riderPhone') || '',
  }),
  setRiderDetails: (name, phone) => {
    localStorage.setItem('riderName', name);
    localStorage.setItem('riderPhone', phone);
  },

  clearDriverSession: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('driverId');
    localStorage.removeItem('driverName');
    localStorage.removeItem('driverVerified');
  },

  clearRiderSession: () => {
    localStorage.removeItem('riderToken');
    localStorage.removeItem('riderId');
    localStorage.removeItem('riderName');
    localStorage.removeItem('riderPhone');
  },

  clearAdminSession: () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUsername');
  },

  setSession: (token, driverData) => {
    auth.clearRiderSession();
    auth.clearAdminSession();
    auth.setToken(token);
    if (driverData) {
      auth.setDriverId(driverData.driverId || driverData.id || '');
      auth.setDriverName(driverData.fullName || driverData.name || '');
      auth.setDriverVerified(driverData.verified === true);
    }
  },

  setRiderSessionToken: (token, rider) => {
    auth.clearDriverSession();
    auth.clearAdminSession();
    auth.setRiderToken(token);
    if (rider) {
      auth.setRiderId(rider.id || '');
      auth.setRiderDetails(rider.fullName || '', rider.phoneNumber || '');
    }
  },

  setAdminSession: (token, username) => {
    auth.clearDriverSession();
    auth.clearRiderSession();
    auth.setAdminToken(token);
    if (username) {
      localStorage.setItem('adminUsername', username);
    }
  },

  // Admin Session
  isAdminAuthenticated: () => !!localStorage.getItem('adminToken'),
  getAdminToken: () => localStorage.getItem('adminToken'),
  setAdminToken: (token) => localStorage.setItem('adminToken', token),

  logout: () => {
    localStorage.clear();
  },
};
