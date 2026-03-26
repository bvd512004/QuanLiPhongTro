import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AuthStateContext} from "@/app/providers/AuthProvider.jsx";
import { useContext } from 'react';
import { useEffect, useState } from 'react';

export const PublicHeader = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { user, isAuthenticated, logout } = useAuth();
    const [isAdminMode, setIsAdminMode] = useState(false);

    // Check if current path is admin route
    useEffect(() => {
        setIsAdminMode(location.pathname.startsWith('/admin'));
    }, [location.pathname]);

    // Load wallet balance when user is logged in
    // useEffect(() => {
    //     if (isAuthenticated && user?.roles?.includes('ROLE_HOST')) {
    //         loadWalletBalance();
    //     }
    // }, [isAuthenticated, user]);

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
            // Switch to user mode - go to home
            navigate('/');
        } else {
            // Switch to admin mode - go to admin dashboard
            navigate('/admin/dashboard');
        }
    };

    return (
        <header className="sticky top-0 z-50 w-full border-b border-[#e7edf3] dark:border-gray-800 bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-sm">
            <div className="mx-auto flex h-[72px] max-w-[1440px] items-center justify-between px-4 sm:px-8 lg:px-12">
                {/* Logo */}
                <Link to="/" className="flex items-center gap-3 cursor-pointer">
                    <div className="flex items-center justify-center text-primary">
                        <span className="material-symbols-outlined !text-[32px] font-bold">
                            home
                        </span>
                    </div>
                    <h2 className="text-xl font-bold tracking-tight text-[#0d141b] dark:text-white">
                        QuanLyAppartment
                    </h2>
                </Link>

                {/* Right Actions */}
                <div className="flex items-center gap-4">
                    <Link
                        to="/host"
                        className={`hidden md:block text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-800 px-4 py-2 rounded-full transition-colors ${location.pathname === '/host' ? 'text-primary' : ''
                            }`}
                    >
                        Cho thuê Apartment
                    </Link>

                    {/* Wallet Button - Only for Hosts */}
                    {/* {isAuthenticated && user?.roles?.includes('ROLE_HOST') && (
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
          )} */}

                    {/* Admin Mode Toggle - Only for Admins */}
                    {isAuthenticated && user?.roles?.includes('ROLE_ADMIN') && (
                        <button
                            onClick={toggleAdminMode}
                            className={`hidden md:flex items-center gap-2 px-4 py-2 rounded-full transition-all border-2 ${isAdminMode
                                    ? 'bg-purple-500 text-white border-purple-500 shadow-lg'
                                    : 'bg-white text-gray-700 border-purple-300 hover:bg-purple-50 hover:border-purple-400'
                                }`}
                            title={isAdminMode ? 'Chế độ Admin - Click để về trang khách' : 'Chế độ Khách - Click để vào Admin'}
                        >
                            <span className="material-symbols-outlined !text-[20px]">
                                {isAdminMode ? 'admin_panel_settings' : 'supervised_user_circle'}
                            </span>
                            <span className="text-sm font-semibold">
                                {isAdminMode ? 'Admin Mode' : 'User Mode'}
                            </span>
                            <svg
                                className={`w-4 h-4 transition-transform ${isAdminMode ? 'rotate-180' : ''}`}
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                            </svg>
                        </button>
                    )}

                    <button className="hidden md:flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                        <span className="material-symbols-outlined !text-[20px]">
                            language
                        </span>
                    </button>
                    <Link
                        to="/messages"
                        className="hidden md:flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors relative"
                    >
                        <span className="material-symbols-outlined !text-[20px]">
                            chat_bubble
                        </span>
                        <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                    </Link>

                    {/* User Menu */}
                    <div className="relative group">
                        <button className="flex items-center gap-2 border border-gray-200 dark:border-gray-700 rounded-full p-1 pl-3 hover:shadow-md transition-all ml-1">
                            <span className="material-symbols-outlined !text-[20px]">
                                menu
                            </span>
                            {isAuthenticated && user ? (
                                // Show user avatar or initial when logged in
                                <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-sm font-semibold overflow-hidden relative">
                                    {user.avatarUrl ? (
                                        <>
                                            <img
                                                src={user.avatarUrl}
                                                alt={user.fullName || user.firstName || 'User'}
                                                className="w-full h-full object-cover"
                                                onError={(e) => {
                                                    // Hide image and show initial on error
                                                    const target = e.target;
                                                    target.style.display = 'none';
                                                    const fallback = target.nextElementSibling;
                                                    if (fallback) fallback.style.display = 'flex';
                                                }}
                                            />
                                            <span
                                                className="absolute inset-0 flex items-center justify-center w-full h-full bg-primary text-white text-sm font-semibold"
                                                style={{ display: 'none' }}
                                            >
                                                {(user.fullName || user.firstName || user.email || 'U').charAt(0).toUpperCase()}
                                            </span>
                                        </>
                                    ) : (
                                        <span className="flex items-center justify-center w-full h-full">
                                            {(user.fullName || user.firstName || user.email || 'U').charAt(0).toUpperCase()}
                                        </span>
                                    )}
                                </div>
                            ) : (
                                // Show default icon when not logged in
                                <div className="bg-gray-500 text-white rounded-full p-1">
                                    <span className="material-symbols-outlined !text-[24px] filled">
                                        account_circle
                                    </span>
                                </div>
                            )}
                        </button>

                        {/* Dropdown Menu */}
                        <div className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                            <div className="py-2">
                                {!isAuthenticated ? (
                                    <>
                                        <Link to="/auth" className="block px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700">
                                            Đăng nhập
                                        </Link>
                                        <Link to="/auth" className="block px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700">
                                            Đăng ký
                                        </Link>
                                    </>
                                ) : (
                                    <>
                                        <Link to="/profile" className="flex items-center gap-3 px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700">
                                            <span className="material-symbols-outlined !text-[16px]">person</span>
                                            Tài khoản
                                        </Link>

                                        {/* Wallet Link in Dropdown - For Hosts */}
                                        {/* {user?.roles?.includes('ROLE_HOST') && (
                                            <Link to="/wallet" className="flex items-center justify-between px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700">
                                                <div className="flex items-center gap-3">
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                                                    </svg>
                                                    Ví của tôi
                                                </div>
                                                <span className={`text-xs font-semibold ${walletBalance < 50000 ? 'text-red-600' : 'text-green-600'}`}>
                                                    {formatCurrency(walletBalance)} ₫
                                                </span>
                                            </Link>
                                        )} */}

                                        {/* Admin Section in Dropdown - For Admins */}
                                        {user?.roles?.includes('ROLE_ADMIN') && (
                                            <>
                                                <div className="border-t border-gray-200 dark:border-gray-700 my-2"></div>
                                                <div className="px-3 py-2">
                                                    <div className="flex items-center justify-between mb-2">
                                                        <span className="text-xs font-semibold text-purple-600 dark:text-purple-400 uppercase">
                                                            Admin Panel
                                                        </span>
                                                        <button
                                                            onClick={toggleAdminMode}
                                                            className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${isAdminMode
                                                                    ? 'bg-purple-500 text-white'
                                                                    : 'bg-gray-200 text-gray-700 hover:bg-purple-100'
                                                                }`}
                                                        >
                                                            {isAdminMode ? 'Admin Mode' : 'User Mode'}
                                                        </button>
                                                    </div>
                                                </div>
                                                <Link
                                                    to="/admin/dashboard"
                                                    className="flex items-center gap-3 px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
                                                >
                                                    <span className="material-symbols-outlined !text-[16px]">admin_panel_settings</span>
                                                    Dashboard
                                                </Link>
                                                <Link
                                                    to="/admin/payment-settings"
                                                    className="flex items-center gap-3 px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
                                                >
                                                    <span className="material-symbols-outlined !text-[16px]">settings</span>
                                                    Cài đặt Thanh toán
                                                </Link>
                                                <div className="border-t border-gray-200 dark:border-gray-700 my-2"></div>
                                            </>
                                        )}

                                        <Link to="/profile?tab=bookings" className="flex items-center gap-3 px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700">
                                            <span className="material-symbols-outlined !text-[16px]">calendar_month</span>
                                            Lịch sử đặt phòng
                                        </Link>
                                        <Link to="/profile?tab=favorites" className="flex items-center gap-3 px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700">
                                            <span className="material-symbols-outlined !text-[16px]">favorite</span>
                                            Yêu thích
                                        </Link>
                                        <div className="border-t border-gray-200 dark:border-gray-700 my-2"></div>
                                        <Link to="/messages" className="flex items-center gap-3 px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700">
                                            <span className="material-symbols-outlined !text-[16px]">chat_bubble</span>
                                            Tin nhắn
                                        </Link>
                                        {user?.roles?.includes('ROLE_HOST') && (
                                            <Link to="/host" className="flex items-center gap-3 px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700">
                                                <span className="material-symbols-outlined !text-[16px]">home_work</span>
                                                Quản lý phòng trọ
                                            </Link>
                                        )}
                                        <div className="border-t border-gray-200 dark:border-gray-700 my-2"></div>
                                        <Link to="/profile?tab=settings" className="flex items-center gap-3 px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700">
                                            <span className="material-symbols-outlined !text-[16px]">settings</span>
                                            Cài đặt
                                        </Link>
                                        <button
                                            onClick={logout}
                                            className="flex items-center gap-3 w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 text-red-600 dark:text-red-400"
                                        >
                                            <span className="material-symbols-outlined !text-[16px]">logout</span>
                                            Đăng xuất
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
