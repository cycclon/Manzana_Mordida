import { useTradeInStore } from '../store/tradeInStore';

/**
 * Custom hook for trade-in functionality
 */
export const useTradeIn = () => {
  const tradeInDevice = useTradeInStore((state) => state.tradeInDevice);
  const isActive = useTradeInStore((state) => state.isActive);
  const setTradeInDevice = useTradeInStore((state) => state.setTradeInDevice);
  const updateValuation = useTradeInStore((state) => state.updateValuation);
  const clearTradeIn = useTradeInStore((state) => state.clearTradeIn);
  const toggleTradeIn = useTradeInStore((state) => state.toggleTradeIn);
  const getAdjustedPrice = useTradeInStore((state) => state.getAdjustedPrice);

  const hasTradeIn = isActive && tradeInDevice !== null;

  return {
    tradeInDevice,
    isActive,
    hasTradeIn,
    setTradeInDevice,
    updateValuation,
    clearTradeIn,
    toggleTradeIn,
    getAdjustedPrice,
  };
};
