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

    // 👉 Nếu token hết hạn thì logout luôn
    if (error.response?.status === 401) {

      console.log("Unauthorized - maybe token expired");

      // clear token
      localStorage.removeItem("token");

      // redirect về login (nếu cần)
      window.location.href = "/login";
    }

    return Promise.reject(error);
  }
);

export default axiosClient;