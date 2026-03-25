import React from 'react';

const ListingInfo = ({ property }) => {
  // Kiểm tra dữ liệu đầu vào để tránh lỗi render
  if (!property) return null;

  return (
    <div className="lg:col-span-2 flex flex-col gap-8">
      
      {/* Header thông tin chủ nhà & phòng */}
      <div className="flex justify-between items-center py-6 border-b border-gray-200 dark:border-gray-700">
        <div>
          <h2 className="text-2xl font-bold text-[#0d141b] dark:text-white">
            {property.propertyType} - Chủ nhà: {property.host?.firstName} {property.host?.lastName}
          </h2>
          <p className="text-[#4c739a] dark:text-gray-400 mt-1">
            Tối đa {property.maxGuests} khách · {property.bedrooms} phòng ngủ · {property.beds} giường · {property.bathrooms} phòng tắm
          </p>
        </div>
        <div
          className="bg-cover bg-center rounded-full size-16 border border-gray-200 shadow-sm"
          style={{
            backgroundImage: `url('${property.host?.avatarUrl || 'https://via.placeholder.com/150'}')`,
          }}
        ></div>
      </div>

      {/* Các điểm nổi bật (Highlights) */}
      <div className="flex flex-col gap-6 py-2 border-b border-gray-200 dark:border-gray-700 pb-8">
        {property.host?.isVerified && (
          <div className="flex gap-4 items-start">
            <span className="material-symbols-outlined text-2xl text-blue-600 mt-1">
              military_tech
            </span>
            <div>
              <h3 className="font-bold text-[#0d141b] dark:text-white">
                {property.host.firstName} là Chủ nhà đã xác minh
              </h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                Những chủ nhà đã xác minh có kinh nghiệm và nhận được nhiều đánh giá tích cực.
              </p>
            </div>
          </div>
        )}
        
        <div className="flex gap-4 items-start">
          <span className="material-symbols-outlined text-2xl text-[#0d141b] dark:text-white mt-1">
            location_on
          </span>
          <div>
            <h3 className="font-bold text-[#0d141b] dark:text-white">Vị trí tuyệt vời</h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              95% khách gần đây đã đánh giá 5 sao cho vị trí này.
            </p>
          </div>
        </div>

        <div className="flex gap-4 items-start">
          <span className="material-symbols-outlined text-2xl text-[#0d141b] dark:text-white mt-1">
            calendar_month
          </span>
          <div>
            <h3 className="font-bold text-[#0d141b] dark:text-white">Hỗ trợ hủy phòng</h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              Hủy miễn phí trong vòng 48 giờ sau khi đặt phòng thành công.
            </p>
          </div>
        </div>
      </div>

      {/* Mô tả chi tiết */}
      <div className="py-2 border-b border-gray-200 dark:border-gray-700 pb-8">
        <div className="prose dark:prose-invert max-w-none text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">
          <p className="mb-4">
            {property.description}
          </p>
          <button className="font-bold underline text-[#0d141b] dark:text-white flex items-center gap-1 mt-2 hover:text-blue-600 transition-colors">
            Hiển thị thêm <span className="material-symbols-outlined text-[18px]">chevron_right</span>
          </button>
        </div>
      </div>

      {/* Tiện nghi (Amenities) */}
      <div className="py-2 border-b border-gray-200 dark:border-gray-700 pb-8">
        <h2 className="text-xl font-bold text-[#0d141b] dark:text-white mb-6">Nơi này có những gì cho bạn</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8">
          {property.amenities?.slice(0, 10).map((amenity, idx) => (
            <div key={idx} className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
              <span className="material-symbols-outlined text-gray-500">
                {amenity.icon || 'check_circle'}
              </span>
              <span>{amenity.name}</span>
            </div>
          ))}
        </div>
        
        {property.amenities?.length > 10 && (
          <button className="mt-8 px-6 py-3 border border-gray-800 dark:border-gray-200 rounded-lg font-semibold text-[#0d141b] dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
            Hiển thị tất cả {property.amenities.length} tiện nghi
          </button>
        )}
      </div>
    </div>
  );
};

export default ListingInfo;