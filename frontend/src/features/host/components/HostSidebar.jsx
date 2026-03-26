import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const NavItem = ({ to, icon, label, badge, isActive }) => {
  return (
    <Link 
      to={to} 
      className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
        isActive 
          ? 'bg-primary/10 text-primary font-semibold shadow-sm' 
          : 'text-slate-600 hover:bg-blue-50 group'
      }`}
    >
      <span className={`material-symbols-outlined ${isActive ? 'text-primary' : 'text-slate-500 group-hover:text-primary'}`}>
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
    { to: '/host/reviews', icon: 'star', label: 'Reviews' },
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
        w-72 bg-white border-r border-blue-100 
        flex flex-col h-full flex-shrink-0 transition-transform duration-300
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* User Profile Section */}
        <div className="p-7 border-b border-blue-100">
          <Link to="/" className="flex items-center gap-2 text-primary mb-6">
            <span className="material-symbols-outlined">apartment</span>
            <h2 className="text-lg font-bold text-slate-900">Host Portal</h2>
          </Link>
          <div className="flex items-center gap-3">
            <div 
              className="bg-center bg-no-repeat bg-cover rounded-full w-12 h-12 shadow-md shadow-blue-100/70 flex-shrink-0" 
              style={{ backgroundImage: `url("${user.avatarUrl}")` }}
            ></div>
            <div className="flex flex-col overflow-hidden">
              <h1 className="text-slate-900 text-base font-bold leading-tight truncate">{user.name}</h1>
              <p className="text-primary text-xs font-medium leading-normal uppercase tracking-wide">{user.role}</p>
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 overflow-y-auto py-5 px-4 space-y-2">
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
        <div className="p-5 border-t border-blue-100">
          <button className="flex w-full items-center gap-3 px-4 py-3 rounded-xl text-slate-600 hover:bg-blue-50 transition-colors">
            <span className="material-symbols-outlined">settings</span>
            <span className="text-sm font-medium">Settings</span>
          </button>
          <Link to="/" className="flex w-full items-center gap-3 px-4 py-3 rounded-xl text-slate-600 hover:bg-red-50 hover:text-red-600 transition-colors mt-2">
            <span className="material-symbols-outlined">logout</span>
            <span className="text-sm font-medium">Back to Home</span>
          </Link>
        </div>
      </aside>
    </>
  );
};

export default HostSidebar;
