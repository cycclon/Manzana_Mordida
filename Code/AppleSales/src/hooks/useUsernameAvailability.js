import { useState, useEffect } from 'react';
import { useDebounce } from './useDebounce';
import { authAPI } from '../api/auth';

/**
 * Custom hook to check username availability
 * Debounces the check to avoid excessive API calls
 */
export const useUsernameAvailability = (username, enabled = true) => {
  const [isChecking, setIsChecking] = useState(false);
  const [isAvailable, setIsAvailable] = useState(null);
  const [error, setError] = useState(null);

  // Debounce username input (500ms delay)
  const debouncedUsername = useDebounce(username, 500);

  useEffect(() => {
    // Reset state if username is too short
    if (!debouncedUsername || debouncedUsername.length < 4) {
      setIsAvailable(null);
      setIsChecking(false);
      setError(null);
      return;
    }

    // Skip check if disabled
    if (!enabled) {
      return;
    }

    // Check username availability
    const checkAvailability = async () => {
      setIsChecking(true);
      setError(null);

      try {
        const response = await authAPI.checkViewerExists(debouncedUsername);

        // Backend returns { exists: true/false }
        // If exists = true, username is NOT available
        // If exists = false, username IS available
        setIsAvailable(!response.exists);
      } catch (err) {
        console.error('Error checking username:', err);
        setError('Error al verificar disponibilidad');
        setIsAvailable(null);
      } finally {
        setIsChecking(false);
      }
    };

    checkAvailability();
  }, [debouncedUsername, enabled]);

  return {
    isChecking,
    isAvailable,
    error,
  };
};

export default useUsernameAvailability;
