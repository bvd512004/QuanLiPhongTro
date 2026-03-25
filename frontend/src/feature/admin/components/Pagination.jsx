import React from 'react';

const Pagination = ({ page, size, totalItems, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  const currentPage = page;

  const handlePrev = () => {
    if (currentPage > 0) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages - 1) {
      onPageChange(currentPage + 1);
    }
  };

  const pages = [];
  for (let i = 0; i < totalPages; i += 1) {
    pages.push(i);
  }

  return (
    <div className="flex flex-col md:flex-row items-center justify-between gap-3 mt-4">
      <div className="text-sm text-gray-600">
        Đang hiển thị trang <span className="font-semibold">{currentPage + 1}</span> /{' '}
        <span className="font-semibold">{totalPages}</span> ({totalItems} bản ghi)
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={handlePrev}
          disabled={currentPage === 0}
          className="px-3 py-1 text-sm rounded-md border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
        >
          Previous
        </button>
        {pages.map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => onPageChange(p)}
            className={`px-3 py-1 text-sm rounded-md border ${
              p === currentPage
                ? 'bg-indigo-600 text-white border-indigo-600'
                : 'border-gray-300 hover:bg-gray-100'
            }`}
          >
            {p + 1}
          </button>
        ))}
        <button
          type="button"
          onClick={handleNext}
          disabled={currentPage === totalPages - 1}
          className="px-3 py-1 text-sm rounded-md border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default Pagination;

