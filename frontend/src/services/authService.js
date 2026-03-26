import axiosClient from "../shared/services/axiosClient";

// LOGIN
export const login = async (email, password) => {
  const res = await axiosClient.post("/auth/login", {
    email,
    password
  });

  // axiosClient đã unwrap body -> { success, message, data }
  const data = res?.data;
  if (!data?.accessToken) {
    throw new Error("Login response không có accessToken");
  }

  localStorage.setItem("token", res.data.accessToken);

  return data;
};

// REGISTER
export const register = async (data) => {
  const res = await axiosClient.post("/auth/register", data);
  return res?.data;
};

// GET CURRENT USER
export const getCurrentUser = async () => {
  const res = await axiosClient.get("/users/me");
  return res?.data;
};

// UPDATE PROFILE
export const updateProfile = async (data) => {
  const res = await axiosClient.put("/users/profile", data);
  return res?.data;
};