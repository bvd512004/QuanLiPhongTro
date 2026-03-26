import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import HostSidebar from '../components/HostSidebar';
import HostHeader from '../components/HostHeader';
import ReservationStats from '../components/ReservationStats';
import ReservationList from '../components/ReservationList';
import ReservationCalendar from '../components/ReservationCalendar';
import ReservationSidebar from '../components/ReservationSidebar';
import { AuthStateContext} from "@/app/providers/AuthProvider.jsx";
import { useContext } from 'react';

const ReservationsPage = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user } = useContext(AuthStateContext);

  if (!user) {
    return (
      <div className="flex h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-white to-sky-50">
        <div className="text-center">
          <h1 className="text-2xl font-semibold tracking-tight leading-tight text-slate-900 mb-4">Authentication Required</h1>
          <p className="text-slate-600 leading-relaxed tracking-[0.01em] mb-4">Please log in to access the host portal.</p>
          <Link to="/auth" className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg font-semibold">
            Log In
          </Link>
        </div>
      </div>
    );
  }

  if (!user.isHost && !user.roles?.includes('ROLE_HOST')) {
    return (
      <div className="flex h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-white to-sky-50">
        <div className="text-center">
          <h1 className="text-2xl font-semibold tracking-tight leading-tight text-slate-900 mb-4">Host Access Required</h1>
          <p className="text-slate-600 leading-relaxed tracking-[0.01em] mb-4">You need to become a host to access this page.</p>
          <Link to="/host" className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg font-semibold">
            Become a Host
          </Link>
        </div>
      </div>
    );
  }

  const hostUser = {
    name: user.fullName || `${user.firstName} ${user.lastName}`,
    avatarUrl: user.avatarUrl || `https://api.dicebear.com/9.x/avataaars/svg?seed=${user.firstName}`,
    role: 'Host'
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-blue-50 via-white to-sky-50 text-slate-900 overflow-hidden page-transition">
      <HostSidebar
        user={hostUser}
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      />

      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        <HostHeader onMenuToggle={() => setMobileMenuOpen(true)} />

        <div className="flex-1 overflow-y-auto p-6 scroll-smooth">
          <div className="max-w-[1280px] mx-auto w-full flex flex-col gap-6">
            <nav className="flex text-sm font-medium tracking-[0.01em] text-slate-600">
              <Link to="/" className="hover:text-primary transition-colors">Home</Link>
              <span className="mx-2">/</span>
              <Link to="/host" className="hover:text-primary transition-colors">Host Portal</Link>
              <span className="mx-2">/</span>
              <span className="text-slate-900">Reservations</span>
            </nav>

            <div className="flex flex-wrap justify-between items-end gap-4">
              <div className="flex flex-col gap-2">
                <h1 className="text-slate-900 text-3xl md:text-4xl font-semibold leading-tight tracking-tight">
                  Quản lý Đặt chỗ
                </h1>
                <p className="text-slate-600 text-base font-normal leading-relaxed tracking-[0.01em]">
                  Xem và quản lý các yêu cầu đặt phòng của bạn từ một nơi duy nhất.
                </p>
              </div>
              <div className="flex gap-3">
                <button className="flex items-center justify-center rounded-lg h-10 px-4 bg-white border border-blue-200 text-slate-900 text-sm font-bold shadow-sm hover:bg-blue-50 transition-colors">
                  <span className="material-symbols-outlined mr-2 text-lg">download</span>
                  Xuất báo cáo
                </button>
              </div>
            </div>

            <ReservationStats />
            <ReservationList />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <ReservationCalendar />
              </div>
              <div className="lg:col-span-1">
                <ReservationSidebar />
              </div>
            </div>

            <footer className="mt-6 py-6 border-t border-blue-100">
              <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-slate-600">
                <p>© 2024 StayEase Host Portal. All rights reserved.</p>
                <div className="flex gap-6">
                  <a href="#" className="hover:text-primary transition-colors">Privacy Policy</a>
                  <a href="#" className="hover:text-primary transition-colors">Terms of Service</a>
                  <a href="#" className="hover:text-primary transition-colors">Contact Support</a>
                </div>
              </div>
            </footer>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ReservationsPage;