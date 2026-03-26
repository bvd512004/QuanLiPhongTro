import axios from 'axios';

const axiosClient = axios.create({
  baseURL: "http://localhost:8080/api/v1",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});


axiosClient.interceptors.request.use(
  (config) => {
    const rawToken = localStorage.getItem("token");
    const token = rawToken?.trim();


    if (token && token !== "undefined" && token !== "null") {
      config.headers.Authorization = `Bearer ${token}`;
    } else if (config.headers?.Authorization) {
      delete config.headers.Authorization;
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