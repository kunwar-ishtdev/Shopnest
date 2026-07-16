import React from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart } from '../../store/slices/cartSlice';
import { toggleWishlist, selectIsWishlisted } from '../../store/slices/wishlistSlice';
import { FiHeart, FiShoppingCart, FiStar, FiEye } from 'react-icons/fi';

export default function ProductCard({ product }) {
  const dispatch = useDispatch();
  const productId = product.id || product._id;
  const isWishlisted = useSelector(selectIsWishlisted(productId));

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    dispatch(addToCart(product));
  };

  const handleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    dispatch(toggleWishlist(product));
  };

  const discountPercent = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : null;

  return (
    <Link to={`/products/${productId}`} className="product-card block group animate-fade-in">
      {/* Image */}
      <div className="relative overflow-hidden bg-gray-50 aspect-square">
        <img
          src={product.images?.[0] || `https://picsum.photos/seed/${productId}/400/400`}
          alt={product.name}
          className="product-img w-full h-full object-cover transition-transform duration-500"
          loading="lazy"
        />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {discountPercent && (
            <span className="badge bg-brand-600 text-white text-xs font-semibold">-{discountPercent}%</span>
          )}
          {product.stock === 0 && (
            <span className="badge bg-gray-800 text-white text-xs">Out of Stock</span>
          )}
          {product.isNew && (
            <span className="badge bg-green-500 text-white text-xs">New</span>
          )}
        </div>

        {/* Actions overlay */}
        <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <button
            onClick={handleWishlist}
            className={`w-9 h-9 rounded-xl flex items-center justify-center shadow-md transition-all ${
              isWishlisted ? 'bg-brand-600 text-white' : 'bg-white text-dark-600 hover:bg-brand-600 hover:text-white'
            }`}
          >
            <FiHeart size={16} fill={isWishlisted ? 'currentColor' : 'none'} />
          </button>
          <Link
            to={`/products/${productId}`}
            onClick={(e) => e.stopPropagation()}
            className="w-9 h-9 bg-white rounded-xl flex items-center justify-center shadow-md hover:bg-brand-600 hover:text-white transition-all text-dark-600"
          >
            <FiEye size={16} />
          </Link>
        </div>

        {/* Quick Add button */}
        <div className="absolute bottom-0 left-0 right-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
          <button
            onClick={handleAddToCart}
            disabled={product.stock === 0}
            className="w-full bg-dark-900/90 hover:bg-brand-600 text-white py-3 text-sm font-medium flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FiShoppingCart size={16} />
            {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
          </button>
        </div>
      </div>

      {/* Info */}
      <div className="p-4">
        <p className="text-xs text-brand-600 font-medium mb-1 capitalize">{product.category}</p>
        <h3 className="text-sm font-semibold text-dark-800 line-clamp-2 mb-2 group-hover:text-brand-600 transition-colors">
          {product.name}
        </h3>

        {/* Rating */}
        <div className="flex items-center gap-1.5 mb-3">
          <div className="flex items-center">
            {[1, 2, 3, 4, 5].map((star) => (
              <FiStar
                key={star}
                size={12}
                className={star <= Math.round(product.rating || 0) ? 'star-filled' : 'star-empty'}
                fill={star <= Math.round(product.rating || 0) ? 'currentColor' : 'none'}
              />
            ))}
          </div>
          <span className="text-xs text-dark-400">({product.reviewCount || 0})</span>
        </div>

        {/* Price */}
        <div className="flex items-center justify-between">
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-bold text-dark-900">₹{product.price?.toLocaleString('en-IN')}</span>
            {product.originalPrice && (
              <span className="text-xs text-dark-400 line-through">₹{product.originalPrice?.toLocaleString('en-IN')}</span>
            )}
          </div>
          <button
            onClick={handleAddToCart}
            disabled={product.stock === 0}
            className="w-9 h-9 bg-brand-50 hover:bg-brand-600 text-brand-600 hover:text-white rounded-xl flex items-center justify-center transition-all disabled:opacity-40"
          >
            <FiShoppingCart size={16} />
          </button>
        </div>
      </div>
    </Link>
  );
}