import { baseAPI } from './client';

const CRM_PATH = '/api/v1/crm';

export const crmAPI = {
  // Get all CRMs with filters and pagination
  getAll: async (params = {}) => {
    const response = await baseAPI.get(CRM_PATH, { params });
    return response.data;
  },

  // Get single CRM by ID
  getById: async (id) => {
    const response = await baseAPI.get(`${CRM_PATH}/${id}`);
    return response.data;
  },

  // Search CRMs by username
  searchByUser: async (usuario) => {
    const response = await baseAPI.get(`${CRM_PATH}/cliente/${usuario}`);
    return response.data;
  },

  // Get CRMs by status
  getByStatus: async (estado) => {
    const response = await baseAPI.get(`${CRM_PATH}/estado/${estado}`);
    return response.data;
  },

  // Create new CRM
  create: async (crmData) => {
    const response = await baseAPI.post(CRM_PATH, crmData);
    return response.data;
  },

  // Update CRM
  update: async (id, crmData) => {
    const response = await baseAPI.put(`${CRM_PATH}/${id}`, crmData);
    return response.data;
  },

  // Change CRM status
  changeStatus: async (id, nuevoEstado, notas = '') => {
    const response = await baseAPI.put(
      `${CRM_PATH}/${id}/estado/${nuevoEstado}`,
      { notas }
    );
    return response.data;
  },

  // Bulk status change
  bulkChangeStatus: async (ids, nuevoEstado, notas = '') => {
    const response = await baseAPI.put(`${CRM_PATH}/estado-multiple`, {
      ids,
      nuevoEstado,
      notas
    });
    return response.data;
  },

  // Toggle requiereHumano flag
  toggleRequiereHumano: async (id, requiereHumano) => {
    const response = await baseAPI.put(`${CRM_PATH}/${id}/requiere-humano`, {
      requiereHumano
    });
    return response.data;
  },

  // Delete CRM
  delete: async (id) => {
    const response = await baseAPI.delete(`${CRM_PATH}/${id}`);
    return response.data;
  },

  // Get statistics
  getStatistics: async (params = {}) => {
    const response = await baseAPI.get(`${CRM_PATH}/estadisticas`, { params });
    return response.data;
  },

  // Get dropdown options (states and social networks)
  getOptions: async () => {
    const response = await baseAPI.get(`${CRM_PATH}/opciones`);
    return response.data;
  }
};

export default crmAPI;
