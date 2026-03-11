import React from 'react';
import { Link, useSearchParams } from 'react-router-dom';

const ListingCard = ({ listing }) => {
  const [searchParams] = useSearchParams();

  // Xác định xem đây là thuê dài hạn hay ngắn hạn
  const isLongTerm = listing.rentalType === 'LONG_TERM';

  // Xây dựng URL với các tiêu chí tìm kiếm hiện tại
  const buildListingUrl = () => {
    const url = `/listing/${listing.id}`;
    const params = new URLSearchParams();

    // Lấy params từ URL hiện tại
    const checkIn = searchParams.get('checkIn');
    const checkOut = searchParams.get('checkOut');
    const guests = searchParams.get('guests');

    if (checkIn) params.append('checkIn', checkIn);
    if (checkOut) params.append('checkOut', checkOut);
    if (guests) params.append('guests', guests);

    const queryString = params.toString();
    return queryString ? `${url}?${queryString}` : url;
  };

  // Định dạng tiền tệ kiểu Việt Nam
  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN').format(price);
  };

  return (
    <Link to={buildListingUrl()} className="group cursor-pointer">
      <div className="relative aspect-square overflow-hidden rounded-xl bg-gray-200 mb-3">
        <img
          alt={listing.location}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          src={listing.image}
        />
        <button 
          className="absolute top-3 right-3 p-2 rounded-full bg-transparent hover:bg-white/10 text-white transition-colors"
          onClick={(e) => e.preventDefault()}
        >
          <span className="material-symbols-outlined !text-[24px]">favorite</span>
        </button>
        
        {listing.isGuestFavorite && (
          <div className="absolute top-3 left-3 bg-white/90 dark:bg-black/70 backdrop-blur-sm px-2 py-1 rounded-md text-xs font-bold shadow-sm text-[#0d141b] dark:text-white">
            Guest favorite
          </div>
        )}
        
        {isLongTerm && (
          <div className="absolute bottom-3 left-3 bg-primary/90 backdrop-blur-sm px-2 py-1 rounded-md text-xs font-semibold text-white">
            Thuê dài hạn
          </div>
        )}
      </div>

      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-bold text-[#0d141b] dark:text-white text-base">{listing.location}</h3>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-0.5">{listing.details}</p>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-0.5">{listing.dates}</p>
        </div>
        <div className="flex items-center gap-1">
          <span className="material-symbols-outlined !text-[16px] text-[#0d141b] dark:text-white filled">star</span>
          <span className="text-sm font-medium text-[#0d141b] dark:text-white">{listing.rating}</span>
        </div>
      </div>

      {/* Hiển thị giá tùy theo loại hình thuê */}
      {isLongTerm ? (
        <div className="mt-2">
          <div className="flex items-baseline gap-1">
            <span className="font-bold text-[#0d141b] dark:text-white text-base">
              {formatPrice(listing.pricePerMonth || 0)}đ
            </span>
            <span className="text-gray-500 dark:text-gray-400 text-sm">/tháng</span>
          </div>
          {listing.price > 0 && (
            <div className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
              ~{formatPrice(Math.round(listing.price))}đ/đêm
            </div>
          )}
        </div>
      ) : (
        <div className="mt-2 flex items-baseline gap-1">
          <span className="font-bold text-[#0d141b] dark:text-white text-base">
            {formatPrice(listing.price)}đ
          </span>
          <span className="text-gray-500 dark:text-gray-400 text-sm">/đêm</span>
        </div>
      )}
    </Link>
  );
};

export default ListingCard;