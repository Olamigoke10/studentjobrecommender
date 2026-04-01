import { Navigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { ROUTES } from '../utils/constants';

const StaffRoute = ({ children }) => {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (!isAuthenticated()) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  if (!user?.is_staff) {
    return <Navigate to={ROUTES.DASHBOARD} replace />;
  }

  return children;
};

export default StaffRoute;
