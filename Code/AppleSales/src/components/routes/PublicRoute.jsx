import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

/**
 * PublicRoute - Redirects to home if user is already authenticated
 * Used for login/register pages
 */
export const PublicRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    // Already logged in, redirect to home
    return <Navigate to="/" replace />;
  }

  return children;
};

export default PublicRoute;
