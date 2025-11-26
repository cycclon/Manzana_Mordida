import { useAuthStore } from '../store/authStore';
import { USER_ROLES } from '../constants';

/**
 * Custom hook for authentication
 */
export const useAuth = () => {
  const {
    user,
    isAuthenticated,
    isLoading,
    error,
    login,
    register,
    logout,
    updateUser,
    hasRole,
    hasAnyRole,
  } = useAuthStore();

  const isViewer = hasRole(USER_ROLES.VIEWER);
  const isSales = hasRole(USER_ROLES.SALES);
  const isAdmin = hasRole(USER_ROLES.ADMIN);
  const isStaff = hasAnyRole([USER_ROLES.SALES, USER_ROLES.ADMIN]);

  return {
    user,
    isAuthenticated,
    isLoading,
    error,
    login,
    register,
    logout,
    updateUser,
    hasRole,
    hasAnyRole,
    isViewer,
    isSales,
    isAdmin,
    isStaff,
  };
};
