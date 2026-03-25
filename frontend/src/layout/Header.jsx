import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
// import { useAuth } from '../contexts/AuthContext';

// Tạm thời mock useAuth để không phụ thuộc AuthContext thật
const useAuth = () => ({
  user: null,
  isAuthenticated: false,
  logout: () => {},
});

const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  
  const [walletBalance, setWalletBalance] = useState(0);
  const [loadingWallet, setLoadingWallet] = useState(false);
  const [isAdminMode, setIsAdminMode] = useState(false);

  // Kiểm tra nếu đường dẫn hiện tại là admin
  useEffect(() => {
    setIsAdminMode(location.pathname.startsWith('/admin'));
  }, [location.pathname]);

  // Tải số dư ví khi người dùng đăng nhập và có vai trò HOST
  useEffect(() => {
    if (isAuthenticated && user?.roles?.includes('ROLE_HOST')) {
      loadWalletBalance();
    }
  }, [isAuthenticated, user]);

  const loadWalletBalance = async () => {
    try {
      setLoadingWallet(true);
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8080/api/wallet', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const walletData = await response.json();
        setWalletBalance(walletData.balance || 0);
      }
    } catch (error) {
      console.error('Failed to load wallet:', error);
    } finally {
      setLoadingWallet(false);
    }
  };

  const formatCurrency = (amount) => {
    if (amount >= 1000000) {
      return `${(amount / 1000000).toFixed(1)}M`;
    } else if (amount >= 1000) {
      return `${(amount / 1000).toFixed(0)}K`;
    }
    return amount.toString();
  };

  const toggleAdminMode = () => {
    if (isAdminMode) {
      navigate('/');
    } else {
      navigate('/admin/dashboard');
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#e7edf3] bg-background-light/95 backdrop-blur-sm">
      <div className="mx-auto flex h-[72px] max-w-[1440px] items-center justify-between px-4 sm:px-8 lg:px-12">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 cursor-pointer">
          <div className="flex items-center justify-center text-primary">
            <span className="material-symbols-outlined !text-[32px] font-bold">
              home
            </span>
          </div>
          <h2 className="text-xl font-bold tracking-tight text-[#0d141b]">
            HolaRent
          </h2>
        </Link>

        {/* Right Actions */}
        <div className="flex items-center gap-4">
          <Link
            to="/host"
            className={`hidden md:block text-sm font-medium hover:bg-gray-100 px-4 py-2 rounded-full transition-colors ${
              location.pathname === '/host' ? 'text-primary' : ''
            }`}
          >
            Cho thuê phòng trọ
          </Link>

          {/* Wallet Button - Chỉ dành cho Host */}
          {isAuthenticated && user?.roles?.includes('ROLE_HOST') && (
            <Link
              to="/wallet"
              className={`hidden md:flex items-center gap-2 px-3 py-2 rounded-full border transition-all ${
                location.pathname === '/wallet' 
                  ? 'bg-rose-50 border-rose-500 text-rose-600' 
                  : 'border-gray-200 hover:border-rose-300 hover:bg-rose-50'
              }`}
              title="Ví của tôi"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
              <span className="text-sm font-semibold">
                {loadingWallet ? '...' : `${formatCurrency(walletBalance)} ₫`}
              </span>
              {walletBalance < 50000 && (
                <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
              )}
            </Link>
          )}

          {/* Admin Mode Toggle - Chỉ dành cho Admin */}
          {isAuthenticated && user?.roles?.includes('ROLE_ADMIN') && (
            <button
              onClick={toggleAdminMode}
              className={`hidden md:flex items-center gap-2 px-4 py-2 rounded-full transition-all border-2 ${
                isAdminMode
                  ? 'bg-purple-500 text-white border-purple-500 shadow-lg' 
                  : 'bg-white text-gray-700 border-purple-300 hover:bg-purple-50 hover:border-purple-400'
              }`}
            >
              <span className="material-symbols-outlined !text-[20px]">
                {isAdminMode ? 'admin_panel_settings' : 'supervised_user_circle'}
              </span>
              <span className="text-sm font-semibold">
                {isAdminMode ? 'Admin Mode' : 'User Mode'}
              </span>
            </button>
          )}

          {/* Messages Link */}
          <Link 
            to="/messages" 
            className="hidden md:flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-100 transition-colors relative"
          >
            <span className="material-symbols-outlined !text-[20px]">chat_bubble</span>
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </Link>
          
            {/* User Menu Dropdown */}
            <div className="relative group">
              <button className="flex items-center gap-2 border border-gray-200 rounded-full p-1 pl-3 hover:shadow-md transition-all ml-1">
              <span className="material-symbols-outlined !text-[20px]">menu</span>
              {isAuthenticated && user ? (
                <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-sm font-semibold overflow-hidden">
                  {user.avatarUrl ? (
                    <img
                      src={user.avatarUrl}
                      alt="User avatar"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextElementSibling.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <span className={`${user.avatarUrl ? 'hidden' : 'flex'} items-center justify-center`}>
                    {(user.fullName || user.firstName || 'U').charAt(0).toUpperCase()}
                  </span>
                </div>
              ) : (
                <div className="bg-gray-500 text-white rounded-full p-1">
                  <span className="material-symbols-outlined !text-[24px] filled">account_circle</span>
                </div>
              )}
            </button>
            
            {/* Dropdown Content */}
            <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
              <div className="py-2">
                {!isAuthenticated ? (
                  <>
                    <Link to="/login" className="block px-4 py-2 text-sm hover:bg-gray-100">Đăng nhập</Link>
                    <Link to="/register" className="block px-4 py-2 text-sm hover:bg-gray-100">Đăng ký</Link>
                  </>
                ) : (
                  <>
                    <Link to="/profile" className="flex items-center gap-3 px-4 py-2 text-sm hover:bg-gray-100">
                      <span className="material-symbols-outlined !text-[16px]">person</span> Tài khoản
                    </Link>
                    
                    {user?.roles?.includes('ROLE_HOST') && (
                      <Link to="/wallet" className="flex items-center justify-between px-4 py-2 text-sm hover:bg-gray-100">
                        <div className="flex items-center gap-3">
                          <span className="material-symbols-outlined !text-[16px]">account_balance_wallet</span> Ví của tôi
                        </div>
                        <span className={`text-xs font-semibold ${walletBalance < 50000 ? 'text-red-600' : 'text-green-600'}`}>
                          {formatCurrency(walletBalance)} ₫
                        </span>
                      </Link>
                    )}

                    <div className="border-t border-gray-200 my-2"></div>
                    
                    <button onClick={logout} className="flex items-center gap-3 w-full text-left px-4 py-2 text-sm hover:bg-gray-100 text-red-600">
                      <span className="material-symbols-outlined !text-[16px]">logout</span> Đăng xuất
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;