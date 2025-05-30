import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import Landing         from './pages/Landing';
import Register        from './pages/Register';
import Login           from './pages/Login';
import ForgotPassword  from './pages/ForgotPassword';
import ResetPassword   from './pages/ResetPassword';
import VerifyEmail     from './pages/VerifyEmail';
import Dashboard       from './pages/Dashboard';

import ProtectedRoute  from './components/ProtectedRoute';

function App() {
  return (
    <Router>
      <Routes>
        {/*Public pages*/}
        <Route path="/"                  element={<Landing />} />
        <Route path="/register"          element={<Register />} />
        <Route path="/login"             element={<Login />} />
        <Route path="/forgot-password"   element={<ForgotPassword />} />
        <Route path="/reset-password"    element={<ResetPassword />} />

        {}
        <Route path="/verify-email"      element={<VerifyEmail />} />

        {}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        {}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
