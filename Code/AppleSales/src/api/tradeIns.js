import { baseAPI } from './client';

const CANJES_PATH = '/api/v1/canjes';

export const tradeInsAPI = {
  // Get all trade-ins
  getAllTradeIns: async (params) => {
    const response = await baseAPI.get(CANJES_PATH, { params });
    return response.data;
  },

  // Get trade-in by ID
  getTradeInById: async (id) => {
    const response = await baseAPI.get(`${CANJES_PATH}/${id}`);
    return response.data;
  },

  // Get valuation for a device
  getValuation: async (deviceSpecs) => {
    const response = await baseAPI.post(`${CANJES_PATH}/valuate`, deviceSpecs);
    return response.data;
  },

  // Create trade-in (admin)
  createTradeIn: async (tradeInData) => {
    const response = await baseAPI.post(`${CANJES_PATH}/precio-canje`, tradeInData);
    return response.data;
  },

  // Update trade-in (admin)
  updateTradeIn: async (id, tradeInData) => {
    const response = await baseAPI.patch(`${CANJES_PATH}/${id}`, tradeInData);
    return response.data;
  },

  // Delete trade-in (admin)
  deleteTradeIn: async (id) => {
    const response = await baseAPI.delete(`${CANJES_PATH}/${id}`);
    return response.data;
  },
};

export default tradeInsAPI;
