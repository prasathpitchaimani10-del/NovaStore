import React, { useState } from 'react';
import { ShieldCheck, Truck, RotateCcw, Lock, ArrowRight, CheckCircle2 } from 'lucide-react';

interface FooterProps {
  onNavigate: (page: string, params?: any) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.includes('@')) {
      setSubscribed(true);
      setEmail('');
    }
  };

  return (
    <footer className="bg-slate-950 text-slate-400 text-sm mt-20 border-t border-slate-800">
      {/* Trust Badges */}
      <div className="border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-indigo-400 shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">Fast Delivery</h4>
              <p className="text-[11px] text-slate-400">Free standard shipping over $100</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-emerald-400 shrink-0">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">Secure Checkout</h4>
              <p className="text-[11px] text-slate-400">Tokenized payment processing</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-amber-400 shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">Verified Reviews</h4>
              <p className="text-[11px] text-slate-400">Only verified purchasers can rate</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-sky-400 shrink-0">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">30-Day Guarantee</h4>
              <p className="text-[11px] text-slate-400">Hassle-free replacement policy</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Brand */}
        <div className="space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-black text-base shadow-sm">
              N
            </div>
            <span className="text-lg font-black tracking-tight text-white font-sans">
              NOVA<span className="text-indigo-500">STORE</span>
            </span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            High-performance e-commerce architecture engineered with authoritative backend validation, inventory management, role-based controls, and seamless checkout.
          </p>
          <div className="text-xs text-slate-500">
            &copy; {new Date().getFullYear()} NovaStore Inc. All rights reserved.
          </div>
        </div>

        {/* Categories */}
        <div>
          <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-4">Shop Categories</h3>
          <ul className="space-y-2 text-xs">
            <li>
              <button
                onClick={() => onNavigate('catalog', { category: 'Audio' })}
                className="hover:text-white transition"
              >
                High-Resolution Audio
              </button>
            </li>
            <li>
              <button
                onClick={() => onNavigate('catalog', { category: 'Workstation' })}
                className="hover:text-white transition"
              >
                Ergonomic Workstation
              </button>
            </li>
            <li>
              <button
                onClick={() => onNavigate('catalog', { category: 'Wearables' })}
                className="hover:text-white transition"
              >
                Titanium Smartwatches
              </button>
            </li>
            <li>
              <button
                onClick={() => onNavigate('catalog', { category: 'Electronics' })}
                className="hover:text-white transition"
              >
                Displays & Electronics
              </button>
            </li>
            <li>
              <button
                onClick={() => onNavigate('catalog', { category: 'Accessories' })}
                className="hover:text-white transition"
              >
                Travel & Tech Bags
              </button>
            </li>
          </ul>
        </div>

        {/* Customer Care */}
        <div>
          <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-4">Customer Care</h3>
          <ul className="space-y-2 text-xs">
            <li>
              <button onClick={() => onNavigate('my-orders')} className="hover:text-white transition">
                Order Tracking
              </button>
            </li>
            <li>
              <button onClick={() => onNavigate('profile')} className="hover:text-white transition">
                Account Settings
              </button>
            </li>
            <li>
              <span className="text-slate-500">Shipping Policies & Rates</span>
            </li>
            <li>
              <span className="text-slate-500">Terms of Service & Privacy</span>
            </li>
            <li>
              <span className="text-slate-500">Support Desk: support@novastore.com</span>
            </li>
          </ul>
        </div>

        {/* Newsletter */}
        <div>
          <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-4">Stay Informed</h3>
          <p className="text-xs text-slate-400 mb-3 leading-relaxed">
            Subscribe for product drop announcements, seasonal promotions, and hardware releases.
          </p>
          {subscribed ? (
            <div className="flex items-center gap-2 p-3 bg-emerald-950/60 border border-emerald-800 text-emerald-300 rounded-xl text-xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>You have been subscribed! Welcome to NovaStore.</span>
            </div>
          ) : (
            <form onSubmit={handleSubscribe} className="flex gap-2">
              <input
                type="email"
                required
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
              />
              <button
                type="submit"
                className="p-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition"
                aria-label="Subscribe"
              >
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}
        </div>
      </div>
    </footer>
  );
};
