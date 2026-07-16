import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProducts } from '../store/slices/productSlice';
import ProductCard from '../components/product/ProductCard';
import { FiArrowRight, FiShield, FiTruck, FiRefreshCw, FiHeadphones, FiSearch } from 'react-icons/fi';

const categories = [
  { name: 'Electronics', emoji: '💻', color: 'bg-blue-50 text-blue-700', slug: 'electronics' },
  { name: 'Clothing', emoji: '👗', color: 'bg-purple-50 text-purple-700', slug: 'clothing' },
  { name: 'Home & Living', emoji: '🏠', color: 'bg-amber-50 text-amber-700', slug: 'home' },
  { name: 'Sports', emoji: '⚽', color: 'bg-green-50 text-green-700', slug: 'sports' },
  { name: 'Books', emoji: '📚', color: 'bg-rose-50 text-rose-700', slug: 'books' },
  { name: 'Beauty', emoji: '✨', color: 'bg-pink-50 text-pink-700', slug: 'beauty' },
];

const features = [
  { icon: FiTruck, title: 'Free Delivery', desc: 'On orders above ₹499', color: 'text-blue-600 bg-blue-50' },
  { icon: FiShield, title: 'Secure Payment', desc: '100% protected payments', color: 'text-green-600 bg-green-50' },
  { icon: FiRefreshCw, title: 'Easy Returns', desc: '30-day return policy', color: 'text-amber-600 bg-amber-50' },
  { icon: FiHeadphones, title: '24/7 Support', desc: 'Dedicated support team', color: 'text-purple-600 bg-purple-50' },
];

export default function HomePage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items: products, loading } = useSelector((s) => s.products);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    dispatch(fetchProducts({ limit: 8, sortBy: 'rating', order: 'desc' }));
  }, [dispatch]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
  };

  return (
    <div>
      {/* ─── Hero Section ─────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-dark-950 via-dark-900 to-dark-800 text-white">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-brand-500 rounded-full filter blur-3xl -translate-y-1/2 translate-x-1/3" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-brand-700 rounded-full filter blur-3xl translate-y-1/2 -translate-x-1/4" />
        </div>

        <div className="container-app relative py-20 lg:py-32">
          <div className="max-w-2xl">
            <span className="badge bg-brand-600/20 text-brand-400 border border-brand-500/30 text-sm mb-4 inline-block">
              🛍️ India's Fastest Growing E-Commerce
            </span>
            <h1 className="text-5xl lg:text-7xl font-bold leading-none mb-6" style={{ fontFamily: 'Clash Display' }}>
              Shop<br />
              <span className="text-brand-500">Smarter,</span><br />
              Live Better.
            </h1>
            <p className="text-xl text-dark-300 mb-8 leading-relaxed">
              Discover millions of products from trusted sellers. Cloud-native speed, seamless experience.
            </p>

            {/* Search bar */}
            <form onSubmit={handleSearch} className="flex gap-3 mb-8 max-w-lg">
              <div className="relative flex-1">
                <FiSearch size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-dark-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search for anything..."
                  className="w-full pl-12 pr-4 py-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder-dark-400 focus:outline-none focus:border-brand-500 focus:bg-white/15 transition-all"
                />
              </div>
              <button type="submit" className="btn-primary px-6 py-4">
                Search
              </button>
            </form>

            <div className="flex items-center gap-6">
              <Link to="/products" className="btn-primary text-base px-6 py-3.5">
                Shop Now <FiArrowRight size={18} />
              </Link>
              <div className="flex items-center gap-3">
                <div className="flex -space-x-2">
                  {[1,2,3,4].map(i => (
                    <div key={i} className={`w-8 h-8 rounded-full border-2 border-dark-900 bg-gradient-to-br ${
                      ['from-blue-400 to-blue-600','from-green-400 to-green-600','from-purple-400 to-purple-600','from-amber-400 to-amber-600'][i-1]
                    }`} />
                  ))}
                </div>
                <div>
                  <p className="text-sm font-semibold">50K+ Happy Customers</p>
                  <div className="flex text-amber-400 text-xs">★★★★★ <span className="text-dark-400 ml-1">4.9/5</span></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="border-t border-white/10">
          <div className="container-app py-6 grid grid-cols-3 gap-4 text-center">
            {[
              { n: '50K+', l: 'Products' },
              { n: '10K+', l: 'Sellers' },
              { n: '1M+', l: 'Happy Shoppers' },
            ].map(({ n, l }) => (
              <div key={l}>
                <p className="text-2xl font-bold text-white" style={{ fontFamily: 'Clash Display' }}>{n}</p>
                <p className="text-xs text-dark-400">{l}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Features ─────────────────────────────────────────── */}
      <section className="py-10 bg-white border-b border-gray-100">
        <div className="container-app">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map(({ icon: Icon, title, desc, color }) => (
              <div key={title} className="flex items-center gap-4">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
                  <Icon size={20} />
                </div>
                <div>
                  <p className="font-semibold text-dark-800 text-sm">{title}</p>
                  <p className="text-xs text-dark-400">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Categories ───────────────────────────────────────── */}
      <section className="py-16 container-app">
        <div className="flex items-center justify-between mb-8">
          <h2 className="section-title">Shop by Category</h2>
          <Link to="/products" className="btn-ghost text-brand-600 text-sm">View all <FiArrowRight size={16} /></Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.map(({ name, emoji, color, slug }) => (
            <Link
              key={slug}
              to={`/products?category=${slug}`}
              className={`${color} rounded-2xl p-5 text-center hover:scale-105 transition-transform cursor-pointer`}
            >
              <div className="text-4xl mb-2">{emoji}</div>
              <p className="text-sm font-semibold">{name}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* ─── Featured Products ────────────────────────────────── */}
      <section className="py-16 bg-gray-50">
        <div className="container-app">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="section-title">Featured Products</h2>
              <p className="text-dark-400 mt-1">Handpicked just for you</p>
            </div>
            <Link to="/products" className="btn-secondary text-sm">
              View all <FiArrowRight size={16} />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="card overflow-hidden">
                  <div className="skeleton aspect-square" />
                  <div className="p-4 space-y-2">
                    <div className="skeleton h-3 w-1/3" />
                    <div className="skeleton h-4 w-full" />
                    <div className="skeleton h-4 w-2/3" />
                    <div className="skeleton h-6 w-1/2 mt-3" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {products.slice(0, 8).map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ─── Promo Banner ─────────────────────────────────────── */}
      <section className="py-16 container-app">
        <div className="bg-gradient-to-r from-brand-600 to-brand-800 rounded-3xl p-10 text-white flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <p className="text-brand-200 font-medium mb-2">Special Offer</p>
            <h2 className="text-3xl font-bold mb-2" style={{ fontFamily: 'Clash Display' }}>Get 20% off your first order</h2>
            <p className="text-brand-200">Use code <span className="bg-white/20 px-2 py-0.5 rounded font-mono font-bold">WELCOME20</span> at checkout</p>
          </div>
          <Link to="/products" className="btn-secondary flex-shrink-0 text-dark-900">
            Shop Now <FiArrowRight size={18} />
          </Link>
        </div>
      </section>
    </div>
  );
}