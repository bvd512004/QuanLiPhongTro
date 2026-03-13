import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const NavItem = ({ to, icon, label, badge, isActive }) => {
  return (
    <Link 
      to={to} 
      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
        isActive 
          ? 'bg-primary/10 text-primary font-semibold' 
          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 group'
      }`}
    >
      <span className={`material-symbols-outlined ${isActive ? 'text-primary' : 'text-slate-500 dark:text-slate-400 group-hover:text-primary'}`}>
        {icon}
      </span>
      <p className="text-sm leading-normal">{label}</p>
      {badge && (
        <span className="ml-auto bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
          {badge}
        </span>
      )}
    </Link>
  );
};

const HostSidebar = ({ user, isOpen, onClose }) => {
  const location = useLocation();
  const currentPath = location.pathname;

  const navItems = [
    { to: '/host/dashboard', icon: 'dashboard', label: 'Dashboard' },
    { to: '/host', icon: 'house', label: 'Properties', exact: true },
    { to: '/host/reservations', icon: 'event_note', label: 'Reservations', badge: '3' },
    // { to: '/host/calendar', icon: 'calendar_month', label: 'Calendar' },
    { to: '/host/reviews', icon: 'star', label: 'Reviews' },
    { to: '/host/finance', icon: 'payments', label: 'Finance' },
  ];

  const isActive = (path, exact) => {
    if (exact) {
      return currentPath === path;
    }
    return currentPath.startsWith(path) && path !== '/host';
  };

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={onClose}
        />
      )}
      
      <aside className={`
        fixed lg:static top-0 left-0 z-30
        w-64 bg-white dark:bg-[#1a2632] border-r border-slate-200 dark:border-slate-800 
        flex flex-col h-full flex-shrink-0 transition-transform duration-300
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* User Profile Section */}
        <div className="p-6 border-b border-slate-100 dark:border-slate-800">
          <Link to="/" className="flex items-center gap-2 text-primary mb-6">
            <span className="material-symbols-outlined">apartment</span>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Host Portal</h2>
          </Link>
          <div className="flex items-center gap-3">
            <div 
              className="bg-center bg-no-repeat bg-cover rounded-full w-12 h-12 shadow-sm flex-shrink-0" 
              style={{ backgroundImage: `url("${user.avatarUrl}")` }}
            ></div>
            <div className="flex flex-col overflow-hidden">
              <h1 className="text-slate-900 dark:text-white text-base font-bold leading-tight truncate">{user.name}</h1>
              <p className="text-primary text-xs font-medium leading-normal uppercase tracking-wide">{user.role}</p>
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {navItems.map((item) => (
            <NavItem
              key={item.to}
              to={item.to}
              icon={item.icon}
              label={item.label}
              badge={item.badge}
              isActive={isActive(item.to, item.exact)}
            />
          ))}
        </nav>

        {/* Bottom Actions */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800">
          <button className="flex w-full items-center gap-3 px-3 py-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
            <span className="material-symbols-outlined">settings</span>
            <span className="text-sm font-medium">Settings</span>
          </button>
          <Link to="/" className="flex w-full items-center gap-3 px-3 py-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 transition-colors mt-1">
            <span className="material-symbols-outlined">logout</span>
            <span className="text-sm font-medium">Back to Home</span>
          </Link>
        </div>
      </aside>
    </>
  );
};

export default HostSidebar;
