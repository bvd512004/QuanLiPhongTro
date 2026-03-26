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
      // ném ra lỗi để catch ở component
      throw error.response?.data || { message: "Register failed" };
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

  // GET /api/v1/properties/{id}
  // Response backend: { success, message, data: {property...} }
  getPropertyById: async (id) => {
    try {
      const response = await axiosClient.get(`/properties/${id}`);
      const payload = response?.data;

      // Trường hợp backend trả về ApiResponse trực tiếp
      if (payload && typeof payload === 'object' && 'success' in payload && 'data' in payload) {
        return { success: !!payload.success, message: payload.message, data: payload.data };
      }

      // Trường hợp backend/data-rest trả về object property trực tiếp
      return { success: true, data: payload };
    } catch (error) {
      console.error('Error fetching property by id', error);
      return { success: false, message: 'Không thể tải thông tin phòng', data: null };
    }
  },

  // GET /api/v1/bookings/check-availability?propertyId=&checkIn=&checkOut=
  checkAvailability: async (propertyId, checkIn, checkOut) => {
    try {
      const response = await axiosClient.get('/bookings/check-availability', {
        params: { propertyId, checkIn, checkOut },
      });

      const payload = response?.data;
      if (payload && typeof payload === 'object' && 'success' in payload && 'data' in payload) {
        return { success: !!payload.success, data: payload.data };
      }

      return { success: true, data: payload };
    } catch (error) {
      console.error('Error checking availability', error);
      return { success: false, data: { available: false } };
    }
  },

  // GET /api/v1/bookings/booked-dates/{propertyId}
  getBookedDates: async (propertyId) => {
    try {
      const response = await axiosClient.get(`/bookings/booked-dates/${propertyId}`);
      const payload = response?.data;

      if (payload && typeof payload === 'object' && 'success' in payload && 'data' in payload) {
        return { success: !!payload.success, data: payload.data };
      }

      return { success: true, data: payload };
    } catch (error) {
      console.error('Error fetching booked dates', error);
      return { success: false, data: [] };
    }
  },
};
