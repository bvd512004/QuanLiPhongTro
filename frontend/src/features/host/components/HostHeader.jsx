import React from 'react';

const HostHeader = ({ onMenuToggle }) => {
  return (
    <header className="h-16 flex items-center justify-between px-6 bg-white dark:bg-[#1a2632] border-b border-slate-200 dark:border-slate-800 flex-shrink-0 z-10">
      <div className="flex items-center gap-4">
        {/* Mobile Menu Toggle */}
        <button onClick={onMenuToggle} className="lg:hidden text-slate-500 hover:text-primary p-1 rounded-md">
          <span className="material-symbols-outlined">menu</span>
        </button>
        
        {/* Logo / Brand for Mobile */}
        <div className="flex items-center gap-2 lg:hidden">
          <span className="material-symbols-outlined text-primary">apartment</span>
          <h2 className="text-lg font-bold">Host Portal</h2>
        </div>
        
        {/* Search Bar */}
        <div className="hidden lg:flex relative group">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400 group-focus-within:text-primary">
            <span className="material-symbols-outlined text-[20px]">search</span>
          </div>
          <input 
            className="bg-slate-100 dark:bg-slate-800 border-none text-slate-900 dark:text-slate-200 text-sm rounded-lg focus:ring-2 focus:ring-primary block w-64 pl-10 p-2.5 transition-all placeholder-slate-400" 
            placeholder="Search properties, bookings..." 
            type="text"
          />
        </div>
      </div>
      
      <div className="flex items-center gap-3">
        <button className="relative p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
          <span className="material-symbols-outlined">notifications</span>
          <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-[#1a2632]"></span>
        </button>
        <button className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
          <span className="material-symbols-outlined">chat_bubble</span>
        </button>
        <div className="h-8 w-px bg-slate-200 dark:bg-slate-700 mx-1"></div>
        <button className="flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-primary transition-colors">
          <span>Help</span>
          <span className="material-symbols-outlined text-[18px]">help</span>
        </button>
      </div>
    </header>
  );
};

export default HostHeader;

