import axiosClient from '@/shared/services/axiosClient';

// Wrapper around backend API endpoints; adjust paths as needed when backend is ready.
export const api = {
  getFeaturedProperties: async (limit) => {
    try {
      const response = await axiosClient.get(`/properties/featured`, { params: { limit } });
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error fetching featured properties', error);
      return { success: false, data: [] };
    }
  },

  filterProperties: async (filters = {}, page = 0, size = 10) => {
    try {
      const params = { ...filters, page, size };
      const response = await axiosClient.get(`/properties`, { params });
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error filtering properties', error);
      return { success: false, data: { content: [] } };
    }
  },
};
