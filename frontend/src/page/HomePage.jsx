import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Hero from '../app/component/home/Hero.jsx';
import ListingCard from '../app/component/home/ListingCard.jsx';
import { api } from '@/services/api';
import { AuthStateContext, AuthActionsContext } from "@/app/providers/AuthProvider";

const HomePage = () => {
  const navigate = useNavigate();

  const [hotLongTermProperties, setHotLongTermProperties] = useState([]);
  const [hotShortTermProperties, setHotShortTermProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  const { user } = useContext(AuthStateContext);
  const { logout } = useContext(AuthActionsContext);

  // fetch properties
  useEffect(() => {
    const fetchHotProperties = async () => {
      setLoading(true);
      try {
        let response = await api.getFeaturedProperties(16);

        if (!response.success || !response.data || response.data.length === 0) {
          console.log('No featured properties, fetching all properties...');
          const allPropertiesResponse = await api.filterProperties({}, 0, 16);
          if (allPropertiesResponse.success && allPropertiesResponse.data) {
            response = {
              timestamp: Date.now().toString(),
              success: true,
              data: allPropertiesResponse.data.content
            };
          }
        }

        if (response.success && response.data) {
          const allProperties = response.data.map((p) => ({
            id: String(p.id),
            image: p.primaryImageUrl || p.images?.[0]?.imageUrl || '',
            location: `${p.city}, ${p.country}`,
            details: `${p.propertyType} • ${p.bedrooms} bedrooms • ${p.maxGuests} guests`,
            dates: 'Available now',
            rating: p.averageRating || 0,
            price: p.pricePerNight,
            rentalType: p.rentalType || 'SHORT_TERM',
            pricePerMonth: p.pricePerMonth || 0,
            isGuestFavorite: p.isFeatured,
          }));

          // Phân loại
          const longTerm = allProperties.filter((p) => p.rentalType === 'LONG_TERM').slice(0, 8);
          const shortTerm = allProperties.filter((p) => p.rentalType === 'SHORT_TERM' || !p.rentalType).slice(0, 4);

          setHotShortTermProperties(
            allProperties.filter(p => p.rentalType === 'SHORT_TERM').slice(0, 4)
          );
        }

      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchHotProperties();
  }, []);

  // search
  const handleSearch = (criteria) => {
    const params = new URLSearchParams();
    
    if (criteria.rentalMode === 'long-term') {
      if (criteria.location) params.append('location', criteria.location);
      if (criteria.priceRange?.min) params.append('minPrice', criteria.priceRange.min.toString());
      if (criteria.priceRange?.max) params.append('maxPrice', criteria.priceRange.max.toString());
      if (criteria.roomType) params.append('roomType', criteria.roomType);
      navigate(`/long-term-listings?${params.toString()}`);
    } 
    else if (criteria.rentalMode === 'short-term') {
      if (criteria.location) params.append('location', criteria.location);
      if (criteria.checkIn) params.append('checkIn', criteria.checkIn.toISOString().split('T')[0]);
      if (criteria.checkOut) params.append('checkOut', criteria.checkOut.toISOString().split('T')[0]);
      if (criteria.guests) {
        params.append('adults', criteria.guests.adults.toString());
        params.append('children', criteria.guests.children.toString());
      }
      navigate(`/short-term-listings?${params.toString()}`);
    }
  };

  return (
    <div>

      {/* HEADER */}
      <header className="flex justify-between items-center px-8 py-4 shadow-sm bg-white">
        <h1 className="text-xl font-bold">StayFinder</h1>

        <div className="flex gap-4 items-center">

          {user ? (
            <>
              <span className="font-semibold">
                {user.email || "User"}
              </span>

              <Link
                to="/profile"
                className="px-4 py-2 bg-green-500 text-white rounded-lg"
              >
                Profile
              </Link>

              <button
                onClick={logout}
                className="px-4 py-2 bg-red-500 text-white rounded-lg"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="px-4 py-2 bg-blue-500 text-white rounded-lg"
              >
                Login
              </Link>

              <Link
                to="/register"
                className="px-4 py-2 border border-blue-500 text-blue-500 rounded-lg"
              >
                Register
              </Link>
            </>
          )}

        </div>
      </header>

      <Hero onSearch={handleSearch} defaultMode="long-term" />

      <div className="mx-auto max-w-[1440px] px-4 sm:px-8 lg:px-12 py-12">
        {/* Phần Long-term */}
        <section className="mb-16">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-3xl font-bold text-[#0d141b] dark:text-white flex items-center gap-2">
                <span className="material-symbols-outlined !text-[32px] text-red-500 filled">local_fire_department</span>
                Phòng trọ HOT tháng này
              </h2>
            </div>
            <button onClick={() => navigate('/long-term-listings')} className="text-primary text-sm font-semibold hover:underline flex items-center gap-1">
              Xem tất cả <span className="material-symbols-outlined !text-[16px]">arrow_forward</span>
            </button>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={`skeleton-long-${i}`} className="animate-pulse bg-gray-200 dark:bg-gray-700 h-64 rounded-xl" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {hotLongTermProperties.map((listing) => <ListingCard key={listing.id} listing={listing} />)}
            </div>
          )}
        </section>

        {/* Phần Short-term */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-3xl font-bold text-[#0d141b] dark:text-white flex items-center gap-2">
                <span className="material-symbols-outlined !text-[32px] text-yellow-500 filled">star</span>
                Căn hộ nổi bật
              </h2>
            </div>
            <button onClick={() => navigate('/short-term-listings')} className="text-primary text-sm font-semibold hover:underline flex items-center gap-1">
              Xem tất cả <span className="material-symbols-outlined !text-[16px]">arrow_forward</span>
            </button>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={`skeleton-short-${i}`} className="animate-pulse bg-gray-200 dark:bg-gray-700 h-64 rounded-xl" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {hotShortTermProperties.map((listing) => <ListingCard key={listing.id} listing={listing} />)}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default HomePage;