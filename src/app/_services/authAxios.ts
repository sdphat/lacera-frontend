import axios from 'axios';

// Create an instance of Axios
const api = axios.create({
  baseURL: 'http://localhost:3001',
});

// Function to refresh the access token using the refresh token
async function refreshAccessToken(refreshToken: string) {
  try {
    const response = await axios.post('http://localhost:3001/auth/refresh', {
      refresh_token: refreshToken,
    });
    const { access_token } = response.data;
    return access_token;
  } catch (error) {
    // Handle token refresh error, e.g., redirect to login page
    throw error;
  }
}

// Intercept requests and attach the access token to the Authorization header
api.interceptors.request.use(
  (config) => {
    const accessToken = localStorage.getItem('access_token');
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
      const refreshToken = localStorage.getItem('refresh_token');
      if (refreshToken) {
        try {
          const accessToken = await refreshAccessToken(refreshToken);
          localStorage.setItem('access_token', accessToken);
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
