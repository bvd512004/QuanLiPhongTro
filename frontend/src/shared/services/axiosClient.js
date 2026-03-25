import axios from 'axios';

const axiosClient = axios.create({
  baseURL: "http://localhost:8080/api/v1",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// attach JWT token
axiosClient.interceptors.request.use(
  (config) => {

    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;

  },
  (error) => Promise.reject(error)
);

// handle response
axiosClient.interceptors.response.use(
  (response) => response.data,
  (error) => {

    console.error("API Error:", error.response?.data || error.message);

    if (error.response?.status === 401) {

      localStorage.removeItem("token");



    }

    return Promise.reject(error);
  }
);

export default axiosClient;