/**
 * Debounce function
 */
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

/**
 * Check if date is in the past
 */
export const isPastDate = (date) => {
  const now = new Date();
  const checkDate = typeof date === 'string' ? new Date(date) : date;
  return checkDate < now;
};

/**
 * Check if appointment is at least N hours in advance
 */
export const isMinAdvanceHours = (dateTime, minHours) => {
  const now = new Date();
  const appointmentDate = typeof dateTime === 'string' ? new Date(dateTime) : dateTime;
  const diffMs = appointmentDate - now;
  const diffHours = diffMs / (1000 * 60 * 60);
  return diffHours >= minHours;
};

/**
 * Calculate days remaining
 */
export const getDaysRemaining = (targetDate) => {
  const now = new Date();
  const target = typeof targetDate === 'string' ? new Date(targetDate) : targetDate;
  const diffMs = target - now;
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDays);
};

/**
 * Calculate time remaining in milliseconds
 */
export const getTimeRemaining = (targetDate) => {
  const now = new Date();
  const target = typeof targetDate === 'string' ? new Date(targetDate) : targetDate;
  return Math.max(0, target - now);
};

/**
 * Format countdown timer (HH:MM:SS)
 */
export const formatCountdown = (milliseconds) => {
  const totalSeconds = Math.floor(milliseconds / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};

/**
 * Get device display name
 */
export const getDeviceDisplayName = (device) => {
  if (!device) return '';
  const { model, storage, condition } = device;
  const storageStr = storage >= 1024 ? `${storage / 1024}TB` : `${storage}GB`;
  return `${model} ${storageStr} ${condition}`;
};

/**
 * Get color for battery health
 */
export const getBatteryHealthColor = (percentage) => {
  if (percentage >= 90) return 'success';
  if (percentage >= 80) return 'info';
  if (percentage >= 70) return 'warning';
  return 'error';
};

/**
 * Get color for condition
 */
export const getConditionColor = (condition) => {
  const colors = {
    'A-': 'default',
    'A': 'info',
    'A+': 'success',
    'Sealed': 'primary',
    'OEM': 'secondary',
  };
  return colors[condition] || 'default';
};

/**
 * Parse query string to object
 */
export const parseQueryString = (queryString) => {
  const params = new URLSearchParams(queryString);
  const result = {};
  for (const [key, value] of params.entries()) {
    result[key] = value;
  }
  return result;
};

/**
 * Build query string from object
 */
export const buildQueryString = (params) => {
  const searchParams = new URLSearchParams();
  Object.keys(params).forEach(key => {
    if (params[key] !== null && params[key] !== undefined && params[key] !== '') {
      searchParams.append(key, params[key]);
    }
  });
  return searchParams.toString();
};

/**
 * Download file from blob
 */
export const downloadFile = (blob, filename) => {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

/**
 * Copy text to clipboard
 */
export const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    console.error('Failed to copy text:', err);
    return false;
  }
};

/**
 * Generate slug from text
 */
export const slugify = (text) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-');
};

/**
 * Capitalize first letter
 */
export const capitalize = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

/**
 * Group array by key
 */
export const groupBy = (array, key) => {
  return array.reduce((result, item) => {
    const group = item[key];
    if (!result[group]) {
      result[group] = [];
    }
    result[group].push(item);
    return result;
  }, {});
};

/**
 * Sort array by key
 */
export const sortBy = (array, key, order = 'asc') => {
  return [...array].sort((a, b) => {
    const aVal = a[key];
    const bVal = b[key];

    if (aVal < bVal) return order === 'asc' ? -1 : 1;
    if (aVal > bVal) return order === 'asc' ? 1 : -1;
    return 0;
  });
};

/**
 * Get unique values from array
 */
export const unique = (array) => {
  return [...new Set(array)];
};

/**
 * Check if object is empty
 */
export const isEmpty = (obj) => {
  return Object.keys(obj).length === 0;
};
