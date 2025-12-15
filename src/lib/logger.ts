/**
 * Logger Utility
 * 
 * Provides a centralized logging system that:
 * - Disables logs in production
 * - Allows different log levels
 * - Maintains error logging always active
 */

const isDevelopment = process.env.NODE_ENV === 'development';
const isProduction = process.env.NODE_ENV === 'production';

export const logger = {
  /**
   * Log informational messages (only in development)
   */
  log: (...args: any[]) => {
    if (isDevelopment) {
      console.log(...args);
    }
  },

  /**
   * Log errors (always active, even in production)
   */
  error: (...args: any[]) => {
    console.error(...args);
  },

  /**
   * Log warnings (only in development)
   */
  warn: (...args: any[]) => {
    if (isDevelopment) {
      console.warn(...args);
    }
  },

  /**
   * Log debug messages (only in development)
   */
  debug: (...args: any[]) => {
    if (isDevelopment) {
      console.debug(...args);
    }
  },

  /**
   * Log info messages (only in development)
   */
  info: (...args: any[]) => {
    if (isDevelopment) {
      console.info(...args);
    }
  },

  /**
   * Log with emoji prefix (for better visual distinction)
   * Only in development
   */
  emoji: (emoji: string, ...args: any[]) => {
    if (isDevelopment) {
      console.log(emoji, ...args);
    }
  },
};

// Export default for convenience
export default logger;
