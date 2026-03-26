import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import HostSidebar from '../components/HostSidebar';
import HostHeader from '../components/HostHeader';
import hostService from '../services/host.service';
import { AuthStateContext } from '@/app/providers/AuthProvider.jsx';

const formatDateTime = (value) => {
  if (!value) return '--';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '--';
  return date.toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const getGuestName = (review) => {
  const firstName = review.guestFirstName || review.guest?.firstName || '';
  const lastName = review.guestLastName || review.guest?.lastName || '';
  const fullName = `${firstName} ${lastName}`.trim();
  return fullName || 'Guest';
};

const renderStars = (rating) => {
  const safeRating = Math.max(0, Math.min(5, Math.round(Number(rating) || 0)));
  return [1, 2, 3, 4, 5].map((star) => (
    <span
      key={`star-${star}`}
      className={`material-symbols-outlined !text-[18px] ${star <= safeRating ? 'text-amber-500' : 'text-slate-300'}`}
    >
      star
    </span>
  ));
};

const HostReviewsPage = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submittingReviewId, setSubmittingReviewId] = useState(null);
  const [replyDrafts, setReplyDrafts] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRating, setSelectedRating] = useState('all');
  const [statsLoading, setStatsLoading] = useState(true);
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [ratingCounts, setRatingCounts] = useState({
    5: 0,
    4: 0,
    3: 0,
    2: 0,
    1: 0,
  });
  const [page, setPage] = useState(0);
  const [size] = useState(10);
  const [pageInfo, setPageInfo] = useState({
    totalElements: 0,
    totalPages: 0,
    first: true,
    last: true,
  });

  const { user } = useContext(AuthStateContext);

  const hostUser = useMemo(() => ({
    name: user?.fullName || `${user?.firstName || ''} ${user?.lastName || ''}`.trim(),
    avatarUrl: user?.avatarUrl || `https://api.dicebear.com/9.x/avataaars/svg?seed=${user?.firstName || 'host'}`,
    role: 'Host',
  }), [user]);

  const loadReviews = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await hostService.getHostReviews({
        page,
        size,
        rating: selectedRating === 'all' ? undefined : Number(selectedRating),
      });
      const payload = response?.data?.content || [];
      const normalized = Array.isArray(payload) ? payload : [];
      setReviews(normalized);
      setPageInfo({
        totalElements: response?.data?.totalElements || 0,
        totalPages: response?.data?.totalPages || 0,
        first: response?.data?.first ?? true,
        last: response?.data?.last ?? true,
      });
    } catch (err) {
      const fallbackMessage = 'Khong the tai danh sach review. Vui long thu lai.';
      setError(err?.response?.data?.message || err?.message || fallbackMessage);
      setReviews([]);
      setPageInfo({ totalElements: 0, totalPages: 0, first: true, last: true });
    } finally {
      setLoading(false);
    }
  }, [page, selectedRating, size]);

  const loadReviewStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      const [dashboardResponse, ...ratingResponses] = await Promise.all([
        hostService.getDashboardStats(),
        hostService.getHostReviews({ page: 0, size: 1, rating: 5 }),
        hostService.getHostReviews({ page: 0, size: 1, rating: 4 }),
        hostService.getHostReviews({ page: 0, size: 1, rating: 3 }),
        hostService.getHostReviews({ page: 0, size: 1, rating: 2 }),
        hostService.getHostReviews({ page: 0, size: 1, rating: 1 }),
      ]);

      const dashboardData = dashboardResponse?.data || {};
      setAverageRating(Number(dashboardData?.averageRating || 0));
      setTotalReviews(Number(dashboardData?.totalReviews || 0));

      setRatingCounts({
        5: Number(ratingResponses[0]?.data?.totalElements || 0),
        4: Number(ratingResponses[1]?.data?.totalElements || 0),
        3: Number(ratingResponses[2]?.data?.totalElements || 0),
        2: Number(ratingResponses[3]?.data?.totalElements || 0),
        1: Number(ratingResponses[4]?.data?.totalElements || 0),
      });
    } catch (statsError) {
      console.error('Failed to load review stats:', statsError);
      setAverageRating(0);
      setTotalReviews(0);
      setRatingCounts({ 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 });
    } finally {
      setStatsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user && (user.isHost || user.roles?.includes('ROLE_HOST'))) {
      loadReviews();
    }
  }, [user, loadReviews]);

  useEffect(() => {
    if (user && (user.isHost || user.roles?.includes('ROLE_HOST'))) {
      loadReviewStats();
    }
  }, [user, loadReviewStats]);

  const handleChangeRating = (value) => {
    setSelectedRating(value);
    setPage(0);
  };

  const toggleRatingFilter = (rating) => {
    const nextValue = selectedRating === String(rating) ? 'all' : String(rating);
    handleChangeRating(nextValue);
  };

  const handleSearch = (value) => {
    setSearchTerm(value);
    setPage(0);
  };

  const filteredReviews = useMemo(() => {
    const keyword = searchTerm.trim().toLowerCase();
    if (!keyword) return reviews;

    return reviews.filter((review) => {
      const propertyTitle = (review.propertyTitle || review.property?.title || '').toLowerCase();
      const guestName = getGuestName(review).toLowerCase();
      const comment = (review.comment || '').toLowerCase();
      return propertyTitle.includes(keyword) || guestName.includes(keyword) || comment.includes(keyword);
    });
  }, [reviews, searchTerm]);

  const handleReplyChange = (reviewId, value) => {
    setReplyDrafts((prev) => ({ ...prev, [reviewId]: value }));
  };

  const handleSubmitReply = async (review) => {
    const draftValue = replyDrafts[review.id] ?? review.hostResponse ?? '';
    const payload = draftValue.trim();
    if (!payload) {
      return;
    }

    setSubmittingReviewId(review.id);
    try {
      const response = await hostService.replyToReview(review.id, payload);
      const updated = response?.data || null;

      setReviews((prev) => prev.map((item) => (
        item.id === review.id
          ? {
            ...item,
            hostResponse: updated?.hostResponse || payload,
          }
          : item
      )));
      setReplyDrafts((prev) => ({ ...prev, [review.id]: updated?.hostResponse || payload }));
    } catch (err) {
      const message = err?.response?.data?.message || 'Khong the gui phan hoi. Vui long thu lai.';
      setError(message);
    } finally {
      setSubmittingReviewId(null);
    }
  };

  const getReplyButtonLabel = (review) => {
    if (submittingReviewId === review.id) {
      return 'Dang gui...';
    }
    if (review.hostResponse) {
      return 'Cap nhat phan hoi';
    }
    return 'Gui phan hoi';
  };

  if (!user) {
    return (
      <div className="flex h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-white to-sky-50">
        <div className="text-center">
          <h1 className="text-2xl font-semibold tracking-tight leading-tight text-slate-900 mb-4">Authentication Required</h1>
          <p className="text-slate-600 leading-relaxed tracking-[0.01em] mb-4">Please log in to access the host portal.</p>
          <Link to="/auth" className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg font-semibold">
            Log In
          </Link>
        </div>
      </div>
    );
  }

  if (!user.isHost && !user.roles?.includes('ROLE_HOST')) {
    return (
      <div className="flex h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-white to-sky-50">
        <div className="text-center">
          <h1 className="text-2xl font-semibold tracking-tight leading-tight text-slate-900 mb-4">Host Access Required</h1>
          <p className="text-slate-600 leading-relaxed tracking-[0.01em] mb-4">You need to become a host to access this page.</p>
          <Link to="/host" className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg font-semibold">
            Become a Host
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-blue-50 via-white to-sky-50 text-slate-900 overflow-hidden page-transition">
      <HostSidebar
        user={hostUser}
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      />

      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        <HostHeader onMenuToggle={() => setMobileMenuOpen(true)} />

        <div className="flex-1 overflow-y-auto p-6 scroll-smooth">
          <div className="max-w-[1280px] mx-auto w-full flex flex-col gap-6">
            <nav className="flex text-sm font-medium tracking-[0.01em] text-slate-600">
              <Link to="/" className="hover:text-primary transition-colors">Home</Link>
              <span className="mx-2">/</span>
              <Link to="/host" className="hover:text-primary transition-colors">Host Portal</Link>
              <span className="mx-2">/</span>
              <span className="text-slate-900">Reviews</span>
            </nav>

            <div className="flex flex-col gap-2">
              <h1 className="text-slate-900 text-3xl md:text-4xl font-semibold leading-tight tracking-tight">
                Danh gia tu khach hang
              </h1>
              <p className="text-slate-600 text-base font-normal leading-relaxed tracking-[0.01em]">
                Theo doi phan hoi de cai thien chat luong tin dang va trai nghiem luu tru.
              </p>
            </div>

            <div className="bg-white border border-blue-100 rounded-2xl p-5 shadow-[0_10px_28px_rgba(15,23,42,0.06)]">
              <div>
                <label htmlFor="reviewSearch" className="block text-sm font-semibold text-slate-700 mb-2">
                  Tim kiem review
                </label>
                <input
                  id="reviewSearch"
                  type="text"
                  value={searchTerm}
                  onChange={(event) => handleSearch(event.target.value)}
                  placeholder="Tim theo ten tin dang, ten khach hoac noi dung review"
                  className="w-full h-11 rounded-lg border border-blue-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
            </div>

            <div className="bg-white border border-blue-100 rounded-2xl p-5 shadow-[0_10px_28px_rgba(15,23,42,0.06)]">
              <div className="flex items-center justify-between mb-4 gap-3">
                <h3 className="text-lg font-semibold tracking-tight text-slate-900">Tong quan danh gia</h3>
                {selectedRating !== 'all' && (
                  <button
                    onClick={() => handleChangeRating('all')}
                    className="text-sm font-semibold text-primary hover:text-primary/80"
                  >
                    Bo loc sao
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="rounded-xl border border-blue-100 bg-blue-50/60 p-4 flex flex-col justify-center">
                  <p className="text-sm text-slate-600">Danh gia trung binh</p>
                  <p className="text-3xl font-bold text-slate-900 mt-1">{averageRating.toFixed(1)} / 5</p>
                  <div className="mt-2 flex items-center gap-1">{renderStars(averageRating)}</div>
                  <p className="text-sm text-slate-500 mt-2">Tong so review: {totalReviews}</p>
                </div>

                <div className="lg:col-span-2 space-y-2">
                  {[5, 4, 3, 2, 1].map((star) => {
                    const count = ratingCounts[star] || 0;
                    const percentage = totalReviews > 0 ? Math.round((count / totalReviews) * 100) : 0;
                    const isActive = selectedRating === String(star);

                    return (
                      <button
                        key={star}
                        onClick={() => toggleRatingFilter(star)}
                        className={`w-full rounded-lg border p-3 text-left transition-colors ${
                          isActive
                            ? 'border-primary bg-primary/10'
                            : 'border-blue-100 bg-white hover:bg-blue-50'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-16 text-sm font-semibold text-slate-700">{star} sao</div>
                          <div className="flex-1 h-2 rounded-full bg-slate-100 overflow-hidden">
                            <div className="h-full bg-amber-400" style={{ width: `${percentage}%` }} />
                          </div>
                          <div className="w-24 text-right text-sm font-semibold text-slate-900">{count} review</div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {statsLoading && (
                <p className="text-sm text-slate-500 mt-3">Dang cap nhat thong ke...</p>
              )}
            </div>

            {loading && (
              <div className="flex flex-col items-center justify-center h-64 bg-white rounded-2xl border border-blue-100">
                <span className="material-symbols-outlined animate-spin text-4xl text-primary mb-4">progress_activity</span>
                <p className="text-slate-600">Dang tai review...</p>
              </div>
            )}

            {!loading && error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 flex items-center justify-between gap-3">
                <p>{error}</p>
                <button
                  onClick={loadReviews}
                  className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors"
                >
                  Thu lai
                </button>
              </div>
            )}

            {!loading && !error && reviews.length === 0 && (
              <div className="bg-white border border-blue-100 rounded-2xl p-10 text-center">
                <span className="material-symbols-outlined text-5xl text-slate-300">reviews</span>
                <h3 className="mt-3 text-xl font-semibold text-slate-900">Chua co review nao</h3>
                <p className="text-slate-600 mt-2">Khi khach danh gia, ban se thay noi dung o day.</p>
              </div>
            )}

            {!loading && !error && reviews.length > 0 && filteredReviews.length === 0 && (
              <div className="bg-white border border-blue-100 rounded-2xl p-8 text-center">
                <span className="material-symbols-outlined text-5xl text-slate-300">search_off</span>
                <h3 className="mt-3 text-xl font-semibold text-slate-900">Khong tim thay review phu hop</h3>
                <p className="text-slate-600 mt-2">Thu tu khoa khac hoac doi bo loc so sao.</p>
              </div>
            )}

            {!loading && !error && filteredReviews.length > 0 && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 pb-6">
                {filteredReviews.map((review) => (
                  <article
                    key={review.id}
                    className="bg-white rounded-2xl p-6 border border-blue-100 shadow-[0_10px_28px_rgba(15,23,42,0.06)]"
                  >
                    {(() => {
                      const draftContent = replyDrafts[review.id] ?? review.hostResponse ?? '';

                      return (
                        <>
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <div>
                        <p className="text-xs uppercase tracking-wide text-primary font-semibold">{review.propertyTitle || review.property?.title || 'N/A'}</p>
                        <h3 className="text-base font-semibold text-slate-900 mt-1">{getGuestName(review)}</h3>
                      </div>
                      <span className="text-xs text-slate-500">{formatDateTime(review.createdAt)}</span>
                    </div>

                    <div className="flex items-center gap-1 mb-3">
                      {renderStars(review.overallRating)}
                      <span className="text-sm text-slate-600 ml-2">{Number(review.overallRating || 0).toFixed(1)}</span>
                    </div>

                    <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                      {review.comment || 'Khach hang chua de lai binh luan.'}
                    </p>

                    <div className="mt-4 rounded-lg bg-blue-50 p-3 border border-blue-100">
                      <p className="text-xs font-semibold uppercase tracking-wide text-primary mb-2">Phan hoi cua ban</p>
                      <textarea
                        rows={3}
                        value={draftContent}
                        onChange={(event) => handleReplyChange(review.id, event.target.value)}
                        className="w-full rounded-lg border border-blue-200 px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/30"
                        placeholder="Nhap phan hoi cho review nay..."
                      />
                      <div className="mt-2 flex justify-end">
                        <button
                          onClick={() => handleSubmitReply(review)}
                          disabled={submittingReviewId === review.id}
                          className="px-4 py-2 rounded-lg bg-primary text-white hover:bg-primary/90 disabled:bg-slate-400 transition-colors"
                        >
                          {getReplyButtonLabel(review)}
                        </button>
                      </div>
                    </div>
                        </>
                      );
                    })()}
                  </article>
                ))}
              </div>
            )}

            {!loading && !error && pageInfo.totalPages > 1 && (
              <div className="pb-6 flex items-center justify-between gap-4">
                <p className="text-sm text-slate-600">
                  Hien thi trang {page + 1}/{pageInfo.totalPages} - Tong {pageInfo.totalElements} review
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPage((prev) => Math.max(prev - 1, 0))}
                    disabled={pageInfo.first}
                    className="h-10 px-4 rounded-lg border border-blue-200 bg-white text-sm font-medium text-slate-700 disabled:opacity-50"
                  >
                    Truoc
                  </button>
                  <button
                    onClick={() => setPage((prev) => prev + 1)}
                    disabled={pageInfo.last}
                    className="h-10 px-4 rounded-lg border border-blue-200 bg-white text-sm font-medium text-slate-700 disabled:opacity-50"
                  >
                    Sau
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default HostReviewsPage;

