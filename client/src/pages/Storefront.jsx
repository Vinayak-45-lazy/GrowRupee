import React, { useState, useEffect } from 'react';
import { getProducts } from '../services/api';
import ProductCard from '../components/ProductCard';
import { Search, Utensils, Sparkles, ShoppingBag } from 'lucide-react';

export default function Storefront({ cartItems, onAddToCart, onOpenCart }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchCatalog();
  }, []);

  const fetchCatalog = async () => {
    try {
      setLoading(true);
      const data = await getProducts();
      if (data.success) {
        setProducts(data.products || []);
      } else {
        setError('Failed to load menu products');
      }
    } catch (err) {
      console.error('Error fetching storefront products:', err);
      setError('Unable to connect to PayPilot backend server');
    } finally {
      setLoading(false);
    }
  };

  const categories = ['All', ...new Set(products.map((p) => p.category).filter(Boolean))];

  const filteredProducts = products.filter((p) => {
    const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const cartProductIds = new Set(cartItems.map((i) => i.productId || i.id));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Store Banner Hero */}
      <div className="relative rounded-3xl overflow-hidden glass-card p-6 sm:p-10 border border-slate-800">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-2xl space-y-4">
          <div className="inline-flex items-center space-x-2 bg-sky-500/10 text-sky-400 px-3 py-1 rounded-full text-xs font-bold border border-sky-500/20">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI-Optimized Upsell Checkout Live</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
            Urban Bites & Brews
          </h1>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            Experience agentic commerce in action. Select items to your cart and watch our deterministic co-occurrence AI phrase perfect complementary offers in real-time.
          </p>

          <div className="pt-2 flex items-center space-x-4">
            <button
              onClick={onOpenCart}
              className="flex items-center space-x-2 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-bold px-5 py-2.5 rounded-xl shadow-lg shadow-sky-500/25 transition-all active:scale-95 text-sm"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>View Cart ({cartItems.length})</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Category Pills */}
        <div className="flex items-center space-x-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40 shadow-sm'
                  : 'bg-slate-900/80 text-slate-400 border border-slate-800 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search Field */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search food items..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900/80 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sky-500/50 transition-colors"
          />
        </div>

      </div>

      {/* Loading & Error States */}
      {loading ? (
        <div className="py-20 text-center space-y-4">
          <div className="w-12 h-12 border-4 border-sky-500/20 border-t-sky-500 rounded-full animate-spin mx-auto" />
          <p className="text-slate-400 text-sm font-medium">Fetching catalog products...</p>
        </div>
      ) : error ? (
        <div className="glass-card rounded-2xl p-8 text-center max-w-md mx-auto border-rose-500/30">
          <p className="text-rose-400 text-sm font-bold">{error}</p>
          <button
            onClick={fetchCatalog}
            className="mt-4 px-4 py-2 bg-slate-800 text-slate-200 rounded-xl text-xs font-bold hover:bg-slate-700"
          >
            Retry Connection
          </button>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="text-center py-16 space-y-3">
          <Utensils className="w-10 h-10 text-slate-600 mx-auto" />
          <p className="text-slate-400 font-medium text-sm">No items found matching your filter</p>
        </div>
      ) : (
        /* Product Grid */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onAddToCart={onAddToCart}
              isInCart={cartProductIds.has(product.id)}
            />
          ))}
        </div>
      )}

    </div>
  );
}
