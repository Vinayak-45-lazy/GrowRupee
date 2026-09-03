import React from 'react';
import { Plus, Check } from 'lucide-react';

export default function ProductCard({ product, onAddToCart, isInCart }) {
  return (
    <div className="glass-card rounded-2xl overflow-hidden group hover:border-sky-500/40 transition-all duration-300 flex flex-col justify-between hover:shadow-xl hover:shadow-sky-500/5">
      <div>
        {/* Product Image */}
        <div className="relative h-48 w-full overflow-hidden bg-slate-900">
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={(e) => {
              e.target.src = 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop&q=80';
            }}
          />
          <div className="absolute top-3 left-3 bg-slate-950/80 backdrop-blur-md px-2.5 py-1 rounded-full border border-slate-700/50">
            <span className="text-[11px] font-semibold text-slate-300 tracking-wide uppercase">
              {product.category || 'General'}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          <h3 className="font-bold text-slate-100 text-base group-hover:text-sky-300 transition-colors line-clamp-1">
            {product.name}
          </h3>
          <p className="text-xs text-slate-400 mt-1 line-clamp-2">
            Freshly prepared gourmet selection served with signature seasoning.
          </p>
        </div>
      </div>

      {/* Footer / Price & Action */}
      <div className="p-4 pt-0 flex items-center justify-between mt-2">
        <div>
          <span className="text-xs text-slate-400 block font-medium">Price</span>
          <span className="text-lg font-extrabold text-white">₹{product.price}</span>
        </div>

        <button
          onClick={() => onAddToCart(product)}
          className={`flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all active:scale-95 ${
            isInCart
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30'
              : 'bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white shadow-lg shadow-sky-500/20'
          }`}
        >
          {isInCart ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span>Added</span>
            </>
          ) : (
            <>
              <Plus className="w-3.5 h-3.5" />
              <span>Add Item</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
