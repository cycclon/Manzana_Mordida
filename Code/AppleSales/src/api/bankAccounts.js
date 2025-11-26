import { cuentasAPI } from './client';
import { API_PATHS } from '../constants';

export const bankAccountsAPI = {
  // Get all bank accounts
  getAllBankAccounts: async (params) => {
    const response = await cuentasAPI.get(API_PATHS.BANK_ACCOUNTS, { params });
    return response.data;
  },

  // Get bank account by ID
  getBankAccountById: async (id) => {
    const response = await cuentasAPI.get(`${API_PATHS.BANK_ACCOUNTS}/${id}`);
    return response.data;
  },

  // Create bank account (admin)
  createBankAccount: async (accountData) => {
    const response = await cuentasAPI.post(API_PATHS.BANK_ACCOUNTS, accountData);
    return response.data;
  },

  // Update bank account (admin)
  updateBankAccount: async (id, accountData) => {
    const response = await cuentasAPI.put(`${API_PATHS.BANK_ACCOUNTS}/${id}`, accountData);
    return response.data;
  },

  // Delete bank account (admin)
  deleteBankAccount: async (id) => {
    const response = await cuentasAPI.delete(`${API_PATHS.BANK_ACCOUNTS}/${id}`);
    return response.data;
  },
};

export default bankAccountsAPI;
