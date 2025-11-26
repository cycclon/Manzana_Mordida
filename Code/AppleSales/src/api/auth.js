import { seguridadAPI } from './client';

export const authAPI = {
  // Login with username and password
  login: async (credentials) => {
    const response = await seguridadAPI.post('/auth/login', credentials);
    return response.data;
  },

  // Register viewer user (public registration)
  register: async (userData) => {
    const response = await seguridadAPI.post('/users/register', {
      username: userData.username,
      password: userData.password,
      // role is automatically set to 'viewer' by backend
    });
    return response.data;
  },

  // Register staff user (admin only - sales or admin role)
  registerStaff: async (userData) => {
    const response = await seguridadAPI.post('/users/register-staff', {
      username: userData.username,
      password: userData.password,
      role: userData.role, // 'sales' or 'admin'
    });
    return response.data;
  },

  // Check if viewer username exists
  checkViewerExists: async (username) => {
    const response = await seguridadAPI.post('/users/viewer-exists', { username });
    return response.data;
  },

  // Refresh token
  refresh: async (refreshToken) => {
    const response = await seguridadAPI.post('/auth/refresh', { refreshToken });
    return response.data;
  },

  // Logout
  logout: async () => {
    const response = await seguridadAPI.post('/auth/logout');
    return response.data;
  },

  // Get current user profile
  getProfile: async () => {
    const response = await seguridadAPI.get('/users/profile');
    return response.data;
  },

  // Change password
  changePassword: async (passwords) => {
    const response = await seguridadAPI.put('/users/change-password', passwords);
    return response.data;
  },
};

export default authAPI;
