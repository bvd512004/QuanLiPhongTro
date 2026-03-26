import axiosClient from "./axiosClient.js";

// LOGIN
export const login = async (email, password) => {
  const res = await axiosClient.post("/auth/login", {
    email,
    password
  });

  const data = res.data; // 🔥 vì axiosClient đã unwrap

  localStorage.setItem("token", data.accessToken);  

  return data;
};

// REGISTER
export const register = async (data) => {
  const res = await axiosClient.post("/auth/register", data);
  return res.data;
};

// GET CURRENT USER
export const getCurrentUser = async () => {
  const res = await axiosClient.get("/users/me");
  return res.data;
};

// UPDATE PROFILE
export const updateProfile = async (data) => {
  const res = await axiosClient.put("/users/profile", data);
  return res.data;
};