import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post(
        "http://localhost:8082/login",
        {
          email: email,
          password: password
        },
        {
          withCredentials: true
        }
      );

      if (response.status === 200) {
        const userData = response.data.user;

        if (userData) {
          localStorage.setItem(
            "user",
            JSON.stringify(userData)
          );

          navigate("/home");
        }
      }

    } catch (error) {
      const errorMsg =
        error.response?.data?.Value ||
        "Login failed. Check your credentials.";

      alert(errorMsg);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">

      <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl shadow-2xl w-full max-w-md">

        <div className="text-center mb-8">

          <h2 className="text-3xl font-bold text-white mb-2 tracking-tight">
            Welcome Back
          </h2>

          <p className="text-slate-400 text-sm">
            Login to manage your expenses
          </p>

        </div>

        <form
          onSubmit={handleLogin}
          className="space-y-6"
        >

          <div>

            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 ml-1">
              Email Address
            </label>

            <input
              type="email"
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
              className="w-full px-5 py-3 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all duration-300"
              placeholder="you@example.com"
              required
            />

          </div>

          <div>

            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 ml-1">
              Password
            </label>

            <input
              type="password"
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
              }
              className="w-full px-5 py-3 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all duration-300"
              placeholder="••••••••"
              required
            />

          </div>

          <button
            type="submit"
            className="w-full py-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-xl shadow-lg shadow-emerald-900/20 transform hover:-translate-y-1 transition-all duration-300"
          >
            Login
          </button>

        </form>

        <div className="mt-8 flex items-center justify-between text-sm font-medium">

          <Link
            to="/forgot-password"
            className="text-slate-400 hover:text-white transition-colors"
          >
            Forgot Password?
          </Link>

          <Link
            to="/register"
            className="text-emerald-400 hover:text-emerald-300 transition-colors"
          >
            Create Account
          </Link>

        </div>

      </div>

    </div>
  );
};

export default LoginPage;