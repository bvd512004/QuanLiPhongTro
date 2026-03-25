import axiosClient from "../shared/services/axiosClient";

// LOGIN
export const login = async (email, password) => {
  const res = await axiosClient.post("/auth/login", {
    email,
    password
  });

  // axiosClient đã unwrap thành ApiResponse, payload thực nằm ở res.data
  const payload = res?.data ?? res;
  const token = payload?.accessToken || payload?.token || null;

  if (!token) {
    throw new Error("Login response does not contain access token");
  }

  // Lưu cả 2 key để tương thích các luồng cũ
  localStorage.setItem("token", token);
  localStorage.setItem("accessToken", token);

  return {
    ...payload,
    accessToken: token,
  };
};

// REGISTER
export const register = async (data) => {
  const res = await axiosClient.post("/auth/register", data);
  return res.data;
};

// GET CURRENT USER
export const getCurrentUser = async () => {
  const res = await axiosClient.get("/auth/me");
  return res.data;
};

// UPDATE PROFILE
export const updateProfile = async (data) => {
  const res = await axiosClient.put("/users/profile", data);
  return res.data;
};