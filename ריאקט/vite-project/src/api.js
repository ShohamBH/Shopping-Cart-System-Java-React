import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8080/Admin', // Replace with your API base URL
});

export default api;