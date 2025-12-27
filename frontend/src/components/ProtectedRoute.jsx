import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

// Protected route that blocks admin users (admin should only access admin routes)
const ProtectedRoute = ({ children, allowedRoles = ['user', 'technician'] }) => {
  const { user } = useContext(AuthContext);

  // If no user, redirect to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // If admin user tries to access user routes, redirect to admin dashboard
  if (user.role === 'admin' || user.email === 'admin@gmail.com') {
    return <Navigate to="/admin-dashboard" replace />;
  }

  // If user role is not in allowed roles, redirect to appropriate dashboard
  if (!allowedRoles.includes(user.role)) {
    // Redirect based on role
    if (user.role === 'technician') {
      return <Navigate to="/technician" replace />;
    }
    return <Navigate to="/user" replace />;
  }

  return children;
};

// Admin-only protected route
export const AdminProtectedRoute = ({ children }) => {
  const { user } = useContext(AuthContext);

  // If no user, redirect to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Only allow admin@gmail.com with admin role
  if (user.email !== 'admin@gmail.com' || user.role !== 'admin') {
    // Redirect non-admin users to login or home
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;

