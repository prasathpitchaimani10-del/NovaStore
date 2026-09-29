import React from 'react';
import { ShoppingCart, Eye, AlertTriangle } from 'lucide-react';
import { Product } from '../types/index.ts';
import { useCart } from '../context/CartContext.tsx';
import { StarRating } from './StarRating.tsx';

interface ProductCardProps {
  product: Product;
  onSelect: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onSelect }) => {
  const { addToCart } = useCart();
  const isOutOfStock = product.stock <= 0;
  const isLowStock = product.stock > 0 && product.stock <= 5;

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isOutOfStock) {
      addToCart(product, 1);
    }
  };

  const discountPercent = product.compareAtPrice && product.compareAtPrice > product.price
    ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
    : 0;

  return (
    <div
      onClick={() => onSelect(product)}
      className="group relative flex flex-col bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs hover:shadow-xl hover:border-slate-300 transition-all duration-300 cursor-pointer"
    >
      {/* Image container */}
      <div className="relative aspect-square w-full bg-slate-100 overflow-hidden">
        <img
          src={product.images[0] || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80'}
          alt={product.name}
          className="h-full w-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 items-start">
          {discountPercent > 0 && (
            <span className="px-2.5 py-1 text-xs font-bold text-white bg-rose-600 rounded-full shadow-xs tracking-tight">
              -{discountPercent}% OFF
            </span>
          )}
          {product.isFeatured && (
            <span className="px-2.5 py-0.5 text-xs font-semibold text-slate-900 bg-amber-300 rounded-full shadow-xs">
              Featured
            </span>
          )}
        </div>

        {/* Stock indicator badge */}
        <div className="absolute top-3 right-3">
          {isOutOfStock ? (
            <span className="px-2.5 py-1 text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-200 rounded-full flex items-center gap-1 shadow-xs">
              <AlertTriangle className="w-3 h-3" /> Out of Stock
            </span>
          ) : isLowStock ? (
            <span className="px-2.5 py-1 text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 rounded-full shadow-xs">
              Only {product.stock} left
            </span>
          ) : (
            <span className="px-2.5 py-1 text-xs font-medium text-emerald-700 bg-emerald-50/90 border border-emerald-200 rounded-full shadow-xs">
              In Stock
            </span>
          )}
        </div>

        {/* Quick view hover action */}
        <div className="absolute inset-0 bg-slate-900/20 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
          <button
            type="button"
            className="flex items-center gap-2 px-4 py-2 bg-white/95 text-slate-800 text-sm font-semibold rounded-full shadow-md hover:bg-white transition"
          >
            <Eye className="w-4 h-4" /> Quick View
          </button>
        </div>
      </div>

      {/* Product Content */}
      <div className="flex flex-col flex-1 p-5">
        <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5 font-medium">
          <span className="uppercase tracking-wider text-slate-400">{product.category}</span>
          <span>{product.brand}</span>
        </div>

        <h3 className="text-base font-bold text-slate-900 line-clamp-1 group-hover:text-indigo-600 transition-colors">
          {product.name}
        </h3>

        <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed flex-1">
          {product.description}
        </p>

        {/* Rating */}
        <div className="mt-3 flex items-center">
          <StarRating rating={product.rating} showScore reviewCount={product.numReviews} size="sm" />
        </div>

        {/* Price & Action */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-lg font-extrabold text-slate-900">
                ${product.price.toFixed(2)}
              </span>
              {product.compareAtPrice && product.compareAtPrice > product.price && (
                <span className="text-xs text-slate-400 line-through">
                  ${product.compareAtPrice.toFixed(2)}
                </span>
              )}
            </div>
          </div>

          <button
            type="button"
            disabled={isOutOfStock}
            onClick={handleQuickAdd}
            aria-label={`Add ${product.name} to cart`}
            className={`flex items-center justify-center p-2.5 rounded-xl font-medium transition duration-150 ${
              isOutOfStock
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                : 'bg-slate-900 text-white hover:bg-indigo-600 active:scale-95 shadow-xs'
            }`}
          >
            <ShoppingCart className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
