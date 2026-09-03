import React, { useState, useEffect } from 'react';
import { getOrders } from '../services/api';
import { Receipt, Search, Filter, CheckCircle2, XCircle, Clock, Sparkles } from 'lucide-react';

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await getOrders();
      if (res.success) {
        setOrders(res.orders || []);
      }
    } catch (err) {
      console.error('Error fetching orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = orders.filter((order) => {
    const matchesFilter =
      filterStatus === 'ALL' ||
      (filterStatus === 'PAID' && order.paymentStatus === 'paid') ||
      (filterStatus === 'FAILED' && (order.paymentStatus === 'failed' || order.paymentStatus === 'created'));

    const searchLower = searchTerm.toLowerCase();
    const matchesSearch =
      order.id.toLowerCase().includes(searchLower) ||
      (order.customerName || '').toLowerCase().includes(searchLower) ||
      (order.razorpayPaymentId || '').toLowerCase().includes(searchLower) ||
      (order.items || []).some((i) => i.name.toLowerCase().includes(searchLower));

    return matchesFilter && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <Receipt className="w-6 h-6 text-sky-400" />
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Merchant Orders Log
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Real-time track of customer orders, Razorpay test payment statuses & AI upsell inclusions.
          </p>
        </div>

        {/* Filter Buttons */}
        <div className="flex items-center space-x-2 bg-slate-900 p-1 rounded-xl border border-slate-800 self-start md:self-auto">
          {['ALL', 'PAID', 'FAILED'].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                filterStatus === status
                  ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Search Input */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
        <input
          type="text"
          placeholder="Search by Customer Name, Order ID, Payment ID, or Item..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500/50"
        />
      </div>

      {/* Orders Table */}
      {loading ? (
        <div className="py-20 text-center space-y-4">
          <div className="w-10 h-10 border-4 border-sky-500/20 border-t-sky-500 rounded-full animate-spin mx-auto" />
          <p className="text-slate-400 text-xs font-medium">Loading orders list...</p>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="glass-card rounded-2xl p-12 text-center text-slate-400 text-sm">
          No orders found matching criteria.
        </div>
      ) : (
        <div className="glass-card rounded-2xl overflow-hidden border border-slate-800">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/80 text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="p-4 font-semibold">Customer & Order</th>
                  <th className="p-4 font-semibold">Ordered Items</th>
                  <th className="p-4 font-semibold">Base Amount</th>
                  <th className="p-4 font-semibold">AI Upsell Impact</th>
                  <th className="p-4 font-semibold">Total Amount</th>
                  <th className="p-4 font-semibold">Razorpay IDs</th>
                  <th className="p-4 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredOrders.map((order) => {
                  const isPaid = order.paymentStatus === 'paid';
                  const isFailed = order.paymentStatus === 'failed';

                  return (
                    <tr key={order.id} className="hover:bg-slate-900/40 transition-colors">
                      
                      {/* Customer Name, Order ID & Date */}
                      <td className="p-4">
                        <span className="font-bold text-slate-100 text-xs block max-w-[180px] truncate" title={order.customerName || 'Guest Customer'}>{order.customerName || 'Guest Customer'}</span>
                        <span className="font-mono text-[11px] text-slate-400 block">{order.id}</span>
                        <span className="text-[10px] text-slate-500">
                          {order.createdAt ? new Date(order.createdAt).toLocaleString('en-IN') : 'N/A'}
                        </span>
                      </td>

                      {/* Items */}
                      <td className="p-4 max-w-xs">
                        <div className="space-y-0.5">
                          {(order.items || []).map((item, idx) => (
                            <div key={idx} className="text-slate-300 font-medium">
                              {item.name} <span className="text-slate-500">x{item.qty}</span>
                            </div>
                          ))}
                        </div>
                      </td>

                      {/* Base Amount */}
                      <td className="p-4 font-semibold text-slate-300">
                        ₹{order.baseAmount}
                      </td>

                      {/* AI Upsell Impact */}
                      <td className="p-4">
                        {order.upsellAdded ? (
                          <div className="inline-flex items-center space-x-1 bg-indigo-500/10 text-indigo-300 text-[11px] font-bold px-2 py-0.5 rounded border border-indigo-500/20">
                            <Sparkles className="w-3 h-3 text-indigo-400" />
                            <span>Accepted (+₹{order.upsellAmount})</span>
                          </div>
                        ) : (
                          <span className="text-slate-500">None</span>
                        )}
                      </td>

                      {/* Total Amount */}
                      <td className="p-4 font-extrabold text-white">
                        ₹{(order.baseAmount || 0) + (order.upsellAmount || 0)}
                      </td>

                      {/* Razorpay IDs */}
                      <td className="p-4 font-mono text-[11px]">
                        <div className="text-slate-400">Order: {order.razorpayOrderId || 'N/A'}</div>
                        {order.razorpayPaymentId && (
                          <div className="text-sky-400 font-semibold">Pay: {order.razorpayPaymentId}</div>
                        )}
                      </td>

                      {/* Status Badge */}
                      <td className="p-4">
                        <span
                          className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${
                            isPaid
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                              : isFailed
                              ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                              : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                          }`}
                        >
                          {isPaid ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          ) : isFailed ? (
                            <XCircle className="w-3.5 h-3.5 text-rose-400" />
                          ) : (
                            <Clock className="w-3.5 h-3.5 text-amber-400" />
                          )}
                          <span>{(order.paymentStatus || 'created').toUpperCase()}</span>
                        </span>
                      </td>

                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
}
