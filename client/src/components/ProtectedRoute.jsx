import { Navigate } from 'react-router-dom';

function ProtectedRoute({ children }) {
  const userString = localStorage.getItem('user');

  if (!userString) {
    return <Navigate to="/login" replace />;
  }

  const user = JSON.parse(userString);

  if (!user.isVerified) {
    return <Navigate to="/verify-email" replace />;
  }

  return children;
}

export default ProtectedRoute;
