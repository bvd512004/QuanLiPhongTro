import axios from 'axios';

const axiosClient = axios.create({
  baseURL: "http://localhost:8080/api/v1",
  timeout: 10000,
});

// ✅ Attach JWT token vào mọi request
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

// ✅ Handle response & error
axiosClient.interceptors.response.use(
  (response) => response.data,
  (error) => {

    console.error("API Error:", error.response?.data || error.message);

    // 👉 Nếu token hết hạn thì logout luôn
    if (error.response?.status === 401) {
      console.log("Token expired hoặc chưa login");

      // clear token
      localStorage.removeItem("token");

      // redirect về login (nếu cần)
      window.location.href = "/login";
    }

    return Promise.reject(error);
  }
);

export default axiosClient;