import { canjesAPI } from './client';
import { API_PATHS } from '../constants';

export const tradeinAPI = {
  // Get all trade-in prices
  getAllTradeinPrices: async () => {
    const response = await canjesAPI.get(API_PATHS.CANJES);
    return response.data;
  },

  // Get available product lines
  getProductLines: async () => {
    const response = await canjesAPI.get(`${API_PATHS.CANJES}/lineas`);
    return response.data;
  },

  // Get models for a specific product line
  getModelsByLine: async (linea) => {
    const response = await canjesAPI.get(`${API_PATHS.CANJES}/modelos/${linea}`);
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
    const response = await canjesAPI.post(`${API_PATHS.CANJES}/precio-canje`, data);
    return response.data;
  },

  updateTradeinPrice: async (id, precioCanje) => {
    const response = await canjesAPI.patch(`${API_PATHS.CANJES}/${id}`, { precioCanje });
    return response.data;
  },

  deleteTradeinPrice: async (id) => {
    const response = await canjesAPI.delete(`${API_PATHS.CANJES}/${id}`);
    return response.data;
  },
};

export default tradeinAPI;
