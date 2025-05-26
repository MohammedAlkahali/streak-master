import React, { useState, useEffect } from 'react';
import { FaEnvelope, FaLock } from 'react-icons/fa';
import {
  signInWithEmailAndPassword,
  onAuthStateChanged
} from 'firebase/auth';
import { auth } from '../firebase';
import { useNavigate, Link } from 'react-router-dom';

function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const { user } = await signInWithEmailAndPassword(
        auth,
        form.email,
        form.password
      );

      if (!user.emailVerified) {
        navigate('/verify-email');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setError('Invalid email or password.');
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        if (user.emailVerified) {
          navigate('/dashboard');
        } else {
          navigate('/verify-email');
        }
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-tr from-pink-200 via-purple-300 to-blue-100 flex items-center justify-center px-4">
      <div className="bg-white shadow-[0_20px_50px_rgba(0,0,0,0.1)] rounded-2xl p-8 w-full max-w-md transform transition-all duration-300 hover:scale-[1.03]">
        <h2 className="text-4xl font-bold text-center text-purple-700 mb-6 tracking-wide">
          Welcome Back
        </h2>

        {error && (
          <div className="text-red-500 text-sm text-center mb-4">{error}</div>
        )}

        <form className="space-y-5" onSubmit={handleSubmit}>
          <div className="relative">
            <FaEnvelope className="absolute top-3.5 left-3 text-purple-400" />
            <input
              type="email"
              name="email"
              placeholder="Email"
              autoComplete="email"
              required
              value={form.email}
              onChange={handleChange}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-400"
            />
          </div>

          <div className="relative">
            <FaLock className="absolute top-3.5 left-3 text-purple-400" />
            <input
              type="password"
              name="password"
              placeholder="Password"
              autoComplete="current-password"
              required
              value={form.password}
              onChange={handleChange}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-400"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-md text-lg font-medium transition-all duration-300 shadow-md hover:shadow-lg"
          >
            Login
          </button>
        </form>

        {/* ← Forgot password link */}
        <div className="mt-4 text-center">
          <Link
            to="/forgot-password"
            className="text-sm text-blue-600 hover:underline"
          >
            Forgot password?
          </Link>
        </div>

        <p className="text-sm text-center text-gray-600 mt-5">
          Don’t have an account?{' '}
          <Link
            to="/register"
            className="text-purple-600 hover:underline font-medium"
          >
            Register
          </Link>
        </p>

        {/* Back to Home Button */}
        <div className="mt-4 text-center">
          <Link
            to="/"
            className="text-blue-500 hover:underline text-sm flex justify-center items-center gap-1"
          >
            ⬅️ Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Login;
