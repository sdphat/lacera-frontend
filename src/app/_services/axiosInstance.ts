import axios from 'axios';

// Create an instance of Axios
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BACKEND_URL,
});

api.interceptors.response.use(
  (response) => response,
  (error) => error.response,
);

export default api;
