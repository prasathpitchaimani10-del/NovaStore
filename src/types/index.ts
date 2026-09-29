export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'customer' | 'admin';
  phone?: string;
  address?: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
}

export interface Product {
  _id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  compareAtPrice?: number;
  category: string;
  brand: string;
  stock: number;
  sku: string;
  images: string[];
  rating: number;
  numReviews: number;
  isFeatured: boolean;
  tags: string[];
  createdAt: string;
}

export interface CartItem {
  product: Product;
  qty: number;
}

export interface OrderItem {
  product: string;
  name: string;
  qty: number;
  price: number;
  image: string;
}

export interface ShippingAddress {
  fullName: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone: string;
}

export interface Order {
  _id: string;
  user: string;
  orderItems: OrderItem[];
  shippingAddress: ShippingAddress;
  paymentMethod: 'credit_card' | 'paypal' | 'cod';
  paymentResult?: {
    id?: string;
    status?: string;
    last4?: string;
  };
  itemsPrice: number;
  taxPrice: number;
  shippingPrice: number;
  discountPrice: number;
  totalPrice: number;
  couponCode?: string;
  isPaid: boolean;
  paidAt?: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  createdAt: string;
}

export interface Review {
  _id: string;
  user: string;
  userName: string;
  userEmail?: string;
  product: string;
  rating: number;
  title: string;
  comment: string;
  verifiedPurchase: boolean;
  createdAt: string;
}

export interface Coupon {
  _id: string;
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minOrderValue: number;
  maxDiscount?: number;
  expiryDate: string;
  usageLimit?: number;
  usageCount: number;
  isActive: boolean;
}

export interface CheckoutPreviewBreakdown {
  items: Array<{
    product: string;
    name: string;
    price: number;
    qty: number;
    image: string;
    subtotal: number;
    stockAvailable: number;
  }>;
  itemsPrice: number;
  discountPrice: number;
  shippingPrice: number;
  taxPrice: number;
  totalPrice: number;
  coupon: {
    valid: boolean;
    code?: string;
    discountValue?: number;
    discountType?: string;
    discountAmount?: number;
    message?: string;
  } | null;
  stockIssues: string[];
  isStockAvailable: boolean;
}
