import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { driverAPI, ratingAPI } from '../utils/api';
import { auth } from '../utils/auth';
import DriverCard from '../components/DriverCard';

function AvailableDrivers() {
  const navigate = useNavigate();
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [ratings, setRatings] = useState({});
  const [locating, setLocating] = useState(false);

  // Search & Filter state
  const [locationQuery, setLocationQuery] = useState('');
  const [filterVehicleType, setFilterVehicleType] = useState('All');
  const [filterMinSeats, setFilterMinSeats] = useState('All');
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    if (auth.isAuthenticated()) {
      navigate('/driver/dashboard');
      return;
    }
    // Load all drivers by default
    fetchDrivers('all');
  }, [navigate]);

  const fetchDrivers = async (queryStr) => {
    setLoading(true);
    setError('');
    try {
      const response = await driverAPI.getAvailable(queryStr);
      setDrivers(response.data || []);

      const ratingPromises = (response.data || []).map(async (driver) => {
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

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!locationQuery.trim()) {
      fetchDrivers('all');
    } else {
      fetchDrivers(locationQuery.trim());
    }
  };

  const handleUseLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      return;
    }

    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
          );
          const data = await response.json();
          const detectedPincode = data.address?.postcode;

          if (detectedPincode) {
            const cleanedPincode = detectedPincode.replace(/\D/g, '').slice(0, 6);
            if (cleanedPincode.length === 6) {
              setLocationQuery(cleanedPincode);
              fetchDrivers(cleanedPincode);
            } else {
              setError(`Detected pincode (${detectedPincode}) is invalid. Please enter manually.`);
            }
          } else {
            setError('Could not detect pincode. Please enter manually.');
          }
        } catch (err) {
          setError('Failed to get location details. Please enter pincode manually.');
        } finally {
          setLocating(false);
        }
      },
      (err) => {
        setError('Location permission denied or unavailable.');
        setLocating(false);
      }
    );
  };

  // Perform client-side filtering on fetched drivers
  const filteredDrivers = drivers.filter((driver) => {
    // 1. Vehicle Type Filter
    if (filterVehicleType !== 'All' && driver.vehicleType !== filterVehicleType) {
      return false;
    }

    // 2. Seating Capacity Filter
    if (filterMinSeats !== 'All') {
      const minSeats = parseInt(filterMinSeats, 10);
      if (driver.totalSeats < minSeats) {
        return false;
      }
    }

    // 3. Search text (name, village, taluka, model)
    if (searchText.trim()) {
      const term = searchText.toLowerCase();
      const nameMatch = driver.fullName?.toLowerCase().includes(term);
      const villageMatch = driver.village?.toLowerCase().includes(term);
      const talukaMatch = driver.taluka?.toLowerCase().includes(term);
      const modelMatch = driver.vehicleModel?.toLowerCase().includes(term);
      return nameMatch || villageMatch || talukaMatch || modelMatch;
    }

    return true;
  });

  return (
    <div className="min-h-screen bg-slate-50/50">
      {/* Top Banner Header */}
      <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white pt-20 pb-28 px-4 shadow-md text-center">
        <div className="max-w-4xl mx-auto opacity-0 animate-fade-in">
          <span className="bg-blue-500/20 text-blue-300 border border-blue-500/30 px-3.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider">
            Available Rides
          </span>
          <h1 className="text-4xl sm:text-5xl font-black mt-3 mb-4 tracking-tight">Direct Village & City Cabs</h1>
          <p className="text-slate-300/95 text-base sm:text-lg max-w-xl mx-auto font-medium">
            Connect instantly with verified local drivers near you. Filter by location, seats, or cab type.
          </p>
        </div>
      </div>

      {/* Control Box: Search & Filters */}
      <div className="max-w-7xl mx-auto -mt-10 px-4 relative z-20">
        <div className="bg-white rounded-3xl shadow-xl border border-slate-100/80 p-5 md:p-6 space-y-4">
          
          {/* Main search bar */}
          <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                <i className="fas fa-map-marker-alt text-lg"></i>
              </span>
              <input
                type="text"
                value={locationQuery}
                onChange={(e) => setLocationQuery(e.target.value)}
                placeholder="Search by pincode or village name (e.g. 411001)..."
                className="w-full pl-11 pr-12 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold placeholder:text-slate-400 text-sm"
              />
              <button
                type="button"
                onClick={handleUseLocation}
                disabled={locating}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition"
              >
                {locating ? (
                  <div className="w-5 h-5 border-2 border-slate-300 border-t-blue-600 rounded-full animate-spin"></div>
                ) : (
                  <i className="fas fa-crosshairs text-base"></i>
                )}
              </button>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 py-3.5 rounded-2xl shadow-md transition duration-150 flex items-center justify-center gap-2 text-sm"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  <i className="fas fa-search"></i> Search Local
                </>
              )}
            </button>
          </form>

          {/* Filter Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-3 border-t border-slate-100">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                Vehicle Type
              </label>
              <select
                value={filterVehicleType}
                onChange={(e) => setFilterVehicleType(e.target.value)}
                className="w-full bg-slate-50 border border-slate-100 text-slate-700 rounded-xl py-2 px-3 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="All">All Types</option>
                <option value="Sedan">Sedan</option>
                <option value="SUV">SUV</option>
                <option value="Auto">Auto</option>
                <option value="Hatchback">Hatchback</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                Min Seats Capacity
              </label>
              <select
                value={filterMinSeats}
                onChange={(e) => setFilterMinSeats(e.target.value)}
                className="w-full bg-slate-50 border border-slate-100 text-slate-700 rounded-xl py-2 px-3 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="All">Any Seating</option>
                <option value="3">3+ Seats</option>
                <option value="4">4+ Seats</option>
                <option value="6">6+ Seats</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                Quick Text Filter
              </label>
              <input
                type="text"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                placeholder="Filter by driver name, model..."
                className="w-full bg-slate-50 border border-slate-100 text-slate-700 rounded-xl py-2 px-3 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

        </div>
      </div>

      {/* Search results layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-16">
        {error && (
          <div className="max-w-2xl mx-auto bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-8 flex items-center gap-2">
            <i className="fas fa-exclamation-circle"></i>
            {error}
          </div>
        )}

        {filteredDrivers.length === 0 && !loading && (
          <div className="text-center py-20 bg-white rounded-3xl shadow-sm border border-slate-100/50">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100 text-2xl">
              🚖
            </div>
            <h3 className="text-lg font-bold text-slate-800">No matching cabs available</h3>
            <p className="text-slate-400 text-xs mt-1">Try resetting filters or searching a nearby village/postcode.</p>
          </div>
        )}

        {filteredDrivers.length > 0 && (
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Matched Available Drivers ({filteredDrivers.length})
            </h2>
          </div>
        )}

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredDrivers.map((driver, index) => (
            <div
              key={driver.id}
              className="opacity-0 animate-fade-in-up"
              style={{ animationDelay: `${0.05 * (index + 1)}s`, animationFillMode: 'forwards' }}
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
