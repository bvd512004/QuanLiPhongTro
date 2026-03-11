import React from 'react';

const RentalModeSwitcher = ({ mode, onChange }) => {
  return (
    <div className="flex justify-center mb-6">
      <div className="inline-flex bg-white dark:bg-gray-800 rounded-full p-1 shadow-lg border border-gray-200 dark:border-gray-700">
        <button
          onClick={() => onChange('long-term')}
          className={`px-6 py-2.5 rounded-full text-sm font-semibold transition-all duration-200 flex items-center gap-2 ${
            mode === 'long-term'
              ? 'bg-primary text-white shadow-md'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          <span className="material-symbols-outlined !text-[20px]">home</span>
          <span>Thuê trọ dài hạn</span>
        </button>
        
        <button
          onClick={() => onChange('short-term')}
          className={`px-6 py-2.5 rounded-full text-sm font-semibold transition-all duration-200 flex items-center gap-2 ${
            mode === 'short-term'
              ? 'bg-primary text-white shadow-md'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          <span className="material-symbols-outlined !text-[20px]">flight</span>
          <span>Thuê ngắn hạn</span>
        </button>
      </div>
    </div>
  );
};

export default RentalModeSwitcher;