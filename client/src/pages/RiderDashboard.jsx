import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { bookingAPI, riderAPI } from '../utils/api';
import { auth } from '../utils/auth';

function RiderDashboard() {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [rider, setRider] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!auth.isRiderAuthenticated()) {
      navigate('/rider/login');
      return;
    }
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const riderId = auth.getRiderId();
      const [riderRes, bookingsRes] = await Promise.all([
        riderAPI.getProfile(riderId),
        bookingAPI.getBookingsByRiderId(riderId),
      ]);
      setRider(riderRes.data);
      setBookings(bookingsRes.data);
    } catch (err) {
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    auth.logout();
    navigate('/');
  };

  const getStatusBadgeClass = (status) => {
    const classes = {
      REQUESTED: 'bg-yellow-100 text-yellow-800',
      CONFIRMED: 'bg-blue-100 text-blue-800',
      ONGOING: 'bg-green-100 text-green-800',
      COMPLETED: 'bg-gray-100 text-gray-800',
      CANCELLED: 'bg-red-100 text-red-800',
    };
    return classes[status] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Rider Dashboard</h1>
              <p className="text-gray-600 mt-1">Welcome back, {rider?.fullName}!</p>
            </div>
            <div className="flex gap-4">
              <Link
                to="/drivers/available"
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
              >
                Find Drivers
              </Link>
              <button
                onClick={handleLogout}
                className="bg-gray-200 text-gray-800 px-6 py-2 rounded-lg hover:bg-gray-300"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow p-6">
            <div className="text-3xl font-bold text-blue-600">{bookings.length}</div>
            <div className="text-gray-600">Total Bookings</div>
          </div>
          <div className="bg-white rounded-xl shadow p-6">
            <div className="text-3xl font-bold text-green-600">
              {bookings.filter(b => b.status === 'COMPLETED').length}
            </div>
            <div className="text-gray-600">Completed Rides</div>
          </div>
          <div className="bg-white rounded-xl shadow p-6">
            <div className="text-3xl font-bold text-yellow-600">
              {bookings.filter(b => b.status === 'REQUESTED' || b.status === 'CONFIRMED' || b.status === 'ONGOING').length}
            </div>
            <div className="text-gray-600">Active Rides</div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">My Bookings</h2>
          </div>
          <div className="divide-y divide-gray-200">
            {bookings.length === 0 ? (
              <div className="px-6 py-12 text-center text-gray-500">
                No bookings yet. Start by finding a driver!
              </div>
            ) : (
              bookings.map((booking) => (
                <div key={booking.id} className="px-6 py-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadgeClass(booking.status)}`}>
                          {booking.status}
                        </span>
                      </div>
                      <div className="text-sm text-gray-900 font-medium">
                        From: {booking.pickupVillage} {booking.pickupLandmark && `(${booking.pickupLandmark})`}
                      </div>
                      <div className="text-sm text-gray-600">
                        To: {booking.dropLocation}
                      </div>
                      <div className="text-sm text-gray-500 mt-1">
                        Fare: ₹{booking.agreedFare}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default RiderDashboard;
