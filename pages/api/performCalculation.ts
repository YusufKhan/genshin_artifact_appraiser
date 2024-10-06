import axiosInstance from '../../axiosConfig';
import { AxiosError } from 'axios';

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
