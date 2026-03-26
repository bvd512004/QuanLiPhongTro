import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import  hostService  from '../services/host.service';

const DashboardBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRecentBookings();
  }, []);

  const loadRecentBookings = async () => {
    try {
      setLoading(true);
      const response = await hostService.getHostBookings(0, 5);
      if (response.success && response.data) {
        setBookings(response.data.content);
      }
    } catch (error) {
      console.error('Failed to load recent bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusDisplay = (booking) => {
    const { status, paymentStatus, checkInDate, checkOutDate } = booking;

    if (status === 'PENDING') {
      if (paymentStatus === 'PAID') {
        return { text: 'Chờ duyệt', color: 'text-blue-600 bg-blue-50' };
      }
      return { text: 'Chờ thanh toán', color: 'text-gray-600 bg-gray-50' };
    }

    if (status === 'CONFIRMED') {
      const now = new Date();
      const checkIn = new Date(checkInDate);
      const checkOut = new Date(checkOutDate);

      if (now < checkIn) {
        return { text: 'Sắp tới', color: 'text-blue-600 bg-blue-50' };
      }
      if (now >= checkIn && now <= checkOut) {
        return { text: 'Đang ở', color: 'text-emerald-600 bg-emerald-50' };
      }
      return { text: 'Hoàn tất', color: 'text-slate-600 bg-slate-100' };
    }

    if (status === 'CANCELLED') {
      return { text: 'Đã hủy', color: 'text-red-600 bg-red-50' };
    }

    return { text: status, color: 'text-gray-600 bg-gray-50' };
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      day: 'numeric',
      month: 'short'
    });
  };

  if (loading) {
    return (
      <div className="h-full flex flex-col p-7 rounded-2xl bg-white border border-blue-100 shadow-[0_10px_28px_rgba(15,23,42,0.06)]">
        <div className="flex items-center justify-between mb-6 shrink-0">
          <div className="h-6 bg-gray-300 rounded w-40 animate-pulse"></div>
          <div className="h-5 bg-gray-300 rounded w-20 animate-pulse"></div>
        </div>
        <div className="flex flex-col gap-4 overflow-y-auto pr-1 flex-1">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center gap-4 p-3 rounded-lg animate-pulse">
              <div className="size-10 rounded-full bg-gray-300"></div>
              <div className="flex-1 min-w-0">
                <div className="h-4 bg-gray-300 rounded w-24 mb-1"></div>
                <div className="h-3 bg-gray-300 rounded w-32 mb-1"></div>
                <div className="h-3 bg-gray-300 rounded w-20"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col p-7 rounded-2xl bg-white border border-blue-100 shadow-[0_10px_28px_rgba(15,23,42,0.06)]">
      <div className="flex items-center justify-between mb-6 shrink-0">
        <h3 className="text-lg font-semibold tracking-tight leading-tight text-slate-900">Đặt phòng gần đây</h3>
        <Link to="/reservations" className="text-sm font-semibold text-primary hover:text-primary/80">
          Xem tất cả
        </Link>
      </div>

      <div className="flex flex-col gap-4 overflow-y-auto pr-1 flex-1">
        {bookings.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <span className="material-symbols-outlined text-4xl mb-2">event_busy</span>
            <p>Chưa có đặt phòng nào</p>
          </div>
        ) : (
          bookings.map((booking) => {
            const status = getStatusDisplay(booking);
            return (
              <Link
                to="/reservations"
                key={booking.id}
                className="flex items-center gap-4 p-3 rounded-xl hover:bg-blue-50 transition-colors group cursor-pointer"
              >
                <img
                  src={booking.guest.avatarUrl || `https://api.dicebear.com/9.x/avataaars/svg?seed=${booking.guest.firstName}`}
                  alt={`${booking.guest.firstName} ${booking.guest.lastName}`}
                  className="size-10 rounded-full bg-slate-100 object-cover"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-0.5">
                    <h4 className="text-sm font-semibold leading-snug tracking-[0.01em] text-slate-900 truncate">
                      {booking.guest.firstName} {booking.guest.lastName}
                    </h4>
                    <span className={`text-[10px] font-semibold tracking-[0.02em] px-2 py-0.5 rounded-full ${status.color}`}>
                      {status.text}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed tracking-[0.01em] truncate mb-1">
                    {booking.property.title}
                  </p>
                  <div className="flex items-center gap-1 text-xs text-slate-400">
                    <span className="material-symbols-outlined !text-[12px]">calendar_month</span>
                    <span>
                      {formatDate(booking.checkInDate)} - {formatDate(booking.checkOutDate)}
                    </span>
                  </div>
                </div>
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
};

export default DashboardBookings;