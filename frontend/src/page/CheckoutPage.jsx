import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { api } from '@/shared/services/api.js';

// ─── Payment Config (frontend fallback) ─────────────────────────────────────
// Backend hiện chưa có endpoint trả cấu hình ngân hàng,
// nên mình giữ tạm như hằng để tạo QR.
const PAYMENT_INFO = {
  bankName: 'TPBank',
  bankBin: '970423',
  bankAccountNumber: '00000117732',
  bankAccountHolder: 'Bach Van Duc',
  bankBranch: 'Chi nhánh Hà Nội',
  paymentNotes: null,
};

// ─── Toast ───────────────────────────────────────────────────────────────────
function useToast() {
  const [toasts, setToasts] = useState([]);

  const addToast = (msg, type = 'success') => {
    const id = Date.now();
    setToasts(t => [...t, { id, msg, type }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3000);
  };

  const ToastContainer = () => (
    <div style={{
      position: 'fixed', top: 20, left: '50%', transform: 'translateX(-50%)',
      zIndex: 9999, display: 'flex', flexDirection: 'column', gap: 8, minWidth: 280,
    }}>
      {toasts.map(t => (
        <div key={t.id} style={{
          background: t.type === 'success' ? '#059669' : '#dc2626',
          color: '#fff',
          padding: '10px 18px',
          borderRadius: 10,
          fontFamily: "'Nunito', sans-serif",
          fontSize: 14,
          fontWeight: 600,
          boxShadow: '0 4px 20px rgba(0,0,0,0.18)',
          animation: 'fadeSlideIn .25s ease',
        }}>
          {t.msg}
        </div>
      ))}
    </div>
  );

  return { toast: addToast, ToastContainer };
}

// ─── Utility ──────────────────────────────────────────────────────────────────
const vnd = (n) => new Intl.NumberFormat('vi-VN').format(n) + 'đ';

const buildVietQrUrl = ({ bankBin, accountNumber, amountVnd, addInfo, accountName, template = 'compact' }) => {
  const info = encodeURIComponent(addInfo);
  const name = encodeURIComponent(accountName);
  return `https://img.vietqr.io/image/${bankBin}-${accountNumber}-${template}.jpg?amount=${Math.max(0, Math.round(amountVnd))}&addInfo=${info}&accountName=${name}`;
};

// ─── Styles ───────────────────────────────────────────────────────────────────
const S = {
  page: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #f0fdf4 0%, #f8fafc 60%, #fef3f2 100%)',
    fontFamily: "'Nunito', 'Segoe UI', sans-serif",
    color: '#1a1a2e',
  },
  container: {
    maxWidth: 1100,
    margin: '0 auto',
    padding: '32px 20px 60px',
  },
  backBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontFamily: 'inherit',
    fontSize: 16,
    fontWeight: 700,
    color: '#374151',
    marginBottom: 32,
    padding: '8px 0',
    letterSpacing: '-.2px',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: '1fr 380px',
    gap: 40,
    alignItems: 'start',
  },
  card: {
    background: '#fff',
    border: '1.5px solid #e5e7eb',
    borderRadius: 20,
    padding: 28,
    marginBottom: 20,
    boxShadow: '0 2px 16px rgba(0,0,0,.04)',
  },
  stickyCard: {
    background: '#fff',
    border: '1.5px solid #e5e7eb',
    borderRadius: 20,
    padding: 28,
    position: 'sticky',
    top: 24,
    boxShadow: '0 4px 24px rgba(0,0,0,.07)',
  },
  h2: {
    fontSize: 22,
    fontWeight: 800,
    margin: '0 0 20px',
    color: '#111827',
    letterSpacing: '-.4px',
  },
  h3: {
    fontSize: 17,
    fontWeight: 700,
    margin: '0 0 8px',
    color: '#111827',
  },
  radioLabel: (active) => ({
    display: 'flex',
    alignItems: 'center',
    gap: 14,
    padding: '14px 18px',
    border: `2px solid ${active ? '#059669' : '#d1d5db'}`,
    borderRadius: 14,
    cursor: 'pointer',
    background: active ? '#f0fdf4' : '#fff',
    transition: 'all .2s',
  }),
  step: (done) => ({
    width: 34,
    height: 34,
    borderRadius: '50%',
    background: done ? '#059669' : '#e5e7eb',
    color: done ? '#fff' : '#6b7280',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 800,
    fontSize: 16,
    flexShrink: 0,
  }),
  errorBox: {
    background: '#fef2f2',
    border: '1px solid #fca5a5',
    color: '#b91c1c',
    padding: '12px 16px',
    borderRadius: 12,
    marginBottom: 20,
    fontSize: 14,
    fontWeight: 600,
  },
  warnBox: {
    background: '#fffbeb',
    border: '1px solid #fcd34d',
    color: '#92400e',
    borderRadius: 10,
    padding: '10px 14px',
    fontSize: 13,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  infoRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '6px 0',
    fontSize: 14,
  },
  infoLabel: { color: '#6b7280' },
  infoVal: { fontWeight: 700, color: '#111827' },
  copyBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: '#059669',
    display: 'flex',
    alignItems: 'center',
    padding: 2,
  },
  contentBox: {
    background: '#f9fafb',
    borderRadius: 12,
    padding: '12px 16px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  input: {
    width: '100%',
    padding: '10px 14px',
    border: '1.5px solid #d1d5db',
    borderRadius: 10,
    fontFamily: 'inherit',
    fontSize: 14,
    outline: 'none',
    boxSizing: 'border-box',
    background: '#fff',
    color: '#111827',
  },
  uploadBtn: (disabled) => ({
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    padding: '10px 20px',
    borderRadius: 10,
    fontWeight: 700,
    fontSize: 14,
    fontFamily: 'inherit',
    cursor: disabled ? 'not-allowed' : 'pointer',
    background: disabled ? '#e5e7eb' : '#059669',
    color: disabled ? '#9ca3af' : '#fff',
    border: 'none',
    transition: 'background .2s',
  }),
  confirmBtn: (disabled) => ({
    width: '100%',
    padding: '16px 24px',
    borderRadius: 14,
    background: disabled ? '#d1d5db' : 'linear-gradient(90deg, #e11d48 0%, #f43f5e 100%)',
    color: disabled ? '#9ca3af' : '#fff',
    fontFamily: 'inherit',
    fontWeight: 800,
    fontSize: 17,
    letterSpacing: '-.2px',
    border: 'none',
    cursor: disabled ? 'not-allowed' : 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    boxShadow: disabled ? 'none' : '0 4px 20px rgba(225,29,72,.3)',
    transition: 'all .2s',
  }),
  divider: { border: 'none', borderTop: '1.5px solid #f3f4f6', margin: '20px 0' },
  spinner: {
    display: 'inline-block',
    width: 20, height: 20,
    border: '3px solid #e5e7eb',
    borderTop: '3px solid #059669',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
};

// ─── Spinner ─────────────────────────────────────────────────────────────────
const Spinner = ({ size = 20, color = '#059669' }) => (
  <span style={{
    display: 'inline-block', width: size, height: size,
    border: `3px solid #e5e7eb`, borderTop: `3px solid ${color}`,
    borderRadius: '50%', animation: 'spin 1s linear infinite', flexShrink: 0,
  }} />
);

// ─── Main Component ───────────────────────────────────────────────────────────
export default function CheckoutPage() {
  const location = useLocation();
  const bookingData = location?.state || null;

  const [isProcessing, setIsProcessing] = useState(false);
  const [createdBooking, setCreatedBooking] = useState(null);
  const [error, setError] = useState('');
  const [propertyDetails] = useState(bookingData?.property);
  const [isLoadingProperty] = useState(false);
  const [isCreatingBookingForQr, setIsCreatingBookingForQr] = useState(false);
  const paymentInfo = PAYMENT_INFO;
  const paymentInfoLoading = false;
  const [proofUploading, setProofUploading] = useState(false);
  const [proofSubmitting, setProofSubmitting] = useState(false);
  const [proofPreview, setProofPreview] = useState('');
  const [transferReference, setTransferReference] = useState('');
  const [proofError, setProofError] = useState('');
  const [success, setSuccess] = useState(false);

  const transferReferenceRef = useRef('');
  const bookingIdRef = useRef(null);
  const bookingFinalizedRef = useRef(false);
  const confirmButtonRef = useRef(null);

  const createdProofUrl = createdBooking?.transferProofImageUrl || '';
  const proofUrl = createdProofUrl || '';

  const { toast, ToastContainer } = useToast();

  useEffect(() => {
    transferReferenceRef.current = transferReference;
  }, [transferReference]);

  // Tạo booking thật từ backend để lấy `bookingCode` + `id`
  useEffect(() => {
    if (!bookingData) return;
    if (createdBooking || bookingIdRef.current) return;

    let cancelled = false;
    setIsCreatingBookingForQr(true);
    setError('');

    const create = async () => {
      try {
        const createReq = {
          propertyId: bookingData.propertyId,
          checkInDate: bookingData.checkInDate,
          checkOutDate: bookingData.checkOutDate,
          numGuests: bookingData.numGuests,
          numAdults: bookingData.numAdults,
          numChildren: bookingData.numChildren,
          numInfants: bookingData.numInfants,
          specialRequests: bookingData.specialRequests || '',
          guestMessage: bookingData.guestMessage || '',
        };

        const res = await api.createBooking(createReq);
        if (cancelled) return;
        if (!res.success || !res.data) {
          throw new Error('Không thể tạo booking để hiển thị QR.');
        }

        setCreatedBooking(res.data);
        bookingIdRef.current = res.data.id;
      } catch (err) {
        if (!cancelled) setError(err?.message || 'Không thể tạo booking để hiển thị QR.');
      } finally {
        if (!cancelled) setIsCreatingBookingForQr(false);
      }
    };

    create();
    return () => {
      cancelled = true;
    };
  }, [bookingData, createdBooking]);

  const handleUploadAndSubmitProof = async (file) => {
    if (!createdBooking) return;
    setProofError('');
    try {
      setProofUploading(true);
      const uploadRes = await api.uploadImage(file);
      let uploadedUrl = uploadRes?.data?.url;
      if (!uploadedUrl) throw new Error('Upload biên lai thất bại');

      setProofPreview(uploadedUrl);
      setProofUploading(false);
      setProofSubmitting(true);

      const submitRes = await api.submitTransferProof(createdBooking.id, {
        transferProofImageUrl: uploadedUrl,
        transferReference: transferReferenceRef.current || '',
      });
      if (!submitRes.success) throw new Error(submitRes.message || 'Gửi biên lai thất bại');

      setCreatedBooking(submitRes.data);
      toast('Đã gửi biên lai thành công!', 'success');
      confirmButtonRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } catch (e) {
      setProofError(e?.message || 'Không thể upload/gửi biên lai');
    } finally {
      setProofUploading(false);
      setProofSubmitting(false);
    }
  };

  const handleCopyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text).then(
      () => toast(`${label} đã được sao chép!`, 'success'),
      () => toast('Sao chép thất bại.', 'error'),
    );
  };

  const handleConfirm = async () => {
    if (!bookingData) return;
    setIsProcessing(true);
    setError('');
    try {
      if (!createdProofUrl) throw new Error('Vui lòng upload biên lai trước khi xác nhận.');
      bookingFinalizedRef.current = true;
      setSuccess(true);
    } catch (err) {
      setError(err.message || 'Có lỗi xảy ra. Vui lòng thử lại.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (!bookingData) {
    return (
      <div style={S.page}>
        <div style={{ ...S.container, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
          <div style={{ ...S.card, maxWidth: 560 }}>
            <h2 style={S.h2}>Thiếu dữ liệu booking</h2>
            <p style={{ color: '#6b7280', margin: 0 }}>
              Vui lòng quay lại trang trước để chọn ngày và thanh toán.
            </p>
            <button
              style={S.backBtn}
              onClick={() => window.history.back()}
            >
              Quay lại
            </button>
          </div>
        </div>
      </div>
    );
  }

  const { totalPrice, subtotal, cleaningFee, serviceFee, numNights } = bookingData;
  const property = propertyDetails;
  const propertyTitle = property?.title ?? property?.name ?? 'Chỗ nghỉ';
  const propertyTypeLabel = property?.propertyType?.name ?? '';
  const propertyImageUrl = property?.primaryImageUrl ?? '';

  // ── Success Screen ──
  if (success) {
    return (
      <div style={{ ...S.page, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } } @keyframes fadeSlideIn { from { opacity:0; transform:translateY(-10px); } to { opacity:1; transform:none; } } @keyframes bounceIn { 0%{transform:scale(.5);opacity:0} 70%{transform:scale(1.1)} 100%{transform:scale(1);opacity:1} }`}</style>
        <div style={{ textAlign: 'center', padding: 40 }}>
          <div style={{ fontSize: 80, marginBottom: 16, animation: 'bounceIn .6s ease' }}>🎉</div>
          <h2 style={{ fontSize: 28, fontWeight: 800, color: '#059669', marginBottom: 8 }}>Đã gửi biên lai!</h2>
          <p style={{ color: '#6b7280', fontSize: 16, fontFamily: "'Nunito', sans-serif" }}>Vui lòng chờ chủ nhà xác nhận booking của bạn.</p>
        </div>
      </div>
    );
  }

  return (
    <div style={S.page}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap');
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeSlideIn { from { opacity:0; transform:translateY(-10px); } to { opacity:1; transform:none; } }
        * { box-sizing: border-box; }
        @media (max-width: 768px) {
          .checkout-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
      <ToastContainer />

      <div style={S.container}>
        <div style={{ maxWidth: 1060, margin: '0 auto' }}>

          {/* Back Button */}
          <button style={S.backBtn} onClick={() => window.history.back()}>
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
            Xác nhận và thanh toán
          </button>

          <div className="checkout-grid" style={S.grid}>

            {/* ── Left Column ── */}
            <div>
              {error && <div style={S.errorBox}>{error}</div>}

              {/* Payment Method Card */}
              <div style={S.card}>
                <h2 style={S.h2}>Chọn phương thức thanh toán</h2>
                <label style={S.radioLabel(true)}>
                  <input type="radio" name="pm" value="QR_CODE" defaultChecked
                    style={{ width: 18, height: 18, accentColor: '#059669' }} />
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="1.8"><rect x="3" y="3" width="8" height="8" rx="1"/><rect x="13" y="3" width="8" height="8" rx="1"/><rect x="3" y="13" width="8" height="8" rx="1"/><path d="M13 13h2v2h-2zm0 4h2v4m2-4h4v2h-4zm0 2h2v2"/></svg>
                  <div>
                    <p style={{ fontWeight: 800, color: '#111827', margin: 0, fontSize: 15 }}>Chuyển khoản qua QR</p>
                    <p style={{ fontSize: 13, color: '#6b7280', margin: 0, marginTop: 2 }}>Quét mã VietQR để chuyển khoản nhanh chóng.</p>
                  </div>
                </label>
              </div>

              {/* Step 1 */}
              <div style={S.card}>
                <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                  <div style={S.step(false)}>1</div>
                  <div style={{ flex: 1 }}>
                    <h3 style={S.h3}>Quét mã QR để chuyển khoản</h3>
                    <p style={{ color: '#6b7280', fontSize: 14, margin: '0 0 14px' }}>Sử dụng app ngân hàng của bạn để quét mã. Số tiền và nội dung đã được điền sẵn.</p>
                    <div style={S.warnBox}>
                      <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" style={{ flexShrink: 0 }}><path d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/></svg>
                      <span>Vui lòng chuyển đúng số tiền và nội dung để giao dịch được xác nhận tự động.</span>
                    </div>

                    {paymentInfoLoading || isCreatingBookingForQr ? (
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 200, background: '#f9fafb', borderRadius: 14 }}>
                        <Spinner size={36} />
                      </div>
                    ) : paymentInfo?.bankBin && paymentInfo.bankAccountNumber && createdBooking?.bookingCode ? (
                      <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', marginTop: 8 }}>
                        <img
                          src={buildVietQrUrl({
                            bankBin: paymentInfo.bankBin,
                            accountNumber: paymentInfo.bankAccountNumber,
                            amountVnd: bookingData.totalPrice,
                            addInfo: `STAYEASE BOOKING ${createdBooking.bookingCode}`,
                            accountName: paymentInfo.bankAccountHolder,
                          })}
                          alt="VietQR"
                          style={{ width: 180, height: 180, borderRadius: 12, border: '1.5px solid #e5e7eb', objectFit: 'cover' }}
                        />
                        <div style={{ flex: 1, minWidth: 200 }}>
                          {[
                            ['Ngân hàng', paymentInfo.bankName],
                            ['Chủ tài khoản', paymentInfo.bankAccountHolder],
                          ].map(([label, val]) => (
                            <div key={label} style={S.infoRow}>
                              <span style={S.infoLabel}>{label}</span>
                              <span style={S.infoVal}>{val}</span>
                            </div>
                          ))}
                          <div style={S.infoRow}>
                            <span style={S.infoLabel}>Số tài khoản</span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                              <span style={S.infoVal}>{paymentInfo.bankAccountNumber}</span>
                              <button style={S.copyBtn} onClick={() => handleCopyToClipboard(paymentInfo.bankAccountNumber, 'Số tài khoản')}>
                                <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>
                              </button>
                            </div>
                          </div>
                          <div style={{ ...S.contentBox, marginTop: 10 }}>
                            <div>
                              <p style={{ ...S.infoLabel, fontSize: 13, margin: '0 0 2px' }}>Nội dung</p>
                              <p style={{ ...S.infoVal, fontSize: 14, margin: 0 }}>STAYEASE BOOKING {createdBooking.bookingCode}</p>
                            </div>
                            <button style={S.copyBtn} onClick={() => handleCopyToClipboard(`STAYEASE BOOKING ${createdBooking.bookingCode}`, 'Nội dung')}>
                              <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div style={{ textAlign: 'center', padding: '32px 0', color: '#6b7280', fontSize: 14 }}>
                        Không thể tải thông tin thanh toán. Vui lòng thử lại.
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Step 2 */}
              <div style={S.card}>
                <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                  <div style={S.step(!!createdProofUrl)}>
                    {createdProofUrl
                      ? <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7"/></svg>
                      : '2'}
                  </div>
                  <div style={{ flex: 1 }}>
                    <h3 style={S.h3}>Tải lên biên lai chuyển khoản</h3>
                    <p style={{ color: '#6b7280', fontSize: 14, margin: '0 0 16px' }}>Sau khi chuyển khoản, vui lòng chụp ảnh màn hình và tải lên đây để chủ nhà xác nhận.</p>

                    {!createdBooking?.id ? (
                      <p style={{ color: '#9ca3af', fontSize: 14 }}>Vui lòng hoàn thành Bước 1 để tiếp tục.</p>
                    ) : (
                      <>
                        {proofError && <div style={{ color: '#dc2626', fontSize: 13, marginBottom: 12, fontWeight: 600 }}>{proofError}</div>}

                        <div style={{ marginBottom: 16 }}>
                          <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#374151', marginBottom: 6 }}>
                            Mã tham chiếu (tuỳ chọn)
                          </label>
                          <input
                            value={transferReference}
                            onChange={e => setTransferReference(e.target.value)}
                            placeholder="VD: FT123456789"
                            style={S.input}
                          />
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
                          <input
                            id="proofFile"
                            type="file"
                            accept="image/*"
                            disabled={proofUploading || proofSubmitting || !!createdProofUrl}
                            onChange={e => { const f = e.target.files?.[0]; if (f) handleUploadAndSubmitProof(f); }}
                            style={{ display: 'none' }}
                          />
                          <label htmlFor="proofFile" style={S.uploadBtn(proofUploading || proofSubmitting || !!createdProofUrl)}>
                            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                            {proofUploading ? 'Đang tải lên...' : proofSubmitting ? 'Đang gửi...' : createdProofUrl ? 'Đã tải lên ✓' : 'Chọn ảnh biên lai'}
                          </label>
                          {(proofUploading || proofSubmitting) && <Spinner size={20} />}
                        </div>

                        {(proofUrl || proofPreview) && (
                          <div style={{ marginTop: 20 }}>
                            <p style={{ fontSize: 13, fontWeight: 700, color: '#374151', marginBottom: 8 }}>Xem trước biên lai:</p>
                            <img
                              src={proofUrl || proofPreview}
                              alt="Biên lai"
                              style={{ maxWidth: 280, borderRadius: 12, border: '1.5px solid #e5e7eb', display: 'block' }}
                            />
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>

              <hr style={S.divider} />

              {/* Confirm Button */}
              <div ref={confirmButtonRef}>
                <button
                  onClick={handleConfirm}
                  disabled={isProcessing || !createdProofUrl}
                  style={S.confirmBtn(isProcessing || !createdProofUrl)}
                >
                  {isProcessing ? <><Spinner size={20} color="#fff" /> Đang xử lý...</> : 'Tôi đã chuyển khoản & gửi biên lai'}
                </button>
                {!createdProofUrl && (
                  <p style={{ textAlign: 'center', fontSize: 13, color: '#9ca3af', marginTop: 10 }}>
                    Vui lòng tải lên biên lai để kích hoạt nút này.
                  </p>
                )}
              </div>
            </div>

            {/* ── Right Column (Summary) ── */}
            <div>
              <div style={S.stickyCard}>
                {isLoadingProperty ? (
                  <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}><Spinner size={32} /></div>
                ) : property ? (
                  <>
                    {/* Property Info */}
                    <div style={{ display: 'flex', gap: 14, marginBottom: 20 }}>
                      <div style={{ width: 100, height: 76, borderRadius: 12, overflow: 'hidden', background: '#f3f4f6', flexShrink: 0 }}>
                        {propertyImageUrl
                          ? <img src={propertyImageUrl} alt={propertyTitle} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af', fontSize: 28 }}>🏠</div>
                        }
                      </div>
                      <div>
                        {propertyTypeLabel && <p style={{ fontSize: 12, color: '#6b7280', margin: '0 0 4px' }}>{propertyTypeLabel}</p>}
                        <p style={{ fontWeight: 800, color: '#111827', margin: 0, fontSize: 15, lineHeight: 1.4 }}>{propertyTitle}</p>
                      </div>
                    </div>

                    <hr style={S.divider} />

                    <h3 style={{ ...S.h3, marginBottom: 16 }}>Chi tiết giá</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      {[
                        [`${vnd(property?.pricePerNight ?? 0)} × ${numNights} đêm`, vnd(subtotal)],
                        ['Phí vệ sinh', vnd(cleaningFee)],
                        ['Phí dịch vụ', vnd(serviceFee)],
                      ].map(([label, val]) => (
                        <div key={label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, color: '#374151' }}>
                          <span>{label}</span>
                          <span style={{ fontWeight: 600 }}>{val}</span>
                        </div>
                      ))}
                    </div>

                    <hr style={S.divider} />

                    <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: 18, color: '#111827' }}>
                      <span>Tổng cộng (VND)</span>
                      <span style={{ color: '#059669' }}>{vnd(totalPrice)}</span>
                    </div>

                    {/* Date Summary */}
                    <div style={{ marginTop: 20, background: '#f0fdf4', borderRadius: 12, padding: '12px 16px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                        <div>
                          <p style={{ color: '#6b7280', margin: '0 0 2px' }}>Nhận phòng</p>
                          <p style={{ fontWeight: 700, color: '#111827', margin: 0 }}>{bookingData.checkInDate}</p>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <p style={{ color: '#6b7280', margin: '0 0 2px' }}>Trả phòng</p>
                          <p style={{ fontWeight: 700, color: '#111827', margin: 0 }}>{bookingData.checkOutDate}</p>
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <p style={{ color: '#6b7280', textAlign: 'center', padding: 32 }}>Không thể tải thông tin chỗ nghỉ.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}