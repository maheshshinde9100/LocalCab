import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { bookingAPI, driverAPI } from '../utils/api';

function CreateBooking() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const driverIdFromUrl = searchParams.get('driverId');
  
  const [formData, setFormData] = useState({
    driverId: driverIdFromUrl || '',
    riderName: '',
    riderPhoneNumber: '',
    pickupVillage: '',
    pickupLandmark: '',
    dropLocation: '',
    agreedFare: '',
  });
  const [driver, setDriver] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (driverIdFromUrl) {
      // Fetch driver details
      driverAPI.getAvailable('').then(() => {
        // Driver details will be shown from form
      }).catch(() => {});
    }
  }, [driverIdFromUrl]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const bookingData = {
        ...formData,
        agreedFare: parseFloat(formData.agreedFare),
      };
      
      const response = await bookingAPI.create(bookingData);
      alert('Booking created successfully!');
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create booking');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white shadow-xl rounded-lg p-8">
          <h2 className="text-3xl font-bold text-center mb-8 text-gray-900">
            Create Booking
          </h2>
          <p className="text-center text-gray-600 mb-6">
            After contacting the driver and agreeing on the fare, fill in the details below.
          </p>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Driver ID *
              </label>
              <input
                type="text"
                name="driverId"
                required
                value={formData.driverId}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Enter driver ID"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Name *
                </label>
                <input
                  type="text"
                  name="riderName"
                  required
                  value={formData.riderName}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Phone Number *
                </label>
                <input
                  type="tel"
                  name="riderPhoneNumber"
                  required
                  value={formData.riderPhoneNumber}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Pickup Village *
              </label>
              <input
                type="text"
                name="pickupVillage"
                required
                value={formData.pickupVillage}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Pickup Landmark
              </label>
              <input
                type="text"
                name="pickupLandmark"
                value={formData.pickupLandmark}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="e.g., Near Temple, Main Road"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Drop Location *
              </label>
              <input
                type="text"
                name="dropLocation"
                required
                value={formData.dropLocation}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Agreed Fare (₹) *
              </label>
              <input
                type="number"
                name="agreedFare"
                required
                min="0"
                step="0.01"
                value={formData.agreedFare}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="500.00"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 px-4 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating Booking...' : 'Create Booking'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default CreateBooking;
