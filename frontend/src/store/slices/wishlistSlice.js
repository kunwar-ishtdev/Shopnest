import { createSlice } from '@reduxjs/toolkit';
import toast from 'react-hot-toast';

const loadWishlist = () => {
  try { return JSON.parse(localStorage.getItem('shopnest_wishlist') || '[]'); }
  catch { return []; }
};

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState: { items: loadWishlist() },
  reducers: {
    toggleWishlist(state, { payload }) {
      const getId = (item) => item.id || item._id;
      const idx = state.items.findIndex((i) => getId(i) === getId(payload));
      if (idx !== -1) {
        state.items.splice(idx, 1);
        toast('Removed from wishlist', { icon: '💔' });
      } else {
        state.items.push(payload);
        toast('Added to wishlist!', { icon: '❤️' });
      }
      localStorage.setItem('shopnest_wishlist', JSON.stringify(state.items));
    },
  },
});

export const { toggleWishlist } = wishlistSlice.actions;
export const selectIsWishlisted = (id) => (s) => s.wishlist.items.some((i) => (i.id || i._id) === id);
export default wishlistSlice.reducer;