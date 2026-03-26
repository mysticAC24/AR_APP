import React, { useState } from 'react';
import { auth, googleProvider } from '../lib/firebase';
import { signInWithPopup, signInWithRedirect } from 'firebase/auth';
import { CalendarIcon } from 'lucide-react';

export default function LoginPage() {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    setError('');
    setLoading(true);
    try {
      await signInWithPopup(auth, googleProvider);
      // onAuthStateChanged in context handles routing after this
    } catch (err) {
      if (err.code === 'auth/popup-closed-by-user' || err.code === 'auth/cancelled-popup-request') {
        // User closed the popup — not an error
      } else if (err.code === 'auth/popup-blocked') {
        // Fallback to redirect for browsers that block popups
        try {
          await signInWithRedirect(auth, googleProvider);
        } catch (redirectErr) {
          setError('Sign in failed. Please try again.');
        }
      } else {
        setError('Sign in failed: ' + err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center bg-gray-100 min-h-screen font-sans">
      <div className="w-full max-w-md bg-white min-h-screen sm:min-h-[auto] sm:rounded-3xl shadow-2xl overflow-hidden relative flex flex-col items-center justify-center p-8 animate-in fade-in zoom-in-95 duration-500">

        {/* Background blob */}
        <div className="absolute top-0 left-0 w-full h-48 bg-blue-600 rounded-b-[50%] scale-x-150 transform -translate-y-10 z-0 shadow-lg"></div>

        {/* Logo + Title */}
        <div className="relative z-10 w-full mb-10 text-center text-white">
          <div className="bg-white text-blue-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl rotate-3">
            <CalendarIcon size={32} />
          </div>
          <h1 className="text-3xl font-black tracking-tight">AlumSync</h1>
          <p className="text-blue-100 mt-1 font-medium">Connect & Collaborate</p>
        </div>

        {/* Sign in card */}
        <div className="w-full relative z-10 space-y-4">
          <div className="text-center mb-6">
            <h2 className="text-xl font-bold text-gray-800">Welcome</h2>
            <p className="text-sm text-gray-500 mt-1">Sign in to access your team dashboard</p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
              {error}
            </div>
          )}

          <button
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full flex items-center justify-center space-x-3 bg-white border-2 border-gray-200 text-gray-700 font-bold py-3.5 rounded-xl hover:border-blue-400 hover:bg-blue-50 active:scale-[0.98] transition-all shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-gray-400 border-t-blue-600 rounded-full animate-spin" />
            ) : (
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
            )}
            <span>{loading ? 'Signing in...' : 'Continue with Google'}</span>
          </button>
        </div>

        <p className="mt-8 text-xs text-gray-400 font-medium text-center relative z-10">
          For Alumni Relations team members only
        </p>
      </div>
    </div>
  );
}
