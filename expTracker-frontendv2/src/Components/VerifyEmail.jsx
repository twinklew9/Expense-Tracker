import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import axios from 'axios';

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('verifying'); 
  const [errorMessage, setErrorMessage] = useState('');
  const token = searchParams.get('token');

  useEffect(() => {
    const verifyTokenOnBackend = async () => {
      if (!token) {
        setStatus('error');
        setErrorMessage("No token provided.");
        return;
      }

      try {
        // Axios GET request to your verify-token endpoint
        const response = await axios.get(`http://localhost:8082/verify-token?token=${token}`);

        if (response.status === 200) {
          setStatus('success');
        }
      } catch (error) {
        setStatus('error');
        // Captures "Token expired" or "Invalid token" from your Java Service
        setErrorMessage(error.response?.data?.Value || "Verification failed.");
      }
    };

    verifyTokenOnBackend();
  }, [token]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      {/* Professional Slate Card */}
      <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl shadow-2xl w-full max-w-md text-center">
        <h2 className="text-2xl font-bold text-white mb-8 tracking-tight border-b border-slate-800 pb-4">
          Email Verification
        </h2>
        
        {/* LOADING STATE */}
        {status === 'verifying' && (
          <div className="flex flex-col items-center py-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mb-4"></div>
            <p className="text-slate-400 animate-pulse">Verifying your email link...</p>
          </div>
        )}
        
        {/* SUCCESS STATE */}
        {status === 'success' && (
          <div className="space-y-6">
            <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto border border-emerald-500/20">
              <span className="text-4xl">✅</span> 
            </div>
            
            <div>
              <p className="text-emerald-400 font-bold text-lg">Verified Successfully!</p>
              <p className="text-slate-400 text-sm mt-1">Your account is now active.</p>
            </div>

            <Link to="/login" className="block w-full">
              <button className="w-full py-3 px-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-xl shadow-lg shadow-emerald-900/20 transform hover:-translate-y-1 transition-all duration-300">
                Go to Login
              </button>
            </Link>
          </div>
        )}
        
        {/* ERROR STATE */}
        {status === 'error' && (
          <div className="space-y-6">
            <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto border border-red-500/20">
              <span className="text-4xl">❌</span>
            </div>
            
            <div>
              <p className="text-red-400 font-bold text-lg">Verification Failed</p>
              <p className="text-slate-400 text-sm mt-1">{errorMessage}</p>
            </div>

            <Link to="/forgot-password" className="inline-block text-slate-400 hover:text-white underline decoration-slate-700 underline-offset-4 transition-colors text-sm">
              Request a new link
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default VerifyEmail;