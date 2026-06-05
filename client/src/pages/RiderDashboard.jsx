import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { bookingAPI, riderAPI } from '../utils/api';
import { auth } from '../utils/auth';
import LeafletMap from '../components/LeafletMap';
import {
  isActiveBooking,
  canPayBooking,
  getStatusColor,
  getStatusLabel,
  computeRiderAnalytics,
} from '../utils/bookingHelpers';

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
  const razorpayKeyIdRef = useRef(null);

  useEffect(() => {
    if (!auth.isRiderAuthenticated()) {
      navigate('/login');
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
      const [riderRes, bookingsRes] = await Promise.all([
        riderAPI.getMyProfile(),
        bookingAPI.getMyRiderBookings(),
      ]);
      setRider(riderRes.data);
      auth.setRiderId(riderRes.data.id);
      auth.setRiderDetails(riderRes.data.fullName, riderRes.data.phoneNumber);
      const list = bookingsRes.data || [];
      setBookings(list);

      const active = list.find((b) => isActiveBooking(b));
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
        setBookings(prev => prev.map(b => b.id === updated.id ? updated : b));
        
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
      source.close();
    };
  };

  const handleLogout = () => {
    auth.logout();
    navigate('/');
  };

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }
      const existing = document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]');
      if (existing) {
        existing.addEventListener('load', () => resolve(true));
        existing.addEventListener('error', () => resolve(false));
        return;
      }
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
        return;
      }

      const orderRes = await bookingAPI.createRazorpayOrder(booking.id);
      const bookingWithOrder = orderRes.data;

      if (!razorpayKeyIdRef.current) {
        const configRes = await bookingAPI.getPublicConfig();
        razorpayKeyIdRef.current = configRes.data.razorpayKeyId;
      }

      const options = {
        key: razorpayKeyIdRef.current,
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
          } finally {
            setPaying(false);
          }
        },
        modal: {
          ondismiss: () => setPaying(false),
        },
        prefill: {
          name: rider?.fullName || '',
          contact: rider?.phoneNumber || ''
        },
        theme: {
          color: '#000000'
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error(err);
      alert('Failed to initialize Razorpay checkout: ' + (err.response?.data?.message || err.message));
      setPaying(false);
    }
  };

  const analytics = computeRiderAnalytics(bookings);

  const handleTriggerSos = () => {
    alert("🚨 SOS EMERGENCY TRIGGERED! Alerting driver and simulated emergency operations room.");
    setShowSosModal(false);
  };

  return (
    <div className="min-h-screen bg-white pb-12">
      {/* Header */}
      <div className="bg-black text-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-between items-center">
            <div>
              <span className="bg-white/10 border border-white/20 text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                Rider Panel
              </span>
              <h1 className="text-3xl font-black tracking-tight mt-3">LocalCab</h1>
              <p className="text-gray-400 mt-1 font-medium">Hello, {rider?.fullName}</p>
            </div>
            <div className="flex gap-3">
              <Link
                to="/drivers/available"
                className="bg-white text-black hover:bg-gray-200 transition font-bold px-5 py-2.5 rounded-xl flex items-center gap-2"
              >
                Find Drivers
              </Link>
              <button
                onClick={handleLogout}
                className="bg-transparent border border-white/20 hover:bg-white/10 transition text-white font-bold px-4 py-2.5 rounded-xl"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="bg-gray-50 border border-gray-200 text-black px-4 py-3 rounded-xl mb-6 flex items-center gap-2 font-medium">
            {error}
          </div>
        )}

        {/* Active Trip Section */}
        {activeBooking && (
          <div className="bg-white rounded-3xl shadow-2xl shadow-black/5 border border-gray-100 overflow-hidden mb-8">
            <div className="p-6 md:p-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                      Active Booking
                    </span>
                    <span className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider ${getStatusColor(activeBooking.status)}`}>
                      {getStatusLabel(activeBooking.status)}
                    </span>
                  </div>

                  <div className="space-y-6 mb-6">
                    <div>
                      <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Pickup</div>
                      <div className="text-lg font-black text-black flex items-center gap-2">
                        <div className="w-2 h-2 bg-black rounded-full"></div>
                        {activeBooking.pickupVillage} {activeBooking.pickupLandmark && `(${activeBooking.pickupLandmark})`}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Dropoff</div>
                      <div className="text-lg font-black text-black flex items-center gap-2">
                        <div className="w-2 h-2 border-2 border-black"></div>
                        {activeBooking.dropLocation}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Agreed Fare</div>
                        <div className="text-2xl font-black text-black">
                          ₹{activeBooking.agreedFare}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Driver Details</div>
                        <div className="text-lg font-black text-black">
                          {activeBooking.driverPhoneNumber}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {activeBooking.status === 'REQUESTED' && (
                  <p className="text-sm text-gray-500 font-medium mb-4 bg-gray-50 p-4 rounded-xl">
                    Waiting for driver to accept your ride request...
                  </p>
                )}
                {canPayBooking(activeBooking) && (
                  <p className="text-sm text-amber-800 font-bold mb-4 bg-amber-50 p-4 rounded-xl border border-amber-100">
                    Driver accepted! Pay ₹{activeBooking.agreedFare} via Razorpay to fully book this ride.
                  </p>
                )}
                {activeBooking.status === 'BOOKED' && (
                  <p className="text-sm text-green-800 font-bold mb-4 bg-green-50 p-4 rounded-xl border border-green-100">
                    Payment received. Your ride is fully booked. Driver will start the trip soon.
                  </p>
                )}

                <div className="border-t border-gray-100 pt-6 flex flex-wrap gap-3">
                  {canPayBooking(activeBooking) && (
                    <button
                      onClick={() => handlePayment(activeBooking)}
                      disabled={paying}
                      className="flex-1 bg-black hover:bg-gray-800 text-white font-bold py-3 px-6 rounded-xl transition active:scale-95 disabled:opacity-50"
                    >
                      {paying ? 'Processing...' : 'PAY VIA RAZORPAY'}
                    </button>
                  )}
                  <button
                    onClick={() => setShowSosModal(true)}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-xl transition active:scale-95"
                  >
                    SOS
                  </button>
                  {activeBooking.status === 'REQUESTED' && (
                    <button
                      onClick={async () => {
                        if (confirm('Are you sure you want to cancel this booking?')) {
                          try {
                            await bookingAPI.cancelByRider(activeBooking.id, rider?.id || auth.getRiderId(), 'Cancelled by rider from dashboard');
                            loadData();
                          } catch (err) {
                            alert('Failed to cancel: ' + err.message);
                          }
                        }
                      }}
                      className="flex-1 bg-gray-100 hover:bg-gray-200 text-black font-bold py-3 px-6 rounded-xl transition active:scale-95"
                    >
                      Cancel Ride
                    </button>
                  )}
                </div>
              </div>

              {/* Real-time map */}
              <div className="relative h-full min-h-[300px] border border-gray-200 rounded-2xl overflow-hidden">
                <div className="absolute top-4 left-4 z-20 bg-white/95 backdrop-blur-sm px-4 py-2.5 rounded-2xl shadow-sm border border-gray-100 text-xs font-bold text-black flex items-center gap-2">
                  <span className="flex h-2 w-2 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-black opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-black"></span>
                  </span>
                  Live Tracking Map
                </div>
                <LeafletMap
                  booking={activeBooking}
                  driverLat={activeBooking.driverLatitude}
                  driverLng={activeBooking.driverLongitude}
                />
              </div>
            </div>
          </div>
        )}

        {/* Analytics Statistics Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-xl shadow-black/5 border border-gray-100 p-6">
            <div className="text-4xl font-black text-black mb-2">{analytics.total}</div>
            <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">Total Bookings</div>
          </div>
          <div className="bg-white rounded-2xl shadow-xl shadow-black/5 border border-gray-100 p-6">
            <div className="text-4xl font-black text-black mb-2">{analytics.active}</div>
            <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">Active Rides</div>
          </div>
          <div className="bg-white rounded-2xl shadow-xl shadow-black/5 border border-gray-100 p-6">
            <div className="text-4xl font-black text-black mb-2">{analytics.paid}</div>
            <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">Paid Rides</div>
          </div>
          <div className="bg-white rounded-2xl shadow-xl shadow-black/5 border border-gray-100 p-6">
            <div className="text-4xl font-black text-black mb-2">₹{analytics.totalSpent}</div>
            <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">Total Spent</div>
          </div>
        </div>

        {/* History Table */}
        <div className="bg-white rounded-2xl shadow-xl shadow-black/5 border border-gray-100 overflow-hidden">
          <div className="px-6 py-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
            <h2 className="text-lg font-black text-black">Recent Trip History</h2>
            <span className="text-xs text-black bg-white border border-gray-200 px-3 py-1 rounded-full font-bold">{bookings.length} trips</span>
          </div>
          <div className="divide-y divide-gray-100">
            {bookings.length === 0 ? (
              <div className="px-6 py-12 text-center text-gray-400 font-bold text-sm">
                No trips booked yet. Click "Find Drivers" to get started!
              </div>
            ) : (
              bookings.map((booking) => (
                <div key={booking.id} className="px-6 py-6 hover:bg-gray-50 transition">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${getStatusColor(booking.status)}`}>
                          {getStatusLabel(booking.status)}
                        </span>
                        {booking.paymentStatus === 'COMPLETED' && (
                          <span className="bg-black text-white px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider">
                            Paid
                          </span>
                        )}
                        {booking.status === 'COMPLETED' && booking.paymentStatus !== 'COMPLETED' && (
                          <span className="bg-gray-200 text-gray-600 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider">
                            Unpaid
                          </span>
                        )}
                      </div>
                      <div className="text-base font-black text-black mt-2">
                        {booking.pickupVillage} → {booking.dropLocation}
                      </div>
                      <div className="text-xs font-bold text-gray-400">
                        Fare: ₹{booking.agreedFare} • Date: {booking.createdAt ? new Date(booking.createdAt).toLocaleString() : 'N/A'}
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {canPayBooking(booking) && (
                        <button
                          onClick={() => handlePayment(booking)}
                          disabled={paying}
                          className="bg-black hover:bg-gray-800 text-white font-bold text-xs px-5 py-2.5 rounded-xl disabled:opacity-50 transition active:scale-95"
                        >
                          {paying ? 'Processing...' : 'Pay via Razorpay'}
                        </button>
                      )}
                      {booking.status === 'COMPLETED' && (
                        <Link
                          to={`/ratings/create?bookingId=${booking.id}`}
                          className="bg-gray-100 hover:bg-gray-200 text-black font-bold text-xs px-5 py-2.5 rounded-xl transition active:scale-95"
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
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-gray-100">
            <div className="bg-black text-white px-6 py-8 text-center relative">
              <button
                onClick={() => setShowSosModal(false)}
                className="absolute top-4 right-4 text-white hover:text-gray-300"
              >
                ✕
              </button>
              <div className="text-5xl mb-3">🚨</div>
              <h3 className="text-xl font-black uppercase tracking-wider">Emergency SOS</h3>
            </div>
            <div className="p-6 space-y-4">
              <button
                onClick={handleTriggerSos}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-black py-4 px-6 rounded-2xl text-base transition tracking-wider uppercase active:scale-95"
              >
                TRANSMIT PANIC CALL
              </button>

              <div className="border-t border-gray-100 pt-4 space-y-2.5 text-center">
                <a
                  href="tel:100"
                  className="inline-block w-full bg-gray-100 hover:bg-gray-200 text-black font-bold px-6 py-3 rounded-xl transition"
                >
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

export default RiderDashboard;
