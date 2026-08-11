import axios from "axios";
import { toast } from "react-hot-toast";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Automatically attach Authorization token if present in localStorage
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    if (config.data instanceof FormData) {
      delete config.headers["Content-Type"];
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Reusable interceptor for error handling across 400, 401, 403, 404, 500
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // If the request was cancelled, ignore it
    if (axios.isCancel(error)) {
      return Promise.reject(error);
    }

    const status = error.response?.status;
    const message = error.response?.data?.message || "An unexpected error occurred.";

    switch (status) {
      case 400:
        toast.error(message || "Bad Request.");
        break;
      case 401:
        // Do not toast for checkAuth failure on initial load (normal behavior if not logged in)
        if (!error.config.url.endsWith("/me")) {
          toast.error(message || "Unauthorized. Please login again.");
        }
        break;
      case 403:
        toast.error(message || "Forbidden: You do not have access.");
        break;
      case 404:
        toast.error(message || "Resource not found.");
        break;
      case 500:
        toast.error(message || "Internal Server Error. Please try again later.");
        break;
      default:
        toast.error(message);
    }

    return Promise.reject(error);
  }
);

export default api;