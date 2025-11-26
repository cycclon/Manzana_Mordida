import { useState, useEffect } from 'react';
import { getTimeRemaining, formatCountdown } from '../utils/helpers';

/**
 * Custom hook for countdown timer
 */
export const useCountdown = (targetDate) => {
  const [timeRemaining, setTimeRemaining] = useState(() =>
    getTimeRemaining(targetDate)
  );

  useEffect(() => {
    const interval = setInterval(() => {
      const remaining = getTimeRemaining(targetDate);
      setTimeRemaining(remaining);

      if (remaining <= 0) {
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [targetDate]);

  const isExpired = timeRemaining <= 0;
  const formatted = formatCountdown(timeRemaining);

  return {
    timeRemaining,
    formatted,
    isExpired,
  };
};
