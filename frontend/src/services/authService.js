import axiosClient from "../shared/services/axiosClient";

// LOGIN
export const login = async (email, password) => {
  const res = await axiosClient.post("/auth/login", {
    email,
    password
  });

  // res = { success, data }
  localStorage.setItem("token", res.data.accessToken);

  return res.data;
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
// UPLOAD IMAGE
export const uploadImage = async (file) => {
  const formData = new FormData();
  formData.append("file", file);

  const res = await axiosClient.post("/files/upload-image", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return res.data; // 🔥 lấy {url}
};
// UPDATE PROFILE
export const updateProfile = async (data) => {
  const res = await axiosClient.put("/users/profile", data);
  return res.data;
};