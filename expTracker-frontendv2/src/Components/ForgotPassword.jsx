import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('loading');
    
    try {
      const response = await axios.post("http://localhost:8082/forgot-password", {
        email: email
      });

      if (response.status === 200) {
        setStatus('success');
        setMessage(response.data.Value || "Reset instructions sent to your email.");
      }
    } catch (error) {
      setStatus('error');
      setMessage(error.response?.data?.Value || "Failed to process request. Please try again.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl shadow-2xl w-full max-w-md">
        
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-white mb-2 tracking-tight">Recover Account</h2>
          <p className="text-slate-400 text-sm">Enter your email to receive a reset link</p>
        </div>

        {status === 'success' ? (
          <div className="space-y-6 text-center">
            <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto border border-emerald-500/20">
              <span className="text-3xl">✉️</span> 
            </div>
            <div>
              <p className="text-emerald-400 font-bold text-lg">Check Your Inbox</p>
              <p className="text-slate-400 text-sm mt-2">{message}</p>
            </div>
            <Link to="/login" className="block w-full mt-6">
              <button className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl transition-all duration-300">
                Return to Login
              </button>
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 ml-1">
                Email Address
              </label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-5 py-3 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all duration-300"
                placeholder="you@example.com"
                required 
                disabled={status === 'loading'}
              />
            </div>

            {status === 'error' && (
              <p className="text-red-400 text-sm text-center font-medium bg-red-500/10 py-2 rounded-lg border border-red-500/20">
                {message}
              </p>
            )}

            <button 
              type="submit" 
              disabled={status === 'loading'}
              className="w-full py-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-xl shadow-lg shadow-emerald-900/20 transform hover:-translate-y-1 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {status === 'loading' ? 'Sending...' : 'Send Reset Link'}
            </button>
          </form>
        )}

        {status !== 'success' && (
          <div className="mt-8 text-center">
            <Link to="/login" className="text-slate-400 hover:text-emerald-400 transition-colors text-sm font-medium hover:underline">
              ← Back to Login
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;