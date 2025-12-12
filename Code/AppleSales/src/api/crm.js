import { crmAPIClient } from './client';

const API_BASE = '/api/v1/crm';

export const crmAPI = {
  // Get all CRMs with filters and pagination
  getAll: async (params = {}) => {
    const response = await crmAPIClient.get(API_BASE, { params });
    return response.data;
  },

  // Get single CRM by ID
  getById: async (id) => {
    const response = await crmAPIClient.get(`${API_BASE}/${id}`);
    return response.data;
  },

  // Search CRMs by username
  searchByUser: async (usuario) => {
    const response = await crmAPIClient.get(`${API_BASE}/cliente/${usuario}`);
    return response.data;
  },

  // Get CRMs by status
  getByStatus: async (estado) => {
    const response = await crmAPIClient.get(`${API_BASE}/estado/${estado}`);
    return response.data;
  },

  // Create new CRM
  create: async (crmData) => {
    const response = await crmAPIClient.post(API_BASE, crmData);
    return response.data;
  },

  // Update CRM
  update: async (id, crmData) => {
    const response = await crmAPIClient.put(`${API_BASE}/${id}`, crmData);
    return response.data;
  },

  // Change CRM status
  changeStatus: async (id, nuevoEstado, notas = '') => {
    const response = await crmAPIClient.put(
      `${API_BASE}/${id}/estado/${nuevoEstado}`,
      { notas }
    );
    return response.data;
  },

  // Bulk status change
  bulkChangeStatus: async (ids, nuevoEstado, notas = '') => {
    const response = await crmAPIClient.put(`${API_BASE}/estado-multiple`, {
      ids,
      nuevoEstado,
      notas
    });
    return response.data;
  },

  // Toggle requiereHumano flag
  toggleRequiereHumano: async (id, requiereHumano) => {
    const response = await crmAPIClient.put(`${API_BASE}/${id}/requiere-humano`, {
      requiereHumano
    });
    return response.data;
  },

  // Delete CRM
  delete: async (id) => {
    const response = await crmAPIClient.delete(`${API_BASE}/${id}`);
    return response.data;
  },

  // Get statistics
  getStatistics: async (params = {}) => {
    const response = await crmAPIClient.get(`${API_BASE}/estadisticas`, { params });
    return response.data;
  },

  // Get dropdown options (states and social networks)
  getOptions: async () => {
    const response = await crmAPIClient.get(`${API_BASE}/opciones`);
    return response.data;
  }
};

export default crmAPI;
