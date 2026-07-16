import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProducts, createProduct, updateProduct, deleteProduct } from '../store/slices/productSlice';
import { FiPlus, FiEdit2, FiTrash2, FiX, FiSearch } from 'react-icons/fi';
import toast from 'react-hot-toast';

const EMPTY_FORM = {
  name: '', description: '', price: '', originalPrice: '',
  category: 'electronics', stock: '', images: [''],
};

export default function AdminProducts() {
  const dispatch = useDispatch();
  const { items: products, loading } = useSelector((s) => s.products);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);

  useEffect(() => {
    dispatch(fetchProducts({ limit: 100 }));
  }, [dispatch]);

  const filtered = products.filter(
    (p) => p.name?.toLowerCase().includes(search.toLowerCase()) || p.category?.toLowerCase().includes(search.toLowerCase())
  );

  const openCreate = () => { setForm(EMPTY_FORM); setEditingProduct(null); setShowModal(true); };
  const openEdit = (product) => {
    setEditingProduct(product);
    setForm({ ...product, images: product.images?.length ? product.images : [''] });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = { ...form, price: Number(form.price), originalPrice: Number(form.originalPrice) || undefined, stock: Number(form.stock) };
    if (editingProduct) {
      dispatch(updateProduct({ id: editingProduct._id, productData: payload }));
    } else {
      dispatch(createProduct(payload));
    }
    setShowModal(false);
  };

  const handleDelete = (id) => {
    if (window.confirm('Delete this product?')) {
      dispatch(deleteProduct(id));
    }
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-dark-900" style={{ fontFamily: 'Clash Display' }}>Products</h1>
          <p className="text-dark-400 mt-1">{products.length} total products</p>
        </div>
        <button onClick={openCreate} className="btn-primary">
          <FiPlus size={18} /> Add Product
        </button>
      </div>

      {/* Search */}
      <div className="card p-4 mb-5">
        <div className="relative max-w-sm">
          <FiSearch size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products..."
            className="input-field pl-9 text-sm"
          />
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {['Product', 'Category', 'Price', 'Stock', 'Status', 'Actions'].map((h) => (
                  <th key={h} className="text-left px-5 py-3.5 text-xs font-semibold text-dark-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                [...Array(6)].map((_, i) => (
                  <tr key={i}>
                    {[...Array(6)].map((_, j) => (
                      <td key={j} className="px-5 py-4"><div className="skeleton h-4 rounded" /></td>
                    ))}
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-dark-400">
                    No products found
                  </td>
                </tr>
              ) : (
                filtered.map((product) => (
                  <tr key={product._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={product.images?.[0] || `https://picsum.photos/seed/${product._id}/40/40`}
                          alt={product.name}
                          className="w-10 h-10 rounded-xl object-cover bg-gray-100 flex-shrink-0"
                        />
                        <span className="font-medium text-dark-800 line-clamp-1 max-w-[180px]">{product.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 capitalize text-dark-600">{product.category}</td>
                    <td className="px-5 py-4 font-semibold text-dark-800">₹{product.price?.toLocaleString('en-IN')}</td>
                    <td className="px-5 py-4">
                      <span className={product.stock > 0 ? 'badge-success' : 'badge-error'}>{product.stock}</span>
                    </td>
                    <td className="px-5 py-4">
                      <span className={product.stock > 0 ? 'badge-success' : 'badge-warning'}>
                        {product.stock > 0 ? 'In Stock' : 'Out of Stock'}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <button onClick={() => openEdit(product)} className="btn-ghost p-1.5 text-blue-600 hover:bg-blue-50">
                          <FiEdit2 size={15} />
                        </button>
                        <button onClick={() => handleDelete(product._id)} className="btn-ghost p-1.5 text-red-500 hover:bg-red-50">
                          <FiTrash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h3 className="font-bold text-dark-900 text-lg">{editingProduct ? 'Edit Product' : 'Add Product'}</h3>
              <button onClick={() => setShowModal(false)} className="btn-ghost p-2"><FiX size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-dark-700 mb-1.5">Product Name *</label>
                <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required className="input-field" placeholder="e.g. iPhone 15 Pro" />
              </div>
              <div>
                <label className="block text-sm font-medium text-dark-700 mb-1.5">Description</label>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} className="input-field resize-none" placeholder="Product description..." />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-dark-700 mb-1.5">Price (₹) *</label>
                  <input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required min="0" className="input-field" placeholder="999" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-dark-700 mb-1.5">Original Price (₹)</label>
                  <input type="number" value={form.originalPrice} onChange={(e) => setForm({ ...form, originalPrice: e.target.value })} min="0" className="input-field" placeholder="1299" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-dark-700 mb-1.5">Category *</label>
                  <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="input-field">
                    {['electronics', 'clothing', 'home', 'sports', 'books', 'beauty', 'other'].map((c) => (
                      <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-dark-700 mb-1.5">Stock *</label>
                  <input type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} required min="0" className="input-field" placeholder="100" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-dark-700 mb-1.5">Image URL</label>
                <input
                  type="url"
                  value={form.images?.[0] || ''}
                  onChange={(e) => setForm({ ...form, images: [e.target.value] })}
                  className="input-field"
                  placeholder="https://example.com/image.jpg"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary flex-1 justify-center">Cancel</button>
                <button type="submit" className="btn-primary flex-1 justify-center">
                  {editingProduct ? 'Update Product' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}