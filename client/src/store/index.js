import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import expensesReducer from './slices/expensesSlice';
import goalsReducer from './slices/goalsSlice';
import budgetReducer from './slices/budgetSlice';
import uiReducer from './slices/uiSlice';
import currencyReducer from './slices/currencySlice';
import groupsReducer from './slices/groupsSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    expenses: expensesReducer,
    goals: goalsReducer,
    budget: budgetReducer,
    ui: uiReducer,
    currency: currencyReducer,
    groups: groupsReducer,
  },
});
