import React, { useState, useEffect } from 'react';

const RejectModal = ({ open, onClose, onConfirm, propertyId }) => {
  const [reason, setReason] = useState('');

  useEffect(() => {
    if (open) {
      setReason('');
    }
  }, [open]);

  if (!open) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onConfirm(propertyId, reason);
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
        <h2 className="text-lg font-semibold mb-2">Reject Property</h2>
        <p className="text-sm text-gray-600 mb-4">
          Vui lòng nhập lý do reject (không bắt buộc nhưng nên có để dễ quản lý sau này).
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <textarea
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
            rows={4}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Ví dụ: Nội dung vi phạm chính sách..."
          />
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm rounded-md border border-gray-300 hover:bg-gray-100"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm rounded-md bg-red-600 text-white hover:bg-red-700"
            >
              Xác nhận Reject
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RejectModal;

