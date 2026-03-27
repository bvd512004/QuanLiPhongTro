import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../../shared/services/api';

const BookingWidget = ({
  pricePerNight,
  rating,
  totalReviews,
  cleaningFee = 0,
  serviceFee = 0,
  property,
  initialCheckIn,
  initialCheckOut,
  initialGuests
}) => {
  const navigate = useNavigate();
  const guestPickerRef = useRef(null);
  const datePickerRef = useRef(null);

  // Backend có thể trả về null (BigDecimal chưa set) => không được gọi toLocaleString trực tiếp.
  const toNumber = (value) => {
    if (value === null || value === undefined) return 0;
    const n = typeof value === 'number' ? value : Number(value);
    return Number.isFinite(n) ? n : 0;
  };
  
  const [checkInDate, setCheckInDate] = useState('');
  const [checkOutDate, setCheckOutDate] = useState('');
  const [checkInDateObj, setCheckInDateObj] = useState(null);
  const [checkOutDateObj, setCheckOutDateObj] = useState(null);
  const [numGuests, setNumGuests] = useState(1);
  const [numAdults, setNumAdults] = useState(1);
  const [numChildren, setNumChildren] = useState(0);
  const [numInfants, setNumInfants] = useState(0);
  const [showGuestPicker, setShowGuestPicker] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isCheckingAvailability, setIsCheckingAvailability] = useState(false);
  const [availabilityMessage, setAvailabilityMessage] = useState('');
  const [bookedDates, setBookedDates] = useState([]);
  const [selectingCheckOut, setSelectingCheckOut] = useState(false);

  const nights = checkInDate && checkOutDate
    ? Math.ceil((new Date(checkOutDate).getTime() - new Date(checkInDate).getTime()) / (1000 * 60 * 60 * 24))
    : 0;
  const safePricePerNight = toNumber(pricePerNight);
  const safeCleaningFee = toNumber(cleaningFee);
  const safeServiceFee = toNumber(serviceFee);

  const subtotal = safePricePerNight * nights;
  const total = subtotal + safeCleaningFee + safeServiceFee;

  // Khởi tạo giá trị từ params
  useEffect(() => {
    if (initialCheckIn) {
      const [year, month, day] = initialCheckIn.split('-').map(Number);
      const date = new Date(year, month - 1, day);
      setCheckInDateObj(date);
      setCheckInDate(initialCheckIn);
    }
    if (initialCheckOut) {
      const [year, month, day] = initialCheckOut.split('-').map(Number);
      const date = new Date(year, month - 1, day);
      setCheckOutDateObj(date);
      setCheckOutDate(initialCheckOut);
    }
    if (initialGuests && initialGuests > 0) {
      setNumAdults(initialGuests);
      setNumGuests(initialGuests);
    }
  }, [initialCheckIn, initialCheckOut, initialGuests]);

  useEffect(() => {
    setNumGuests(numAdults + numChildren);
  }, [numAdults, numChildren]);

  useEffect(() => {
    const fetchBookedDates = async () => {
      try {
        const response = await api.getBookedDates(property.id);
        if (response.success && response.data) {
          setBookedDates(response.data);
        }
      } catch (error) {
        console.error('Failed to fetch booked dates:', error);
      }
    };
    fetchBookedDates();
  }, [property.id]);

  // Đồng bộ Object Date với String Date
  useEffect(() => {
    if (checkInDateObj) {
      setCheckInDate(checkInDateObj.toISOString().split('T')[0]);
    }
  }, [checkInDateObj]);

  useEffect(() => {
    if (checkOutDateObj) {
      setCheckOutDate(checkOutDateObj.toISOString().split('T')[0]);
    }
  }, [checkOutDateObj]);

  // Xử lý click outside cho Guest Picker & Date Picker
  const useClickOutside = (ref, setter, state) => {
    useEffect(() => {
      if (!state) return;
      const handleClickOutside = (event) => {
        if (ref.current && !ref.current.contains(event.target)) {
          setter(false);
        }
      };
      const timeoutId = setTimeout(() => {
        document.addEventListener('mousedown', handleClickOutside);
      }, 100);
      return () => {
        clearTimeout(timeoutId);
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }, [state]);
  };

  useClickOutside(guestPickerRef, setShowGuestPicker, showGuestPicker);
  useClickOutside(datePickerRef, setShowDatePicker, showDatePicker);

  const handleCheckAvailability = async () => {
    if (!checkInDate || !checkOutDate) {
      setAvailabilityMessage('Vui lòng chọn ngày nhận và trả phòng');
      return;
    }

    if (numGuests > property.maxGuests) {
      setAvailabilityMessage(`Tối đa chỉ được ${property.maxGuests} khách`);
      return;
    }

    setIsCheckingAvailability(true);
    setAvailabilityMessage('');

    try {
      const response = await api.checkAvailability(property.id, checkInDate, checkOutDate);

      if (response.success && response.data.available) {
        navigate('/checkout', {
          state: {
            propertyId: property.id,
            checkInDate,
            checkOutDate,
            numGuests,
            numAdults,
            numChildren,
            numInfants,
            property: {
              id: property.id,
              title: property.title,
              city: property.city,
              country: property.country,
              primaryImageUrl: property.primaryImageUrl,
              pricePerNight: safePricePerNight,
            },
            numNights: nights,
            subtotal,
            cleaningFee: safeCleaningFee,
            serviceFee: safeServiceFee,
            totalPrice: total,
          }
        });
      } else {
        setAvailabilityMessage('Tài sản này không còn khả dụng cho ngày đã chọn');
      }
    } catch (error) {
      setAvailabilityMessage(error.message || 'Kiểm tra tình trạng khả dụng thất bại');
    } finally {
      setIsCheckingAvailability(false);
    }
  };

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const daysOfWeek = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

  const getDaysInMonth = (date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  const getFirstDayOfMonth = (date) => new Date(date.getFullYear(), date.getMonth(), 1).getDay();

  const isDateDisabled = (date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dateStr = date.toISOString().split('T')[0];
    return date < today || bookedDates.includes(dateStr);
  };

  const isDateSelected = (date) => {
    if (checkInDateObj && date.toDateString() === checkInDateObj.toDateString()) return 'checkin';
    if (checkOutDateObj && date.toDateString() === checkOutDateObj.toDateString()) return 'checkout';
    return null;
  };

  const isDateInRange = (date) => {
    if (!checkInDateObj || !checkOutDateObj) return false;
    return date > checkInDateObj && date < checkOutDateObj;
  };

  const handleDateClick = (date) => {
    if (isDateDisabled(date)) return;

    if (!selectingCheckOut || !checkInDateObj) {
      setCheckInDateObj(date);
      setCheckOutDateObj(null);
      setSelectingCheckOut(true);
    } else if (date <= checkInDateObj) {
      setCheckInDateObj(date);
      setCheckOutDateObj(null);
    } else {
      setCheckOutDateObj(date);
      setSelectingCheckOut(false);
      setShowDatePicker(false);
    }
  };

  const formatDateDisplay = (date) => {
    if (!date) return 'Thêm ngày';
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const clearDates = () => {
    setCheckInDateObj(null);
    setCheckOutDateObj(null);
    setCheckInDate('');
    setCheckOutDate('');
    setSelectingCheckOut(false);
  };

  const [currentMonth, setCurrentMonth] = useState(new Date());

  const nextMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  const prevMonth = () => {
    const prev = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1);
    const today = new Date();
    if (prev >= new Date(today.getFullYear(), today.getMonth())) {
      setCurrentMonth(prev);
    }
  };

  const renderMonth = (monthDate) => {
    const daysInMonth = getDaysInMonth(monthDate);
    const firstDay = getFirstDayOfMonth(monthDate);
    const days = [];

    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-10" />);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(monthDate.getFullYear(), monthDate.getMonth(), day);
      const disabled = isDateDisabled(date);
      const selected = isDateSelected(date);
      const inRange = isDateInRange(date);

      let buttonClass = 'h-9 w-9 rounded-lg text-sm font-medium transition-all hover:scale-105 ';
      if (disabled) {
        buttonClass += 'text-gray-300 dark:text-gray-600 cursor-not-allowed line-through bg-gray-50 dark:bg-gray-800 opacity-60';
      } else if (selected === 'checkin' || selected === 'checkout') {
        buttonClass += 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 shadow-md';
      } else if (inRange) {
        buttonClass += 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 border border-blue-200 dark:border-blue-700';
      } else {
        buttonClass += 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 border border-transparent hover:border-gray-200 dark:hover:border-gray-600';
      }

      days.push(
        <button
          key={day}
          onClick={() => handleDateClick(date)}
          disabled={disabled}
          className={buttonClass}
        >
          {day}
        </button>
      );
    }
    return days;
  };

  const getButtonText = () => {
    if (isCheckingAvailability) return 'Đang kiểm tra...';
    if (nights > 0) return 'Đặt ngay';
    return 'Kiểm tra tình trạng';
  };

  return (
    <div className="relative lg:col-span-1">
      <div className="sticky top-28 z-10 w-full">
        <div className="border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl p-6 bg-white dark:bg-gray-800">
          <div className="flex justify-between items-baseline mb-5">
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold text-gray-900 dark:text-white">{safePricePerNight.toLocaleString('vi-VN')}đ</span>
              <span className="text-gray-500 dark:text-gray-400 text-sm">/ đêm</span>
            </div>
            <div className="flex items-center gap-1.5 text-sm font-semibold text-gray-800 dark:text-gray-200">
              <span className="material-symbols-outlined text-base text-yellow-500 filled">star</span>
              <span>{rating > 0 ? rating.toFixed(1) : 'Mới'}</span>
              <span className="text-gray-300 dark:text-gray-600">·</span>
              <a href="#reviews" className="text-gray-500 dark:text-gray-400 underline hover:text-primary transition-colors">
                {totalReviews} đánh giá
              </a>
            </div>
          </div>

          <div className="rounded-lg border border-gray-300 dark:border-gray-600">
            <div className="grid grid-cols-2">
              <div
                role="button"
                tabIndex={0}
                className="p-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-tl-lg"
                onClick={() => setShowDatePicker(true)}
              >
                <label className="block text-xs font-bold uppercase tracking-wider mb-1 text-gray-900 dark:text-white">Nhận phòng</label>
                <div className="text-sm text-gray-600 dark:text-gray-300">{formatDateDisplay(checkInDateObj)}</div>
              </div>
              <div
                role="button"
                tabIndex={0}
                className="p-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-tr-lg border-l border-gray-300 dark:border-gray-600"
                onClick={() => setShowDatePicker(true)}
              >
                <label className="block text-xs font-bold uppercase tracking-wider mb-1 text-gray-900 dark:text-white">Trả phòng</label>
                <div className="text-sm text-gray-600 dark:text-gray-300">{formatDateDisplay(checkOutDateObj)}</div>
              </div>
            </div>
            <div
              role="button"
              tabIndex={0}
              className="p-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-b-lg border-t border-gray-300 dark:border-gray-600 relative"
              onClick={() => setShowGuestPicker(!showGuestPicker)}
            >
              <label className="block text-xs font-bold uppercase tracking-wider mb-1 text-gray-900 dark:text-white">Khách</label>
              <div className="text-sm text-gray-600 dark:text-gray-300">{numGuests} khách</div>
              <span className={`material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-xl transition-transform duration-200 ${showGuestPicker ? 'rotate-180' : ''}`}>
                expand_more
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleCheckAvailability}
            disabled={isCheckingAvailability}
            className="w-full mt-4 bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white font-bold py-3.5 rounded-lg shadow-lg active:scale-[0.99] transition-all disabled:opacity-50 disabled:cursor-not-allowed text-base"
          >
            {getButtonText()}
          </button>

          {showDatePicker && (
            <div ref={datePickerRef} className="absolute top-full right-0 mt-2 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 p-4 z-20 w-[600px] sm:w-[650px] lg:w-[700px]">
              <div className="flex items-center gap-3 mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
                <div className={`flex-1 p-2.5 rounded-lg border ${selectingCheckOut ? 'border-gray-200 dark:border-gray-600' : 'border-primary bg-blue-50 dark:bg-blue-900/20'}`}>
                  <div className="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">Nhận phòng</div>
                  <div className="text-sm font-medium text-gray-900 dark:text-white">{formatDateDisplay(checkInDateObj)}</div>
                </div>
                <div className={`flex-1 p-2.5 rounded-lg border ${selectingCheckOut && checkInDateObj ? 'border-primary bg-blue-50 dark:bg-blue-900/20' : 'border-gray-200 dark:border-gray-600'}`}>
                  <div className="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">Trả phòng</div>
                  <div className="text-sm font-medium text-gray-900 dark:text-white">{formatDateDisplay(checkOutDateObj)}</div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-3">
                    <button onClick={prevMonth} className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors">
                      <span className="material-symbols-outlined text-lg">chevron_left</span>
                    </button>
                    <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                      {months[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                    </h3>
                    <div className="w-7" />
                  </div>
                  <div className="grid grid-cols-7 gap-1 mb-2">
                    {daysOfWeek.map(day => (
                      <div key={day} className="text-center text-xs font-medium text-gray-500 dark:text-gray-400 py-1.5">{day}</div>
                    ))}
                  </div>
                  <div className="grid grid-cols-7 gap-1">
                    {renderMonth(currentMonth)}
                  </div>
                </div>

                <div className="flex-1 min-w-0 hidden lg:block">
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-7" />
                    <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                      {months[new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1).getMonth()]} {new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1).getFullYear()}
                    </h3>
                    <button onClick={nextMonth} className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors">
                      <span className="material-symbols-outlined text-lg">chevron_right</span>
                    </button>
                  </div>
                  <div className="grid grid-cols-7 gap-1 mb-2">
                    {daysOfWeek.map(day => (
                      <div key={day} className="text-center text-xs font-medium text-gray-500 dark:text-gray-400 py-1.5">{day}</div>
                    ))}
                  </div>
                  <div className="grid grid-cols-7 gap-1">
                    {renderMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center">
                <button onClick={clearDates} className="text-sm font-medium text-gray-600 dark:text-gray-400 underline hover:text-gray-900 dark:hover:text-white">Xóa ngày</button>
                <button onClick={() => setShowDatePicker(false)} className="px-4 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg font-medium text-sm">Đóng</button>
              </div>
            </div>
          )}

          {showGuestPicker && (
            <div ref={guestPickerRef} className="absolute top-full left-0 right-0 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg z-20 p-4 mt-1">
              <div className="space-y-4">
                {/* Người lớn */}
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-semibold text-gray-900 dark:text-white">Người lớn</div>
                    <div className="text-sm text-gray-500">Từ 13 tuổi trở lên</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <button onClick={() => setNumAdults(Math.max(1, numAdults - 1))} disabled={numAdults <= 1} className="w-8 h-8 rounded-full border border-gray-300 disabled:opacity-30"><span className="material-symbols-outlined text-lg">remove</span></button>
                    <span className="w-8 text-center">{numAdults}</span>
                    <button onClick={() => setNumAdults(Math.min(property.maxGuests, numAdults + 1))} disabled={numGuests >= property.maxGuests} className="w-8 h-8 rounded-full border border-gray-300"><span className="material-symbols-outlined text-lg">add</span></button>
                  </div>
                </div>
                {/* Trẻ em */}
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-semibold text-gray-900 dark:text-white">Trẻ em</div>
                    <div className="text-sm text-gray-500">2 - 12 tuổi</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <button onClick={() => setNumChildren(Math.max(0, numChildren - 1))} disabled={numChildren <= 0} className="w-8 h-8 rounded-full border border-gray-300 disabled:opacity-30"><span className="material-symbols-outlined text-lg">remove</span></button>
                    <span className="w-8 text-center">{numChildren}</span>
                    <button onClick={() => setNumChildren(numChildren + 1)} disabled={numGuests >= property.maxGuests} className="w-8 h-8 rounded-full border border-gray-300"><span className="material-symbols-outlined text-lg">add</span></button>
                  </div>
                </div>
              </div>
              <button onClick={() => setShowGuestPicker(false)} className="mt-4 w-full text-center text-sm font-semibold hover:underline">Đóng</button>
            </div>
          )}

          {availabilityMessage && <p className="text-center text-red-500 text-sm mt-3">{availabilityMessage}</p>}

          {nights > 0 && (
            <div className="mt-5 text-sm text-gray-600 dark:text-gray-300">
              <p className="text-center mb-4 text-gray-500">Bạn chưa bị tính phí</p>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="underline">{safePricePerNight.toLocaleString('vi-VN')}đ x {nights} đêm</span>
                  <span>{subtotal.toLocaleString('vi-VN')}đ</span>
                </div>
                <div className="flex justify-between">
                  <span className="underline">Phí vệ sinh</span>
                  <span>{safeCleaningFee.toLocaleString('vi-VN')}đ</span>
                </div>
                <div className="flex justify-between">
                  <span className="underline">Phí dịch vụ</span>
                  <span>{safeServiceFee.toLocaleString('vi-VN')}đ</span>
                </div>
              </div>
              <div className="border-t border-gray-200 dark:border-gray-600 my-4"></div>
              <div className="flex justify-between font-bold text-gray-900 dark:text-white">
                <span>Tổng cộng</span>
                <span>{total.toLocaleString('vi-VN')}đ</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookingWidget;