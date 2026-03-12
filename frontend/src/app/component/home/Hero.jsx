import React, { useState, useRef } from 'react';
import RentalModeSwitcher from './RentalModeSwitcher';
import LongTermSearchBar from './LongTermSearchBar';
import ShortTermSearchBar from './ShortTermSearchBar';

const Hero = ({ onSearch, initialKeyword = '', defaultMode = 'long-term' }) => {
  const [rentalMode, setRentalMode] = useState(defaultMode);
  const heroRef = useRef(null);

  const handleSearch = (criteria) => {
    if (onSearch) {
      onSearch(criteria);
    }
  };

  const handleModeChange = (mode) => {
    setRentalMode(mode);
  };

  return (
    <div
      ref={heroRef}
      className="w-full bg-surface-light pt-6 px-4 sm:px-8 lg:px-12 border-b border-[#e7edf3] transition-all duration-300 pb-10"
    >
      <div className="mx-auto max-w-[1440px]">
        {/* Hero Content */}
        <div
          className="relative rounded-3xl bg-cover bg-center min-h-[520px] md:min-h-[480px] w-full flex flex-col items-center justify-center text-center px-4 py-12"
          style={{
            backgroundImage:
              "linear-gradient(rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.5)), url('https://lh3.googleusercontent.com/aida-public/AB6AXuD-whOX4EE0loBF-tGCUZ1ZoRTw3FlAOvJ9v5P8gHzDNOJv3k5WcaI95m7fJ-ddtcsWWP6yi5lPTjq8gxvEDVRoJ2BNj7BhcZR-esIExGjCRdbYOuFtnIefnlNLGfwuuqWN9ZzbmwHW4wsEqv4eDQhQG7vekiP9zYuY7FPL7RSAUfIx33gehk0w9JMeGeM9iwrUCaHnWoT4-gznCsUaNHRyEV6XJln72aBpipZp_JGmssTdVKeUhOJHO_f7Pkrun_uQiW7FrLg_HD4')",
            overflow: 'visible',
          }}
        >
          <div className="relative w-full max-w-4xl flex flex-col items-center gap-8" style={{ overflow: 'visible' }}>
            {/* Title and Subtitle */}
            <div className="space-y-4 md:space-y-2">
              <h1 className="text-3xl md:text-5xl lg:text-6xl font-black text-white tracking-tight drop-shadow-md px-2">
                {rentalMode === 'long-term' ? 'Tìm phòng trọ lý tưởng' : 'Find your next adventure'}
              </h1>
              <p className="text-white/90 text-lg md:text-xl font-medium max-w-2xl mx-auto drop-shadow-sm px-4">
                {rentalMode === 'long-term'
                  ? 'Khám phá hàng nghìn phòng trọ, căn hộ mini giá tốt gần bạn'
                  : 'Discover hotels, homes, and unique stays around the world.'}
              </p>
            </div>

            {/* Rental Mode Switcher */}
            <RentalModeSwitcher mode={rentalMode} onChange={handleModeChange} />

            {/* Conditional Search Bar */}
            {rentalMode === 'long-term' ? (
              <LongTermSearchBar onSearch={handleSearch} initialKeyword={initialKeyword} />
            ) : (
              <ShortTermSearchBar onSearch={handleSearch} initialKeyword={initialKeyword} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;