import { baseAPI } from './client';

const CANJES_PATH = '/api/v1/canjes';

export const tradeinAPI = {
  // Get all trade-in prices
  getAllTradeinPrices: async () => {
    const response = await baseAPI.get(CANJES_PATH);
    return response.data;
  },

  // Get available product lines
  getProductLines: async () => {
    const response = await baseAPI.get(`${CANJES_PATH}/lineas`);
    return response.data;
  },

  // Get models for a specific product line
  getModelsByLine: async (linea) => {
    const response = await baseAPI.get(`${CANJES_PATH}/modelos/${linea}`);
    return response.data;
  },

  // Calculate trade-in value based on device specs
  calculateTradeInValue: async (linea, modelo, batteryHealth) => {
    // Get all trade-in prices
    const prices = await tradeinAPI.getAllTradeinPrices();

    // Convert battery health to decimal (0-1)
    const batteryDecimal = batteryHealth / 100;

    // Find matching price range
    const match = prices.find(p =>
      p.linea === linea &&
      p.modelo === modelo &&
      batteryDecimal >= p.bateriaMin &&
      batteryDecimal <= p.bateriaMax
    );

    return match ? match.precioCanje : 0;
  },

  // Admin endpoints (require authentication)
  createTradeinPrice: async (data) => {
    const response = await baseAPI.post(`${CANJES_PATH}/precio-canje`, data);
    return response.data;
  },

  updateTradeinPrice: async (id, precioCanje) => {
    const response = await baseAPI.patch(`${CANJES_PATH}/${id}`, { precioCanje });
    return response.data;
  },

  deleteTradeinPrice: async (id) => {
    const response = await baseAPI.delete(`${CANJES_PATH}/${id}`);
    return response.data;
  },
};

export default tradeinAPI;
