import { useState, useEffect } from 'react';
import { bookingAPI, driverAPI, ratingAPI } from '../utils/api';
import { auth } from '../utils/auth';

function DriverDashboard() {
  const driverId = auth.getDriverId();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [available, setAvailable] = useState(true);
  const [verified, setVerified] = useState(true);
  const [ratings, setRatings] = useState(null);
  const [activeTab, setActiveTab] = useState('active'); // 'active', 'past', 'collections'

  useEffect(() => {
    loadBookings();
    loadRatings();
    checkVerification();
  }, []);

  const checkVerification = () => {
    const v = localStorage.getItem('driverVerified');
    setVerified(v === 'true');
  };

  const loadBookings = async () => {
    try {
      const response = await bookingAPI.getMyBookings();
      setBookings(response.data);
    } catch (err) {
      setError('Failed to load bookings. Check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const loadRatings = async () => {
    if (!driverId) return;
    try {
      const response = await ratingAPI.getDriverRatingSummary(driverId);
      setRatings(response.data);
    } catch (err) { }
  };

  const handleToggleAvailability = async () => {
    if (!verified) {
      alert('Your account is pending verification. Please contact support.');
      return;
    }
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
      alert('Failed to update status');
    }
  };

  const getStatusConfig = (status) => {
    switch (status) {
      case 'COMPLETED': return { dot: 'bg-green-500', bg: 'bg-green-50', text: 'text-green-700' };
      case 'ONGOING': return { dot: 'bg-blue-500', bg: 'bg-blue-50', text: 'text-blue-700' };
      case 'CONFIRMED': return { dot: 'bg-yellow-500', bg: 'bg-yellow-50', text: 'text-yellow-700' };
      case 'CANCELLED': return { dot: 'bg-red-500', bg: 'bg-red-50', text: 'text-red-700' };
      default: return { dot: 'bg-gray-500', bg: 'bg-gray-50', text: 'text-gray-700' };
    }
  };

  return (
    <div className="min-h-screen bg-[#f3f3f3]">
      {/* Top Navigation / Status Area */}
      <div className="bg-black text-white px-4 py-8 sm:px-6 lg:px-8 shadow-2xl">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="opacity-0 animate-fade-in-up">
              <h1 className="text-3xl font-bold mb-1">Driver Portal</h1>
              <p className="text-gray-400 font-medium">Manage your rides and availability</p>
            </div>

            <div className="flex items-center gap-4 opacity-0 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
              <div className={`px-5 py-3 rounded-2xl flex items-center gap-3 border transition-colors ${available ? 'bg-green-500/10 border-green-500/20' : 'bg-red-500/10 border-red-500/20'}`}>
                <div className={`w-3 h-3 rounded-full animate-pulse ${available ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span className={`font-bold uppercase tracking-wider text-sm ${available ? 'text-green-400' : 'text-red-400'}`}>
                  {available ? 'YOU ARE ONLINE' : 'YOU ARE OFFLINE'}
                </span>
              </div>
              <button
                onClick={handleToggleAvailability}
                className={`px-8 py-3 rounded-2xl font-bold transition-all transform active:scale-95 shadow-lg ${available ? 'bg-white text-black hover:bg-gray-100' : 'bg-primary-500 text-white hover:bg-primary-600'
                  }`}
              >
                {available ? 'Go Offline' : 'Go Online Now'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {!verified && (
        <div className="bg-yellow-400 text-black py-4 px-4 text-center font-black animate-pulse">
          ⚠️ ACCOUNT PENDING VERIFICATION. You will not appear in search results until approved by Admin.
        </div>
      )}

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6">
        <div className="grid lg:grid-cols-3 gap-8">

          {/* Left Column: Stats & Profile */}
          <div className="space-y-6">
            <div className="bg-white rounded-[2rem] p-8 shadow-xl border border-gray-100 opacity-0 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              <h2 className="text-gray-400 font-bold uppercase tracking-widest text-xs mb-6">Performance</h2>
              {ratings && ratings.totalRatings > 0 ? (
                <div className="flex items-center gap-6">
                  <div className="bg-black text-white w-20 h-20 rounded-[1.5rem] flex items-center justify-center text-3xl font-bold">
                    {ratings.averageRating.toFixed(1)}
                  </div>
                  <div>
                    <div className="flex gap-1 mb-1">
                      {[...Array(5)].map((_, i) => (
                        <span key={i} className={`text-xl ${i < Math.floor(ratings.averageRating) ? 'text-yellow-500' : 'text-gray-200'}`}>★</span>
                      ))}
                    </div>
                    <p className="text-gray-500 font-medium text-sm">from {ratings.totalRatings} ratings</p>
                  </div>
                </div>
              ) : (
                <p className="text-gray-500 font-medium">No ratings yet. Start driving to build your score!</p>
              )}
            </div>

            <div className="bg-white rounded-[2rem] p-8 shadow-xl border border-gray-100 opacity-0 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
              <h2 className="text-gray-400 font-bold uppercase tracking-widest text-xs mb-4">Earnings</h2>
              <div className="text-4xl font-black text-black mb-1">₹{bookings.filter(b => b.status === 'COMPLETED').reduce((acc, b) => acc + b.agreedFare, 0)}</div>
              <p className="text-gray-400 font-medium text-sm">Total earnings this month</p>
            </div>
          </div>

          {/* Right Column: Bookings Feed */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-[2rem] p-8 shadow-xl border border-gray-100 min-h-[500px] opacity-0 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
                <div className="flex bg-gray-100 p-1 rounded-2xl">
                  {['active', 'past', 'collections'].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === tab ? 'bg-black text-white shadow-lg' : 'text-gray-400 hover:text-black'}`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
                <span className="bg-gray-100 text-gray-500 font-bold px-4 py-1.5 rounded-full text-xs uppercase tracking-widest">
                  {activeTab === 'active' ? bookings.filter(b => b.status !== 'COMPLETED' && b.status !== 'CANCELLED').length : 
                   activeTab === 'past' ? bookings.filter(b => b.status === 'COMPLETED' || b.status === 'CANCELLED').length :
                   bookings.filter(b => b.status === 'COMPLETED').length} Items
                </span>
              </div>

              {loading ? (
                <div className="flex flex-col items-center justify-center py-20 grayscale opacity-50">
                  <div className="w-12 h-12 border-4 border-black border-t-transparent rounded-full animate-spin mb-4"></div>
                  <p className="font-bold uppercase tracking-widest text-sm text-gray-400">Syncing with server...</p>
                </div>
              ) : activeTab === 'collections' ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-green-50 p-6 rounded-[2rem] border border-green-100">
                      <p className="text-green-600 font-black uppercase text-[10px] tracking-widest mb-2">Total Earnings</p>
                      <p className="text-3xl font-black text-green-700">₹{bookings.filter(b => b.status === 'COMPLETED').reduce((acc, b) => acc + b.agreedFare, 0)}</p>
                    </div>
                    <div className="bg-blue-50 p-6 rounded-[2rem] border border-blue-100">
                      <p className="text-blue-600 font-black uppercase text-[10px] tracking-widest mb-2">Completed Trips</p>
                      <p className="text-3xl font-black text-blue-700">{bookings.filter(b => b.status === 'COMPLETED').length}</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    {bookings.filter(b => b.status === 'COMPLETED').map(b => (
                      <div key={b.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100 text-sm">
                        <div>
                          <p className="font-bold text-black">{b.riderName}</p>
                          <p className="text-xs text-gray-400">{b.pickupVillage} → {b.dropLocation}</p>
                        </div>
                        <p className="font-black text-black">+₹{b.agreedFare}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {(activeTab === 'active' ? 
                    bookings.filter(b => b.status !== 'COMPLETED' && b.status !== 'CANCELLED') :
                    bookings.filter(b => b.status === 'COMPLETED' || b.status === 'CANCELLED')
                  ).length === 0 ? (
                    <div className="text-center py-20">
                      <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-dashed border-gray-200">
                        <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      </div>
                      <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">No {activeTab} rides</p>
                    </div>
                  ) : (
                    (activeTab === 'active' ? 
                      bookings.filter(b => b.status !== 'COMPLETED' && b.status !== 'CANCELLED') :
                      bookings.filter(b => b.status === 'COMPLETED' || b.status === 'CANCELLED')
                    ).map((booking) => {
                      const cfg = getStatusConfig(booking.status);
                      return (
                        <div key={booking.id} className="group relative bg-gray-50 border border-gray-100 rounded-3xl p-6 hover:bg-white hover:shadow-2xl hover:border-black transition-all duration-300">
                          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 rounded-2xl bg-black text-white flex items-center justify-center font-bold shadow-lg">
                                {booking.riderName.charAt(0)}
                              </div>
                              <div>
                                <h3 className="font-bold text-lg text-black">{booking.riderName}</h3>
                                <a href={`tel:${booking.riderPhoneNumber}`} className="text-primary-600 font-bold text-sm hover:underline">
                                  {booking.riderPhoneNumber}
                                </a>
                              </div>
                            </div>
                            <div className={`flex items-center gap-2 px-4 py-1.5 rounded-full font-bold text-xs uppercase tracking-widest ${cfg.bg} ${cfg.text}`}>
                              <div className={`w-2 h-2 rounded-full ${cfg.dot}`}></div>
                              {booking.status}
                            </div>
                          </div>

                          <div className="grid sm:grid-cols-2 gap-4 mb-8">
                            <div className="bg-white p-4 rounded-2xl border border-gray-100">
                              <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px] mb-1">Pickup From</p>
                              <p className="text-black font-bold truncate">{booking.pickupVillage}</p>
                              {booking.pickupLandmark && <p className="text-gray-500 text-xs truncate mt-0.5">{booking.pickupLandmark}</p>}
                            </div>
                            <div className="bg-white p-4 rounded-2xl border border-gray-100">
                              <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px] mb-1">Drop Location</p>
                              <p className="text-black font-bold truncate">{booking.dropLocation}</p>
                            </div>
                          </div>

                          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                            <div className="text-center sm:text-left">
                              <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px] mb-1">Agreed Fare</p>
                              <p className="text-3xl font-black text-black">₹{booking.agreedFare}</p>
                            </div>

                            <div className="flex gap-2 w-full sm:w-auto">
                              {booking.status === 'REQUESTED' && (
                                <>
                                  <button onClick={() => handleUpdateStatus(booking.id, 'CONFIRMED')} className="flex-1 sm:flex-none bg-black text-white px-8 py-3 rounded-2xl font-bold hover:bg-gray-800 transition-all active:scale-95 shadow-md">Accept</button>
                                  <button onClick={() => handleUpdateStatus(booking.id, 'CANCELLED')} className="flex-1 sm:flex-none bg-white border border-gray-200 text-red-500 px-8 py-3 rounded-2xl font-bold hover:bg-red-50 transition-all active:scale-95">Decline</button>
                                </>
                              )}
                              {booking.status === 'CONFIRMED' && (
                                <button onClick={() => handleUpdateStatus(booking.id, 'ONGOING')} className="w-full sm:w-auto bg-blue-600 text-white px-10 py-3 rounded-2xl font-bold hover:bg-blue-700 transition-all active:scale-95 shadow-md">Start Trip</button>
                              )}
                              {booking.status === 'ONGOING' && (
                                <button onClick={() => handleUpdateStatus(booking.id, 'COMPLETED')} className="w-full sm:w-auto bg-green-600 text-white px-10 py-3 rounded-2xl font-bold hover:bg-green-700 transition-all active:scale-95 shadow-md">Complete Trip</button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default DriverDashboard;
