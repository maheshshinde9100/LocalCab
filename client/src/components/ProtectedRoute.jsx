import { Navigate } from 'react-router-dom';
import { auth } from '../utils/auth';

function ProtectedRoute({ children }) {
  return auth.isAuthenticated() ? children : <Navigate to="/driver/login" />;
}

export default ProtectedRoute;
