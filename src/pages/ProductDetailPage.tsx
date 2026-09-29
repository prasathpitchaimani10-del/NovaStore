import React, { useState, useEffect } from 'react';
import {
  ChevronLeft,
  ShoppingBag,
  ShieldCheck,
  Truck,
  CheckCircle2,
  AlertTriangle,
  Lock,
  Loader2,
  Star,
} from 'lucide-react';
import { Product, Review } from '../types/index.ts';
import { api } from '../services/api.ts';
import { useCart } from '../context/CartContext.tsx';
import { useAuth } from '../context/AuthContext.tsx';
import { useNotification } from '../context/NotificationContext.tsx';
import { StarRating } from '../components/StarRating.tsx';

interface ProductDetailPageProps {
  productId: string;
  onBack: () => void;
  onOpenAuth: () => void;
}

export const ProductDetailPage: React.FC<ProductDetailPageProps> = ({
  productId,
  onBack,
  onOpenAuth,
}) => {
  const { addToCart } = useCart();
  const { user, isAuthenticated } = useAuth();
  const { success, error } = useNotification();

  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [quantity, setQuantity] = useState(1);

  // Review form states
  const [newRating, setNewRating] = useState(5);
  const [newTitle, setNewTitle] = useState('');
  const [newComment, setNewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const prodRes = await api.products.getProductById(productId);
        setProduct(prodRes.product);
        const reviewRes = await api.reviews.getProductReviews(productId);
        setReviews(reviewRes.reviews);
      } catch (err) {
        console.error('Failed to load product detail', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [productId]);

  const handleAddToCart = () => {
    if (product && product.stock > 0) {
      addToCart(product, quantity);
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      onOpenAuth();
      return;
    }

    if (!newTitle.trim() || !newComment.trim()) {
      error('Please provide both a title and review comment');
      return;
    }

    setSubmittingReview(true);
    try {
      const res = await api.reviews.create({
        productId,
        rating: newRating,
        title: newTitle.trim(),
        comment: newComment.trim(),
      });

      success(res.message || 'Verified review posted successfully!');
      setReviews([res.review, ...reviews]);
      setNewTitle('');
      setNewComment('');
      setNewRating(5);

      // Refresh product for updated rating and count
      const updatedProduct = await api.products.getProductById(productId);
      setProduct(updatedProduct.product);
    } catch (err: any) {
      error(err.message || 'Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="text-center py-20 bg-white rounded-3xl border border-slate-200 p-8">
        <h2 className="text-xl font-bold text-slate-900">Product Not Found</h2>
        <p className="text-xs text-slate-500 mt-2">The product you requested does not exist or has been removed.</p>
        <button
          onClick={onBack}
          className="mt-6 px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-xl"
        >
          Return to Catalog
        </button>
      </div>
    );
  }

  const isOutOfStock = product.stock <= 0;
  const discountPercent =
    product.compareAtPrice && product.compareAtPrice > product.price
      ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
      : 0;

  return (
    <div className="space-y-12">
      {/* Back button & Breadcrumbs */}
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 px-3.5 py-2 rounded-xl shadow-xs transition"
      >
        <ChevronLeft className="w-4 h-4" />
        <span>Back to Products</span>
      </button>

      {/* Main Product Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 bg-white p-6 sm:p-10 rounded-3xl border border-slate-200/80 shadow-xs">
        {/* Images Gallery */}
        <div className="space-y-4">
          <div className="aspect-square w-full rounded-2xl bg-slate-100 overflow-hidden border border-slate-200 relative">
            <img
              src={product.images[activeImage] || product.images[0]}
              alt={product.name}
              className="w-full h-full object-cover object-center"
            />
            {discountPercent > 0 && (
              <span className="absolute top-4 left-4 px-3 py-1 bg-rose-600 text-white text-xs font-extrabold rounded-full shadow-md">
                -{discountPercent}% OFF
              </span>
            )}
          </div>

          {/* Thumbnails */}
          {product.images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImage(idx)}
                  className={`w-20 h-20 rounded-xl overflow-hidden border-2 shrink-0 transition ${
                    activeImage === idx ? 'border-indigo-600 shadow-md' : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Information & Purchase Controls */}
        <div className="flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs text-slate-500 font-semibold">
              <span className="uppercase tracking-widest text-indigo-600 font-bold">{product.category}</span>
              <span>SKU: {product.sku}</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-950">
              {product.name}
            </h1>

            {/* Rating */}
            <div className="flex items-center gap-3">
              <StarRating rating={product.rating} showScore reviewCount={product.numReviews} size="md" />
              <span className="text-xs text-slate-400">&bull;</span>
              <span className="text-xs text-slate-600 font-medium">Brand: <strong>{product.brand}</strong></span>
            </div>

            {/* Authoritative Pricing */}
            <div className="pt-2">
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-black text-slate-950">
                  ${product.price.toFixed(2)}
                </span>
                {product.compareAtPrice && product.compareAtPrice > product.price && (
                  <span className="text-base text-slate-400 line-through">
                    ${product.compareAtPrice.toFixed(2)}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Taxes and free shipping calculated during backend checkout verification.
              </p>
            </div>

            {/* Stock status indicator */}
            <div className="pt-2">
              {isOutOfStock ? (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-50 text-rose-800 border border-rose-200 text-xs font-semibold">
                  <AlertTriangle className="w-4 h-4 text-rose-600" />
                  <span>Out of Stock. Orders currently paused until warehouse replenishment.</span>
                </div>
              ) : product.stock <= 5 ? (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-amber-50 text-amber-800 border border-amber-200 text-xs font-semibold">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  <span>Low Inventory: Only {product.stock} items remaining in stock.</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>In Stock &bull; Ships within 24 hours ({product.stock} units available).</span>
                </div>
              )}
            </div>

            {/* Description */}
            <div className="pt-2">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">Description</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                {product.description}
              </p>
            </div>

            {/* Tags */}
            {product.tags && product.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-2">
                {product.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2.5 py-1 bg-slate-100 text-slate-600 rounded-md text-[11px] font-mono"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Action Row */}
          <div className="pt-6 border-t border-slate-100 space-y-4">
            <div className="flex items-center gap-4">
              {/* Quantity selector */}
              <div className="flex items-center border border-slate-200 rounded-xl overflow-hidden bg-slate-50">
                <button
                  type="button"
                  disabled={quantity <= 1 || isOutOfStock}
                  onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                  className="px-3.5 py-2.5 text-slate-600 hover:bg-slate-200 transition disabled:opacity-40"
                >
                  -
                </button>
                <span className="px-4 text-xs font-extrabold text-slate-900">
                  {quantity}
                </span>
                <button
                  type="button"
                  disabled={quantity >= product.stock || isOutOfStock}
                  onClick={() => setQuantity((prev) => Math.min(product.stock, prev + 1))}
                  className="px-3.5 py-2.5 text-slate-600 hover:bg-slate-200 transition disabled:opacity-40"
                >
                  +
                </button>
              </div>

              {/* Add to cart */}
              <button
                type="button"
                disabled={isOutOfStock}
                onClick={handleAddToCart}
                className="flex-1 py-3 px-6 bg-slate-950 hover:bg-indigo-600 active:scale-98 text-white text-xs sm:text-sm font-bold rounded-xl shadow-md flex items-center justify-center gap-2 transition disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>{isOutOfStock ? 'Sold Out' : 'Add to Cart'}</span>
              </button>
            </div>

            {/* Trust features */}
            <div className="grid grid-cols-2 gap-3 pt-3 text-[11px] text-slate-500 font-medium">
              <div className="flex items-center gap-1.5">
                <Truck className="w-3.5 h-3.5 text-indigo-600" />
                <span>Free delivery on orders $100+</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-emerald-600" />
                <span>Tokenized checkout security</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Verified Reviews Section */}
      <section className="bg-white p-6 sm:p-10 rounded-3xl border border-slate-200/80 shadow-xs space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-200 gap-4">
          <div>
            <h2 className="text-xl font-extrabold text-slate-950 flex items-center gap-2">
              <span>Customer Reviews</span>
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Guaranteed verified purchases. Only customers with a delivered order can review.
            </p>
          </div>

          <div className="flex items-center gap-4 bg-slate-50 px-5 py-3 rounded-2xl border border-slate-200">
            <div className="text-3xl font-black text-slate-900">{product.rating.toFixed(1)}</div>
            <div>
              <StarRating rating={product.rating} size="sm" />
              <div className="text-[11px] text-slate-500 mt-0.5">Based on {reviews.length} verified review{reviews.length === 1 ? '' : 's'}</div>
            </div>
          </div>
        </div>

        {/* Review Submission Form */}
        <div className="bg-slate-50/80 p-6 rounded-2xl border border-slate-200">
          <h3 className="text-sm font-bold text-slate-900 mb-1">
            Write a Verified Customer Review
          </h3>
          <p className="text-xs text-slate-500 mb-4">
            Rule 18 Enforced: Our backend validates that your account has a confirmed delivered order for this product.
          </p>

          {!isAuthenticated ? (
            <div className="text-center py-6 bg-white rounded-xl border border-slate-200/60 p-4">
              <p className="text-xs text-slate-600 mb-3">Please sign in to author a verified review for this hardware.</p>
              <button
                type="button"
                onClick={onOpenAuth}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition"
              >
                Sign In to Review
              </button>
            </div>
          ) : (
            <form onSubmit={handleReviewSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Overall Score (1 to 5 Stars)
                </label>
                <div className="flex items-center gap-2">
                  <StarRating
                    rating={newRating}
                    interactive
                    size="lg"
                    onRatingChange={setNewRating}
                  />
                  <span className="text-xs font-bold text-slate-700 ml-2">{newRating} / 5</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Review Headline
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Excellent build quality, zero issues"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Detailed Experience &amp; Feedback
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="Share details about durability, performance, ergonomics, and daily usage..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <button
                type="submit"
                disabled={submittingReview}
                className="px-5 py-2.5 bg-slate-900 hover:bg-indigo-600 text-white text-xs font-bold rounded-xl flex items-center gap-2 transition disabled:opacity-50"
              >
                {submittingReview ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ShieldCheck className="w-3.5 h-3.5" />}
                <span>Submit Verified Review</span>
              </button>
            </form>
          )}
        </div>

        {/* Existing Reviews List */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-slate-900">
            Reviews ({reviews.length})
          </h3>

          {reviews.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500 bg-slate-50 rounded-2xl">
              No reviews yet for this product. Be the first verified customer to leave feedback!
            </div>
          ) : (
            reviews.map((rev) => (
              <div key={rev._id} className="p-5 rounded-2xl bg-white border border-slate-200/80 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-slate-900">{rev.userName}</span>
                    {rev.verifiedPurchase && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-bold">
                        <CheckCircle2 className="w-3 h-3" /> Verified Purchase
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-slate-400">
                    {new Date(rev.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <div className="flex items-center">
                  <StarRating rating={rev.rating} size="sm" />
                </div>

                <h4 className="text-xs font-bold text-slate-900 mt-1">{rev.title}</h4>
                <p className="text-xs text-slate-600 leading-relaxed">{rev.comment}</p>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
};
