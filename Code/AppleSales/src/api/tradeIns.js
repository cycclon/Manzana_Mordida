import { canjesAPI } from './client';

export const tradeInsAPI = {
  // Get all trade-ins
  getAllTradeIns: async (params) => {
    const response = await canjesAPI.get('/api/v1/canjes', { params });
    return response.data;
  },

  // Get trade-in by ID
  getTradeInById: async (id) => {
    const response = await canjesAPI.get(`/api/v1/canjes/${id}`);
    return response.data;
  },

  // Get valuation for a device
  getValuation: async (deviceSpecs) => {
    const response = await canjesAPI.post('/api/v1/canjes/valuate', deviceSpecs);
    return response.data;
  },

  // Create trade-in (admin)
  createTradeIn: async (tradeInData) => {
    const response = await canjesAPI.post('/api/v1/canjes/precio-canje', tradeInData);
    return response.data;
  },

  // Update trade-in (admin)
  updateTradeIn: async (id, tradeInData) => {
    const response = await canjesAPI.patch(`/api/v1/canjes/${id}`, tradeInData);
    return response.data;
  },

  // Delete trade-in (admin)
  deleteTradeIn: async (id) => {
    const response = await canjesAPI.delete(`/api/v1/canjes/${id}`);
    return response.data;
  },
};

export default tradeInsAPI;
