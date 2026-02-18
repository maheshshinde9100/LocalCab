import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ratingAPI, bookingAPI } from '../utils/api';

function RateDriver() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const bookingId = searchParams.get('bookingId');
  
  const [formData, setFormData] = useState({
    bookingId: bookingId || '',
    riderName: '',
    riderPhoneNumber: '',
    rating: 0,
    comment: '',
  });
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (bookingId) {
      setFormData(prev => ({ ...prev, bookingId }));
      // Optionally fetch booking details to pre-fill rider info
    }
  }, [bookingId]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleRatingClick = (rating) => {
    setFormData({
      ...formData,
      rating,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (formData.rating === 0) {
      setError('Please select a rating');
      setLoading(false);
      return;
    }

    try {
      await ratingAPI.create({
        bookingId: formData.bookingId,
        riderName: formData.riderName,
        riderPhoneNumber: formData.riderPhoneNumber,
        rating: parseInt(formData.rating),
        comment: formData.comment || undefined,
      });
      
      setSuccess(true);
      setTimeout(() => {
        navigate('/');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit rating');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        <div className="bg-white shadow-xl rounded-lg p-8 max-w-md text-center">
          <div className="text-6xl mb-4">✅</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Thank You!</h2>
          <p className="text-gray-600 mb-6">Your rating has been submitted successfully.</p>
          <p className="text-sm text-gray-500">Redirecting to home...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white shadow-xl rounded-lg p-8">
          <h2 className="text-3xl font-bold text-center mb-8 text-gray-900">
            Rate Your Driver
          </h2>
          <p className="text-center text-gray-600 mb-6">
            Help us improve by sharing your experience
          </p>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Booking ID *
              </label>
              <input
                type="text"
                name="bookingId"
                required
                value={formData.bookingId}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Enter booking ID"
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
              <label className="block text-sm font-medium text-gray-700 mb-4">
                Rating *
              </label>
              <div className="flex justify-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => handleRatingClick(star)}
                    className={`text-5xl transition ${
                      formData.rating >= star
                        ? 'text-yellow-500'
                        : 'text-gray-300 hover:text-yellow-300'
                    }`}
                  >
                    ★
                  </button>
                ))}
              </div>
              {formData.rating > 0 && (
                <p className="text-center mt-2 text-gray-600">
                  You rated {formData.rating} out of 5 stars
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Review (Optional)
              </label>
              <textarea
                name="comment"
                value={formData.comment}
                onChange={handleChange}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Share your experience..."
              />
            </div>

            <button
              type="submit"
              disabled={loading || formData.rating === 0}
              className="w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 px-4 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Submitting...' : 'Submit Rating'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default RateDriver;
