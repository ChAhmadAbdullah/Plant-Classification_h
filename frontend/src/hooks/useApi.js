import { useState, useCallback } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../utils/constants';

export const useApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const request = useCallback(async (config) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios({
        ...config,
        baseURL: API_BASE_URL,
        headers: {
          'Content-Type': 'application/json',
          ...config.headers
        }
      });
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'An error occurred';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { request, loading, error, setError };
};

