import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { bookingAPI } from '../utils/api';
import { auth } from '../utils/auth';
import LeafletMap from '../components/LeafletMap';
import { canPayBooking, getStatusLabel, getStatusColor } from '../utils/bookingHelpers';

const FLOW_STEPS = ['REQUESTED', 'CONFIRMED', 'BOOKED', 'ONGOING', 'COMPLETED'];

function BookingTracking() {
  const { bookingId } = useParams();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [paying, setPaying] = useState(false);
  const razorpayKeyIdRef = useRef(null);
  const eventSourceRef = useRef(null);

  useEffect(() => {
    loadBooking();
    return () => {
      if (eventSourceRef.current) eventSourceRef.current.close();
    };
  }, [bookingId]);

  const loadBooking = async () => {
    try {
      const response = await bookingAPI.getBookingById(bookingId);
      setBooking(response.data);
      setupSse(response.data.id);
    } catch (err) {
      setError('Failed to load booking. It may not exist or you lack permission.');
    } finally {
      setLoading(false);
    }
  };

  const setupSse = (id) => {
    if (eventSourceRef.current) eventSourceRef.current.close();
    const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';
    const source = new EventSource(`${baseURL}/bookings/${id}/stream`);
    eventSourceRef.current = source;

    source.addEventListener('booking-update', (event) => {
      try {
        const updated = JSON.parse(event.data);
        setBooking(updated);
        if (updated.status === 'COMPLETED' || updated.status === 'CANCELLED') {
          source.close();
          eventSourceRef.current = null;
        }
      } catch (err) {
        console.error('SSE parse error', err);
      }
    });
    source.onerror = () => source.close();
  };

  const loadRazorpayScript = () =>
    new Promise((resolve) => {
      if (window.Razorpay) return resolve(true);
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });

  const handlePayment = async () => {
    if (!auth.isRiderAuthenticated()) {
      alert('Please log in as a customer to complete payment.');
      return;
    }
    setPaying(true);
    try {
      if (!(await loadRazorpayScript())) {
        alert('Failed to load Razorpay SDK.');
        return;
      }
      const orderRes = await bookingAPI.createRazorpayOrder(booking.id);
      if (!razorpayKeyIdRef.current) {
        const configRes = await bookingAPI.getPublicConfig();
        razorpayKeyIdRef.current = configRes.data.razorpayKeyId;
      }
      const options = {
        key: razorpayKeyIdRef.current,
        amount: Math.round(orderRes.data.agreedFare * 100),
        currency: 'INR',
        name: 'LocalCab',
        description: `Ride: ${booking.pickupVillage} → ${booking.dropLocation}`,
        order_id: orderRes.data.razorpayOrderId,
        handler: async (response) => {
          await bookingAPI.verifyRazorpayPayment(
            booking.id,
            response.razorpay_payment_id,
            response.razorpay_signature
          );
          loadBooking();
        },
        modal: { ondismiss: () => setPaying(false) },
        theme: { color: '#000000' },
      };
      new window.Razorpay(options).open();
    } catch (err) {
      alert(err.response?.data?.message || 'Payment failed');
      setPaying(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-black border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4 text-center">
        <h2 className="text-2xl font-black mb-2">Booking Not Found</h2>
        <p className="text-gray-500 mb-6">{error}</p>
        <Link to="/" className="bg-black text-white px-8 py-3 rounded-2xl font-bold">Return Home</Link>
      </div>
    );
  }

  const currentStep = FLOW_STEPS.indexOf(booking.status);

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      <div className="bg-black text-white px-4 py-8 text-center">
        <h1 className="text-3xl font-black">Ride Tracking</h1>
        <p className="text-gray-400 text-sm mt-1">Live status for your booking</p>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8 -mt-6">
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
          {/* Flow stepper */}
          <div className="p-6 border-b border-gray-100 bg-gray-50">
            <div className="flex justify-between items-center mb-4">
              <span className={`px-4 py-1.5 rounded-full text-sm font-black uppercase ${getStatusColor(booking.status)}`}>
                {getStatusLabel(booking.status)}
              </span>
              <span className="text-2xl font-black">₹{booking.agreedFare}</span>
            </div>
            <div className="flex gap-1">
              {FLOW_STEPS.map((step, i) => (
                <div key={step} className="flex-1">
                  <div className={`h-2 rounded-full ${i <= currentStep && booking.status !== 'CANCELLED' ? 'bg-black' : 'bg-gray-200'}`} />
                  <p className="text-[9px] font-bold text-gray-400 mt-1 uppercase hidden sm:block">{getStatusLabel(step)}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="p-6 md:p-8 grid md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase mb-1">Pickup</p>
                <p className="font-black text-black">{booking.pickupVillage}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase mb-1">Drop</p>
                <p className="font-black text-black">{booking.dropLocation}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-xl">
                <p className="text-xs text-gray-400 font-bold uppercase mb-1">Driver</p>
                <p className="font-black">{booking.driverPhoneNumber}</p>
              </div>

              {booking.status === 'REQUESTED' && (
                <p className="text-sm bg-gray-50 p-4 rounded-xl text-gray-600 font-medium">
                  Your request was sent. Waiting for the driver to accept.
                </p>
              )}
              {canPayBooking(booking) && (
                <div className="bg-amber-50 border border-amber-100 p-4 rounded-xl space-y-3">
                  <p className="text-amber-900 font-bold text-sm">Driver accepted! Complete payment to fully book this ride.</p>
                  {auth.isRiderAuthenticated() ? (
                    <button onClick={handlePayment} disabled={paying} className="w-full bg-black text-white py-3 rounded-xl font-bold disabled:opacity-50">
                      {paying ? 'Processing...' : 'Pay via Razorpay'}
                    </button>
                  ) : (
                    <Link to="/login" className="block text-center bg-black text-white py-3 rounded-xl font-bold">Login to Pay</Link>
                  )}
                </div>
              )}
              {booking.status === 'BOOKED' && (
                <p className="text-sm bg-green-50 text-green-800 p-4 rounded-xl font-bold">
                  Payment received. Ride fully booked — driver will start soon.
                </p>
              )}
            </div>

            <div className="min-h-[300px] rounded-2xl overflow-hidden border border-gray-100">
              <LeafletMap booking={booking} driverLat={booking.driverLatitude} driverLng={booking.driverLongitude} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BookingTracking;
