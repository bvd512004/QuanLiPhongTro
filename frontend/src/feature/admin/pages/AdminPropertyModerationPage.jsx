import React, { useCallback, useEffect, useState } from 'react';
import { adminPropertyApi } from '@/feature/admin/api/adminPropertyApi';
import AdminPropertyFilter from '@/feature/admin/components/AdminPropertyFilter';
import AdminPropertyTable from '@/feature/admin/components/AdminPropertyTable';
import Pagination from '@/feature/admin/components/Pagination';
import RejectModal from '@/feature/admin/components/RejectModal';

const AdminPropertyModerationPage = () => {
  const [filters, setFilters] = useState({
    // Admin mặc định xem các property đang INACTIVE (có thể đổi trong filter)
    status: 'INACTIVE',
    keyword: '',
  });
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
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [selectedPropertyId, setSelectedPropertyId] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const { status, keyword } = filters;
      const { page, size } = pageInfo;
      const response = await adminPropertyApi.getProperties({
        status,
        keyword,
        page,
        size,
        sort: 'createdAt,desc',
      });

      if (!response.success) {
        setError(response.message || 'Không thể tải danh sách property.');
        setItems([]);
        setPageInfo((prev) => ({ ...prev, totalItems: 0, totalPages: 0 }));
        return;
      }

      // adminPropertyApi trả về { success, data } trong đó data chính là PageResponse
      const pageResponse = response.data;
      if (!pageResponse) {
        setItems([]);
        setPageInfo((prev) => ({ ...prev, totalItems: 0, totalPages: 0 }));
        return;
      }

      setItems(pageResponse.items || []);
      setPageInfo((prev) => ({
        ...prev,
        page: pageResponse.page ?? prev.page,
        size: pageResponse.size ?? prev.size,
        totalItems: pageResponse.totalItems ?? 0,
        totalPages: pageResponse.totalPages ?? 0,
      }));
    } finally {
      setLoading(false);
    }
  }, [filters, pageInfo.page, pageInfo.size]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleFilterChange = (next) => {
    setFilters((prev) => ({
      ...prev,
      ...next,
    }));
    setPageInfo((prev) => ({ ...prev, page: 0 }));
  };

  const handlePageChange = (nextPage) => {
    setPageInfo((prev) => ({
      ...prev,
      page: nextPage,
    }));
  };

  const handleApprove = async (id) => {
    setError('');
    setSuccessMessage('');
    const result = await adminPropertyApi.approveProperty(id);
    if (!result.success) {
      setError(result.message || 'Không thể approve property.');
      return;
    }
    setSuccessMessage('Approve property thành công.');
    fetchData();
  };

  const handleOpenRejectModal = (id) => {
    setSelectedPropertyId(id);
    setRejectModalOpen(true);
  };

  const handleCloseRejectModal = () => {
    setRejectModalOpen(false);
    setSelectedPropertyId(null);
  };

  const handleConfirmReject = async (id, reason) => {
    setError('');
    setSuccessMessage('');
    const result = await adminPropertyApi.rejectProperty(id, reason);
    if (!result.success) {
      setError(result.message || 'Không thể reject property.');
      return;
    }
    setSuccessMessage('Reject property thành công.');
    handleCloseRejectModal();
    fetchData();
  };

  return (
    <div className="min-h-screen bg-gray-100 px-4 py-6 md:px-8 md:py-10">
      <div className="max-w-7xl mx-auto">
        <header className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Admin - Property Moderation</h1>
          <p className="mt-1 text-sm text-gray-600">
            Quản lý và duyệt các property do host tạo. Bạn có thể lọc theo trạng thái, tìm kiếm, approve hoặc reject
            từng property.
          </p>
        </header>

        <AdminPropertyFilter initialStatus={filters.status} onChange={handleFilterChange} />

        {error && (
          <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-700 border border-red-200">
            {error}
          </div>
        )}

        {successMessage && (
          <div className="mb-4 rounded-md bg-emerald-50 p-3 text-sm text-emerald-700 border border-emerald-200">
            {successMessage}
          </div>
        )}

        <AdminPropertyTable
          items={items}
          loading={loading}
          onApprove={handleApprove}
          onReject={handleOpenRejectModal}
        />

        <Pagination
          page={pageInfo.page}
          size={pageInfo.size}
          totalItems={pageInfo.totalItems}
          totalPages={pageInfo.totalPages}
          onPageChange={handlePageChange}
        />
      </div>

      <RejectModal
        open={rejectModalOpen}
        onClose={handleCloseRejectModal}
        onConfirm={handleConfirmReject}
        propertyId={selectedPropertyId}
      />
    </div>
  );
};

export default AdminPropertyModerationPage;

