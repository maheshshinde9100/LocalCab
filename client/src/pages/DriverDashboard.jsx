import { useState, useEffect, useRef } from 'react';
import { bookingAPI, driverAPI, ratingAPI } from '../utils/api';
import { auth } from '../utils/auth';
import LeafletMap from '../components/LeafletMap';
import {
  isActiveBooking,
  canAcceptRide,
  canStartRide,
  canCompleteRide,
  getStatusLabel,
  getStatusColor,
  computeDriverAnalytics,
} from '../utils/bookingHelpers';

function DriverDashboard() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [available, setAvailable] = useState(true);
  const [verified, setVerified] = useState(true);
  const [ratings, setRatings] = useState(null);
  const [activeTab, setActiveTab] = useState('active'); // 'active', 'past', 'collections', 'profile'
  const [simulatedLat, setSimulatedLat] = useState(null);
  const [simulatedLng, setSimulatedLng] = useState(null);
  const [showSosModal, setShowSosModal] = useState(false);
  
  // Profile state
  const [profile, setProfile] = useState({});
  const [profileUpdating, setProfileUpdating] = useState(false);

  const simulationIntervalRef = useRef(null);

  useEffect(() => {
    loadBookings();
    loadProfile();

    return () => {
      stopLocationSimulation();
    };
  }, []);

  useEffect(() => {
    const ongoingTrip = bookings.find(b => b.status === 'ONGOING');
    if (ongoingTrip) {
      startLocationSimulation(ongoingTrip);
    } else {
      stopLocationSimulation();
    }
  }, [bookings]);

  const loadProfile = async () => {
    try {
      const response = await driverAPI.getMyProfile();
      setProfile(response.data);
      auth.setDriverId(response.data.id);
      auth.setDriverName(response.data.fullName);
      auth.setDriverVerified(response.data.verified);
      setAvailable(response.data.available);
      setVerified(response.data.verified);
      loadRatings(response.data.id);
    } catch (err) {
      console.error("Failed to load profile", err);
    }
  };

  const loadBookings = async () => {
    try {
      const response = await bookingAPI.getMyBookings();
      setBookings(response.data || []);
    } catch (err) {
      setError('Failed to load bookings.');
    } finally {
      setLoading(false);
    }
  };

  const loadRatings = async (id) => {
    const driverId = id || auth.getDriverId();
    if (!driverId) return;
    try {
      const response = await ratingAPI.getDriverRatingSummary(driverId);
      setRatings(response.data);
    } catch (err) { }
  };

  const handleToggleAvailability = async () => {
    if (!verified) {
      alert('Your account is pending verification.');
      return;
    }
    try {
      const id = profile.id || auth.getDriverId();
      await driverAPI.updateAvailability(id, !available);
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
      alert(err.response?.data?.message || 'Failed to update status');
    }
  };

  const handleProfileChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileUpdating(true);
    try {
      await driverAPI.updateProfile(driverId, profile);
      alert('Profile updated successfully.');
    } catch (err) {
      alert('Failed to update profile.');
    } finally {
      setProfileUpdating(false);
    }
  };

  const getRouteCoords = (booking) => {
    const pickLat = booking.pickupLatitude || 18.9750;
    const pickLng = booking.pickupLongitude || 72.8258;
    const dropLat = booking.dropLatitude || 19.0760;
    const dropLng = booking.dropLongitude || 72.8777;
    return { pickLat, pickLng, dropLat, dropLng };
  };

  const startLocationSimulation = (booking) => {
    if (simulationIntervalRef.current) return;
    const { pickLat, pickLng, dropLat, dropLng } = getRouteCoords(booking);
    let currentStep = 0;
    const totalSteps = 20;

    setSimulatedLat(pickLat);
    setSimulatedLng(pickLng);
    bookingAPI.updateLocation(booking.id, pickLat, pickLng).catch(() => {});

    simulationIntervalRef.current = setInterval(async () => {
      currentStep++;
      if (currentStep <= totalSteps) {
        const nextLat = pickLat + ((dropLat - pickLat) * currentStep) / totalSteps;
        const nextLng = pickLng + ((dropLng - pickLng) * currentStep) / totalSteps;
        
        setSimulatedLat(nextLat);
        setSimulatedLng(nextLng);

        try {
          await bookingAPI.updateLocation(booking.id, nextLat, nextLng);
        } catch (err) {}
      } else {
        stopLocationSimulation();
      }
    }, 6000);
  };

  const stopLocationSimulation = () => {
    if (simulationIntervalRef.current) {
      clearInterval(simulationIntervalRef.current);
      simulationIntervalRef.current = null;
    }
    setSimulatedLat(null);
    setSimulatedLng(null);
  };

  const handleTriggerSos = () => {
    alert("SOS EMERGENCY TRIGGERED! Alerting central office.");
    setShowSosModal(false);
  };

  const analytics = computeDriverAnalytics(bookings);
  const activeTrip = bookings.find((b) => isActiveBooking(b));

  return (
    <div className="min-h-screen bg-white pb-12">
      {/* Top Banner */}
      <div className="bg-black text-white px-4 py-8 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <span className="bg-white/10 text-white border border-white/20 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
              Driver Panel
            </span>
            <h1 className="text-3xl font-black tracking-tight mt-3">LocalCab Partner</h1>
            <p className="text-gray-400 font-medium">Keep moving, keep earning</p>
          </div>

          <div className="flex items-center gap-4">
            <div className={`px-5 py-3 rounded-2xl flex items-center gap-3 border transition-colors ${available ? 'bg-white/10 border-white/20' : 'bg-transparent border-white/20'}`}>
              <div className={`w-2.5 h-2.5 rounded-full ${available ? 'bg-white animate-pulse' : 'bg-gray-600'}`}></div>
              <span className={`font-bold uppercase tracking-wider text-sm ${available ? 'text-white' : 'text-gray-400'}`}>
                {available ? 'Online' : 'Offline'}
              </span>
            </div>
            <button
              onClick={handleToggleAvailability}
              className={`px-8 py-3 rounded-2xl font-bold transition duration-150 text-sm ${available ? 'bg-white text-black hover:bg-gray-200' : 'bg-gray-800 text-white hover:bg-gray-700'}`}
            >
              {available ? 'Go Offline' : 'Go Online'}
            </button>
          </div>
        </div>
      </div>

      {!verified && (
        <div className="bg-gray-100 border-b border-gray-200 text-black py-3.5 px-4 text-center font-bold text-sm">
          ACCOUNT PENDING VERIFICATION. You will not receive bookings until verified.
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="bg-gray-50 border border-gray-200 text-black px-4 py-3 rounded-xl mb-6 font-medium">
            {error}
          </div>
        )}

        {/* Live Simulator View */}
        {activeTrip && (
          <div className="bg-white rounded-3xl shadow-2xl shadow-black/5 border border-gray-100 p-6 md:p-8 mb-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-center mb-6">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Ongoing Trip Control</span>
                  <span className={`px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${getStatusColor(activeTrip.status)}`}>
                    {getStatusLabel(activeTrip.status)}
                  </span>
                </div>

                <div className="space-y-4 mb-6">
                  <div>
                    <div className="text-xs font-bold tracking-widest uppercase text-gray-400">Rider Contact</div>
                    <div className="text-base font-black text-black flex items-center gap-2 mt-1">
                      {activeTrip.riderName} ({activeTrip.riderPhoneNumber})
                    </div>
                  </div>
                  <div>
                    <div className="text-xs font-bold tracking-widest uppercase text-gray-400">Route Map Path</div>
                    <div className="text-sm font-bold text-gray-800 mt-1">
                      {activeTrip.pickupVillage} → {activeTrip.dropLocation}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-xs font-bold tracking-widest uppercase text-gray-400">Total Fare</div>
                      <div className="text-2xl font-black text-black mt-1">
                        ₹{activeTrip.agreedFare}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs font-bold tracking-widest uppercase text-gray-400">Payment Method</div>
                      <div className="text-sm font-bold text-black uppercase mt-1">
                        {activeTrip.paymentMethod || 'CASH / NONE'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {activeTrip.status === 'CONFIRMED' && (
                <p className="text-sm text-amber-800 font-bold mb-4 bg-amber-50 p-4 rounded-xl">
                  Accepted — waiting for customer Razorpay payment (₹{activeTrip.agreedFare}).
                </p>
              )}
              {activeTrip.status === 'BOOKED' && activeTrip.paymentStatus === 'COMPLETED' && (
                <p className="text-sm text-green-800 font-bold mb-4 bg-green-50 p-4 rounded-xl">
                  Payment received via Razorpay. Ride is fully booked — you can start the trip.
                </p>
              )}

              <div className="border-t border-gray-100 pt-6 flex flex-wrap gap-3">
                {canAcceptRide(activeTrip) && (
                  <>
                    <button onClick={() => handleUpdateStatus(activeTrip.id, 'CONFIRMED')} className="flex-1 bg-black hover:bg-gray-800 text-white font-bold py-3 px-6 rounded-xl transition active:scale-95">Accept Ride</button>
                    <button onClick={() => handleUpdateStatus(activeTrip.id, 'CANCELLED')} className="flex-1 bg-gray-100 hover:bg-gray-200 text-black font-bold py-3 px-6 rounded-xl transition active:scale-95">Decline</button>
                  </>
                )}
                {canStartRide(activeTrip) && (
                  <button onClick={() => handleUpdateStatus(activeTrip.id, 'ONGOING')} className="flex-1 bg-black hover:bg-gray-800 text-white font-bold py-3 px-6 rounded-xl transition active:scale-95">Start Ride</button>
                )}
                {canCompleteRide(activeTrip) && (
                  <button onClick={() => handleUpdateStatus(activeTrip.id, 'COMPLETED')} className="flex-1 bg-black hover:bg-gray-800 text-white font-bold py-3 px-6 rounded-xl transition active:scale-95">Complete Ride</button>
                )}
                <button onClick={() => setShowSosModal(true)} className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-xl transition active:scale-95">SOS</button>
              </div>
            </div>

            <div>
              <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-black animate-ping"></span> Live GPS Simulation
              </div>
              <div className="h-full min-h-[300px] border border-gray-200 rounded-2xl overflow-hidden">
                <LeafletMap booking={activeTrip} driverLat={simulatedLat || activeTrip.driverLatitude} driverLng={simulatedLng || activeTrip.driverLongitude} />
              </div>
            </div>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 shadow-xl shadow-black/5 border border-gray-100">
              <h3 className="text-gray-400 font-bold uppercase tracking-widest text-xs mb-4">Rating Summary</h3>
              {ratings && ratings.totalRatings > 0 ? (
                <div className="flex items-center gap-4">
                  <div className="bg-black text-white w-14 h-14 rounded-xl flex items-center justify-center text-xl font-black">
                    {ratings.averageRating.toFixed(1)}
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 font-bold uppercase tracking-widest mb-1">Total Reviews</div>
                    <div className="text-sm font-black text-black">{ratings.totalRatings} user reviews</div>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-400 font-medium">No ratings collected yet.</p>
              )}
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-xl shadow-black/5 border border-gray-100">
              <h3 className="text-gray-400 font-bold uppercase tracking-widest text-xs mb-2">Earnings (Paid)</h3>
              <div className="text-4xl font-black text-black">₹{analytics.totalEarnings}</div>
              <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mt-2">{analytics.paidRides} Razorpay payments</p>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-xl shadow-black/5 border border-gray-100">
              <h3 className="text-gray-400 font-bold uppercase tracking-widest text-xs mb-2">Active / Pending</h3>
              <div className="text-4xl font-black text-black">{analytics.active}</div>
              <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mt-2">{analytics.pendingPayment} awaiting payment</p>
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl p-6 shadow-xl shadow-black/5 border border-gray-100 min-h-[400px]">
              <div className="flex justify-between items-center border-b border-gray-100 pb-4 mb-6">
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {['active', 'past', 'collections', 'profile'].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition ${activeTab === tab ? 'bg-black text-white' : 'text-gray-400 hover:text-black hover:bg-gray-50'}`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
              </div>

              {activeTab === 'profile' ? (
                <form className="space-y-4" onSubmit={handleProfileSubmit}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">Full Name</label>
                      <input name="fullName" value={profile.fullName || ''} onChange={handleProfileChange} className="w-full bg-gray-50 border border-gray-100 rounded-xl py-3 px-4 focus:outline-none focus:border-black font-bold text-black" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">Phone Number</label>
                      <input name="phoneNumber" value={profile.phoneNumber || ''} onChange={handleProfileChange} className="w-full bg-gray-50 border border-gray-100 rounded-xl py-3 px-4 focus:outline-none focus:border-black font-bold text-black" disabled />
                      <p className="text-xs text-gray-400 mt-1">Phone number cannot be changed.</p>
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">Village</label>
                      <input name="village" value={profile.village || ''} onChange={handleProfileChange} className="w-full bg-gray-50 border border-gray-100 rounded-xl py-3 px-4 focus:outline-none focus:border-black font-bold text-black" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">Pincode</label>
                      <input name="pincode" value={profile.pincode || ''} onChange={handleProfileChange} className="w-full bg-gray-50 border border-gray-100 rounded-xl py-3 px-4 focus:outline-none focus:border-black font-bold text-black" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">Vehicle Type</label>
                      <select name="vehicleType" value={profile.vehicleType || ''} onChange={handleProfileChange} className="w-full bg-gray-50 border border-gray-100 rounded-xl py-3 px-4 focus:outline-none focus:border-black font-bold text-black appearance-none">
                        <option>Sedan</option>
                        <option>SUV</option>
                        <option>Auto</option>
                        <option>Hatchback</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">Vehicle Number</label>
                      <input name="vehicleNumber" value={profile.vehicleNumber || ''} onChange={handleProfileChange} className="w-full bg-gray-50 border border-gray-100 rounded-xl py-3 px-4 focus:outline-none focus:border-black font-bold text-black" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">Total Seats</label>
                      <input type="number" name="totalSeats" value={profile.totalSeats || ''} onChange={handleProfileChange} className="w-full bg-gray-50 border border-gray-100 rounded-xl py-3 px-4 focus:outline-none focus:border-black font-bold text-black" />
                    </div>
                  </div>
                  <div className="pt-4 border-t border-gray-100">
                    <button type="submit" disabled={profileUpdating} className="bg-black text-white font-bold py-3 px-8 rounded-xl hover:bg-gray-800 transition active:scale-95 disabled:opacity-50">
                      {profileUpdating ? 'Saving...' : 'Save Profile Changes'}
                    </button>
                  </div>
                </form>
              ) : activeTab === 'collections' ? (
                <div className="space-y-4">
                  {bookings.filter(b => b.status === 'COMPLETED' && b.paymentStatus === 'COMPLETED').map(b => (
                    <div key={b.id} className="flex justify-between items-center p-5 bg-gray-50 rounded-2xl border border-gray-100">
                      <div>
                        <div className="font-black text-black">{b.riderName}</div>
                        <div className="text-xs font-bold text-gray-500 mt-1">{b.pickupVillage} → {b.dropLocation}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-black text-black text-lg">+₹{b.agreedFare}</div>
                        <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">{b.paymentStatus || 'UNPAID'}</div>
                      </div>
                    </div>
                  ))}
                  {bookings.filter(b => b.status === 'COMPLETED').length === 0 && (
                    <div className="text-center py-12 text-gray-400 font-bold text-sm">No collections yet.</div>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {(activeTab === 'active' ?
                    bookings.filter(b => b.status !== 'COMPLETED' && b.status !== 'CANCELLED') :
                    bookings.filter(b => b.status === 'COMPLETED' || b.status === 'CANCELLED')
                  ).length === 0 ? (
                    <div className="text-center py-16 text-gray-400 font-bold text-sm">
                      No {activeTab} bookings.
                    </div>
                  ) : (
                    (activeTab === 'active' ?
                      bookings.filter(b => b.status !== 'COMPLETED' && b.status !== 'CANCELLED') :
                      bookings.filter(b => b.status === 'COMPLETED' || b.status === 'CANCELLED')
                    ).map((booking) => {
                      return (
                        <div key={booking.id} className="bg-gray-50 p-5 rounded-2xl border border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div className="space-y-2 flex-1">
                            <div className="flex items-center gap-2">
                              <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${getStatusColor(booking.status)}`}>
                                {getStatusLabel(booking.status)}
                              </span>
                              {booking.paymentStatus === 'COMPLETED' && (
                                <span className="bg-black text-white px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider">Paid</span>
                              )}
                            </div>
                            <div className="font-black text-black">{booking.riderName} <span className="text-gray-400 font-medium">({booking.riderPhoneNumber})</span></div>
                            <div className="text-xs font-bold text-gray-500">{booking.pickupVillage} → {booking.dropLocation}</div>
                          </div>

                          <div className="flex items-center justify-between md:justify-end gap-6 border-t md:border-t-0 border-gray-200 pt-4 md:pt-0">
                            <div className="text-right">
                              <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">fare</div>
                              <div className="font-black text-black text-xl">₹{booking.agreedFare}</div>
                            </div>

                            <div className="flex gap-2">
                              {canAcceptRide(booking) && (
                                <>
                                  <button onClick={() => handleUpdateStatus(booking.id, 'CONFIRMED')} className="bg-black hover:bg-gray-800 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition active:scale-95">Accept</button>
                                  <button onClick={() => handleUpdateStatus(booking.id, 'CANCELLED')} className="bg-white border border-gray-200 text-black hover:bg-gray-100 font-bold text-xs px-5 py-2.5 rounded-xl transition active:scale-95">Decline</button>
                                </>
                              )}
                              {canStartRide(booking) && (
                                <button onClick={() => handleUpdateStatus(booking.id, 'ONGOING')} className="bg-black hover:bg-gray-800 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition active:scale-95">Start</button>
                              )}
                              {canCompleteRide(booking) && (
                                <button onClick={() => handleUpdateStatus(booking.id, 'COMPLETED')} className="bg-black hover:bg-gray-800 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition active:scale-95">Complete</button>
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

      {showSosModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-gray-100">
            <div className="bg-black text-white px-6 py-8 text-center relative">
              <button onClick={() => setShowSosModal(false)} className="absolute top-4 right-4 text-white hover:text-gray-300">
                ✕
              </button>
              <div className="text-5xl mb-3">🚨</div>
              <h3 className="text-xl font-black uppercase tracking-wider">Driver Emergency Alert</h3>
            </div>
            <div className="p-6 space-y-4">
              <button onClick={handleTriggerSos} className="w-full bg-red-600 hover:bg-red-700 text-white font-black py-4 px-6 rounded-2xl text-base transition tracking-wider uppercase active:scale-95">
                TRANSMIT PANIC CALL
              </button>
              <div className="border-t border-gray-100 pt-4 text-center">
                <a href="tel:100" className="inline-block bg-gray-100 text-black font-bold px-6 py-3 rounded-xl hover:bg-gray-200 transition">
                  Dial Police (100)
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DriverDashboard;
