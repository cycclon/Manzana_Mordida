import { productosAPI } from './client';
import { API_PATHS } from '../constants';

export const productsAPI = {
  // Products (Classes)
  getAllProducts: async (params) => {
    const response = await productosAPI.get(API_PATHS.PRODUCTS, { params });
    return response.data;
  },

  getProductById: async (id) => {
    const response = await productosAPI.get(`${API_PATHS.PRODUCTS}/${id}`);
    return response.data;
  },

  createProduct: async (productData) => {
    const response = await productosAPI.post(API_PATHS.PRODUCTS, productData);
    return response.data;
  },

  updateProduct: async (id, productData) => {
    const response = await productosAPI.put(`${API_PATHS.PRODUCTS}/${id}`, productData);
    return response.data;
  },

  deleteProduct: async (id) => {
    const response = await productosAPI.delete(`${API_PATHS.PRODUCTS}/${id}`);
    return response.data;
  },

  // Devices (Instances)
  getAllDevices: async (params) => {
    const response = await productosAPI.get(API_PATHS.DEVICES, { params });
    return response.data;
  },

  searchDevices: async (searchParams) => {
    const response = await productosAPI.get(`${API_PATHS.DEVICES}/search`, { params: searchParams });
    return response.data;
  },

  getDeviceById: async (id) => {
    const response = await productosAPI.get(`${API_PATHS.DEVICES}/equipo/${id}`);
    return response.data;
  },

  createDevice: async (deviceData) => {
    const response = await productosAPI.post(API_PATHS.DEVICES, deviceData);
    return response.data;
  },

  updateDevice: async (id, deviceData) => {
    const response = await productosAPI.put(`${API_PATHS.DEVICES}/${id}`, deviceData);
    return response.data;
  },

  deleteDevice: async (id) => {
    const response = await productosAPI.delete(`${API_PATHS.DEVICES}/${id}`);
    return response.data;
  },

  // Device images
  uploadDeviceImage: async (deviceId, imageFile) => {
    const formData = new FormData();
    formData.append('image', imageFile);
    const response = await productosAPI.post(
      `${API_PATHS.DEVICES}/${deviceId}/images`,
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
      }
    );
    return response.data;
  },

  deleteDeviceImage: async (deviceId, imageId) => {
    const response = await productosAPI.delete(`${API_PATHS.DEVICES}/${deviceId}/images/${imageId}`);
    return response.data;
  },
};

export default productsAPI;
