import { seguridadAPI } from './client';

export const usersAPI = {
  // Get all users (admin only)
  getAllUsers: async () => {
    const response = await seguridadAPI.get('/users/');
    return response.data;
  },

  // Register staff (admin or sales) - admin only
  registerStaff: async (userData) => {
    const response = await seguridadAPI.post('/users/register-staff', userData);
    return response.data;
  },

  // Check if username exists
  checkUsernameExists: async (username) => {
    const response = await seguridadAPI.post('/users/viewer-exists', { username });
    return response.data;
  },
};

export default usersAPI;
