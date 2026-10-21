import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

const ResetPassword = () => {
  const { token } = useParams(); 
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isValidating, setIsValidating] = useState(true); // Loading state
  const navigate = useNavigate();

  // 1. AUTO-VERIFY: Check if token is valid immediately when page loads
  useEffect(() => {
    const checkToken = async () => {
      try {
        // We call the verify-token endpoint first to see if link is alive
        await axios.post("http://localhost:8082/verify-token", { token: token });
        setIsValidating(false); // Token is good, stop loading and show form
      } catch (error) {
        // If token is old/invalid (or part of the 'invalidated' batch), kick them out
        alert("This reset link has expired or is invalid.");
        navigate("/login");
      }
    };
    checkToken();
  }, [token, navigate]);

  const handleUpdatePassword = async (e) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    try {
      const response = await axios.post("http://localhost:8082/reset-password", {
        token: token,
        newPassword: newPassword
      });

      if (response.status === 200) {
        alert(response.data.Value || "Password updated successfully!");
        navigate("/login");
      }
    } catch (error) {
      alert(error.response?.data?.Value || "Failed to reset password.");
    }
  };

  // Show a professional loading state while we check the token
  if (isValidating) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto mb-4"></div>
          <p className="text-lg text-slate-300 font-medium">Verifying secure link...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      {/* Professional Slate Card */}
      <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl shadow-2xl w-full max-w-md">
        
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-white mb-2 tracking-tight">Reset Password</h2>
          <p className="text-slate-400 text-sm">Enter your new secure password below</p>
        </div>

        <form onSubmit={handleUpdatePassword} className="space-y-6">
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 ml-1">New Password</label>
            <input 
              type="password" 
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-5 py-3 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all duration-300"
              placeholder="••••••••"
              required 
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 ml-1">Confirm Password</label>
            <input 
              type="password" 
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-5 py-3 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all duration-300"
              placeholder="••••••••"
              required 
            />
          </div>

          <button 
            type="submit" 
            className="w-full py-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-xl shadow-lg shadow-emerald-900/20 transform hover:-translate-y-1 transition-all duration-300"
          >
            Update Password
          </button>
        </form>

        <div className="mt-8 text-center">
          <Link to="/login" className="text-slate-400 hover:text-emerald-400 transition-colors text-sm font-medium hover:underline">
            ← Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;