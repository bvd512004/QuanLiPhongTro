import axiosClient from '@/shared/services/axiosClient';

export const adminDashboardApi = {
  getStats: async () => {
    try {
      const response = await axiosClient.get('/admin/dashboard/stats');
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error fetching admin dashboard stats', error);
      const message = error.response?.data?.message || 'Không thể tải dashboard.';
      return { success: false, message };
    }
  },
};

