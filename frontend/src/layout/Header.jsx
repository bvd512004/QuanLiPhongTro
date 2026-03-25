import React, { useState, useEffect, useContext, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AuthStateContext, AuthActionsContext } from '../providers/AuthProvider';

const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const { user } = useContext(AuthStateContext);
  const { logout } = useContext(AuthActionsContext);
  const isAuthenticated = !!user;

  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef();

  // đóng dropdown khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white">
      <div className="mx-auto flex h-[72px] max-w-[1440px] items-center justify-between px-6">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <span className="material-symbols-outlined text-2xl">home</span>
          <h2 className="text-xl font-bold">HolaRent</h2>
        </Link>

        <div className="flex items-center gap-4">

          <Link to="/host" className="text-sm hover:bg-gray-100 px-4 py-2 rounded-full">
            Cho thuê phòng trọ
          </Link>

          {/* USER MENU */}
          <div className="relative" ref={dropdownRef}>

            <button
              onClick={() => setIsOpen(!isOpen)}
              className="flex items-center gap-2 border rounded-full p-2 hover:shadow"
            >
              {isAuthenticated ? (
                <div className="w-8 h-8 bg-blue-500 text-white flex items-center justify-center rounded-full">
                  {(user.firstName || user.email || "U").charAt(0).toUpperCase()}
                </div>
              ) : (
                <span className="material-symbols-outlined">account_circle</span>
              )}
            </button>

            {/* DROPDOWN */}
            {isOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white shadow-lg rounded-lg z-50">

                {!isAuthenticated ? (
                  <>
                    <Link
                      to="/login"
                      onClick={() => setIsOpen(false)}
                      className="block px-4 py-2 hover:bg-gray-100"
                    >
                      Đăng nhập
                    </Link>

                    <Link
                      to="/register"
                      onClick={() => setIsOpen(false)}
                      className="block px-4 py-2 hover:bg-gray-100"
                    >
                      Đăng ký
                    </Link>
                  </>
                ) : (
                  <>
                    <div className="px-4 py-2 text-sm border-b">
                      👋 {user.firstName || user.email}
                    </div>

                    <Link
                      to="/profile"
                      onClick={() => setIsOpen(false)}
                      className="block px-4 py-2 hover:bg-gray-100"
                    >
                      Tài khoản
                    </Link>

                    <button
                      onClick={() => {
                        logout();
                        setIsOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-gray-100 text-red-500"
                    >
                      Đăng xuất
                    </button>
                  </>
                )}
              </div>
            )}

          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;