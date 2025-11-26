import { canjesAPI } from './client';
import { API_PATHS } from '../constants';

export const tradeInsAPI = {
  // Get all trade-ins
  getAllTradeIns: async (params) => {
    const response = await canjesAPI.get(API_PATHS.TRADE_INS, { params });
    return response.data;
  },

  // Get trade-in by ID
  getTradeInById: async (id) => {
    const response = await canjesAPI.get(`${API_PATHS.TRADE_INS}/${id}`);
    return response.data;
  },

  // Get valuation for a device
  getValuation: async (deviceSpecs) => {
    const response = await canjesAPI.post(API_PATHS.TRADE_IN_VALUATE, deviceSpecs);
    return response.data;
  },

  // Create trade-in (admin)
  createTradeIn: async (tradeInData) => {
    const response = await canjesAPI.post(API_PATHS.TRADE_INS, tradeInData);
    return response.data;
  },

  // Update trade-in (admin)
  updateTradeIn: async (id, tradeInData) => {
    const response = await canjesAPI.put(`${API_PATHS.TRADE_INS}/${id}`, tradeInData);
    return response.data;
  },

  // Delete trade-in (admin)
  deleteTradeIn: async (id) => {
    const response = await canjesAPI.delete(`${API_PATHS.TRADE_INS}/${id}`);
    return response.data;
  },
};

export default tradeInsAPI;
