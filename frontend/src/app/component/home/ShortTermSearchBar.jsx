import React, { useState, useRef, useEffect } from 'react';
import DatePicker from './DatePicker';
import GuestSelector from './GuestSelector';

const ShortTermSearchBar = ({ onSearch, initialKeyword = '' }) => {
  const [searchKeyword, setSearchKeyword] = useState(initialKeyword);
  const [checkIn, setCheckIn] = useState(null);
  const [checkOut, setCheckOut] = useState(null);
  const [guests, setGuests] = useState({ adults: 1, children: 0, infants: 0, pets: 0 });
  const [openPanel, setOpenPanel] = useState(null);

  const dateRef = useRef(null);
  const guestRef = useRef(null);

  // Close panels when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dateRef.current && !dateRef.current.contains(event.target) && openPanel === 'dates') {
        setOpenPanel(null);
      }
      if (guestRef.current && !guestRef.current.contains(event.target) && openPanel === 'guests') {
        setOpenPanel(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [openPanel]);

  const handleSearch = () => {
    if (onSearch) {
      onSearch({
        rentalMode: 'short-term',
        location: searchKeyword,
        checkIn,
        checkOut,
        guests,
      });
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const formatGuests = () => {
    const totalGuests = guests.adults + guests.children;
    const parts = [];

    if (totalGuests > 0) {
      parts.push(`${totalGuests} guest${totalGuests > 1 ? 's' : ''}`);
    }
    if (guests.infants > 0) {
      parts.push(`${guests.infants} infant${guests.infants > 1 ? 's' : ''}`);
    }
    if (guests.pets > 0) {
      parts.push(`${guests.pets} pet${guests.pets > 1 ? 's' : ''}`);
    }

    return parts.length > 0 ? parts.join(', ') : 'Add guests';
  };

  return (
    <div className="w-full max-w-[850px] bg-white dark:bg-gray-800 rounded-[32px] md:rounded-full shadow-xl flex flex-col md:flex-row items-stretch md:items-center divide-y md:divide-y-0 md:divide-x divide-gray-200 dark:divide-gray-700 p-0 md:p-2 relative" style={{ overflow: 'visible' }}>
      {/* Location */}
      <div className="relative flex-1 w-full px-8 py-4 md:px-6 md:py-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 md:rounded-full cursor-pointer transition-colors group text-left">
        <label className="block text-xs font-bold text-[#0d141b] dark:text-white uppercase tracking-wider mb-0.5">
          Where
        </label>
        <input
          className="w-full border-none p-0 text-sm bg-transparent focus:ring-0 placeholder:text-gray-400 text-gray-700 dark:text-gray-200 truncate focus:outline-none"
          placeholder="Search destinations"
          type="text"
          value={searchKeyword}
          onChange={(e) => setSearchKeyword(e.target.value)}
          onKeyDown={handleKeyDown}
        />
      </div>

      {/* Check in / Check out */}
      <div className="relative flex md:divide-x divide-gray-200 dark:divide-gray-700" ref={dateRef}>
        <div
          onClick={() => setOpenPanel(openPanel === 'dates' ? null : 'dates')}
          className={`relative w-full md:w-[140px] px-8 py-4 md:px-6 md:py-3 md:rounded-full cursor-pointer transition-colors group text-left ${
            openPanel === 'dates' ? 'bg-gray-100 dark:bg-gray-700' : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'
          }`}
        >
          <label className="block text-xs font-bold text-[#0d141b] dark:text-white uppercase tracking-wider mb-0.5">
            Check in
          </label>
          <div className={`text-sm ${checkIn ? 'text-gray-700 dark:text-gray-200' : 'text-gray-400'}`}>
            {checkIn ? formatDate(checkIn) : 'Add dates'}
          </div>
        </div>

        <div
          onClick={() => setOpenPanel(openPanel === 'dates' ? null : 'dates')}
          className={`relative w-full md:w-[140px] px-8 py-4 md:px-6 md:py-3 md:rounded-full cursor-pointer transition-colors group text-left border-l border-gray-200 dark:border-gray-700 md:border-l-0 ${
            openPanel === 'dates' ? 'bg-gray-100 dark:bg-gray-700' : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'
          }`}
        >
          <label className="block text-xs font-bold text-[#0d141b] dark:text-white uppercase tracking-wider mb-0.5">
            Check out
          </label>
          <div className={`text-sm ${checkOut ? 'text-gray-700 dark:text-gray-200' : 'text-gray-400'}`}>
            {checkOut ? formatDate(checkOut) : 'Add dates'}
          </div>
        </div>

        {openPanel === 'dates' && (
          <DatePicker
            checkIn={checkIn}
            checkOut={checkOut}
            onCheckInChange={setCheckIn}
            onCheckOutChange={setCheckOut}
            onClose={() => setOpenPanel(null)}
          />
        )}
      </div>

      {/* Guests & Search Button */}
      <div className="relative flex-1 w-full" ref={guestRef}>
        <div
          className="pl-8 pr-3 py-3 md:pl-6 md:pr-2 md:py-2 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/50 md:rounded-full cursor-pointer transition-colors text-left"
          onClick={() => setOpenPanel(openPanel === 'guests' ? null : 'guests')}
        >
          <div className="flex flex-col">
            <label className="block text-xs font-bold text-[#0d141b] dark:text-white uppercase tracking-wider mb-0.5">
              Who
            </label>
            <div className={`text-sm ${guests.adults > 0 || guests.children > 0 ? 'text-gray-700 dark:text-gray-200' : 'text-gray-400'} truncate max-w-[120px]`}>
              {formatGuests()}
            </div>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleSearch();
            }}
            className="bg-primary hover:bg-blue-600 text-white h-12 w-12 rounded-full flex items-center justify-center shadow-md transition-transform hover:scale-105 shrink-0 z-10"
          >
            <span className="material-symbols-outlined">search</span>
          </button>
        </div>

        {openPanel === 'guests' && (
          <GuestSelector
            guests={guests}
            onChange={setGuests}
            onClose={() => setOpenPanel(null)}
          />
        )}
      </div>
    </div>
  );
};

export default ShortTermSearchBar;