import {
  User,
  Product,
  Order,
  Review,
  Coupon,
  CheckoutPreviewBreakdown,
  ShippingAddress,
} from '../types/index.ts';

const API_BASE = '/api';

const getAuthHeaders = (): HeadersInit => {
  const token = localStorage.getItem('novastore_token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

async function handleResponse<T>(res: Response): Promise<T> {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.message || `Request failed with status ${res.status}`);
  }
  return data as T;
}

export const api = {
  // Auth
  auth: {
    async register(data: { name: string; email: string; password: string; phone?: string }): Promise<{ token: string; user: User }> {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      return handleResponse(res);
    },

    async login(data: { email: string; password: string }): Promise<{ token: string; user: User }> {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      return handleResponse(res);
    },

    async getMe(): Promise<{ user: User }> {
      const res = await fetch(`${API_BASE}/auth/me`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });
      return handleResponse(res);
    },

    async updateProfile(data: {
      name?: string;
      phone?: string;
      address?: any;
      currentPassword?: string;
      newPassword?: string;
    }): Promise<{ message: string; user: User }> {
      const res = await fetch(`${API_BASE}/auth/profile`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      });
      return handleResponse(res);
    },
  },

  // Products
  products: {
    async getProducts(params?: {
      category?: string;
      brand?: string;
      search?: string;
      minPrice?: number;
      maxPrice?: number;
      inStock?: boolean;
      sort?: string;
      page?: number;
      limit?: number;
    }): Promise<{ products: Product[]; total: number; page: number; pages: number }> {
      const query = new URLSearchParams();
      if (params) {
        Object.entries(params).forEach(([key, val]) => {
          if (val !== undefined && val !== null && val !== '') {
            query.append(key, String(val));
          }
        });
      }
      const res = await fetch(`${API_BASE}/products?${query.toString()}`);
      return handleResponse(res);
    },

    async getCategories(): Promise<{ categories: { name: string; count: number }[] }> {
      const res = await fetch(`${API_BASE}/products/categories`);
      return handleResponse(res);
    },

    async getProductById(id: string): Promise<{ product: Product }> {
      const res = await fetch(`${API_BASE}/products/${id}`);
      return handleResponse(res);
    },

    async getProductBySlug(slug: string): Promise<{ product: Product }> {
      const res = await fetch(`${API_BASE}/products/slug/${slug}`);
      return handleResponse(res);
    },

    async createProduct(data: Partial<Product>): Promise<{ product: Product; message: string }> {
      const res = await fetch(`${API_BASE}/products`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      });
      return handleResponse(res);
    },

    async updateProduct(id: string, data: Partial<Product>): Promise<{ product: Product; message: string }> {
      const res = await fetch(`${API_BASE}/products/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      });
      return handleResponse(res);
    },

    async deleteProduct(id: string): Promise<{ message: string }> {
      const res = await fetch(`${API_BASE}/products/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      return handleResponse(res);
    },
  },

  // Coupons
  coupons: {
    async validate(code: string, cartTotal: number): Promise<{
      coupon: {
        code: string;
        discountType: 'percentage' | 'fixed';
        discountValue: number;
        calculatedDiscount: number;
        minOrderValue: number;
      };
      message: string;
    }> {
      const res = await fetch(`${API_BASE}/coupons/validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, cartTotal }),
      });
      return handleResponse(res);
    },

    async getAll(): Promise<{ coupons: Coupon[] }> {
      const res = await fetch(`${API_BASE}/coupons`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });
      return handleResponse(res);
    },

    async create(data: {
      code: string;
      discountType: 'percentage' | 'fixed';
      discountValue: number;
      minOrderValue?: number;
      maxDiscount?: number;
      expiryDate: string;
      usageLimit?: number;
    }): Promise<{ coupon: Coupon; message: string }> {
      const res = await fetch(`${API_BASE}/coupons`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      });
      return handleResponse(res);
    },

    async delete(id: string): Promise<{ message: string }> {
      const res = await fetch(`${API_BASE}/coupons/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      return handleResponse(res);
    },
  },

  // Orders
  orders: {
    async preview(items: { product: string; qty: number }[], couponCode?: string): Promise<{
      breakdown: CheckoutPreviewBreakdown;
    }> {
      const res = await fetch(`${API_BASE}/orders/preview`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items, couponCode }),
      });
      return handleResponse(res);
    },

    async create(data: {
      orderItems: { product: string; qty: number }[];
      shippingAddress: ShippingAddress;
      paymentMethod: 'credit_card' | 'paypal' | 'cod';
      couponCode?: string;
      idempotencyKey?: string;
    }): Promise<{ order: Order; message: string }> {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      const token = localStorage.getItem('novastore_token');
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      if (data.idempotencyKey) {
        headers['Idempotency-Key'] = data.idempotencyKey;
      }

      const res = await fetch(`${API_BASE}/orders`, {
        method: 'POST',
        headers,
        body: JSON.stringify(data),
      });
      return handleResponse(res);
    },

    async getMyOrders(): Promise<{ orders: Order[] }> {
      const res = await fetch(`${API_BASE}/orders/my-orders`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });
      return handleResponse(res);
    },

    async getById(id: string): Promise<{ order: Order }> {
      const res = await fetch(`${API_BASE}/orders/${id}`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });
      return handleResponse(res);
    },

    async getAllAdmin(): Promise<{ orders: Order[] }> {
      const res = await fetch(`${API_BASE}/orders`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });
      return handleResponse(res);
    },

    async updateStatus(id: string, status: Order['status']): Promise<{ order: Order; message: string }> {
      const res = await fetch(`${API_BASE}/orders/${id}/status`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({ status }),
      });
      return handleResponse(res);
    },
  },

  // Reviews
  reviews: {
    async getProductReviews(productId: string): Promise<{ reviews: Review[] }> {
      const res = await fetch(`${API_BASE}/reviews/${productId}`);
      return handleResponse(res);
    },

    async create(data: {
      productId: string;
      rating: number;
      title: string;
      comment: string;
    }): Promise<{ review: Review; message: string }> {
      const res = await fetch(`${API_BASE}/reviews`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      });
      return handleResponse(res);
    },
  },

  // Payments
  payments: {
    async createIntent(items: { product: string; qty: number }[], couponCode?: string): Promise<{
      clientSecret: string;
      amount: number;
      currency: string;
    }> {
      const res = await fetch(`${API_BASE}/payments/create-intent`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ items, couponCode }),
      });
      return handleResponse(res);
    },
  },
};
