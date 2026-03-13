import React, { useState, useEffect } from 'react';
import { hostService } from '../services/host.service';


const ReservationStats = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await hostService.getHostBookingStats();
      if (response.success && response.data) {
        setStats(response.data);
      }
    } catch (error) {
      console.error('Failed to load booking stats:', error);
      setError(error.message || 'Failed to load statistics');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getGrowthText = (current, previous) => {
    if (previous === 0) {
      return current > 0 ? `+${current} mới` : 'Chưa có dữ liệu';
    }
    const diff = current - previous;
    const sign = diff >= 0 ? '+' : '';
    return `${sign}${diff} so với tháng trước`;
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex flex-col gap-2 rounded-xl p-6 bg-white dark:bg-[#1A2633] border border-slate-200 dark:border-slate-700 shadow-sm animate-pulse">
            <div className="flex justify-between items-center">
              <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-32"></div>
              <div className="h-6 w-6 bg-gray-300 dark:bg-gray-600 rounded"></div>
            </div>
            <div className="h-8 bg-gray-300 dark:bg-gray-600 rounded w-16 mt-2"></div>
            <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-20 mt-1"></div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="col-span-full bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200 px-4 py-3 rounded-lg text-center">
          {error}
          <button
            onClick={loadStats}
            className="ml-2 text-red-600 dark:text-red-400 underline hover:no-underline"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="col-span-full text-center py-4 text-gray-500 dark:text-gray-400">
          Không có dữ liệu thống kê
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
      {/* Card 1 */}
      <div className="flex flex-col gap-2 rounded-xl p-6 bg-white dark:bg-[#1A2633] border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex justify-between items-center">
          <p className="text-slate-500 dark:text-gray-400 text-sm font-medium leading-normal uppercase tracking-wider">
            Yêu cầu chờ duyệt
          </p>
          <span className="material-symbols-outlined text-orange-500">pending_actions</span>
        </div>
        <p className="text-slate-900 dark:text-white text-3xl font-bold leading-tight mt-2">
          {stats.pendingCount}
        </p>
        <p className="text-xs text-orange-600 font-medium bg-orange-50 dark:bg-orange-900/20 px-2 py-1 rounded w-fit mt-1">
          {stats.pendingCount > 0 ? 'Cần xử lý ngay' : 'Không có yêu cầu'}
        </p>
      </div>

      {/* Card 2 */}
      <div className="flex flex-col gap-2 rounded-xl p-6 bg-white dark:bg-[#1A2633] border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex justify-between items-center">
          <p className="text-slate-500 dark:text-gray-400 text-sm font-medium leading-normal uppercase tracking-wider">
            Đã xác nhận tháng này
          </p>
          <span className="material-symbols-outlined text-primary">check_circle</span>
        </div>
        <p className="text-slate-900 dark:text-white text-3xl font-bold leading-tight mt-2">
          {stats.confirmedThisMonth}
        </p>
        <p className="text-xs text-green-600 font-medium bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded w-fit mt-1">
          {getGrowthText(Number(stats.confirmedThisMonth), Number(stats.previousMonthConfirmed))}
        </p>
      </div>

      {/* Card 3 */}
      <div className="flex flex-col gap-2 rounded-xl p-6 bg-white dark:bg-[#1A2633] border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex justify-between items-center">
          <p className="text-slate-500 dark:text-gray-400 text-sm font-medium leading-normal uppercase tracking-wider">
            Doanh thu dự kiến
          </p>
          <span className="material-symbols-outlined text-green-500">payments</span>
        </div>
        <p className="text-slate-900 dark:text-white text-3xl font-bold leading-tight mt-2">
          {formatCurrency(stats.expectedRevenue)}
        </p>
        <p className="text-xs text-blue-600 font-medium bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded w-fit mt-1">
          Sắp nhận: {formatCurrency(stats.upcomingRevenue)}
        </p>
      </div>
    </div>
  );
};

export default ReservationStats;

