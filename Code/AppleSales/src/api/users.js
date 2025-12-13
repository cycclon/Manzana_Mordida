import { baseAPI } from './client';

const USERS_PATH = '/api/seguridad/users';

export const usersAPI = {
  // Get all users (admin only)
  getAllUsers: async () => {
    const response = await baseAPI.get(`${USERS_PATH}/`);
    return response.data;
  },

  // Register staff (admin or sales) - admin only
  registerStaff: async (userData) => {
    const response = await baseAPI.post(`${USERS_PATH}/register-staff`, userData);
    return response.data;
  },

  // Check if username exists
  checkUsernameExists: async (username) => {
    const response = await baseAPI.post(`${USERS_PATH}/viewer-exists`, { username });
    return response.data;
  },
};

export default usersAPI;
