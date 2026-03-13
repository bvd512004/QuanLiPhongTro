import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import HostSidebar from '@/components/host/HostSidebar';
import HostHeader from '@/components/host/HostHeader';
import HostPropertyCard from '@/components/host/HostPropertyCard';
import { useAuth } from '@/contexts/AuthContext';
import hostService from "../services/host.service.js";

const HostPortalPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('All Listings');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [properties, setProperties] = useState([]);
  const [loadingProperties, setLoadingProperties] = useState(true);
  const { user, loading } = useAuth();

  useEffect(() => {
    if (user && (user.isHost || user.roles?.includes('ROLE_HOST'))) {
      loadProperties();
    }
  }, [user]);

  const convertPropertyDtoToHostProperty = (dto) => {
    return {
      id: String(dto.id),
      title: dto.title,
      location: `${dto.city}, ${dto.country}`,
      imageUrl: dto.primaryImageUrl || dto.images?.[0]?.imageUrl || '',
      status: dto.status === 'ACTIVE' ? 'Active' : dto.status === 'PENDING' ? 'Draft' : 'Archived',
      price: dto.pricePerNight,
      currency: 'VND',
      rating: dto.averageRating,
      upcomingBookings: 0,
      views: dto.viewCount,
      isPriceSet: dto.pricePerNight > 0,
    };
  };

  const loadProperties = async () => {
    setLoadingProperties(true);
    try {
      const response = await hostService.getMyProperties(0, 100);
      if (response.success) {
        const mappedProperties = response.data.content.map(convertPropertyDtoToHostProperty);
        setProperties(mappedProperties);
      }
    } catch (error) {
      console.error('Failed to load properties:', error);
    } finally {
      setLoadingProperties(false);
    }
  };

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

  const filteredProperties = properties.filter((prop) => {
    if (activeTab === 'All Listings') return true;
    return prop.status === activeTab;
  });

  const getCount = (type) => {
    if (type === 'All Listings') return properties.length;
    return properties.filter((property) => property.status === type).length;
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
          <div className="max-w-[1200px] mx-auto w-full flex flex-col gap-6">
            <nav className="flex text-sm font-medium text-slate-500 dark:text-slate-400">
              <Link to="/" className="hover:text-primary transition-colors">Home</Link>
              <span className="mx-2">/</span>
              <span className="text-slate-900 dark:text-white">My Properties</span>
            </nav>

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">My Properties</h1>
                <p className="text-slate-500 dark:text-slate-400 mt-1">Manage your listings and view booking performance.</p>
              </div>
              <button
                onClick={() => navigate('/host/add-property')}
                className="inline-flex items-center justify-center gap-2 bg-primary hover:bg-blue-600 text-white font-medium px-5 py-2.5 rounded-lg transition-colors shadow-sm hover:shadow-md"
              >
                <span className="material-symbols-outlined text-[20px]">add</span>
                <span>Add New Listing</span>
              </button>
            </div>

            <div className="border-b border-slate-200 dark:border-slate-800 mt-2">
              <div className="flex overflow-x-auto gap-8 pb-0">
                {['All Listings', 'Active', 'Draft', 'Archived'].map((tab) => {
                  const isActive = activeTab === tab;
                  return (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`relative pb-4 text-sm font-bold transition-colors border-b-2 whitespace-nowrap ${
                        isActive
                          ? 'text-primary border-primary'
                          : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 border-transparent hover:border-slate-300'
                      }`}
                    >
                      {tab}
                      <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                        isActive
                          ? 'bg-primary/10 text-primary'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                      }`}
                      >
                        {getCount(tab)}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 pb-6">
              {loadingProperties ? (
                <div className="col-span-full flex items-center justify-center py-12">
                  <span className="material-symbols-outlined animate-spin text-4xl text-primary">progress_activity</span>
                </div>
              ) : filteredProperties.length > 0 ? (
                <>
                  {filteredProperties.map((property) => (
                    <HostPropertyCard
                      key={property.id}
                      property={property}
                      onRefresh={loadProperties}
                    />
                  ))}

                  <button
                    onClick={() => navigate('/host/add-property')}
                    className="group flex flex-col items-center justify-center bg-slate-50 dark:bg-[#1a2632]/50 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-primary dark:hover:border-primary hover:bg-slate-100 dark:hover:bg-[#1a2632] transition-all duration-300 min-h-[340px]"
                  >
                    <div className="bg-primary/10 text-primary p-4 rounded-full mb-4 group-hover:scale-110 transition-transform">
                      <span className="material-symbols-outlined text-[32px]">add_home</span>
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Add New Property</h3>
                    <p className="text-sm text-slate-500 text-center px-8 mt-2">Create a new listing to start earning from your space.</p>
                  </button>
                </>
              ) : (
                <div className="col-span-full flex flex-col items-center justify-center py-12">
                  <div className="bg-primary/10 text-primary p-6 rounded-full mb-4">
                    <span className="material-symbols-outlined text-[48px]">home_work</span>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">No properties found</h3>
                  <p className="text-slate-500 dark:text-slate-400 mb-4">Get started by adding your first property</p>
                  <button
                    onClick={() => navigate('/host/add-property')}
                    className="inline-flex items-center gap-2 bg-primary hover:bg-blue-600 text-white font-medium px-5 py-2.5 rounded-lg transition-colors"
                  >
                    <span className="material-symbols-outlined text-[20px]">add</span>
                    <span>Add Your First Property</span>
                  </button>
                </div>
              )}
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

export default HostPortalPage;