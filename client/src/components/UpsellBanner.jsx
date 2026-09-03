import React from 'react';
import { Sparkles, Plus, Check, TrendingUp } from 'lucide-react';

export default function UpsellBanner({ recommendation, isAccepted, onAcceptUpsell, onRemoveUpsell }) {
  if (!recommendation || !recommendation.product) return null;

  const { product, message, coOccurrenceCount } = recommendation;

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-950/80 via-slate-900 to-purple-950/80 border border-indigo-500/30 p-4 shadow-xl shadow-indigo-500/10">
      {/* Decorative Gradient Glow Background */}
      <div className="absolute -top-12 -right-12 w-32 h-32 bg-indigo-500/20 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-purple-500/20 rounded-full blur-2xl pointer-events-none" />

      <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        
        {/* Left Side Info */}
        <div className="flex items-start space-x-3.5 flex-1">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-500 p-0.5 flex-shrink-0">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-indigo-400 animate-pulse" />
            </div>
          </div>

          <div>
            <div className="flex items-center space-x-2 flex-wrap gap-y-1">
              <span className="bg-indigo-500/20 text-indigo-300 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-indigo-500/30 uppercase tracking-wide">
                AI Growth Opportunity
              </span>
              {coOccurrenceCount > 0 && (
                <span className="text-[11px] text-purple-300 flex items-center space-x-1 font-medium">
                  <TrendingUp className="w-3 h-3 text-purple-400 inline" />
                  <span>Bought together in {coOccurrenceCount}+ orders</span>
                </span>
              )}
            </div>

            {/* Groq AI Natural Language Recommendation Message */}
            <p className="text-sm font-semibold text-slate-100 mt-1.5 leading-snug">
              "{message}"
            </p>
          </div>
        </div>

        {/* Right Side Product Action Box */}
        <div className="flex items-center space-x-3 bg-slate-950/70 p-2 rounded-xl border border-slate-800 w-full sm:w-auto justify-between sm:justify-start">
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-10 h-10 rounded-lg object-cover bg-slate-800"
          />
          
          <div className="text-left pr-2">
            <p className="text-xs font-bold text-slate-200 line-clamp-1">{product.name}</p>
            <p className="text-xs font-extrabold text-indigo-400">+₹{product.price}</p>
          </div>

          <button
            onClick={() => (isAccepted ? onRemoveUpsell() : onAcceptUpsell(product))}
            className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all active:scale-95 whitespace-nowrap ${
              isAccepted
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-rose-500/20 hover:text-rose-300 hover:border-rose-500/40'
                : 'bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white shadow-md shadow-indigo-500/20'
            }`}
          >
            {isAccepted ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>Added (+₹{product.price})</span>
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
    </div>
  );
}
