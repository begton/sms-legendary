import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function Login() {
  const [form, setForm] = useState({ user_name: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(form.user_name, form.password);
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-slate-900 rounded-2xl shadow-lg shadow-black/20 mb-4">
              <span className="text-3xl font-bold text-slate-100">D</span>
          </div>
          <h1 className="text-3xl font-bold text-slate-100">DAB Enterprise LTD</h1>
          <p className="text-slate-400 mt-1">Store Management System</p>
        </div>

        {/* Card */}
        <div className="bg-slate-900 rounded-2xl shadow-2xl shadow-black/25 p-8 border border-slate-800">
          <h2 className="text-xl font-bold text-slate-100 mb-6 text-center">Sign In to Your Account</h2>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Username</label>
              <input
                type="text"
                required
                className="w-full rounded-2xl border border-slate-700 bg-slate-950 text-slate-100 px-4 py-3 focus:border-slate-500 focus:outline-none"
                placeholder="Enter your username"
                value={form.user_name}
                onChange={e => setForm({...form, user_name: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Password</label>
              <input
                type="password"
                required
                className="w-full rounded-2xl border border-slate-700 bg-slate-950 text-slate-100 px-4 py-3 focus:border-slate-500 focus:outline-none"
                placeholder="Enter your password"
                value={form.password}
                onChange={e => setForm({...form, password: e.target.value})}
              />
            </div>
            <button type="submit" disabled={loading}
              className="w-full rounded-2xl bg-slate-700 text-slate-100 py-3 text-base font-semibold hover:bg-slate-600 transition-colors duration-200">
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

        </div>

        <p className="text-center text-slate-400 text-sm mt-6">
          Kigali, Rwanda © 2026 DAB Enterprise LTD
        </p>
      </div>
    </div>
  );
}
