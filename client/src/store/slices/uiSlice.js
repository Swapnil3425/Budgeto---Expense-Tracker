import { createSlice } from '@reduxjs/toolkit';

const uiSlice = createSlice({
  name: 'ui',
  initialState: {
    sidebarCollapsed: false,
    showAddExpense: false,
    theme: 'dark',
  },
  reducers: {
    toggleSidebar: (state) => { state.sidebarCollapsed = !state.sidebarCollapsed; },
    setSidebarCollapsed: (state, { payload }) => { state.sidebarCollapsed = payload; },
    setShowAddExpense: (state, { payload }) => { state.showAddExpense = payload; },
  },
});

export const { toggleSidebar, setSidebarCollapsed, setShowAddExpense } = uiSlice.actions;
export default uiSlice.reducer;
