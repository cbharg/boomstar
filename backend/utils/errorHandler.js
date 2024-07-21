 // utils/errorHandler.js

/**
 * Creates a standardized error object
 * @param {string} message - The error message
 * @param {Error} [error] - The original error object (optional)
 * @returns {Object} Standardized error object
 */
const createErrorObject = (message, error = null) => {
    const errorObject = {
      message,
      timestamp: new Date().toISOString(),
    };
  
    if (error && process.env.NODE_ENV === 'development') {
      errorObject.stack = error.stack;
      errorObject.details = error.message;
    }
  
    return errorObject;
  };
  
  module.exports = { createErrorObject };
