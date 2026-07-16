// CartPage.js
import React from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { selectCartItems, selectCartTotal, removeFromCart, updateQuantity, clearCart } from '../store/slices/cartSlice';
import { FiTrash2, FiMinus, FiPlus, FiArrowLeft, FiShoppingBag } from 'react-icons/fi';

export default function CartPage() {
  const dispatch = useDispatch();
  const items = useSelector(selectCartItems);
  const total = useSelector(selectCartTotal);

  if (items.length === 0) return (
    <div className="container-app py-24 text-center">
      <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-5">
        <FiShoppingBag size={40} className="text-gray-300" />
      </div>
      <h2 className="text-2xl font-bold text-dark-800 mb-2">Your cart is empty</h2>
      <p className="text-dark-400 mb-6">Looks like you haven't added anything yet.</p>
      <Link to="/products" className="btn-primary">Start Shopping</Link>
    </div>
  );

  return (
    <div className="container-app py-10">
      <div className="flex items-center justify-between mb-8">
        <h1 className="section-title">Shopping Cart ({items.length})</h1>
        <button onClick={() => dispatch(clearCart())} className="text-sm text-red-500 hover:text-red-700 transition-colors">
          <FiTrash2 size={14} className="inline mr-1" />Clear all
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <div key={item._id} className="card p-5 flex gap-5">
              <img
                src={item.images?.[0] || `https://picsum.photos/seed/${item._id}/120/120`}
                alt={item.name}
                className="w-24 h-24 object-cover rounded-xl bg-gray-50"
              />
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-dark-800 mb-1 line-clamp-2">{item.name}</h3>
                <p className="text-sm text-dark-400 capitalize mb-3">{item.category}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden">
                    <button onClick={() => dispatch(updateQuantity({ id: item._id, quantity: item.quantity - 1 }))} className="w-9 h-9 flex items-center justify-center hover:bg-gray-50">
                      <FiMinus size={13} />
                    </button>
                    <span className="w-10 text-center text-sm font-medium">{item.quantity}</span>
                    <button onClick={() => dispatch(updateQuantity({ id: item._id, quantity: item.quantity + 1 }))} className="w-9 h-9 flex items-center justify-center hover:bg-gray-50">
                      <FiPlus size={13} />
                    </button>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-bold text-dark-900">₹{(item.price * item.quantity).toLocaleString('en-IN')}</span>
                    <button onClick={() => dispatch(removeFromCart(item._id))} className="text-red-400 hover:text-red-600 transition-colors">
                      <FiTrash2 size={17} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="card p-6 h-fit sticky top-24">
          <h3 className="font-bold text-dark-900 text-lg mb-5">Order Summary</h3>
          <div className="space-y-3 mb-5">
            <div className="flex justify-between text-sm text-dark-600">
              <span>Subtotal ({items.reduce((t,i) => t+i.quantity,0)} items)</span>
              <span>₹{total.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between text-sm text-dark-600">
              <span>Delivery</span>
              <span className={total >= 499 ? 'text-green-600' : ''}>
                {total >= 499 ? 'FREE' : '₹49'}
              </span>
            </div>
            <div className="flex justify-between text-sm text-dark-600">
              <span>Tax (18%)</span>
              <span>₹{Math.round(total * 0.18).toLocaleString('en-IN')}</span>
            </div>
            <div className="border-t pt-3 flex justify-between font-bold text-dark-900">
              <span>Total</span>
              <span>₹{(total + (total < 499 ? 49 : 0) + Math.round(total * 0.18)).toLocaleString('en-IN')}</span>
            </div>
          </div>
          <Link to="/checkout" className="btn-primary w-full justify-center py-3">Proceed to Checkout</Link>
          <Link to="/products" className="btn-secondary w-full justify-center mt-3">
            <FiArrowLeft size={16} /> Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}