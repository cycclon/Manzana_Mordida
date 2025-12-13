import { baseAPI } from './client';

const CUENTAS_PATH = '/api/v1/cuentas';

export const bankAccountsAPI = {
  // Get all bank accounts
  getAllBankAccounts: async (params) => {
    const response = await baseAPI.get(`${CUENTAS_PATH}/`, { params });
    return response.data;
  },

  // Get bank account by ID
  getBankAccountById: async (id) => {
    const response = await baseAPI.get(`${CUENTAS_PATH}/${id}`);
    return response.data;
  },

  // Create bank account (admin)
  createBankAccount: async (accountData) => {
    const response = await baseAPI.post(`${CUENTAS_PATH}/registrar`, accountData);
    return response.data;
  },

  // Update bank account (admin)
  updateBankAccount: async (id, accountData) => {
    const response = await baseAPI.patch(`${CUENTAS_PATH}/${id}`, accountData);
    return response.data;
  },

  // Delete bank account (admin)
  deleteBankAccount: async (id) => {
    const response = await baseAPI.delete(`${CUENTAS_PATH}/${id}`);
    return response.data;
  },
};

export default bankAccountsAPI;
