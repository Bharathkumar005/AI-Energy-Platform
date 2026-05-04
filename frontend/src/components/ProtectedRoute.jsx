import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = () => {
  const { token } = useAuth();

  // If there is no token, redirect to the login page
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // If authorized, render the child routes (the dashboard layout)
  return <Outlet />;
};

export default ProtectedRoute;
