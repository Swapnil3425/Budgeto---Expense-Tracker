import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

export const fetchGroups = createAsyncThunk('groups/fetch', async (_, { rejectWithValue }) => {
  try {
    const { data } = await api.get('/groups');
    return data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch groups');
  }
});

const groupsSlice = createSlice({
  name: 'groups',
  initialState: { list: [], loading: false, error: null },
  reducers: {
    setGroups: (state, { payload }) => { state.list = payload; },
    addGroup: (state, { payload }) => { state.list.unshift(payload); },
    removeGroup: (state, { payload }) => { state.list = state.list.filter(g => g._id !== payload); },
    addGroupExpense: (state, { payload }) => {
      const group = state.list.find(g => g._id === payload.groupId);
      if (group) group.expenses.push(payload.expense);
    },
    settleBalance: (state, { payload }) => {
      const group = state.list.find(g => g._id === payload.groupId);
      if (group) {
        const expense = group.expenses.find(e => e._id === payload.expenseId);
        if (expense) expense.settled = true;
      }
    },
    setLoading: (state, { payload }) => { state.loading = payload; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchGroups.pending, (state) => { state.loading = true; })
      .addCase(fetchGroups.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.list = payload;
      })
      .addCase(fetchGroups.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload;
      });
  },
});

export const { setGroups, addGroup, removeGroup, addGroupExpense, settleBalance, setLoading } = groupsSlice.actions;
export default groupsSlice.reducer;
