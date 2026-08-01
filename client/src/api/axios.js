import axios from "axios";

const api = axios.create({
  baseURL: "https://personalized-resume.onrender.com/api",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;