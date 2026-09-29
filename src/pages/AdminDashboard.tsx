import React, { useState, useEffect, useCallback } from 'react';
import {
  ShieldAlert,
  Package,
  ShoppingCart,
  Tag,
  DollarSign,
  Plus,
  Trash2,
  Edit2,
  X,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  Upload,
} from 'lucide-react';
import { Product, Order, Coupon } from '../types/index.ts';
import { api } from '../services/api.ts';
import { useAuth } from '../context/AuthContext.tsx';
import { useNotification } from '../context/NotificationContext.tsx';

interface AdminDashboardProps {
  onNavigate: (page: string, params?: any) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onNavigate }) => {
  const { user, isAdmin } = useAuth();
  const { success, error } = useNotification();

  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'orders' | 'coupons'>('overview');
  const [loading, setLoading] = useState(true);

  // Data states
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);

  // Product modal
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    price: '',
    compareAtPrice: '',
    category: 'Audio',
    brand: '',
    stock: '',
    sku: '',
    imageUrl: '',
    isFeatured: false,
  });

  // Coupon modal
  const [isCouponModalOpen, setIsCouponModalOpen] = useState(false);
  const [couponForm, setCouponForm] = useState({
    code: '',
    discountType: 'percentage' as 'percentage' | 'fixed',
    discountValue: '',
    minOrderValue: '',
    expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    usageLimit: '100',
  });

  const loadData = useCallback(async () => {
    if (!isAdmin) return;
    setLoading(true);
    try {
      const [prodRes, orderRes, couponRes] = await Promise.all([
        api.products.getProducts({ limit: 100 }),
        api.orders.getAllAdmin(),
        api.coupons.getAll(),
      ]);
      setProducts(prodRes.products);
      setOrders(orderRes.orders);
      setCoupons(couponRes.coupons);
    } catch (err: any) {
      error(err.message || 'Failed to fetch admin data');
    } finally {
      setLoading(false);
    }
  }, [isAdmin, error]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (!isAdmin) {
    return (
      <div className="max-w-xl mx-auto py-20 px-4 text-center bg-white rounded-3xl border border-rose-200 p-8 space-y-4 shadow-sm">
        <div className="w-16 h-16 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mx-auto">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Admin Authorization Required</h2>
        <p className="text-xs text-slate-500 max-w-sm mx-auto">
          Rule 10 Enforced: Customers cannot access backend administrative consoles. Sign in with administrative privileges to manage inventory and orders.
        </p>
        <button
          onClick={() => onNavigate('home')}
          className="px-6 py-2.5 bg-slate-900 text-white text-xs font-bold rounded-xl"
        >
          Return to Storefront
        </button>
      </div>
    );
  }

  // Calculate Metrics
  const totalRevenue = orders
    .filter((o) => o.isPaid || o.status !== 'cancelled')
    .reduce((acc, o) => acc + o.totalPrice, 0);
  const lowStockCount = products.filter((p) => p.stock <= 5).length;

  // Product CRUD
  const handleOpenCreateProduct = () => {
    setEditingProductId(null);
    setProductForm({
      name: '',
      description: '',
      price: '',
      compareAtPrice: '',
      category: 'Audio',
      brand: '',
      stock: '20',
      sku: `SKU-${Date.now().toString().slice(-6)}`,
      imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80',
      isFeatured: false,
    });
    setIsProductModalOpen(true);
  };

  const handleOpenEditProduct = (p: Product) => {
    setEditingProductId(p._id);
    setProductForm({
      name: p.name,
      description: p.description,
      price: p.price.toString(),
      compareAtPrice: p.compareAtPrice ? p.compareAtPrice.toString() : '',
      category: p.category,
      brand: p.brand,
      stock: p.stock.toString(),
      sku: p.sku,
      imageUrl: p.images[0] || '',
      isFeatured: p.isFeatured,
    });
    setIsProductModalOpen(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload: Partial<Product> = {
        name: productForm.name.trim(),
        description: productForm.description.trim(),
        price: parseFloat(productForm.price),
        compareAtPrice: productForm.compareAtPrice ? parseFloat(productForm.compareAtPrice) : undefined,
        category: productForm.category.trim(),
        brand: productForm.brand.trim(),
        stock: parseInt(productForm.stock, 10),
        sku: productForm.sku.trim(),
        images: [productForm.imageUrl.trim()],
        isFeatured: productForm.isFeatured,
      };

      if (editingProductId) {
        await api.products.updateProduct(editingProductId, payload);
        success('Product updated successfully');
      } else {
        await api.products.createProduct(payload);
        success('New product created successfully');
      }

      setIsProductModalOpen(false);
      loadData();
    } catch (err: any) {
      error(err.message || 'Failed to save product');
    }
  };

  const handleDeleteProduct = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to permanently delete "${name}"?`)) return;
    try {
      await api.products.deleteProduct(id);
      success(`Product "${name}" deleted`);
      loadData();
    } catch (err: any) {
      error(err.message || 'Failed to delete product');
    }
  };

  // Order status update
  const handleUpdateOrderStatus = async (orderId: string, newStatus: Order['status']) => {
    try {
      await api.orders.updateStatus(orderId, newStatus);
      success(`Order updated to status: ${newStatus}`);
      setOrders((prev) =>
        prev.map((o) => (o._id === orderId ? { ...o, status: newStatus } : o))
      );
    } catch (err: any) {
      error(err.message || 'Failed to update order status');
    }
  };

  // Coupon CRUD
  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.coupons.create({
        code: couponForm.code.trim().toUpperCase(),
        discountType: couponForm.discountType,
        discountValue: parseFloat(couponForm.discountValue),
        minOrderValue: couponForm.minOrderValue ? parseFloat(couponForm.minOrderValue) : 0,
        expiryDate: couponForm.expiryDate,
        usageLimit: couponForm.usageLimit ? parseInt(couponForm.usageLimit, 10) : undefined,
      });

      success(`Coupon ${couponForm.code.toUpperCase()} created successfully`);
      setIsCouponModalOpen(false);
      loadData();
    } catch (err: any) {
      error(err.message || 'Failed to create coupon');
    }
  };

  const handleDeleteCoupon = async (id: string, code: string) => {
    if (!confirm(`Delete coupon "${code}"?`)) return;
    try {
      await api.coupons.delete(id);
      success(`Coupon "${code}" deleted`);
      loadData();
    } catch (err: any) {
      error(err.message || 'Failed to delete coupon');
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-200 gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-amber-100 text-amber-900 text-xs font-bold mb-1">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Administrator Console</span>
          </div>
          <h1 className="text-3xl font-black tracking-tight text-slate-950">
            NovaStore Management
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Full-stack inventory control, order fulfillment, and discount code administration.
          </p>
        </div>

        {/* Tab switchers */}
        <div className="flex items-center bg-slate-100 p-1 rounded-2xl gap-1">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-3.5 py-2 text-xs font-bold rounded-xl transition ${
              activeTab === 'overview'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('products')}
            className={`px-3.5 py-2 text-xs font-bold rounded-xl transition ${
              activeTab === 'products'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Products ({products.length})
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-3.5 py-2 text-xs font-bold rounded-xl transition ${
              activeTab === 'orders'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Orders ({orders.length})
          </button>
          <button
            onClick={() => setActiveTab('coupons')}
            className={`px-3.5 py-2 text-xs font-bold rounded-xl transition ${
              activeTab === 'coupons'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Coupons ({coupons.length})
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center min-h-[50vh]">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
        </div>
      ) : (
        <>
          {/* OVERVIEW TAB */}
          {activeTab === 'overview' && (
            <div className="space-y-8">
              {/* Metrics row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-2">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                    <DollarSign className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-semibold text-slate-500">Gross Sales</span>
                  <p className="text-2xl font-black text-slate-950">${totalRevenue.toFixed(2)}</p>
                </div>

                <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-2">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <ShoppingCart className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-semibold text-slate-500">Total Customer Orders</span>
                  <p className="text-2xl font-black text-slate-950">{orders.length}</p>
                </div>

                <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-2">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                    <Package className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-semibold text-slate-500">Active SKUs</span>
                  <p className="text-2xl font-black text-slate-950">{products.length}</p>
                </div>

                <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-2">
                  <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-semibold text-slate-500">Low Inventory Warnings</span>
                  <p className="text-2xl font-black text-rose-600">{lowStockCount} items</p>
                </div>
              </div>

              {/* Recent Orders Overview */}
              <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900">Recent Customer Orders</h3>
                  <button
                    onClick={() => setActiveTab('orders')}
                    className="text-xs font-bold text-indigo-600 hover:text-indigo-800"
                  >
                    View All Orders &rarr;
                  </button>
                </div>

                <div className="divide-y divide-slate-100">
                  {orders.slice(0, 5).map((o) => (
                    <div key={o._id} className="py-3 flex items-center justify-between text-xs">
                      <div>
                        <span className="font-mono font-bold text-slate-900">#{o._id.slice(-6)}</span>
                        <span className="text-slate-400 ml-2">by {o.shippingAddress.fullName}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="font-extrabold text-slate-900">${o.totalPrice.toFixed(2)}</span>
                        <span
                          className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                            o.status === 'delivered'
                              ? 'bg-emerald-100 text-emerald-800'
                              : o.status === 'shipped'
                              ? 'bg-sky-100 text-sky-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {o.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* PRODUCTS TAB */}
          {activeTab === 'products' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-slate-900">Catalog Inventory</h3>
                <button
                  onClick={handleOpenCreateProduct}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl flex items-center gap-2 transition"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Product</span>
                </button>
              </div>

              <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
                      <tr>
                        <th className="py-3 px-4">Product</th>
                        <th className="py-3 px-4">Category</th>
                        <th className="py-3 px-4">Price</th>
                        <th className="py-3 px-4">Stock</th>
                        <th className="py-3 px-4">Rating</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {products.map((p) => (
                        <tr key={p._id} className="hover:bg-slate-50/70 transition">
                          <td className="py-3 px-4 flex items-center gap-3">
                            <img
                              src={p.images[0]}
                              alt=""
                              className="w-10 h-10 rounded-lg object-cover bg-slate-100 border shrink-0"
                            />
                            <div>
                              <p className="font-bold text-slate-900">{p.name}</p>
                              <p className="text-[10px] text-slate-400 font-mono">SKU: {p.sku}</p>
                            </div>
                          </td>
                          <td className="py-3 px-4 font-medium text-slate-600">{p.category}</td>
                          <td className="py-3 px-4 font-bold text-slate-900">${p.price.toFixed(2)}</td>
                          <td className="py-3 px-4">
                            <span
                              className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                                p.stock === 0
                                  ? 'bg-rose-100 text-rose-800'
                                  : p.stock <= 5
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-emerald-100 text-emerald-800'
                              }`}
                            >
                              {p.stock} units
                            </span>
                          </td>
                          <td className="py-3 px-4 text-slate-600">
                            {p.rating.toFixed(1)} ({p.numReviews})
                          </td>
                          <td className="py-3 px-4 text-right space-x-2">
                            <button
                              onClick={() => handleOpenEditProduct(p)}
                              className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                              title="Edit product"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(p._id, p.name)}
                              className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                              title="Delete product"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ORDERS TAB */}
          {activeTab === 'orders' && (
            <div className="space-y-6">
              <h3 className="text-base font-bold text-slate-900">All Customer Orders</h3>

              <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
                      <tr>
                        <th className="py-3 px-4">Order ID</th>
                        <th className="py-3 px-4">Customer</th>
                        <th className="py-3 px-4">Items</th>
                        <th className="py-3 px-4">Total</th>
                        <th className="py-3 px-4">Payment</th>
                        <th className="py-3 px-4">Status &amp; Control</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {orders.map((o) => (
                        <tr key={o._id} className="hover:bg-slate-50/70 transition">
                          <td className="py-3 px-4 font-mono font-bold text-slate-900">
                            #{o._id.slice(-8)}
                          </td>
                          <td className="py-3 px-4">
                            <p className="font-bold text-slate-900">{o.shippingAddress.fullName}</p>
                            <p className="text-[10px] text-slate-400">{o.shippingAddress.city}, {o.shippingAddress.state}</p>
                          </td>
                          <td className="py-3 px-4 font-medium text-slate-600">
                            {o.orderItems.length} items
                          </td>
                          <td className="py-3 px-4 font-black text-slate-900">
                            ${o.totalPrice.toFixed(2)}
                          </td>
                          <td className="py-3 px-4">
                            <span className="capitalize">{o.paymentMethod.replace('_', ' ')}</span>
                            <span className="block text-[10px] text-slate-400">
                              {o.isPaid ? 'Settled' : 'Pending'}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <select
                              value={o.status}
                              onChange={(e) =>
                                handleUpdateOrderStatus(o._id, e.target.value as Order['status'])
                              }
                              className="px-2.5 py-1 text-xs font-bold rounded-lg border border-slate-200 bg-white focus:outline-none focus:border-indigo-500"
                            >
                              <option value="pending">Pending</option>
                              <option value="processing">Processing</option>
                              <option value="shipped">Shipped</option>
                              <option value="delivered">Delivered</option>
                              <option value="cancelled">Cancelled</option>
                            </select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* COUPONS TAB */}
          {activeTab === 'coupons' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-slate-900">Promotional Coupons</h3>
                <button
                  onClick={() => setIsCouponModalOpen(true)}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl flex items-center gap-2 transition"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create Coupon</span>
                </button>
              </div>

              <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
                      <tr>
                        <th className="py-3 px-4">Code</th>
                        <th className="py-3 px-4">Discount</th>
                        <th className="py-3 px-4">Min Order</th>
                        <th className="py-3 px-4">Usage / Limit</th>
                        <th className="py-3 px-4">Expiry</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {coupons.map((c) => (
                        <tr key={c._id} className="hover:bg-slate-50/70 transition">
                          <td className="py-3 px-4 font-mono font-extrabold text-indigo-700">
                            {c.code}
                          </td>
                          <td className="py-3 px-4 font-bold text-slate-900">
                            {c.discountType === 'percentage'
                              ? `${c.discountValue}% OFF`
                              : `$${c.discountValue.toFixed(2)} OFF`}
                          </td>
                          <td className="py-3 px-4 text-slate-600">
                            ${c.minOrderValue.toFixed(2)}
                          </td>
                          <td className="py-3 px-4 text-slate-600">
                            {c.usageCount} / {c.usageLimit || 'Unlimited'}
                          </td>
                          <td className="py-3 px-4 text-slate-600">
                            {new Date(c.expiryDate).toLocaleDateString()}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <button
                              onClick={() => handleDeleteCoupon(c._id, c.code)}
                              className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* Product Create/Edit Modal */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            onClick={() => setIsProductModalOpen(false)}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs"
          />
          <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden max-h-[90vh] flex flex-col">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">
                {editingProductId ? 'Edit Product' : 'Add New Hardware Product'}
              </h3>
              <button
                onClick={() => setIsProductModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="p-6 overflow-y-auto space-y-4 flex-1">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">Product Title</label>
                  <input
                    type="text"
                    required
                    value={productForm.name}
                    onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Authoritative Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={productForm.price}
                    onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Compare-At Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={productForm.compareAtPrice}
                    onChange={(e) => setProductForm({ ...productForm, compareAtPrice: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Category</label>
                  <select
                    value={productForm.category}
                    onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none"
                  >
                    <option value="Audio">Audio</option>
                    <option value="Workstation">Workstation</option>
                    <option value="Wearables">Wearables</option>
                    <option value="Electronics">Electronics</option>
                    <option value="Accessories">Accessories</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Brand</label>
                  <input
                    type="text"
                    required
                    value={productForm.brand}
                    onChange={(e) => setProductForm({ ...productForm, brand: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Stock Quantity</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={productForm.stock}
                    onChange={(e) => setProductForm({ ...productForm, stock: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">SKU</label>
                  <input
                    type="text"
                    required
                    value={productForm.sku}
                    onChange={(e) => setProductForm({ ...productForm, sku: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">Primary Image URL</label>
                  <input
                    type="url"
                    required
                    value={productForm.imageUrl}
                    onChange={(e) => setProductForm({ ...productForm, imageUrl: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">Description</label>
                  <textarea
                    rows={3}
                    required
                    value={productForm.description}
                    onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none"
                  />
                </div>

                <div className="col-span-2 flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isFeatured"
                    checked={productForm.isFeatured}
                    onChange={(e) => setProductForm({ ...productForm, isFeatured: e.target.checked })}
                    className="rounded text-indigo-600"
                  />
                  <label htmlFor="isFeatured" className="text-xs font-semibold text-slate-700">
                    Feature on Storefront Homepage
                  </label>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl"
                >
                  Save Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Coupon Modal */}
      {isCouponModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            onClick={() => setIsCouponModalOpen(false)}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs"
          />
          <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">Create Discount Coupon</h3>
              <button
                onClick={() => setIsCouponModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCoupon} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Coupon Code</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. FLASH30"
                  value={couponForm.code}
                  onChange={(e) => setCouponForm({ ...couponForm, code: e.target.value.toUpperCase() })}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl uppercase font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Discount Type</label>
                  <select
                    value={couponForm.discountType}
                    onChange={(e) => setCouponForm({ ...couponForm, discountType: e.target.value as any })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed ($)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Discount Value</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="15"
                    value={couponForm.discountValue}
                    onChange={(e) => setCouponForm({ ...couponForm, discountValue: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Min Order ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="50"
                    value={couponForm.minOrderValue}
                    onChange={(e) => setCouponForm({ ...couponForm, minOrderValue: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Usage Limit</label>
                  <input
                    type="number"
                    placeholder="100"
                    value={couponForm.usageLimit}
                    onChange={(e) => setCouponForm({ ...couponForm, usageLimit: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Expiry Date</label>
                <input
                  type="date"
                  required
                  value={couponForm.expiryDate}
                  onChange={(e) => setCouponForm({ ...couponForm, expiryDate: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCouponModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl"
                >
                  Create Coupon
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
