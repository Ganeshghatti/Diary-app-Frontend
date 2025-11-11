import axios from "axios";
import { API_BASE_URL } from "../constants/api";

// Create axios instance with base URL
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000, // 10 seconds timeout
});

// Request interceptor (optional - for adding auth tokens later)
api.interceptors.request.use(
  (config) => {
    // You can add auth token here later
    // const token = await AsyncStorage.getItem('authToken');
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor (optional - for handling errors globally)
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Silently handle errors - let individual services handle error logging if needed
    return Promise.reject(error);
  }
);

export default api;
