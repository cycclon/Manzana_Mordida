import { cuentasAPI } from './client';

export const bankAccountsAPI = {
  // Get all bank accounts
  getAllBankAccounts: async (params) => {
    const response = await cuentasAPI.get('/api/v1/cuentas/', { params });
    return response.data;
  },

  // Get bank account by ID
  getBankAccountById: async (id) => {
    const response = await cuentasAPI.get(`/api/v1/cuentas/${id}`);
    return response.data;
  },

  // Create bank account (admin)
  createBankAccount: async (accountData) => {
    const response = await cuentasAPI.post('/api/v1/cuentas/registrar', accountData);
    return response.data;
  },

  // Update bank account (admin)
  updateBankAccount: async (id, accountData) => {
    const response = await cuentasAPI.patch(`/api/v1/cuentas/${id}`, accountData);
    return response.data;
  },

  // Delete bank account (admin)
  deleteBankAccount: async (id) => {
    const response = await cuentasAPI.delete(`/api/v1/cuentas/${id}`);
    return response.data;
  },
};

export default bankAccountsAPI;
