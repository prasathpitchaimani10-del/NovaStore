import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Product, CartItem, CheckoutPreviewBreakdown } from '../types/index.ts';
import { api } from '../services/api.ts';
import { useNotification } from './NotificationContext.tsx';

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (product: Product, qty?: number) => void;
  updateQuantity: (productId: string, qty: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  appliedCoupon: string | null;
  applyCoupon: (code: string) => Promise<boolean>;
  removeCoupon: () => void;
  preview: CheckoutPreviewBreakdown | null;
  previewLoading: boolean;
  totalItemCount: number;
  subtotal: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { success, error, info } = useNotification();
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('novastore_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(() => {
    return localStorage.getItem('novastore_coupon') || null;
  });
  const [preview, setPreview] = useState<CheckoutPreviewBreakdown | null>(null);
  const [previewLoading, setPreviewLoading] = useState<boolean>(false);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('novastore_cart', JSON.stringify(cartItems));
    } catch (e) {
      console.error('Failed to save cart to localStorage', e);
    }
  }, [cartItems]);

  useEffect(() => {
    if (appliedCoupon) {
      localStorage.setItem('novastore_coupon', appliedCoupon);
    } else {
      localStorage.removeItem('novastore_coupon');
    }
  }, [appliedCoupon]);

  // Recalculate authoritative server preview whenever cart items or coupon changes
  const refreshPreview = useCallback(async () => {
    if (cartItems.length === 0) {
      setPreview(null);
      return;
    }

    setPreviewLoading(true);
    try {
      const payload = cartItems.map((item) => ({
        product: item.product._id,
        qty: item.qty,
      }));
      const res = await api.orders.preview(payload, appliedCoupon || undefined);
      setPreview(res.breakdown);

      if (res.breakdown.stockIssues && res.breakdown.stockIssues.length > 0) {
        info(res.breakdown.stockIssues[0]);
      }
    } catch (err: any) {
      console.warn('Checkout preview error:', err.message);
    } finally {
      setPreviewLoading(false);
    }
  }, [cartItems, appliedCoupon, info]);

  useEffect(() => {
    refreshPreview();
  }, [refreshPreview]);

  const addToCart = (product: Product, qty: number = 1): void => {
    if (product.stock <= 0) {
      error(`"${product.name}" is currently out of stock`);
      return;
    }

    setCartItems((prev) => {
      const existing = prev.find((item) => item.product._id === product._id);
      if (existing) {
        const newQty = existing.qty + qty;
        if (newQty > product.stock) {
          error(`Cannot add more than ${product.stock} items (stock limit)`);
          return prev;
        }
        success(`Updated quantity of "${product.name}" in cart`);
        return prev.map((item) =>
          item.product._id === product._id ? { ...item, qty: newQty } : item
        );
      } else {
        const finalQty = Math.min(qty, product.stock);
        success(`Added "${product.name}" to cart`);
        return [...prev, { product, qty: finalQty }];
      }
    });
    setIsCartOpen(true);
  };

  const updateQuantity = (productId: string, qty: number): void => {
    if (qty <= 0) {
      removeFromCart(productId);
      return;
    }

    setCartItems((prev) =>
      prev.map((item) => {
        if (item.product._id === productId) {
          if (qty > item.product.stock) {
            error(`Only ${item.product.stock} units available in stock`);
            return { ...item, qty: item.product.stock };
          }
          return { ...item, qty };
        }
        return item;
      })
    );
  };

  const removeFromCart = (productId: string): void => {
    setCartItems((prev) => prev.filter((item) => item.product._id !== productId));
    info('Item removed from cart');
  };

  const clearCart = (): void => {
    setCartItems([]);
    setAppliedCoupon(null);
    setPreview(null);
  };

  const applyCoupon = async (code: string): Promise<boolean> => {
    if (!code.trim()) {
      error('Please enter a coupon code');
      return false;
    }

    const currentSubtotal = cartItems.reduce(
      (acc, item) => acc + item.product.price * item.qty,
      0
    );

    try {
      const res = await api.coupons.validate(code.trim(), currentSubtotal);
      setAppliedCoupon(res.coupon.code);
      success(res.message);
      return true;
    } catch (err: any) {
      error(err.message || 'Failed to apply coupon');
      return false;
    }
  };

  const removeCoupon = (): void => {
    setAppliedCoupon(null);
    info('Coupon removed');
  };

  const totalItemCount = cartItems.reduce((acc, item) => acc + item.qty, 0);
  const subtotal = cartItems.reduce((acc, item) => acc + item.product.price * item.qty, 0);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        isCartOpen,
        setIsCartOpen,
        appliedCoupon,
        applyCoupon,
        removeCoupon,
        preview,
        previewLoading,
        totalItemCount,
        subtotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
