import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const PrivateRoute = ({ children, requireAdmin = false }) => {
  const { user } = useAuth();

  // If not authenticated, redirect to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // If admin is required but user is not admin, redirect to home
  if (requireAdmin && !user.roles?.includes('admin')) {
    return <Navigate to="/" replace />;
  }

  // If authenticated and has required role, render the protected component
  return children;
};

export default PrivateRoute; 