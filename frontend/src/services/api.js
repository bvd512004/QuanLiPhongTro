import axiosClient from '../shared/services/axiosClient';

// Wrapper around backend API endpoints; adjust paths as needed when backend is ready.
export const api = {
  getFeaturedProperties: async (limit) => {
    try {
      const response = await axiosClient.get('api/v1/properties/featured', { params: { limit } });
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
      const response = await axiosClient.get('api/v1/properties', { params });
      // tuỳ backend, nếu cũng bọc kiểu { success, data: { content: [...] } } thì xử lý tương tự
      const payload = response.data;
      return { success: true, data: payload };
    } catch (error) {
      console.error('Error filtering properties', error);
      return { success: false, data: { content: [] } };
    }
  },
};
