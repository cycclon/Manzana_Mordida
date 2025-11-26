import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { STORAGE_KEYS } from '../constants';

export const useTradeInStore = create(
  persist(
    (set, get) => ({
      tradeInDevice: null, // { model, storage, batteryHealth, valuation }
      isActive: false,

      // Set trade-in device
      setTradeInDevice: (device) => {
        set({
          tradeInDevice: device,
          isActive: true,
        });
      },

      // Update trade-in device valuation
      updateValuation: (valuation) => {
        const { tradeInDevice } = get();
        if (tradeInDevice) {
          set({
            tradeInDevice: {
              ...tradeInDevice,
              valuation,
            },
          });
        }
      },

      // Clear trade-in device
      clearTradeIn: () => {
        set({
          tradeInDevice: null,
          isActive: false,
        });
      },

      // Toggle trade-in active state
      toggleTradeIn: () => {
        set((state) => ({
          isActive: !state.isActive,
        }));
      },

      // Get adjusted price (device price - trade-in value)
      getAdjustedPrice: (devicePrice) => {
        const { tradeInDevice, isActive } = get();
        if (!isActive || !tradeInDevice?.valuation) {
          return devicePrice;
        }
        return Math.max(0, devicePrice - tradeInDevice.valuation);
      },
    }),
    {
      name: STORAGE_KEYS.TRADE_IN_DEVICE,
    }
  )
);
