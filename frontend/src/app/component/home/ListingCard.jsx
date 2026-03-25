import React from 'react';
import { Link, useSearchParams } from 'react-router-dom';

const ListingCard = ({ listing }) => {
  const [searchParams] = useSearchParams();
  // Fallback nội bộ để tránh phụ thuộc vào dịch vụ placeholder bên ngoài (có thể bị chặn/DNS fail).
  const fallbackImage = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="200" viewBox="0 0 300 200">
      <rect width="300" height="200" fill="#e5e7eb"/>
      <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle"
        font-family="Arial, Helvetica, sans-serif" font-size="16" fill="#6b7280">No Image</text>
    </svg>`
  )}`;

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

  // Định dạng rating
  const formatRating = (rating) => {
    return rating ? rating.toFixed(1) : 'N/A';
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
          src={listing.image || fallbackImage}
          onError={(e) => {
            e.target.src = fallbackImage;
          }}
        />
        <button 
          className="absolute top-3 right-3 p-2 rounded-full bg-transparent hover:bg-white/10 text-white transition-colors"
          onClick={(e) => e.preventDefault()}
        >
          <span className="material-symbols-outlined !text-[24px]">favorite</span>
        </button>
        
        {listing.isGuestFavorite && (
          <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-md text-xs font-bold shadow-sm text-[#0d141b]">
            Guest favorite
          </div>
        )}
      </div>

      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-bold text-[#0d141b] text-base">{listing.location}</h3>
          <p className="text-gray-500 text-sm mt-0.5">{listing.details}</p>
          <p className="text-gray-500 text-sm mt-0.5">{listing.dates}</p>
        </div>
        <div className="flex items-center gap-1">
          <span className="material-symbols-outlined !text-[16px] text-[#0d141b] filled">star</span>
          <span className="text-sm font-medium text-[#0d141b]">{formatRating(listing.rating)}</span>
        </div>
      </div>

      {/* Hiển thị giá theo hình thức thuê ngắn hạn */}
      <div className="mt-2 flex items-baseline gap-1">
        <span className="font-bold text-[#0d141b] text-base">
          {formatPrice(listing.price)}đ
        </span>
        <span className="text-gray-500 text-sm">/đêm</span>
      </div>
    </Link>
  );
};

export default ListingCard;