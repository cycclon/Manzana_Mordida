import { useEffect } from 'react';
import { useCurrencyStore } from '../store/currencyStore';
import { formatUSD, formatARS } from '../utils/formatters';

/**
 * Custom hook for currency conversion and formatting
 */
export const useCurrency = () => {
  const {
    exchangeRate,
    lastUpdated,
    isLoading,
    error,
    preferredCurrency,
    fetchExchangeRate,
    convertUSDtoARS,
    convertARStoUSD,
    togglePreferredCurrency,
    setPreferredCurrency,
    initializeCurrency,
  } = useCurrencyStore();

  // Initialize on mount
  useEffect(() => {
    if (!exchangeRate) {
      initializeCurrency();
    }
  }, [exchangeRate, initializeCurrency]);

  /**
   * Format both USD and ARS prices
   */
  const formatBothCurrencies = (usdAmount) => {
    const arsAmount = convertUSDtoARS(usdAmount);
    return {
      usd: formatUSD(usdAmount),
      ars: arsAmount ? formatARS(arsAmount) : 'Cargando...',
      usdRaw: usdAmount,
      arsRaw: arsAmount,
    };
  };

  /**
   * Get formatted price in preferred currency
   */
  const formatPreferred = (usdAmount) => {
    if (preferredCurrency === 'USD') {
      return formatUSD(usdAmount);
    }
    const arsAmount = convertUSDtoARS(usdAmount);
    return arsAmount ? formatARS(arsAmount) : formatUSD(usdAmount);
  };

  return {
    exchangeRate,
    lastUpdated,
    isLoading,
    error,
    preferredCurrency,
    fetchExchangeRate,
    convertUSDtoARS,
    convertARStoUSD,
    togglePreferredCurrency,
    setPreferredCurrency,
    formatBothCurrencies,
    formatPreferred,
    formatUSD,
    formatARS,
  };
};
