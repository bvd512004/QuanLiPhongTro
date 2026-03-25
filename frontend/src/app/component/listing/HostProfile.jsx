import React from 'react';

const HostProfile = ({ host }) => {
  // Kiểm tra nếu không có dữ liệu host thì không render hoặc render placeholder
  if (!host) return null;

  return (
    <div className="py-12 border-t border-gray-200 dark:border-gray-700">
      <div className="flex flex-col md:flex-row gap-12">
        
        {/* Cột trái: Card thông tin cá nhân */}
        <div className="flex flex-col gap-6 w-full md:w-1/3">
          <div className="bg-white dark:bg-[#1A2633] p-8 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 flex flex-col items-center text-center">
            <div className="relative mb-4">
              <div
                className="bg-cover bg-center rounded-full size-28 border border-gray-200 shadow-sm"
                style={{
                  backgroundImage: `url('${host.avatarUrl || 'https://via.placeholder.com/150'}')`,
                }}
              ></div>
              {host.isVerified && (
                <div className="absolute bottom-1 right-0 bg-blue-600 text-white rounded-full p-1.5 border-4 border-white dark:border-[#1A2633]">
                  <span className="material-symbols-outlined text-lg filled flex">military_tech</span>
                </div>
              )}
            </div>
            
            <h3 className="text-2xl font-bold text-[#0d141b] dark:text-white">
              {host.firstName} {host.lastName}
            </h3>
            
            {host.isVerified && (
              <p className="text-sm font-semibold text-gray-500 mb-4 italic">Chủ nhà đã xác minh</p>
            )}

            {/* Chỉ số ảo (Mock stats) - Có thể map từ API sau này */}
            <div className="flex flex-col w-full gap-2 text-left px-4 mt-2">
              <div className="flex justify-between border-b border-gray-100 dark:border-gray-600 py-2 text-sm">
                <span className="text-gray-600 dark:text-gray-400">Đánh giá</span>
                <span className="font-bold">12</span>
              </div>
              <div className="flex justify-between border-b border-gray-100 dark:border-gray-600 py-2 text-sm">
                <span className="text-gray-600 dark:text-gray-400">Xếp hạng</span>
                <span className="font-bold flex items-center gap-1">
                  4.8 <span className="material-symbols-outlined text-yellow-500 text-sm filled">star</span>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Cột phải: Bio và Chi tiết */}
        <div className="flex flex-col justify-center gap-4 w-full md:w-2/3">
          <h3 className="text-2xl font-bold text-[#0d141b] dark:text-white">
            Chủ nhà: {host.firstName} {host.lastName}
          </h3>
          
          <p className="text-gray-600 dark:text-gray-400 max-w-lg whitespace-pre-line leading-relaxed">
            {host.bio || `Xin chào, mình là ${host.firstName}! Rất vui được hỗ trợ các bạn tìm được căn phòng ưng ý tại GoWhere.`}
          </p>

          <div className="flex flex-col gap-3 mt-4">
            <div className="flex gap-3 items-start">
              <span className="material-symbols-outlined text-gray-500">translate</span>
              <span className="text-gray-700 dark:text-gray-300">
                Ngôn ngữ: Tiếng Việt, Tiếng Anh
              </span>
            </div>
            <div className="flex gap-3 items-start">
              <span className="material-symbols-outlined text-gray-500">schedule</span>
              <span className="text-gray-700 dark:text-gray-300">
                Thời gian phản hồi: Thường trong vòng vài giờ
              </span>
            </div>
          </div>

          <button className="mt-6 w-fit px-8 py-3 bg-white dark:bg-transparent border-2 border-[#0d141b] dark:border-white rounded-xl font-bold text-[#0d141b] dark:text-white hover:bg-gray-900 hover:text-white dark:hover:bg-white dark:hover:text-black transition-all duration-300">
            Liên hệ với chủ nhà
          </button>

          {/* Cảnh báo an toàn */}
          <div className="flex items-center gap-3 mt-6 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl text-xs text-gray-500 border border-gray-100 dark:border-gray-700">
            <span className="material-symbols-outlined text-xl text-blue-500">gpp_good</span>
            <p>
              Để bảo vệ quyền lợi, tuyệt đối không chuyển tiền hoặc liên lạc bên ngoài hệ thống 
              <strong> HolaRent</strong> trước khi xác nhận thông tin chủ nhà.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HostProfile;