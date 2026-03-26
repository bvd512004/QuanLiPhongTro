import React from "react";
import { Link, useLocation } from "react-router-dom";

function CheckoutPage() {
  const { state } = useLocation();

  const property = state?.property;
  const checkInDate = state?.checkInDate;
  const checkOutDate = state?.checkOutDate;
  const totalPrice = state?.totalPrice;
  const numGuests = state?.numGuests;

  if (!state || !property) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center">
        <p className="text-lg font-semibold">Thiếu thông tin checkout</p>
        <p className="text-sm text-gray-500 mt-1">
          Vui lòng quay lại trang chi tiết để chọn ngày/khách.
        </p>
        <div className="mt-4">
          <Link
            to="/"
            className="inline-block bg-primary text-white px-4 py-2 rounded-lg font-semibold"
          >
            Về trang chủ
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[900px] px-4 sm:px-8 lg:px-12 py-10">
      <h1 className="text-2xl font-bold mb-6">Checkout</h1>

      <div className="bg-white shadow-lg rounded-2xl p-6 border border-gray-200">
        <div className="flex flex-col gap-2">
          <p className="text-sm text-gray-500">Property</p>
          <p className="font-semibold">{property.title}</p>
          <p className="text-sm text-gray-500">
            {property.city}, {property.country}
          </p>
        </div>

        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 bg-gray-50 rounded-xl">
            <p className="text-sm text-gray-500">Check-in</p>
            <p className="font-semibold">{checkInDate}</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-xl">
            <p className="text-sm text-gray-500">Check-out</p>
            <p className="font-semibold">{checkOutDate}</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-xl">
            <p className="text-sm text-gray-500">Khách</p>
            <p className="font-semibold">{numGuests}</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-xl">
            <p className="text-sm text-gray-500">Tổng tiền</p>
            <p className="font-semibold">
              {typeof totalPrice === "number"
                ? totalPrice.toLocaleString("vi-VN")
                : totalPrice}
              đ
            </p>
          </div>
        </div>

        <div className="mt-6 text-sm text-gray-600">
          Trang checkout hiện chỉ hiển thị tóm tắt. Nếu bạn có flow tạo booking/payment, nói mình để
          bổ sung tiếp.
        </div>
        <div className="mt-6 flex gap-3">
          <Link
            to="/"
            className="flex-1 text-center bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg font-semibold"
          >
            Hủy
          </Link>
          <button className="flex-1 bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg font-semibold">
            Xác nhận
          </button>
        </div>
      </div>
    </div>
  );
}

export default CheckoutPage;

