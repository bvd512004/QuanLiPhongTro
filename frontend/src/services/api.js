import axiosClient from '../shared/services/axiosClient';


export const api = {

    // LOGIN
  login: async (email, password) => {
    try {

      const response = await axiosClient.post("/auth/login", {
        email,
        password
      });

      return {
        success: true,
        data: response.data.data
      };

    } catch (error) {

      console.error("Login error", error);

      return {
        success: false
      };

    }
  },


  // REGISTER
  register: async (data) => {
    try {

      const response = await axiosClient.post("/auth/register", data);

      return {
        success: true,
        data: response.data.data
      };

    } catch (error) {

      console.error("Register error", error);

      return {
        success: false
      };

    }
  },
  // GET /api/v1/properties?featured=true&limit=...
  getFeaturedProperties: async (limit = 6) => {
    try {
      const response = await axiosClient.get('/properties/featured', { params: { limit } });
      // backend: { success, message, data: [...] }
      const payload = response.data;
      return {
        success: payload.success,
        data: Array.isArray(payload.data) ? payload.data : [],
      };
    } catch (error) {
      console.error('Error fetching featured properties', error);
      return { success: false, data: [] };
    }
  },

  filterProperties: async (filters = {}, page = 0, size = 10) => {
    try {
      const params = { ...filters, page, size };
      const response = await axiosClient.get('/properties', { params });
      const payload = response.data;
      console.log('Filtered properties response:', payload);
      return { success: true, data: payload };
    } catch (error) {
      console.error('Error filtering properties', error);
      return { success: false, data: { content: [] } };
    }
  },
};
