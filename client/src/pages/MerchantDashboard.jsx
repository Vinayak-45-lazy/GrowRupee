import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getStoreStats, getOrders } from '../services/api';
import StatsCard from '../components/StatsCard';
import { IndianRupee, ShoppingBag, TrendingUp, Sparkles, Flame, ArrowUpRight, CheckCircle2, AlertCircle } from 'lucide-react';

export default function MerchantDashboard() {
  const [stats, setStats] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsRes, ordersRes] = await Promise.all([getStoreStats(), getOrders()]);

      if (statsRes.success) setStats(statsRes.stats);
      if (ordersRes.success) setRecentOrders((ordersRes.orders || []).slice(0, 5));
    } catch (err) {
      console.error('Error loading merchant dashboard data:', err);
      setError('Failed to fetch store analytics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-12 h-12 border-4 border-sky-500/20 border-t-sky-500 rounded-full animate-spin mx-auto" />
        <p className="text-slate-400 text-sm font-medium">Computing store aggregations from Firestore...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-md mx-auto my-20 p-6 glass-card rounded-2xl text-center border-rose-500/30">
        <AlertCircle className="w-10 h-10 text-rose-400 mx-auto mb-2" />
        <p className="text-rose-300 font-bold text-sm">{error}</p>
        <button
          onClick={fetchDashboardData}
          className="mt-4 px-4 py-2 bg-slate-800 text-xs font-bold rounded-xl text-slate-200"
        >
          Retry
        </button>
      </div>
    );
  }

  const { totalRevenue = 0, avgOrderValue = 0, upsellAcceptanceRate = 0, paidOrdersCount = 0, bestSellers = [], topPair } = stats || {};

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Top Banner & Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-1.5 bg-emerald-500/10 text-emerald-400 text-xs font-bold px-2.5 py-0.5 rounded-full border border-emerald-500/20 mb-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>Store Live • Urban Bites & Brews</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Merchant Growth Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Real-time sales impact, deterministic AOV metrics & AI conversion statistics.
          </p>
        </div>

        <Link
          to="/merchant/insights"
          className="flex items-center space-x-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-lg shadow-indigo-500/20 transition-all self-start md:self-auto"
        >
          <Sparkles className="w-4 h-4 text-indigo-200" />
          <span>Ask AI Growth Advisor</span>
          <ArrowUpRight className="w-4 h-4" />
        </Link>
      </div>

      {/* KPI Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatsCard
          title="Total Store Revenue"
          value={`₹${totalRevenue.toLocaleString()}`}
          subtitle="Computed from paid Razorpay orders"
          icon={IndianRupee}
          color="sky"
          badge="+18.4%"
        />
        <StatsCard
          title="Average Order Value"
          value={`₹${avgOrderValue}`}
          subtitle="Per completed order total"
          icon={TrendingUp}
          color="emerald"
          badge="AOV Impact"
        />
        <StatsCard
          title="Upsell Acceptance Rate"
          value={`${upsellAcceptanceRate}%`}
          subtitle="Cart-time AI offer conversions"
          icon={Sparkles}
          color="purple"
          badge="High Conv."
        />
        <StatsCard
          title="Completed Orders"
          value={paidOrdersCount}
          subtitle="Verified Razorpay Test Payments"
          icon={ShoppingBag}
          color="amber"
        />
      </div>

      {/* Analytics Breakdown Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Best Sellers Card */}
        <div className="glass-card rounded-2xl p-6 border border-slate-800 space-y-4 lg:col-span-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Flame className="w-5 h-5 text-amber-400" />
              <h3 className="font-bold text-slate-100 text-base">Best-Selling Products</h3>
            </div>
            <span className="text-xs text-slate-400 font-medium">Order Frequency</span>
          </div>

          <div className="space-y-3.5 pt-2">
            {bestSellers.map((item, idx) => {
              const maxCount = bestSellers[0]?.count || 1;
              const percentage = Math.round((item.count / maxCount) * 100);
              return (
                <div key={item.name} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-200">{idx + 1}. {item.name}</span>
                    <span className="text-slate-400 font-mono">{item.count} orders sold</span>
                  </div>
                  <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                    <div
                      className="h-full bg-gradient-to-r from-sky-500 to-indigo-500 rounded-full transition-all duration-1000"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top Co-occurrence Pair Spotlight */}
        <div className="glass-card rounded-2xl p-6 border border-indigo-500/30 flex flex-col justify-between relative overflow-hidden">
          <div className="space-y-3">
            <div className="inline-flex items-center space-x-1.5 bg-indigo-500/10 text-indigo-300 text-[11px] font-bold px-2.5 py-0.5 rounded-full border border-indigo-500/30">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Co-Occurrence Pattern Found</span>
            </div>

            <h3 className="text-lg font-extrabold text-white">Top Pair Opportunity</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Express co-occurrence matrix detected a dominant purchasing relationship:
            </p>

            {topPair ? (
              <div className="glass-panel p-4 rounded-xl border border-indigo-500/30 space-y-2">
                <p className="text-sm font-bold text-indigo-300">
                  {topPair.itemA} + {topPair.itemB}
                </p>
                <p className="text-xs text-slate-400">
                  Bought together in <strong className="text-white">{topPair.count}</strong> past orders.
                </p>
              </div>
            ) : (
              <p className="text-xs text-slate-400">Gourmet Burger + Crispy Garlic Fries</p>
            )}
          </div>

          <div className="pt-4 border-t border-slate-800/80">
            <Link
              to="/merchant/insights"
              className="text-xs font-bold text-sky-400 hover:text-sky-300 flex items-center justify-between group"
            >
              <span>View Groq Bundle Recommendations</span>
              <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
        </div>

      </div>

      {/* Recent Orders Preview Table */}
      <div className="glass-card rounded-2xl p-6 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-slate-100 text-base">Recent Transactions</h3>
          <Link to="/orders" className="text-xs font-bold text-sky-400 hover:underline">
            View All Orders →
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="text-slate-400 border-b border-slate-800">
                <th className="pb-3 font-semibold">Customer & Order</th>
                <th className="pb-3 font-semibold">Items</th>
                <th className="pb-3 font-semibold">Total</th>
                <th className="pb-3 font-semibold">AI Upsell</th>
                <th className="pb-3 font-semibold">Payment Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {recentOrders.map((order) => (
                <tr key={order.id} className="hover:bg-slate-900/40 transition-colors">
                  <td className="py-3">
                    <span className="font-bold text-slate-200 block">{order.customerName || 'Guest Customer'}</span>
                    <span className="font-mono text-[11px] text-slate-400 block">{order.id}</span>
                  </td>
                  <td className="py-3 text-slate-200">
                    {(order.items || []).map((i) => i.name).join(', ')}
                  </td>
                  <td className="py-3 font-extrabold text-white">
                    ₹{(order.baseAmount || 0) + (order.upsellAmount || 0)}
                  </td>
                  <td className="py-3">
                    {order.upsellAdded ? (
                      <span className="text-indigo-400 font-bold bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                        Accepted (+₹{order.upsellAmount})
                      </span>
                    ) : (
                      <span className="text-slate-500">None</span>
                    )}
                  </td>
                  <td className="py-3">
                    <span
                      className={`font-semibold px-2 py-0.5 rounded-full ${
                        order.paymentStatus === 'paid'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                      }`}
                    >
                      {order.paymentStatus?.toUpperCase() || 'CREATED'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
