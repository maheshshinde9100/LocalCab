import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { bookingAPI, riderAPI } from '../utils/api';
import { auth } from '../utils/auth';
import LeafletMap from '../components/LeafletMap';

function RiderDashboard() {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [rider, setRider] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeBooking, setActiveBooking] = useState(null);
  const [showSosModal, setShowSosModal] = useState(false);
  const [paying, setPaying] = useState(false);

  const eventSourceRef = useRef(null);

  useEffect(() => {
    if (!auth.isRiderAuthenticated()) {
      navigate('/rider/login');
      return;
    }
    loadData();

    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, []);

  const loadData = async () => {
    try {
      const riderId = auth.getRiderId();
      const [riderRes, bookingsRes] = await Promise.all([
        riderAPI.getProfile(riderId),
        bookingAPI.getBookingsByRiderId(riderId),
      ]);
      setRider(riderRes.data);
      const list = bookingsRes.data || [];
      setBookings(list);

      // Find first active booking (REQUESTED, CONFIRMED, ONGOING)
      const active = list.find(
        (b) => b.status === 'REQUESTED' || b.status === 'CONFIRMED' || b.status === 'ONGOING'
      );
      if (active) {
        setActiveBooking(active);
        setupSse(active.id);
      } else {
        setActiveBooking(null);
        if (eventSourceRef.current) {
          eventSourceRef.current.close();
          eventSourceRef.current = null;
        }
      }
    } catch (err) {
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const setupSse = (bookingId) => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';
    const sseUrl = `${baseURL}/bookings/${bookingId}/stream`;

    const source = new EventSource(sseUrl);
    eventSourceRef.current = source;

    source.addEventListener('booking-update', (event) => {
      try {
        const updated = JSON.parse(event.data);
        setActiveBooking(updated);
        // Also update in list
        setBookings(prev => prev.map(b => b.id === updated.id ? updated : b));
        
        // If no longer active, refresh page / disconnect
        if (updated.status === 'COMPLETED' || updated.status === 'CANCELLED') {
          source.close();
          eventSourceRef.current = null;
          loadData();
        }
      } catch (err) {
        console.error("Error parsing booking SSE data", err);
      }
    });

    source.onerror = () => {
      console.warn("SSE connection error, closing stream");
      source.close();
    };
  };

  const handleLogout = () => {
    auth.logout();
    navigate('/');
  };

  // Dynamically load Razorpay SDK Script
  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayment = async (booking) => {
    setPaying(true);
    try {
      const isScriptLoaded = await loadRazorpayScript();
      if (!isScriptLoaded) {
        alert('Failed to load Razorpay payment SDK. Please check your internet connection.');
        setPaying(false);
        return;
      }

      // 1. Create order on backend
      const orderRes = await bookingAPI.createRazorpayOrder(booking.id);
      const bookingWithOrder = orderRes.data;

      // 2. Fetch public configuration (Key ID)
      const configRes = await bookingAPI.getPublicConfig();
      const keyId = configRes.data.razorpayKeyId;

      // 3. Configure Razorpay options
      const options = {
        key: keyId,
        amount: Math.round(bookingWithOrder.agreedFare * 100),
        currency: 'INR',
        name: 'LocalCab Inc.',
        description: `Payment for ride from ${bookingWithOrder.pickupVillage} to ${bookingWithOrder.dropLocation}`,
        order_id: bookingWithOrder.razorpayOrderId,
        handler: async function (response) {
          try {
            await bookingAPI.verifyRazorpayPayment(
              bookingWithOrder.id,
              response.razorpay_payment_id,
              response.razorpay_signature
            );
            alert('Payment received successfully! Thank you for riding with LocalCab.');
            loadData();
          } catch (verifyErr) {
            alert('Payment verification failed: ' + (verifyErr.response?.data?.message || verifyErr.message));
          }
        },
        prefill: {
          name: rider?.fullName || '',
          contact: rider?.phoneNumber || ''
        },
        theme: {
          color: '#2563eb'
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error(err);
      alert('Failed to initialize Razorpay checkout: ' + (err.response?.data?.message || err.message));
    } finally {
      setPaying(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'REQUESTED': return 'from-yellow-400 to-amber-500 text-white shadow-yellow-100';
      case 'CONFIRMED': return 'from-blue-500 to-indigo-600 text-white shadow-blue-100';
      case 'ONGOING': return 'from-emerald-500 to-teal-600 text-white shadow-emerald-100';
      case 'COMPLETED': return 'from-gray-500 to-slate-600 text-white';
      case 'CANCELLED': return 'from-red-500 to-rose-600 text-white';
      default: return 'from-gray-400 to-gray-500 text-white';
    }
  };

  const handleTriggerSos = () => {
    alert("🚨 SOS EMERGENCY TRIGGERED! Alerting driver and simulated emergency operations room.");
    setShowSosModal(false);
  };

  return (
    <div className="min-h-screen bg-slate-50/50 pb-12">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <span className="bg-blue-500/30 text-blue-100 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider">
                Rider Panel
              </span>
              <h1 className="text-3xl font-extrabold tracking-tight mt-1">LocalCab</h1>
              <p className="text-blue-100/90 mt-1">Hello, {rider?.fullName}</p>
            </div>
            <div className="flex gap-3">
              <Link
                to="/drivers/available"
                className="bg-white/10 hover:bg-white/20 transition backdrop-blur-md text-white font-medium px-5 py-2.5 rounded-xl flex items-center gap-2 border border-white/10"
              >
                <i className="fas fa-search"></i> Find Drivers
              </Link>
              <button
                onClick={handleLogout}
                className="bg-white/10 hover:bg-red-500/20 hover:text-red-100 transition backdrop-blur-md text-white font-medium px-4 py-2.5 rounded-xl border border-white/10"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-center gap-2">
            <i className="fas fa-exclamation-circle"></i>
            {error}
          </div>
        )}

        {/* Active Trip Section */}
        {activeBooking && (
          <div className="bg-white rounded-3xl shadow-xl shadow-slate-100 border border-slate-100 overflow-hidden mb-8">
            <div className="p-6 md:p-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Trip details card */}
              <div className="flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest">
                      Active Booking Details
                    </span>
                    <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider bg-gradient-to-r shadow-md ${getStatusColor(activeBooking.status)}`}>
                      {activeBooking.status}
                    </span>
                  </div>

                  <div className="space-y-4 mb-6">
                    <div>
                      <div className="text-xs text-slate-400">PICKUP LOCATION</div>
                      <div className="text-base font-semibold text-slate-800 flex items-center gap-2 mt-0.5">
                        <i className="fas fa-map-marker-alt text-blue-500"></i>
                        {activeBooking.pickupVillage} {activeBooking.pickupLandmark && `(${activeBooking.pickupLandmark})`}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-400">DROP LOCATION</div>
                      <div className="text-base font-semibold text-slate-800 flex items-center gap-2 mt-0.5">
                        <i className="fas fa-flag text-rose-500"></i>
                        {activeBooking.dropLocation}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-xs text-slate-400">AGREED FARE</div>
                        <div className="text-xl font-extrabold text-blue-600 mt-0.5">
                          ₹{activeBooking.agreedFare}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-slate-400">DRIVER DETAILS</div>
                        <div className="text-base font-semibold text-slate-800 flex items-center gap-2 mt-0.5">
                          <i className="fas fa-user-tie text-indigo-500"></i>
                          {activeBooking.driverPhoneNumber}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border-t border-slate-100 pt-6 flex flex-wrap gap-3">
                  <button
                    onClick={() => setShowSosModal(true)}
                    className="flex-1 min-w-[140px] bg-rose-600 hover:bg-rose-700 text-white font-bold py-3 px-6 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-rose-100 transition duration-150"
                  >
                    <i className="fas fa-shield-alt"></i> EMERGENCY SOS
                  </button>
                  {activeBooking.status === 'REQUESTED' && (
                    <button
                      onClick={async () => {
                        if (confirm('Are you sure you want to cancel this booking?')) {
                          try {
                            await bookingAPI.cancelByRider(activeBooking.id, rider.id, 'Cancelled by rider from dashboard');
                            loadData();
                          } catch (err) {
                            alert('Failed to cancel: ' + err.message);
                          }
                        }
                      }}
                      className="flex-1 min-w-[140px] bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-3 px-6 rounded-xl transition duration-150"
                    >
                      Cancel Ride
                    </button>
                  )}
                </div>
              </div>

              {/* Real-time map */}
              <div className="relative">
                <div className="absolute top-4 left-4 z-20 bg-white/95 backdrop-blur-sm px-4 py-2.5 rounded-2xl shadow-md border border-slate-100 text-xs font-semibold text-slate-700 flex items-center gap-2">
                  <span className="flex h-2.5 w-2.5 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                  </span>
                  Live Tracking Map
                </div>
                <LeafletMap
                  pickupLat={activeBooking.pickupLatitude || 18.9750}
                  pickupLng={activeBooking.pickupLongitude || 72.8258}
                  dropLat={activeBooking.dropLatitude || 19.0760}
                  dropLng={activeBooking.dropLongitude || 72.8777}
                  driverLat={activeBooking.driverLatitude}
                  driverLng={activeBooking.driverLongitude}
                />
              </div>
            </div>
          </div>
        )}

        {/* Analytics Statistics Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex items-center gap-5">
            <div className="h-12 w-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center text-lg">
              <i className="fas fa-history"></i>
            </div>
            <div>
              <div className="text-2xl font-extrabold text-slate-800">{bookings.length}</div>
              <div className="text-sm text-slate-400 font-medium">Total Bookings</div>
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex items-center gap-5">
            <div className="h-12 w-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-lg">
              <i className="fas fa-check-circle"></i>
            </div>
            <div>
              <div className="text-2xl font-extrabold text-slate-800">
                {bookings.filter(b => b.status === 'COMPLETED').length}
              </div>
              <div className="text-sm text-slate-400 font-medium">Completed Rides</div>
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex items-center gap-5">
            <div className="h-12 w-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center text-lg">
              <i className="fas fa-route"></i>
            </div>
            <div>
              <div className="text-2xl font-extrabold text-slate-800">
                {bookings.filter(b => b.status === 'REQUESTED' || b.status === 'CONFIRMED' || b.status === 'ONGOING').length}
              </div>
              <div className="text-sm text-slate-400 font-medium">Active Rides</div>
            </div>
          </div>
        </div>

        {/* History Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center">
            <h2 className="text-lg font-bold text-slate-800">Recent Trip History</h2>
            <span className="text-xs text-slate-400 font-semibold">{bookings.length} trips</span>
          </div>
          <div className="divide-y divide-slate-100 overflow-x-auto">
            {bookings.length === 0 ? (
              <div className="px-6 py-12 text-center text-slate-400">
                No trips booked yet. Click "Find Drivers" to get started!
              </div>
            ) : (
              bookings.map((booking) => (
                <div key={booking.id} className="px-6 py-5 hover:bg-slate-50/50 transition duration-150">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className={`px-2.5 py-0.5 rounded-full text-2xs font-bold uppercase tracking-wider bg-gradient-to-r ${getStatusColor(booking.status)}`}>
                          {booking.status}
                        </span>
                        {booking.paymentStatus === 'COMPLETED' && (
                          <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full text-2xs font-bold uppercase tracking-wider flex items-center gap-1">
                            <i className="fas fa-check-circle"></i> Paid
                          </span>
                        )}
                        {booking.status === 'COMPLETED' && booking.paymentStatus !== 'COMPLETED' && (
                          <span className="bg-rose-50 text-rose-700 border border-rose-200 px-2 py-0.5 rounded-full text-2xs font-bold uppercase tracking-wider flex items-center gap-1">
                            <i className="fas fa-clock"></i> Unpaid
                          </span>
                        )}
                      </div>
                      <div className="text-sm font-semibold text-slate-800">
                        {booking.pickupVillage} → {booking.dropLocation}
                      </div>
                      <div className="text-xs text-slate-400">
                        Fare: ₹{booking.agreedFare} • Date: {booking.createdAt ? new Date(booking.createdAt).toLocaleString() : 'N/A'}
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {booking.status === 'COMPLETED' && booking.paymentStatus !== 'COMPLETED' && (
                        <button
                          onClick={() => handlePayment(booking)}
                          disabled={paying}
                          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs px-4 py-2 rounded-lg shadow-sm shadow-blue-100 flex items-center gap-1.5 disabled:opacity-50 transition"
                        >
                          <i className="fas fa-credit-card"></i> {paying ? 'Processing...' : 'Pay with Razorpay'}
                        </button>
                      )}
                      {booking.status === 'COMPLETED' && (
                        <Link
                          to="/ratings/create"
                          state={{ bookingId: booking.id, driverId: booking.driverId }}
                          className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs px-4 py-2 rounded-lg transition"
                        >
                          Rate Driver
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Emergency SOS Modal */}
      {showSosModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl animate-fade-in border border-slate-100">
            <div className="bg-gradient-to-r from-red-500 to-rose-600 text-white px-6 py-8 text-center relative">
              <button
                onClick={() => setShowSosModal(false)}
                className="absolute top-4 right-4 text-white/80 hover:text-white text-lg"
              >
                <i className="fas fa-times"></i>
              </button>
              <div className="text-5xl mb-3">🚨</div>
              <h3 className="text-xl font-black uppercase tracking-wider">Emergency SOS Trigger</h3>
              <p className="text-red-100/90 text-sm mt-1">If you are in danger, act immediately.</p>
            </div>
            <div className="p-6 space-y-4">
              <button
                onClick={handleTriggerSos}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-black py-4 px-6 rounded-2xl text-base shadow-lg shadow-red-200 transition tracking-wider uppercase"
              >
                🚨 ACTIVATE EMERGENCY ALARM
              </button>

              <div className="border-t border-slate-100 pt-4 space-y-2.5">
                <div className="text-xs font-semibold text-slate-400 uppercase tracking-widest">
                  Quick Phone Dialers
                </div>
                <a
                  href="tel:100"
                  className="flex justify-between items-center bg-slate-50 hover:bg-slate-100/80 transition p-3 rounded-xl border border-slate-100"
                >
                  <span className="font-semibold text-slate-700">Police Emergency Control</span>
                  <span className="bg-red-50 text-red-600 font-bold px-3 py-1 rounded-lg text-xs">Dial 100</span>
                </a>
                <a
                  href="tel:102"
                  className="flex justify-between items-center bg-slate-50 hover:bg-slate-100/80 transition p-3 rounded-xl border border-slate-100"
                >
                  <span className="font-semibold text-slate-700">Medical Ambulance Services</span>
                  <span className="bg-red-50 text-red-600 font-bold px-3 py-1 rounded-lg text-xs">Dial 102</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default RiderDashboard;
