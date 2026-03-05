import { Link } from 'react-router-dom';

function Home() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative bg-uber-black text-white overflow-hidden group h-[80vh] flex items-center">
        {/* Abstract animated gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-uber-black to-blue-900 opacity-90 transition-opacity duration-[2s]"></div>

        {/* Decorative Grid */}
        <div className="absolute inset-0 bg-[url('https://upload.wikimedia.org/wikipedia/commons/e/e0/Checkered_pattern.svg')] opacity-[0.03] scale-[2] pointer-events-none mix-blend-overlay"></div>

        {/* Content Container */}
        <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 w-full">
          <div className="max-w-2xl opacity-0 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            <h1 className="text-5xl sm:text-7xl font-bold tracking-tight leading-[1.1] mb-6 drop-shadow-lg">
              Go anywhere,<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-200 to-gray-500">with anyone.</span>
            </h1>
            <p className="text-xl sm:text-2xl text-gray-300 mb-10 font-light leading-relaxed">
              Book local rides with local drivers. Transparent fares, direct negotiation, and zero surge pricing. Built for the community.
            </p>

            <div className="flex flex-col sm:flex-row gap-5">
              <Link
                to="/drivers/available"
                className="group relative flex items-center justify-center bg-white text-uber-black text-lg font-bold px-10 py-5 rounded-full hover:bg-gray-100 transition-all transform hover:scale-105 hover:shadow-2xl overflow-hidden"
              >
                <span className="relative z-10 flex items-center gap-2">
                  Request a Ride
                  <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                </span>
                <div className="absolute inset-0 h-full w-full bg-gradient-to-r from-gray-100 to-white opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </Link>

              <Link
                to="/drivers/register"
                className="group relative flex items-center justify-center bg-transparent border-2 border-white/30 text-white text-lg font-bold px-10 py-5 rounded-full hover:border-white hover:bg-white/5 transition-all"
              >
                Drive & Earn
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Highlight Section */}
      <section className="py-24 sm:py-32 relative bg-uber-gray overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-20 opacity-0 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
            <h2 className="text-4xl sm:text-5xl font-extrabold text-uber-black tracking-tight mb-6">Built for the real world</h2>
            <p className="text-xl text-gray-600">LocalCab brings the reliability of modern technology to the flexibility of traditional town taxis.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 lg:gap-12 relative z-10">
            {/* Feature 1 */}
            <div className="bg-white rounded-3xl p-10 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 opacity-0 animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
              <div className="w-16 h-16 rounded-2xl bg-black text-white flex items-center justify-center mb-8 shadow-md">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-uber-black mb-4">Community first</h3>
              <p className="text-gray-600 leading-relaxed text-lg">Connect directly with verified drivers in your own village. Ride with people you can trust.</p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white rounded-3xl p-10 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 shadow-lg ring-1 ring-gray-900/5 opacity-0 animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
              <div className="w-16 h-16 rounded-2xl bg-black text-white flex items-center justify-center mb-8 shadow-md">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-uber-black mb-4">Smart Fares</h3>
              <p className="text-gray-600 leading-relaxed text-lg">Powered by AI to suggest fair prices. No algorithms hiding fees—just honest pricing.</p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white rounded-3xl p-10 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 opacity-0 animate-fade-in-up" style={{ animationDelay: '0.7s' }}>
              <div className="w-16 h-16 rounded-2xl bg-black text-white flex items-center justify-center mb-8 shadow-md">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-uber-black mb-4">Instant connection</h3>
              <p className="text-gray-600 leading-relaxed text-lg">Call the driver with one tap. Agree on the fare, hit book, and you're good to go.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-white relative">
        <div className="max-w-5xl mx-auto px-6 lg:px-8 text-center bg-black rounded-[3rem] p-16 sm:p-24 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 -mt-20 -mr-20 w-80 h-80 bg-gray-800 rounded-full blur-3xl opacity-50"></div>
          <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-80 h-80 bg-gray-900 rounded-full blur-3xl opacity-50"></div>

          <div className="relative z-10">
            <h2 className="text-4xl sm:text-6xl font-extrabold mb-8 text-white tracking-tight">Ready to move?</h2>
            <p className="text-xl text-gray-400 mb-12 max-w-2xl mx-auto">Join thousands of riders and drivers relying on LocalCab to travel smarter everyday.</p>

            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Link to="/drivers/available" className="bg-white text-black hover:bg-gray-100 font-bold px-10 py-5 rounded-full text-lg transition-transform transform hover:scale-105 shadow-xl">
                Find a Ride
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;
