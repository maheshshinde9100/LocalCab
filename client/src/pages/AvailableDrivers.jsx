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
    <div className="min-h-screen bg-white">
      {/* Header Section */}
      <div className="bg-uber-black text-white pt-12 pb-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center opacity-0 animate-fade-in-up">
          <h1 className="text-4xl sm:text-5xl font-bold mb-6">Choose a ride</h1>
          <p className="text-gray-400 text-lg sm:text-xl max-w-2xl mx-auto">
            Find the best local drivers in your area. Enter your pincode to see who's available right now.
          </p>
        </div>
      </div>

      {/* Floating Search Bar */}
      <div className="max-w-3xl mx-auto -mt-12 px-4 opacity-0 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
        <div className="bg-white p-2 rounded-2xl shadow-2xl border border-gray-100 ring-1 ring-black/5">
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /></svg>
              </div>
              <input
                type="text"
                value={pincode}
                onChange={(e) => setPincode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="Where are you? (Enter Pincode)"
                maxLength={6}
                className="block w-full pl-11 pr-4 py-4 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-black transition text-lg font-medium"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="bg-uber-black hover:bg-gray-800 text-white font-bold px-10 py-4 rounded-xl transition-all transform active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : 'Search Drivers'}
            </button>
          </form>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-8 rounded-r-lg animate-fade-in">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {!loading && drivers.length === 0 && pincode.length === 6 && (
          <div className="text-center py-20 animate-fade-in">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-12 h-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9.172 9.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">No drivers found</h3>
            <p className="text-gray-500">Try a different pincode or check back later.</p>
          </div>
        )}

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {drivers.map((driver, index) => {
            const ratingSummary = ratings[driver.id];
            return (
              <div
                key={driver.id}
                className="group relative bg-white border border-gray-100 rounded-[2rem] overflow-hidden hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 opacity-0 animate-fade-in-up"
                style={{ animationDelay: `${0.1 * (index + 1)}s` }}
              >
                {/* Driver Identity Card Styling */}
                <div className="p-8">
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex gap-4 items-center">
                      <div className="w-16 h-16 rounded-2xl bg-gray-900 text-white flex items-center justify-center font-bold text-2xl shadow-lg transform group-hover:scale-110 transition-transform">
                        {driver.fullName.charAt(0)}
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-uber-dark group-hover:text-black transition-colors">{driver.fullName}</h3>
                        <p className="text-gray-500 text-sm font-medium">{driver.village}</p>
                      </div>
                    </div>
                    {ratingSummary && ratingSummary.totalRatings > 0 && (
                      <div className="bg-gray-50 px-3 py-1.5 rounded-full flex items-center gap-1 border border-gray-100">
                        <span className="text-yellow-500">★</span>
                        <span className="font-bold text-uber-dark">{ratingSummary.averageRating.toFixed(1)}</span>
                      </div>
                    )}
                  </div>

                  {/* Vehicle Details */}
                  <div className="space-y-4 mb-8">
                    <div className="flex items-center p-4 bg-gray-50 rounded-2xl border border-gray-100/50">
                      <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center mr-4 shadow-sm">
                        <svg className="w-6 h-6 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>
                      </div>
                      <div className="flex-1 text-sm">
                        <p className="text-gray-400 font-medium uppercase tracking-wider text-[10px]">Vehicle</p>
                        <p className="text-uber-dark font-bold truncate">{driver.vehicleType} • {driver.vehicleModel || 'Standard'}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-gray-400 font-medium uppercase tracking-wider text-[10px]">Seats</p>
                        <p className="text-uber-dark font-bold">{driver.totalSeats || '4'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="grid grid-cols-2 gap-3">
                    <a
                      href={`tel:${driver.phoneNumber}`}
                      className="group/btn flex items-center justify-center gap-2 bg-white border-2 border-gray-200 text-uber-dark font-bold py-3.5 rounded-2xl hover:border-uber-black transition-all active:scale-95"
                    >
                      <svg className="w-5 h-5 group-hover/btn:animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                      Call
                    </a>
                    <Link
                      to={`/bookings/create?driverId=${driver.id}`}
                      className="flex items-center justify-center bg-uber-black text-white font-bold py-3.5 rounded-2xl hover:bg-gray-800 transition-all shadow-lg active:scale-95"
                    >
                      Book Ride
                    </Link>
                  </div>
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
