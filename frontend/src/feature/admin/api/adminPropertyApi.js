import axiosClient from '@/shared/services/axiosClient';

export const adminPropertyApi = {
  getProperties: async ({ status = 'INACTIVE', keyword = '', page = 0, size = 20, sort = 'createdAt,desc' }) => {
    try {
      const params = { status, keyword: keyword || undefined, page, size, sort };
      const response = await axiosClient.get('/api/v1/admin/properties/moderation', { params });
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error fetching admin properties for moderation', error);
      const message = error.response?.data?.message || 'Có lỗi xảy ra khi tải danh sách property.';
      return { success: false, message };
    }
  },

  approveProperty: async (id) => {
    try {
      const response = await axiosClient.patch(`/api/v1/admin/properties/${id}/approve`);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error approving property', error);
      const message = error.response?.data?.message || 'Không thể approve property.';
      return { success: false, message };
    }
  },

  rejectProperty: async (id, reason) => {
    try {
      const response = await axiosClient.patch(`/api/v1/admin/properties/${id}/reject`, { reason });
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error rejecting property', error);
      const message = error.response?.data?.message || 'Không thể reject property.';
      return { success: false, message };
    }
  },
};

