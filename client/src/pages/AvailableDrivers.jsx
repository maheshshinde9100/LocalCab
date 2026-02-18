import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { driverAPI, ratingAPI } from '../utils/api';

function AvailableDrivers() {
  const [pincode, setPincode] = useState('');
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [ratings, setRatings] = useState({});

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!pincode || pincode.length !== 6) {
      setError('Please enter a valid 6-digit pincode');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      const response = await driverAPI.getAvailable(pincode);
      setDrivers(response.data);
      
      // Fetch ratings for each driver
      const ratingPromises = response.data.map(async (driver) => {
        try {
          const ratingResponse = await ratingAPI.getDriverRatingSummary(driver.id);
          return { driverId: driver.id, summary: ratingResponse.data };
        } catch {
          return { driverId: driver.id, summary: null };
        }
      });
      
      const ratingResults = await Promise.all(ratingPromises);
      const ratingsMap = {};
      ratingResults.forEach(({ driverId, summary }) => {
        ratingsMap[driverId] = summary;
      });
      setRatings(ratingsMap);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch drivers');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-900">
          Find Available Taxis
        </h1>

        <div className="bg-white shadow-lg rounded-lg p-6 mb-8">
          <form onSubmit={handleSearch} className="flex gap-4">
            <input
              type="text"
              value={pincode}
              onChange={(e) => setPincode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="Enter 6-digit pincode"
              maxLength={6}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
            <button
              type="submit"
              disabled={loading}
              className="bg-primary-600 hover:bg-primary-700 text-white font-semibold px-8 py-2 rounded-lg transition disabled:opacity-50"
            >
              {loading ? 'Searching...' : 'Search'}
            </button>
          </form>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {drivers.length === 0 && !loading && pincode && (
          <div className="text-center py-12 text-gray-600">
            No available drivers found in this area.
          </div>
        )}

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {drivers.map((driver) => {
            const ratingSummary = ratings[driver.id];
            return (
              <div key={driver.id} className="bg-white shadow-lg rounded-lg p-6 hover:shadow-xl transition">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">{driver.fullName}</h3>
                    <p className="text-gray-600 text-sm">{driver.village}, {driver.district}</p>
                  </div>
                  {ratingSummary && ratingSummary.totalRatings > 0 && (
                    <div className="text-right">
                      <div className="flex items-center">
                        <span className="text-yellow-500 text-lg">★</span>
                        <span className="font-semibold ml-1">{ratingSummary.averageRating.toFixed(1)}</span>
                      </div>
                      <p className="text-xs text-gray-500">{ratingSummary.totalRatings} reviews</p>
                    </div>
                  )}
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-gray-600">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                    </svg>
                    <span className="text-sm">{driver.vehicleType} - {driver.vehicleModel || 'N/A'}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <span className="text-sm">{driver.totalSeats || 'N/A'} seats</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    <a href={`tel:${driver.phoneNumber}`} className="text-primary-600 hover:text-primary-700 font-semibold">
                      {driver.phoneNumber}
                    </a>
                  </div>
                </div>

                <div className="flex gap-2">
                  <a
                    href={`tel:${driver.phoneNumber}`}
                    className="flex-1 bg-green-500 hover:bg-green-600 text-white text-center font-semibold py-2 px-4 rounded-lg transition"
                  >
                    Call Driver
                  </a>
                  <Link
                    to={`/bookings/create?driverId=${driver.id}`}
                    className="flex-1 bg-primary-600 hover:bg-primary-700 text-white text-center font-semibold py-2 px-4 rounded-lg transition"
                  >
                    Book Now
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default AvailableDrivers;
