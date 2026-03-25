import React, { useState } from 'react';

const ContactWidget = ({ property }) => {
  const [showFullPhone, setShowFullPhone] = useState(false);
  const [phoneCopied, setPhoneCopied] = useState(false);

  const handleZaloContact = () => {
    // Mở Zalo với số điện thoại nếu có
    if (property.host?.phone) {
      // Định dạng số điện thoại (xóa dấu cách, gạch ngang...)
      const phoneNumber = property.host.phone.replace(/\D/g, '');
      window.open(`https://zalo.me/${phoneNumber}`, '_blank');
    } else {
      alert('Số điện thoại chưa được cập nhật. Vui lòng liên hệ qua email.');
    }
  };

  const handlePhoneClick = () => {
    if (!property.host?.phone) {
      alert('Số điện thoại chưa được cập nhật. Vui lòng liên hệ qua email: ' + property.host?.email);
      return;
    }

    if (!showFullPhone) {
      // Click lần 1: Hiển thị đầy đủ số
      setShowFullPhone(true);
    } else if (!phoneCopied) {
      // Click lần 2: Copy vào bộ nhớ tạm
      navigator.clipboard.writeText(property.host.phone).then(() => {
        setPhoneCopied(true);
        setTimeout(() => {
          setPhoneCopied(false);
        }, 2000);
      });
    }
  };

  const getMaskedPhone = (phone) => {
    if (!phone) return '';
    // Ẩn 4 số cuối: 0917 111 ***
    const digits = phone.replace(/\D/g, '');
    if (digits.length <= 4) return phone;
    const visiblePart = phone.slice(0, -4);
    return visiblePart + ' ***';
  };

  return (
    <div className="lg:col-span-1">
      <div className="sticky top-24 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 shadow-lg bg-white dark:bg-gray-800">
        
        {/* Thông tin giá */}
        <div className="mb-6 pb-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-baseline gap-2 mb-2">
            <span className="text-3xl font-bold text-gray-900 dark:text-white">
              {property.pricePerMonth?.toLocaleString('vi-VN')}đ
            </span>
            <span className="text-gray-600 dark:text-gray-400">/ tháng</span>
          </div>

          {/* Các chi phí phụ */}
          <div className="space-y-2 mt-4 text-sm">
            {property.electricityCost && (
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Điện:</span>
                <span className="font-medium text-gray-900 dark:text-white">{property.electricityCost}</span>
              </div>
            )}
            {property.waterCost && (
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Nước:</span>
                <span className="font-medium text-gray-900 dark:text-white">{property.waterCost}</span>
              </div>
            )}
            {property.internetCost && (
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Internet:</span>
                <span className="font-medium text-gray-900 dark:text-white">{property.internetCost}</span>
              </div>
            )}
          </div>

          {/* Đặt cọc & Thời hạn */}
          {(property.depositMonths || property.minimumLeaseMonths) && (
            <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 space-y-2 text-sm">
              {property.depositMonths && (
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Đặt cọc:</span>
                  <span className="font-medium text-gray-900 dark:text-white">{property.depositMonths} tháng</span>
                </div>
              )}
              {property.minimumLeaseMonths && (
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Thời hạn tối thiểu:</span>
                  <span className="font-medium text-gray-900 dark:text-white">{property.minimumLeaseMonths} tháng</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Các nút liên hệ */}
        <div className="space-y-3">
          <button
            onClick={handleZaloContact}
            className="w-full flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-4 rounded-xl transition-colors"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.373 0 0 4.975 0 11.111c0 3.497 1.745 6.616 4.472 8.652.096 4.432-1.468 4.237-1.39 4.237.828 0 3.688-1.333 5.076-2.258C9.243 22.043 10.592 22.222 12 22.222c6.627 0 12-4.975 12-11.111C24 4.975 18.627 0 12 0z"/>
            </svg>
            Liên hệ qua Zalo
          </button>

          {/* Hiển thị số điện thoại */}
          {property.host?.phone ? (
            <button
              onClick={handlePhoneClick}
              className="w-full flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-4 rounded-xl transition-colors relative"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
              </svg>
              <span>{showFullPhone ? property.host.phone : getMaskedPhone(property.host.phone)}</span>
              {phoneCopied && (
                <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs py-1 px-2 rounded">
                  Đã sao chép!
                </span>
              )}
            </button>
          ) : (
            <div className="w-full flex items-center justify-center gap-2 bg-gray-400 text-white font-semibold py-3 px-4 rounded-xl cursor-not-allowed">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
              </svg>
              <span>Chưa có số điện thoại</span>
            </div>
          )}

          <a
            href={`mailto:${property.host?.email}`}
            className="w-full flex items-center justify-center gap-2 bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-4 rounded-xl transition-colors"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
              <polyline points="22,6 12,13 2,6"/>
            </svg>
            Gửi Email
          </a>
        </div>

        {/* Thông tin chủ nhà */}
        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <img
              src={property.host?.avatarUrl || 'https://via.placeholder.com/48'}
              alt={`${property.host?.firstName} ${property.host?.lastName}`}
              className="w-12 h-12 rounded-full object-cover"
            />
            <div className="flex-1">
              <p className="font-semibold text-gray-900 dark:text-white">
                {property.host?.firstName} {property.host?.lastName}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Chủ phòng / CTV</p>
            </div>
            {property.host?.isVerified && (
              <div className="flex items-center justify-center w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full">
                <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
                </svg>
              </div>
            )}
          </div>
        </div>

        {/* Lưu ý quan trọng */}
        <div className="mt-6 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl">
          <div className="flex gap-2">
            <svg className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
            </svg>
            <div className="text-sm">
              <p className="font-semibold text-amber-900 dark:text-amber-300 mb-1">Lưu ý quan trọng</p>
              <p className="text-amber-800 dark:text-amber-400">
                Vui lòng liên hệ trực tiếp với chủ nhà để xem phòng và thỏa thuận chi tiết hợp đồng thuê.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactWidget;