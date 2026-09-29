import React, { useEffect, useState } from 'react';
import { ArrowRight, Sparkles, ShieldCheck, Zap, Headphones, Laptop, Watch, ShoppingBag } from 'lucide-react';
import { Product } from '../types/index.ts';
import { api } from '../services/api.ts';
import { ProductCard } from '../components/ProductCard.tsx';

interface HomePageProps {
  onNavigate: (page: string, params?: any) => void;
  onSelectProduct: (product: Product) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onNavigate, onSelectProduct }) => {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadFeatured() {
      try {
        const res = await api.products.getProducts({ limit: 8, sort: 'featured' });
        setFeaturedProducts(res.products);
      } catch (err) {
        console.error('Failed to load featured products', err);
      } finally {
        setLoading(false);
      }
    }
    loadFeatured();
  }, []);

  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-slate-950 text-white px-6 sm:px-12 py-16 sm:py-24 shadow-2xl">
        <div className="absolute inset-0 bg-radial from-indigo-900/30 via-slate-950 to-slate-950 pointer-events-none" />
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-3xl space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-400/20 text-indigo-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>Next-Generation Hardware &amp; Workspace Essentials</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight leading-[1.1]">
            Precision Engineering for Modern Workstations.
          </h1>

          <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl font-normal">
            Equip your setup with studio-grade noise-cancelling headphones, ergonomic tactile mechanical keyboards, and aerospace-grade smartwatches. Authoritative pricing and verified customer feedback.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-4">
            <button
              onClick={() => onNavigate('catalog')}
              className="px-6 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition active:scale-98"
            >
              <span>Explore All Products</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => onNavigate('catalog', { inStock: true })}
              className="px-6 py-3.5 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 font-semibold text-sm rounded-xl transition"
            >
              Ready to Ship
            </button>
          </div>
        </div>
      </section>

      {/* Featured Categories */}
      <section>
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-black tracking-tight text-slate-950">
              Browse by Category
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Curated hardware engineered for peak performance
            </p>
          </div>
          <button
            onClick={() => onNavigate('catalog')}
            className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 transition"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button
            onClick={() => onNavigate('catalog', { category: 'Audio' })}
            className="p-6 rounded-2xl bg-white border border-slate-200/80 hover:border-indigo-400 hover:shadow-lg transition text-left group flex flex-col justify-between h-40"
          >
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:scale-110 transition">
              <Headphones className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 group-hover:text-indigo-600 transition">
                Audio & Sound
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">Headphones &amp; ANC</p>
            </div>
          </button>

          <button
            onClick={() => onNavigate('catalog', { category: 'Workstation' })}
            className="p-6 rounded-2xl bg-white border border-slate-200/80 hover:border-indigo-400 hover:shadow-lg transition text-left group flex flex-col justify-between h-40"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-110 transition">
              <Laptop className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 group-hover:text-indigo-600 transition">
                Workstation
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">Keyboards &amp; Mice</p>
            </div>
          </button>

          <button
            onClick={() => onNavigate('catalog', { category: 'Wearables' })}
            className="p-6 rounded-2xl bg-white border border-slate-200/80 hover:border-indigo-400 hover:shadow-lg transition text-left group flex flex-col justify-between h-40"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition">
              <Watch className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 group-hover:text-indigo-600 transition">
                Wearables
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">Titanium GPS Watches</p>
            </div>
          </button>

          <button
            onClick={() => onNavigate('catalog', { category: 'Accessories' })}
            className="p-6 rounded-2xl bg-white border border-slate-200/80 hover:border-indigo-400 hover:shadow-lg transition text-left group flex flex-col justify-between h-40"
          >
            <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center group-hover:scale-110 transition">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 group-hover:text-indigo-600 transition">
                Tech Gear
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">Bags &amp; Organizers</p>
            </div>
          </button>
        </div>
      </section>

      {/* Featured Products */}
      <section>
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-black tracking-tight text-slate-950">
              Featured Products
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Top rated by community purchasers with verified reviews
            </p>
          </div>
          <button
            onClick={() => onNavigate('catalog')}
            className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 transition"
          >
            <span>View Full Catalog</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, idx) => (
              <div key={idx} className="h-80 bg-slate-200/60 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((p) => (
              <ProductCard key={p._id} product={p} onSelect={onSelectProduct} />
            ))}
          </div>
        )}
      </section>

      {/* Promotional Discount Callout */}
      <section className="bg-gradient-to-r from-indigo-900 to-slate-900 rounded-3xl p-8 sm:p-12 text-white flex flex-col md:flex-row items-center justify-between gap-8 shadow-xl">
        <div className="space-y-2 max-w-lg">
          <span className="px-3 py-1 rounded-full bg-amber-400 text-slate-950 text-xs font-extrabold uppercase">
            Exclusive Coupon
          </span>
          <h3 className="text-2xl sm:text-3xl font-black">
            Save 10% on your entire checkout today.
          </h3>
          <p className="text-xs text-indigo-200 leading-relaxed">
            Apply verified coupon code at checkout on any order over $50. Valid for audio, displays, keyboards, and accessories.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="px-5 py-3 rounded-2xl bg-white/10 border border-white/20 font-mono text-base font-bold tracking-widest text-amber-300">
            SAVE10
          </div>
          <button
            onClick={() => onNavigate('catalog')}
            className="px-6 py-3.5 bg-white text-slate-950 hover:bg-slate-100 font-bold text-xs rounded-xl shadow-md transition"
          >
            Apply to Catalog
          </button>
        </div>
      </section>

      {/* Engineering & Trust Pillars */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-8 py-8 border-y border-slate-200">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
            <Zap className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-bold text-slate-900 text-base">Authoritative Backend Calculation</h4>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Every tax, discount, stock reservation, and total is calculated and verified server-side.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-bold text-slate-900 text-base">Verified-Purchase Reviews</h4>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Reviews can only be authored by customers with a confirmed delivered order for that item.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-100 text-amber-600 flex items-center justify-center shrink-0">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-bold text-slate-900 text-base">Zero Stored Card Data</h4>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Payments are tokenized through secure client intents. Raw credentials are never stored.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
