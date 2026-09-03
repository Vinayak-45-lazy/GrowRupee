import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { merchantLogin } from '../firebase/firebaseClient';
import { BrainCircuit, Lock, Mail, ArrowRight, Sparkles } from 'lucide-react';

export default function MerchantLogin() {
  const [email, setEmail] = useState('merchant@paypilot.ai');
  const [password, setPassword] = useState('password123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      await merchantLogin(email, password);
      navigate('/merchant/dashboard');
    } catch (err) {
      console.error('Login error:', err);
      setError(err.message || 'Failed to authenticate merchant');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setEmail('merchant@paypilot.ai');
    setPassword('password123');
    try {
      setLoading(true);
      await merchantLogin('merchant@paypilot.ai', 'password123');
      navigate('/merchant/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        
        {/* Header Branding */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-sky-500 via-indigo-500 to-purple-600 p-0.5 shadow-xl shadow-sky-500/20 mx-auto">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
              <BrainCircuit className="w-6 h-6 text-sky-400" />
            </div>
          </div>

          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            Merchant Portal Login
          </h1>
          <p className="text-xs text-slate-400">
            Access your AI Growth Agent Dashboard, Revenue Analytics & Groq Insights.
          </p>
        </div>

        {/* Login Card */}
        <div className="glass-card rounded-2xl p-6 sm:p-8 space-y-6 border border-slate-800">
          {error && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-300 text-center font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Merchant Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500/50"
                  placeholder="merchant@paypilot.ai"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500/50"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-sky-500/20 text-xs flex items-center justify-center space-x-2"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Sign In to Merchant Dashboard</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Login Button */}
          <div className="pt-4 border-t border-slate-800 text-center space-y-3">
            <span className="text-[11px] text-slate-500 font-medium">Evaluating for Razorpay AI Builder Internship?</span>
            <button
              type="button"
              onClick={handleDemoLogin}
              className="w-full bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-bold py-2.5 rounded-xl transition-all text-xs flex items-center justify-center space-x-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>1-Click Demo Merchant Login</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
