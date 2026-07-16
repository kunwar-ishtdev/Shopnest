// orderSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';
import toast from 'react-hot-toast';

export const createOrder = createAsyncThunk('orders/create', async (orderData, { rejectWithValue }) => {
  try {
    const { data } = await api.post('/api/orders', orderData);
    return data.order;
  } catch (err) { return rejectWithValue(err.response?.data?.message); }
});

export const fetchMyOrders = createAsyncThunk('orders/fetchMine', async (_, { rejectWithValue }) => {
  try {
    const { data } = await api.get('/api/orders/my-orders');
    return data.orders;
  } catch (err) { return rejectWithValue(err.response?.data?.message); }
});

export const fetchOrderById = createAsyncThunk('orders/fetchById', async (id, { rejectWithValue }) => {
  try {
    const { data } = await api.get(`/api/orders/${id}`);
    return data.order;
  } catch (err) { return rejectWithValue(err.response?.data?.message); }
});

export const fetchAllOrders = createAsyncThunk('orders/fetchAll', async (params = {}, { rejectWithValue }) => {
  try {
    const { data } = await api.get('/api/orders', { params });
    return data;
  } catch (err) { return rejectWithValue(err.response?.data?.message); }
});

export const updateOrderStatus = createAsyncThunk('orders/updateStatus', async ({ id, status }, { rejectWithValue }) => {
  try {
    const { data } = await api.patch(`/api/orders/${id}/status`, { status });
    return data.order;
  } catch (err) { return rejectWithValue(err.response?.data?.message); }
});

const orderSlice = createSlice({
  name: 'orders',
  initialState: {
    myOrders: [],
    allOrders: [],
    currentOrder: null,
    pagination: { total: 0, page: 1, pages: 1 },
    loading: false,
    error: null,
  },
  reducers: {
    clearCurrentOrder(state) { state.currentOrder = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createOrder.pending, (state) => { state.loading = true; })
      .addCase(createOrder.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.currentOrder = payload;
        state.myOrders.unshift(payload);
        toast.success('Order placed successfully!');
      })
      .addCase(createOrder.rejected, (state, { payload }) => {
        state.loading = false;
        toast.error(payload || 'Failed to place order');
      });

    builder
      .addCase(fetchMyOrders.pending, (state) => { state.loading = true; })
      .addCase(fetchMyOrders.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.myOrders = payload;
      })
      .addCase(fetchMyOrders.rejected, (state) => { state.loading = false; });

    builder
      .addCase(fetchOrderById.fulfilled, (state, { payload }) => { state.currentOrder = payload; });

    builder
      .addCase(fetchAllOrders.fulfilled, (state, { payload }) => {
        state.allOrders = payload.orders;
        state.pagination = payload.pagination;
      });

    builder
      .addCase(updateOrderStatus.fulfilled, (state, { payload }) => {
        const idx = state.allOrders.findIndex((o) => o._id === payload._id);
        if (idx !== -1) state.allOrders[idx] = payload;
        if (state.currentOrder?._id === payload._id) state.currentOrder = payload;
        toast.success('Order status updated');
      });
  },
});

export const { clearCurrentOrder } = orderSlice.actions;
export default orderSlice.reducer;