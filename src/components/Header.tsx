import React, { useState } from 'react';
import {
  ShoppingBag,
  Search,
  User as UserIcon,
  Menu,
  X,
  ShieldCheck,
  Package,
  LogOut,
  ChevronDown,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';
import { useCart } from '../context/CartContext.tsx';

interface HeaderProps {
  onNavigate: (page: string, params?: any) => void;
  currentPage: string;
  onOpenAuth: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onNavigate,
  currentPage,
  onOpenAuth,
}) => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { totalItemCount, setIsCartOpen } = useCart();
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onNavigate('catalog', { search: searchQuery.trim() });
      setMobileMenuOpen(false);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      {/* Top Announcement Bar */}
      <div className="bg-slate-900 text-slate-200 text-xs py-2 px-4 text-center font-medium flex items-center justify-center gap-2">
        <Sparkles className="w-3.5 h-3.5 text-amber-400" />
        <span>Free standard delivery on orders over $100 &bull; Use code <strong className="text-white bg-slate-800 px-1.5 py-0.5 rounded text-[11px] font-mono border border-slate-700">SAVE10</strong> for 10% off</span>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18 gap-4">
          {/* Logo */}
          <div className="flex items-center gap-8">
            <button
              onClick={() => onNavigate('home')}
              className="flex items-center gap-2.5 text-left focus:outline-none group"
            >
              <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-black text-lg shadow-sm shadow-indigo-200 group-hover:bg-indigo-700 transition">
                N
              </div>
              <div>
                <span className="text-xl font-extrabold tracking-tight text-slate-950 font-sans block leading-none">
                  NOVA<span className="text-indigo-600">STORE</span>
                </span>
                <span className="text-[10px] tracking-wider text-slate-600 font-semibold uppercase block mt-0.5">
                  Full-Stack Commerce
                </span>
              </div>
            </button>

            {/* Desktop Nav Links */}
            <nav className="hidden md:flex items-center space-x-1 font-medium text-sm text-slate-600">
              <button
                onClick={() => onNavigate('home')}
                className={`px-3 py-2 rounded-lg transition ${
                  currentPage === 'home' ? 'text-indigo-600 font-semibold bg-indigo-50/60' : 'hover:text-slate-900 hover:bg-slate-100/70'
                }`}
              >
                Home
              </button>
              <button
                onClick={() => onNavigate('catalog')}
                className={`px-3 py-2 rounded-lg transition ${
                  currentPage === 'catalog' ? 'text-indigo-600 font-semibold bg-indigo-50/60' : 'hover:text-slate-900 hover:bg-slate-100/70'
                }`}
              >
                Shop Catalog
              </button>
              <button
                onClick={() => onNavigate('catalog', { category: 'Audio' })}
                className="px-3 py-2 rounded-lg hover:text-slate-900 hover:bg-slate-100/70 transition"
              >
                Audio
              </button>
              <button
                onClick={() => onNavigate('catalog', { category: 'Workstation' })}
                className="px-3 py-2 rounded-lg hover:text-slate-900 hover:bg-slate-100/70 transition"
              >
                Workstation
              </button>
              <button
                onClick={() => onNavigate('catalog', { category: 'Wearables' })}
                className="px-3 py-2 rounded-lg hover:text-slate-900 hover:bg-slate-100/70 transition"
              >
                Wearables
              </button>
            </nav>
          </div>

          {/* Search Bar - Desktop */}
          <form
            onSubmit={handleSearchSubmit}
            className="hidden lg:flex items-center flex-1 max-w-md mx-4 relative"
          >
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
            <input
              type="text"
              placeholder="Search products, brands, categories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-100/80 hover:bg-slate-100 focus:bg-white text-sm text-slate-900 rounded-xl border border-transparent focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 focus:outline-none transition-all placeholder:text-slate-400"
            />
          </form>

          {/* Actions: User & Cart */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* User Dropdown */}
            {isAuthenticated && user ? (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 p-1.5 pr-2.5 rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition focus:outline-none"
                >
                  <div className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="hidden sm:inline-block text-xs font-semibold text-slate-700 max-w-[100px] truncate">
                    {user.name.split(' ')[0]}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {userDropdownOpen && (
                  <div
                    onMouseLeave={() => setUserDropdownOpen(false)}
                    className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-50 animate-in fade-in slide-in-from-top-2"
                  >
                    <div className="px-4 py-2 border-b border-slate-100">
                      <p className="text-xs text-slate-500">Signed in as</p>
                      <p className="text-sm font-bold text-slate-900 truncate">{user.name}</p>
                      <span className={`inline-block mt-1 px-2 py-0.5 text-[10px] font-bold rounded-md ${
                        isAdmin ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-700'
                      }`}>
                        {isAdmin ? 'Store Administrator' : 'Customer Account'}
                      </span>
                    </div>

                    <button
                      onClick={() => {
                        onNavigate('my-orders');
                        setUserDropdownOpen(false);
                      }}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition text-left"
                    >
                      <Package className="w-4 h-4 text-slate-400" />
                      My Orders
                    </button>

                    <button
                      onClick={() => {
                        onNavigate('profile');
                        setUserDropdownOpen(false);
                      }}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition text-left"
                    >
                      <UserIcon className="w-4 h-4 text-slate-400" />
                      Account Settings
                    </button>

                    {isAdmin && (
                      <button
                        onClick={() => {
                          onNavigate('admin');
                          setUserDropdownOpen(false);
                        }}
                        className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-indigo-700 font-semibold bg-indigo-50/50 hover:bg-indigo-50 transition text-left"
                      >
                        <ShieldCheck className="w-4 h-4 text-indigo-600" />
                        Admin Dashboard
                      </button>
                    )}

                    <div className="border-t border-slate-100 my-1"></div>

                    <button
                      onClick={() => {
                        logout();
                        setUserDropdownOpen(false);
                      }}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-rose-600 hover:bg-rose-50 transition text-left"
                    >
                      <LogOut className="w-4 h-4 text-rose-500" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                type="button"
                onClick={onOpenAuth}
                className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200/80 rounded-xl transition"
              >
                <UserIcon className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </button>
            )}

            {/* Cart Button */}
            <button
              type="button"
              onClick={() => setIsCartOpen(true)}
              className="relative p-2.5 rounded-xl bg-slate-900 text-white hover:bg-indigo-600 active:scale-95 transition shadow-sm"
              aria-label="Open cart"
            >
              <ShoppingBag className="w-4 h-4" />
              {totalItemCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-rose-600 text-white text-[11px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-white shadow-xs">
                  {totalItemCount}
                </span>
              )}
            </button>

            {/* Mobile menu toggle */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Search Bar */}
        <div className="lg:hidden pb-3">
          <form onSubmit={handleSearchSubmit} className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5 pointer-events-none" />
            <input
              type="text"
              placeholder="Search catalog..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-100 text-sm text-slate-900 rounded-xl border border-transparent focus:border-indigo-500 focus:bg-white focus:outline-none"
            />
          </form>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-2">
          <button
            onClick={() => {
              onNavigate('home');
              setMobileMenuOpen(false);
            }}
            className="w-full text-left px-3 py-2 rounded-lg font-medium text-slate-700 hover:bg-slate-50"
          >
            Home
          </button>
          <button
            onClick={() => {
              onNavigate('catalog');
              setMobileMenuOpen(false);
            }}
            className="w-full text-left px-3 py-2 rounded-lg font-medium text-slate-700 hover:bg-slate-50"
          >
            Shop All Catalog
          </button>
          <button
            onClick={() => {
              onNavigate('catalog', { category: 'Audio' });
              setMobileMenuOpen(false);
            }}
            className="w-full text-left px-3 py-2 rounded-lg text-slate-600 hover:bg-slate-50 pl-6"
          >
            &bull; Audio
          </button>
          <button
            onClick={() => {
              onNavigate('catalog', { category: 'Workstation' });
              setMobileMenuOpen(false);
            }}
            className="w-full text-left px-3 py-2 rounded-lg text-slate-600 hover:bg-slate-50 pl-6"
          >
            &bull; Workstation
          </button>
          <button
            onClick={() => {
              onNavigate('catalog', { category: 'Wearables' });
              setMobileMenuOpen(false);
            }}
            className="w-full text-left px-3 py-2 rounded-lg text-slate-600 hover:bg-slate-50 pl-6"
          >
            &bull; Wearables
          </button>

          {isAuthenticated ? (
            <div className="pt-2 border-t border-slate-100 space-y-1">
              <button
                onClick={() => {
                  onNavigate('my-orders');
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left px-3 py-2 rounded-lg font-medium text-slate-700 hover:bg-slate-50"
              >
                My Orders
              </button>
              <button
                onClick={() => {
                  onNavigate('profile');
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left px-3 py-2 rounded-lg font-medium text-slate-700 hover:bg-slate-50"
              >
                Account Profile
              </button>
              {isAdmin && (
                <button
                  onClick={() => {
                    onNavigate('admin');
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded-lg font-bold text-indigo-600 bg-indigo-50"
                >
                  Admin Control Panel
                </button>
              )}
              <button
                onClick={() => {
                  logout();
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left px-3 py-2 rounded-lg font-medium text-rose-600 hover:bg-rose-50"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <div className="pt-2 border-t border-slate-100">
              <button
                onClick={() => {
                  onOpenAuth();
                  setMobileMenuOpen(false);
                }}
                className="w-full py-2.5 text-center text-sm font-bold text-white bg-indigo-600 rounded-xl"
              >
                Sign In / Register
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
};
