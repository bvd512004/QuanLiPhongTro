import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import HostSidebar from '@/components/host/HostSidebar';
import HostHeader from '@/components/host/HostHeader';
import DashboardStats from '@/components/host/DashboardStats';
import RevenueChart from '@/components/host/RevenueChart';
import DashboardBookings from '@/components/host/DashboardBookings';
import { useAuth } from '@/contexts/AuthContext';

const DashboardPage = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50 dark:bg-slate-900">
        <span className="material-symbols-outlined animate-spin text-4xl text-primary">progress_activity</span>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50 dark:bg-slate-900">
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
      <div className="flex h-screen items-center justify-center bg-slate-50 dark:bg-slate-900">
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
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white">
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className={`fixed inset-y-0 left-0 z-30 transform transition-transform duration-300 lg:relative lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <HostSidebar
          user={hostUser}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />
      </div>

      <div className="flex-1 flex flex-col min-w-0">
        <HostHeader onMenuToggle={() => setSidebarOpen(true)} />
        <main className="flex-1 p-4 lg:p-8 overflow-y-auto">
          <div className="max-w-7xl mx-auto space-y-8">
            <div>
              <h2 className="text-2xl font-bold">Tổng quan</h2>
              <p className="text-slate-500 dark:text-slate-400 mt-1">Chào mừng trở lại, {user.firstName} 👋</p>
            </div>

            <DashboardStats />

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
              <div className="xl:col-span-2 space-y-4">
                <RevenueChart />
              </div>
              <div className="xl:col-span-1">
                <DashboardBookings />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardPage;