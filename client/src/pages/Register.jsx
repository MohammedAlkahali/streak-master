import React, { useState } from 'react';
import { FaUser, FaEnvelope, FaLock } from 'react-icons/fa';
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  updateProfile
} from 'firebase/auth';
import { auth } from '../firebase';
import { useNavigate, Link } from 'react-router-dom';

function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      // 1) create the user
      const { user } = await createUserWithEmailAndPassword(
        auth,
        form.email,
        form.password
      );

      // 2) set their display name (optional, but useful)
      await updateProfile(user, { displayName: form.name });

      // 3) send the verification email
      await sendEmailVerification(user, {
        // when they click the link they'll come here:
        url: `${window.location.origin}/verify-email`
      });

      // 4) save locally & redirect to your “check your inbox” page
      localStorage.setItem('username', form.name);
      navigate('/verify-email');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-tr from-blue-100 via-purple-300 to-pink-200 flex items-center justify-center px-4">
      <div className="bg-white shadow-[0_20px_50px_rgba(0,0,0,0.1)] rounded-2xl p-8 w-full max-w-md transform transition-all duration-300 hover:scale-[1.03]">
        <h2 className="text-4xl font-bold text-center text-purple-700 mb-6 tracking-wide">
          Create Account
        </h2>

        {error && (
          <div className="text-red-500 text-sm text-center mb-4">{error}</div>
        )}

        <form className="space-y-5" onSubmit={handleSubmit}>
          <div className="relative">
            <FaUser className="absolute top-3.5 left-3 text-purple-400" />
            <input
              type="text"
              name="name"
              placeholder="Full Name"
              autoComplete="name"
              required
              value={form.name}
              onChange={handleChange}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-400"
            />
          </div>

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
              autoComplete="new-password"
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
            Register
          </button>
        </form>

        <p className="text-sm text-center text-gray-600 mt-5">
          Already have an account?{' '}
          <Link to="/login" className="text-purple-600 hover:underline font-medium">
            Login
          </Link>
        </p>

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

export default Register;
