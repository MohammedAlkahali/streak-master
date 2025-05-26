import React, { useState } from 'react';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../firebase';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const handleReset = async (e) => {
    e.preventDefault();
    try {
      await sendPasswordResetEmail(auth, email);
      setMessage('Check your inbox for a reset link.');
    } catch (err) {
      setMessage(`Error: ${err.message}`);
    }
  };

  return (
    <div className="p-6 max-w-sm mx-auto">
      <h2 className="text-2xl mb-4">Reset Password</h2>
      <form onSubmit={handleReset}>
        <input
          type="email"
          placeholder="Your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full mb-3 p-2 border rounded"
          required
        />
        <button className="w-full bg-purple-600 text-white py-2 rounded">
          Send Reset Email
        </button>
      </form>
      {message && <p className="mt-4 text-sm">{message}</p>}
    </div>
  );
}
