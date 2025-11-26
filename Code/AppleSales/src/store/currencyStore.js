import { create } from 'zustand';
import { STORAGE_KEYS, CURRENCY_CACHE_DURATION } from '../constants';
import axios from 'axios';

export const useCurrencyStore = create((set, get) => ({
  exchangeRate: null,
  lastUpdated: null,
  isLoading: false,
  error: null,
  preferredCurrency: 'USD', // USD or ARS

  // Fetch exchange rate from DolarAPI
  fetchExchangeRate: async (forceRefresh = false) => {
    const { exchangeRate, lastUpdated } = get();
    const now = Date.now();

    // Check if we have cached data that's still valid
    if (
      !forceRefresh &&
      exchangeRate &&
      lastUpdated &&
      now - lastUpdated < CURRENCY_CACHE_DURATION
    ) {
      return exchangeRate;
    }

    set({ isLoading: true, error: null });

    try {
      const response = await axios.get(import.meta.env.VITE_DOLAR_API);
      const rate = response.data.venta; // Use "venta" value for selling dollars

      // Store in localStorage for persistence
      localStorage.setItem(STORAGE_KEYS.CURRENCY_RATE, rate.toString());
      localStorage.setItem(STORAGE_KEYS.CURRENCY_RATE_TIMESTAMP, now.toString());

      set({
        exchangeRate: rate,
        lastUpdated: now,
        isLoading: false,
        error: null,
      });

      return rate;
    } catch (error) {
      console.error('Error fetching exchange rate:', error);

      // Try to use cached value from localStorage
      const cachedRate = localStorage.getItem(STORAGE_KEYS.CURRENCY_RATE);
      if (cachedRate) {
        const rate = parseFloat(cachedRate);
        set({ exchangeRate: rate, isLoading: false });
        return rate;
      }

      set({
        isLoading: false,
        error: 'Error al obtener tasa de cambio',
      });

      // Return a fallback rate if all else fails
      return 1000; // Fallback rate
    }
  },

  // Convert USD to ARS
  convertUSDtoARS: (usdAmount) => {
    const { exchangeRate } = get();
    if (!exchangeRate) {
      get().fetchExchangeRate();
      return null;
    }
    return usdAmount * exchangeRate;
  },

  // Convert ARS to USD
  convertARStoUSD: (arsAmount) => {
    const { exchangeRate } = get();
    if (!exchangeRate) {
      get().fetchExchangeRate();
      return null;
    }
    return arsAmount / exchangeRate;
  },

  // Toggle preferred currency display
  togglePreferredCurrency: () => {
    set((state) => ({
      preferredCurrency: state.preferredCurrency === 'USD' ? 'ARS' : 'USD',
    }));
  },

  // Set preferred currency
  setPreferredCurrency: (currency) => {
    set({ preferredCurrency: currency });
  },

  // Initialize from localStorage
  initializeCurrency: () => {
    const cachedRate = localStorage.getItem(STORAGE_KEYS.CURRENCY_RATE);
    const cachedTimestamp = localStorage.getItem(STORAGE_KEYS.CURRENCY_RATE_TIMESTAMP);

    if (cachedRate && cachedTimestamp) {
      const rate = parseFloat(cachedRate);
      const timestamp = parseInt(cachedTimestamp, 10);

      set({
        exchangeRate: rate,
        lastUpdated: timestamp,
      });

      // Fetch fresh data if cache is stale
      const now = Date.now();
      if (now - timestamp >= CURRENCY_CACHE_DURATION) {
        get().fetchExchangeRate();
      }
    } else {
      // No cache, fetch immediately
      get().fetchExchangeRate();
    }
  },
}));
