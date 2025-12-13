import { baseAPI } from './client';

const AUTH_PATH = '/api/seguridad/auth';
const USERS_PATH = '/api/seguridad/users';

export const authAPI = {
  // Login with username and password
  login: async (credentials) => {
    const response = await baseAPI.post(`${AUTH_PATH}/login`, credentials);
    return response.data;
  },

  // Register viewer user (public registration)
  register: async (userData) => {
    const response = await baseAPI.post(`${USERS_PATH}/register`, {
      username: userData.username,
      password: userData.password,
      // role is automatically set to 'viewer' by backend
    });
    return response.data;
  },

  // Register staff user (admin only - sales or admin role)
  registerStaff: async (userData) => {
    const response = await baseAPI.post(`${USERS_PATH}/register-staff`, {
      username: userData.username,
      password: userData.password,
      role: userData.role, // 'sales' or 'admin'
    });
    return response.data;
  },

  // Check if viewer username exists
  checkViewerExists: async (username) => {
    const response = await baseAPI.post(`${USERS_PATH}/viewer-exists`, { username });
    return response.data;
  },

  // Refresh token
  refresh: async (refreshToken) => {
    const response = await baseAPI.post(`${AUTH_PATH}/refresh`, { refreshToken });
    return response.data;
  },

  // Logout
  logout: async () => {
    const response = await baseAPI.post(`${AUTH_PATH}/logout`);
    return response.data;
  },

  // Get current user profile
  getProfile: async () => {
    const response = await baseAPI.get(`${USERS_PATH}/profile`);
    return response.data;
  },

  // Change password
  changePassword: async (passwords) => {
    const response = await baseAPI.put(`${USERS_PATH}/change-password`, passwords);
    return response.data;
  },
};

export default authAPI;
