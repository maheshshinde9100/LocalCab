# LocalCab Frontend

React + Vite frontend application for LocalCab rural taxi service.

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

This will install:
- React 19
- React Router DOM
- Axios (for API calls)
- Tailwind CSS
- PostCSS & Autoprefixer

### 2. Configure Environment

Create a `.env` file in the `client` directory:

```env
VITE_API_BASE_URL=http://localhost:8080/api
```

Update the URL if your backend runs on a different port or domain.

### 3. Run Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:5173` (or the port shown in terminal).

### 4. Build for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## Features

### Consumer Features
- **Home Page**: Landing page with features and how it works
- **Find Taxis**: Search available drivers by pincode
- **Create Booking**: Book a taxi after negotiating with driver

### Driver Features
- **Registration**: Register as a driver with vehicle details
- **Login**: Secure login with JWT authentication
- **Dashboard**: 
  - View all bookings
  - Toggle availability (online/offline)
  - Update booking status
  - View ratings summary

## Project Structure

```
client/
├── src/
│   ├── components/      # Reusable components
│   │   ├── Navbar.jsx
│   │   └── ProtectedRoute.jsx
│   ├── pages/          # Page components
│   │   ├── Home.jsx
│   │   ├── DriverRegister.jsx
│   │   ├── DriverLogin.jsx
│   │   ├── DriverDashboard.jsx
│   │   ├── AvailableDrivers.jsx
│   │   └── CreateBooking.jsx
│   ├── utils/          # Utility functions
│   │   ├── api.js      # API client
│   │   └── auth.js     # Authentication helpers
│   ├── App.jsx         # Main app component with routing
│   ├── main.jsx        # Entry point
│   └── index.css       # Tailwind CSS imports
├── tailwind.config.js  # Tailwind configuration
├── postcss.config.js   # PostCSS configuration
└── package.json
```

## API Integration

All API calls are centralized in `src/utils/api.js`. The API client:
- Automatically adds JWT tokens to authenticated requests
- Handles base URL configuration
- Provides organized API methods for drivers, bookings, ratings, and admin

## Authentication

Authentication is handled via JWT tokens stored in localStorage:
- Token is automatically added to API requests
- Protected routes redirect to login if not authenticated
- Logout clears all stored authentication data

## Styling

The app uses Tailwind CSS with a custom color scheme:
- Primary colors: Blue shades (primary-50 to primary-900)
- Responsive design: Mobile-first approach
- Modern UI: Clean, professional design suitable for rural users

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Development Notes

- The app uses React Router v6 for navigation
- State management is handled via React hooks (useState, useEffect)
- API errors are displayed to users with user-friendly messages
- Form validation is handled both client-side and server-side
