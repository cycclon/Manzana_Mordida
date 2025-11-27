import { useState, useEffect } from 'react';
import { getTimeRemaining, formatCountdown } from '../utils/helpers';

/**
 * Custom hook for countdown timer
 */
export const useCountdown = (targetDate) => {
  const [timeRemaining, setTimeRemaining] = useState(() =>
    getTimeRemaining(targetDate)
  );
  const [initialDuration, setInitialDuration] = useState(null);

  useEffect(() => {
    if (targetDate && !initialDuration) {
      setInitialDuration(getTimeRemaining(targetDate));
    }
  }, [targetDate, initialDuration]);

  useEffect(() => {
    if (!targetDate) return;

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

  // Calculate progress percentage (100% at start, 0% when expired)
  const progress = initialDuration > 0
    ? Math.max(0, Math.min(100, (timeRemaining / initialDuration) * 100))
    : 0;

  return {
    timeRemaining,
    timeLeft: formatted, // alias for compatibility
    formatted,
    isExpired,
    progress,
  };
};
