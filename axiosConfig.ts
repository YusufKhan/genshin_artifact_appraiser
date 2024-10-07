import axios from 'axios';
import axiosRetry from 'axios-retry';

// Set a longer timeout duration (e.g., 10000ms)
const axiosInstance = axios.create({
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a retry mechanism
axiosRetry(axiosInstance, {
  retries: 3, // Number of retries
  retryDelay: (retryCount) => {
    return retryCount * 1000; // Time between retries (in ms)
  },
  retryCondition: (error) => {
    // Retry on network errors or 5xx status codes
    return axiosRetry.isNetworkOrIdempotentRequestError(error) || (error.response && error.response.status >= 500) || false;
  },
});

export default axiosInstance;
