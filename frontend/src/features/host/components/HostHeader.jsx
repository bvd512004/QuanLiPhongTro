import React from 'react';

const HostHeader = ({ onMenuToggle }) => {
  return (
    <header className="h-20 flex items-center justify-between px-8 bg-white/95 backdrop-blur border-b border-blue-100 flex-shrink-0 z-10 shadow-[0_4px_20px_rgba(59,130,246,0.08)]">
      <div className="flex items-center gap-5">
        {/* Mobile Menu Toggle */}
        <button onClick={onMenuToggle} className="lg:hidden text-slate-500 hover:text-primary p-2 rounded-xl hover:bg-blue-50 transition-colors">
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
            className="bg-blue-50 border border-blue-100 text-slate-900 text-sm rounded-xl focus:ring-2 focus:ring-primary focus:border-primary block w-72 pl-10 p-3 transition-all placeholder-slate-400" 
            placeholder="Search properties, bookings..." 
            type="text"
          />
        </div>
      </div>
      
      <div className="flex items-center gap-3">
        <button className="relative p-2.5 text-slate-500 hover:bg-blue-50 rounded-xl transition-colors border border-transparent hover:border-blue-100">
          <span className="material-symbols-outlined">notifications</span>
          <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
        </button>
        <button className="p-2.5 text-slate-500 hover:bg-blue-50 rounded-xl transition-colors border border-transparent hover:border-blue-100">
          <span className="material-symbols-outlined">chat_bubble</span>
        </button>
        <div className="h-8 w-px bg-blue-100 mx-1"></div>
        <button className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-primary transition-colors px-3 py-2 rounded-xl hover:bg-blue-50">
          <span>Help</span>
          <span className="material-symbols-outlined text-[18px]">help</span>
        </button>
      </div>
    </header>
  );
};

export default HostHeader;

