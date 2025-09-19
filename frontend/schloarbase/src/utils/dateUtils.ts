import { format, parseISO, isValid } from 'date-fns';

/**
 * Safely formats a date string or Date object
 * Returns a fallback string if the date is invalid
 */
export const formatDate = (
  dateValue: string | Date | null | undefined,
  formatString: string = 'MMM dd, yyyy',
  fallback: string = 'Date not available'
): string => {
  try {
    if (!dateValue) {
      return fallback;
    }

    let date: Date;

    if (typeof dateValue === 'string') {
      // Try to parse ISO string first
      date = parseISO(dateValue);
      
      // If parseISO fails, try with new Date()
      if (!isValid(date)) {
        date = new Date(dateValue);
      }
    } else if (dateValue instanceof Date) {
      date = dateValue;
    } else {
      return fallback;
    }

    // Check if the final date is valid
    if (!isValid(date)) {
      console.warn('Invalid date provided:', dateValue);
      return fallback;
    }

    return format(date, formatString);
  } catch (error) {
    console.error('Date formatting error:', error, 'Original value:', dateValue);
    return fallback;
  }
};

/**
 * Formats a relative time (e.g., "2 hours ago")
 */
export const formatRelativeDate = (
  dateValue: string | Date | null | undefined,
  fallback: string = 'Date not available'
): string => {
  try {
    if (!dateValue) {
      return fallback;
    }

    let date: Date;

    if (typeof dateValue === 'string') {
      date = parseISO(dateValue);
      if (!isValid(date)) {
        date = new Date(dateValue);
      }
    } else if (dateValue instanceof Date) {
      date = dateValue;
    } else {
      return fallback;
    }

    if (!isValid(date)) {
      return fallback;
    }

    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} days ago`;
    
    return formatDate(date, 'MMM dd, yyyy');
  } catch (error) {
    console.error('Relative date formatting error:', error);
    return fallback;
  }
};