import { createSlice } from '@reduxjs/toolkit';
import toast from 'react-hot-toast';

const loadCart = () => {
  try { return JSON.parse(localStorage.getItem('shopnest_cart') || '[]'); }
  catch { return []; }
};

const saveCart = (items) => {
  localStorage.setItem('shopnest_cart', JSON.stringify(items));
};

const cartSlice = createSlice({
  name: 'cart',
  initialState: {
    items: loadCart(),
    isOpen: false,
  },
  reducers: {
    addToCart(state, { payload }) {
      const getId = (item) => item.id || item._id;
      const existing = state.items.find((i) => getId(i) === getId(payload));
      if (existing) {
        existing.quantity += payload.quantity || 1;
        toast.success('Cart updated');
      } else {
        // Normalise _id so cart always has a stable identifier
        state.items.push({ ...payload, _id: getId(payload), quantity: payload.quantity || 1 });
        toast.success('Added to cart!');
      }
      saveCart(state.items);
    },
    removeFromCart(state, { payload }) {
      state.items = state.items.filter((i) => (i.id || i._id) !== payload);
      saveCart(state.items);
      toast.success('Removed from cart');
    },
    updateQuantity(state, { payload: { id, quantity } }) {
      const item = state.items.find((i) => (i.id || i._id) === id);
      if (item) {
        if (quantity <= 0) {
          state.items = state.items.filter((i) => (i.id || i._id) !== id);
        } else {
          item.quantity = quantity;
        }
      }
      saveCart(state.items);
    },
    clearCart(state) {
      state.items = [];
      saveCart([]);
    },
    toggleCart(state) { state.isOpen = !state.isOpen; },
    openCart(state) { state.isOpen = true; },
    closeCart(state) { state.isOpen = false; },
  },
});

export const { addToCart, removeFromCart, updateQuantity, clearCart, toggleCart, openCart, closeCart } = cartSlice.actions;

// Selectors
export const selectCartItems = (s) => s.cart.items;
export const selectCartTotal = (s) => s.cart.items.reduce((t, i) => t + i.price * i.quantity, 0);
export const selectCartCount = (s) => s.cart.items.reduce((t, i) => t + i.quantity, 0);
export const selectCartOpen = (s) => s.cart.isOpen;

export default cartSlice.reducer;