import axios from 'axios';
import { getAccessToken, getRefreshToken, setAccessToken } from '../_lib/auth';
import { refreshAccessToken } from './auth.service';

// Create an instance of Axios
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BACKEND_URL,
});

// Intercept requests and attach the access token to the Authorization header
api.interceptors.request.use(
  (config) => {
    const accessToken = getAccessToken();
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Intercept responses and handle token refresh if the response status is 401 (Unauthorized)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = getRefreshToken();
      if (refreshToken) {
        try {
          const accessToken = await refreshAccessToken(refreshToken);
          setAccessToken(accessToken);
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return api(originalRequest);
        } catch (refreshError) {
          // Handle token refresh error, e.g., redirect to login page
          throw refreshError;
        }
      } else {
        // Handle missing refresh token, e.g., redirect to login page
        throw new Error('Refresh token not found');
      }
    }
    return Promise.reject(error);
  },
);

export default api;
