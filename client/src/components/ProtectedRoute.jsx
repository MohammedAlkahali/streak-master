import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../firebase';

/**
 * ProtectedRoute wraps routes/components that require authentication and email verification.
 * - Shows loading while auth state is initializing.
 * - Redirects to home if not authenticated.
 * - Redirects to verify-email if email is unverified.
 * - Otherwise renders child components.
 */
export default function ProtectedRoute({ children }) {
  const [user, loading] = useAuthState(auth);      // Firebase auth state and loading flag
  const location = useLocation();                   // Current route location

  // While checking authentication, show a loading indicator
  if (loading) {
    return <div className="text-center py-6">Loading…</div>;
  }

  // If user is not logged in, redirect to homepage/login
  if (!user) {
    return <Navigate to="/" replace />;
  }

  // If user is logged in but hasn't verified their email, send to verify page
  if (!user.emailVerified) {
    return (
      <Navigate
        to="/verify-email"
        state={{ from: location }}
        replace
      />
    );
  }

  // All checks passed: render protected content
  return <>{children}</>;
}
