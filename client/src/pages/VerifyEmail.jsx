import React, { useState } from 'react';
import { sendEmailVerification, signOut } from 'firebase/auth';
import { auth } from '../firebase';
import { useNavigate } from 'react-router-dom';

export default function VerifyEmail() {
  const [msg, setMsg] = useState('');
  const navigate = useNavigate();

  const resend = async () => {
    await sendEmailVerification(auth.currentUser);
    setMsg('Verification email sent—check your inbox!');
  };

  const logout = async () => {
    await signOut(auth);
    navigate('/login');
  };

  return (
    <div className="p-6 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">Verify Your Email</h1>
      <p>
        We’ve sent a link to <strong>{auth.currentUser?.email}</strong>. 
        Click it to activate your account.
      </p>
      {msg && <p className="mt-2 text-green-600">{msg}</p>}
      <button onClick={resend} className="mt-4 mr-2 px-4 py-2 bg-blue-500 text-white rounded">
        Resend Email
      </button>
      <button onClick={logout} className="mt-4 px-4 py-2 bg-gray-300 rounded">
        Logout
      </button>
    </div>
  );
}
