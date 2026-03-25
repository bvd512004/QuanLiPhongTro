import React from 'react';

const ListingTitle = ({ property }) => {
  // Kiểm tra dữ liệu an toàn
  if (!property) return null;

  return (
    <div className="mb-6">
      <div className="flex flex-col gap-2">
        {/* Tiêu đề chính */}
        <h1 className="text-[#0d141b] dark:text-white text-3xl md:text-4xl font-extrabold leading-tight tracking-[-0.033em]">
          {property.title}
        </h1>

        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* Thông tin phụ: Đánh giá, Số review, Trạng thái chủ nhà, Địa điểm */}
          <div className="flex flex-wrap items-center gap-2 text-sm md:text-base text-[#0d141b] dark:text-gray-300 font-medium">
            <span className="flex items-center gap-1">
              <span className="material-symbols-outlined text-sm filled text-yellow-500">star</span>
              {property.averageRating > 0 ? property.averageRating.toFixed(2) : 'Mới'}
            </span>
            
            <span>·</span>
            
            <a className="underline font-semibold hover:text-blue-600 transition-colors" href="#reviews">
              {property.totalReviews} đánh giá
            </a>
            
            <span>·</span>
            
            <span className="flex items-center gap-1 text-[#4c739a] dark:text-gray-400">
              <span className="material-symbols-outlined text-sm filled text-rose-500">
                military_tech
              </span>
              {property.host?.isVerified ? 'Chủ nhà xác minh' : 'Chủ nhà'}
            </span>
            
            <span>·</span>
            
            <a
              className="underline text-[#4c739a] dark:text-gray-400 hover:text-blue-600 transition-colors"
              href="#location"
            >
              {property.city}, {property.country}
            </a>
          </div>

          {/* Nút thao tác nhanh */}
          <div className="flex gap-3">
            <button className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-sm font-semibold underline transition-colors">
              <span className="material-symbols-outlined text-[18px]">ios_share</span>
              Chia sẻ
            </button>
            <button className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-sm font-semibold underline transition-colors">
              <span className="material-symbols-outlined text-[18px]">favorite</span>
              Lưu tin
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ListingTitle;