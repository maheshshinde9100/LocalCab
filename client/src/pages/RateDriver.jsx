import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { ratingAPI } from '../utils/api';

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
  const [hoverRating, setHoverRating] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (bookingId) {
      setFormData(prev => ({ ...prev, bookingId }));
    }
  }, [bookingId]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRatingClick = (rating) => {
    setFormData({ ...formData, rating });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.rating === 0) {
      setError('Please provide a rating');
      return;
    }
    setError('');
    setLoading(true);

    try {
      await ratingAPI.create({
        ...formData,
        rating: parseInt(formData.rating),
      });
      setSuccess(true);
      setTimeout(() => navigate('/'), 2500);
    } catch (err) {
      setError(err.response?.data?.message || 'Submission failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-6 text-center">
        <div className="opacity-0 animate-scale-in">
          <div className="w-24 h-24 bg-green-500 text-white rounded-full flex items-center justify-center text-5xl mx-auto mb-8 shadow-2xl shadow-green-200">
            ✓
          </div>
          <h2 className="text-4xl font-black text-black mb-4 tracking-tight">Experience Shared!</h2>
          <p className="text-gray-400 font-medium text-lg max-w-sm">Thank you for helping the LocalCab community grow.</p>
          <div className="mt-12 flex justify-center gap-2">
            <div className="w-2 h-2 bg-black rounded-full animate-bounce [animation-delay:-0.3s]"></div>
            <div className="w-2 h-2 bg-black rounded-full animate-bounce [animation-delay:-0.15s]"></div>
            <div className="w-2 h-2 bg-black rounded-full animate-bounce"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white py-20 px-4">
      <div className="max-w-xl mx-auto opacity-0 animate-fade-in-up">

        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-black text-white text-xl font-black rounded-xl mb-6 shadow-xl">L</div>
          <h1 className="text-3xl font-black text-black tracking-tight">Rate your experience</h1>
          <p className="text-gray-400 font-medium mt-2">Every review helps us make rural travel better.</p>
        </div>

        <div className="bg-white rounded-[2.5rem] border border-gray-100 p-8 sm:p-12 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.06)]">
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-8 rounded-r-xl">
              <p className="text-sm text-red-700 font-bold">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-10">
            {/* Star Rating Section */}
            <div className="text-center">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-6 block">Overall Quality</label>
              <div className="flex justify-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    onClick={() => handleRatingClick(star)}
                    className="relative text-5xl sm:text-6xl transition-all duration-300 hover:scale-110 active:scale-95 px-1"
                  >
                    <span className={`transition-colors duration-300 ${(hoverRating || formData.rating) >= star ? 'text-black' : 'text-gray-100'
                      }`}>
                      ★
                    </span>
                  </button>
                ))}
              </div>
              {formData.rating > 0 && (
                <p className="mt-4 text-xs font-black text-black italic animate-fade-in">
                  {formData.rating === 5 ? 'Excellent!' : formData.rating >= 4 ? 'Good' : 'Okay'}
                </p>
              )}
            </div>

            <div className="space-y-8 pt-8 border-t border-gray-50">
              <div className="grid sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Booking ID</label>
                  <input name="bookingId" required value={formData.bookingId} onChange={handleChange} className="w-full bg-gray-50 border-none rounded-2xl py-3.5 px-6 focus:ring-2 focus:ring-black font-bold transition-all" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Your Name</label>
                  <input name="riderName" required value={formData.riderName} onChange={handleChange} className="w-full bg-gray-50 border-none rounded-2xl py-3.5 px-6 focus:ring-2 focus:ring-black font-bold transition-all" />
                </div>
              </div>

              <div className="space-y-2 text-left">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Comments (Optional)</label>
                <textarea
                  name="comment"
                  value={formData.comment}
                  onChange={handleChange}
                  rows={4}
                  className="w-full bg-gray-50 border-none rounded-[2rem] py-4 px-6 focus:ring-2 focus:ring-black font-medium transition-all resize-none"
                  placeholder="Tell us what you liked or how we can improve..."
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || formData.rating === 0}
              className="w-full bg-black text-white py-5 rounded-2xl text-lg font-black hover:bg-gray-800 transition-all active:scale-95 disabled:opacity-30 disabled:grayscale shadow-2xl"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-3">
                  <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                  <span>SUBMITTING...</span>
                </div>
              ) : 'SHARE REVIEW'}
            </button>
          </form>

          <Link to="/" className="mt-8 block text-center text-xs font-bold text-gray-400 hover:text-black transition-colors">
            Skip for now
          </Link>
        </div>
      </div>
    </div>
  );
}

export default RateDriver;
