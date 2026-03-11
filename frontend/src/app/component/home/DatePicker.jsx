import React, { useState } from 'react';

const DatePicker = ({
  checkIn,
  checkOut,
  onCheckInChange,
  onCheckOutChange,
  onClose
}) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectingCheckOut, setSelectingCheckOut] = useState(false);

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const daysOfWeek = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const isDateDisabled = (date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  const isDateSelected = (date) => {
    if (checkIn && date.toDateString() === checkIn.toDateString()) return 'checkin';
    if (checkOut && date.toDateString() === checkOut.toDateString()) return 'checkout';
    return null;
  };

  const isDateInRange = (date) => {
    if (!checkIn || !checkOut) return false;
    return date > checkIn && date < checkOut;
  };

  const handleDateClick = (date) => {
    if (isDateDisabled(date)) return;

    if (!selectingCheckOut || !checkIn) {
      onCheckInChange(date);
      onCheckOutChange(null);
      setSelectingCheckOut(true);
    } else {
      if (date <= checkIn) {
        onCheckInChange(date);
        onCheckOutChange(null);
      } else {
        onCheckOutChange(date);
        setSelectingCheckOut(false);
      }
    }
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

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

      days.push(
        <button
          key={day}
          onClick={() => handleDateClick(date)}
          disabled={disabled}
          className={`h-10 w-10 rounded-full text-sm font-medium transition-all ${
            disabled
              ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed'
              : selected === 'checkin' || selected === 'checkout'
              ? 'bg-primary text-white'
              : inRange
              ? 'bg-blue-100 dark:bg-blue-900/30 text-gray-900 dark:text-white'
              : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-900 dark:text-white'
          }`}
        >
          {day}
        </button>
      );
    }

    return days;
  };

  const nextMonthDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1);

  const formatDate = (date) => {
    if (!date) return 'Add date';
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const clearDates = () => {
    onCheckInChange(null);
    onCheckOutChange(null);
    setSelectingCheckOut(false);
  };

  return (
    <div className="absolute top-full left-0 md:left-1/2 md:-translate-x-1/2 mt-4 bg-white dark:bg-gray-800 rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-700 p-4 md:p-8 z-[9999] w-[calc(100vw-1rem)] md:w-auto min-w-[320px] md:min-w-[660px] max-w-[95vw] md:max-w-[90vw]">
      <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-200 dark:border-gray-700">
        <div className={`flex-1 p-3 rounded-lg border ${!selectingCheckOut ? 'border-primary bg-blue-50 dark:bg-blue-900/20' : 'border-gray-200 dark:border-gray-600'}`}>
          <div className="text-xs font-bold uppercase text-gray-500 dark:text-gray-400">Check-in</div>
          <div className="font-medium text-gray-900 dark:text-white">{formatDate(checkIn)}</div>
        </div>
        <div className={`flex-1 p-3 rounded-lg border ${selectingCheckOut && checkIn ? 'border-primary bg-blue-50 dark:bg-blue-900/20' : 'border-gray-200 dark:border-gray-600'}`}>
          <div className="text-xs font-bold uppercase text-gray-500 dark:text-gray-400">Check-out</div>
          <div className="font-medium text-gray-900 dark:text-white">{formatDate(checkOut)}</div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        <div className="flex-1 min-w-[280px]">
          <div className="flex items-center justify-between mb-4">
            <button onClick={prevMonth} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors">
              <span className="material-symbols-outlined">chevron_left</span>
            </button>
            <span className="font-semibold text-gray-900 dark:text-white">
              {months[currentMonth.getMonth()]} {currentMonth.getFullYear()}
            </span>
            <div className="w-8 md:hidden" />
          </div>
          <div className="grid grid-cols-7 gap-1 mb-2">
            {daysOfWeek.map(day => <div key={day} className="h-10 flex items-center justify-center text-xs font-medium text-gray-500 dark:text-gray-400">{day}</div>)}
          </div>
          <div className="grid grid-cols-7 gap-1">{renderMonth(currentMonth)}</div>
        </div>

        <div className="flex-1 min-w-[280px]">
          <div className="flex items-center justify-between mb-4">
            <div className="w-8 hidden md:block" />
            <span className="font-semibold text-gray-900 dark:text-white">
              {months[nextMonthDate.getMonth()]} {nextMonthDate.getFullYear()}
            </span>
            <button onClick={nextMonth} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors">
              <span className="material-symbols-outlined">chevron_right</span>
            </button>
          </div>
          <div className="grid grid-cols-7 gap-1 mb-2">
            {daysOfWeek.map(day => <div key={day} className="h-10 flex items-center justify-center text-xs font-medium text-gray-500 dark:text-gray-400">{day}</div>)}
          </div>
          <div className="grid grid-cols-7 gap-1">{renderMonth(nextMonthDate)}</div>
        </div>
      </div>

      <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700 flex justify-between">
        <button onClick={clearDates} className="px-4 py-2 text-sm font-semibold text-gray-900 dark:text-white underline hover:text-primary">
          Clear dates
        </button>
        <button onClick={onClose} className="px-6 py-2 bg-primary text-white rounded-lg font-semibold text-sm hover:bg-blue-600 transition-colors">
          Close
        </button>
      </div>
    </div>
  );
};

export default DatePicker;