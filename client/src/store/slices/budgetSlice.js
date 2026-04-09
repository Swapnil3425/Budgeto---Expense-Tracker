import { createSlice } from '@reduxjs/toolkit';

const MOCK_SUBS = [
  { _id: 's1', name: 'Netflix', amount: 649, frequency: 'monthly', icon: '🎬', color: '#E50914', nextBilling: '2026-04-01', category: 'Entertainment' },
  { _id: 's2', name: 'Spotify', amount: 119, frequency: 'monthly', icon: '🎵', color: '#1DB954', nextBilling: '2026-03-20', category: 'Entertainment' },
  { _id: 's3', name: 'Amazon Prime', amount: 299, frequency: 'monthly', icon: '📦', color: '#FF9900', nextBilling: '2026-03-25', category: 'Entertainment' },
  { _id: 's4', name: 'AWS', amount: 850, frequency: 'monthly', icon: '☁️', color: '#FF9900', nextBilling: '2026-04-05', category: 'Bills' },
  { _id: 's5', name: 'Notion', amount: 200, frequency: 'monthly', icon: '📝', color: '#ffffff', nextBilling: '2026-04-10', category: 'Education' },
  { _id: 's6', name: 'GitHub Pro', amount: 84, frequency: 'monthly', icon: '🐱', color: '#6e40c9', nextBilling: '2026-03-28', category: 'Education' },
];

const budgetSlice = createSlice({
  name: 'budget',
  initialState: { list: [], subscriptions: MOCK_SUBS },
  reducers: {
    setBudgets: (state, { payload }) => { state.list = payload; },
    setSubscriptions: (state, { payload }) => { state.subscriptions = payload; },
    addSubscription: (state, { payload }) => { state.subscriptions.push(payload); },
    removeSubscription: (state, { payload }) => {
      state.subscriptions = state.subscriptions.filter(s => s._id !== payload);
    },
    updateSubscription: (state, { payload }) => {
      const index = state.subscriptions.findIndex(s => s._id === payload._id);
      if (index !== -1) {
        state.subscriptions[index] = payload;
      }
    }
  },
});

export const { setBudgets, setSubscriptions, addSubscription, removeSubscription, updateSubscription } = budgetSlice.actions;
export default budgetSlice.reducer;
