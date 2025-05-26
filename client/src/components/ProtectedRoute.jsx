import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../firebase"; // adjust path if needed

const ProtectedRoute = ({ children }) => {
  const [user, loading] = useAuthState(auth);
  const location = useLocation();

  if (loading) {
    return <div>Loading…</div>;
  }

  if (!user) {
    // Not logged in → send to login (or home)
    return <Navigate to="/" replace />;
  }

  if (!user.emailVerified) {
    // Logged in but email not verified → send to verify-email
    return (
      <Navigate
        to="/verify-email"
        state={{ from: location }}
        replace
      />
    );
  }

  // All checks passed → render the protected page
  return children;
};

export default ProtectedRoute;
