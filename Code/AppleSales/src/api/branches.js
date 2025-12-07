import { sucursalesAPI } from './client';

export const branchesAPI = {
  // Get all branches
  getAllBranches: async (params) => {
    const response = await sucursalesAPI.get('/api/v1/sucursales', { params });
    return response.data;
  },

  // Get branch by ID
  getBranchById: async (id) => {
    const response = await sucursalesAPI.get(`/api/v1/sucursales/${id}`);
    return response.data;
  },

  // Get branches by province and locality
  getBranchesByLocation: async (provincia, localidad) => {
    const response = await sucursalesAPI.get(`/api/v1/sucursales/provincia/${provincia}-${localidad}`);
    return response.data;
  },

  // Create branch (admin)
  createBranch: async (branchData) => {
    const response = await sucursalesAPI.post('/api/v1/sucursales/nueva-sucursal', branchData);
    return response.data;
  },

  // Update branch (admin)
  updateBranch: async (id, branchData) => {
    const response = await sucursalesAPI.patch(`/api/v1/sucursales/${id}`, branchData);
    return response.data;
  },

  // Delete branch (admin)
  deleteBranch: async (id) => {
    const response = await sucursalesAPI.delete(`/api/v1/sucursales/${id}`);
    return response.data;
  },
};

export default branchesAPI;
