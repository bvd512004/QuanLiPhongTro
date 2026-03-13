import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import HostSidebar from '@/components/host/HostSidebar';
import HostHeader from '@/components/host/HostHeader';
import ReservationStats from '@/components/host/ReservationStats';
import ReservationList from '@/components/host/ReservationList';
import ReservationCalendar from '@/components/host/ReservationCalendar';
import ReservationSidebar from '@/components/host/ReservationSidebar';
import { useAuth } from '@/contexts/AuthContext';

const ReservationsPage = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background-light dark:bg-background-dark">
        <span className="material-symbols-outlined animate-spin text-4xl text-primary">progress_activity</span>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex h-screen items-center justify-center bg-background-light dark:bg-background-dark">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Authentication Required</h1>
          <p className="text-slate-600 dark:text-slate-400 mb-4">Please log in to access the host portal.</p>
          <Link to="/auth" className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg font-semibold">
            Log In
          </Link>
        </div>
      </div>
    );
  }

  if (!user.isHost && !user.roles?.includes('ROLE_HOST')) {
    return (
      <div className="flex h-screen items-center justify-center bg-background-light dark:bg-background-dark">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Host Access Required</h1>
          <p className="text-slate-600 dark:text-slate-400 mb-4">You need to become a host to access this page.</p>
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
    <div className="flex h-screen bg-background-light dark:bg-background-dark text-slate-900 dark:text-white overflow-hidden page-transition">
      <HostSidebar
        user={hostUser}
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      />

      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        <HostHeader onMenuToggle={() => setMobileMenuOpen(true)} />

        <div className="flex-1 overflow-y-auto p-6 scroll-smooth">
          <div className="max-w-[1280px] mx-auto w-full flex flex-col gap-6">
            <nav className="flex text-sm font-medium text-slate-500 dark:text-slate-400">
              <Link to="/" className="hover:text-primary transition-colors">Home</Link>
              <span className="mx-2">/</span>
              <Link to="/host" className="hover:text-primary transition-colors">Host Portal</Link>
              <span className="mx-2">/</span>
              <span className="text-slate-900 dark:text-white">Reservations</span>
            </nav>

            <div className="flex flex-wrap justify-between items-end gap-4">
              <div className="flex flex-col gap-2">
                <h1 className="text-slate-900 dark:text-white text-3xl md:text-4xl font-black leading-tight tracking-[-0.033em]">
                  Quản lý Đặt chỗ
                </h1>
                <p className="text-slate-500 dark:text-gray-400 text-base font-normal leading-normal">
                  Xem và quản lý các yêu cầu đặt phòng của bạn từ một nơi duy nhất.
                </p>
              </div>
              <div className="flex gap-3">
                <button className="flex items-center justify-center rounded-lg h-10 px-4 bg-white dark:bg-[#1A2633] border border-gray-300 dark:border-gray-700 text-slate-900 dark:text-white text-sm font-bold shadow-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
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

            <footer className="mt-6 py-6 border-t border-slate-200 dark:border-slate-800">
              <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-slate-500">
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