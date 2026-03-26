import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { adminDashboardApi } from '@/feature/admin/api/adminDashboardApi';

const StatCard = ({ title, value, tone }) => {
  const styles = {
    blue: 'bg-blue-50 border-blue-100 text-blue-800',
    emerald: 'bg-emerald-50 border-emerald-100 text-emerald-800',
    amber: 'bg-amber-50 border-amber-100 text-amber-800',
    red: 'bg-red-50 border-red-100 text-red-800',
    gray: 'bg-gray-50 border-gray-100 text-gray-800',
  };

  const cls = styles[tone] || styles.gray;
  return (
    <div className={`rounded-xl border ${cls} p-4`}>
      <div className="text-xs font-semibold uppercase tracking-wide opacity-80">{title}</div>
      <div className="mt-2 text-2xl font-bold">{value ?? 0}</div>
    </div>
  );
};

const AdminDashboardPage = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [stats, setStats] = useState(null);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await adminDashboardApi.getStats();
      if (!res.success) {
        setError(res.message || 'Không thể tải thống kê');
        setStats(null);
        return;
      }
      setStats(res.data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return (
    <div className="min-h-screen bg-gray-100 px-4 py-6 md:px-8 md:py-10">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 flex items-start justify-between gap-4 flex-col md:flex-row md:items-center">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="mt-1 text-sm text-gray-600">Thống kê nhanh để theo dõi hệ thống.</p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to="/admin/properties/moderation"
              className="rounded-lg border border-indigo-200 bg-white px-4 py-2 text-sm font-semibold text-indigo-700 hover:bg-indigo-50/40"
            >
              Moderation properties
            </Link>
            <Link
              to="/admin/users"
              className="rounded-lg border border-indigo-200 bg-white px-4 py-2 text-sm font-semibold text-indigo-700 hover:bg-indigo-50/40"
            >
              Manage users
            </Link>
          </div>
        </div>

        {error && (
          <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-700 border border-red-200">{error}</div>
        )}

        {loading ? (
          <div className="flex justify-center items-center py-16">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            <StatCard title="Total users" value={stats?.totalUsers} tone="gray" />
            <StatCard title="Active users" value={stats?.activeUsers} tone="emerald" />
            <StatCard title="Banned users" value={stats?.bannedUsers} tone="red" />
            <StatCard title="Total properties" value={stats?.totalProperties} tone="blue" />

            <StatCard title="Active properties" value={stats?.activeProperties} tone="emerald" />
            <StatCard title="Inactive properties" value={stats?.inactiveProperties} tone="amber" />
            <StatCard title="Rejected properties" value={stats?.rejectedProperties} tone="red" />
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboardPage;

