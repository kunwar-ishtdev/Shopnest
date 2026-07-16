// ProductDetailPage.js
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProductById } from '../store/slices/productSlice';
import { addToCart } from '../store/slices/cartSlice';
import { toggleWishlist, selectIsWishlisted } from '../store/slices/wishlistSlice';
import { FiHeart, FiShoppingCart, FiStar, FiTruck, FiShield, FiArrowLeft, FiMinus, FiPlus } from 'react-icons/fi';

export default function ProductDetailPage() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { currentProduct: product, loading } = useSelector((s) => s.products);
  const isWishlisted = useSelector(selectIsWishlisted(id));
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [tab, setTab] = useState('description');

  useEffect(() => {
    dispatch(fetchProductById(id));
    setSelectedImage(0);
    setQuantity(1);
  }, [dispatch, id]);

  if (loading) return (
    <div className="container-app py-10">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div className="space-y-4">
          <div className="skeleton aspect-square rounded-2xl" />
          <div className="grid grid-cols-4 gap-3">
            {[...Array(4)].map((_, i) => <div key={i} className="skeleton aspect-square rounded-xl" />)}
          </div>
        </div>
        <div className="space-y-4">
          {[...Array(6)].map((_, i) => <div key={i} className={`skeleton h-${[8,5,4,4,12,10][i]} rounded-xl`} />)}
        </div>
      </div>
    </div>
  );

  if (!product) return (
    <div className="container-app py-20 text-center">
      <p className="text-xl font-semibold text-dark-700 mb-2">Product not found</p>
      <Link to="/products" className="btn-primary">Browse Products</Link>
    </div>
  );

  const images = product.images?.length ? product.images : [
    `https://picsum.photos/seed/${id}/600/600`,
    `https://picsum.photos/seed/${id}a/600/600`,
    `https://picsum.photos/seed/${id}b/600/600`,
  ];

  return (
    <div className="container-app py-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-dark-400 mb-6">
        <Link to="/" className="hover:text-brand-600">Home</Link>
        <span>/</span>
        <Link to="/products" className="hover:text-brand-600">Products</Link>
        <span>/</span>
        <span className="text-dark-700 capitalize">{product.category}</span>
        <span>/</span>
        <span className="text-dark-900 line-clamp-1">{product.name}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Images */}
        <div>
          <div className="aspect-square rounded-2xl overflow-hidden bg-gray-50 mb-4">
            <img src={images[selectedImage]} alt={product.name} className="w-full h-full object-cover" />
          </div>
          <div className="grid grid-cols-4 gap-3">
            {images.map((img, i) => (
              <button
                key={i}
                onClick={() => setSelectedImage(i)}
                className={`aspect-square rounded-xl overflow-hidden border-2 transition-colors ${
                  selectedImage === i ? 'border-brand-600' : 'border-transparent hover:border-gray-300'
                }`}
              >
                <img src={img} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* Info */}
        <div>
          <span className="badge-brand capitalize mb-3 inline-block">{product.category}</span>
          <h1 className="text-3xl font-bold text-dark-900 mb-3" style={{ fontFamily: 'Clash Display' }}>
            {product.name}
          </h1>

          {/* Rating */}
          <div className="flex items-center gap-3 mb-5">
            <div className="flex items-center gap-1">
              {[1,2,3,4,5].map((s) => (
                <FiStar key={s} size={16} className={s <= Math.round(product.rating||0) ? 'star-filled' : 'star-empty'} fill={s <= Math.round(product.rating||0) ? 'currentColor' : 'none'} />
              ))}
              <span className="text-sm font-medium text-dark-700 ml-1">{product.rating?.toFixed(1)}</span>
            </div>
            <span className="text-sm text-dark-400">({product.reviewCount || 0} reviews)</span>
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-3 mb-6">
            <span className="text-4xl font-bold text-dark-900">₹{product.price?.toLocaleString('en-IN')}</span>
            {product.originalPrice && (
              <>
                <span className="text-lg text-dark-400 line-through">₹{product.originalPrice?.toLocaleString('en-IN')}</span>
                <span className="badge bg-green-50 text-green-700 text-sm">
                  {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% off
                </span>
              </>
            )}
          </div>

          {/* Stock */}
          <div className="mb-5">
            {product.stock > 0 ? (
              <p className="text-sm text-green-600 font-medium">✓ In Stock ({product.stock} available)</p>
            ) : (
              <p className="text-sm text-red-600 font-medium">✗ Out of Stock</p>
            )}
          </div>

          {/* Quantity */}
          <div className="mb-5">
            <label className="block text-sm font-medium text-dark-700 mb-2">Quantity</label>
            <div className="flex items-center gap-3">
              <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-11 h-11 flex items-center justify-center hover:bg-gray-50 transition-colors"
                >
                  <FiMinus size={16} />
                </button>
                <span className="w-12 text-center font-medium">{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  className="w-11 h-11 flex items-center justify-center hover:bg-gray-50 transition-colors"
                >
                  <FiPlus size={16} />
                </button>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 mb-8">
            <button
              onClick={() => dispatch(addToCart({ ...product, quantity }))}
              disabled={product.stock === 0}
              className="btn-primary flex-1 justify-center py-3.5 text-base"
            >
              <FiShoppingCart size={20} /> Add to Cart
            </button>
            <button
              onClick={() => dispatch(toggleWishlist(product))}
              className={`w-14 h-14 rounded-xl border-2 flex items-center justify-center transition-all ${
                isWishlisted
                  ? 'border-brand-600 bg-brand-50 text-brand-600'
                  : 'border-gray-200 hover:border-brand-600 hover:text-brand-600'
              }`}
            >
              <FiHeart size={20} fill={isWishlisted ? 'currentColor' : 'none'} />
            </button>
          </div>

          {/* Features */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-xl">
              <FiTruck size={18} className="text-brand-600" />
              <span className="text-sm text-dark-600">Free delivery above ₹499</span>
            </div>
            <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-xl">
              <FiShield size={18} className="text-green-600" />
              <span className="text-sm text-dark-600">100% authentic products</span>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200 mb-4">
            <div className="flex gap-1">
              {['description', 'specifications', 'reviews'].map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`px-4 py-2.5 text-sm font-medium capitalize border-b-2 -mb-px transition-colors ${
                    tab === t ? 'border-brand-600 text-brand-600' : 'border-transparent text-dark-500 hover:text-dark-900'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className="text-sm text-dark-600 leading-relaxed">
            {tab === 'description' && <p>{product.description || 'No description available.'}</p>}
            {tab === 'specifications' && (
              <div className="space-y-2">
                {Object.entries(product.specifications || { Brand: 'ShopNest', Category: product.category, SKU: product._id }).map(([k, v]) => (
                  <div key={k} className="flex gap-4 py-2 border-b border-gray-100">
                    <span className="font-medium text-dark-700 w-32 flex-shrink-0">{k}</span>
                    <span>{v}</span>
                  </div>
                ))}
              </div>
            )}
            {tab === 'reviews' && (
              <div className="text-center py-6 text-dark-400">
                <p>Reviews coming soon.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}