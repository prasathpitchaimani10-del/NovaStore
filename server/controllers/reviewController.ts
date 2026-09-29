import { Request, Response } from 'express';
import { dbStore } from '../services/dbStore.ts';
import { AuthenticatedRequest } from '../middleware/auth.ts';

// @desc    Get reviews for a product
// @route   GET /api/reviews/:productId
export const getProductReviews = async (req: Request, res: Response): Promise<void> => {
  try {
    const reviews = await dbStore.getProductReviews(req.params.productId);
    res.json({
      success: true,
      reviews,
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: err.message || 'Error fetching reviews',
    });
  }
};

// @desc    Create product review (Strict Verified Purchase Only)
// @route   POST /api/reviews
export const createReview = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const { productId, rating, title, comment } = req.body;

    if (!productId || rating === undefined || !title || !comment) {
      res.status(400).json({
        success: false,
        message: 'Product ID, rating (1-5), title, and review comment are required',
      });
      return;
    }

    const numRating = Number(rating);
    if (isNaN(numRating) || numRating < 1 || numRating > 5) {
      res.status(400).json({
        success: false,
        message: 'Rating must be an integer between 1 and 5',
      });
      return;
    }

    const product = await dbStore.getProductById(productId);
    if (!product) {
      res.status(404).json({
        success: false,
        message: 'Product not found',
      });
      return;
    }

    // Check if user already reviewed this product
    const existingReview = await dbStore.findReviewByUserAndProduct(req.user._id, productId);
    if (existingReview) {
      res.status(400).json({
        success: false,
        message: 'You have already submitted a review for this product',
      });
      return;
    }

    // STRICT VERIFICATION: Rule 18: Verified-purchase reviews cannot be forged
    // The backend verifies the user has a completed order containing this product
    const hasPurchased = await dbStore.checkUserHasPurchasedProduct(req.user._id, productId);
    if (!hasPurchased) {
      res.status(403).json({
        success: false,
        message: 'Verified purchase required: You can only review products you have legitimately purchased and received.',
      });
      return;
    }

    const newReview = await dbStore.createReview({
      user: req.user._id,
      userName: req.user.name,
      userEmail: req.user.email,
      product: productId,
      rating: Math.round(numRating),
      title: title.trim(),
      comment: comment.trim(),
      verifiedPurchase: true,
    });

    res.status(201).json({
      success: true,
      message: 'Verified review submitted successfully',
      review: newReview,
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: err.message || 'Error creating review',
    });
  }
};
