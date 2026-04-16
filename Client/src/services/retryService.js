/**
 * Network Retry Service
 * 
 * Provides automatic retry logic with exponential backoff
 * for failed network requests in the public interview system.
 * 
 * FEATURES:
 * - Exponential backoff (100ms, 200ms, 400ms)
 * - Configurable max retries
 * - Only retries on network errors (not 4xx/5xx API errors)
 * - Preserves original error on final failure
 * - Progress tracking for UI feedback
 */

/**
 * Retry a function with exponential backoff
 * 
 * @param {Function} fn - Async function to retry
 * @param {Object} options - Configuration options
 * @param {number} options.maxRetries - Maximum retry attempts (default: 3)
 * @param {number} options.initialDelay - Initial delay in ms (default: 100)
 * @param {Function} options.onRetry - Callback when retrying (receives attempt, delay)
 * @returns {Promise} - Result of successful execution
 * @throws {Error} - Original error if all retries fail
 * 
 * @example
 * const result = await retryWithBackoff(
 *   () => submitInterview(data),
 *   {
 *     maxRetries: 3,
 *     initialDelay: 100,
 *     onRetry: (attempt, delay) => {
 *       console.log(`Retrying attempt ${attempt}, waiting ${delay}ms`);
 *     }
 *   }
 * );
 */
export const retryWithBackoff = async (fn, options = {}) => {
  const {
    maxRetries = 3,
    initialDelay = 100,
    onRetry = null,
  } = options;

  let lastError;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      // Don't retry if it's an API error (4xx/5xx), only network errors
      if (error.response && error.response.status) {
        // This is a server response, don't retry
        throw error;
      }

      // Check if there are more retries
      if (attempt < maxRetries - 1) {
        const delay = initialDelay * Math.pow(2, attempt);

        // Call retry callback if provided
        if (onRetry) {
          onRetry(attempt + 1, delay);
        }

        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  // All retries exhausted
  throw lastError;
};

/**
 * Retry submission with progress tracking
 * 
 * Specialized version for interview submission
 * that provides detailed progress feedback to the UI.
 * 
 * @param {Function} submitFn - Function that submits the interview
 * @param {Function} onProgress - Callback (message, isRetrying)
 * @returns {Promise} - Result of submission
 * @throws {Error} - If submission fails after retries
 */
export const retryInterviewSubmission = async (submitFn, onProgress = null) => {
  const retryAttempts = [];

  return retryWithBackoff(submitFn, {
    maxRetries: 3,
    initialDelay: 100,
    onRetry: (attempt, delay) => {
      retryAttempts.push({ attempt, timestamp: Date.now() });

      if (onProgress) {
        onProgress(
          `Connection issue. Retrying... (Attempt ${attempt}/3)`,
          true
        );
      }
    },
  });
};

/**
 * Check if error is a network error (should retry)
 * 
 * @param {Error} error - Error to check
 * @returns {boolean} - True if should retry
 */
export const isRetryableError = (error) => {
  // Network errors (no response from server)
  if (!error.response) {
    return true;
  }

  // Timeout errors
  if (error.code === 'ECONNABORTED') {
    return true;
  }

  // 5xx errors can be retried
  if (error.response?.status >= 500) {
    return true;
  }

  // 4xx errors should not be retried
  return false;
};

/**
 * Create a fetch request with automatic retry
 * 
 * Wraps the native fetch API with automatic retry logic
 * for the public interview system.
 * 
 * @param {string} url - URL to fetch
 * @param {Object} options - Fetch options
 * @param {Object} retryOptions - Retry configuration
 * @returns {Promise} - Fetch response
 */
export const fetchWithRetry = async (url, options = {}, retryOptions = {}) => {
  return retryWithBackoff(
    async () => {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      if (!response.ok) {
        const error = new Error(`HTTP ${response.status}`);
        error.response = { status: response.status };
        throw error;
      }

      return response;
    },
    {
      maxRetries: retryOptions.maxRetries || 3,
      initialDelay: retryOptions.initialDelay || 100,
      onRetry: retryOptions.onRetry,
    }
  );
};

export default {
  retryWithBackoff,
  retryInterviewSubmission,
  isRetryableError,
  fetchWithRetry,
};
