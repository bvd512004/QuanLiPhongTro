import React, { useState, useEffect } from 'react';
import  hostService  from '../services/host.service';

const ReservationCalendar = () => {
  const [calendarData, setCalendarData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    loadCalendarData(currentDate.getFullYear(), currentDate.getMonth() + 1);
  }, [currentDate]);

  const loadCalendarData = async (year, month) => {
    try {
      setLoading(true);
      setError('');
      const response = await hostService.getHostBookingCalendar(year, month);
      setCalendarData(response.data || null);
    } catch (error) {
      console.error('Failed to load calendar data:', error);
      setError(error.message || 'Failed to load calendar');
    } finally {
      setLoading(false);
    }
  };

  const generateCalendarDays = () => {
    if (!calendarData) return [];

    const year = calendarData.year;
    const month = calendarData.month;

    // Get first day of month and number of days
    const firstDay = new Date(year, month - 1, 1);
    const lastDay = new Date(year, month, 0);
    const numDaysInMonth = lastDay.getDate();
    const startWeekday = firstDay.getDay(); // 0 = Sunday, 1 = Monday, etc.

    // Convert to Monday = 0, Sunday = 6
    const mondayBasedStartDay = startWeekday === 0 ? 6 : startWeekday - 1;

    const days = [];

    // Add days from previous month
    const prevMonth = new Date(year, month - 2, 0);
    const prevMonthDays = prevMonth.getDate();
    for (let i = mondayBasedStartDay - 1; i >= 0; i--) {
      const day = prevMonthDays - i;
      days.push({
        day: String(day),
        month: 'prev',
        fullDate: new Date(year, month - 2, day),
        content: null
      });
    }

    // Add days from current month
    for (let day = 1; day <= numDaysInMonth; day++) {
      const fullDate = new Date(year, month - 1, day);
      const dateString = fullDate.toISOString().split('T')[0];

      // Find booking for this date
      const booking = calendarData.bookings.find(b => b.date === dateString);

      days.push({
        day: String(day),
        month: 'curr',
        fullDate,
        content: booking || null
      });
    }

    // Add days from next month to complete the grid (up to 42 days total)
    const remainingDays = 42 - days.length;
    for (let day = 1; day <= remainingDays; day++) {
      days.push({
        day: String(day),
        month: 'next',
        fullDate: new Date(year, month, day),
        content: null
      });
    }

    return days;
  };

  const navigateMonth = (direction) => {
    const newDate = new Date(currentDate);
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setCurrentDate(newDate);
  };

  const getMonthYearText = () => {
    if (!calendarData) return '';
    const monthNames = [
      'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
      'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'
    ];
    return `${monthNames[calendarData.month - 1]} ${calendarData.year}`;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-blue-100 p-7 shadow-[0_10px_28px_rgba(15,23,42,0.06)]">
        <div className="flex items-center justify-between mb-6">
          <div className="h-6 bg-gray-300 rounded w-48 animate-pulse"></div>
          <div className="h-6 bg-gray-300 rounded w-32 animate-pulse"></div>
        </div>
        <div className="space-y-2">
          {[1, 2, 3, 4, 5, 6].map((row) => (
            <div key={row} className="flex gap-px">
              {[1, 2, 3, 4, 5, 6, 7].map((col) => (
                <div key={col} className="h-20 bg-gray-200 rounded animate-pulse flex-1"></div>
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-2xl border border-blue-100 p-7 shadow-[0_10px_28px_rgba(15,23,42,0.06)]">
        <div className="text-center py-8 text-red-600">
          {error}
          <br />
          <button
            onClick={() => loadCalendarData(currentDate.getFullYear(), currentDate.getMonth() + 1)}
            className="mt-2 text-primary underline hover:no-underline"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  const days = generateCalendarDays();

  return (
    <div className="bg-white rounded-2xl border border-blue-100 p-7 shadow-[0_10px_28px_rgba(15,23,42,0.06)]">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <h3 className="text-lg font-bold text-slate-900">
            Lịch đặt phòng - {getMonthYearText()}
          </h3>
          <div className="flex gap-2">
            <button
              onClick={() => navigateMonth('prev')}
              className="p-1.5 hover:bg-blue-50 rounded-lg"
            >
              <span className="material-symbols-outlined text-gray-600">chevron_left</span>
            </button>
            <button
              onClick={() => navigateMonth('next')}
              className="p-1.5 hover:bg-blue-50 rounded-lg"
            >
              <span className="material-symbols-outlined text-gray-600">chevron_right</span>
            </button>
          </div>
        </div>
        <a href="#" className="text-sm font-bold text-primary hover:text-blue-700 transition-colors">
          Xem toàn bộ lịch
        </a>
      </div>
      
      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-px bg-blue-100 rounded-xl overflow-hidden border border-blue-100">
        {/* Header */}
        {['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'].map(d => (
          <div key={d} className="bg-blue-50 p-2.5 text-center text-xs font-bold text-slate-500 uppercase">
            {d}
          </div>
        ))}

        {/* Days */}
        {days.map((d, i) => (
          <div key={i} className="bg-white h-24 p-2.5 relative group hover:bg-blue-50/70 transition-colors">
            <span className={`text-sm ${d.month === 'prev' || d.month === 'next' ? 'text-gray-400' : 'text-slate-900 font-medium'}`}>
              {d.day}
            </span>
            
            {d.content?.type === 'checked-in' && (
              <div className="absolute bottom-1 left-1 right-1 bg-green-100 text-green-800 text-[10px] font-bold px-1 py-0.5 rounded truncate">
                Check-in
              </div>
            )}

            {d.content?.type === 'guest' && d.content?.guestName && (
              <>
                <div className="absolute top-1 right-1 size-2 rounded-full bg-orange-500"></div>
                <div className="absolute bottom-1 left-1 right-1 bg-orange-100 text-orange-800 text-[10px] font-bold px-1 py-0.5 rounded truncate border-l-2 border-orange-500">
                  {d.content.guestName}
                </div>
              </>
            )}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="mt-4 flex flex-wrap gap-4 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-green-100 border-2 border-green-500 rounded"></div>
          <span className="text-gray-600">Check-in</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-orange-100 border-2 border-orange-500 rounded"></div>
          <span className="text-gray-600">Đang thuê</span>
        </div>
      </div>
    </div>
  );
};

export default ReservationCalendar;

