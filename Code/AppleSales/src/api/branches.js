import { baseAPI } from './client';

const BRANCHES_PATH = '/api/v1/sucursales';

export const branchesAPI = {
  // Get all branches
  getAllBranches: async (params) => {
    const response = await baseAPI.get(BRANCHES_PATH, { params });
    return response.data;
  },

  // Get branch by ID
  getBranchById: async (id) => {
    const response = await baseAPI.get(`${BRANCHES_PATH}/${id}`);
    return response.data;
  },

  // Get branches by province and locality
  getBranchesByLocation: async (provincia, localidad) => {
    const response = await baseAPI.get(`${BRANCHES_PATH}/provincia/${provincia}-${localidad}`);
    return response.data;
  },

  // Create branch (admin)
  createBranch: async (branchData) => {
    const response = await baseAPI.post(`${BRANCHES_PATH}/nueva-sucursal`, branchData);
    return response.data;
  },

  // Update branch (admin)
  updateBranch: async (id, branchData) => {
    const response = await baseAPI.patch(`${BRANCHES_PATH}/${id}`, branchData);
    return response.data;
  },

  // Delete branch (admin)
  deleteBranch: async (id) => {
    const response = await baseAPI.delete(`${BRANCHES_PATH}/${id}`);
    return response.data;
  },
};

export default branchesAPI;
