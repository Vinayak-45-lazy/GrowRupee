import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Storefront from './pages/Storefront';
import Cart from './pages/Cart';
import MerchantLogin from './pages/MerchantLogin';
import MerchantDashboard from './pages/MerchantDashboard';
import MerchantInsights from './pages/MerchantInsights';
import Orders from './pages/Orders';
import { X } from 'lucide-react';

import ProtectedRoute from './components/ProtectedRoute';

export default function App() {
  const [cartItems, setCartItems] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const handleAddToCart = (product) => {
    setCartItems((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, qty: item.qty + 1 } : item
        );
      }
      return [...prev, { ...product, qty: 1 }];
    });
    setIsCartOpen(true);
  };

  const handleUpdateQty = (productId, newQty) => {
    if (newQty <= 0) {
      handleRemoveItem(productId);
      return;
    }
    setCartItems((prev) =>
      prev.map((item) => (item.id === productId ? { ...item, qty: newQty } : item))
    );
  };

  const handleRemoveItem = (productId) => {
    setCartItems((prev) => prev.filter((item) => item.id !== productId));
  };

  const handleClearCart = () => {
    setCartItems([]);
  };

  const totalCartCount = cartItems.reduce((acc, i) => acc + i.qty, 0);

  return (
    <Router>
      <div className="min-h-screen bg-[#0b0f19] text-slate-100 flex flex-col justify-between selection:bg-sky-500 selection:text-white">
        <div>
          {/* Global Top Navbar */}
          <Navbar
            cartCount={totalCartCount}
            onOpenCart={() => setIsCartOpen(true)}
          />

          {/* Main Application Routes */}
          <main>
            <Routes>
              <Route
                path="/"
                element={
                  <Storefront
                    cartItems={cartItems}
                    onAddToCart={handleAddToCart}
                    onOpenCart={() => setIsCartOpen(true)}
                  />
                }
              />
              <Route path="/login" element={<MerchantLogin />} />
              <Route
                path="/merchant/dashboard"
                element={
                  <ProtectedRoute>
                    <MerchantDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/merchant/insights"
                element={
                  <ProtectedRoute>
                    <MerchantInsights />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/orders"
                element={
                  <ProtectedRoute>
                    <Orders />
                  </ProtectedRoute>
                }
              />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>

        {/* Global Cart Slide-Over Drawer */}
        {isCartOpen && (
          <div className="fixed inset-0 z-50 overflow-hidden">
            {/* Backdrop */}
            <div
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity"
              onClick={() => setIsCartOpen(false)}
            />

            <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
              <div className="w-screen max-w-md bg-slate-950 border-l border-slate-800 p-6 shadow-2xl flex flex-col justify-between relative">
                
                {/* Close Drawer Button */}
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-xl bg-slate-900 border border-slate-800"
                >
                  <X className="w-4 h-4" />
                </button>

                <Cart
                  cartItems={cartItems}
                  onUpdateQty={handleUpdateQty}
                  onRemoveItem={handleRemoveItem}
                  onClearCart={handleClearCart}
                  onClose={() => setIsCartOpen(false)}
                />
              </div>
            </div>
          </div>
        )}

        {/* Global Footer */}
        <footer className="border-t border-slate-800/80 bg-slate-950/40 py-6 mt-16 text-center text-xs text-slate-400 space-y-1">
          <p className="font-semibold text-slate-400">
            PayPilot AI — AI Merchant Growth Agent & Agentic Commerce Engine
          </p>
          <p className="text-[11px] text-slate-400">
            Built for <strong className="text-sky-400 font-semibold">Razorpay AI Builder Internship — Track 1</strong> • Integrated with Razorpay Test Mode & Groq Llama 3
          </p>
        </footer>
      </div>
    </Router>
  );
}
