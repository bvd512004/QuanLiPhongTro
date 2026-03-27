import React, { useEffect, useMemo, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { api } from "../shared/services/api";

import ListingTitle from "../app/component/listing/ListingTitle";
import HeroGallery from "../app/component/listing/HeroGallary";
import ListingInfo from "../app/component/listing/ListingInfo";
import HostProfile from "../app/component/listing/HostProfile";
import ContactWidget from "../app/component/listing/ContactWidget";
import ReviewsSection from "../app/component/listing/ReviewSection";
import BookingWidget from "../app/component/listing/BookingWidget";

function ListingPage() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();

  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const initialCheckIn = useMemo(() => {
    const v = searchParams.get("checkIn");
    return v || undefined;
  }, [searchParams]);

  const initialCheckOut = useMemo(() => {
    const v = searchParams.get("checkOut");
    return v || undefined;
  }, [searchParams]);

  const initialGuests = useMemo(() => {
    const guests = searchParams.get("guests");
    if (guests) {
      const n = parseInt(guests, 10);
      return Number.isNaN(n) ? 1 : n;
    }
    const adults = Number(searchParams.get("adults") || 0);
    const children = Number(searchParams.get("children") || 0);
    const total = adults + children;
    return total > 0 ? total : undefined;
  }, [searchParams]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        setError(null);

        if (!id) throw new Error("Không tìm thấy mã phòng (ID)");
        const propertyId = Number(id);
        if (Number.isNaN(propertyId)) throw new Error("Mã phòng không hợp lệ");

        const res = await api.getPropertyById(propertyId);
        if (!cancelled) {
          setProperty(res?.success ? res.data : null);
          if (!res?.success) setError(res?.message || "Không thể tải thông tin phòng");
        }
      } catch (e) {
        if (!cancelled) setError(e.message || "Đã xảy ra lỗi khi lấy dữ liệu");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    window.scrollTo(0, 0);
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white dark:bg-[#0d141b]">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-t-4 border-blue-600 border-b-4 border-gray-200" />
          <p className="font-medium text-gray-500">Đang tải...</p>
        </div>
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-6 px-4">
        <span className="material-symbols-outlined text-6xl text-red-400">error</span>
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Rất tiếc!</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            {error || "Phòng này hiện không còn tồn tại."}
          </p>
        </div>
        <Link
          to="/"
          className="rounded-lg bg-blue-600 px-6 py-2 text-white shadow-md transition-all hover:bg-blue-700"
        >
          Quay lại trang chủ
        </Link>
      </div>
    );
  }

  const isLongTerm = property.rentalType === "LONG_TERM";

  const lat = property.latitude != null ? Number(property.latitude) : null;
  const lon = property.longitude != null ? Number(property.longitude) : null;
  const mapStaticUrl =
    lat != null && lon != null && !Number.isNaN(lat) && !Number.isNaN(lon)
      ? `https://staticmap.openstreetmap.de/staticmap.php?center=${lat},${lon}&zoom=14&size=1200x480&markers=${lat},${lon},lightblue1`
      : null;

  return (
    <div className="min-h-screen bg-white transition-colors duration-300 dark:bg-[#0d141b]">
      <main className="mx-auto max-w-[1280px] px-4 py-6 md:px-8 md:py-10 lg:px-12">
        <ListingTitle property={property} />

        <div className="mb-8">
          <HeroGallery images={property.images} />
        </div>

        <div className="relative mb-12 grid grid-cols-1 gap-12 lg:grid-cols-3">
          <ListingInfo property={property} />

          <div className="lg:col-span-1">
            <div className="sticky top-28">
              {isLongTerm ? (
                <ContactWidget property={property} />
              ) : (
                <BookingWidget
                  pricePerNight={property.pricePerNight}
                  rating={property.averageRating}
                  totalReviews={property.totalReviews}
                  cleaningFee={property.cleaningFee}
                  serviceFee={property.serviceFee}
                  property={property}
                  initialCheckIn={initialCheckIn}
                  initialCheckOut={initialCheckOut}
                  initialGuests={initialGuests ?? 1}
                />
              )}
            </div>
          </div>
        </div>

        <ReviewsSection
          rating={Number(property.averageRating || 0)}
          totalReviews={Number(property.totalReviews || 0)}
        />

        <div
          className="border-t border-gray-200 py-12 dark:border-gray-700"
          id="location"
        >
          <h2 className="mb-2 text-2xl font-bold text-[#0d141b] dark:text-white">
            {isLongTerm ? "Vị trí phòng trọ" : "Nơi bạn sẽ đến"}
          </h2>
          <p className="mb-6 font-medium text-gray-600 dark:text-gray-400">
            {property.address ? `${property.address}, ` : ""}
            {property.city}, {property.country}
          </p>

          <div className="relative h-[480px] w-full overflow-hidden rounded-2xl border border-gray-200 bg-gray-100 shadow-inner dark:border-gray-700">
            {mapStaticUrl ? (
              <img
                src={mapStaticUrl}
                alt={`Bản đồ ${property.city}`}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-gray-200 text-gray-500 dark:bg-gray-800">
                Chưa có tọa độ để hiển thị bản đồ
              </div>
            )}
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <div className="flex flex-col items-center">
                <div className="rounded-full bg-blue-600 p-3 text-white shadow-2xl">
                  <span className="material-symbols-outlined filled text-3xl">home_pin</span>
                </div>
                <div className="mt-2 rounded-md border border-gray-200 bg-white px-3 py-1 text-xs font-bold shadow-md dark:border-gray-600 dark:bg-gray-800">
                  Vị trí chính xác sau khi đặt
                </div>
              </div>
            </div>
          </div>
        </div>

        <HostProfile host={property.host} />
      </main>
    </div>
  );
}

export default ListingPage;
