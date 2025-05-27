import React, { useState } from 'react';
import { auth } from '../firebase';
import {
  EmailAuthProvider,
  reauthenticateWithCredential,
  updateEmail,
} from 'firebase/auth';
import { FaTimes } from 'react-icons/fa';

/**
 * Modal component to allow users to change their email address.
 * Requires reauthentication with current password before updating.
 */
export default function ChangeEmailModal({ onClose }) {
  // --- Form state ---
  const [newEmail, setNewEmail] = useState('');   // User's new email input
  const [password, setPassword] = useState('');   // Current password for reauth
  const [message, setMessage] = useState('');     // Success/error feedback
  const [loading, setLoading] = useState(false);  // Loading state for submission

  /**
   * Handle email update submission:
   * 1) Reauthenticate
   * 2) Update email
   * 3) Sync localStorage and close modal
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setLoading(true);
    try {
      const user = auth.currentUser;
      // Reauthenticate user with current credentials
      const credential = EmailAuthProvider.credential(user.email, password);
      await reauthenticateWithCredential(user, credential);
      // Update email in Firebase
      await updateEmail(user, newEmail);
      // Update localStorage to reflect new email
      localStorage.setItem('username', newEmail);

      setMessage('✅ Email updated successfully!');
      // Auto-close modal after short delay
      setTimeout(onClose, 1200);
    } catch (err) {
      setMessage(`❌ ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <form onSubmit={handleSubmit} className="modal-card bg-white p-6 rounded shadow-lg w-full max-w-xs relative">
        {/* Close button */}
        <FaTimes onClick={onClose} className="close-icon absolute top-2 right-2 cursor-pointer text-gray-500 hover:text-red-500" />

        <h3 className="text-lg font-bold mb-4">Change Email</h3>

        {/* New Email input */}
        <input
          type="email"
          placeholder="New email"
          required
          value={newEmail}
          onChange={e => setNewEmail(e.target.value)}
          className="input-field mb-2 w-full"
        />

        {/* Current Password input for reauthentication */}
        <input
          type="password"
          placeholder="Current password"
          required
          value={password}
          onChange={e => setPassword(e.target.value)}
          className="input-field mb-4 w-full"
        />

        {/* Submit button */}
        <button
          type="submit"
          className={`w-full py-2 rounded text-white transition ${
            loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'
          }`}
          disabled={loading}
        >
          {loading ? 'Updating…' : 'Submit'}
        </button>

        {/* Feedback message */}
        {message && <p className="mt-3 text-sm text-center">{message}</p>}
      </form>
    </div>
  );
}
