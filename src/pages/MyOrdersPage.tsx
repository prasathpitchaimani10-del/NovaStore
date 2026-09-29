import React, { useState, useEffect } from 'react';
import { Package, Truck, Calendar, MapPin, ChevronRight, Loader2, ArrowRight } from 'lucide-react';
import { Order } from '../types/index.ts';
import { api } from '../services/api.ts';
import { useAuth } from '../context/AuthContext.tsx';

interface MyOrdersPageProps {
  onNavigate: (page: string, params?: any) => void;
  onOpenProduct: (productId: string) => void;
  onOpenAuth: () => void;
}

export const MyOrdersPage: React.FC<MyOrdersPageProps> = ({
  onNavigate,
  onOpenProduct,
  onOpenAuth,
}) => {
  const { isAuthenticated } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchOrders() {
      if (!isAuthenticated) {
        setLoading(false);
        return;
      }
      try {
        const res = await api.orders.getMyOrders();
        setOrders(res.orders);
      } catch (err) {
        console.error('Failed to load user orders', err);
      } finally {
        setLoading(false);
      }
    }
    fetchOrders();
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <div className="max-w-xl mx-auto py-16 px-4 text-center bg-white rounded-3xl border border-slate-200 p-8 space-y-4 shadow-xs">
        <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto">
          <Package className="w-7 h-7" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Sign in to View Your Orders</h2>
        <p className="text-xs text-slate-500 max-w-sm mx-auto">
          Access past receipts, delivery statuses, and write verified customer reviews for hardware you own.
        </p>
        <button
          onClick={onOpenAuth}
          className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition"
        >
          Sign In
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-black tracking-tight text-slate-950">
          Order History &amp; Tracking
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Review past purchases, current fulfillment status, and author verified reviews.
        </p>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 p-8 space-y-4 shadow-xs">
          <div className="w-14 h-14 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto">
            <Package className="w-7 h-7" />
          </div>
          <h2 className="text-base font-bold text-slate-900">No Orders Yet</h2>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            You haven't placed any hardware orders with us yet.
          </p>
          <button
            onClick={() => onNavigate('catalog')}
            className="px-5 py-2.5 bg-indigo-600 text-white text-xs font-bold rounded-xl transition shadow-xs"
          >
            Start Shopping
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div
              key={order._id}
              className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 space-y-6 shadow-xs hover:border-slate-300 transition"
            >
              {/* Header */}
              <div className="flex flex-wrap items-center justify-between pb-4 border-b border-slate-100 gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900 font-mono">
                      #{order._id}
                    </span>
                    <span
                      className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full ${
                        order.status === 'delivered'
                          ? 'bg-emerald-100 text-emerald-800'
                          : order.status === 'shipped'
                          ? 'bg-sky-100 text-sky-800'
                          : order.status === 'processing'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-slate-100 text-slate-800'
                      }`}
                    >
                      {order.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-[11px] text-slate-500">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {new Date(order.createdAt).toLocaleDateString()}
                    </span>
                    <span>&bull;</span>
                    <span>Total: <strong>${order.totalPrice.toFixed(2)}</strong></span>
                  </div>
                </div>

                <div className="text-xs text-right">
                  <span className="text-slate-400 block text-[11px]">Payment:</span>
                  <span className="font-semibold text-slate-800 capitalize">
                    {order.paymentMethod.replace('_', ' ')} ({order.isPaid ? 'Paid' : 'Pending'})
                  </span>
                </div>
              </div>

              {/* Items */}
              <div className="space-y-3">
                {order.orderItems.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between gap-4 p-3 rounded-2xl bg-slate-50/70 border border-slate-100"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={item.image}
                        alt=""
                        className="w-14 h-14 rounded-xl object-cover bg-white border shrink-0"
                      />
                      <div>
                        <h4 className="text-xs font-bold text-slate-900 line-clamp-1">{item.name}</h4>
                        <p className="text-[11px] text-slate-500">
                          Qty: {item.qty} &times; ${item.price.toFixed(2)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => onOpenProduct(item.product)}
                        className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 transition p-1"
                      >
                        <span>Product Page &amp; Review</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Footer details */}
              <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-500 gap-2 border-t border-slate-100">
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span>Ships to: {order.shippingAddress.fullName}, {order.shippingAddress.city}, {order.shippingAddress.state}</span>
                </span>
                <span className="font-mono text-[11px] text-slate-400">
                  Idempotency Protected
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
