import axios from 'axios';

// Create an instance of Axios
const api = axios.create({
  baseURL: 'http://localhost:3001',
});

api.interceptors.response.use(
  (response) => response,
  (error) => error.response,
);

export default api;
