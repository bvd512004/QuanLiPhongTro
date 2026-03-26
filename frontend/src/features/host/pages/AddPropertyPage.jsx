import React, {useState, useEffect, useRef} from 'react';
import {useNavigate} from 'react-router-dom';
import {
    Building2, ArrowLeft, ArrowRight, Check,
    MapPin, Info, Camera, DollarSign, Sparkles, FileText
} from 'lucide-react';
import hostService from "../services/host.service.js";

const AddPropertyPage = () => {
    const navigate = useNavigate();
    const fileInputRef = useRef(null);
    const documentInputRef = useRef(null);
    const [loading, setLoading] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);
    const [categories, setCategories] = useState([]);
    const [amenities, setAmenities] = useState([]);
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [uploadingImages, setUploadingImages] = useState(false);
    const [uploadingDocuments, setUploadingDocuments] = useState(false);

    const DOCUMENT_ACCEPT = '.pdf,.jpg,.jpeg,.png';
    const ALLOWED_DOCUMENT_EXTENSIONS = new Set(['pdf', 'jpg', 'jpeg', 'png']);
    const ALLOWED_DOCUMENT_MIME_TYPES = new Set(['application/pdf', 'image/jpeg', 'image/png']);

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        propertyType: 'APARTMENT',
        address: '',
        city: '',
        state: '',
        country: 'Vietnam',
        zipCode: '',
        pricePerNight: undefined,
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
        loadCategoriesAndAmenities();

        // Cleanup Object URLs when component unmounts
        return () => {
            formData.images.forEach(img => {
                if (img.imageUrl.startsWith('blob:')) {
                    URL.revokeObjectURL(img.imageUrl);
                }
            });
        };
    }, []);

    const loadCategoriesAndAmenities = async () => {
        try {
            const [categoriesRes, amenitiesRes] = await Promise.all([
                hostService.getCategories(),
                hostService.getAmenities(),
            ]);
            if (categoriesRes.success) setCategories(categoriesRes.data);
            if (amenitiesRes.success) setAmenities(amenitiesRes.data);
        } catch (error) {
            console.error('Failed to load categories/amenities:', error);
        }
    };

    // Format number with dots as thousand separators (e.g., 3.500.000)
    const formatCurrency = (value) => {
        const numericValue = value.replace(/\D/g, '');
        if (!numericValue) return '';
        return numericValue.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    };

    // Parse formatted currency back to number
    const parseCurrency = (value) => {
        const numericValue = value.replace(/\./g, '');
        return numericValue ? parseInt(numericValue, 10) : 0;
    };

    const handleInputChange = (e) => {
        const {name, value, type} = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'number' ? (value === '' ? undefined : Number.parseFloat(value) || 0) : value
        }));
    };

    // Special handler for currency fields that need formatting
    const handleCurrencyChange = (e) => {
        const {name, value} = e.target;
        const numericValue = parseCurrency(value);
        setFormData(prev => ({
            ...prev,
            [name]: numericValue || undefined
        }));
    };

    const handleCheckboxChange = (e) => {
        const {name, checked} = e.target;
        setFormData(prev => ({...prev, [name]: checked}));
    };

    const handleAmenityToggle = (amenityId) => {
        setFormData(prev => ({
            ...prev,
            amenityIds: prev.amenityIds.includes(amenityId)
                ? prev.amenityIds.filter(id => id !== amenityId)
                : [...prev.amenityIds, amenityId]
        }));
    };

    // Handle different API response shapes from upload endpoints.
    const extractUploadPayload = (uploadResult) => {
        if (!uploadResult) return null;
        if (typeof uploadResult === 'string') return { url: uploadResult };
        if (uploadResult.success && uploadResult.data) return uploadResult.data;
        if (uploadResult.data && typeof uploadResult.data === 'object') return uploadResult.data;
        if (uploadResult.url || uploadResult.fileUrl) return uploadResult;
        return null;
    };

    // Handle image file selection - Show preview immediately, upload in background
    const handleImageSelect = async (e) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        // Check total images limit
        if (formData.images.length + files.length > 10) {
            alert('Tối thiểu 3 tối đa 10 ảnh/video cho mỗi tin đăng');
            return;
        }

        const newImages = [];
        const errors = [];

        // First pass: Create preview immediately
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const isVideo = file.type.startsWith('video/');
            const isImage = file.type.startsWith('image/');

            // Validate file type
            if (!isImage && !isVideo) {
                errors.push(`${file.name}: Chỉ hỗ trợ ảnh và video`);
                continue;
            }

            // Validate file size
            const maxSize = isVideo ? 100 * 1024 * 1024 : 10 * 1024 * 1024;
            if (file.size > maxSize) {
                const maxSizeMB = isVideo ? 100 : 10;
                errors.push(`${file.name}: Vượt quá ${maxSizeMB}MB`);
                continue;
            }

            // Create preview URL immediately
            const previewUrl = URL.createObjectURL(file);

            newImages.push({
                imageUrl: previewUrl,
                caption: '',
                displayOrder: formData.images.length + i,
                isPrimary: formData.images.length === 0 && i === 0,
                mediaType: isVideo ? 'VIDEO' : 'IMAGE',
                fileSize: file.size,
                file: file, // Keep for upload later
                uploading: true,
            });
        }

        // Show errors if any
        if (errors.length > 0) {
            alert(`Một số file không hợp lệ:\n${errors.join('\n')}`);
        }

        // Add images to form immediately for preview
        if (newImages.length > 0) {
            setFormData(prev => ({
                ...prev,
                images: [...prev.images, ...newImages]
            }));

            // Upload in background
            uploadImagesInBackground(newImages);
        }

        // Reset input
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    // Upload images to server in background
    const uploadImagesInBackground = async (imagesToUpload) => {
        setUploadingImages(true);

        for (let i = 0; i < imagesToUpload.length; i++) {
            const imageData = imagesToUpload[i];
            if (!imageData.file) continue;

            try {
                const isVideo = imageData.mediaType === 'VIDEO';
                let uploadResult;

                if (isVideo) {
                    uploadResult = await hostService.uploadVideo(imageData.file, (progress) => {
                        console.log(`Uploading ${imageData.file.name}: ${progress}%`);
                    });
                } else {
                    uploadResult = await hostService.uploadImage(imageData.file, (progress) => {
                        console.log(`Uploading ${imageData.file.name}: ${progress}%`);
                    });
                }

                const uploadPayload = extractUploadPayload(uploadResult);
                const uploadedUrl = uploadPayload?.url || uploadPayload?.fileUrl;

                if (uploadedUrl) {
                    // Update with real URL from server
                    setFormData(prev => ({
                        ...prev,
                        images: prev.images.map(img =>
                            img.imageUrl === imageData.imageUrl
                                ? {
                                    ...img,
                                    imageUrl: uploadedUrl,
                                    uploading: false,
                                    file: undefined, // Remove file object after upload
                                }
                                : img
                        )
                    }));
                    console.log(`✓ Uploaded ${imageData.file.name} successfully`);
                } else {
                    console.error(`✗ Failed to upload ${imageData.file.name}`);
                    // Keep preview URL if upload fails
                    setFormData(prev => ({
                        ...prev,
                        images: prev.images.map(img =>
                            img.imageUrl === imageData.imageUrl
                                ? {...img, uploading: false}
                                : img
                        )
                    }));
                }
            } catch (uploadError) {
                console.error(`Error uploading ${imageData.file.name}:`, uploadError);
                // Keep preview URL if upload fails
                setFormData(prev => ({
                    ...prev,
                    images: prev.images.map(img =>
                        img.imageUrl === imageData.imageUrl
                            ? {...img, uploading: false}
                            : img
                    )
                }));
            }
        }

        setUploadingImages(false);
    };

    // Trigger file input click
    const handleChooseFileClick = () => {
        fileInputRef.current?.click();
    };

    // Remove image from list
    const handleRemoveImage = (index) => {
        setFormData(prev => {
            const imageToRemove = prev.images[index];

            // Cleanup Object URL to prevent memory leak
            if (imageToRemove.imageUrl.startsWith('blob:')) {
                URL.revokeObjectURL(imageToRemove.imageUrl);
            }

            const newImages = prev.images.filter((_, idx) => idx !== index);
            // If removed image was primary and there are still images, make the first one primary
            if (imageToRemove.isPrimary && newImages.length > 0) {
                newImages[0].isPrimary = true;
            }
            // Update display orders
            return {
                ...prev,
                images: newImages.map((img, idx) => ({...img, displayOrder: idx}))
            };
        });
    };

    // Set image as primary
    const handleSetPrimaryImage = (index) => {
        setFormData(prev => ({
            ...prev,
            images: prev.images.map((img, idx) => ({
                ...img,
                isPrimary: idx === index
            }))
        }));
    };

    const handleChooseDocumentClick = () => {
        documentInputRef.current?.click();
    };

    const handleDocumentTypeChange = (index, documentType) => {
        setFormData(prev => ({
            ...prev,
            documents: prev.documents.map((doc, idx) => idx === index ? {...doc, documentType} : doc)
        }));
    };

    const handleRemoveDocument = (index) => {
        setFormData(prev => ({
            ...prev,
            documents: prev.documents.filter((_, idx) => idx !== index)
        }));
    };

    const handleDocumentSelect = async (e) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        const newDocuments = [];
        const errors = [];

        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const extension = file.name.includes('.') ? file.name.split('.').pop().toLowerCase() : '';
            const isAllowedType = ALLOWED_DOCUMENT_MIME_TYPES.has(file.type) || ALLOWED_DOCUMENT_EXTENSIONS.has(extension);

            if (!isAllowedType) {
                errors.push(`${file.name}: Chỉ hỗ trợ PDF, JPG, PNG`);
                continue;
            }

            if (file.size > 10 * 1024 * 1024) {
                errors.push(`${file.name}: Vượt quá 10MB`);
                continue;
            }

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

        if (errors.length > 0) {
            alert(`Một số file không hợp lệ:\n${errors.join('\n')}`);
        }

        if (newDocuments.length > 0) {
            setFormData(prev => ({
                ...prev,
                documents: [...prev.documents, ...newDocuments]
            }));
            uploadDocumentsInBackground(newDocuments);
        }

        if (documentInputRef.current) {
            documentInputRef.current.value = '';
        }
    };

    const uploadDocumentsInBackground = async (documentsToUpload) => {
        setUploadingDocuments(true);

        for (let i = 0; i < documentsToUpload.length; i++) {
            const doc = documentsToUpload[i];

            try {
                const uploadResult = await hostService.uploadDocument(doc.file, (progress) => {
                    console.log(`Uploading ${doc.file.name}: ${progress}%`);
                });

                const uploadPayload = extractUploadPayload(uploadResult);
                const uploadedUrl = uploadPayload?.url || uploadPayload?.fileUrl;

                if (uploadedUrl) {
                    setFormData(prev => ({
                        ...prev,
                        documents: prev.documents.map(item =>
                            item.tempId === doc.tempId
                                ? {
                                    ...item,
                                    fileUrl: uploadedUrl,
                                    fileName: uploadPayload?.originalFilename || item.fileName,
                                    fileExtension: (uploadPayload?.format || item.fileExtension || '').toLowerCase(),
                                    fileSize: uploadPayload?.size || item.fileSize,
                                    uploading: false,
                                    file: undefined,
                                }
                                : item
                        )
                    }));
                } else {
                    setFormData(prev => ({
                        ...prev,
                        documents: prev.documents.map(item =>
                            item.tempId === doc.tempId
                                ? {...item, uploading: false}
                                : item
                        )
                    }));
                }
            } catch (uploadError) {
                console.error(`Error uploading ${doc.file.name}:`, uploadError);
                setFormData(prev => ({
                    ...prev,
                    documents: prev.documents.map(item =>
                        item.tempId === doc.tempId
                            ? {...item, uploading: false}
                            : item
                    )
                }));
            }
        }

        setUploadingDocuments(false);
    };


    const handleSubmit = async () => {
        setLoading(true);
        setErrorMessage('');
        setSuccessMessage('');

        try {
            // Check if any files are still uploading
            const stillUploading = formData.images.some(img => img.uploading)
                || formData.documents.some(doc => doc.uploading);
            if (stillUploading) {
                setErrorMessage('⏳ Vui lòng đợi upload hoàn tất trước khi submit');
                setLoading(false);
                return;
            }

            // Filter out blob URLs (local preview URLs that haven't been uploaded)
            const uploadedImages = formData.images.filter(img => !img.imageUrl.startsWith('blob:'));

            // Warn if some images are still blob URLs
            if (uploadedImages.length < formData.images.length) {
                const blobCount = formData.images.length - uploadedImages.length;
                const shouldContinue = window.confirm(
                    `⚠️ ${blobCount} ảnh/video chưa được upload lên server (có thể do lỗi mạng).\n\n` +
                    `Bạn có muốn tiếp tục submit với ${uploadedImages.length} ảnh/video đã upload không?`
                );
                if (!shouldContinue) {
                    setLoading(false);
                    return;
                }
            }

            const uploadedDocuments = formData.documents.filter(doc => !!doc.fileUrl);
            if (uploadedDocuments.length === 0) {
                setErrorMessage('Vui lòng tải lên ít nhất 1 giấy tờ chứng minh nhà đất (PDF/JPG/PNG).');
                setLoading(false);
                return;
            }

            // Prepare data for create property
            const submitData = {
                ...formData,
                images: uploadedImages.map(img => ({
                    imageUrl: img.imageUrl,
                    caption: img.caption,
                    displayOrder: img.displayOrder,
                    isPrimary: img.isPrimary,
                    mediaType: img.mediaType,
                    fileSize: img.fileSize,
                    duration: img.duration,
                })),
                documents: uploadedDocuments.map(doc => ({
                    fileName: doc.fileName,
                    fileUrl: doc.fileUrl,
                    fileExtension: doc.fileExtension,
                    documentType: doc.documentType,
                    fileSize: doc.fileSize,
                }))
            };

            // Step 1: Create property
            const propertyResponse = await hostService.createProperty(submitData);
            if (!propertyResponse.success) {
                throw new Error('Không thể tạo tin đăng');
            }

            // TODO: Re-introduce package/wallet payment flow in a future release.
            setSuccessMessage('🎉 Tạo tin đăng thành công! Tin của bạn đang được xét duyệt.');

            setTimeout(() => {
                navigate('/host');
            }, 3000);

        } catch (error) {
            setErrorMessage(error.message || 'Đã có lỗi xảy ra khi tạo tin đăng. Vui lòng thử lại.');
            window.scrollTo({top: 0, behavior: 'smooth'});
        } finally {
            setLoading(false);
        }
    };

    // Step 4: Title & Description
    const renderTitleDescription = () => (
        <div className="space-y-6">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tiêu đề <span className="text-red-500">*</span>
                </label>
                <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="VD: Căn hộ 2 phòng ngủ view biển tuyệt đẹp"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                />
                <p className="text-sm text-gray-500 mt-1">
                    Tạo tiêu đề hấp dẫn để thu hút khách thuê
                </p>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mô tả <span className="text-red-500">*</span>
                </label>
                <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={8}
                    placeholder="Mô tả chi tiết về căn hộ của bạn: vị trí, tiện ích, điểm đặc biệt..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                />
                <p className="text-sm text-gray-500 mt-1">
                    Mô tả càng chi tiết càng tốt để khách hàng hiểu rõ về chỗ ở
                </p>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Danh mục
                </label>
                <select
                    name="categoryId"
                    value={formData.categoryId || ''}
                    onChange={(e) => setFormData(prev => ({
                        ...prev,
                        categoryId: e.target.value ? Number(e.target.value) : undefined
                    }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                    <option value="">Chọn danh mục</option>
                    {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                </select>
            </div>
        </div>
    );

    // Step 1: Location (moved from step 2)
    const renderLocation = () => (
        <div className="space-y-6">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Địa chỉ <span className="text-red-500">*</span>
                </label>
                <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="Số nhà, tên đường"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Thành phố <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        placeholder="Hà Nội, Hồ Chí Minh..."
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Quận/Huyện
                    </label>
                    <input
                        type="text"
                        name="state"
                        value={formData.state}
                        onChange={handleInputChange}
                        placeholder="Quận 1, Cầu Giấy..."
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Quốc gia <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        name="country"
                        value={formData.country}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Mã bưu điện
                    </label>
                    <input
                        type="text"
                        name="zipCode"
                        value={formData.zipCode}
                        onChange={handleInputChange}
                        placeholder="700000"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                </div>
            </div>
        </div>
    );

    // Step 2: Main Info - Property Type, Area, Price
    const renderMainInfo = () => (
        <div className="space-y-6">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Loại bất động sản <span className="text-red-500">*</span>
                </label>
                <select
                    name="propertyType"
                    value={formData.propertyType}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                    <option value="APARTMENT">Căn hộ</option>
                    <option value="HOUSE">Nhà riêng</option>
                    <option value="VILLA">Biệt thự</option>
                    <option value="STUDIO">Studio</option>
                    <option value="CONDO">Chung cư</option>
                    <option value="ROOM">Phòng trọ</option>
                </select>
            </div>

            <div>
                <label className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                    <span>Diện tích (m²)</span>
                    <span className="text-red-500 ml-1">*</span>
                    <span className="ml-2 text-xs text-gray-500 font-normal">
            - Diện tích thực tế của bất động sản
          </span>
                </label>
                <div className="relative">
                    <input
                        type="number"
                        name="areaSqft"
                        value={formData.areaSqft || ''}
                        onChange={handleInputChange}
                        min="1"
                        placeholder="50"
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                    <span className="absolute right-3 top-3 text-gray-400 text-sm">m²</span>
                </div>
                {formData.areaSqft > 0 && formData.areaSqft < 10 && (
                    <p className="text-xs text-orange-600 mt-1 flex items-center">
                        <Info className="w-3 h-3 mr-1"/>
                        Diện tích có vẻ nhỏ, vui lòng kiểm tra lại
                    </p>
                )}
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                    <span>Giá mỗi đêm (VND)</span>
                    <span className="text-red-500 ml-1">*</span>
                    <span className="ml-2 text-xs text-gray-500 font-normal">
              - Giá cơ bản chưa bao gồm phí dịch vụ
            </span>
                </label>
                <div className="relative">
                    <input
                        type="text"
                        name="pricePerNight"
                        value={formData.pricePerNight ? formatCurrency(formData.pricePerNight.toString()) : ''}
                        onChange={handleCurrencyChange}
                        placeholder="500.000"
                        required
                        className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                    <DollarSign className="absolute right-3 top-3 w-5 h-5 text-gray-400"/>
                </div>
                {formData.pricePerNight && formData.pricePerNight > 0 && (
                    <p className="text-sm text-green-600 mt-1 flex items-center">
                        <Check className="w-4 h-4 mr-1"/>
                        ≈ {new Intl.NumberFormat('vi-VN').format(formData.pricePerNight)} VND/đêm
                    </p>
                )}
                {(!formData.pricePerNight || formData.pricePerNight <= 0) && (
                    <p className="text-sm text-gray-500 mt-1">
                        Vui lòng nhập giá thuê (tối thiểu 1 VND)
                    </p>
                )}
            </div>
            <div className="grid md:grid-cols-3 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Số phòng ngủ <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="number"
                        name="bedrooms"
                        value={formData.bedrooms}
                        onChange={handleInputChange}
                        min="0"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Số giường <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="number"
                        name="beds"
                        value={formData.beds}
                        onChange={handleInputChange}
                        min="0"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Số phòng tắm <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="number"
                        name="bathrooms"
                        value={formData.bathrooms}
                        onChange={handleInputChange}
                        min="0"
                        step="0.5"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                </div>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-6 rounded-xl border border-blue-200">
                <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center">
                    <span>Số khách tối đa</span>
                    <span className="text-red-500 ml-1">*</span>
                    <span className="ml-2 text-xs text-gray-600 font-normal">
            - Tổng số khách được phép lưu trú
          </span>
                </label>
                <div className="flex items-center space-x-4">
                    <button
                        type="button"
                        onClick={() => setFormData(prev => ({...prev, maxGuests: Math.max(1, prev.maxGuests - 1)}))}
                        className="w-12 h-12 rounded-xl border-2 border-blue-300 bg-white hover:bg-blue-50 flex items-center justify-center transition-all shadow-sm hover:shadow"
                    >
                        <span className="text-2xl font-bold text-blue-600">−</span>
                    </button>
                    <div className="flex-1 text-center">
                        <input
                            type="number"
                            name="maxGuests"
                            value={formData.maxGuests}
                            onChange={handleInputChange}
                            min="1"
                            className="w-full px-4 py-3 text-center text-2xl font-bold border-2 border-blue-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                        />
                        <p className="text-xs text-gray-600 mt-1">khách</p>
                    </div>
                    <button
                        type="button"
                        onClick={() => setFormData(prev => ({...prev, maxGuests: prev.maxGuests + 1}))}
                        className="w-12 h-12 rounded-xl border-2 border-blue-300 bg-white hover:bg-blue-50 flex items-center justify-center transition-all shadow-sm hover:shadow"
                    >
                        <span className="text-2xl font-bold text-blue-600">+</span>
                    </button>
                </div>
            </div>
        </div>
    );

    const renderAdditionalInfo = () => (
        <div className="space-y-6">

            <>
                <h3 className="text-lg font-semibold text-gray-900">Thông tin thuê ngắn hạn</h3>

                <div className="grid md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Phí vệ sinh (VND)
                        </label>
                        <input
                            type="text"
                            name="cleaningFee"
                            value={formData.cleaningFee ? formatCurrency(formData.cleaningFee.toString()) : ''}
                            onChange={handleCurrencyChange}
                            placeholder="100.000"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Phí dịch vụ (VND)
                        </label>
                        <input
                            type="text"
                            name="serviceFee"
                            value={formData.serviceFee ? formatCurrency(formData.serviceFee.toString()) : ''}
                            onChange={handleCurrencyChange}
                            placeholder="50.000"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Số đêm tối thiểu
                        </label>
                        <input
                            type="number"
                            name="minNights"
                            value={formData.minNights}
                            onChange={handleInputChange}
                            min="1"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Số đêm tối đa
                        </label>
                        <input
                            type="number"
                            name="maxNights"
                            value={formData.maxNights}
                            onChange={handleInputChange}
                            min="1"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Giờ nhận phòng
                        </label>
                        <input
                            type="time"
                            name="checkInTime"
                            value={formData.checkInTime}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Giờ trả phòng
                        </label>
                        <input
                            type="time"
                            name="checkOutTime"
                            value={formData.checkOutTime}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Chính sách hủy
                    </label>
                    <select
                        name="cancellationPolicy"
                        value={formData.cancellationPolicy}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                        <option value="FLEXIBLE">Linh hoạt - Hoàn tiền 100% nếu hủy trước 24h</option>
                        <option value="MODERATE">Trung bình - Hoàn tiền 50% nếu hủy trước 5 ngày</option>
                        <option value="STRICT">Nghiêm ngặt - Không hoàn tiền</option>
                    </select>
                </div>

                <div className="flex items-center">
                    <input
                        type="checkbox"
                        name="isInstantBook"
                        checked={formData.isInstantBook}
                        onChange={handleCheckboxChange}
                        className="w-5 h-5 text-blue-500 rounded focus:ring-blue-500"
                    />
                    <label className="ml-3 text-gray-700">
                        Cho phép đặt phòng tức thì
                    </label>
                </div>
            </>


            {/* Amenities - Common for both types */}
            <div className="border-t pt-6 mt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Tiện ích
                </h3>
                <div className="grid md:grid-cols-3 gap-4">
                    {amenities.map(amenity => (
                        <label
                            key={amenity.id}
                            className="flex items-center p-4 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer"
                        >
                            <input
                                type="checkbox"
                                checked={formData.amenityIds.includes(amenity.id)}
                                onChange={() => handleAmenityToggle(amenity.id)}
                                className="w-5 h-5 text-blue-500 rounded focus:ring-blue-500"
                            />
                            <span className="ml-3 text-gray-700">{amenity.name}</span>
                        </label>
                    ))}
                </div>
            </div>

            {/* House Rules */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nội quy nhà
                </label>
                <textarea
                    name="houseRules"
                    value={formData.houseRules}
                    onChange={handleInputChange}
                    rows={4}
                    placeholder="VD: Không hút thuốc, Không nuôi thú cưng, Giữ vệ sinh chung..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
            </div>
        </div>
    );

    // Step 5: Images & Videos
    const renderImages = () => (
        <div className="space-y-6">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Hình ảnh & Video
                </label>
                <div
                    className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-500 transition-colors">
                    <div className="flex justify-center mb-4">
                        <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                        </svg>
                    </div>
                    <p className="text-gray-500 mb-4">Kéo thả hoặc click để tải ảnh/video lên</p>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*,video/*"
                        multiple
                        onChange={handleImageSelect}
                        className="hidden"
                    />
                    <button
                        type="button"
                        onClick={handleChooseFileClick}
                        disabled={uploadingImages}
                        className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {uploadingImages ? '⏳ Đang tải lên...' : '📁 Chọn ảnh/video'}
                    </button>
                    <p className="text-sm text-gray-500 mt-4">
                        Hỗ trợ: JPG, PNG, MP4, MOV (Tối đa 10 ảnh + video, mỗi ảnh max 10MB, video max 100MB)
                    </p>
                </div>
            </div>

            {formData.images.length > 0 && (
                <div>
                    <h4 className="font-medium text-gray-900 mb-3">
                        Media đã tải lên ({formData.images.length})
                        <span className="text-sm text-gray-500 ml-2">
              ({formData.images.filter(img => img.mediaType === 'VIDEO').length} video, {formData.images.filter(img => img.mediaType !== 'VIDEO').length} ảnh)
            </span>
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {formData.images.map((img, idx) => (
                            <div key={idx} className="relative group">
                                {img.mediaType === 'VIDEO' || img.mediaType === 'VIDEO_360' ? (
                                    <div className="relative">
                                        <video
                                            src={img.imageUrl}
                                            className="w-full h-32 object-cover rounded-lg"
                                            controls={false}
                                        />
                                        <div
                                            className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 rounded-lg">
                                            <svg className="w-12 h-12 text-white" fill="currentColor"
                                                 viewBox="0 0 20 20">
                                                <path
                                                    d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z"/>
                                            </svg>
                                        </div>
                                    </div>
                                ) : (
                                    <img
                                        src={img.imageUrl}
                                        alt={img.caption}
                                        className="w-full h-32 object-cover rounded-lg"
                                    />
                                )}

                                {/* Uploading Overlay */}
                                {img.uploading && (
                                    <div
                                        className="absolute inset-0 bg-black bg-opacity-50 rounded-lg flex items-center justify-center">
                                        <div className="text-center text-white">
                                            <svg className="animate-spin h-8 w-8 mx-auto mb-2" fill="none"
                                                 viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10"
                                                        stroke="currentColor" strokeWidth="4"/>
                                                <path className="opacity-75" fill="currentColor"
                                                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                                            </svg>
                                            <span className="text-xs">Đang tải...</span>
                                        </div>
                                    </div>
                                )}

                                {/* Media Type Badge */}
                                {img.mediaType === 'VIDEO_360' && (
                                    <span
                                        className="absolute bottom-2 left-2 bg-purple-500 text-white text-xs px-2 py-1 rounded font-semibold">
                    360° VIDEO
                  </span>
                                )}
                                {img.mediaType === 'VIDEO' && (
                                    <span
                                        className="absolute bottom-2 left-2 bg-blue-500 text-white text-xs px-2 py-1 rounded">
                    VIDEO
                  </span>
                                )}

                                {/* Primary Badge */}
                                {img.isPrimary && (
                                    <span
                                        className="absolute top-2 left-2 bg-blue-500 text-white text-xs px-2 py-1 rounded">
                    Ảnh chính
                  </span>
                                )}

                                {/* Set Primary Button */}
                                {!img.isPrimary && !img.uploading && (
                                    <button
                                        type="button"
                                        onClick={() => handleSetPrimaryImage(idx)}
                                        className="absolute top-2 left-2 bg-gray-800 bg-opacity-70 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity hover:bg-gray-900"
                                    >
                                        Đặt làm ảnh chính
                                    </button>
                                )}

                                {/* Delete Button */}
                                {!img.uploading && (
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveImage(idx)}
                                        className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                                        title="Xóa"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                                  d="M6 18L18 6M6 6l12 12"/>
                                        </svg>
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Upload Status Warning */}
            {formData.images.length > 0 && (
                <>
                    {formData.images.some(img => img.uploading) && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                            <div className="flex">
                                <svg className="w-5 h-5 text-yellow-500 mr-3 flex-shrink-0" fill="currentColor"
                                     viewBox="0 0 20 20">
                                    <path fillRule="evenodd"
                                          d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                                          clipRule="evenodd"/>
                                </svg>
                                <div className="text-sm text-yellow-700">
                                    <p className="font-medium">⏳ Đang
                                        upload {formData.images.filter(img => img.uploading).length} file(s)...</p>
                                    <p>Vui lòng đợi upload hoàn tất trước khi submit property.</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {formData.images.some(img => img.imageUrl.startsWith('blob:')) && !formData.images.some(img => img.uploading) && (
                        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                            <div className="flex">
                                <svg className="w-5 h-5 text-orange-500 mr-3 flex-shrink-0" fill="currentColor"
                                     viewBox="0 0 20 20">
                                    <path fillRule="evenodd"
                                          d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                                          clipRule="evenodd"/>
                                </svg>
                                <div className="text-sm text-orange-700">
                                    <p className="font-medium">⚠️ Một số ảnh chưa được upload lên server</p>
                                    <p>Có thể do lỗi mạng hoặc backend chưa chạy. Các ảnh này sẽ không được lưu khi
                                        submit.</p>
                                    <p className="mt-1 font-medium">Giải pháp: Xóa ảnh lỗi và upload lại, hoặc khởi động
                                        backend.</p>
                                </div>
                            </div>
                        </div>
                    )}
                </>
            )}

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex">
                    <svg className="w-5 h-5 text-blue-500 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd"
                              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                              clipRule="evenodd"/>
                    </svg>
                    <div className="text-sm text-blue-700">
                        <p className="font-medium mb-1">Mẹo cho ảnh đẹp:</p>
                        <ul className="list-disc list-inside space-y-1">
                            <li>Chụp trong ánh sáng tự nhiên</li>
                            <li>Dọn dẹp gọn gàng trước khi chụp</li>
                            <li>Chụp từ nhiều góc độ khác nhau</li>
                            <li>Ảnh đầu tiên sẽ là ảnh đại diện</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );

    // Step 6: Documents
    const renderDocuments = () => (
        <div className="space-y-6">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Giấy tờ chứng minh nhà đất <span className="text-red-500">*</span>
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-500 transition-colors">
                    <div className="flex justify-center mb-4">
                        <FileText className="w-16 h-16 text-gray-400"/>
                    </div>
                    <p className="text-gray-500 mb-4">Tải lên giấy tờ: PDF, JPG, PNG</p>
                    <input
                        ref={documentInputRef}
                        type="file"
                        accept={DOCUMENT_ACCEPT}
                        multiple
                        onChange={handleDocumentSelect}
                        className="hidden"
                    />
                    <button
                        type="button"
                        onClick={handleChooseDocumentClick}
                        disabled={uploadingDocuments}
                        className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {uploadingDocuments ? '⏳ Đang tải lên...' : '📄 Chọn giấy tờ'}
                    </button>
                    <p className="text-sm text-gray-500 mt-4">
                        Hỗ trợ: PDF, JPG, PNG (tối đa 10MB / file)
                    </p>
                </div>
            </div>

            {formData.documents.length > 0 && (
                <div>
                    <h4 className="font-medium text-gray-900 mb-3">Giấy tờ đã tải lên ({formData.documents.length})</h4>
                    <div className="space-y-3">
                        {formData.documents.map((doc, idx) => (
                            <div key={doc.tempId || `${doc.fileName}-${idx}`} className="border border-gray-200 rounded-lg p-4">
                                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                                    <div className="min-w-0">
                                        <p className="font-medium text-gray-900 truncate">{doc.fileName}</p>
                                        <p className="text-sm text-gray-500">
                                            {(doc.fileExtension || '').toUpperCase()} • {((doc.fileSize || 0) / 1024 / 1024).toFixed(2)} MB
                                        </p>
                                        {doc.uploading && <p className="text-sm text-yellow-600">Đang upload...</p>}
                                        {!doc.uploading && !doc.fileUrl && <p className="text-sm text-red-600">Upload thất bại, vui lòng thử lại</p>}
                                    </div>

                                    <div className="flex gap-2 items-center">
                                        <select
                                            value={doc.documentType || 'LAND_CERTIFICATE'}
                                            onChange={(e) => handleDocumentTypeChange(idx, e.target.value)}
                                            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        >
                                            <option value="LAND_CERTIFICATE">Sổ đỏ / Sổ hồng</option>
                                            <option value="AUTHORIZATION_PAPER">Giấy ủy quyền</option>
                                            <option value="CONTRACT">Hợp đồng</option>
                                            <option value="OTHER">Khác</option>
                                        </select>
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveDocument(idx)}
                                            className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 text-sm"
                                        >
                                            Xóa
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-700">
                Vui lòng tải lên ít nhất 1 giấy tờ hợp lệ để hệ thống xét duyệt bất động sản.
            </div>
        </div>
    );

    // Step 7: Review & Submit (free flow for now)
    const renderPaymentConfig = () => (
        <div className="space-y-6">
            <div className="text-center">
                <h3 className="text-3xl font-bold text-gray-900 mb-2">Xác nhận thông tin tin đăng</h3>
                <p className="text-gray-600 text-lg">Giai đoạn này tạm thời đăng miễn phí, chưa dùng ví/gói đăng tin.</p>
            </div>

            <div className="bg-gradient-to-r from-blue-50 to-sky-50 rounded-2xl p-6 border border-blue-100">
                <div className="flex items-start gap-4">
                    {formData.images.length > 0 && (
                        <img
                            src={formData.images[0].imageUrl}
                            alt="Property"
                            className="w-24 h-24 object-cover rounded-xl shadow-md"
                        />
                    )}
                    <div className="flex-1">
                        <h4 className="font-bold text-gray-900 text-lg mb-2">
                            {formData.title || 'Chưa có tiêu đề'}
                        </h4>
                        <div className="grid grid-cols-2 gap-3 text-sm">
                            <div className="flex items-center gap-2">
                                <MapPin className="w-4 h-4 text-gray-500"/>
                                <span className="text-gray-700">{formData.city || 'Chưa chọn'}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Building2 className="w-4 h-4 text-gray-500"/>
                                <span className="text-gray-700">{formData.propertyType}</span>
                            </div>
                            <div className="text-gray-700">
                                <span className="font-medium">{formData.bedrooms}</span> phòng ngủ •
                                <span className="font-medium ml-1">{formData.bathrooms}</span> phòng tắm
                            </div>
                            <div className="text-blue-600 font-bold text-lg">{formData.pricePerNight?.toLocaleString()} ₫/đêm</div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-sm text-green-700">
                Nhấn <span className="font-semibold">Đăng tin ngay</span> để gửi tin đăng miễn phí cho admin xét duyệt.
            </div>
        </div>
    );

    const steps = [
        {title: 'Địa chỉ', render: renderLocation},
        {title: 'Thông tin chính', render: renderMainInfo},
        {title: 'Thông tin bổ sung', render: renderAdditionalInfo},
        {title: 'Tiêu đề & Mô tả', render: renderTitleDescription},
        {title: 'Hình ảnh & Video', render: renderImages},
        {title: 'Giấy tờ chứng minh', render: renderDocuments},
        {title: 'Xác nhận & Đăng tin', render: renderPaymentConfig},
    ];

    const progressPercentage = steps.length > 1
        ? (currentStep / (steps.length - 1)) * 100
        : 100;

    const handleNext = () => {
        if (currentStep < steps.length - 1) {
            setCurrentStep(currentStep + 1);
            window.scrollTo({top: 0, behavior: 'smooth'});
        }
    };

    const handlePrevious = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
            window.scrollTo({top: 0, behavior: 'smooth'});
        }
    };

    const canProceed = () => {
        switch (currentStep) {
            case 0: // Location
                return formData.address && formData.city && formData.country;
            case 1: // Main Info
                return formData.propertyType && formData.areaSqft > 0 &&
                    formData.pricePerNight !== undefined && formData.pricePerNight > 0 &&
                    formData.maxGuests > 0 && formData.bedrooms >= 0 && formData.beds >= 0 && formData.bathrooms >= 0;
            case 2: // Additional Info - always allow
                return true;
            case 3: // Title & Description
                return formData.title && formData.description;
            case 4: // Images - optional
                return true;
            case 5: // Documents
                return formData.documents.some(doc => !!doc.fileUrl) && !formData.documents.some(doc => doc.uploading);
            case 6: // Package Selection & Payment
                return true;
            default:
                return true;
        }
    };

    // Main step-by-step form
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-sky-100">
            {/* Header */}
            <div className="bg-white/95 backdrop-blur shadow-md sticky top-0 z-50 border-b border-blue-100">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4">
                    {/* Success/Error Messages */}
                    {successMessage && (
                        <div
                            className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start animate-fade-in">
                            <Check className="w-5 h-5 text-green-600 mr-3 mt-0.5 flex-shrink-0"/>
                            <div className="flex-1">
                                <p className="text-green-800 font-medium">{successMessage}</p>
                            </div>
                        </div>
                    )}

                    {errorMessage && (
                        <div
                            className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start animate-fade-in">
                            <Info className="w-5 h-5 text-red-600 mr-3 mt-0.5 flex-shrink-0"/>
                            <div className="flex-1">
                                <p className="text-red-800 font-medium">{errorMessage}</p>
                                <button
                                    onClick={() => setErrorMessage('')}
                                    className="text-sm text-red-600 hover:text-red-700 underline mt-1"
                                >
                                    Đóng
                                </button>
                            </div>
                        </div>
                    )}

                    <div className="flex items-center justify-between mb-4">

                        <div className="text-center flex-1 mx-4">
                            <div className="flex items-center justify-center mb-1">
                                <div className="w-8 h-8 rounded-full flex items-center justify-center mr-2 bg-blue-100 text-blue-600">
                                    <span className="text-sm font-bold">{currentStep + 1}</span>
                                </div>
                                <h1 className="text-xl font-semibold tracking-tight leading-tight text-gray-900">
                                    {steps[currentStep].title}
                                </h1>
                            </div>
                            <p className="text-sm text-gray-500 leading-relaxed tracking-[0.01em]">
                                Bước {currentStep + 1} trên tổng {steps.length} bước
                            </p>
                        </div>

                        <button
                            onClick={() => {
                                if (window.confirm('Bạn có chắc muốn thoát? Dữ liệu chưa lưu sẽ bị mất.')) {
                                    navigate('/host');
                                }
                            }}
                            className="text-gray-600 hover:text-red-600 transition-colors px-3 py-2 rounded-lg hover:bg-red-50 font-medium tracking-[0.01em]"
                        >
                            Thoát
                        </button>
                    </div>

                    {/* Enhanced Progress bar with step dots */}
                    <div className="relative px-1 py-1">
                        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                            <div
                                className="h-2 rounded-full transition-all duration-500 ease-out bg-gradient-to-r from-blue-400 to-blue-600"
                                style={{width: `${progressPercentage}%`}}
                            />
                        </div>

                        {/* Step dots */}
                        <div className="pointer-events-none absolute inset-x-1 top-1/2 -translate-y-1/2 flex justify-between">
                            {steps.map((step, index) => (
                                <div
                                    key={index}
                                    className={`w-3 h-3 rounded-full border border-white transition-all duration-300 ${
                                        index <= currentStep
                                            ? 'bg-blue-500 shadow-md'
                                            : 'bg-gray-300'
                                    }`}
                                    title={step.title}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Step names preview (hidden on mobile) */}
                    <div className="hidden md:flex justify-between mt-3 text-xs">
                        {steps.map((step, index) => (
                            <div
                                key={index}
                                className={`flex-1 text-center tracking-[0.01em] transition-colors ${
                                    index === currentStep ?
                                        'text-blue-600 font-semibold'
                                        : index < currentStep
                                            ? 'text-gray-700'
                                            : 'text-gray-400'
                                }`}
                            >
                                {step.title}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
                {/* Animated content card */}
                <div
                    className="bg-white rounded-2xl shadow-xl p-6 sm:p-10 border border-gray-100 transform transition-all duration-300 hover:shadow-2xl">
                    {/* Step icon and description */}
                    <div className="mb-6 pb-6 border-b border-gray-100">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br from-blue-100 to-blue-50">
                                    {currentStep === 0 && <MapPin
                                        className={`w-6 h-6 text-blue-600`}/>}
                                    {currentStep === 1 && <Info
                                        className={`w-6 h-6 'text-blue-600'`}/>}
                                    {currentStep === 2 && <Sparkles
                                        className={`w-6 h-6 'text-blue-600'`}/>}
                                    {currentStep === 3 && <Info
                                        className={`w-6 h-6 'text-blue-600'`}/>}
                                    {currentStep === 4 && <Camera
                                        className={`w-6 h-6 'text-blue-600'`}/>}
                                    {currentStep === 5 && <FileText
                                        className={`w-6 h-6 'text-blue-600'`}/>} 
                                    {currentStep === 6 && <DollarSign
                                        className={`w-6 h-6 'text-blue-600'`}/>}
                                </div>
                                <div>
                                    <h2 className="text-xl font-semibold tracking-tight leading-tight text-gray-900">{steps[currentStep].title}</h2>
                                    <p className="text-sm text-gray-500 leading-relaxed tracking-[0.01em]">
                                        {currentStep === 0 && 'Cho chúng tôi biết vị trí bất động sản của bạn'}
                                        {currentStep === 1 && 'Thông tin cơ bản về căn hộ'}
                                        {currentStep === 2 && 'Các tiện ích và chính sách đi kèm'}
                                        {currentStep === 3 && 'Tạo tiêu đề hấp dẫn và mô tả chi tiết'}
                                        {currentStep === 4 && 'Thêm hình ảnh để thu hút khách hàng'}
                                        {currentStep === 5 && 'Tải lên giấy tờ chứng minh nhà đất'}
                                        {currentStep === 6 && 'Xem lại thông tin và hoàn tất'}
                                    </p>
                                </div>
                            </div>
                            {!canProceed() && currentStep < 3 && (
                                <div className="hidden sm:flex items-center text-orange-600 text-sm">
                                    <Info className="w-4 h-4 mr-1"/>
                                    <span>Cần điền</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Form content with fade animation */}
                    <div className="animate-fade-in">
                        {steps[currentStep].render()}
                    </div>
                </div>

                {/* Enhanced Navigation buttons */}
                <div className="flex flex-col sm:flex-row justify-between items-center mt-8 gap-4">
                    <button
                        onClick={handlePrevious}
                        disabled={currentStep === 0}
                        className="w-full sm:w-auto px-8 py-3 border-2 border-blue-200 rounded-xl text-gray-700 font-medium hover:bg-blue-50 hover:border-blue-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center group"
                    >
                        <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform"/>
                        Quay lại
                    </button>

                    <div className="hidden sm:block text-sm text-gray-500 tracking-[0.01em]">
                        {canProceed() ? (
                            <span className="flex items-center text-green-600">
                <Check className="w-4 h-4 mr-1"/>
                Sẵn sàng tiếp tục
              </span>
                        ) : currentStep < 3 ? (
                            <span className="flex items-center text-orange-600">
                <Info className="w-4 h-4 mr-1"/>
                Vui lòng điền đầy đủ thông tin
              </span>
                        ) : (
                            <span className="text-gray-400">Tùy chọn</span>
                        )}
                    </div>

                    {currentStep === steps.length - 1 ? (
                        <button
                            onClick={handleSubmit}
                            disabled={loading || !canProceed()}
                            className="w-full sm:w-auto px-8 py-3 rounded-xl text-white font-semibold tracking-[0.01em] shadow-lg transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center group bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
                        >
                            {loading ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                                         xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor"
                                                strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor"
                                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Đang xử lý...
                                </>
                            ) : (
                                <>
                                    <Check className="w-5 h-5 mr-2"/>
                                    Đăng tin ngay
                                    <Sparkles className="w-4 h-4 ml-2 group-hover:rotate-12 transition-transform"/>
                                </>
                            )}
                        </button>
                    ) : (
                        <button
                            onClick={handleNext}
                            disabled={!canProceed()}
                            className="w-full sm:w-auto px-8 py-3 rounded-xl text-white font-semibold tracking-[0.01em] shadow-lg transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center group bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
                        >
                            Tiếp theo
                            <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform"/>
                        </button>
                    )}
                </div>

                {/* Progress indicator text */}
                <div className="mt-6 text-center">
                    <p className="text-sm text-gray-500 leading-relaxed tracking-[0.01em]">
                        {currentStep < steps.length - 1 ? (
                            <>Còn <span className="font-bold text-gray-700">{steps.length - currentStep - 1}</span> bước
                                nữa để hoàn thành</>
                        ) : (
                            <span className="text-green-600 font-medium">🎉 Bạn đã hoàn thành tất cả các bước!</span>
                        )}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default AddPropertyPage;

