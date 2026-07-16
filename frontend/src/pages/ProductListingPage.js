import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useSearchParams } from 'react-router-dom';
import { fetchProducts, fetchCategories, setFilters } from '../store/slices/productSlice';
import ProductCard from '../components/product/ProductCard';
import { FiFilter, FiX, FiChevronDown, FiSearch } from 'react-icons/fi';

const sortOptions = [
  { value: 'createdAt:desc', label: 'Newest First' },
  { value: 'price:asc', label: 'Price: Low to High' },
  { value: 'price:desc', label: 'Price: High to Low' },
  { value: 'rating:desc', label: 'Highest Rated' },
  { value: 'name:asc', label: 'Name: A-Z' },
];

export default function ProductListingPage() {
  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();
  const { items, loading, pagination, filters } = useSelector((s) => s.products);
  const { categories } = useSelector((s) => s.products);
  const [showFilters, setShowFilters] = useState(false);
  const [localFilters, setLocalFilters] = useState({
    search: searchParams.get('search') || '',
    category: searchParams.get('category') || '',
    minPrice: '',
    maxPrice: '',
    sortBy: 'createdAt',
    order: 'desc',
  });

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  useEffect(() => {
    const params = {
      search: localFilters.search,
      category: localFilters.category,
      minPrice: localFilters.minPrice,
      maxPrice: localFilters.maxPrice,
      sortBy: localFilters.sortBy,
      order: localFilters.order,
      page: 1,
      limit: 12,
    };
    dispatch(fetchProducts(params));
  }, [dispatch, localFilters]);

  const handleSortChange = (val) => {
    const [sortBy, order] = val.split(':');
    setLocalFilters((f) => ({ ...f, sortBy, order }));
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const search = e.target.search.value;
    setLocalFilters((f) => ({ ...f, search }));
  };

  const clearFilters = () => {
    setLocalFilters({ search: '', category: '', minPrice: '', maxPrice: '', sortBy: 'createdAt', order: 'desc' });
  };

  const hasActiveFilters = localFilters.search || localFilters.category || localFilters.minPrice || localFilters.maxPrice;

  return (
    <div className="container-app py-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="section-title mb-1">
          {localFilters.category
            ? localFilters.category.charAt(0).toUpperCase() + localFilters.category.slice(1)
            : localFilters.search
              ? `Results for "${localFilters.search}"`
              : 'All Products'}
        </h1>
        <p className="text-dark-400 text-sm">{pagination.total} products found</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Filters Sidebar */}
        <aside className={`lg:w-64 flex-shrink-0 ${showFilters ? 'block' : 'hidden lg:block'}`}>
          <div className="card p-5 sticky top-24">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-semibold text-dark-800">Filters</h3>
              {hasActiveFilters && (
                <button onClick={clearFilters} className="text-xs text-brand-600 hover:underline">Clear all</button>
              )}
            </div>

            {/* Search */}
            <div className="mb-5">
              <label className="block text-sm font-medium text-dark-700 mb-2">Search</label>
              <form onSubmit={handleSearch}>
                <div className="relative">
                  <FiSearch size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-400" />
                  <input
                    name="search"
                    defaultValue={localFilters.search}
                    placeholder="Search products..."
                    className="input-field pl-9 text-sm"
                  />
                </div>
              </form>
            </div>

            {/* Category */}
            <div className="mb-5">
              <label className="block text-sm font-medium text-dark-700 mb-2">Category</label>
              <div className="space-y-1">
                <button
                  onClick={() => setLocalFilters((f) => ({ ...f, category: '' }))}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                    !localFilters.category ? 'bg-brand-50 text-brand-700 font-medium' : 'text-dark-600 hover:bg-gray-50'
                  }`}
                >
                  All Categories
                </button>
                {(categories.length ? categories : ['electronics', 'clothing', 'home', 'sports', 'books', 'beauty']).map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setLocalFilters((f) => ({ ...f, category: cat }))}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors capitalize ${
                      localFilters.category === cat ? 'bg-brand-50 text-brand-700 font-medium' : 'text-dark-600 hover:bg-gray-50'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Price Range */}
            <div>
              <label className="block text-sm font-medium text-dark-700 mb-2">Price Range (₹)</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={localFilters.minPrice}
                  onChange={(e) => setLocalFilters((f) => ({ ...f, minPrice: e.target.value }))}
                  className="input-field text-sm"
                />
                <input
                  type="number"
                  placeholder="Max"
                  value={localFilters.maxPrice}
                  onChange={(e) => setLocalFilters((f) => ({ ...f, maxPrice: e.target.value }))}
                  className="input-field text-sm"
                />
              </div>
            </div>
          </div>
        </aside>

        {/* Products */}
        <div className="flex-1">
          {/* Toolbar */}
          <div className="flex items-center justify-between mb-5 gap-4">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="lg:hidden btn-secondary text-sm"
            >
              <FiFilter size={16} /> Filters {hasActiveFilters && <span className="badge-brand">!</span>}
            </button>

            <div className="ml-auto flex items-center gap-2">
              <span className="text-sm text-dark-400 hidden sm:block">Sort by:</span>
              <select
                value={`${localFilters.sortBy}:${localFilters.order}`}
                onChange={(e) => handleSortChange(e.target.value)}
                className="input-field text-sm py-2 w-auto"
              >
                {sortOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Active Filters */}
          {hasActiveFilters && (
            <div className="flex flex-wrap gap-2 mb-5">
              {localFilters.search && (
                <span className="badge bg-brand-50 text-brand-700 gap-1">
                  Search: {localFilters.search}
                  <button onClick={() => setLocalFilters((f) => ({ ...f, search: '' }))}>
                    <FiX size={12} />
                  </button>
                </span>
              )}
              {localFilters.category && (
                <span className="badge bg-brand-50 text-brand-700 gap-1 capitalize">
                  {localFilters.category}
                  <button onClick={() => setLocalFilters((f) => ({ ...f, category: '' }))}>
                    <FiX size={12} />
                  </button>
                </span>
              )}
            </div>
          )}

          {/* Grid */}
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-5">
              {[...Array(12)].map((_, i) => (
                <div key={i} className="card overflow-hidden">
                  <div className="skeleton aspect-square" />
                  <div className="p-4 space-y-2">
                    <div className="skeleton h-3 w-1/3" />
                    <div className="skeleton h-4 w-full" />
                    <div className="skeleton h-6 w-1/2 mt-3" />
                  </div>
                </div>
              ))}
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold text-dark-700 mb-2">No products found</h3>
              <p className="text-dark-400 mb-4">Try adjusting your filters</p>
              <button onClick={clearFilters} className="btn-primary">Clear Filters</button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-5">
                {items.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>

              {/* Pagination */}
              {pagination.pages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-10">
                  {[...Array(pagination.pages)].map((_, i) => (
                    <button
                      key={i}
                      onClick={() => dispatch(fetchProducts({ ...localFilters, page: i + 1, limit: 12 }))}
                      className={`w-10 h-10 rounded-xl text-sm font-medium transition-colors ${
                        pagination.page === i + 1
                          ? 'bg-brand-600 text-white'
                          : 'bg-white border border-gray-200 text-dark-600 hover:border-brand-600'
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}