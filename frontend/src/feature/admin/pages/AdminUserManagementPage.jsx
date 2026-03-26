import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { adminUserApi } from '@/feature/admin/api/adminUserApi';
import Pagination from '@/feature/admin/components/Pagination';
import AdminUserTable from '@/feature/admin/components/AdminUserTable';

const StatusSelect = ({ value, onChange }) => {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
    >
      <option value="">Tất cả</option>
      <option value="true">Active</option>
      <option value="false">Banned</option>
    </select>
  );
};

const AdminUserManagementPage = () => {
  const [keyword, setKeyword] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const [pageInfo, setPageInfo] = useState({
    page: 0,
    size: 10,
    totalItems: 0,
    totalPages: 0,
  });

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const startIndex = useMemo(() => (pageInfo.page || 0) * (pageInfo.size || 0), [pageInfo.page, pageInfo.size]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError('');
    setSuccessMessage('');
    try {
      const isActive =
        statusFilter === '' ? undefined : statusFilter === 'true' ? true : statusFilter === 'false' ? false : undefined;

      const res = await adminUserApi.getUsers({
        keyword,
        isActive,
        page: pageInfo.page,
        size: pageInfo.size,
        sort: 'createdAt,desc',
      });

      if (!res.success) {
        setError(res.message || 'Không thể tải danh sách người dùng.');
        setItems([]);
        setPageInfo((prev) => ({ ...prev, totalItems: 0, totalPages: 0 }));
        return;
      }

      const pageResponse = res.data;
      setItems(pageResponse.items || []);
      setPageInfo((prev) => ({
        ...prev,
        totalItems: pageResponse.totalItems ?? 0,
        totalPages: pageResponse.totalPages ?? 0,
      }));
    } finally {
      setLoading(false);
    }
  }, [keyword, statusFilter, pageInfo.page, pageInfo.size]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handlePageChange = (nextPage) => {
    setPageInfo((prev) => ({
      ...prev,
      page: nextPage,
    }));
  };

  const onBan = async (id) => {
    setError('');
    setSuccessMessage('');
    const res = await adminUserApi.banUser(id);
    if (!res.success) {
      setError(res.message || 'Không thể ban user.');
      return;
    }
    setSuccessMessage('Ban user thành công.');
    fetchData();
  };

  const onUnban = async (id) => {
    setError('');
    setSuccessMessage('');
    const res = await adminUserApi.unbanUser(id);
    if (!res.success) {
      setError(res.message || 'Không thể mở lại user.');
      return;
    }
    setSuccessMessage('Unban user thành công.');
    fetchData();
  };

  return (
    <div className="min-h-screen bg-gray-100 px-4 py-6 md:px-8 md:py-10">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Admin - User Management</h1>
            <p className="mt-1 text-sm text-gray-600">Ban hoặc mở lại người dùng để quản lý hệ thống.</p>
          </div>

          <div className="w-full md:w-[520px]">
            <div className="flex flex-col md:flex-row gap-3">
              <input
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="Tìm theo email / tên..."
                className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <div className="w-full md:w-40">
                <StatusSelect value={statusFilter} onChange={setStatusFilter} />
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-700 border border-red-200">{error}</div>
        )}

        {successMessage && (
          <div className="mb-4 rounded-md bg-emerald-50 p-3 text-sm text-emerald-700 border border-emerald-200">
            {successMessage}
          </div>
        )}

        <AdminUserTable items={items} loading={loading} startIndex={startIndex} onBan={onBan} onUnban={onUnban} />

        <Pagination
          page={pageInfo.page}
          size={pageInfo.size}
          totalItems={pageInfo.totalItems}
          totalPages={pageInfo.totalPages}
          onPageChange={handlePageChange}
        />
      </div>
    </div>
  );
};

export default AdminUserManagementPage;

