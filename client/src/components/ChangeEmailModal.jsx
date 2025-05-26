// src/components/ChangeEmailModal.jsx
import React, { useState } from 'react';
import {
  EmailAuthProvider,
  reauthenticateWithCredential,
  updateEmail,
} from 'firebase/auth';
import { auth } from '../firebase';
import { FaTimes } from 'react-icons/fa';

export default function ChangeEmailModal({ onClose }) {
  const [newEmail, setNewEmail] = useState('');
  const [password, setPassword] = useState('');
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setMsg('');
    setLoading(true);
    try {
      const user = auth.currentUser;
      // 1) Reauthenticate
      const cred = EmailAuthProvider.credential(user.email, password);
      await reauthenticateWithCredential(user, cred);
      // 2) Update email
      await updateEmail(user, newEmail);
      // 3) Sync localStorage so Dashboard header updates immediately
      localStorage.setItem('username', newEmail);

      setMsg('✅ Email updated!');
      // 4) Auto-close after a moment
      setTimeout(onClose, 1200);
    } catch (err) {
      setMsg(`❌ ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <form
        onSubmit={onSubmit}
        className="relative bg-white p-6 rounded shadow-lg w-full max-w-xs"
      >
        {/* Quick-close “×” */}
        <FaTimes
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-500 hover:text-red-500 cursor-pointer"
        />

        <h3 className="text-lg font-bold mb-4">Change Email</h3>

        <input
          type="email"
          placeholder="New email"
          required
          value={newEmail}
          onChange={(e) => setNewEmail(e.target.value)}
          className="w-full mb-2 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-purple-400"
        />

        <input
          type="password"
          placeholder="Current password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full mb-4 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-purple-400"
        />

        <button
          type="submit"
          disabled={loading}
          className={`w-full py-2 rounded text-white transition ${
            loading
              ? 'bg-green-300 cursor-not-allowed'
              : 'bg-green-600 hover:bg-green-700'
          }`}
        >
          {loading ? 'Updating…' : 'Submit'}
        </button>

        {msg && <p className="mt-3 text-sm text-center">{msg}</p>}
      </form>
    </div>
  );
}
