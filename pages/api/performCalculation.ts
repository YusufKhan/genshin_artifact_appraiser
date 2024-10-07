//import axiosInstance from '../axiosConfig';
import { AxiosError } from 'axios';
import axios from 'axios';
import axiosRetry from 'axios-retry';

const axiosInstance = axios.create({
  //baseURL: 'http://your-api-base-url.com', // Replace with your API base URL
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

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

type Teams = {
    [key: string]: number[];
  };

async function performCalculation(uid: string, teams: Teams) {
    try {
      const response = await axiosInstance.post('/api/calculate', { uid, teams });
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        if (error.response) {
          console.error('Error performing calculation:', error.response.status, error.response.data);
        } else {
          console.error('Error performing calculation:', error.message);
        }
      } else {
        console.error('Unexpected error:', error);
      }
      throw error;
    }
  }
  
  export default performCalculation;
