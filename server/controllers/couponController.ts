import { Request, Response } from 'express';
import { dbStore } from '../services/dbStore.ts';
import { AuthenticatedRequest } from '../middleware/auth.ts';

// @desc    Validate a promo coupon code
// @route   POST /api/coupons/validate
export const validateCoupon = async (req: Request, res: Response): Promise<void> => {
  try {
    const { code, cartTotal } = req.body;

    if (!code) {
      res.status(400).json({ success: false, message: 'Please provide a coupon code' });
      return;
    }

    const coupon = await dbStore.findCouponByCode(code);
    if (!coupon || !coupon.isActive) {
      res.status(404).json({ success: false, message: 'Invalid or inactive coupon code' });
      return;
    }

    if (new Date(coupon.expiryDate) < new Date()) {
      res.status(400).json({ success: false, message: 'This coupon code has expired' });
      return;
    }

    if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
      res.status(400).json({ success: false, message: 'Coupon usage limit has been reached' });
      return;
    }

    const subtotal = Math.max(0, parseFloat(cartTotal) || 0);
    if (subtotal < coupon.minOrderValue) {
      res.status(400).json({
        success: false,
        message: `Order must be at least $${coupon.minOrderValue.toFixed(2)} to use coupon ${coupon.code}`,
      });
      return;
    }

    let calculatedDiscount = 0;
    if (coupon.discountType === 'percentage') {
      calculatedDiscount = (subtotal * coupon.discountValue) / 100;
      if (coupon.maxDiscount && calculatedDiscount > coupon.maxDiscount) {
        calculatedDiscount = coupon.maxDiscount;
      }
    } else {
      calculatedDiscount = Math.min(coupon.discountValue, subtotal);
    }

    calculatedDiscount = Math.round((calculatedDiscount + Number.EPSILON) * 100) / 100;

    res.json({
      success: true,
      message: `Coupon "${coupon.code}" applied successfully!`,
      coupon: {
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        calculatedDiscount,
        minOrderValue: coupon.minOrderValue,
      },
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: err.message || 'Error validating coupon',
    });
  }
};

// @desc    Get all coupons (Admin Only)
// @route   GET /api/coupons
export const adminGetAllCoupons = async (_req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const coupons = await dbStore.getAllCoupons();
    res.json({
      success: true,
      coupons,
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: err.message || 'Error fetching coupons',
    });
  }
};

// @desc    Create a coupon (Admin Only)
// @route   POST /api/coupons
export const adminCreateCoupon = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { code, discountType, discountValue, minOrderValue, maxDiscount, expiryDate, usageLimit } = req.body;

    if (!code || !discountType || discountValue === undefined || !expiryDate) {
      res.status(400).json({
        success: false,
        message: 'Code, discountType, discountValue, and expiryDate are required',
      });
      return;
    }

    const existing = await dbStore.findCouponByCode(code);
    if (existing) {
      res.status(409).json({
        success: false,
        message: 'A coupon with this code already exists',
      });
      return;
    }

    const newCoupon = await dbStore.createCoupon({
      code: code.trim(),
      discountType: discountType === 'fixed' ? 'fixed' : 'percentage',
      discountValue: Number(discountValue),
      minOrderValue: minOrderValue ? Number(minOrderValue) : 0,
      maxDiscount: maxDiscount ? Number(maxDiscount) : undefined,
      expiryDate: new Date(expiryDate),
      usageLimit: usageLimit ? Number(usageLimit) : undefined,
      isActive: true,
    });

    res.status(201).json({
      success: true,
      message: 'Coupon created successfully',
      coupon: newCoupon,
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: err.message || 'Error creating coupon',
    });
  }
};

// @desc    Delete coupon (Admin Only)
// @route   DELETE /api/coupons/:id
export const adminDeleteCoupon = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const success = await dbStore.deleteCoupon(req.params.id);
    if (!success) {
      res.status(404).json({ success: false, message: 'Coupon not found' });
      return;
    }
    res.json({ success: true, message: 'Coupon deleted successfully' });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: err.message || 'Error deleting coupon',
    });
  }
};
