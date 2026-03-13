import React, { useState } from 'react';
import 'material-symbols';

const LongTermSearchBar = ({ onSearch, initialKeyword = '' }) => {
  const [location, setLocation] = useState(initialKeyword);
  const [priceRange, setPriceRange] = useState('');
  const [roomType, setRoomType] = useState('');

  const priceRanges = [
    { value: '', label: 'Tất cả mức giá' },
    { value: '0-2000000', label: 'Dưới 2 triệu' },
    { value: '2000000-3000000', label: '2-3 triệu' },
    { value: '3000000-5000000', label: '3-5 triệu' },
    { value: '5000000-7000000', label: '5-7 triệu' },
    { value: '7000000-10000000', label: '7-10 triệu' },
    { value: '10000000-999999999', label: 'Trên 10 triệu' },
  ];

  const roomTypes = [
    { value: '', label: 'Tất cả loại phòng' },
    { value: 'single', label: 'Phòng đơn' },
    { value: 'double', label: 'Phòng đôi' },
    { value: 'loft', label: 'Phòng có gác' },
    { value: 'studio', label: 'Studio / Căn hộ mini' },
    { value: 'apartment', label: 'Căn hộ' },
  ];

  const handleSearch = () => {
    if (onSearch) {
      // Tách chuỗi giá để lấy min và max
      const [min, max] = priceRange ? priceRange.split('-').map(Number) : [undefined, undefined];

      onSearch({
        rentalMode: 'long-term',
        location,
        priceRange: priceRange ? { min, max } : undefined,
        roomType: roomType || undefined,
      });
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="w-full max-w-[900px] bg-white rounded-[32px] md:rounded-full shadow-xl p-2 relative">
      <div className="flex flex-col md:flex-row items-stretch md:items-center gap-2">
        {/* Location Input */}
        <div className="flex-1 px-6 py-3 hover:bg-gray-50 rounded-full cursor-pointer transition-colors group">
          <label className="block text-xs font-bold text-[#0d141b] uppercase tracking-wider mb-0.5">
            Địa điểm
          </label>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined !text-[20px] text-gray-400">location_on</span>
            <input
              className="w-full border-none p-0 text-sm bg-transparent focus:ring-0 placeholder:text-gray-400 text-gray-700 focus:outline-none"
              placeholder="Bạn muốn thuê trọ ở đâu?"
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              onKeyDown={handleKeyDown}
            />
          </div>
        </div>

        {/* Price Range Select */}
        <div className="relative px-6 py-3 hover:bg-gray-50 rounded-full cursor-pointer transition-colors group min-w-[180px]">
          <label className="block text-xs font-bold text-[#0d141b] uppercase tracking-wider mb-0.5">
            Mức giá
          </label>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined !text-[20px] text-gray-400">payments</span>
            <select
              value={priceRange}
              onChange={(e) => setPriceRange(e.target.value)}
              className="w-full border-none p-0 text-sm bg-transparent focus:ring-0 text-gray-700 focus:outline-none cursor-pointer appearance-none pr-6"
            >
              {priceRanges.map((range) => (
                <option key={range.value} value={range.value}>
                  {range.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Room Type Select */}
        <div className="relative px-6 py-3 hover:bg-gray-50 rounded-full cursor-pointer transition-colors group min-w-[180px]">
          <label className="block text-xs font-bold text-[#0d141b] uppercase tracking-wider mb-0.5">
            Loại phòng
          </label>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined !text-[20px] text-gray-400">bed</span>
            <select
              value={roomType}
              onChange={(e) => setRoomType(e.target.value)}
              className="w-full border-none p-0 text-sm bg-transparent focus:ring-0 text-gray-700 focus:outline-none cursor-pointer appearance-none pr-6"
            >
              {roomTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Search Button */}
        <button
          onClick={handleSearch}
          className="bg-primary hover:bg-blue-600 text-white px-8 py-3 rounded-full flex items-center justify-center gap-2 shadow-md transition-all hover:scale-105 font-semibold text-sm"
        >
          <span className="material-symbols-outlined !text-[20px]">search</span>
          <span className="hidden md:inline">Tìm phòng</span>
        </button>
      </div>
    </div>
  );
};

export default LongTermSearchBar;