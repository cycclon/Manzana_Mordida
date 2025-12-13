import { baseAPI } from './client';

// API paths for msProductos microservice
const COLORS_PATH = '/api/colores';
const PRODUCTS_PATH = '/api/productos';
const DEVICES_PATH = '/api/equipos';

export const productsAPI = {
  // Colors
  getAllColors: async () => {
    const response = await baseAPI.get(COLORS_PATH);
    return response.data;
  },

  getColorById: async (id) => {
    const response = await baseAPI.get(`${COLORS_PATH}/${id}`);
    return response.data;
  },

  createColor: async (colorData) => {
    const response = await baseAPI.post(COLORS_PATH, colorData);
    return response.data;
  },

  updateColor: async (id, colorData) => {
    const response = await baseAPI.put(`${COLORS_PATH}/${id}`, colorData);
    return response.data;
  },

  deleteColor: async (id) => {
    const response = await baseAPI.delete(`${COLORS_PATH}/${id}`);
    return response.data;
  },

  // Products (Classes)
  getAllProducts: async (params) => {
    const response = await baseAPI.get(PRODUCTS_PATH, { params });
    return response.data;
  },

  getProductById: async (id) => {
    const response = await baseAPI.get(`${PRODUCTS_PATH}/${id}`);
    return response.data;
  },

  createProduct: async (productData) => {
    const response = await baseAPI.post(`${PRODUCTS_PATH}/crear-producto`, productData);
    return response.data;
  },

  updateProduct: async (id, productData) => {
    const response = await baseAPI.put(`${PRODUCTS_PATH}/producto/${id}`, productData);
    return response.data;
  },

  deleteProduct: async (id) => {
    const response = await baseAPI.delete(`${PRODUCTS_PATH}/${id}`);
    return response.data;
  },

  // Devices (Instances)
  getAllDevices: async (params) => {
    const response = await baseAPI.get(DEVICES_PATH, { params });
    return response.data;
  },

  searchDevices: async (searchParams) => {
    const response = await baseAPI.get(`${DEVICES_PATH}/search`, { params: searchParams });
    return response.data;
  },

  getDeviceById: async (id) => {
    const response = await baseAPI.get(`${DEVICES_PATH}/equipo/${id}`);
    return response.data;
  },

  createDevice: async (deviceData) => {
    const response = await baseAPI.post(`${DEVICES_PATH}/crear-equipo`, deviceData);
    return response.data;
  },

  updateDevice: async (id, deviceData) => {
    const response = await baseAPI.put(`${DEVICES_PATH}/equipo/${id}`, deviceData);
    return response.data;
  },

  deleteDevice: async (id) => {
    const response = await baseAPI.delete(`${DEVICES_PATH}/equipo/${id}`);
    return response.data;
  },

  // Device images
  uploadDeviceImages: async (deviceId, imageFiles) => {
    const formData = new FormData();
    // Append multiple images with the same field name 'imagenes'
    imageFiles.forEach(file => {
      formData.append('imagenes', file);
    });

    const response = await baseAPI.post(
      `${DEVICES_PATH}/equipo/${deviceId}/imagenes`,
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
    const response = await baseAPI.delete(
      `${DEVICES_PATH}/equipo/${deviceId}/imagenes`,
      {
        data: { imageUrl },
      }
    );
    return response.data;
  },

  // Device details (for autocomplete)
  getAllDetalles: async () => {
    const response = await baseAPI.get(`${DEVICES_PATH}/detalles`);
    return response.data;
  },
};

export default productsAPI;
