import { useState, useEffect } from 'react';
import { bookingAPI, driverAPI, ratingAPI } from '../utils/api';
import { auth } from '../utils/auth';

function DriverDashboard() {
  const driverId = auth.getDriverId();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [available, setAvailable] = useState(true);
  const [ratings, setRatings] = useState(null);

  useEffect(() => {
    loadBookings();
    loadRatings();
  }, []);

  const loadBookings = async () => {
    try {
      const response = await bookingAPI.getMyBookings();
      setBookings(response.data);
    } catch (err) {
      setError('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  const loadRatings = async () => {
    if (!driverId) return;
    try {
      const response = await ratingAPI.getDriverRatingSummary(driverId);
      setRatings(response.data);
    } catch (err) {
      // Ratings might not exist yet
    }
  };

  const handleToggleAvailability = async () => {
    try {
      await driverAPI.updateAvailability(driverId, !available);
      setAvailable(!available);
    } catch (err) {
      alert('Failed to update availability');
    }
  };

  const handleUpdateStatus = async (bookingId, newStatus) => {
    try {
      await bookingAPI.updateStatus(bookingId, newStatus);
      loadBookings();
    } catch (err) {
      alert('Failed to update booking status');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-green-100 text-green-800';
      case 'ONGOING':
        return 'bg-blue-100 text-blue-800';
      case 'CONFIRMED':
        return 'bg-yellow-100 text-yellow-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-gray-900">Driver Dashboard</h1>

        {/* Availability Toggle */}
        <div className="bg-white shadow-lg rounded-lg p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold mb-2">Availability Status</h2>
              <p className="text-gray-600">
                {available ? 'You are currently available for rides' : 'You are currently offline'}
              </p>
            </div>
            <button
              onClick={handleToggleAvailability}
              className={`px-6 py-3 rounded-lg font-semibold transition ${
                available
                  ? 'bg-green-500 hover:bg-green-600 text-white'
                  : 'bg-gray-300 hover:bg-gray-400 text-gray-800'
              }`}
            >
              {available ? 'Go Offline' : 'Go Online'}
            </button>
          </div>
        </div>

        {/* Rating Summary */}
        {ratings && ratings.totalRatings > 0 && (
          <div className="bg-white shadow-lg rounded-lg p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">Your Rating</h2>
            <div className="flex items-center">
              <div className="text-4xl font-bold text-primary-600 mr-4">
                {ratings.averageRating.toFixed(1)}
              </div>
              <div>
                <div className="flex items-center mb-2">
                  {[...Array(5)].map((_, i) => (
                    <span
                      key={i}
                      className={`text-2xl ${
                        i < Math.floor(ratings.averageRating)
                          ? 'text-yellow-500'
                          : 'text-gray-300'
                      }`}
                    >
                      ★
                    </span>
                  ))}
                </div>
                <p className="text-gray-600">{ratings.totalRatings} total reviews</p>
              </div>
            </div>
          </div>
        )}

        {/* Bookings List */}
        <div className="bg-white shadow-lg rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-6">Your Bookings</h2>

          {loading ? (
            <div className="text-center py-12 text-gray-600">Loading bookings...</div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          ) : bookings.length === 0 ? (
            <div className="text-center py-12 text-gray-600">No bookings yet</div>
          ) : (
            <div className="space-y-4">
              {bookings.map((booking) => (
                <div
                  key={booking.id}
                  className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {booking.riderName}
                      </h3>
                      <p className="text-gray-600 text-sm">{booking.riderPhoneNumber}</p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(
                        booking.status
                      )}`}
                    >
                      {booking.status}
                    </span>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-600">Pickup</p>
                      <p className="font-medium">
                        {booking.pickupVillage}
                        {booking.pickupLandmark && `, ${booking.pickupLandmark}`}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Drop</p>
                      <p className="font-medium">{booking.dropLocation}</p>
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm text-gray-600">Fare</p>
                      <p className="text-xl font-bold text-primary-600">₹{booking.agreedFare}</p>
                    </div>
                    <div className="flex gap-2">
                      {booking.status === 'REQUESTED' && (
                        <>
                          <button
                            onClick={() => handleUpdateStatus(booking.id, 'CONFIRMED')}
                            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-semibold"
                          >
                            Confirm
                          </button>
                          <button
                            onClick={() => handleUpdateStatus(booking.id, 'CANCELLED')}
                            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-semibold"
                          >
                            Cancel
                          </button>
                        </>
                      )}
                      {booking.status === 'CONFIRMED' && (
                        <button
                          onClick={() => handleUpdateStatus(booking.id, 'ONGOING')}
                          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold"
                        >
                          Start Trip
                        </button>
                      )}
                      {booking.status === 'ONGOING' && (
                        <button
                          onClick={() => handleUpdateStatus(booking.id, 'COMPLETED')}
                          className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-semibold"
                        >
                          Complete Trip
                        </button>
                      )}
                    </div>
                  </div>

                  <p className="text-xs text-gray-500 mt-4">
                    Created: {new Date(booking.createdAt).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default DriverDashboard;
