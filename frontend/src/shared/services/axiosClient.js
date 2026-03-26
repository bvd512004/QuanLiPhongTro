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


  // axiosClient.interceptors.response.use(
  //   (response) => response.data,
    
  // );

export default axiosClient;