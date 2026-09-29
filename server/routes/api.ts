import { Router } from 'express';
import {
  register,
  login,
  getMe,
  updateProfile,
} from '../controllers/authController.ts';
import {
  getProducts,
  getCategories,
  getProductById,
  getProductBySlug,
  adminCreateProduct,
  adminUpdateProduct,
  adminDeleteProduct,
} from '../controllers/productController.ts';
import {
  checkoutPreview,
  createOrder,
  getMyOrders,
  getOrderById,
  adminGetAllOrders,
  adminUpdateOrderStatus,
} from '../controllers/orderController.ts';
import {
  getProductReviews,
  createReview,
} from '../controllers/reviewController.ts';
import {
  validateCoupon,
  adminGetAllCoupons,
  adminCreateCoupon,
  adminDeleteCoupon,
} from '../controllers/couponController.ts';
import { createPaymentIntent } from '../controllers/paymentController.ts';
import { getCloudinarySignature, handleDirectUpload } from '../controllers/uploadController.ts';
import { protect, adminOnly } from '../middleware/auth.ts';

const router = Router();

// --- Auth Routes ---
router.post('/auth/register', register);
router.post('/auth/login', login);
router.get('/auth/me', protect, getMe);
router.put('/auth/profile', protect, updateProfile);

// --- Product Routes ---
router.get('/products', getProducts);
router.get('/products/categories', getCategories);
router.get('/products/slug/:slug', getProductBySlug);
router.get('/products/:id', getProductById);
router.post('/products', protect, adminOnly, adminCreateProduct);
router.put('/products/:id', protect, adminOnly, adminUpdateProduct);
router.delete('/products/:id', protect, adminOnly, adminDeleteProduct);

// --- Coupon Routes ---
router.post('/coupons/validate', validateCoupon);
router.get('/coupons', protect, adminOnly, adminGetAllCoupons);
router.post('/coupons', protect, adminOnly, adminCreateCoupon);
router.delete('/coupons/:id', protect, adminOnly, adminDeleteCoupon);

// --- Order Routes ---
router.post('/orders/preview', checkoutPreview);
router.post('/orders', protect, createOrder);
router.get('/orders/my-orders', protect, getMyOrders);
router.get('/orders/:id', protect, getOrderById);
router.get('/orders', protect, adminOnly, adminGetAllOrders);
router.patch('/orders/:id/status', protect, adminOnly, adminUpdateOrderStatus);

// --- Review Routes ---
router.get('/reviews/:productId', getProductReviews);
router.post('/reviews', protect, createReview);

// --- Payment Routes ---
router.post('/payments/create-intent', protect, createPaymentIntent);

// --- Upload Routes ---
router.post('/upload/sign', protect, adminOnly, getCloudinarySignature);
router.post('/upload', protect, adminOnly, handleDirectUpload);

export default router;
