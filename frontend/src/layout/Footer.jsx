import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-gray-50 border-t border-gray-200 pt-12 pb-8 px-4 sm:px-8 lg:px-12">
      <div className="mx-auto max-w-[1440px]">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Hỗ trợ khách hàng */}
          <div>
            <h4 className="font-bold text-[#0d141b] mb-4">
              Hỗ trợ khách hàng
            </h4>
            <ul className="space-y-3 text-sm text-gray-600">
              <li><Link className="hover:underline" to="#">Trung tâm trợ giúp</Link></li>
              <li><Link className="hover:underline" to="#">Hướng dẫn thuê trọ</Link></li>
              <li><Link className="hover:underline" to="#">Chính sách huỷ phòng</Link></li>
              <li><Link className="hover:underline" to="#">An toàn khi thuê</Link></li>
              <li><Link className="hover:underline" to="#">Giải quyết tranh chấp</Link></li>
            </ul>
          </div>

          {/* Cho chủ nhà */}
          <div>
            <h4 className="font-bold text-[#0d141b] mb-4">
              Dành cho chủ nhà
            </h4>
            <ul className="space-y-3 text-sm text-gray-600">
              <li><Link className="hover:underline" to="/host">Cho thuê phòng trọ</Link></li>
              <li><Link className="hover:underline" to="#">Quản lý phòng trọ</Link></li>
              <li><Link className="hover:underline" to="#">Hướng dẫn cho chủ nhà</Link></li>
              <li><Link className="hover:underline" to="#">Cộng đồng chủ nhà</Link></li>
              <li><Link className="hover:underline" to="#">Bảo vệ chủ nhà</Link></li>
            </ul>
          </div>

          {/* Về HolaRent */}
          <div>
            <h4 className="font-bold text-[#0d141b] mb-4">
               Về HolaRent
            </h4>
            <ul className="space-y-3 text-sm text-gray-600">
              <li><Link className="hover:underline" to="#">Tin tức</Link></li>
              <li><Link className="hover:underline" to="#">Tính năng mới</Link></li>
              <li><Link className="hover:underline" to="#">Tuyển dụng</Link></li>
              <li><Link className="hover:underline" to="#">Nhà đầu tư</Link></li>
              <li><Link className="hover:underline" to="#">Blog</Link></li>
            </ul>
          </div>

          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="material-symbols-outlined !text-[28px] text-primary">
                home
              </span>
              <h4 className="font-bold text-[#0d141b] text-lg">
                HolaRent
              </h4>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Nền tảng tìm phòng trọ uy tín, kết nối người thuê và chủ nhà trên toàn quốc.
            </p>
            <div className="flex gap-3 mt-4">
              <a href="#" className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center hover:bg-primary hover:text-white transition-colors">
                <span className="material-symbols-outlined !text-[18px]">facebook</span>
              </a>
              <a href="#" className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center hover:bg-primary hover:text-white transition-colors">
                <span className="material-symbols-outlined !text-[18px]">chat</span>
              </a>
              <a href="#" className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center hover:bg-primary hover:text-white transition-colors">
                <span className="material-symbols-outlined !text-[18px]">mail</span>
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-200 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex flex-wrap justify-center md:justify-start gap-4 text-sm text-gray-600">
            <span>© 2026 HolaRent, Inc.</span>
            <span className="hidden md:inline">·</span>
            <Link className="hover:underline" to="#">Chính sách bảo mật</Link>
            <span className="hidden md:inline">·</span>
            <Link className="hover:underline" to="#">Điều khoản sử dụng</Link>
            <span className="hidden md:inline">·</span>
            <Link className="hover:underline" to="#">Sơ đồ trang</Link>
          </div>
          <div className="flex gap-4 items-center">
            <div className="flex gap-4 text-[#0d141b]">
              <span className="hover:text-primary transition-colors cursor-pointer text-sm font-semibold">Tiếng Việt</span>
              <span className="hover:text-primary transition-colors cursor-pointer text-sm font-semibold">VND (₫)</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;