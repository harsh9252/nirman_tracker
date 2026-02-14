// Date utility functions to handle consistent date formatting across the application

/**
 * Parse various date formats and return a consistent Date object
 * Handles: ISO strings, MySQL datetime, and date-only strings
 * Now also handles locale-formatted dates like MM/DD/YYYY
 */
export const parseDate = (dateString) => {
  if (!dateString) return null;

  // If it's already a Date object, return as is
  if (dateString instanceof Date) return dateString;

  // Handle different date formats
  let date;

  // If it contains 'T', it's likely ISO format
  if (dateString.includes('T')) {
    date = new Date(dateString);
  }
  // If it's in YYYY-MM-DD format (from HTML date inputs)
  else if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
    // Create date in local timezone to avoid timezone shifting
    const [year, month, day] = dateString.split('-').map(Number);
    date = new Date(year, month - 1, day);
  }
  // Always treat DD/MM/YYYY → convert to YYYY-MM-DD
  else if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(dateString)) {
    const [day, month, year] = dateString.split('/').map(Number);
    date = new Date(year, month - 1, day);
  }
  // If it contains spaces (likely MySQL datetime format)
  else if (dateString.includes(' ')) {
    // Parse MySQL datetime format: YYYY-MM-DD HH:MM:SS
    const [datePart, timePart] = dateString.split(' ');
    const [year, month, day] = datePart.split('-').map(Number);
    date = new Date(year, month - 1, day);
  }
  // Try to parse as regular date string
  else {
    date = new Date(dateString);
  }

  // Check if date is valid
  if (isNaN(date.getTime())) {
    console.warn('Invalid date string:', dateString);
    return null;
  }

  return date;
};

/**
 * Format date for display in UI (DD-MM-YYYY format)
 * Avoids timezone shifting by using local date components
 */
export const formatDateForDisplay = (dateString) => {
  if (!dateString) return '';
  
  const date = parseDate(dateString);
  if (!date) return '';
  
  // Use local date components to avoid timezone issues
  const day = String(date.getDate()).padStart(2, '0');
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const month = monthNames[date.getMonth()];
  const year = String(date.getFullYear()).slice(-2);
  
  return `${day}-${month}-${year}`;
};

/**
 * Format date for HTML date input (YYYY-MM-DD format)
 * Ensures edit forms show correct dates
 */
export const formatDateForInput = (dateString) => {
  if (!dateString) return '';
  
  const date = parseDate(dateString);
  if (!date) return '';
  
  // Use local date components to avoid timezone shifting
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
};

/**
 * Format date for database storage (ISO format)
 */
export const formatDateForDatabase = (dateString) => {
  if (!dateString) return null;
  
  const date = parseDate(dateString);
  if (!date) return null;
  
  // Return ISO string for database storage
  return date.toISOString();
};

/**
 * Get current date in YYYY-MM-DD format for default values
 */
export const getCurrentDateForInput = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Validate if date string is valid
 */
export const isValidDate = (dateString) => {
  return parseDate(dateString) !== null;
};

/**
 * Check if date is in the past (excluding today)
 */
export const isDateInPast = (dateString) => {
  const date = parseDate(dateString);
  if (!date) return false;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const compareDate = new Date(date);
  compareDate.setHours(0, 0, 0, 0);

  return compareDate < today;
};

/**
 * Parse display date format (DD-MMM-YY) back to YYYY-MM-DD
 * Used for converting user input in date fields back to standard format
 */
export const parseDisplayDate = (displayString) => {
  if (!displayString || typeof displayString !== 'string') return '';

  const parts = displayString.split('-');
  if (parts.length !== 3) return '';

  const [dayStr, monthStr, yearShort] = parts;

  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const month = monthNames.indexOf(monthStr);

  if (month === -1) return '';

  const day = parseInt(dayStr);
  const year = 2000 + parseInt(yearShort);

  if (isNaN(day) || isNaN(year)) return '';

  const date = new Date(year, month, day);
  return formatDateForInput(date);
};
