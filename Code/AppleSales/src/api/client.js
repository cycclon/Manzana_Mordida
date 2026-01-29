import axios from 'axios';
import Cookies from 'js-cookie';
import { STORAGE_KEYS, ERROR_MESSAGES } from '../constants';

// Create separate axios instances for each microservice
const createApiClient = (baseURL) => {
  //console.log(baseURL);
  const client = axios.create({
    baseURL,
    headers: {
      'Content-Type': 'application/json',
    },
    withCredentials: true, // Important for cookies
  });

  // Request interceptor - add JWT token to requests
  client.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  // Response interceptor - handle token refresh
  client.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;

      // If error is 401 and we haven't tried to refresh yet
      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;

        try {
          // Try to refresh the token
          const refreshToken = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN) ||
                              Cookies.get('refreshToken');

          if (!refreshToken) {
            throw new Error('No refresh token available');
          }

          const response = await axios.post(
            '/api/seguridad/auth/refresh',
            { refreshToken },
            { withCredentials: true }
          );

          const { accessToken, refreshToken: newRefreshToken } = response.data;

          // Store new tokens
          localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken);
          if (newRefreshToken) {
            localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, newRefreshToken);
          }

          // Update the original request with new token
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;

          // Retry the original request
          return client(originalRequest);
        } catch (refreshError) {
          // Refresh failed - clear auth and redirect to login
          localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
          localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
          localStorage.removeItem(STORAGE_KEYS.USER);
          localStorage.removeItem('auth-storage'); // Clear Zustand persisted state
          Cookies.remove('refreshToken');

          // Redirect to login page
          if (window.location.pathname !== '/login') {
            window.location.href = '/login';
          }

          return Promise.reject(refreshError);
        }
      }

      return Promise.reject(error);
    }
  );

  return client;
};

// Create API clients for each microservice
export const seguridadAPI = createApiClient(import.meta.env.VITE_API_SEGURIDAD);
export const productosAPI = createApiClient(import.meta.env.VITE_API_PRODUCTOS);
export const baseAPI = createApiClient(''); // Base API client for direct path calls (equipos, colores)
export const clientesAPI = createApiClient(import.meta.env.VITE_API_CLIENTES);
export const agendaAPI = createApiClient(import.meta.env.VITE_API_AGENDA);
export const sucursalesAPI = createApiClient(import.meta.env.VITE_API_SUCURSALES);
export const canjesAPI = createApiClient(import.meta.env.VITE_API_CANJES);
export const reservasAPI = createApiClient(import.meta.env.VITE_API_RESERVAS);
export const cuentasAPI = createApiClient(import.meta.env.VITE_API_CUENTAS_BANCARIAS);
export const crmAPIClient = createApiClient(import.meta.env.VITE_API_CRM);

// Generic error handler
export const handleApiError = (error) => {
  if (error.response) {
    // Server responded with error status
    const status = error.response.status;
    const message = error.response.data?.message || error.response.data?.error;

    switch (status) {
      case 400:
        return message || ERROR_MESSAGES.VALIDATION_ERROR;
      case 401:
        return ERROR_MESSAGES.UNAUTHORIZED;
      case 403:
        return ERROR_MESSAGES.UNAUTHORIZED;
      case 404:
        return message || ERROR_MESSAGES.NOT_FOUND;
      case 500:
        return ERROR_MESSAGES.SERVER_ERROR;
      default:
        return message || ERROR_MESSAGES.SERVER_ERROR;
    }
  } else if (error.request) {
    // Request was made but no response received
    return ERROR_MESSAGES.NETWORK_ERROR;
  } else {
    // Something else happened
    return error.message || ERROR_MESSAGES.SERVER_ERROR;
  }
};

// Utility function to create FormData for file uploads
export const createFormData = (data) => {
  const formData = new FormData();

  Object.keys(data).forEach(key => {
    const value = data[key];

    if (value instanceof File || value instanceof Blob) {
      formData.append(key, value);
    } else if (Array.isArray(value)) {
      value.forEach((item, index) => {
        if (item instanceof File || item instanceof Blob) {
          formData.append(key, item);
        } else {
          formData.append(`${key}[${index}]`, JSON.stringify(item));
        }
      });
    } else if (typeof value === 'object' && value !== null) {
      formData.append(key, JSON.stringify(value));
    } else {
      formData.append(key, value);
    }
  });

  return formData;
};

export default {
  seguridad: seguridadAPI,
  productos: productosAPI,
  clientes: clientesAPI,
  agenda: agendaAPI,
  sucursales: sucursalesAPI,
  canjes: canjesAPI,
  reservas: reservasAPI,
  cuentas: cuentasAPI,
  crm: crmAPIClient,
};
