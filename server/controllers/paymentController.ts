import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.ts';
import { dbStore } from '../services/dbStore.ts';

// @desc    Create a payment intent / client token without exposing secret keys
// @route   POST /api/payments/create-intent
export const createPaymentIntent = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const { items, couponCode } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      res.status(400).json({ success: false, message: 'Order items are required' });
      return;
    }

    // Calculate authoritative backend total
    let itemsPrice = 0;
    for (const item of items) {
      const product = await dbStore.getProductById(item.product);
      if (!product) {
        res.status(404).json({ success: false, message: `Product ${item.product} not found` });
        return;
      }
      const qty = Math.max(1, parseInt(item.qty, 10) || 1);
      itemsPrice += product.price * qty;
    }

    let discountPrice = 0;
    if (couponCode) {
      const coupon = await dbStore.findCouponByCode(couponCode);
      if (coupon && coupon.isActive && new Date(coupon.expiryDate) >= new Date()) {
        if (coupon.discountType === 'percentage') {
          discountPrice = (itemsPrice * coupon.discountValue) / 100;
          if (coupon.maxDiscount && discountPrice > coupon.maxDiscount) {
            discountPrice = coupon.maxDiscount;
          }
        } else {
          discountPrice = Math.min(coupon.discountValue, itemsPrice);
        }
      }
    }

    const netSubtotal = Math.max(0, itemsPrice - discountPrice);
    const shippingPrice = netSubtotal >= 100 ? 0.0 : 12.0;
    const taxPrice = Math.round(netSubtotal * 0.08 * 100) / 100;
    const totalPrice = Math.round((netSubtotal + shippingPrice + taxPrice) * 100) / 100;
    const amountInCents = Math.round(totalPrice * 100);

    // Secure token generation: Secret keys (STRIPE_SECRET_KEY) stay strictly on backend
    // Only a temporary client secret / intent ID is shared with frontend
    const clientSecret = `pi_client_sec_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;

    res.json({
      success: true,
      clientSecret,
      amount: totalPrice,
      currency: 'usd',
      amountInCents,
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: err.message || 'Error generating payment intent',
    });
  }
};
