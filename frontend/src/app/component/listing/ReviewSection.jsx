import React from 'react';

const ReviewsSection = ({ rating, totalReviews }) => {
  // Các tiêu chí đánh giá chi tiết
  const metrics = [
    { label: "Độ sạch sẽ", score: "4.9", width: "98%" },
    { label: "Độ chính xác", score: "5.0", width: "100%" },
    { label: "Giao tiếp", score: "4.9", width: "98%" },
    { label: "Vị trí", score: "4.8", width: "95%" },
  ];

  // Dữ liệu mẫu đánh giá (Sau này Duc có thể fetch từ API)
  const reviews = [
    {
      name: "Trang",
      date: "Tháng 10 năm 2025",
      image: "https://via.placeholder.com/150",
      text: "Mình cực kỳ thích kỳ nghỉ tại đây! View thực tế còn đẹp hơn cả trên ảnh. Bể bơi rất sạch và chủ nhà phản hồi cực kỳ nhanh chóng."
    },
    {
      name: "Minh",
      date: "Tháng 9 năm 2025",
      image: "https://via.placeholder.com/150",
      text: "Vị trí tuyệt vời để khám phá Đà Nẵng. Căn villa rộng rãi và hiện đại. Chắc chắn sẽ giới thiệu cho nhóm bạn đông người."
    }
  ];

  return (
    <div id="reviews" className="py-12 border-t border-gray-200 dark:border-gray-700 mt-8">
      {/* Header đánh giá tổng quát */}
      <div className="flex items-center gap-2 mb-8">
        <span className="material-symbols-outlined text-2xl filled text-yellow-500">star</span>
        <h2 className="text-2xl font-bold text-[#0d141b] dark:text-white">
          {rating > 0 ? rating.toFixed(2) : 'Mới'} · {totalReviews} đánh giá
        </h2>
      </div>

      {/* Thanh đo chỉ số đánh giá (Review Metrics) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4 mb-10">
        {metrics.map((metric, idx) => (
          <div key={idx} className="flex justify-between items-center">
            <span className="text-gray-700 dark:text-gray-300 min-w-[120px]">{metric.label}</span>
            <div className="flex items-center gap-3 w-1/2">
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1">
                <div 
                  className="bg-black dark:bg-white h-1 rounded-full transition-all duration-1000" 
                  style={{ width: metric.width }}
                ></div>
              </div>
              <span className="text-sm font-bold min-w-[25px]">{metric.score}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Danh sách các thẻ Review */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-10">
        {reviews.map((review, idx) => (
          <div key={idx} className="flex flex-col gap-4">
            <div className="flex items-center gap-4">
              <div
                className="bg-cover bg-center rounded-full size-12 bg-gray-200 shadow-sm"
                style={{ backgroundImage: `url('${review.image}')` }}
              ></div>
              <div>
                <h4 className="font-bold text-[#0d141b] dark:text-white leading-none">{review.name}</h4>
                <p className="text-xs text-gray-500 mt-1.5">{review.date}</p>
              </div>
            </div>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-[15px]">
              {review.text}
            </p>
          </div>
        ))}
      </div>

      {/* Nút xem thêm */}
      <button className="mt-10 px-8 py-3 border border-black dark:border-white rounded-xl font-bold text-[#0d141b] dark:text-white hover:bg-gray-900 hover:text-white dark:hover:bg-white dark:hover:text-black transition-all duration-300">
        Hiển thị tất cả {totalReviews} đánh giá
      </button>
    </div>
  );
};

export default ReviewsSection;