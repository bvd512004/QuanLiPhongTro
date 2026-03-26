import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { adminPropertyApi } from '@/feature/admin/api/adminPropertyApi';
import RejectModal from '@/feature/admin/components/RejectModal';

const formatDateTime = (value) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${day}/${month}/${year} ${hours}:${minutes}`;
};

const formatPrice = (value) => {
  if (value == null) return '';
  try {
    const number = typeof value === 'number' ? value : Number(value);
    if (Number.isNaN(number)) return value;
    return number.toLocaleString('vi-VN');
  } catch (e) {
    return value;
  }
};

const StatusBadge = ({ status }) => {
  const cls = useMemo(() => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'REJECTED':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'PENDING':
      case 'UNDER_REVIEW':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'INACTIVE':
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  }, [status]);

  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium ${cls}`}>
      {status || '-'}
    </span>
  );
};

const DocTypeLabel = (type) => {
  switch (type) {
    case 'LAND_CERTIFICATE':
      return 'Sổ đỏ / Sổ hồng';
    case 'OWNER_ID_CARD':
      return 'CCCD/CMND chủ sở hữu';
    case 'AUTHORIZATION_PAPER':
      return 'Giấy ủy quyền';
    case 'CONTRACT':
      return 'Hợp đồng';
    default:
      return type || 'Khác';
  }
};

const AdminPropertyDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [detail, setDetail] = useState(null);

  const [rejectModalOpen, setRejectModalOpen] = useState(false);

  const fetchDetail = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError('');
    try {
      const res = await adminPropertyApi.getPropertyDetail(id);
      if (!res.success) {
        setError(res.message || 'Không thể tải hồ sơ property.');
        setDetail(null);
        return;
      }
      setDetail(res.data);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchDetail();
  }, [fetchDetail]);

  const images = detail?.images || [];
  const documents = detail?.documents || [];
  const host = detail?.host || null;
  const amenities = Array.isArray(detail?.amenities) ? detail.amenities : detail?.amenities ? Array.from(detail.amenities) : [];

  const imagesOk = images.length >= 3;

  const handleApprove = async () => {
    if (!detail?.id) return;
    setError('');
    setSuccessMessage('');
    const result = await adminPropertyApi.approveProperty(detail.id);
    if (!result.success) {
      setError(result.message || 'Không thể approve property.');
      return;
    }
    setSuccessMessage('Approve property thành công.');
    fetchDetail();
  };

  const handleOpenReject = () => {
    setRejectModalOpen(true);
  };

  const handleCloseReject = () => {
    setRejectModalOpen(false);
  };

  const handleConfirmReject = async (propertyId, reason) => {
    setError('');
    setSuccessMessage('');
    const result = await adminPropertyApi.rejectProperty(propertyId, reason);
    if (!result.success) {
      setError(result.message || 'Không thể reject property.');
      return;
    }
    setSuccessMessage('Reject property thành công.');
    setRejectModalOpen(false);
    fetchDetail();
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-gray-100 px-4 py-6 md:px-8 md:py-10">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="inline-flex items-center gap-2 rounded-md border border-gray-200 bg-white px-3 py-2 hover:bg-gray-50"
              >
                ← Quay lại
              </button>
              <span className="hidden md:inline">/</span>
              <Link className="hidden md:inline text-indigo-600 hover:underline" to="/admin/properties/moderation">
                Moderation
              </Link>
            </div>
            <h1 className="mt-3 text-2xl md:text-3xl font-bold text-gray-900">
              Hồ sơ property
            </h1>
            <div className="mt-2 inline-flex items-center gap-2 rounded-xl border border-indigo-200 bg-indigo-50 px-3 py-2 text-sm">
              <span className="material-symbols-outlined !text-[18px] text-indigo-700">tag</span>
              <span className="font-semibold text-indigo-800">Host email:</span>
              <span className="font-mono font-bold text-indigo-900">{host?.email ?? '-'}</span>
            </div>
            <p className="mt-1 text-sm text-gray-600">
              Xem ảnh phòng, giấy tờ và thông tin host trước khi duyệt.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <StatusBadge status={detail?.status} />
            {detail?.createdAt && (
              <span className="text-xs text-gray-500">Tạo lúc {formatDateTime(detail.createdAt)}</span>
            )}
          </div>
        </div>

        {error && (
          <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-700 border border-red-200">
            {error}
          </div>
        )}

        {successMessage && (
          <div className="mb-4 rounded-md bg-emerald-50 p-3 text-sm text-emerald-700 border border-emerald-200">
            {successMessage}
          </div>
        )}

        {loading && (
          <div className="flex justify-center items-center py-16">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600" />
          </div>
        )}

        {!loading && detail && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-8 space-y-6">
              <div className="rounded-xl bg-white shadow border border-gray-100 overflow-hidden">
                <div className="p-5 md:p-6 border-b border-gray-100">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                    <div>
                      <h2 className="text-lg md:text-xl font-semibold text-gray-900">{detail.title}</h2>
                      <p className="mt-1 text-sm text-gray-600">
                        {detail.address} — {detail.city}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-100 px-3 py-2 text-sm font-medium">
                        {formatPrice(detail.pricePerNight)} / đêm
                      </div>
                      <div className={`rounded-lg px-3 py-2 text-sm font-medium border ${
                        imagesOk ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-amber-50 text-amber-700 border-amber-100'
                      }`}>
                        Ảnh: {images.length}/3
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-5 md:p-6">
                  <div className="mb-5 grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="rounded-lg border border-gray-100 bg-gray-50 px-3 py-2">
                      <div className="text-[11px] text-gray-500">Max guests</div>
                      <div className="text-sm font-semibold text-gray-900">{detail?.maxGuests ?? '-'}</div>
                    </div>
                    <div className="rounded-lg border border-gray-100 bg-gray-50 px-3 py-2">
                      <div className="text-[11px] text-gray-500">Bedrooms</div>
                      <div className="text-sm font-semibold text-gray-900">{detail?.bedrooms ?? '-'}</div>
                    </div>
                    <div className="rounded-lg border border-gray-100 bg-gray-50 px-3 py-2">
                      <div className="text-[11px] text-gray-500">Beds</div>
                      <div className="text-sm font-semibold text-gray-900">{detail?.beds ?? '-'}</div>
                    </div>
                    <div className="rounded-lg border border-gray-100 bg-gray-50 px-3 py-2">
                      <div className="text-[11px] text-gray-500">Bathrooms</div>
                      <div className="text-sm font-semibold text-gray-900">{detail?.bathrooms ?? '-'}</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {images.length === 0 && (
                      <div className="col-span-full text-sm text-gray-500">Chưa có ảnh.</div>
                    )}
                    {images.map((img) => (
                      <a
                        key={img.id}
                        href={img.imageUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="group relative aspect-[4/3] overflow-hidden rounded-lg border border-gray-100 bg-gray-50"
                        title="Mở ảnh"
                      >
                        <img
                          src={img.imageUrl}
                          alt={img.caption || 'property'}
                          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                          loading="lazy"
                        />
                        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/50 to-transparent p-2 text-xs text-white opacity-0 group-hover:opacity-100 transition-opacity">
                          {img.caption || 'Xem ảnh'}
                        </div>
                      </a>
                    ))}
                  </div>

                  {detail.description && (
                    <div className="mt-5">
                      <h3 className="text-sm font-semibold text-gray-900">Mô tả</h3>
                      <p className="mt-2 text-sm text-gray-700 whitespace-pre-line">{detail.description}</p>
                    </div>
                  )}

                  <div className="mt-5">
                    <div className="flex items-center justify-between gap-3">
                      <h3 className="text-sm font-semibold text-gray-900">Tiện nghi</h3>
                      <span className="text-xs text-gray-500">{amenities.length} items</span>
                    </div>

                    {amenities.length === 0 ? (
                      <p className="mt-2 text-sm text-gray-500">Chưa có tiện nghi.</p>
                    ) : (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {amenities.map((a) => (
                          <span
                            key={a.id || a.name}
                            className="inline-flex items-center rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100 px-3 py-1 text-xs font-medium"
                          >
                            {a.icon ? (
                              <span className="material-symbols-outlined !text-[14px] mr-1">{a.icon}</span>
                            ) : null}
                            {a.name || '-'}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-4 space-y-6">
              <div className="rounded-xl bg-white shadow border border-gray-100 p-5 md:p-6">
                <h2 className="text-base font-semibold text-gray-900">Host</h2>
                {!host && <p className="mt-2 text-sm text-gray-500">Không có thông tin host.</p>}
                {host && (
                  <div className="mt-3 space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500">Email</span>
                      <span className="font-medium text-gray-900">{host.email || '-'}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500">Họ tên</span>
                      <span className="font-medium text-gray-900">{host.fullName || '-'}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500">SĐT</span>
                      <span className="font-medium text-gray-900">{host.phone || '-'}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500">Verified</span>
                      <span className={`font-medium ${host.isVerified ? 'text-emerald-700' : 'text-amber-700'}`}>
                        {host.isVerified ? 'Đã xác thực' : 'Chưa xác thực'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500">Tài khoản</span>
                      <span className={`font-medium ${host.isActive ? 'text-gray-900' : 'text-red-700'}`}>
                        {host.isActive ? 'Active' : 'Bị khóa'}
                      </span>
                    </div>
                    {host.createdAt && (
                      <div className="flex items-center justify-between">
                        <span className="text-gray-500">Tạo lúc</span>
                        <span className="font-medium text-gray-900">{formatDateTime(host.createdAt)}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="rounded-xl bg-white shadow border border-gray-100 p-5 md:p-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-semibold text-gray-900">Hình ảnh chứng minh</h2>
                  <span className="text-xs text-gray-500">{documents.length} file</span>
                </div>

                {documents.length === 0 && (
                  <p className="mt-2 text-sm text-gray-500">Chưa có giấy tờ. Khuyến nghị yêu cầu tối thiểu CCCD + sổ đỏ/sổ hồng.</p>
                )}

                <div className="mt-3 space-y-3">
                  {documents.map((doc) => (
                    <a
                      key={doc.id}
                      href={doc.fileUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="block rounded-lg border border-gray-100 hover:border-indigo-200 hover:bg-indigo-50/40 transition-colors p-3"
                      title="Mở tài liệu"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="text-sm font-semibold text-gray-900 truncate">{DocTypeLabel(doc.documentType)}</div>
                          <div className="mt-1 text-xs text-gray-600 truncate">{doc.fileName || doc.fileUrl}</div>
                          {doc.uploadedAt && (
                            <div className="mt-1 text-[11px] text-gray-500">Upload: {formatDateTime(doc.uploadedAt)}</div>
                          )}
                        </div>
                        <div className="shrink-0 text-xs font-medium text-indigo-700">Xem</div>
                      </div>
                    </a>
                  ))}
                </div>
              </div>

              <div className="rounded-xl bg-white shadow border border-gray-100 p-5 md:p-6">
                <h2 className="text-base font-semibold text-gray-900">Quyết định</h2>

                {!imagesOk && (
                  <div className="mt-3 rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
                    Property chưa đạt yêu cầu tối thiểu <b>3 ảnh</b>. Bạn có thể reject để host bổ sung.
                  </div>
                )}

                {detail.reason && (
                  <div className="mt-3 rounded-md border border-gray-200 bg-gray-50 p-3 text-sm text-gray-700">
                    <div className="text-xs font-semibold text-gray-600 mb-1">Lý do gần nhất</div>
                    <div className="whitespace-pre-line">{detail.reason}</div>
                  </div>
                )}

                <div className="mt-4 grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={handleApprove}
                    className="inline-flex items-center justify-center rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700"
                  >
                    Approve
                  </button>
                  <button
                    type="button"
                    onClick={handleOpenReject}
                    className="inline-flex items-center justify-center rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700"
                  >
                    Reject
                  </button>
                </div>

                <button
                  type="button"
                  onClick={fetchDetail}
                  className="mt-3 w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Tải lại hồ sơ
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <RejectModal
        open={rejectModalOpen}
        onClose={handleCloseReject}
        onConfirm={handleConfirmReject}
        propertyId={detail?.id || null}
      />
    </div>
  );
};

export default AdminPropertyDetailPage;

