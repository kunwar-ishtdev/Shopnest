import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

export const fetchProducts = createAsyncThunk(
  'products/fetchAll',
  async (params = {}, { rejectWithValue }) => {
    try {
      const { data } = await api.get('/api/products', { params });
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch products');
    }
  }
);

export const fetchProductById = createAsyncThunk(
  'products/fetchById',
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await api.get(`/api/products/${id}`);
      return data.product;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Product not found');
    }
  }
);

export const fetchCategories = createAsyncThunk(
  'products/fetchCategories',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get('/api/products/categories');
      return data.categories;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message);
    }
  }
);

export const submitReview = createAsyncThunk(
  'products/submitReview',
  async ({ productId, review }, { rejectWithValue }) => {
    try {
      const { data } = await api.post(`/api/products/${productId}/reviews`, review);
      return { productId, review: data.review };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message);
    }
  }
);

// Admin
export const createProduct = createAsyncThunk('products/create', async (productData, { rejectWithValue }) => {
  try {
    const { data } = await api.post('/api/products', productData);
    return data.product;
  } catch (err) { return rejectWithValue(err.response?.data?.message); }
});

export const updateProduct = createAsyncThunk('products/update', async ({ id, productData }, { rejectWithValue }) => {
  try {
    const { data } = await api.put(`/api/products/${id}`, productData);
    return data.product;
  } catch (err) { return rejectWithValue(err.response?.data?.message); }
});

export const deleteProduct = createAsyncThunk('products/delete', async (id, { rejectWithValue }) => {
  try {
    await api.delete(`/api/products/${id}`);
    return id;
  } catch (err) { return rejectWithValue(err.response?.data?.message); }
});

const productSlice = createSlice({
  name: 'products',
  initialState: {
    items: [],
    currentProduct: null,
    categories: [],
    pagination: { total: 0, page: 1, pages: 1 },
    filters: { category: '', search: '', minPrice: '', maxPrice: '', sortBy: 'createdAt', order: 'desc' },
    loading: false,
    error: null,
  },
  reducers: {
    setFilters(state, { payload }) { state.filters = { ...state.filters, ...payload }; },
    clearFilters(state) {
      state.filters = { category: '', search: '', minPrice: '', maxPrice: '', sortBy: 'createdAt', order: 'desc' };
    },
    clearCurrentProduct(state) { state.currentProduct = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchProducts.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.items = payload.products;
        state.pagination = payload.pagination;
      })
      .addCase(fetchProducts.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload;
      });

    builder
      .addCase(fetchProductById.pending, (state) => { state.loading = true; })
      .addCase(fetchProductById.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.currentProduct = payload;
      })
      .addCase(fetchProductById.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload;
      });

    builder.addCase(fetchCategories.fulfilled, (state, { payload }) => { state.categories = payload; });

    builder
      .addCase(createProduct.fulfilled, (state, { payload }) => { state.items.unshift(payload); })
      .addCase(updateProduct.fulfilled, (state, { payload }) => {
        const idx = state.items.findIndex((p) => p._id === payload._id);
        if (idx !== -1) state.items[idx] = payload;
        if (state.currentProduct?._id === payload._id) state.currentProduct = payload;
      })
      .addCase(deleteProduct.fulfilled, (state, { payload }) => {
        state.items = state.items.filter((p) => p._id !== payload);
      });
  },
});

export const { setFilters, clearFilters, clearCurrentProduct } = productSlice.actions;
export default productSlice.reducer;