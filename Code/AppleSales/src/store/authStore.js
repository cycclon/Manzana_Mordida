import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import Cookies from 'js-cookie';
import { STORAGE_KEYS } from '../constants';
import { authAPI } from '../api/auth';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // Login action
      login: async (credentials) => {
        set({ isLoading: true, error: null });
        try {
          const data = await authAPI.login(credentials);
          const { user, accessToken, refreshToken } = data;

          // Store tokens
          localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken);
          if (refreshToken) {
            localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
            Cookies.set('refreshToken', refreshToken, { expires: 7 }); // 7 days
          }

          // Fetch full user profile after login
          let fullUser = user;
          try {
            const profileData = await authAPI.getProfile();
            fullUser = profileData;
          } catch (profileErr) {
            console.warn('Could not fetch full profile, using basic user data');
          }

          set({
            user: fullUser,
            accessToken,
            refreshToken,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });

          return { success: true, user: fullUser };
        } catch (error) {
          const errorMessage = error.response?.data?.message || 'Error al iniciar sesión';
          set({ isLoading: false, error: errorMessage });
          return { success: false, error: errorMessage };
        }
      },

      // Register action (viewer only)
      register: async (userData) => {
        set({ isLoading: true, error: null });
        try {
          const data = await authAPI.register(userData);
          const { user, accessToken, refreshToken } = data;

          // Store tokens
          localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken);
          if (refreshToken) {
            localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
            Cookies.set('refreshToken', refreshToken, { expires: 7 });
          }

          // Fetch full user profile after registration
          let fullUser = user;
          try {
            const profileData = await authAPI.getProfile();
            fullUser = profileData;
          } catch (profileErr) {
            console.warn('Could not fetch full profile, using basic user data');
          }

          set({
            user: fullUser,
            accessToken,
            refreshToken,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });

          return { success: true, user: fullUser };
        } catch (error) {
          const errorMessage = error.response?.data?.message || 'Error al registrarse';
          set({ isLoading: false, error: errorMessage });
          return { success: false, error: errorMessage };
        }
      },

      // Logout action
      logout: async () => {
        try {
          await authAPI.logout();
        } catch (error) {
          console.error('Error during logout:', error);
        } finally {
          // Clear tokens
          localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
          localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
          localStorage.removeItem(STORAGE_KEYS.USER);
          Cookies.remove('refreshToken');

          set({
            user: null,
            accessToken: null,
            refreshToken: null,
            isAuthenticated: false,
            error: null,
          });
        }
      },

      // Update tokens (used by refresh interceptor)
      updateTokens: (accessToken, refreshToken) => {
        localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken);
        if (refreshToken) {
          localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
          Cookies.set('refreshToken', refreshToken, { expires: 7 });
        }
        set({ accessToken, refreshToken });
      },

      // Update user profile
      updateUser: (userData) => {
        set({ user: { ...get().user, ...userData } });
      },

      // Check if user has role
      hasRole: (role) => {
        const { user } = get();
        return user?.role === role;
      },

      // Check if user has any of the roles
      hasAnyRole: (roles) => {
        const { user } = get();
        return roles.includes(user?.role);
      },

      // Initialize auth from stored data
      initializeAuth: () => {
        const accessToken = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
        const refreshToken = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
        const userStr = localStorage.getItem(STORAGE_KEYS.USER);

        if (accessToken && userStr) {
          try {
            const user = JSON.parse(userStr);
            set({
              user,
              accessToken,
              refreshToken,
              isAuthenticated: true,
            });
          } catch (error) {
            console.error('Error parsing stored user:', error);
            get().logout();
          }
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
