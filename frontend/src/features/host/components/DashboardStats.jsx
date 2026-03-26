import React, { useEffect, useState } from 'react';
import  hostService  from '../services/host.service';

const DashboardStats = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await hostService.getDashboardStats();
      console.log('Dashboard stats response:', response);
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      setError(error instanceof Error ? error.message : 'Không thể tải dữ liệu thống kê');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {new Array(4).fill(0).map((_, index) => (
          <div key={`skeleton-${index}`} className="p-7 rounded-2xl bg-white border border-blue-100 shadow-[0_10px_28px_rgba(15,23,42,0.06)] animate-pulse">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 rounded-xl bg-slate-200 w-10 h-10"></div>
              <div className="h-6 w-16 bg-slate-200 rounded-full"></div>
            </div>
            <div className="flex flex-col gap-2">
              <div className="h-8 w-24 bg-slate-200 rounded"></div>
              <div className="h-4 w-32 bg-slate-200 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="grid grid-cols-1 gap-4">
        <div className="p-6 rounded-xl bg-red-50 border border-red-200">
          <div className="flex items-center gap-3 mb-2">
            <span className="material-symbols-outlined text-red-500">error</span>
            <h3 className="font-semibold text-red-900">Lỗi tải thống kê</h3>
          </div>
          <p className="text-sm text-red-700 mb-3">{error}</p>
          <button
            onClick={fetchDashboardStats}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  // Format currency in VND
  const formatCurrency = (amount) => {
    if (amount >= 1000000) {
      return `${(amount / 1000000).toFixed(1)}M`;
    } else if (amount >= 1000) {
      return `${(amount / 1000).toFixed(1)}K`;
    }
    return amount.toFixed(0);
  };

  // Format number with K suffix
  const formatNumber = (num) => {
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}k`;
    }
    return num.toString();
  };

  const statsData = [
    {
      label: 'Doanh thu tháng này',
      value: formatCurrency(stats.monthlyRevenue),
      trend: stats.monthlyRevenueChangePercent,
      icon: 'payments',
      color: 'text-emerald-500',
      bg: 'bg-emerald-500/10'
    },
    {
      label: 'Tổng lượt khách',
      value: stats.totalGuests.toString(),
      trend: stats.totalGuestsChangePercent,
      icon: 'group',
      color: 'text-blue-500',
      bg: 'bg-blue-500/10'
    },
    {
      label: 'Lượt xem trang',
      value: formatNumber(stats.totalViews),
      trend: stats.totalViewsChangePercent,
      icon: 'visibility',
      color: 'text-purple-500',
      bg: 'bg-purple-500/10'
    },
    {
      label: 'Đánh giá',
      value: stats.averageRating > 0 ? stats.averageRating.toFixed(2) : '0.00',
      trend: 0, // No trend for rating
      icon: 'star',
      color: 'text-amber-500',
      bg: 'bg-amber-500/10',
      subtitle: `${stats.totalReviews} đánh giá`
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      {statsData.map((stat) => (
        <div key={stat.label} className="p-7 rounded-2xl bg-white border border-blue-100 shadow-[0_10px_28px_rgba(15,23,42,0.06)] hover:shadow-[0_14px_34px_rgba(59,130,246,0.12)] transition-shadow">
          <div className="flex justify-between items-start mb-4">
            <div className={`p-2.5 rounded-xl ${stat.bg}`}>
              <span className={`material-symbols-outlined ${stat.color}`}>{stat.icon}</span>
            </div>
            {stat.trend !== 0 && (
              <div className={`flex items-center text-xs font-semibold px-2 py-1 rounded-full ${stat.trend > 0 ? 'text-emerald-600 bg-emerald-50' : 'text-red-600 bg-red-50'}`}>
                <span className="material-symbols-outlined !text-[12px] mr-1">
                  {stat.trend > 0 ? 'trending_up' : 'trending_down'}
                </span>
                {Math.abs(stat.trend).toFixed(1)}%
              </div>
            )}
          </div>
          <div className="flex flex-col">
            <h3 className="text-2xl font-bold text-slate-900">{stat.value}</h3>
            <p className="text-sm text-slate-600 font-medium">{stat.label}</p>
            {stat.subtitle && (
              <p className="text-xs text-slate-500 mt-1">{stat.subtitle}</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default DashboardStats;



