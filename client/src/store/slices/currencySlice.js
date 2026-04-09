import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

export const CURRENCIES = [
  { code: 'INR', symbol: '₹', name: 'Indian Rupee', flag: '🇮🇳' },
  { code: 'USD', symbol: '$', name: 'US Dollar', flag: '🇺🇸' },
  { code: 'EUR', symbol: '€', name: 'Euro', flag: '🇪🇺' },
  { code: 'GBP', symbol: '£', name: 'British Pound', flag: '🇬🇧' },
  { code: 'AED', symbol: 'د.إ', name: 'UAE Dirham', flag: '🇦🇪' },
  { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar', flag: '🇸🇬' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen', flag: '🇯🇵' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar', flag: '🇨🇦' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar', flag: '🇦🇺' },
];

// Always fetch rates with INR as base so conversion from stored INR amounts works correctly
export const fetchRates = createAsyncThunk('currency/fetchRates', async () => {
  try {
    const res = await fetch(`https://api.exchangerate-api.com/v4/latest/INR`);
    if (!res.ok) throw new Error('Rate fetch failed');
    const data = await res.json();
    return data.rates;
  } catch {
    // Fallback approximate rates (INR base)
    return { INR: 1, USD: 0.012, EUR: 0.011, GBP: 0.0094, AED: 0.044, SGD: 0.016, JPY: 1.79, CAD: 0.016, AUD: 0.019 };
  }
});

const currencySlice = createSlice({
  name: 'currency',
  initialState: {
    selected: 'INR',
    symbol: '₹',
    rates: { INR: 1, USD: 0.012, EUR: 0.011, GBP: 0.0094, AED: 0.044, SGD: 0.016, JPY: 1.79, CAD: 0.016, AUD: 0.019 },
    loading: false,
    customCurrencies: [],
  },
  reducers: {
    setCurrency: (state, { payload }) => {
      // Check both built-in and custom currencies
      const all = [...CURRENCIES, ...state.customCurrencies];
      const found = all.find(c => c.code === payload);
      if (found) {
        state.selected = found.code;
        state.symbol = found.symbol;
      }
    },
    addCustomCurrency: (state, { payload }) => {
      // payload: { code, symbol, name, flag }
      const exists = [...CURRENCIES, ...state.customCurrencies].find(c => c.code === payload.code);
      if (!exists) state.customCurrencies.push(payload);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchRates.pending, state => { state.loading = true; })
      .addCase(fetchRates.fulfilled, (state, { payload }) => { state.rates = payload; state.loading = false; })
      .addCase(fetchRates.rejected, state => { state.loading = false; });
  },
});

export const { setCurrency, addCustomCurrency } = currencySlice.actions;
export default currencySlice.reducer;
