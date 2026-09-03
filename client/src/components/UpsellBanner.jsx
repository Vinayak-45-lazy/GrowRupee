import React from 'react';
import { Sparkles, Plus, Check, TrendingUp } from 'lucide-react';

export default function UpsellBanner({ recommendation, isAccepted, onAcceptUpsell, onRemoveUpsell }) {
  if (!recommendation || !recommendation.product) return null;

  const { product, message, coOccurrenceCount } = recommendation;

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-950/90 via-slate-900 to-purple-950/90 border border-indigo-500/40 p-4 shadow-xl shadow-indigo-500/10 space-y-3 shadow-indigo-500/5">
      {/* Decorative Glow Backgrounds */}
      <div className="absolute -top-12 -right-12 w-32 h-32 bg-indigo-500/20 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-purple-500/20 rounded-full blur-2xl pointer-events-none" />

      {/* Top Header Row: Icon & Badges */}
      <div className="relative flex items-center justify-between gap-2 border-b border-indigo-500/20 pb-2.5">
        <div className="flex items-center space-x-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-indigo-500 to-purple-500 p-0.5 flex-shrink-0">
            <div className="w-full h-full bg-slate-950 rounded-[6px] flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
            </div>
          </div>
          <span className="bg-indigo-500/20 text-indigo-300 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border border-indigo-500/30 uppercase tracking-wider">
            AI Growth Offer
          </span>
        </div>

        {coOccurrenceCount > 0 && (
          <span className="text-[11px] font-semibold text-purple-300 flex items-center space-x-1 bg-purple-500/10 px-2 py-0.5 rounded-md border border-purple-500/20 whitespace-nowrap">
            <TrendingUp className="w-3 h-3 text-purple-400" />
            <span>Bought together {coOccurrenceCount}+ times</span>
          </span>
        )}
      </div>

      {/* Groq AI Recommendation Quote */}
      <p className="relative text-xs sm:text-sm font-semibold text-slate-100 leading-relaxed italic bg-slate-950/40 p-2.5 rounded-xl border border-slate-800/60">
        "{message}"
      </p>

      {/* Product Action Card Bar */}
      <div className="relative flex items-center justify-between gap-3 bg-slate-950/80 p-2.5 rounded-xl border border-indigo-500/30">
        <div className="flex items-center space-x-2.5 min-w-0">
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-11 h-11 rounded-lg object-cover bg-slate-800 flex-shrink-0 border border-slate-700/50"
          />
          <div className="min-w-0">
            <p className="text-xs font-bold text-slate-100 truncate">{product.name}</p>
            <p className="text-xs font-extrabold text-indigo-400">+₹{product.price}</p>
          </div>
        </div>

        <button
          onClick={() => (isAccepted ? onRemoveUpsell() : onAcceptUpsell(product))}
          className={`flex items-center space-x-1 px-3.5 py-2 rounded-xl text-xs font-bold transition-all active:scale-95 flex-shrink-0 shadow-md ${
            isAccepted
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-rose-500/20 hover:text-rose-300 hover:border-rose-500/40'
              : 'bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white shadow-indigo-500/25'
          }`}
        >
          {isAccepted ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span>Added</span>
            </>
          ) : (
            <>
              <Plus className="w-3.5 h-3.5" />
              <span>Add for ₹{product.price}</span>
            </>
          )}
        </button>
      </div>

    </div>
  );
}
