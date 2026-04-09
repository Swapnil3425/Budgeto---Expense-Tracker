import { createSlice } from '@reduxjs/toolkit';

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
});

export const { setGroups, addGroup, removeGroup, addGroupExpense, settleBalance, setLoading } = groupsSlice.actions;
export default groupsSlice.reducer;
