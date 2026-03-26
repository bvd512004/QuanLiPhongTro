import React, { useState } from 'react';

const HeroGallery = ({ images }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Đảm bảo images luôn là một mảng
  const allMedia = images || [];

  // Hiển thị tối đa 5 item đầu tiên (1 ảnh lớn, 4 ảnh nhỏ)
  const displayMedia = allMedia.slice(0, 5);
  const mainMedia = displayMedia[0];
  const subMedia = displayMedia.slice(1);

  const isVideo = (media) => {
    return media?.mediaType === 'VIDEO' || media?.mediaType === 'VIDEO_360';
  };

  const isVideo360 = (media) => {
    return media?.mediaType === 'VIDEO_360';
  };

  const renderMediaItem = (media, className = '', isMain = false) => {
    if (!media) {
      return (
        <div className={`w-full h-full bg-gray-200 flex items-center justify-center ${className}`}>
          <span className="text-gray-400">Không có hình ảnh</span>
        </div>
      );
    }

    if (isVideo(media)) {
      return (
        <div className={`relative w-full h-full ${className}`}>
          <video
            src={media.imageUrl}
            className="w-full h-full object-cover"
            controls={isMain}
            muted
            loop
            playsInline
            poster={media.imageUrl + '?frame=0'}
          />
          <div className="absolute top-3 right-3 bg-black/70 text-white px-2 py-1 rounded-md text-xs font-medium flex items-center gap-1">
            {isVideo360(media) ? (
              <>
                <span className="material-symbols-outlined text-[16px]">360</span>
                <span>Video 360°</span>
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-[16px]">videocam</span>
                <span>Video</span>
              </>
            )}
          </div>
        </div>
      );
    }

    // Render ảnh thông thường
    return (
      <div
        className={`w-full h-full bg-cover bg-center transition-transform duration-500 group-hover:scale-105 ${className}`}
        style={{
          backgroundImage: `url('${media.imageUrl}')`,
        }}
      ></div>
    );
  };

  return (
    <div className="relative w-full rounded-xl overflow-hidden mb-10 h-[300px] md:h-[400px] lg:h-[500px]">
      <div className="grid grid-cols-1 md:grid-cols-4 grid-rows-2 gap-2 h-full">
        
        {/* Media chính bên trái */}
        <div
          className="col-span-1 md:col-span-2 row-span-2 relative group cursor-pointer"
          onClick={() => { setCurrentIndex(0); setIsModalOpen(true); }}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { setCurrentIndex(0); setIsModalOpen(true); } }}
          role="button"
          tabIndex={0}
        >
          {renderMediaItem(mainMedia, '', true)}
          {mainMedia && (
            <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors"></div>
          )}
        </div>

        {/* 4 Media phụ bên phải */}
        {[0, 1, 2, 3].map((index) => {
          const media = subMedia[index];
          return (
            <div
              key={index}
              className="hidden md:block col-span-1 row-span-1 relative group cursor-pointer"
              onClick={() => { if (media) { setCurrentIndex(index + 1); setIsModalOpen(true); } }}
              onKeyDown={(e) => { if (media && (e.key === 'Enter' || e.key === ' ')) { setCurrentIndex(index + 1); setIsModalOpen(true); } }}
              role="button"
              tabIndex={media ? 0 : -1}
            >
              {renderMediaItem(media)}

              {/* Hiển thị nút "Xem tất cả" ở ảnh cuối cùng */}
              {index === 3 && (
                <button
                  className="absolute bottom-4 right-4 bg-white text-black px-4 py-1.5 rounded-lg text-sm font-semibold shadow-md flex items-center gap-2 hover:bg-gray-100 transition-colors z-10"
                  onClick={(e) => { e.stopPropagation(); setCurrentIndex(0); setIsModalOpen(true); }}
                >
                  <span className="material-symbols-outlined text-[18px]">grid_view</span>
                  Tất cả ảnh
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Modal xem chi tiết Media */}
      {isModalOpen && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setIsModalOpen(false)}
          onKeyDown={(e) => { if (e.key === 'Escape') setIsModalOpen(false); }}
          role="dialog"
          aria-modal="true"
          tabIndex={-1}
        >
          <div
            className="relative w-full max-w-6xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Nút đóng */}
            <button
              className="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors"
              onClick={() => setIsModalOpen(false)}
            >
              <span className="material-symbols-outlined text-4xl">close</span>
            </button>

            {/* Điều hướng Trái/Phải */}
            {currentIndex > 0 && (
              <button
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-black rounded-full p-2 transition-colors z-10"
                onClick={() => setCurrentIndex(currentIndex - 1)}
              >
                <span className="material-symbols-outlined">chevron_left</span>
              </button>
            )}
            {currentIndex < allMedia.length - 1 && (
              <button
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-black rounded-full p-2 transition-colors z-10"
                onClick={() => setCurrentIndex(currentIndex + 1)}
              >
                <span className="material-symbols-outlined">chevron_right</span>
              </button>
            )}

            {/* Vùng hiển thị Media */}
            <div className="bg-white rounded-lg overflow-hidden max-h-[80vh] flex items-center justify-center">
              {isVideo(allMedia[currentIndex]) ? (
                <video
                  src={allMedia[currentIndex].imageUrl}
                  className="w-full h-full max-h-[80vh] object-contain bg-black"
                  controls
                  autoPlay
                  playsInline
                >
                  <track kind="captions" />
                </video>
              ) : (
                <img
                  src={allMedia[currentIndex].imageUrl}
                  alt={allMedia[currentIndex].caption || `Hình ảnh ${currentIndex + 1}`}
                  className="w-full h-full max-h-[80vh] object-contain"
                />
              )}
              {allMedia[currentIndex]?.caption && (
                <div className="absolute bottom-0 left-0 right-0 p-4 bg-black/50 text-white backdrop-blur-sm">
                  <p>{allMedia[currentIndex].caption}</p>
                </div>
              )}
            </div>

            {/* Số thứ tự */}
            <div className="text-white text-center mt-4 font-medium">
              {currentIndex + 1} / {allMedia.length}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HeroGallery;