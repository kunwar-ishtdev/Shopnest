import React from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  selectCartItems, selectCartTotal, selectCartOpen,
  closeCart, removeFromCart, updateQuantity
} from '../../store/slices/cartSlice';
import { FiX, FiTrash2, FiMinus, FiPlus, FiShoppingBag } from 'react-icons/fi';

export default function CartSidebar() {
  const dispatch = useDispatch();
  const items = useSelector(selectCartItems);
  const total = useSelector(selectCartTotal);
  const isOpen = useSelector(selectCartOpen);

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          onClick={() => dispatch(closeCart())}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed right-0 top-0 h-full w-full sm:w-[420px] bg-white shadow-2xl z-50 flex flex-col transition-transform duration-300 ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      }`}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <FiShoppingBag size={20} className="text-brand-600" />
            <h2 className="text-lg font-bold text-dark-900" style={{ fontFamily: 'Clash Display' }}>
              Cart ({items.length})
            </h2>
          </div>
          <button
            onClick={() => dispatch(closeCart())}
            className="w-9 h-9 rounded-xl hover:bg-gray-100 flex items-center justify-center transition-colors"
          >
            <FiX size={20} />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto py-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-center px-6">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center">
                <FiShoppingBag size={36} className="text-gray-300" />
              </div>
              <div>
                <p className="font-semibold text-dark-700 mb-1">Your cart is empty</p>
                <p className="text-sm text-dark-400">Add some products and they'll appear here</p>
              </div>
              <Link to="/products" onClick={() => dispatch(closeCart())} className="btn-primary mt-2">
                Start Shopping
              </Link>
            </div>
          ) : (
            <div className="px-6 space-y-4">
              {items.map((item) => (
                <div key={item._id} className="flex gap-4 pb-4 border-b border-gray-100">
                  <div className="w-20 h-20 bg-gray-50 rounded-xl overflow-hidden flex-shrink-0">
                    <img
                      src={item.images?.[0] || `https://picsum.photos/seed/${item._id}/80/80`}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-dark-800 line-clamp-2 mb-1">{item.name}</h4>
                    <p className="text-sm font-bold text-brand-600">₹{item.price?.toLocaleString('en-IN')}</p>
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-1 border border-gray-200 rounded-lg">
                        <button
                          onClick={() => dispatch(updateQuantity({ id: item._id, quantity: item.quantity - 1 }))}
                          className="w-7 h-7 flex items-center justify-center hover:bg-gray-100 rounded-l-lg transition-colors"
                        >
                          <FiMinus size={12} />
                        </button>
                        <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                        <button
                          onClick={() => dispatch(updateQuantity({ id: item._id, quantity: item.quantity + 1 }))}
                          className="w-7 h-7 flex items-center justify-center hover:bg-gray-100 rounded-r-lg transition-colors"
                        >
                          <FiPlus size={12} />
                        </button>
                      </div>
                      <button
                        onClick={() => dispatch(removeFromCart(item._id))}
                        className="w-7 h-7 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg flex items-center justify-center transition-colors"
                      >
                        <FiTrash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-gray-100 px-6 py-5">
            <div className="flex items-center justify-between mb-4">
              <span className="text-dark-500 font-medium">Subtotal</span>
              <span className="text-xl font-bold text-dark-900">₹{total.toLocaleString('en-IN')}</span>
            </div>
            <p className="text-xs text-dark-400 mb-4">Shipping and taxes calculated at checkout</p>
            <Link
              to="/checkout"
              onClick={() => dispatch(closeCart())}
              className="btn-primary w-full justify-center text-base py-3"
            >
              Proceed to Checkout
            </Link>
            <button
              onClick={() => dispatch(closeCart())}
              className="btn-secondary w-full justify-center mt-2"
            >
              Continue Shopping
            </button>
          </div>
        )}
      </div>
    </>
  );
}