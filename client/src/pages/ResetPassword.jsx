// src/pages/ResetPassword.jsx
import React, { useState } from 'react';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../firebase';
import { Link } from 'react-router-dom';

export default function ResetPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      await sendPasswordResetEmail(auth, email);
      setMessage('✅ Check your inbox for the reset link.');
    } catch (err) {
      setMessage(`❌ ${err.message}`);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <form onSubmit={onSubmit} className="w-full max-w-sm bg-white p-6 rounded shadow">
        <h2 className="text-xl font-bold mb-4">Reset Your Password</h2>
        <input
          type="email"
          placeholder="Email address"
          required
          value={email}
          onChange={e => setEmail(e.target.value)}
          className="w-full mb-3 p-2 border rounded"
        />
        <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded">
          Send Reset Email
        </button>
        {message && <p className="mt-3 text-sm">{message}</p>}
        <p className="mt-4 text-center text-sm">
          <Link to="/login" className="text-blue-600 hover:underline">
            Back to Login
          </Link>
        </p>
      </form>
    </div>
  );
}
