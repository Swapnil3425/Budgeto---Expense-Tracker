import { createSlice } from '@reduxjs/toolkit';

const MOCK_GOALS = [
  { _id: 'g1', title: 'Buy Laptop', targetAmount: 80000, currentAmount: 32000, deadline: '2026-06-30', icon: '💻', color: '#FF7733' },
  { _id: 'g2', title: 'Emergency Fund', targetAmount: 200000, currentAmount: 85000, deadline: '2026-12-31', icon: '🛡️', color: '#22C55E' },
  { _id: 'g3', title: 'Vacation to Goa', targetAmount: 30000, currentAmount: 18500, deadline: '2026-05-01', icon: '🏖️', color: '#3B82F6' },
  { _id: 'g4', title: 'New Phone', targetAmount: 60000, currentAmount: 12000, deadline: '2026-08-15', icon: '📱', color: '#A855F7' },
];

const goalsSlice = createSlice({
  name: 'goals',
  initialState: { list: MOCK_GOALS },
  reducers: {
    setGoals: (state, { payload }) => { state.list = payload; },
    addGoal: (state, { payload }) => { state.list.push(payload); },
    updateGoal: (state, { payload }) => {
      const idx = state.list.findIndex(g => g._id === payload._id);
      if (idx !== -1) state.list[idx] = payload;
    },
    removeGoal: (state, { payload }) => {
      state.list = state.list.filter(g => g._id !== payload);
    },
  },
});

export const { setGoals, addGoal, updateGoal, removeGoal } = goalsSlice.actions;
export default goalsSlice.reducer;
