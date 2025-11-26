import { clientesAPI } from './client';

export const customersAPI = {
  // Get all customers (admin/sales)
  getAllCustomers: async (params) => {
    const response = await clientesAPI.get('/api/v1/clientes', { params });
    return response.data;
  },

  // Get customer by ID
  getCustomerById: async (id) => {
    const response = await clientesAPI.get(`/api/v1/clientes/${id}`);
    return response.data;
  },

  // Get customer by username (usuario field)
  getCustomerByUsername: async (username) => {
    const response = await clientesAPI.get(`/api/v1/clientes/usuario/${username}`);
    return response.data;
  },

  // Create customer (linked to viewer user)
  // Requires: nombres, apellidos, email, usuario (username)
  // Optional: whatsapp
  createCustomer: async (customerData) => {
    const response = await clientesAPI.post('/api/v1/clientes/nuevo-cliente', {
      nombres: customerData.nombres,
      apellidos: customerData.apellidos,
      email: customerData.email,
      whatsapp: customerData.whatsapp || '',
      usuario: customerData.usuario, // Must be existing viewer username
    });
    return response.data;
  },

  // Update customer (only email and whatsapp can be edited)
  updateCustomer: async (id, customerData) => {
    const response = await clientesAPI.put(`/api/v1/clientes/${id}`, {
      email: customerData.email,
      whatsapp: customerData.whatsapp,
    });
    return response.data;
  },

  // Delete customer
  deleteCustomer: async (id) => {
    const response = await clientesAPI.delete(`/api/v1/clientes/${id}`);
    return response.data;
  },
};

export default customersAPI;
