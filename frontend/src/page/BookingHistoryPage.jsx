import React, { useEffect, useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { api } from '../shared/services/api';
import { getCurrentUser } from '../shared/services/authService';

const STORAGE_KEY = 'guest-booking-history';

const formatCurrency = (value) => `${new Intl.NumberFormat('vi-VN').format(Number(value) || 0)} đ`;

const formatDate = (dateValue) => {
  if (!dateValue) return '--';
  const d = new Date(dateValue);
  if (Number.isNaN(d.getTime())) return dateValue;
  return d.toLocaleDateString('vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' });
};

const formatDateRange = (checkIn, checkOut) => {
  if (!checkIn || !checkOut) return '--';
  const inDate = new Date(checkIn);
  const outDate = new Date(checkOut);
  if (Number.isNaN(inDate.getTime()) || Number.isNaN(outDate.getTime())) return `${checkIn} - ${checkOut}`;
  return `${inDate.toLocaleDateString('vi-VN')} - ${outDate.toLocaleDateString('vi-VN')}`;
};

const getStatusTag = (booking) => {
  const status = booking?.status;
  if (status === 'CONFIRMED') return { label: 'Đã xác nhận', className: 'bg-emerald-50 text-emerald-700' };
  if (status === 'CANCELLED') return { label: 'Đã hủy', className: 'bg-rose-50 text-rose-600' };
  return { label: 'Chờ xác nhận', className: 'bg-amber-50 text-amber-700' };
};

function BookingDetailModal({ booking, onClose }) {
  if (!booking) return null;
  const property = booking?.property || {};
  const statusTag = getStatusTag(booking);
  const totalGuests = booking?.numGuests ?? (booking?.numAdults || 0) + (booking?.numChildren || 0) + (booking?.numInfants || 0);

  return (
    <div className="fixed inset-0 z-[999] bg-black/50 p-4 flex items-center justify-center" onClick={onClose}>
      <div
        className="w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 z-10 bg-white border-b border-gray-100 px-6 py-4 flex justify-between items-center">
          <h3 className="text-xl font-bold text-gray-900">Chi tiết đặt phòng</h3>
          <button className="text-gray-500 hover:text-gray-700" onClick={onClose}>
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="px-6 py-5 space-y-5">
          <div className="flex items-center justify-between">
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusTag.className}`}>{statusTag.label}</span>
            <p className="text-right">
              <span className="block text-sm text-gray-500">Tổng tiền</span>
              <span className="text-2xl font-extrabold text-gray-900">{formatCurrency(booking?.totalPrice)}</span>
            </p>
          </div>

          <div className="border border-gray-100 rounded-xl p-4 flex gap-3">
            <img
              src={property?.primaryImageUrl || 'https://placehold.co/120x88?text=Stay'}
              alt={property?.title || 'Property image'}
              className="w-[120px] h-[88px] rounded-lg object-cover bg-gray-100"
            />
            <div>
              <h4 className="text-lg font-semibold text-gray-900">{property?.title || 'Chỗ ở'}</h4>
              <p className="text-sm text-gray-500">{property?.address || 'Chưa có địa chỉ'}</p>
              <p className="text-sm text-gray-600 mt-1">{totalGuests} khách</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="rounded-xl border border-gray-100 p-4">
              <p className="text-gray-500">Nhận phòng</p>
              <p className="font-semibold text-gray-900">{formatDate(booking?.checkInDate)}</p>
            </div>
            <div className="rounded-xl border border-gray-100 p-4">
              <p className="text-gray-500">Trả phòng</p>
              <p className="font-semibold text-gray-900">{formatDate(booking?.checkOutDate)}</p>
            </div>
          </div>

          <div className="rounded-xl border border-gray-100 p-4">
            <h5 className="font-semibold text-gray-900 mb-3">Chi tiết thanh toán</h5>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-gray-500">Mã booking</span><span className="font-medium">{booking?.bookingCode || '--'}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Giá phòng</span><span className="font-medium">{formatCurrency(booking?.subtotal)}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Phí vệ sinh</span><span className="font-medium">{formatCurrency(booking?.cleaningFee)}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Phí dịch vụ</span><span className="font-medium">{formatCurrency(booking?.serviceFee)}</span></div>
              <div className="flex justify-between border-t border-gray-100 pt-2 mt-1 font-semibold text-base">
                <span>Tổng cộng (VND)</span>
                <span>{formatCurrency(booking?.totalPrice)}</span>
              </div>
              <div className="flex justify-between"><span className="text-gray-500">Thanh toán</span><span className="font-medium">{booking?.paymentMethod || 'QR_CODE'}</span></div>
            </div>
          </div>
        </div>

        <div className="sticky bottom-0 bg-white border-t border-gray-100 p-4">
          <button
            className="w-full rounded-lg bg-rose-500 hover:bg-rose-600 text-white font-semibold py-3 transition-colors"
            onClick={onClose}
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}

export default function BookingHistoryPage() {
  const location = useLocation();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await getCurrentUser();
        setUser(currentUser);
      } catch (e) {
        setUser(null);
      }
    };
    loadUser();
  }, []);

  useEffect(() => {
    const loadBookings = async () => {
      setLoading(true);
      setError('');
      try {
        const [upcomingRes] = await Promise.all([api.getUpcomingBookings()]);
        const upcoming = upcomingRes?.success ? upcomingRes.data : [];

        let localBookings = [];
        try {
          const raw = localStorage.getItem(STORAGE_KEY);
          localBookings = raw ? JSON.parse(raw) : [];
          if (!Array.isArray(localBookings)) localBookings = [];
        } catch (e) {
          localBookings = [];
        }

        const mergedMap = new Map();
        [...upcoming, ...localBookings].forEach((item) => {
          if (!item?.id) return;
          mergedMap.set(item.id, item);
        });
        const merged = Array.from(mergedMap.values()).sort((a, b) => {
          const ad = new Date(a?.createdAt || a?.checkInDate || 0).getTime();
          const bd = new Date(b?.createdAt || b?.checkInDate || 0).getTime();
          return bd - ad;
        });

        setBookings(merged);

        const highlightedId = location?.state?.highlightedBookingId;
        if (highlightedId) {
          const highlighted = merged.find((b) => b.id === highlightedId);
          if (highlighted) setSelectedBooking(highlighted);
        }
      } catch (e) {
        setError('Không thể tải lịch sử đặt phòng.');
      } finally {
        setLoading(false);
      }
    };

    loadBookings();
  }, [location.state]);

  const sideDisplayName = useMemo(() => {
    if (!user) return 'Khách hàng';
    return `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email || 'Khách hàng';
  }, [user]);

  return (
    <div className="bg-[#f4f5f7] min-h-screen py-8">
      <div className="max-w-6xl mx-auto px-4 md:px-6 flex flex-col lg:flex-row gap-6">
        <aside className="lg:w-72">
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-14 h-14 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center font-bold text-lg">
                {sideDisplayName.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-semibold text-gray-900">{sideDisplayName}</p>
                <p className="text-xs text-gray-500">Thành viên</p>
              </div>
            </div>

            <nav className="space-y-1 text-sm">
              <Link to="/profile" className="flex items-center gap-2 rounded-lg px-3 py-2 text-gray-600 hover:bg-gray-50">
                <span className="material-symbols-outlined !text-[18px]">person</span>Thông tin cá nhân
              </Link>
              <div className="flex items-center gap-2 rounded-lg px-3 py-2 bg-rose-50 text-rose-600 font-semibold">
                <span className="material-symbols-outlined !text-[18px]">receipt_long</span>Lịch sử đặt phòng
              </div>
            </nav>
          </div>
        </aside>

        <section className="flex-1 bg-white rounded-2xl border border-gray-100 p-5 md:p-6">
          <div className="flex items-center justify-between mb-5">
            <h1 className="text-2xl font-bold text-gray-900">Lịch sử đặt phòng</h1>
          </div>

          {loading && <p className="text-gray-500">Đang tải dữ liệu...</p>}
          {!loading && error && <p className="text-rose-600">{error}</p>}

          {!loading && !error && (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-500 border-b border-gray-100">
                    <th className="pb-3 font-semibold">Chỗ ở</th>
                    <th className="pb-3 font-semibold">Thời gian</th>
                    <th className="pb-3 font-semibold">Trạng thái</th>
                    <th className="pb-3 font-semibold text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((booking) => {
                    const statusTag = getStatusTag(booking);
                    return (
                      <tr key={booking.id} className="border-b border-gray-50">
                        <td className="py-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={booking?.property?.primaryImageUrl || 'https://placehold.co/64x48?text=Stay'}
                              alt={booking?.property?.title || 'Property image'}
                              className="w-16 h-12 rounded-md object-cover bg-gray-100"
                            />
                            <div>
                              <p className="font-semibold text-gray-900 line-clamp-1">{booking?.property?.title || 'Chỗ ở'}</p>
                              <p className="text-xs text-gray-500 line-clamp-1">{booking?.property?.city || booking?.property?.address || 'Việt Nam'}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 text-gray-700">
                          <p>{formatDateRange(booking?.checkInDate, booking?.checkOutDate)}</p>
                          <p className="text-xs text-gray-500">{booking?.numNights || '--'} đêm</p>
                        </td>
                        <td className="py-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusTag.className}`}>{statusTag.label}</span>
                        </td>
                        <td className="py-4 text-right">
                          <button
                            className="text-rose-600 hover:text-rose-700 font-semibold"
                            onClick={() => setSelectedBooking(booking)}
                          >
                            Chi tiết
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {!bookings.length && (
                <div className="text-center py-12 text-gray-500">
                  Bạn chưa có lịch sử đặt phòng.
                </div>
              )}
            </div>
          )}
        </section>
      </div>

      <BookingDetailModal booking={selectedBooking} onClose={() => setSelectedBooking(null)} />
    </div>
  );
}
