import React, { useState } from 'react';
import {
  X,
  Plus,
  Minus,
  Trash2,
  ArrowRight,
  ShoppingBag,
  Tag,
  CheckCircle2,
  Truck,
  Loader2,
} from 'lucide-react';
import { useCart } from '../context/CartContext.tsx';

interface CartDrawerProps {
  onCheckout: () => void;
  onBrowse: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ onCheckout, onBrowse }) => {
  const {
    cartItems,
    isCartOpen,
    setIsCartOpen,
    updateQuantity,
    removeFromCart,
    appliedCoupon,
    applyCoupon,
    removeCoupon,
    preview,
    previewLoading,
    subtotal,
  } = useCart();

  const [couponInput, setCouponInput] = useState('');
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);

  if (!isCartOpen) return null;

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    setIsApplyingCoupon(true);
    const ok = await applyCoupon(couponInput.trim());
    setIsApplyingCoupon(false);
    if (ok) {
      setCouponInput('');
    }
  };

  // Authoritative calculations fallback to direct items calculation if preview is resolving
  const displaySubtotal = preview ? preview.itemsPrice : subtotal;
  const displayDiscount = preview ? preview.discountPrice : 0;
  const netSubtotal = Math.max(0, displaySubtotal - displayDiscount);
  const freeShippingThreshold = 100;
  const progressToFreeShipping = Math.min(100, Math.round((netSubtotal / freeShippingThreshold) * 100));
  const amountNeededForFreeShipping = Math.max(0, freeShippingThreshold - netSubtotal);

  const displayShipping = preview ? preview.shippingPrice : (netSubtotal >= 100 ? 0 : 12);
  const displayTax = preview ? preview.taxPrice : netSubtotal * 0.08;
  const displayTotal = preview ? preview.totalPrice : netSubtotal + displayShipping + displayTax;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={() => setIsCartOpen(false)}
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity duration-300"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-indigo-600" />
              <h2 className="text-lg font-bold text-slate-900">Your Shopping Cart</h2>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                {cartItems.reduce((acc, i) => acc + i.qty, 0)}
              </span>
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Free shipping progress */}
          <div className="px-6 py-3 bg-indigo-50/60 border-b border-indigo-100 text-xs text-indigo-900">
            <div className="flex items-center justify-between font-semibold mb-1">
              <span className="flex items-center gap-1.5">
                <Truck className="w-3.5 h-3.5 text-indigo-600" />
                {amountNeededForFreeShipping === 0 ? (
                  <span className="text-emerald-700 font-bold">You unlocked Free Delivery!</span>
                ) : (
                  <span>Add ${amountNeededForFreeShipping.toFixed(2)} more for Free Delivery</span>
                )}
              </span>
              <span>{progressToFreeShipping}%</span>
            </div>
            <div className="w-full h-1.5 bg-indigo-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-indigo-600 rounded-full transition-all duration-300"
                style={{ width: `${progressToFreeShipping}%` }}
              />
            </div>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto px-6 py-4 divide-y divide-slate-100">
            {cartItems.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-12">
                <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-4">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <h3 className="text-base font-bold text-slate-900">Your cart is empty</h3>
                <p className="text-xs text-slate-500 max-w-xs mt-1 mb-6">
                  Explore our premium tech and essentials to find something you love.
                </p>
                <button
                  onClick={() => {
                    setIsCartOpen(false);
                    onBrowse();
                  }}
                  className="px-5 py-2.5 bg-indigo-600 text-white text-xs font-bold rounded-xl shadow-xs hover:bg-indigo-700 transition"
                >
                  Explore Catalog
                </button>
              </div>
            ) : (
              cartItems.map((item) => (
                <div key={item.product._id} className="py-4 flex gap-4 items-start">
                  <img
                    src={item.product.images[0]}
                    alt={item.product.name}
                    className="w-18 h-18 rounded-xl object-cover bg-slate-100 border border-slate-200/60 shrink-0"
                  />

                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-bold text-slate-900 truncate">
                      {item.product.name}
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      ${item.product.price.toFixed(2)} each
                    </p>

                    <div className="flex items-center justify-between mt-3">
                      {/* Qty controls */}
                      <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden bg-slate-50">
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.product._id, item.qty - 1)}
                          className="p-1 px-2 text-slate-600 hover:bg-slate-200 transition"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-2 text-xs font-bold text-slate-800">
                          {item.qty}
                        </span>
                        <button
                          type="button"
                          disabled={item.qty >= item.product.stock}
                          onClick={() => updateQuantity(item.product._id, item.qty + 1)}
                          className={`p-1 px-2 text-slate-600 transition ${
                            item.qty >= item.product.stock
                              ? 'opacity-40 cursor-not-allowed'
                              : 'hover:bg-slate-200'
                          }`}
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      {/* Line subtotal */}
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-extrabold text-slate-900">
                          ${(item.product.price * item.qty).toFixed(2)}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeFromCart(item.product._id)}
                          className="text-slate-400 hover:text-rose-600 transition p-1"
                          aria-label="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer with Authoritative Server Breakdown */}
          {cartItems.length > 0 && (
            <div className="p-6 border-t border-slate-200 bg-slate-50/70 space-y-4">
              {/* Promo code form */}
              {appliedCoupon ? (
                <div className="flex items-center justify-between p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs">
                  <div className="flex items-center gap-2 text-emerald-800 font-semibold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Coupon <strong>{appliedCoupon}</strong> applied!</span>
                  </div>
                  <button
                    onClick={removeCoupon}
                    className="text-emerald-700 hover:text-emerald-900 font-bold underline"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyCoupon} className="flex gap-2">
                  <div className="relative flex-1">
                    <Tag className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                    <input
                      type="text"
                      placeholder="Promo code (e.g. SAVE10)"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                      className="w-full pl-8 pr-3 py-2 bg-white text-xs text-slate-900 rounded-xl border border-slate-200 focus:border-indigo-500 focus:outline-none uppercase font-mono"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isApplyingCoupon || !couponInput.trim()}
                    className="px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-xl hover:bg-indigo-600 transition disabled:opacity-50"
                  >
                    {isApplyingCoupon ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Apply'}
                  </button>
                </form>
              )}

              {/* Authoritative Financial Breakdown */}
              <div className="space-y-1.5 text-xs text-slate-600">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-semibold text-slate-900">${displaySubtotal.toFixed(2)}</span>
                </div>
                {displayDiscount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-semibold">
                    <span>Discount</span>
                    <span>-${displayDiscount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Delivery</span>
                  <span>{displayShipping === 0 ? <strong className="text-emerald-600 uppercase text-[11px]">FREE</strong> : `$${displayShipping.toFixed(2)}`}</span>
                </div>
                <div className="flex justify-between">
                  <span>Estimated Tax (8%)</span>
                  <span>${displayTax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-base font-extrabold text-slate-950 pt-2 border-t border-slate-200">
                  <span>Total</span>
                  <span className="text-indigo-700 flex items-center gap-1.5">
                    {previewLoading && <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-500" />}
                    ${displayTotal.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Checkout CTA */}
              <button
                type="button"
                onClick={() => {
                  setIsCartOpen(false);
                  onCheckout();
                }}
                className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl shadow-md flex items-center justify-center gap-2 active:scale-98 transition"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
