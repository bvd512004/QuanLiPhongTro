import React, { useState, useEffect, useMemo, useContext } from 'react';
import hostService from '../services/host.service';
import { AuthStateContext } from '@/app/providers/AuthProvider.jsx';

const ReservationList = () => {
  const { user } = useContext(AuthStateContext);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showGuestDetailsModal, setShowGuestDetailsModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');

  // Filter/sort/pagination states
  const [searchTerm, setSearchTerm] = useState('');
  const [checkInFrom, setCheckInFrom] = useState('');
  const [checkOutTo, setCheckOutTo] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortDir, setSortDir] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(6);

  useEffect(() => {
    if (user && (user.isHost || user.roles?.includes('ROLE_HOST'))) {
      loadBookings();
    } else if (user) {
      setLoading(false);
      setError('Bạn cần có quyền host để xem danh sách đặt chỗ. Vui lòng đăng ký làm host trước.');
    }
  }, [user]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, checkInFrom, checkOutTo, sortBy, sortDir, pageSize]);

  const loadBookings = async () => {
    try {
      setLoading(true);
      setError('');

      // Keep this sufficiently high for responsive client-side filtering.
      const response = await hostService.getHostBookings(0, 200);
      const normalizedBookings = response.items || [];

      if (normalizedBookings.length > 0 || response?.success !== false) {
        setBookings(normalizedBookings);
      } else {
        const errorMsg = response?.message || 'Không thể tải danh sách đặt chỗ. Vui lòng thử lại.';
        setError(errorMsg);
        setBookings([]);
      }
    } catch (err) {
      let errorMsg = 'Đã xảy ra lỗi khi tải danh sách đặt chỗ.';
      if (err.message?.includes('401') || err.message?.includes('Unauthorized')) {
        errorMsg = 'Vui lòng đăng nhập lại để xem danh sách đặt chỗ.';
      } else if (err.message?.includes('403') || err.message?.includes('Forbidden')) {
        errorMsg = 'Bạn không có quyền truy cập. Vui lòng đảm bảo tài khoản của bạn có quyền host.';
      } else if (err.message?.includes('Network')) {
        errorMsg = 'Lỗi kết nối mạng. Vui lòng kiểm tra kết nối internet và thử lại.';
      }
      setError(errorMsg);
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  const getGuestName = (booking) => {
    const firstName = booking?.guest?.firstName || 'Guest';
    const lastName = booking?.guest?.lastName || '';
    return `${firstName} ${lastName}`.trim();
  };

  const getPropertyTitle = (booking) => booking?.property?.title || 'Property chưa có tên';

  const getPropertyImage = (booking) => {
    return (
      booking?.property?.primaryImageUrl ||
      'https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?auto=format&fit=crop&w=300&q=60'
    );
  };

  const filteredBookings = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    const filtered = bookings.filter((booking) => {
      const bookingCode = (booking?.bookingCode || '').toLowerCase();
      const propertyTitle = (booking?.property?.title || '').toLowerCase();

      const matchesSearch =
        !normalizedSearch || bookingCode.includes(normalizedSearch) || propertyTitle.includes(normalizedSearch);

      const hasCheckInMatch =
        !checkInFrom || (booking?.checkInDate && new Date(booking.checkInDate) >= new Date(checkInFrom));

      const hasCheckOutMatch =
        !checkOutTo || (booking?.checkOutDate && new Date(booking.checkOutDate) <= new Date(checkOutTo));

      return matchesSearch && hasCheckInMatch && hasCheckOutMatch;
    });

    filtered.sort((a, b) => {
      const direction = sortDir === 'asc' ? 1 : -1;

      if (sortBy === 'totalPrice') {
        const av = Number(a?.totalPrice || 0);
        const bv = Number(b?.totalPrice || 0);
        return (av - bv) * direction;
      }

      if (sortBy === 'checkInDate') {
        const av = a?.checkInDate ? new Date(a.checkInDate).getTime() : 0;
        const bv = b?.checkInDate ? new Date(b.checkInDate).getTime() : 0;
        return (av - bv) * direction;
      }

      const av = a?.createdAt ? new Date(a.createdAt).getTime() : 0;
      const bv = b?.createdAt ? new Date(b.createdAt).getTime() : 0;
      return (av - bv) * direction;
    });

    return filtered;
  }, [bookings, searchTerm, checkInFrom, checkOutTo, sortBy, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filteredBookings.length / pageSize));
  const paginatedBookings = useMemo(() => {
    const safePage = Math.min(currentPage, totalPages);
    const start = (safePage - 1) * pageSize;
    return filteredBookings.slice(start, start + pageSize);
  }, [filteredBookings, currentPage, totalPages, pageSize]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const handleConfirm = async (booking) => {
    if (booking.paymentStatus !== 'PAID') {
      alert('Cannot confirm booking: Payment not completed yet');
      return;
    }

    if (!confirm(`Confirm booking from ${getGuestName(booking)}?`)) {
      return;
    }

    setIsProcessing(true);
    setError('');

    try {
      const response = await hostService.confirmBooking(booking.id);
      if (response.success) {
        alert('Booking confirmed successfully!');
        await loadBookings();
      }
    } catch (err) {
      setError(err.message || 'Failed to confirm booking');
      alert('Failed to confirm booking: ' + (err.message || 'Unknown error'));
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = (booking) => {
    setSelectedBooking(booking);
    setShowRejectModal(true);
    setRejectReason('');
  };

  const handleViewGuestDetails = (booking) => {
    setSelectedBooking(booking);
    setShowGuestDetailsModal(true);
  };

  const submitReject = async () => {
    if (!selectedBooking) return;

    if (!rejectReason.trim()) {
      alert('Please provide a reason for rejection');
      return;
    }

    setIsProcessing(true);
    setError('');

    try {
      const response = await hostService.cancelBooking(selectedBooking.id, rejectReason);
      if (response.success) {
        alert('Booking rejected successfully!');
        setShowRejectModal(false);
        setSelectedBooking(null);
        await loadBookings();
      }
    } catch (err) {
      setError(err.message || 'Failed to reject booking');
      alert('Failed to reject booking: ' + (err.message || 'Unknown error'));
    } finally {
      setIsProcessing(false);
    }
  };

  const getStatusBadge = (status, paymentStatus) => {
    if (status === 'PENDING') {
      if (paymentStatus === 'PAID') {
        return <span className="px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800">Đang chờ duyệt</span>;
      }
      return <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-800">Chờ thanh toán</span>;
    }
    if (status === 'CONFIRMED') {
      return <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">Đã xác nhận</span>;
    }
    if (status === 'CANCELLED') {
      return <span className="px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800">Đã hủy</span>;
    }
    return <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">{status}</span>;
  };

  const formatDate = (dateString) => {
    if (!dateString) return '--';
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const resetFilters = () => {
    setSearchTerm('');
    setCheckInFrom('');
    setCheckOutTo('');
    setSortBy('createdAt');
    setSortDir('desc');
    setCurrentPage(1);
  };

  const renderBookingCard = (booking) => (
    <div
      key={booking.id}
      className="bg-white rounded-2xl p-6 border border-blue-100 shadow-[0_10px_28px_rgba(15,23,42,0.06)] hover:shadow-[0_14px_34px_rgba(59,130,246,0.12)] transition-shadow"
    >
      <div className="flex gap-4">
        <img
          src={getPropertyImage(booking)}
          alt={getPropertyTitle(booking)}
          className="w-24 h-24 rounded-lg object-cover"
        />

        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start mb-2 gap-3">
            <div className="min-w-0">
              <h3 className="font-semibold text-lg text-gray-900 truncate">{getPropertyTitle(booking)}</h3>
              <p className="text-sm text-gray-500">Booking #{booking.bookingCode || '--'}</p>
            </div>
            {getStatusBadge(booking.status, booking.paymentStatus)}
          </div>

          <div className="flex items-center gap-2 mb-3 flex-wrap">
            <span className="material-symbols-outlined text-gray-400">person</span>
            <button
              onClick={() => handleViewGuestDetails(booking)}
              className="text-gray-700 hover:text-primary hover:underline font-medium transition-colors"
            >
              {getGuestName(booking)}
            </button>
            <span className="text-gray-400">•</span>
            <span className="text-gray-600">{booking.numGuests || 0} khách</span>
          </div>

          <div className="flex items-center gap-4 mb-3 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-gray-400 text-sm">calendar_today</span>
              <span className="text-sm text-gray-600">
                {formatDate(booking.checkInDate)} - {formatDate(booking.checkOutDate)}
              </span>
            </div>
            <span className="text-gray-400">•</span>
            <span className="text-sm text-gray-600">{booking.numNights || 0} đêm</span>
          </div>

          <div className="flex items-center gap-2 mb-3">
            <span className="material-symbols-outlined text-gray-400">payments</span>
            <span className="font-semibold text-gray-900">${Number(booking.totalPrice || 0).toFixed(2)}</span>
            <span className="text-sm text-gray-500">
              ({booking.paymentStatus === 'PAID' ? 'Đã thanh toán' : 'Chưa thanh toán'})
            </span>
          </div>

          {booking.guestMessage && (
            <div className="bg-blue-50 p-3 rounded-lg mb-3">
              <p className="text-sm text-gray-700">
                <span className="font-semibold">Lời nhắn:</span> {booking.guestMessage}
              </p>
            </div>
          )}

          {booking.status === 'PENDING' && booking.paymentStatus === 'PAID' && (
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => handleConfirm(booking)}
                disabled={isProcessing}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-lg font-semibold transition-colors flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-sm">check_circle</span> Đồng ý
              </button>
              <button
                onClick={() => handleReject(booking)}
                disabled={isProcessing}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white rounded-lg font-semibold transition-colors flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-sm">cancel</span> Từ chối
              </button>
            </div>
          )}

          {booking.status === 'CONFIRMED' && <div className="text-sm text-green-600 mt-2">✓ Booking đã được xác nhận</div>}

          {booking.status === 'CANCELLED' && booking.hostResponse && (
            <div className="bg-red-50 p-3 rounded-lg mt-3">
              <p className="text-sm text-gray-700">
                <span className="font-semibold">Lý do từ chối:</span> {booking.hostResponse}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <span className="material-symbols-outlined animate-spin text-4xl text-primary mb-4">progress_activity</span>
        <p className="text-gray-600">Đang tải danh sách đặt chỗ...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
          <div className="flex justify-between items-center gap-3">
            <span>{error}</span>
            <button
              onClick={loadBookings}
              className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm rounded-md transition-colors"
            >
              Thử lại
            </button>
          </div>
        </div>
      )}

      <div className="bg-white border border-blue-100 rounded-2xl p-5 shadow-[0_10px_28px_rgba(15,23,42,0.06)] space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
          <div className="xl:col-span-2">
            <label className="text-sm font-medium text-gray-700 mb-1 block">Tìm kiếm</label>
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Nhập mã booking hoặc tên nơi thuê"
              className="w-full rounded-xl border border-blue-200 px-3 py-2 bg-white text-gray-900"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Check-in từ</label>
            <input
              type="date"
              value={checkInFrom}
              onChange={(e) => setCheckInFrom(e.target.value)}
              className="w-full rounded-xl border border-blue-200 px-3 py-2 bg-white text-gray-900"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Check-out đến</label>
            <input
              type="date"
              value={checkOutTo}
              onChange={(e) => setCheckOutTo(e.target.value)}
              className="w-full rounded-xl border border-blue-200 px-3 py-2 bg-white text-gray-900"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Sắp xếp theo</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full rounded-xl border border-blue-200 px-3 py-2 bg-white text-gray-900"
            >
              <option value="createdAt">Thời gian booking</option>
              <option value="totalPrice">Giá tiền</option>
              <option value="checkInDate">Ngày check-in</option>
            </select>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Thứ tự</label>
            <select
              value={sortDir}
              onChange={(e) => setSortDir(e.target.value)}
              className="w-full rounded-xl border border-blue-200 px-3 py-2 bg-white text-gray-900"
            >
              <option value="desc">Giảm dần</option>
              <option value="asc">Tăng dần</option>
            </select>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Hiển thị / trang</label>
            <select
              value={pageSize}
              onChange={(e) => setPageSize(Number(e.target.value))}
              className="w-full rounded-xl border border-blue-200 px-3 py-2 bg-white text-gray-900"
            >
              <option value={6}>6</option>
              <option value={9}>9</option>
              <option value={12}>12</option>
            </select>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <p className="text-sm text-gray-600">
            Hiển thị <span className="font-semibold text-gray-900">{paginatedBookings.length}</span> /{' '}
            <span className="font-semibold text-gray-900">{filteredBookings.length}</span> booking
          </p>

          <div className="flex gap-2">
            <button
              onClick={resetFilters}
              className="px-3 py-2 border border-blue-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-blue-50 transition-colors"
            >
              Xóa filter
            </button>
            <button
              onClick={loadBookings}
              className="px-3 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg text-sm font-semibold transition-colors"
            >
              Làm mới dữ liệu
            </button>
          </div>
        </div>
      </div>

      {filteredBookings.length === 0 ? (
        <div className="text-center py-12 text-gray-500 bg-white rounded-2xl border border-blue-100">
          <span className="material-symbols-outlined text-6xl mb-4">search_off</span>
          <h3 className="text-lg font-semibold mb-2 text-gray-800">Không tìm thấy booking phù hợp</h3>
          <p className="mb-4">Hãy thử thay đổi từ khóa, ngày hoặc cách sắp xếp.</p>
          <button
            onClick={resetFilters}
            className="px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg font-semibold transition-colors"
          >
            Đặt lại bộ lọc
          </button>
        </div>
      ) : (
        <>
          <div className="space-y-4">{paginatedBookings.map((booking) => renderBookingCard(booking))}</div>

          <div className="flex items-center justify-center gap-2 pt-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-2 rounded-lg border border-blue-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-50 transition-colors"
            >
              Trước
            </button>
            <span className="text-sm text-gray-700 px-3">
              Trang <span className="font-semibold">{currentPage}</span> / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-2 rounded-lg border border-blue-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-50 transition-colors"
            >
              Sau
            </button>
          </div>
        </>
      )}

      {showRejectModal && selectedBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-7 max-w-md w-full border border-blue-100 shadow-[0_12px_30px_rgba(15,23,42,0.12)]">
            <h3 className="text-xl font-bold mb-4 text-gray-900">Từ chối booking</h3>
            <p className="text-gray-600 mb-4">Booking từ {getGuestName(selectedBooking)}</p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Vui lòng cho biết lý do từ chối..."
              className="w-full p-3 border border-blue-200 rounded-xl mb-4 bg-white text-gray-900"
              rows={4}
            />
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setSelectedBooking(null);
                }}
                className="flex-1 px-4 py-2 border border-blue-200 rounded-xl font-semibold hover:bg-blue-50 transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={submitReject}
                disabled={isProcessing || !rejectReason.trim()}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white rounded-lg font-semibold transition-colors"
              >
                {isProcessing ? 'Đang xử lý...' : 'Xác nhận từ chối'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showGuestDetailsModal && selectedBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-7 max-w-lg w-full max-h-[90vh] overflow-y-auto border border-blue-100 shadow-[0_12px_30px_rgba(15,23,42,0.12)]">
            <div className="flex justify-between items-start mb-6">
              <h3 className="text-2xl font-bold text-gray-900">Thông tin khách</h3>
              <button
                onClick={() => {
                  setShowGuestDetailsModal(false);
                  setSelectedBooking(null);
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="flex items-start gap-4 mb-6 pb-6 border-b border-blue-100">
              <div className="relative">
                {selectedBooking.guest?.avatarUrl ? (
                  <img
                    src={selectedBooking.guest.avatarUrl}
                    alt={getGuestName(selectedBooking)}
                    className="w-20 h-20 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-primary text-white flex items-center justify-center text-2xl font-bold">
                    {(selectedBooking.guest?.firstName || 'G').charAt(0)}
                    {(selectedBooking.guest?.lastName || 'U').charAt(0)}
                  </div>
                )}
              </div>
              <div className="flex-1">
                <h4 className="text-xl font-semibold text-gray-900 mb-1">{getGuestName(selectedBooking)}</h4>
                <div className="flex items-center gap-2 text-gray-600 mb-2">
                  <span className="material-symbols-outlined text-sm">mail</span>
                  <span className="text-sm">{selectedBooking.guest?.email || '--'}</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h5 className="font-semibold text-gray-900 text-lg mb-3">Thông tin đặt chỗ</h5>

              <div className="flex items-start gap-3">
                <span className="material-symbols-outlined text-gray-400 mt-0.5">home</span>
                <div>
                  <p className="text-sm text-gray-500">Property</p>
                  <p className="font-medium text-gray-900">{getPropertyTitle(selectedBooking)}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="material-symbols-outlined text-gray-400 mt-0.5">confirmation_number</span>
                <div>
                  <p className="text-sm text-gray-500">Mã booking</p>
                  <p className="font-mono font-medium text-gray-900">{selectedBooking.bookingCode || '--'}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="material-symbols-outlined text-gray-400 mt-0.5">calendar_today</span>
                <div>
                  <p className="text-sm text-gray-500">Ngày nhận/trả phòng</p>
                  <p className="font-medium text-gray-900">
                    {formatDate(selectedBooking.checkInDate)} - {formatDate(selectedBooking.checkOutDate)}
                  </p>
                  <p className="text-sm text-gray-600">{selectedBooking.numNights || 0} đêm</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="material-symbols-outlined text-gray-400 mt-0.5">group</span>
                <div>
                  <p className="text-sm text-gray-500">Số khách</p>
                  <div className="space-y-1">
                    <p className="font-medium text-gray-900">Tổng: {selectedBooking.numGuests || 0} khách</p>
                    <p className="text-sm text-gray-600">
                      {selectedBooking.numAdults || 0} người lớn
                      {(selectedBooking.numChildren || 0) > 0 && `, ${selectedBooking.numChildren} trẻ em`}
                      {(selectedBooking.numInfants || 0) > 0 && `, ${selectedBooking.numInfants} em bé`}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="material-symbols-outlined text-gray-400 mt-0.5">payments</span>
                <div>
                  <p className="text-sm text-gray-500">Thông tin thanh toán</p>
                  <p className="font-semibold text-lg text-gray-900">${Number(selectedBooking.totalPrice || 0).toFixed(2)}</p>
                  <div className="text-sm text-gray-600 space-y-0.5">
                    <p>
                      Trạng thái:{' '}
                      <span className={selectedBooking.paymentStatus === 'PAID' ? 'text-green-600 font-medium' : 'text-orange-600 font-medium'}>
                        {selectedBooking.paymentStatus === 'PAID' ? 'Đã thanh toán' : 'Chưa thanh toán'}
                      </span>
                    </p>
                    {selectedBooking.paymentMethod && <p>Phương thức: {selectedBooking.paymentMethod}</p>}
                  </div>
                </div>
              </div>

              {selectedBooking.guestMessage && (
                <div className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-gray-400 mt-0.5">chat_bubble</span>
                  <div>
                    <p className="text-sm text-gray-500">Lời nhắn từ khách</p>
                    <p className="text-gray-900 bg-blue-50 p-3 rounded-lg mt-1">{selectedBooking.guestMessage}</p>
                  </div>
                </div>
              )}

              {selectedBooking.specialRequests && (
                <div className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-gray-400 mt-0.5">flag</span>
                  <div>
                    <p className="text-sm text-gray-500">Yêu cầu đặc biệt</p>
                    <p className="text-gray-900 bg-yellow-50 p-3 rounded-lg mt-1">{selectedBooking.specialRequests}</p>
                  </div>
                </div>
              )}

              <div className="flex items-start gap-3">
                <span className="material-symbols-outlined text-gray-400 mt-0.5">info</span>
                <div>
                  <p className="text-sm text-gray-500">Trạng thái booking</p>
                  <div className="mt-1">{getStatusBadge(selectedBooking.status, selectedBooking.paymentStatus)}</div>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-blue-100 flex gap-3">
              <button
                onClick={() => {
                  setShowGuestDetailsModal(false);
                  setSelectedBooking(null);
                }}
                className="flex-1 px-4 py-2 border border-blue-200 rounded-xl font-semibold hover:bg-blue-50 transition-colors"
              >
                Đóng
              </button>
              {selectedBooking.status === 'PENDING' && selectedBooking.paymentStatus === 'PAID' && (
                <>
                  <button
                    onClick={() => {
                      setShowGuestDetailsModal(false);
                      handleConfirm(selectedBooking);
                    }}
                    className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-colors"
                  >
                    Đồng ý
                  </button>
                  <button
                    onClick={() => {
                      setShowGuestDetailsModal(false);
                      handleReject(selectedBooking);
                    }}
                    className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-colors"
                  >
                    Từ chối
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReservationList;
