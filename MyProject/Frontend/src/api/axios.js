import axios from "axios";

// base URL 
const API = axios.create({
  baseURL: "http://127.0.0.1:8000/api",
});

// this runs before EVERY request automatically attaches token from localStorage to every request header
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default API;