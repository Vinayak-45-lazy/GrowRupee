import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ShoppingBag, Sparkles, LayoutDashboard, BrainCircuit, Receipt, LogOut, Store } from 'lucide-react';
import { getCurrentMerchant, logoutMerchant } from '../firebase/firebaseClient';

export default function Navbar({ cartCount, onOpenCart }) {
  const location = useLocation();
  const navigate = useNavigate();
  const merchant = getCurrentMerchant();

  const isMerchantPath = location.pathname.startsWith('/merchant') || location.pathname === '/orders';

  const handleLogout = async () => {
    await logoutMerchant();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-md border-b border-slate-800/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Brand */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-500 via-indigo-500 to-purple-600 p-0.5 shadow-lg shadow-sky-500/20 group-hover:scale-105 transition-transform">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <BrainCircuit className="w-5 h-5 text-sky-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white via-slate-200 to-sky-400 bg-clip-text text-transparent">
                  PayPilot AI
                </span>
                <span className="bg-sky-500/10 text-sky-400 text-[10px] font-semibold px-2 py-0.5 rounded-full border border-sky-500/20">
                  Track 1
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium">AI Merchant Growth Agent</p>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1 bg-slate-900/60 p-1 rounded-xl border border-slate-800/80">
            <Link
              to="/"
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                location.pathname === '/' 
                  ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30' 
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Store className="w-4 h-4" />
              <span>Storefront</span>
            </Link>

            <Link
              to="/merchant/dashboard"
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                location.pathname === '/merchant/dashboard' 
                  ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' 
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Dashboard</span>
            </Link>

            <Link
              to="/merchant/insights"
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                location.pathname === '/merchant/insights' 
                  ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30' 
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Sparkles className="w-4 h-4 text-indigo-400" />
              <span>AI Growth Insights</span>
            </Link>

            <Link
              to="/orders"
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                location.pathname === '/orders' 
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' 
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Receipt className="w-4 h-4" />
              <span>Orders List</span>
            </Link>
          </nav>

          {/* Right Action Icons */}
          <div className="flex items-center space-x-3">
            {/* Cart Button */}
            <button
              onClick={onOpenCart}
              className="relative flex items-center space-x-2 bg-slate-900 hover:bg-slate-800 text-slate-200 px-3.5 py-2 rounded-xl border border-slate-700/60 transition-all active:scale-95"
            >
              <ShoppingBag className="w-4 h-4 text-sky-400" />
              <span className="text-sm font-semibold hidden sm:inline">Cart</span>
              {cartCount > 0 && (
                <span className="bg-gradient-to-r from-sky-500 to-indigo-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center animate-pulse">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Merchant Auth Button */}
            {merchant ? (
              <div className="flex items-center space-x-2">
                <span className="text-xs text-slate-400 font-medium hidden lg:inline">
                  {merchant.email?.split('@')[0]}
                </span>
                <button
                  onClick={handleLogout}
                  title="Logout Merchant"
                  className="p-2 text-slate-400 hover:text-rose-400 bg-slate-900 hover:bg-rose-500/10 rounded-xl border border-slate-800 hover:border-rose-500/30 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="text-xs font-semibold text-sky-300 bg-sky-500/10 hover:bg-sky-500/20 px-3 py-2 rounded-xl border border-sky-500/30 transition-all"
              >
                Merchant Login
              </Link>
            )}
          </div>

        </div>
      </div>
    </header>
  );
}
