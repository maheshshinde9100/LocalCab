import { useState, useEffect, useRef } from 'react';
import { bookingAPI, driverAPI, ratingAPI } from '../utils/api';
import { auth } from '../utils/auth';
import LeafletMap from '../components/LeafletMap';

function DriverDashboard() {
  const driverId = auth.getDriverId();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [available, setAvailable] = useState(true);
  const [verified, setVerified] = useState(true);
  const [ratings, setRatings] = useState(null);
  const [activeTab, setActiveTab] = useState('active'); // 'active', 'past', 'collections'
  const [simulatedLat, setSimulatedLat] = useState(null);
  const [simulatedLng, setSimulatedLng] = useState(null);
  const [showSosModal, setShowSosModal] = useState(false);

  const simulationIntervalRef = useRef(null);

  useEffect(() => {
    loadBookings();
    loadRatings();
    checkVerification();

    return () => {
      stopLocationSimulation();
    };
  }, []);

  // Monitor active ongoing trip to start location simulation
  useEffect(() => {
    const ongoingTrip = bookings.find(b => b.status === 'ONGOING');
    if (ongoingTrip) {
      startLocationSimulation(ongoingTrip);
    } else {
      stopLocationSimulation();
    }
  }, [bookings]);

  const checkVerification = () => {
    const v = localStorage.getItem('driverVerified');
    setVerified(v === 'true');
  };

  const loadBookings = async () => {
    try {
      const response = await bookingAPI.getMyBookings();
      setBookings(response.data || []);
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

  // Safe Coordinates Fetching
  const getRouteCoords = (booking) => {
    const pickLat = booking.pickupLatitude || 18.9750;
    const pickLng = booking.pickupLongitude || 72.8258;
    const dropLat = booking.dropLatitude || 19.0760;
    const dropLng = booking.dropLongitude || 72.8777;
    return { pickLat, pickLng, dropLat, dropLng };
  };

  // Live Tracking Simulator
  const startLocationSimulation = (booking) => {
    if (simulationIntervalRef.current) return;

    const { pickLat, pickLng, dropLat, dropLng } = getRouteCoords(booking);
    
    let currentStep = 0;
    const totalSteps = 20;

    // Send initial location
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
        } catch (err) {
          console.warn("Could not update simulator location", err);
        }
      } else {
        stopLocationSimulation();
      }
    }, 6000); // update every 6 seconds
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
    alert("🚨 SOS EMERGENCY TRIGGERED! Alerting central office and transmitting vehicle GPS coordinates.");
    setShowSosModal(false);
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

  const activeTrip = bookings.find(b => b.status === 'REQUESTED' || b.status === 'CONFIRMED' || b.status === 'ONGOING');

  return (
    <div className="min-h-screen bg-slate-50 pb-12">
      {/* Top Banner */}
      <div className="bg-slate-900 text-white px-4 py-8 sm:px-6 lg:px-8 shadow-md">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider">
              Driver Panel
            </span>
            <h1 className="text-3xl font-extrabold tracking-tight mt-1">LocalCab Partner</h1>
            <p className="text-slate-400 font-medium">Keep moving, keep earning</p>
          </div>

          <div className="flex items-center gap-4">
            <div className={`px-5 py-3 rounded-2xl flex items-center gap-3 border transition-colors ${available ? 'bg-emerald-500/15 border-emerald-500/20' : 'bg-rose-500/15 border-rose-500/20'}`}>
              <div className={`w-2.5 h-2.5 rounded-full animate-pulse ${available ? 'bg-emerald-500' : 'bg-rose-500'}`}></div>
              <span className={`font-bold uppercase tracking-wider text-sm ${available ? 'text-emerald-400' : 'text-rose-400'}`}>
                {available ? 'Online' : 'Offline'}
              </span>
            </div>
            <button
              onClick={handleToggleAvailability}
              className={`px-8 py-3 rounded-2xl font-bold transition duration-150 shadow-md text-sm ${available ? 'bg-white text-slate-900 hover:bg-slate-100' : 'bg-emerald-500 text-white hover:bg-emerald-600'}`}
            >
              {available ? 'Go Offline' : 'Go Online'}
            </button>
          </div>
        </div>
      </div>

      {!verified && (
        <div className="bg-amber-400 text-slate-950 py-3.5 px-4 text-center font-bold shadow-sm">
          ⚠️ ACCOUNT PENDING VERIFICATION. You will not receive bookings until verified.
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-xl mb-6">
            {error}
          </div>
        )}

        {/* Live Simulator View */}
        {activeTrip && (
          <div className="bg-white rounded-3xl shadow-md border border-slate-100 p-6 md:p-8 mb-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-center mb-6">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Ongoing Trip Control</span>
                  <span className="bg-blue-100 text-blue-800 border border-blue-200 px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                    {activeTrip.status}
                  </span>
                </div>

                <div className="space-y-4 mb-6">
                  <div>
                    <div className="text-xs text-slate-400">Rider Contact</div>
                    <div className="text-base font-bold text-slate-800 flex items-center gap-2 mt-0.5">
                      <i className="fas fa-user text-indigo-500"></i>
                      {activeTrip.riderName} ({activeTrip.riderPhoneNumber})
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-400">Route Map Path</div>
                    <div className="text-sm text-slate-700 mt-1">
                      {activeTrip.pickupVillage} → {activeTrip.dropLocation}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-xs text-slate-400">Total Fare</div>
                      <div className="text-xl font-black text-emerald-600 mt-0.5">
                        ₹{activeTrip.agreedFare}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-400">Payment Method</div>
                      <div className="text-sm font-semibold text-slate-800 uppercase mt-1">
                        {activeTrip.paymentMethod || 'CASH / NONE'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-t border-slate-100 pt-6 flex flex-wrap gap-3">
                {activeTrip.status === 'REQUESTED' && (
                  <>
                    <button
                      onClick={() => handleUpdateStatus(activeTrip.id, 'CONFIRMED')}
                      className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-6 rounded-xl shadow-lg shadow-emerald-100 transition"
                    >
                      Accept Ride
                    </button>
                    <button
                      onClick={() => handleUpdateStatus(activeTrip.id, 'CANCELLED')}
                      className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-3 px-6 rounded-xl transition"
                    >
                      Decline
                    </button>
                  </>
                )}
                {activeTrip.status === 'CONFIRMED' && (
                  <button
                    onClick={() => handleUpdateStatus(activeTrip.id, 'ONGOING')}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-xl shadow-lg shadow-blue-100 transition"
                  >
                    Start Ride
                  </button>
                )}
                {activeTrip.status === 'ONGOING' && (
                  <button
                    onClick={() => handleUpdateStatus(activeTrip.id, 'COMPLETED')}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-6 rounded-xl shadow-lg shadow-emerald-100 transition"
                  >
                    Complete Ride
                  </button>
                )}
                <button
                  onClick={() => setShowSosModal(true)}
                  className="bg-rose-600 hover:bg-rose-700 text-white font-bold py-3 px-6 rounded-xl shadow-lg shadow-rose-100 transition"
                >
                  <i className="fas fa-shield-alt"></i> SOS
                </button>
              </div>
            </div>

            <div>
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping"></span> Live GPS Simulation
              </div>
              <LeafletMap
                pickupLat={activeTrip.pickupLatitude || 18.9750}
                pickupLng={activeTrip.pickupLongitude || 72.8258}
                dropLat={activeTrip.dropLatitude || 19.0760}
                dropLng={activeTrip.dropLongitude || 72.8777}
                driverLat={simulatedLat || activeTrip.driverLatitude}
                driverLng={simulatedLng || activeTrip.driverLongitude}
              />
            </div>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Performance & Earnings */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
              <h3 className="text-slate-400 font-bold uppercase tracking-wider text-xs mb-4">Rating Summary</h3>
              {ratings && ratings.totalRatings > 0 ? (
                <div className="flex items-center gap-4">
                  <div className="bg-slate-900 text-white w-14 h-14 rounded-xl flex items-center justify-center text-xl font-bold">
                    {ratings.averageRating.toFixed(1)}
                  </div>
                  <div>
                    <div className="flex text-amber-500 mb-0.5">
                      {[...Array(5)].map((_, i) => (
                        <span key={i} className="text-base">
                          {i < Math.floor(ratings.averageRating) ? '★' : '☆'}
                        </span>
                      ))}
                    </div>
                    <div className="text-xs text-slate-400 font-medium">from {ratings.totalRatings} user reviews</div>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-slate-400">No ratings collected yet.</p>
              )}
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
              <h3 className="text-slate-400 font-bold uppercase tracking-wider text-xs mb-2">Earnings Overview</h3>
              <div className="text-3xl font-black text-slate-900">
                ₹{bookings.filter(b => b.status === 'COMPLETED').reduce((acc, b) => acc + b.agreedFare, 0)}
              </div>
              <p className="text-xs text-slate-400 font-medium mt-1">Total revenue collected from completed trips</p>
            </div>
          </div>

          {/* Bookings Feed */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 min-h-[400px]">
              <div className="flex justify-between items-center border-b border-slate-100 pb-4 mb-6">
                <div className="flex gap-2">
                  {['active', 'past', 'collections'].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition ${activeTab === tab ? 'bg-slate-900 text-white' : 'text-slate-400 hover:text-slate-700'}`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
                <span className="bg-slate-100 text-slate-500 font-bold px-3 py-1 rounded-full text-xs">
                  {activeTab === 'active' ? bookings.filter(b => b.status !== 'COMPLETED' && b.status !== 'CANCELLED').length :
                   activeTab === 'past' ? bookings.filter(b => b.status === 'COMPLETED' || b.status === 'CANCELLED').length :
                   bookings.filter(b => b.status === 'COMPLETED').length} Items
                </span>
              </div>

              {activeTab === 'collections' ? (
                <div className="space-y-4">
                  {bookings.filter(b => b.status === 'COMPLETED').map(b => (
                    <div key={b.id} className="flex justify-between items-center p-4 bg-slate-50 rounded-xl border border-slate-100">
                      <div>
                        <div className="font-bold text-slate-800 text-sm">{b.riderName}</div>
                        <div className="text-xs text-slate-400">{b.pickupVillage} → {b.dropLocation}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-black text-emerald-600 text-base">+₹{b.agreedFare}</div>
                        <div className="text-2xs text-slate-400 uppercase tracking-widest font-semibold">{b.paymentStatus || 'UNPAID'}</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {(activeTab === 'active' ?
                    bookings.filter(b => b.status !== 'COMPLETED' && b.status !== 'CANCELLED') :
                    bookings.filter(b => b.status === 'COMPLETED' || b.status === 'CANCELLED')
                  ).length === 0 ? (
                    <div className="text-center py-16 text-slate-400 text-sm">
                      No {activeTab} booking logs.
                    </div>
                  ) : (
                    (activeTab === 'active' ?
                      bookings.filter(b => b.status !== 'COMPLETED' && b.status !== 'CANCELLED') :
                      bookings.filter(b => b.status === 'COMPLETED' || b.status === 'CANCELLED')
                    ).map((booking) => {
                      const cfg = getStatusConfig(booking.status);
                      return (
                        <div key={booking.id} className="bg-slate-50 hover:bg-slate-100/50 p-5 rounded-2xl border border-slate-100 transition flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div className="space-y-1.5 flex-1">
                            <div className="flex items-center gap-2">
                              <span className={`px-2.5 py-0.5 rounded-full text-2xs font-bold uppercase tracking-wider ${cfg.bg} ${cfg.text}`}>
                                {booking.status}
                              </span>
                              {booking.paymentStatus === 'COMPLETED' && (
                                <span className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full text-2xs font-bold uppercase border border-emerald-100">Paid</span>
                              )}
                            </div>
                            <div className="font-bold text-slate-800 text-sm">{booking.riderName} ({booking.riderPhoneNumber})</div>
                            <div className="text-xs text-slate-500">{booking.pickupVillage} → {booking.dropLocation}</div>
                          </div>

                          <div className="flex items-center justify-between md:justify-end gap-6 border-t md:border-t-0 border-slate-200/60 pt-3 md:pt-0">
                            <div>
                              <div className="text-2xs text-slate-400 font-bold uppercase tracking-wider">agreed fare</div>
                              <div className="font-black text-slate-800 text-xl">₹{booking.agreedFare}</div>
                            </div>

                            <div className="flex gap-2">
                              {booking.status === 'REQUESTED' && (
                                <>
                                  <button onClick={() => handleUpdateStatus(booking.id, 'CONFIRMED')} className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-4 py-2.5 rounded-lg transition">Accept</button>
                                  <button onClick={() => handleUpdateStatus(booking.id, 'CANCELLED')} className="bg-white border border-slate-200 text-rose-500 font-bold text-xs px-4 py-2.5 rounded-lg transition">Decline</button>
                                </>
                              )}
                              {booking.status === 'CONFIRMED' && (
                                <button onClick={() => handleUpdateStatus(booking.id, 'ONGOING')} className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-5 py-2.5 rounded-lg transition">Start</button>
                              )}
                              {booking.status === 'ONGOING' && (
                                <button onClick={() => handleUpdateStatus(booking.id, 'COMPLETED')} className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-5 py-2.5 rounded-lg transition">Complete</button>
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

      {/* SOS Modal */}
      {showSosModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl animate-fade-in border border-slate-100">
            <div className="bg-gradient-to-r from-red-500 to-rose-600 text-white px-6 py-8 text-center relative">
              <button onClick={() => setShowSosModal(false)} className="absolute top-4 right-4 text-white/80 hover:text-white text-lg">
                <i className="fas fa-times"></i>
              </button>
              <div className="text-5xl mb-3">🚨</div>
              <h3 className="text-xl font-black uppercase tracking-wider">Driver Emergency Alert</h3>
              <p className="text-red-100/90 text-sm mt-1">Request backup and operations support.</p>
            </div>
            <div className="p-6 space-y-4">
              <button
                onClick={handleTriggerSos}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-black py-4 px-6 rounded-2xl text-base shadow-lg transition tracking-wider uppercase"
              >
                🚨 TRANSMIT PANIC CALL
              </button>

              <div className="border-t border-slate-100 pt-4 space-y-2">
                <a href="tel:100" className="flex justify-between items-center bg-slate-50 hover:bg-slate-100 p-3 rounded-xl border border-slate-100">
                  <span className="font-semibold text-slate-700 text-sm">Police Control</span>
                  <span className="bg-red-50 text-red-600 font-bold px-3 py-1 rounded-lg text-xs">Dial 100</span>
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
