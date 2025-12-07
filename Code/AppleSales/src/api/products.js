import { productosAPI } from './client';
import { API_PATHS } from '../constants';

export const productsAPI = {
  // Colors
  getAllColors: async () => {
    const response = await productosAPI.get(API_PATHS.COLORS);
    return response.data;
  },

  getColorById: async (id) => {
    const response = await productosAPI.get(`${API_PATHS.COLORS}/${id}`);
    return response.data;
  },

  createColor: async (colorData) => {
    const response = await productosAPI.post(API_PATHS.COLORS, colorData);
    return response.data;
  },

  updateColor: async (id, colorData) => {
    const response = await productosAPI.put(`${API_PATHS.COLORS}/${id}`, colorData);
    return response.data;
  },

  deleteColor: async (id) => {
    const response = await productosAPI.delete(`${API_PATHS.COLORS}/${id}`);
    return response.data;
  },

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
    console.log(productData);    
    const response = await productosAPI.post(`${API_PATHS.PRODUCTS}/crear-producto`, productData);
    return response.data;
  },

  updateProduct: async (id, productData) => {
    const response = await productosAPI.put(`/api/productos/producto/${id}`, productData);
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
    console.log(deviceData);
    const response = await productosAPI.post(`${API_PATHS.DEVICES}/crear-equipo`, deviceData);
    return response.data;
  },

  updateDevice: async (id, deviceData) => {
    const response = await productosAPI.put(`/api/equipos/equipo/${id}`, deviceData);
    return response.data;
  },

  deleteDevice: async (id) => {
    const response = await productosAPI.delete(`/api/equipos/equipo/${id}`);
    return response.data;
  },

  // Device images
  uploadDeviceImages: async (deviceId, imageFiles) => {
    const formData = new FormData();
    // Append multiple images with the same field name 'imagenes'
    imageFiles.forEach(file => {
      formData.append('imagenes', file);
    });

    const response = await productosAPI.post(
      `/api/equipos/equipo/${deviceId}/imagenes`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  },

  deleteDeviceImage: async (deviceId, imageUrl) => {
    const response = await productosAPI.delete(
      `/api/equipos/equipo/${deviceId}/imagenes`,
      {
        data: { imageUrl },
      }
    );
    return response.data;
  },

  // Device details (for autocomplete)
  getAllDetalles: async () => {
    const response = await productosAPI.get('/api/equipos/detalles');
    return response.data;
  },
};

export default productsAPI;
