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
      // axiosClient interceptor đã trả về thẳng body:
      // { success, message, data: [...] }
      const payload = response;
      return {
        success: !!payload.success,
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
      // axiosClient interceptor đã trả về thẳng body:
      // { success, message, data: PageResponse{ items, ... } }
      const payload = response;

      // Backend trả về: { success, message, data: PageResponse{ items, page, size, ... } }
      if (payload && typeof payload === 'object' && 'success' in payload && 'data' in payload) {
        return { success: !!payload.success, data: payload.data };
      }

      // Fallback nếu backend trả về trực tiếp object không bọc ApiResponse
      return { success: true, data: payload };
    } catch (error) {
      console.error('Error filtering properties', error);
      return { success: false, data: { items: [] } };
    }
  },

  // GET /api/v1/properties/{id}
  // Response backend: { success, message, data: {property...} }
  getPropertyById: async (id) => {
    try {
      const response = await axiosClient.get(`/properties/${id}`);
      // axiosClient interceptor đã trả về thẳng body ApiResponse
      const payload = response;

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

      const payload = response;
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
      const payload = response;

      if (payload && typeof payload === 'object' && 'success' in payload && 'data' in payload) {
        return { success: !!payload.success, data: payload.data };
      }

      return { success: true, data: payload };
    } catch (error) {
      console.error('Error fetching booked dates', error);
      return { success: false, data: [] };
    }
  },

  // POST /api/v1/bookings
  createBooking: async (payload) => {
    try {
      const response = await axiosClient.post('/bookings', payload);
      const apiRes = response;
      return { success: !!apiRes.success, data: apiRes.data };
    } catch (error) {
      console.error('Error creating booking', error);
      return { success: false, data: null };
    }
  },

  // POST /api/v1/bookings/{id}/transfer-proof
  submitTransferProof: async (bookingId, payload) => {
    try {
      const response = await axiosClient.post(`/bookings/${bookingId}/transfer-proof`, payload);
      const apiRes = response;
      return { success: !!apiRes.success, data: apiRes.data };
    } catch (error) {
      console.error('Error submitting transfer proof', error);
      return { success: false, data: null };
    }
  },

  // POST /api/files/upload-image (không nằm dưới /api/v1)
  uploadImage: async (file) => {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await axiosClient.post('http://localhost:8080/api/files/upload-image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const apiRes = response;
      return { success: !!apiRes.success, data: apiRes.data };
    } catch (error) {
      console.error('Error uploading image', error);
      return { success: false, data: null };
    }
  },
};
