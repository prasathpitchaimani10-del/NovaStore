import { Response } from 'express';
import { dbStore, OrderItemDoc } from '../services/dbStore.ts';
import { AuthenticatedRequest } from '../middleware/auth.ts';

// Helper for currency rounding
const round2 = (num: number): number => {
  return Math.round((num + Number.EPSILON) * 100) / 100;
};

// @desc    Preview authoritative price, taxes, shipping and discounts
// @route   POST /api/orders/preview
export const checkoutPreview = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { items, couponCode } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      res.status(400).json({
        success: false,
        message: 'No items provided for checkout preview',
      });
      return;
    }

    let itemsPrice = 0;
    const validatedItems: any[] = [];
    const stockIssues: string[] = [];

    for (const item of items) {
      const product = await dbStore.getProductById(item.product);
      if (!product) {
        res.status(404).json({
          success: false,
          message: `Product with ID "${item.product}" does not exist`,
        });
        return;
      }

      const qty = Math.max(1, parseInt(item.qty, 10) || 1);

      if (product.stock < qty) {
        stockIssues.push(`"${product.name}" only has ${product.stock} items left in stock.`);
      }

      // Authoritative pricing from DB - NEVER trust frontend price
      const itemSubtotal = round2(product.price * qty);
      itemsPrice = round2(itemsPrice + itemSubtotal);

      validatedItems.push({
        product: product._id,
        name: product.name,
        price: product.price,
        qty,
        image: product.images[0] || '',
        subtotal: itemSubtotal,
        stockAvailable: product.stock,
      });
    }

    // Coupon calculation
    let discountPrice = 0;
    let couponDetails: any = null;

    if (couponCode) {
      const coupon = await dbStore.findCouponByCode(couponCode);
      if (!coupon || !coupon.isActive) {
        couponDetails = { valid: false, message: 'Invalid or inactive coupon code' };
      } else if (new Date(coupon.expiryDate) < new Date()) {
        couponDetails = { valid: false, message: 'This coupon has expired' };
      } else if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
        couponDetails = { valid: false, message: 'This coupon usage limit has been reached' };
      } else if (itemsPrice < coupon.minOrderValue) {
        couponDetails = {
          valid: false,
          message: `Minimum order amount of $${coupon.minOrderValue.toFixed(2)} required for this coupon`,
        };
      } else {
        if (coupon.discountType === 'percentage') {
          let calcDiscount = round2((itemsPrice * coupon.discountValue) / 100);
          if (coupon.maxDiscount && calcDiscount > coupon.maxDiscount) {
            calcDiscount = coupon.maxDiscount;
          }
          discountPrice = calcDiscount;
        } else {
          discountPrice = Math.min(coupon.discountValue, itemsPrice);
        }

        couponDetails = {
          valid: true,
          code: coupon.code,
          discountValue: coupon.discountValue,
          discountType: coupon.discountType,
          discountAmount: discountPrice,
        };
      }
    }

    const netSubtotal = Math.max(0, round2(itemsPrice - discountPrice));
    // Free shipping threshold at $100
    const shippingPrice = netSubtotal >= 100 || netSubtotal === 0 ? 0.0 : 12.0;
    // Standard 8% sales tax on post-discount subtotal
    const taxPrice = round2(netSubtotal * 0.08);
    const totalPrice = round2(netSubtotal + shippingPrice + taxPrice);

    res.json({
      success: true,
      breakdown: {
        items: validatedItems,
        itemsPrice,
        discountPrice,
        shippingPrice,
        taxPrice,
        totalPrice,
        coupon: couponDetails,
        stockIssues,
        isStockAvailable: stockIssues.length === 0,
      },
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: err.message || 'Error generating checkout preview',
    });
  }
};

// @desc    Create new order with authoritative backend calculation & stock reservation
// @route   POST /api/orders
export const createOrder = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const {
      orderItems,
      shippingAddress,
      paymentMethod,
      couponCode,
      idempotencyKey,
    } = req.body;

    const finalIdempotencyKey =
      (req.headers['idempotency-key'] as string) || idempotencyKey;

    // Idempotency check: prevent duplicate order creation
    if (finalIdempotencyKey) {
      const existingOrder = await dbStore.findOrderByIdempotencyKey(finalIdempotencyKey);
      if (existingOrder) {
        res.status(200).json({
          success: true,
          message: 'Order already processed (idempotent)',
          order: existingOrder,
        });
        return;
      }
    }

    if (!Array.isArray(orderItems) || orderItems.length === 0) {
      res.status(400).json({
        success: false,
        message: 'No order items specified',
      });
      return;
    }

    if (!shippingAddress || !shippingAddress.fullName || !shippingAddress.street || !shippingAddress.city || !shippingAddress.postalCode) {
      res.status(400).json({
        success: false,
        message: 'Complete shipping address is required (Full Name, Street, City, Postal Code)',
      });
      return;
    }

    if (!['credit_card', 'paypal', 'cod'].includes(paymentMethod)) {
      res.status(400).json({
        success: false,
        message: 'Invalid payment method specified',
      });
      return;
    }

    // Step 1: Validate stock & fetch authoritative prices for all items
    let itemsPrice = 0;
    const validatedItems: OrderItemDoc[] = [];

    for (const item of orderItems) {
      const product = await dbStore.getProductById(item.product);
      if (!product) {
        res.status(404).json({
          success: false,
          message: `Product with ID ${item.product} not found`,
        });
        return;
      }

      const qty = parseInt(item.qty, 10);
      if (isNaN(qty) || qty <= 0) {
        res.status(400).json({
          success: false,
          message: `Invalid quantity specified for ${product.name}`,
        });
        return;
      }

      if (product.stock < qty) {
        res.status(400).json({
          success: false,
          message: `Insufficient stock for "${product.name}". Only ${product.stock} available.`,
        });
        return;
      }

      // Backend authoritative price is used - cart manipulation impossible
      itemsPrice = round2(itemsPrice + product.price * qty);

      validatedItems.push({
        product: product._id,
        name: product.name,
        price: product.price,
        qty,
        image: product.images[0] || '',
      });
    }

    // Step 2: Validate coupon server-side
    let discountPrice = 0;
    if (couponCode) {
      const coupon = await dbStore.findCouponByCode(couponCode);
      if (coupon && coupon.isActive && new Date(coupon.expiryDate) >= new Date()) {
        if (!coupon.usageLimit || coupon.usageCount < coupon.usageLimit) {
          if (itemsPrice >= coupon.minOrderValue) {
            if (coupon.discountType === 'percentage') {
              let calc = round2((itemsPrice * coupon.discountValue) / 100);
              if (coupon.maxDiscount && calc > coupon.maxDiscount) {
                calc = coupon.maxDiscount;
              }
              discountPrice = calc;
            } else {
              discountPrice = Math.min(coupon.discountValue, itemsPrice);
            }
            await dbStore.incrementCouponUsage(coupon.code);
          }
        }
      }
    }

    const netSubtotal = Math.max(0, round2(itemsPrice - discountPrice));
    const shippingPrice = netSubtotal >= 100 ? 0.0 : 12.0;
    const taxPrice = round2(netSubtotal * 0.08);
    const totalPrice = round2(netSubtotal + shippingPrice + taxPrice);

    // Step 3: Atomically decrement stock
    for (const item of validatedItems) {
      await dbStore.adjustProductStock(item.product, -item.qty);
    }

    // Step 4: Create order
    // Raw card details are NEVER stored. Only payment method and mock payment intent token
    const isPaid = paymentMethod !== 'cod';
    const newOrder = await dbStore.createOrder({
      user: req.user._id,
      orderItems: validatedItems,
      shippingAddress: {
        fullName: shippingAddress.fullName.trim(),
        street: shippingAddress.street.trim(),
        city: shippingAddress.city.trim(),
        state: shippingAddress.state?.trim() || '',
        postalCode: shippingAddress.postalCode.trim(),
        country: shippingAddress.country?.trim() || 'US',
        phone: shippingAddress.phone?.trim() || '',
      },
      paymentMethod,
      paymentResult: isPaid
        ? {
            id: `pi_txn_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
            status: 'succeeded',
            update_time: new Date().toISOString(),
            last4: '4242',
          }
        : undefined,
      itemsPrice,
      taxPrice,
      shippingPrice,
      discountPrice,
      totalPrice,
      couponCode: discountPrice > 0 ? couponCode.toUpperCase() : undefined,
      isPaid,
      paidAt: isPaid ? new Date() : undefined,
      status: 'processing',
      idempotencyKey: finalIdempotencyKey,
    });

    res.status(201).json({
      success: true,
      message: 'Order placed successfully',
      order: newOrder,
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: err.message || 'Error processing order',
    });
  }
};

// @desc    Get logged in user orders
// @route   GET /api/orders/my-orders
export const getMyOrders = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const orders = await dbStore.findOrdersByUser(req.user._id);

    res.json({
      success: true,
      orders,
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: err.message || 'Error fetching user orders',
    });
  }
};

// @desc    Get order by ID (Customer can only access own order; Admin can access any)
// @route   GET /api/orders/:id
export const getOrderById = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const order = await dbStore.findOrderById(req.params.id);
    if (!order) {
      res.status(404).json({
        success: false,
        message: 'Order not found',
      });
      return;
    }

    // Strict Authorization: Customers cannot view orders belonging to other customers
    if (req.user.role !== 'admin' && order.user.toString() !== req.user._id.toString()) {
      res.status(403).json({
        success: false,
        message: 'Access denied: You are not authorized to view this private order',
      });
      return;
    }

    res.json({
      success: true,
      order,
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: err.message || 'Error fetching order details',
    });
  }
};

// @desc    Get all orders (Admin Only)
// @route   GET /api/orders
export const adminGetAllOrders = async (_req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const orders = await dbStore.getAllOrders();
    res.json({
      success: true,
      orders,
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: err.message || 'Error fetching admin orders',
    });
  }
};

// @desc    Update order status (Admin Only)
// @route   PATCH /api/orders/:id/status
export const adminUpdateOrderStatus = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { status } = req.body;
    const allowed = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

    if (!allowed.includes(status)) {
      res.status(400).json({
        success: false,
        message: `Status must be one of: ${allowed.join(', ')}`,
      });
      return;
    }

    const order = await dbStore.updateOrderStatus(req.params.id, status);
    if (!order) {
      res.status(404).json({
        success: false,
        message: 'Order not found',
      });
      return;
    }

    res.json({
      success: true,
      message: `Order status updated to ${status}`,
      order,
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: err.message || 'Error updating order status',
    });
  }
};
