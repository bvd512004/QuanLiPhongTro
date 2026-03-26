import axiosClient from '@/shared/services/axiosClient';

export const adminUserApi = {
  getUsers: async ({ keyword = '', isActive = undefined, page = 0, size = 20, sort = 'createdAt,desc' }) => {
    try {
      const params = {
        keyword: keyword || undefined,
        isActive: isActive === undefined ? undefined : isActive,
        page,
        size,
        sort,
      };
      const response = await axiosClient.get('/admin/users', { params });
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error fetching admin users', error);
      const message = error.response?.data?.message || 'Có lỗi xảy ra khi tải danh sách người dùng.';
      return { success: false, message };
    }
  },

  banUser: async (id) => {
    try {
      const response = await axiosClient.patch(`/admin/users/${id}/ban`);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error banning user', error);
      const message = error.response?.data?.message || 'Không thể ban user.';
      return { success: false, message };
    }
  },

  unbanUser: async (id) => {
    try {
      const response = await axiosClient.patch(`/admin/users/${id}/unban`);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error unbanning user', error);
      const message = error.response?.data?.message || 'Không thể mở lại user.';
      return { success: false, message };
    }
  },
};

