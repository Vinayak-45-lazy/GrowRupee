import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { getCurrentMerchant } from '../firebase/firebaseClient';

export default function ProtectedRoute({ children }) {
  const location = useLocation();
  const merchant = getCurrentMerchant();

  if (!merchant) {
    // If merchant user is not logged in, redirect to /login and pass intended path
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}
