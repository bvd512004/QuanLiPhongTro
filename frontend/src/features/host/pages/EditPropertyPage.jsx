import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import hostService from '../services/host.service.js';

const EditPropertyPage = () => {
  const { propertyId } = useParams();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const documentInputRef = useRef(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [uploadingDocuments, setUploadingDocuments] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [categories, setCategories] = useState([]);
  const [amenities, setAmenities] = useState([]);
  const [propertyStatus, setPropertyStatus] = useState('');
  const [rejectReason, setRejectReason] = useState('');
  const [submitMode, setSubmitMode] = useState('save');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    propertyType: 'APARTMENT',
    address: '',
    city: '',
    state: '',
    country: 'Vietnam',
    zipCode: '',
    latitude: undefined,
    longitude: undefined,
    pricePerNight: 0,
    cleaningFee: 0,
    serviceFee: 0,
    maxGuests: 1,
    bedrooms: 1,
    beds: 1,
    bathrooms: 1,
    areaSqft: 0,
    minNights: 1,
    maxNights: 365,
    checkInTime: '14:00',
    checkOutTime: '11:00',
    houseRules: '',
    cancellationPolicy: 'FLEXIBLE',
    isInstantBook: false,
    categoryId: undefined,
    amenityIds: [],
    images: [],
    documents: [],
  });

  useEffect(() => {
    loadInitialData();
  }, [propertyId]);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      setErrorMessage('');

      const [propertyRes, categoryRes, amenityRes] = await Promise.all([
        hostService.getPropertyById(propertyId),
        hostService.getCategories(),
        hostService.getAmenities(),
      ]);

      if (!propertyRes?.success || !propertyRes?.data) {
        throw new Error(propertyRes?.message || 'Không thể tải dữ liệu bất động sản');
      }

      const dto = propertyRes.data;
      setPropertyStatus(dto.status || '');
      setRejectReason(dto.reason || '');

      setFormData((prev) => ({
        ...prev,
        title: dto.title || '',
        description: dto.description || '',
        propertyType: dto.propertyType || 'APARTMENT',
        address: dto.address || '',
        city: dto.city || '',
        state: dto.state || '',
        country: dto.country || 'Vietnam',
        zipCode: dto.zipCode || '',
        latitude: dto.latitude ?? undefined,
        longitude: dto.longitude ?? undefined,
        pricePerNight: dto.pricePerNight ?? 0,
        cleaningFee: dto.cleaningFee ?? 0,
        serviceFee: dto.serviceFee ?? 0,
        maxGuests: dto.maxGuests ?? 1,
        bedrooms: dto.bedrooms ?? 1,
        beds: dto.beds ?? 1,
        bathrooms: dto.bathrooms ?? 1,
        areaSqft: dto.areaSqft ?? 0,
        minNights: dto.minNights ?? 1,
        maxNights: dto.maxNights ?? 365,
        checkInTime: dto.checkInTime || '14:00',
        checkOutTime: dto.checkOutTime || '11:00',
        houseRules: dto.houseRules || '',
        cancellationPolicy: dto.cancellationPolicy || 'FLEXIBLE',
        isInstantBook: !!dto.isInstantBook,
        categoryId: dto.category?.id ?? undefined,
        amenityIds: Array.isArray(dto.amenities) ? dto.amenities.map((a) => a.id) : [],
        images: Array.isArray(dto.images)
          ? dto.images.map((img) => ({
              imageUrl: img.imageUrl,
              caption: img.caption || '',
              displayOrder: img.displayOrder ?? 0,
              isPrimary: !!img.isPrimary,
              mediaType: img.mediaType || 'IMAGE',
              fileSize: img.fileSize ?? 0,
              duration: img.duration ?? null,
            }))
          : [],
        documents: Array.isArray(dto.documents)
          ? dto.documents.map((doc) => ({
              fileName: doc.fileName,
              fileUrl: doc.fileUrl,
              fileExtension: doc.fileExtension,
              documentType: doc.documentType,
              fileSize: doc.fileSize,
            }))
          : [],
      }));

      if (categoryRes?.success) setCategories(categoryRes.data || []);
      if (amenityRes?.success) setAmenities(amenityRes.data || []);
    } catch (error) {
      setErrorMessage(error.message || 'Không thể tải dữ liệu để chỉnh sửa');
    } finally {
      setLoading(false);
    }
  };

  const isEditAllowed = useMemo(() => propertyStatus !== 'ACTIVE', [propertyStatus]);
  const canSubmitForReview = propertyStatus === 'INACTIVE' || propertyStatus === 'REJECTED';

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleNumberChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value === '' ? 0 : Number(value),
    }));
  };

  const handleAmenityToggle = (amenityId) => {
    setFormData((prev) => ({
      ...prev,
      amenityIds: prev.amenityIds.includes(amenityId)
        ? prev.amenityIds.filter((id) => id !== amenityId)
        : [...prev.amenityIds, amenityId],
    }));
  };

  const handleChooseFileClick = () => {
    fileInputRef.current?.click();
  };

  const handleChooseDocumentClick = () => {
    documentInputRef.current?.click();
  };

  const handleSetPrimaryImage = (index) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.map((img, idx) => ({
        ...img,
        isPrimary: idx === index,
      })),
    }));
  };

  const handleRemoveImage = (index) => {
    setFormData((prev) => {
      const imageToRemove = prev.images[index];
      if (imageToRemove?.imageUrl?.startsWith('blob:')) {
        URL.revokeObjectURL(imageToRemove.imageUrl);
      }

      const newImages = prev.images.filter((_, idx) => idx !== index);
      if (newImages.length > 0 && !newImages.some((img) => img.isPrimary)) {
        newImages[0].isPrimary = true;
      }

      return {
        ...prev,
        images: newImages.map((img, idx) => ({ ...img, displayOrder: idx })),
      };
    });
  };

  const handleImageSelect = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (formData.images.length + files.length > 10) {
      alert('Tối đa 10 ảnh/video');
      return;
    }

    const newImages = [];
    for (let i = 0; i < files.length; i += 1) {
      const file = files[i];
      const isVideo = file.type.startsWith('video/');
      const isImage = file.type.startsWith('image/');
      if (!isImage && !isVideo) continue;

      const previewUrl = URL.createObjectURL(file);
      newImages.push({
        tempId: `${Date.now()}-${i}-${file.name}`,
        imageUrl: previewUrl,
        caption: '',
        displayOrder: formData.images.length + i,
        isPrimary: formData.images.length === 0 && i === 0,
        mediaType: isVideo ? 'VIDEO' : 'IMAGE',
        fileSize: file.size,
        duration: null,
        file,
        uploading: true,
      });
    }

    if (newImages.length > 0) {
      setFormData((prev) => ({
        ...prev,
        images: [...prev.images, ...newImages],
      }));
      setUploadingImages(true);

      for (let i = 0; i < newImages.length; i += 1) {
        const imageData = newImages[i];
        try {
          const uploadResult = imageData.mediaType === 'VIDEO'
            ? await hostService.uploadVideo(imageData.file)
            : await hostService.uploadImage(imageData.file);

          const uploadedUrl = uploadResult?.data?.url;
          setFormData((prev) => ({
            ...prev,
            images: prev.images.map((img) => (
              img.tempId === imageData.tempId
                ? {
                    ...img,
                    imageUrl: uploadedUrl || img.imageUrl,
                    uploading: false,
                    file: undefined,
                  }
                : img
            )),
          }));
        } catch (error) {
          setFormData((prev) => ({
            ...prev,
            images: prev.images.map((img) => (
              img.tempId === imageData.tempId ? { ...img, uploading: false } : img
            )),
          }));
        }
      }

      setUploadingImages(false);
    }

    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDocumentTypeChange = (index, documentType) => {
    setFormData((prev) => ({
      ...prev,
      documents: prev.documents.map((doc, idx) => (idx === index ? { ...doc, documentType } : doc)),
    }));
  };

  const handleRemoveDocument = (index) => {
    setFormData((prev) => ({
      ...prev,
      documents: prev.documents.filter((_, idx) => idx !== index),
    }));
  };

  const handleDocumentSelect = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newDocuments = [];
    for (let i = 0; i < files.length; i += 1) {
      const file = files[i];
      const extension = file.name.includes('.') ? file.name.split('.').pop().toLowerCase() : '';
      newDocuments.push({
        tempId: `${Date.now()}-${i}-${file.name}`,
        fileName: file.name,
        fileUrl: '',
        fileExtension: extension,
        documentType: 'LAND_CERTIFICATE',
        fileSize: file.size,
        file,
        uploading: true,
      });
    }

    if (newDocuments.length > 0) {
      setFormData((prev) => ({
        ...prev,
        documents: [...prev.documents, ...newDocuments],
      }));
      setUploadingDocuments(true);

      for (let i = 0; i < newDocuments.length; i += 1) {
        const doc = newDocuments[i];
        try {
          const uploadResult = await hostService.uploadDocument(doc.file);
          const uploadedUrl = uploadResult?.data?.url;
          setFormData((prev) => ({
            ...prev,
            documents: prev.documents.map((item) => (
              item.tempId === doc.tempId
                ? {
                    ...item,
                    fileUrl: uploadedUrl || item.fileUrl,
                    fileName: uploadResult?.data?.originalFilename || item.fileName,
                    fileExtension: (uploadResult?.data?.format || item.fileExtension || '').toLowerCase(),
                    fileSize: uploadResult?.data?.size || item.fileSize,
                    uploading: false,
                    file: undefined,
                  }
                : item
            )),
          }));
        } catch (error) {
          setFormData((prev) => ({
            ...prev,
            documents: prev.documents.map((item) => (
              item.tempId === doc.tempId ? { ...item, uploading: false } : item
            )),
          }));
        }
      }

      setUploadingDocuments(false);
    }

    if (documentInputRef.current) documentInputRef.current.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isEditAllowed) {
      setErrorMessage('Tin đăng đang ACTIVE nên không thể chỉnh sửa. Hãy chuyển trạng thái trước.');
      return;
    }

    try {
      setSaving(true);
      setErrorMessage('');
      setSuccessMessage('');

      if (uploadingImages || uploadingDocuments) {
        setErrorMessage('Vui lòng chờ upload ảnh/giấy tờ hoàn tất trước khi lưu.');
        setSaving(false);
        return;
      }

      const payload = {
        ...formData,
        categoryId: formData.categoryId || undefined,
        images: formData.images
          .filter((img) => !!img.imageUrl && !img.uploading)
          .map((img, idx) => ({
            imageUrl: img.imageUrl,
            caption: img.caption || '',
            displayOrder: idx,
            isPrimary: !!img.isPrimary,
            mediaType: img.mediaType || 'IMAGE',
            fileSize: img.fileSize || 0,
            duration: img.duration || null,
          })),
        documents: formData.documents
          .filter((doc) => !!doc.fileUrl && !doc.uploading)
          .map((doc) => ({
            fileName: doc.fileName,
            fileUrl: doc.fileUrl,
            fileExtension: doc.fileExtension,
            documentType: doc.documentType || 'OTHER',
            fileSize: doc.fileSize || 0,
          })),
      };

      const response = await hostService.updateProperty(propertyId, payload);
      if (!response?.success) {
        throw new Error(response?.message || 'Cập nhật thất bại');
      }

      if (submitMode === 'submit' && canSubmitForReview) {
        const reviewResponse = await hostService.updatePropertyStatus(propertyId, 'INACTIVE');
        if (!reviewResponse?.success) {
          throw new Error(reviewResponse?.message || 'Lưu thành công nhưng gửi duyệt thất bại');
        }
        setPropertyStatus('INACTIVE');
        setRejectReason('');
      }

      setSuccessMessage(
        submitMode === 'submit' && canSubmitForReview
          ? 'Đã cập nhật tin đăng và chuyển về INACTIVE thành công.'
          : 'Cập nhật thông tin bất động sản thành công.'
      );
      setTimeout(() => {
        navigate('/host');
      }, 1000);
    } catch (error) {
      setErrorMessage(error.message || 'Có lỗi khi cập nhật bất động sản');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-sky-100">
        <span className="material-symbols-outlined animate-spin text-4xl text-primary">progress_activity</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-sky-100 py-8 px-4">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl border border-blue-100 shadow-[0_10px_28px_rgba(15,23,42,0.06)] p-6 md:p-8 space-y-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">Chỉnh sửa bất động sản</h1>
            <p className="text-sm text-slate-600 mt-1">Chỉ cho phép chỉnh sửa khi trạng thái không phải ACTIVE.</p>
          </div>
          <Link to="/host" className="px-4 py-2 border border-blue-200 rounded-lg text-sm font-medium hover:bg-blue-50">
            Quay lại
          </Link>
        </div>

        {propertyStatus && (
          <div className={`rounded-lg px-4 py-3 text-sm ${isEditAllowed ? 'bg-blue-50 text-blue-800 border border-blue-200' : 'bg-amber-50 text-amber-800 border border-amber-200'}`}>
            Trạng thái hiện tại: <strong>{propertyStatus}</strong>
            {!isEditAllowed && ' - Vui lòng chuyển trạng thái khỏi ACTIVE để chỉnh sửa.'}
          </div>
        )}

        {propertyStatus === 'REJECTED' && rejectReason && (
          <div className="rounded-lg bg-red-50 border border-red-200 text-red-800 px-4 py-3 text-sm">
            <span className="font-semibold">Lý do từ chối từ admin:</span> {rejectReason}
          </div>
        )}

        {errorMessage && <div className="rounded-lg bg-red-50 border border-red-200 text-red-800 px-4 py-3 text-sm">{errorMessage}</div>}
        {successMessage && <div className="rounded-lg bg-green-50 border border-green-200 text-green-800 px-4 py-3 text-sm">{successMessage}</div>}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">Tiêu đề</label>
              <input id="title" name="title" value={formData.title} onChange={handleInputChange} className="w-full rounded-lg border border-blue-200 px-3 py-2" required />
            </div>

            <div className="md:col-span-2">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
              <textarea id="description" name="description" value={formData.description} onChange={handleInputChange} rows={4} className="w-full rounded-lg border border-blue-200 px-3 py-2" required />
            </div>

            <div>
              <label htmlFor="propertyType" className="block text-sm font-medium text-gray-700 mb-1">Loại bất động sản</label>
              <select id="propertyType" name="propertyType" value={formData.propertyType} onChange={handleInputChange} className="w-full rounded-lg border border-blue-200 px-3 py-2">
                <option value="APARTMENT">Căn hộ</option>
                <option value="HOUSE">Nhà riêng</option>
                <option value="VILLA">Biệt thự</option>
                <option value="STUDIO">Studio</option>
                <option value="CONDO">Chung cư</option>
                <option value="ROOM">Phòng trọ</option>
              </select>
            </div>

            <div>
              <label htmlFor="categoryId" className="block text-sm font-medium text-gray-700 mb-1">Danh mục</label>
              <select
                id="categoryId"
                name="categoryId"
                value={formData.categoryId || ''}
                onChange={(e) => setFormData((prev) => ({ ...prev, categoryId: e.target.value ? Number(e.target.value) : undefined }))}
                className="w-full rounded-lg border border-blue-200 px-3 py-2"
              >
                <option value="">Chọn danh mục</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">Địa chỉ</label>
              <input id="address" name="address" value={formData.address} onChange={handleInputChange} className="w-full rounded-lg border border-blue-200 px-3 py-2" required />
            </div>

            <div>
              <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">Thành phố</label>
              <input id="city" name="city" value={formData.city} onChange={handleInputChange} className="w-full rounded-lg border border-blue-200 px-3 py-2" required />
            </div>

            <div>
              <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-1">Quận/Huyện</label>
              <input id="state" name="state" value={formData.state} onChange={handleInputChange} className="w-full rounded-lg border border-blue-200 px-3 py-2" />
            </div>

            <div>
              <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1">Quốc gia</label>
              <input id="country" name="country" value={formData.country} onChange={handleInputChange} className="w-full rounded-lg border border-blue-200 px-3 py-2" required />
            </div>

            <div>
              <label htmlFor="zipCode" className="block text-sm font-medium text-gray-700 mb-1">Mã bưu điện</label>
              <input id="zipCode" name="zipCode" value={formData.zipCode} onChange={handleInputChange} className="w-full rounded-lg border border-blue-200 px-3 py-2" />
            </div>

            <div>
              <label htmlFor="pricePerNight" className="block text-sm font-medium text-gray-700 mb-1">Giá / đêm</label>
              <input id="pricePerNight" type="number" min="0" name="pricePerNight" value={formData.pricePerNight} onChange={handleNumberChange} className="w-full rounded-lg border border-blue-200 px-3 py-2" required />
            </div>

            <div>
              <label htmlFor="maxGuests" className="block text-sm font-medium text-gray-700 mb-1">Số khách tối đa</label>
              <input id="maxGuests" type="number" min="1" name="maxGuests" value={formData.maxGuests} onChange={handleNumberChange} className="w-full rounded-lg border border-blue-200 px-3 py-2" required />
            </div>

            <div>
              <label htmlFor="bedrooms" className="block text-sm font-medium text-gray-700 mb-1">Phòng ngủ</label>
              <input id="bedrooms" type="number" min="0" name="bedrooms" value={formData.bedrooms} onChange={handleNumberChange} className="w-full rounded-lg border border-blue-200 px-3 py-2" />
            </div>

            <div>
              <label htmlFor="beds" className="block text-sm font-medium text-gray-700 mb-1">Giường</label>
              <input id="beds" type="number" min="0" name="beds" value={formData.beds} onChange={handleNumberChange} className="w-full rounded-lg border border-blue-200 px-3 py-2" />
            </div>

            <div>
              <label htmlFor="bathrooms" className="block text-sm font-medium text-gray-700 mb-1">Phòng tắm</label>
              <input id="bathrooms" type="number" min="0" name="bathrooms" value={formData.bathrooms} onChange={handleNumberChange} className="w-full rounded-lg border border-blue-200 px-3 py-2" />
            </div>

            <div>
              <label htmlFor="areaSqft" className="block text-sm font-medium text-gray-700 mb-1">Diện tích (m2)</label>
              <input id="areaSqft" type="number" min="0" name="areaSqft" value={formData.areaSqft} onChange={handleNumberChange} className="w-full rounded-lg border border-blue-200 px-3 py-2" />
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-gray-700">Ảnh / Video</p>
              <button type="button" onClick={handleChooseFileClick} className="px-3 py-1.5 text-sm rounded-lg border border-blue-200 hover:bg-blue-50">
                Tải thêm ảnh/video
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,video/*"
                multiple
                className="hidden"
                onChange={handleImageSelect}
              />
            </div>

            {uploadingImages && <p className="text-xs text-blue-600">Đang upload ảnh/video...</p>}

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {formData.images.map((img, idx) => (
                <div key={img.tempId || `${img.imageUrl}-${idx}`} className="rounded-lg border border-blue-100 p-2 space-y-2">
                  <div className="aspect-square rounded bg-slate-100 overflow-hidden flex items-center justify-center">
                    {img.mediaType === 'VIDEO' ? (
                      <video src={img.imageUrl} className="w-full h-full object-cover" controls />
                    ) : (
                      <img src={img.imageUrl} alt={`media-${idx}`} className="w-full h-full object-cover" />
                    )}
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => handleSetPrimaryImage(idx)}
                      className={`text-xs px-2 py-1 rounded ${img.isPrimary ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'}`}
                    >
                      {img.isPrimary ? 'Primary' : 'Set Primary'}
                    </button>
                    <button type="button" onClick={() => handleRemoveImage(idx)} className="text-xs px-2 py-1 rounded bg-red-50 text-red-600">
                      Xóa
                    </button>
                  </div>
                  {img.uploading && <p className="text-[11px] text-amber-600">Đang upload...</p>}
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-gray-700">Giấy tờ</p>
              <button type="button" onClick={handleChooseDocumentClick} className="px-3 py-1.5 text-sm rounded-lg border border-blue-200 hover:bg-blue-50">
                Tải thêm giấy tờ
              </button>
              <input
                ref={documentInputRef}
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                multiple
                className="hidden"
                onChange={handleDocumentSelect}
              />
            </div>

            {uploadingDocuments && <p className="text-xs text-blue-600">Đang upload giấy tờ...</p>}

            <div className="space-y-2">
              {formData.documents.map((doc, idx) => (
                <div key={doc.tempId || `${doc.fileUrl}-${idx}`} className="rounded-lg border border-blue-100 p-3">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium text-slate-900">{doc.fileName || 'Document'}</p>
                      <p className="text-xs text-slate-500">{doc.fileExtension?.toUpperCase() || '--'} {doc.uploading ? ' - Đang upload...' : ''}</p>
                    </div>
                    <button type="button" onClick={() => handleRemoveDocument(idx)} className="text-xs px-2 py-1 rounded bg-red-50 text-red-600">
                      Xóa
                    </button>
                  </div>
                  <div className="mt-2">
                    <label htmlFor={`doc-type-${idx}`} className="text-xs text-slate-600 mr-2">Loại giấy tờ</label>
                    <select
                      id={`doc-type-${idx}`}
                      value={doc.documentType || 'OTHER'}
                      onChange={(e) => handleDocumentTypeChange(idx, e.target.value)}
                      className="text-sm rounded border border-blue-200 px-2 py-1"
                    >
                      <option value="LAND_CERTIFICATE">Sổ đỏ/Sổ hồng</option>
                      <option value="AUTHORIZATION_PAPER">Giấy ủy quyền</option>
                      <option value="CONTRACT">Hợp đồng</option>
                      <option value="OTHER">Khác</option>
                    </select>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">Tiện ích</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-56 overflow-y-auto border border-blue-100 rounded-lg p-3">
              {amenities.map((amenity) => (
                <label key={amenity.id} className="flex items-center gap-2 text-sm text-slate-700">
                  <input
                    type="checkbox"
                    checked={formData.amenityIds.includes(amenity.id)}
                    onChange={() => handleAmenityToggle(amenity.id)}
                  />
                  <span>{amenity.name}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              id="isInstantBook"
              type="checkbox"
              name="isInstantBook"
              checked={formData.isInstantBook}
              onChange={handleInputChange}
            />
            <label htmlFor="isInstantBook" className="text-sm text-slate-700">Bật chế độ đặt ngay</label>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => navigate('/host')}
              className="px-4 py-2 border border-blue-200 rounded-lg font-medium hover:bg-blue-50"
            >
              Hủy
            </button>
            <button
              type="submit"
              onClick={() => setSubmitMode('save')}
              disabled={saving || !isEditAllowed}
              className="px-5 py-2 bg-primary text-white rounded-lg font-semibold hover:bg-primary/90 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
            </button>
            {canSubmitForReview && (
              <button
                type="submit"
                onClick={() => setSubmitMode('submit')}
                disabled={saving || !isEditAllowed}
                className="px-5 py-2 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {saving && submitMode === 'submit' ? 'Đang gửi duyệt...' : 'Lưu & Gửi duyệt'}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditPropertyPage;

