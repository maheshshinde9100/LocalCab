import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
            <div className="text-center max-w-lg">
                <h1 className="text-9xl font-black text-black mb-8 opacity-10">404</h1>
                <div className="bg-white p-12 rounded-[3rem] shadow-2xl border border-gray-100 -mt-20 relative z-10">
                    <h2 className="text-4xl font-extrabold text-black mb-4 tracking-tight">Lost in the city?</h2>
                    <p className="text-gray-500 text-lg mb-10 font-medium">The page you are looking for doesn't exist or has been moved. Let's get you back on track.</p>
                    <Link
                        to="/"
                        className="inline-flex items-center justify-center bg-black text-white px-10 py-5 rounded-full text-lg font-black hover:bg-gray-800 transition-all transform hover:scale-105 shadow-xl shadow-black/20"
                    >
                        Go Home
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default NotFound;
