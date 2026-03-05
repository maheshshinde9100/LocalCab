import { useState, useEffect } from 'react';
import { driverAPI, ratingAPI } from '../utils/api';
import DriverCard from '../components/DriverCard';

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
      <div className="bg-black text-white pt-24 pb-32 px-4 shadow-inner">
        <div className="max-w-4xl mx-auto text-center opacity-0 animate-fade-in-up">
          <h1 className="text-5xl sm:text-7xl font-black mb-8 tracking-tighter">Choose a ride</h1>
          <p className="text-gray-400 text-lg sm:text-xl font-medium max-w-2xl mx-auto leading-relaxed">
            Directly connect with rural India's most trusted taxi network. No surges, no hidden fees.
          </p>
        </div>
      </div>

      {/* Floating Search Bar */}
      <div className="max-w-3xl mx-auto -mt-14 px-4 relative z-10 opacity-0 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
        <div className="bg-white p-3 rounded-[2.5rem] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.14)] border border-gray-100">
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <div className="absolute left-6 top-1/2 -translate-y-1/2 text-black">
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /></svg>
              </div>
              <input
                type="text"
                value={pincode}
                onChange={(e) => setPincode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="Where's your pickup? (Enter 6 digit pincode)"
                maxLength={6}
                className="w-full pl-16 pr-6 py-5 bg-gray-50 border-none rounded-[2rem] focus:ring-2 focus:ring-black transition text-lg font-bold placeholder:text-gray-300"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="bg-black hover:bg-gray-800 text-white font-black px-12 py-5 rounded-[2rem] transition-all transform active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3 shadow-xl shadow-black/20"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : 'SEARCH'}
            </button>
          </form>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-24">
        {error && (
          <div className="max-w-2xl mx-auto bg-red-50 border-l-4 border-red-500 p-5 rounded-r-2xl mb-12 animate-fade-in">
            <p className="text-sm text-red-700 font-bold">{error}</p>
          </div>
        )}

        {!loading && drivers.length === 0 && pincode.length === 6 && (
          <div className="text-center py-32 animate-fade-in">
            <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-8 border-2 border-dashed border-gray-200">
              <span className="text-4xl text-gray-200">🚖</span>
            </div>
            <h3 className="text-3xl font-black text-black mb-3">No drivers found</h3>
            <p className="text-gray-400 font-medium">Try a nearby pincode or search again in a few minutes.</p>
          </div>
        )}

        {drivers.length > 0 && (
          <div className="mb-12 flex items-center justify-between opacity-0 animate-fade-in-up">
            <h2 className="text-xs font-black uppercase tracking-[0.3em] text-gray-400">Available Near {pincode}</h2>
            <span className="bg-black text-white text-[10px] font-black px-3 py-1 rounded-full uppercase italic">{drivers.length} matched</span>
          </div>
        )}

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-10">
          {drivers.map((driver, index) => (
            <div
              key={driver.id}
              className="opacity-0 animate-fade-in-up"
              style={{ animationDelay: `${0.1 * (index + 1)}s` }}
            >
              <DriverCard
                driver={driver}
                ratingSummary={ratings[driver.id]}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default AvailableDrivers;
