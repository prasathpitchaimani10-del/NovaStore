import React from 'react';
import { CheckCircle2, Package, ArrowRight, Truck, MapPin, Calendar, CreditCard } from 'lucide-react';
import { Order } from '../types/index.ts';

interface OrderSuccessPageProps {
  order: Order;
  onNavigate: (page: string, params?: any) => void;
}

export const OrderSuccessPage: React.FC<OrderSuccessPageProps> = ({ order, onNavigate }) => {
  return (
    <div className="max-w-3xl mx-auto py-8 space-y-8 animate-in fade-in duration-300">
      {/* Celebration Header */}
      <div className="bg-white p-8 rounded-3xl border border-slate-200/80 shadow-xs text-center space-y-4">
        <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-xs">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <div className="space-y-1">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            Payment &amp; Inventory Verified
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-950 pt-2">
            Thank you for your order!
          </h1>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Your transaction has been securely processed. A confirmation receipt has been dispatched to your email.
          </p>
        </div>

        <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-700">
          <span className="text-slate-400">Order Reference:</span>
          <strong>#{order._id}</strong>
        </div>
      </div>

      {/* Order Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 text-xs space-y-1.5">
          <div className="text-slate-400 font-semibold flex items-center gap-1.5 uppercase tracking-wider text-[10px]">
            <Calendar className="w-3.5 h-3.5 text-indigo-600" />
            <span>Order Date</span>
          </div>
          <p className="font-bold text-slate-900">
            {new Date(order.createdAt).toLocaleDateString()} at{' '}
            {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 text-xs space-y-1.5">
          <div className="text-slate-400 font-semibold flex items-center gap-1.5 uppercase tracking-wider text-[10px]">
            <Truck className="w-3.5 h-3.5 text-indigo-600" />
            <span>Status</span>
          </div>
          <p className="font-bold text-emerald-700 capitalize flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
            {order.status}
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 text-xs space-y-1.5">
          <div className="text-slate-400 font-semibold flex items-center gap-1.5 uppercase tracking-wider text-[10px]">
            <CreditCard className="w-3.5 h-3.5 text-indigo-600" />
            <span>Payment Method</span>
          </div>
          <p className="font-bold text-slate-900 capitalize">
            {order.paymentMethod.replace('_', ' ')} &bull; {order.isPaid ? 'Settled' : 'Pending'}
          </p>
        </div>
      </div>

      {/* Items & Shipping Breakdown */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-6">
        <div>
          <h3 className="text-sm font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100 flex items-center gap-2">
            <Package className="w-4 h-4 text-indigo-600" />
            <span>Purchased Items ({order.orderItems.length})</span>
          </h3>

          <div className="divide-y divide-slate-100">
            {order.orderItems.map((item, idx) => (
              <div key={idx} className="py-3 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-12 h-12 rounded-xl object-cover bg-slate-100 border"
                  />
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">{item.name}</h4>
                    <span className="text-[11px] text-slate-400">
                      Qty: {item.qty} &times; ${item.price.toFixed(2)}
                    </span>
                  </div>
                </div>
                <span className="text-xs font-extrabold text-slate-900">
                  ${(item.price * item.qty).toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-100">
          <div>
            <h4 className="text-xs font-bold text-slate-900 mb-2 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              <span>Shipping Address</span>
            </h4>
            <div className="text-xs text-slate-600 space-y-0.5 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100">
              <p className="font-bold text-slate-900">{order.shippingAddress.fullName}</p>
              <p>{order.shippingAddress.street}</p>
              <p>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}</p>
              <p>{order.shippingAddress.country} &bull; {order.shippingAddress.phone}</p>
            </div>
          </div>

          <div className="space-y-2 text-xs text-slate-600 bg-slate-50 p-4 rounded-xl border border-slate-100 flex flex-col justify-center">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="font-semibold text-slate-900">${order.itemsPrice.toFixed(2)}</span>
            </div>
            {order.discountPrice > 0 && (
              <div className="flex justify-between text-emerald-600 font-bold">
                <span>Discount ({order.couponCode})</span>
                <span>-${order.discountPrice.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>Shipping</span>
              <span>{order.shippingPrice === 0 ? 'FREE' : `$${order.shippingPrice.toFixed(2)}`}</span>
            </div>
            <div className="flex justify-between">
              <span>Sales Tax</span>
              <span>${order.taxPrice.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-extrabold text-sm text-slate-950 pt-2 border-t border-slate-200">
              <span>Total Paid</span>
              <span className="text-indigo-600">${order.totalPrice.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Actions */}
      <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
        <button
          onClick={() => onNavigate('my-orders')}
          className="px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-xs transition"
        >
          Track All Orders
        </button>
        <button
          onClick={() => onNavigate('catalog')}
          className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-2 transition"
        >
          <span>Continue Shopping</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
