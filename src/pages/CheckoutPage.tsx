import React, { useState, useEffect, useRef } from 'react';
import {
  ShieldCheck,
  CreditCard,
  Truck,
  CheckCircle2,
  Lock,
  Loader2,
  ArrowRight,
  AlertCircle,
  Tag,
} from 'lucide-react';
import { Order, ShippingAddress } from '../types/index.ts';
import { api } from '../services/api.ts';
import { useCart } from '../context/CartContext.tsx';
import { useAuth } from '../context/AuthContext.tsx';
import { useNotification } from '../context/NotificationContext.tsx';

interface CheckoutPageProps {
  onOrderSuccess: (order: Order) => void;
  onBrowse: () => void;
  onOpenAuth: () => void;
}

export const CheckoutPage: React.FC<CheckoutPageProps> = ({
  onOrderSuccess,
  onBrowse,
  onOpenAuth,
}) => {
  const { cartItems, clearCart, appliedCoupon, applyCoupon, removeCoupon, preview, previewLoading } = useCart();
  const { user, isAuthenticated } = useAuth();
  const { success, error } = useNotification();

  // Rule 17: Safe duplicate order prevention via Idempotency Key
  const idempotencyKeyRef = useRef<string>(
    `idem_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`
  );

  const [fullName, setFullName] = useState(user?.name || '');
  const [street, setStreet] = useState(user?.address?.street || '');
  const [city, setCity] = useState(user?.address?.city || '');
  const [state, setState] = useState(user?.address?.state || '');
  const [postalCode, setPostalCode] = useState(user?.address?.postalCode || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [paymentMethod, setPaymentMethod] = useState<'credit_card' | 'paypal' | 'cod'>('credit_card');

  const [promoInput, setPromoInput] = useState('');
  const [isApplyingPromo, setIsApplyingPromo] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync user details if user logs in on checkout page
  useEffect(() => {
    if (user) {
      if (!fullName) setFullName(user.name);
      if (user.address) {
        if (!street) setStreet(user.address.street);
        if (!city) setCity(user.address.city);
        if (!state) setState(user.address.state);
        if (!postalCode) setPostalCode(user.address.postalCode);
      }
      if (user.phone && !phone) setPhone(user.phone);
    }
  }, [user]);

  if (cartItems.length === 0) {
    return (
      <div className="max-w-2xl mx-auto py-20 px-4 text-center bg-white rounded-3xl border border-slate-200">
        <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mx-auto mb-4">
          <Truck className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Your Checkout Basket is Empty</h2>
        <p className="text-xs text-slate-500 max-w-sm mx-auto mt-2 mb-6">
          Add items to your cart before proceeding to the checkout portal.
        </p>
        <button
          onClick={onBrowse}
          className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition"
        >
          Explore Catalog
        </button>
      </div>
    );
  }

  const handleApplyPromo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!promoInput.trim()) return;
    setIsApplyingPromo(true);
    const ok = await applyCoupon(promoInput.trim());
    setIsApplyingPromo(false);
    if (ok) setPromoInput('');
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAuthenticated) {
      onOpenAuth();
      return;
    }

    if (!fullName.trim() || !street.trim() || !city.trim() || !postalCode.trim()) {
      error('Please complete all required shipping fields');
      return;
    }

    if (preview && !preview.isStockAvailable) {
      error('One or more items in your cart exceeds available stock');
      return;
    }

    setIsSubmitting(true);
    try {
      const shippingAddress: ShippingAddress = {
        fullName: fullName.trim(),
        street: street.trim(),
        city: city.trim(),
        state: state.trim() || 'CA',
        postalCode: postalCode.trim(),
        country: 'US',
        phone: phone.trim() || '+1 (555) 000-0000',
      };

      const orderPayload = {
        orderItems: cartItems.map((item) => ({
          product: item.product._id,
          qty: item.qty,
        })),
        shippingAddress,
        paymentMethod,
        couponCode: appliedCoupon || undefined,
        idempotencyKey: idempotencyKeyRef.current,
      };

      const res = await api.orders.create(orderPayload);
      clearCart();
      success('Order verified and placed successfully!');
      onOrderSuccess(res.order);
    } catch (err: any) {
      error(err.message || 'Checkout failed. Please verify inventory and payment details.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const authoritativeSubtotal = preview ? preview.itemsPrice : 0;
  const authoritativeDiscount = preview ? preview.discountPrice : 0;
  const authoritativeShipping = preview ? preview.shippingPrice : 0;
  const authoritativeTax = preview ? preview.taxPrice : 0;
  const authoritativeTotal = preview ? preview.totalPrice : 0;

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-black tracking-tight text-slate-950">
          Secure Checkout
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Review your items and complete verified payment. Authoritative server prices enforced.
        </p>
      </div>

      {!isAuthenticated && (
        <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
            <div>
              <p className="text-xs font-bold text-amber-900">Sign in for Order Association</p>
              <p className="text-[11px] text-amber-700">Orders are bound to customer accounts for tracking and verified reviews.</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onOpenAuth}
            className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl transition shrink-0"
          >
            Sign In / Register
          </button>
        </div>
      )}

      <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Delivery & Payment Details */}
        <div className="lg:col-span-7 space-y-6">
          {/* Step 1: Shipping Address */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <span className="w-6 h-6 rounded-full bg-indigo-600 text-white text-xs font-bold flex items-center justify-center">
                1
              </span>
              <h2 className="text-base font-bold text-slate-900">Shipping Destination</h2>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Recipient Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Sarah Jenkins"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Street Address *
                </label>
                <input
                  type="text"
                  required
                  placeholder="742 Evergreen Terrace, Apt 4B"
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    City *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Seattle"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    State / Province
                  </label>
                  <input
                    type="text"
                    placeholder="WA"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Postal Code *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="98101"
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Contact Phone Number
                </label>
                <input
                  type="tel"
                  placeholder="+1 (555) 742-9901"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Step 2: Payment Method */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <span className="w-6 h-6 rounded-full bg-indigo-600 text-white text-xs font-bold flex items-center justify-center">
                2
              </span>
              <h2 className="text-base font-bold text-slate-900">Payment Authorization</h2>
            </div>

            <div className="space-y-3">
              {/* Credit card option */}
              <label
                className={`flex items-start gap-3 p-4 rounded-2xl border cursor-pointer transition ${
                  paymentMethod === 'credit_card'
                    ? 'border-indigo-600 bg-indigo-50/20'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="credit_card"
                  checked={paymentMethod === 'credit_card'}
                  onChange={() => setPaymentMethod('credit_card')}
                  className="mt-1 text-indigo-600 focus:ring-indigo-500"
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-indigo-600" />
                      Credit / Debit Card (Tokenized Mock Gateway)
                    </span>
                    <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      Zero Card Storage
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Processed through secure backend payment intents. Raw card credentials and CVVs are never saved.
                  </p>
                </div>
              </label>

              {/* PayPal option */}
              <label
                className={`flex items-start gap-3 p-4 rounded-2xl border cursor-pointer transition ${
                  paymentMethod === 'paypal'
                    ? 'border-indigo-600 bg-indigo-50/20'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="paypal"
                  checked={paymentMethod === 'paypal'}
                  onChange={() => setPaymentMethod('paypal')}
                  className="mt-1 text-indigo-600 focus:ring-indigo-500"
                />
                <div>
                  <span className="text-xs font-bold text-slate-900">
                    PayPal Express Checkout
                  </span>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Fast and verified payment with your linked account.
                  </p>
                </div>
              </label>

              {/* COD option */}
              <label
                className={`flex items-start gap-3 p-4 rounded-2xl border cursor-pointer transition ${
                  paymentMethod === 'cod'
                    ? 'border-indigo-600 bg-indigo-50/20'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="cod"
                  checked={paymentMethod === 'cod'}
                  onChange={() => setPaymentMethod('cod')}
                  className="mt-1 text-indigo-600 focus:ring-indigo-500"
                />
                <div>
                  <span className="text-xs font-bold text-slate-900">
                    Cash on Delivery (Pending Settlement)
                  </span>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Pay securely upon verified courier arrival.
                  </p>
                </div>
              </label>
            </div>

            <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl text-[11px] text-slate-600 border border-slate-200/60">
              <Lock className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                PCI-DSS compliance standard: All transactions are verified and signed server-side.
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Order Summary & Authoritative Totals */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
            <h2 className="text-base font-bold text-slate-900 pb-3 border-b border-slate-100 flex items-center justify-between">
              <span>Order Summary</span>
              <span className="text-xs text-slate-500 font-semibold">{cartItems.length} items</span>
            </h2>

            {/* Items list */}
            <div className="divide-y divide-slate-100 max-h-60 overflow-y-auto pr-1">
              {cartItems.map((item) => (
                <div key={item.product._id} className="py-2.5 flex items-center gap-3">
                  <img
                    src={item.product.images[0]}
                    alt=""
                    className="w-12 h-12 rounded-lg object-cover bg-slate-100 shrink-0 border"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-slate-900 truncate">{item.product.name}</p>
                    <p className="text-[11px] text-slate-500">Qty: {item.qty} &times; ${item.product.price.toFixed(2)}</p>
                  </div>
                  <span className="text-xs font-black text-slate-900 shrink-0">
                    ${(item.product.price * item.qty).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            {/* Promo Code Box */}
            <div className="pt-3 border-t border-slate-100">
              {appliedCoupon ? (
                <div className="flex items-center justify-between p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs">
                  <span className="font-semibold text-emerald-800">
                    Coupon <strong>{appliedCoupon}</strong> active
                  </span>
                  <button
                    type="button"
                    onClick={removeCoupon}
                    className="text-emerald-700 hover:text-emerald-900 font-bold underline"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Tag className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                    <input
                      type="text"
                      placeholder="Coupon Code"
                      value={promoInput}
                      onChange={(e) => setPromoInput(e.target.value.toUpperCase())}
                      className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 uppercase font-mono focus:bg-white focus:outline-none"
                    />
                  </div>
                  <button
                    type="button"
                    disabled={isApplyingPromo || !promoInput.trim()}
                    onClick={handleApplyPromo}
                    className="px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-xl hover:bg-indigo-600 transition disabled:opacity-50"
                  >
                    {isApplyingPromo ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Apply'}
                  </button>
                </div>
              )}
            </div>

            {/* Financial Breakdown */}
            <div className="space-y-2 pt-3 border-t border-slate-100 text-xs text-slate-600">
              <div className="flex justify-between">
                <span>Subtotal (Authoritative)</span>
                <span className="font-semibold text-slate-900">${authoritativeSubtotal.toFixed(2)}</span>
              </div>
              {authoritativeDiscount > 0 && (
                <div className="flex justify-between text-emerald-600 font-bold">
                  <span>Coupon Discount</span>
                  <span>-${authoritativeDiscount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Shipping &amp; Handling</span>
                <span>{authoritativeShipping === 0 ? <strong className="text-emerald-600 uppercase text-[10px]">FREE</strong> : `$${authoritativeShipping.toFixed(2)}`}</span>
              </div>
              <div className="flex justify-between">
                <span>Estimated Sales Tax (8%)</span>
                <span>${authoritativeTax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-base font-extrabold text-slate-950 pt-2 border-t border-slate-200">
                <span>Grand Total</span>
                <span className="text-indigo-600 flex items-center gap-1.5">
                  {previewLoading && <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-400" />}
                  ${authoritativeTotal.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={Boolean(isSubmitting || previewLoading || (preview && !preview.isStockAvailable))}
              className="w-full py-3.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl shadow-md flex items-center justify-center gap-2 active:scale-98 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Processing Payment...</span>
                </>
              ) : (
                <>
                  <span>Place Order (${authoritativeTotal.toFixed(2)})</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <div className="text-[10px] text-center text-slate-400 space-y-1">
              <p>Protected by active idempotency session key.</p>
              <p>Clicking multiple times will not cause duplicate billing or inventory deduction.</p>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};
