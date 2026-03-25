import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Building2, Home, ArrowLeft, ArrowRight, Check,
  MapPin, Info, Camera, DollarSign, Sparkles, Zap, Crown, Star
} from 'lucide-react';
import hostService from "../services/host.service.js";

const AddPropertyPage = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [rentalType, setRentalType] = useState(null);
  const [categories, setCategories] = useState([]);
  const [amenities, setAmenities] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [uploadingImages, setUploadingImages] = useState(false);

  // Package selection states
  const [packages, setPackages] = useState([]);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('');
  const [loadingPackages, setLoadingPackages] = useState(false);
  const [walletBalance, setWalletBalance] = useState(0);
  const [loadingWallet, setLoadingWallet] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    propertyType: 'APARTMENT',
    rentalType: 'SHORT_TERM',
    address: '',
    city: '',
    state: '',
    country: 'Vietnam',
    zipCode: '',
    pricePerNight: undefined,
    pricePerMonth: undefined,
    electricityCost: '',
    waterCost: '',
    internetCost: '',
    cleaningFee: 0,
    serviceFee: 0,
    securityDeposit: 0,
    depositMonths: 1,
    minimumLeaseMonths: 3,
    maxGuests: 1,
    bedrooms: 1,
    beds: 1,
    bathrooms: 1,
    areaSqft: 0,
    minNights: 1,
    maxNights: 365,
    leaseDuration: 12,
    checkInTime: '14:00',
    checkOutTime: '11:00',
    houseRules: '',
    cancellationPolicy: 'FLEXIBLE',
    isInstantBook: false,
    categoryId: undefined,
    amenityIds: [],
    images: [],
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

  // Load packages when user reaches step 6
  useEffect(() => {
    if (currentStep === 5) { // Step 6 (index 5)
      loadPackages();
      loadWalletBalance();
    }
  }, [currentStep]);

  const loadPackages = async () => {
    try {
      setLoadingPackages(true);
      const packagesData = await hostService.getAllActivePackages();
      setPackages(packagesData);
    } catch (error) {
      console.error('Failed to load packages:', error);
      setErrorMessage('Không thể tải danh sách gói đăng tin');
    } finally {
      setLoadingPackages(false);
    }
  };

  const loadWalletBalance = async () => {
    try {
      setLoadingWallet(true);
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8080/api/wallet', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const walletData = await response.json();
        setWalletBalance(walletData.balance || 0);
      }
    } catch (error) {
      console.error('Failed to load wallet:', error);
    } finally {
      setLoadingWallet(false);
    }
  };

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
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? (value === '' ? undefined : Number.parseFloat(value) || 0) : value
    }));
  };

  // Special handler for currency fields that need formatting
  const handleCurrencyChange = (e) => {
    const { name, value } = e.target;
    const numericValue = parseCurrency(value);
    setFormData(prev => ({
      ...prev,
      [name]: numericValue || undefined
    }));
  };

  // Special handler for utility cost fields (can be text or number)
  const handleUtilityCostChange = (e) => {
    const { name, value } = e.target;
    // Check if input is numeric
    const isNumeric = /^\d/.test(value.replace(/\./g, ''));
    if (isNumeric) {
      // Format as currency if it starts with a number
      const formatted = formatCurrency(value);
      setFormData(prev => ({
        ...prev,
        [name]: formatted
      }));
    } else {
      // Keep as text if it's not numeric
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: checked }));
  };

  const handleAmenityToggle = (amenityId) => {
    setFormData(prev => ({
      ...prev,
      amenityIds: prev.amenityIds.includes(amenityId)
        ? prev.amenityIds.filter(id => id !== amenityId)
        : [...prev.amenityIds, amenityId]
    }));
  };

  // Handle image file selection - Show preview immediately, upload in background
  const handleImageSelect = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    // Check total images limit
    if (formData.images.length + files.length > 10) {
      alert('Bạn chỉ có thể upload tối đa 10 ảnh/video cho mỗi tin đăng');
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

        if (uploadResult?.success && uploadResult?.data) {
          // Update with real URL from server
          setFormData(prev => ({
            ...prev,
            images: prev.images.map(img =>
              img.imageUrl === imageData.imageUrl
                ? {
                    ...img,
                    imageUrl: uploadResult.data.url,
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
                ? { ...img, uploading: false }
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
              ? { ...img, uploading: false }
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
        images: newImages.map((img, idx) => ({ ...img, displayOrder: idx }))
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


  const handleSubmit = async () => {
    setLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      // Validate package selection
      if (!selectedPackage) {
        setErrorMessage('Vui lòng chọn một gói đăng tin');
        setLoading(false);
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }

      // Validate payment method if package is not free
      if (selectedPackage.price > 0 && !paymentMethod) {
        setErrorMessage('Vui lòng chọn phương thức thanh toán');
        setLoading(false);
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }

      // Check if any images are still uploading
      const stillUploading = formData.images.some(img => img.uploading);
      if (stillUploading) {
        setErrorMessage('⏳ Vui lòng đợi tất cả ảnh/video upload xong trước khi submit');
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

      // Prepare data - set unused price field to null based on rental type
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
        }))
      };

      if (formData.rentalType === 'SHORT_TERM') {
        submitData.pricePerMonth = null;
      } else {
        submitData.pricePerNight = null;
      }

      // Step 1: Create property
      const propertyResponse = await hostService.createProperty(submitData);
      if (!propertyResponse.success) {
        throw new Error('Không thể tạo tin đăng');
      }

      const propertyId = propertyResponse.data.id;

      // Step 2: Create subscription
      const subscriptionResponse = await hostService.createSubscription({
        propertyId: propertyId,
        packageId: selectedPackage.id,
        paymentMethod: selectedPackage.price === 0 ? 'FREE' : paymentMethod,
        transactionNote: `Package: ${selectedPackage.name}`,
      });

      // If free package, confirm immediately
      if (selectedPackage.price === 0) {
        await hostService.confirmPayment(subscriptionResponse.transactionId);
        setSuccessMessage('🎉 Tạo tin đăng thành công! Tin của bạn đang được xét duyệt.');
      } else {
        setSuccessMessage(
          `🎉 Tạo tin đăng thành công!\n\n` +
          `Mã giao dịch: ${subscriptionResponse.transactionId}\n` +
          `Vui lòng thanh toán ${selectedPackage.price.toLocaleString()} ₫ để kích hoạt tin đăng.\n\n` +
          `Đang chuyển hướng...`
        );
      }

      setTimeout(() => {
        navigate('/host');
      }, 3000);

    } catch (error) {
      setErrorMessage(error.message || 'Đã có lỗi xảy ra khi tạo tin đăng. Vui lòng thử lại.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setLoading(false);
    }
  };

  // Step 0: Choose rental type
  const renderRentalTypeSelection = () => (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center p-6">
      <div className="max-w-5xl w-full animate-fade-in">
        <button
          onClick={() => navigate('/host')}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-8 transition-colors group"
        >
          <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
          <span className="font-medium">Quay lại</span>
        </button>

        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-rose-500 to-blue-500 rounded-full mb-4">
            <Home className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Loại hình cho thuê
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Bước đầu tiên để bắt đầu kinh doanh của bạn. Chọn loại hình phù hợp với bất động sản.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <button
            onClick={() => {
              setRentalType('SHORT_TERM');
              setFormData(prev => ({ ...prev, rentalType: 'SHORT_TERM' }));
              setCurrentStep(0);
            }}
            className="relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border-2 border-transparent hover:border-rose-500 group overflow-hidden transform hover:-translate-y-1"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-rose-100 to-transparent rounded-bl-full opacity-50 group-hover:opacity-100 transition-opacity" />

            <div className="relative z-10">
              <div className="flex justify-center mb-6">
                <div className="w-20 h-20 bg-gradient-to-br from-rose-100 to-rose-50 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform shadow-md">
                  <Home className="w-10 h-10 text-rose-500" />
                </div>
              </div>

              <h2 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-rose-500 transition-colors">
                Cho thuê ngắn hạn
              </h2>

              <p className="text-gray-600 mb-6 leading-relaxed">
                Cho thuê theo đêm, tuần hoặc tháng. Phù hợp cho du lịch, công tác và lưu trú tạm thời.
              </p>

              <div className="space-y-3">
                <div className="flex items-start">
                  <Check className="w-5 h-5 text-rose-500 mr-3 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700 text-left">Linh hoạt về thời gian lưu trú</span>
                </div>
                <div className="flex items-start">
                  <Check className="w-5 h-5 text-rose-500 mr-3 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700 text-left">Giá cạnh tranh theo đêm</span>
                </div>
                <div className="flex items-start">
                  <Check className="w-5 h-5 text-rose-500 mr-3 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700 text-left">Đặt phòng tức thì & dễ dàng</span>
                </div>
                <div className="flex items-start">
                  <Check className="w-5 h-5 text-rose-500 mr-3 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700 text-left">Thu nhập cao trong mùa cao điểm</span>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-100">
                <div className="flex items-center justify-center text-sm text-gray-500">
                  <span className="font-medium text-rose-500 mr-1">Phổ biến</span>
                  cho du lịch & khách nước ngoài
                </div>
              </div>
            </div>
          </button>

          <button
            onClick={() => {
              setRentalType('LONG_TERM');
              setFormData(prev => ({ ...prev, rentalType: 'LONG_TERM' }));
              setCurrentStep(0);
            }}
            className="relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border-2 border-transparent hover:border-blue-500 group overflow-hidden transform hover:-translate-y-1"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-100 to-transparent rounded-bl-full opacity-50 group-hover:opacity-100 transition-opacity" />

            <div className="relative z-10">
              <div className="flex justify-center mb-6">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-blue-50 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform shadow-md">
                  <Building2 className="w-10 h-10 text-blue-500" />
                </div>
              </div>

              <h2 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-blue-500 transition-colors">
                Cho thuê dài hạn
              </h2>

              <p className="text-gray-600 mb-6 leading-relaxed">
                Cho thuê theo tháng hoặc năm. Phù hợp cho sinh viên, người đi làm và gia đình.
              </p>

              <div className="space-y-3">
                <div className="flex items-start">
                  <Check className="w-5 h-5 text-blue-500 mr-3 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700 text-left">Thu nhập ổn định hàng tháng</span>
                </div>
                <div className="flex items-start">
                  <Check className="w-5 h-5 text-blue-500 mr-3 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700 text-left">Ít tốn công quản lý</span>
                </div>
                <div className="flex items-start">
                  <Check className="w-5 h-5 text-blue-500 mr-3 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700 text-left">Hợp đồng dài hạn an toàn</span>
                </div>
                <div className="flex items-start">
                  <Check className="w-5 h-5 text-blue-500 mr-3 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700 text-left">Khách hàng trung thành</span>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-100">
                <div className="flex items-center justify-center text-sm text-gray-500">
                  <span className="font-medium text-blue-500 mr-1">Lý tưởng</span>
                  cho phòng trọ & căn hộ
                </div>
              </div>
            </div>
          </button>
        </div>

        <div className="mt-12 text-center">
          <p className="text-sm text-gray-500 mb-2">Cần giúp đỡ quyết định?</p>
          <button className="text-sm text-blue-600 hover:text-blue-700 font-medium underline">
            Xem bảng so sánh chi tiết
          </button>
        </div>
      </div>
    </div>
  );

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
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
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
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
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
          onChange={(e) => setFormData(prev => ({ ...prev, categoryId: e.target.value ? Number(e.target.value) : undefined }))}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
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
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
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
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
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
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
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
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
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
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
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
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
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
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all"
          />
          <span className="absolute right-3 top-3 text-gray-400 text-sm">m²</span>
        </div>
        {formData.areaSqft > 0 && formData.areaSqft < 10 && (
          <p className="text-xs text-orange-600 mt-1 flex items-center">
            <Info className="w-3 h-3 mr-1" />
            Diện tích có vẻ nhỏ, vui lòng kiểm tra lại
          </p>
        )}
      </div>

      {rentalType === 'SHORT_TERM' ? (
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
              className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all"
            />
            <DollarSign className="absolute right-3 top-3 w-5 h-5 text-gray-400" />
          </div>
          {formData.pricePerNight && formData.pricePerNight > 0 && (
            <p className="text-sm text-green-600 mt-1 flex items-center">
              <Check className="w-4 h-4 mr-1" />
              ≈ {new Intl.NumberFormat('vi-VN').format(formData.pricePerNight)} VND/đêm
            </p>
          )}
          {(!formData.pricePerNight || formData.pricePerNight <= 0) && (
            <p className="text-sm text-gray-500 mt-1">
              Vui lòng nhập giá thuê (tối thiểu 1 VND)
            </p>
          )}
        </div>
      ) : (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
            <span>Giá mỗi tháng (VND)</span>
            <span className="text-red-500 ml-1">*</span>
            <span className="ml-2 text-xs text-gray-500 font-normal">
              - Giá thuê cơ bản hàng tháng
            </span>
          </label>
          <div className="relative">
            <input
              type="text"
              name="pricePerMonth"
              value={formData.pricePerMonth ? formatCurrency(formData.pricePerMonth.toString()) : ''}
              onChange={handleCurrencyChange}
              placeholder="5.000.000"
              required
              className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
            <DollarSign className="absolute right-3 top-3 w-5 h-5 text-gray-400" />
          </div>
          {formData.pricePerMonth && formData.pricePerMonth > 0 && (
            <p className="text-sm text-green-600 mt-1 flex items-center">
              <Check className="w-4 h-4 mr-1" />
              ≈ {new Intl.NumberFormat('vi-VN').format(formData.pricePerMonth)} VND/tháng
            </p>
          )}
          {(!formData.pricePerMonth || formData.pricePerMonth <= 0) && (
            <p className="text-sm text-gray-500 mt-1">
              Vui lòng nhập giá thuê (tối thiểu 1 VND)
            </p>
          )}
        </div>
      )}

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
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
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
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
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
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
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
            onClick={() => setFormData(prev => ({ ...prev, maxGuests: Math.max(1, prev.maxGuests - 1) }))}
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
            onClick={() => setFormData(prev => ({ ...prev, maxGuests: prev.maxGuests + 1 }))}
            className="w-12 h-12 rounded-xl border-2 border-blue-300 bg-white hover:bg-blue-50 flex items-center justify-center transition-all shadow-sm hover:shadow"
          >
            <span className="text-2xl font-bold text-blue-600">+</span>
          </button>
        </div>
      </div>
    </div>
  );

  // Step 3: Additional Info (depends on rental type)
  const renderAdditionalInfo = () => (
    <div className="space-y-6">
      {rentalType === 'SHORT_TERM' ? (
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
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
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
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
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
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
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
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
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
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
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
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
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
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
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
              className="w-5 h-5 text-rose-500 rounded focus:ring-rose-500"
            />
            <label className="ml-3 text-gray-700">
              Cho phép đặt phòng tức thì
            </label>
          </div>
        </>
      ) : (
        <>
          <h3 className="text-lg font-semibold text-gray-900">Thông tin thuê dài hạn</h3>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tiền cọc (số tháng)
              </label>
              <input
                type="number"
                name="depositMonths"
                value={formData.depositMonths}
                onChange={handleInputChange}
                min="0"
                placeholder="1"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">VD: 1 tháng, 2 tháng</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Thời hạn thuê tối thiểu (tháng)
              </label>
              <input
                type="number"
                name="minimumLeaseMonths"
                value={formData.minimumLeaseMonths}
                onChange={handleInputChange}
                min="1"
                placeholder="3"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-semibold text-gray-900">Chi phí tiện ích</h4>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tiền điện (VND)/kWh
              </label>
              <input
                type="text"
                name="electricityCost"
                value={formData.electricityCost}
                onChange={handleUtilityCostChange}
                placeholder="VD: 3.500đ/kWh, Theo giá điện, 100.000đ/tháng"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tiền nước (VND)
              </label>
              <input
                type="text"
                name="waterCost"
                value={formData.waterCost}
                onChange={handleUtilityCostChange}
                placeholder="VD: 100.000đ/tháng, 20.000đ/người, Miễn phí"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Internet/WiFi (VND)
              </label>
              <input
                type="text"
                name="internetCost"
                value={formData.internetCost}
                onChange={handleUtilityCostChange}
                placeholder="VD: Miễn phí, 100.000đ/tháng"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phí dịch vụ (VND)/ Tháng
            </label>
            <input
              type="text"
              name="serviceFee"
              value={formData.serviceFee ? formatCurrency(formData.serviceFee.toString()) : ''}
              onChange={handleCurrencyChange}
              placeholder="500.000"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">Phí quản lý, bảo trì chung cư...</p>
          </div>
        </>
      )}

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
                className="w-5 h-5 text-rose-500 rounded focus:ring-rose-500"
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
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
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
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-rose-500 transition-colors">
          <div className="flex justify-center mb-4">
            <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
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
            className="px-6 py-2 bg-rose-500 text-white rounded-lg hover:bg-rose-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
                    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 rounded-lg">
                      <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
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
                  <div className="absolute inset-0 bg-black bg-opacity-50 rounded-lg flex items-center justify-center">
                    <div className="text-center text-white">
                      <svg className="animate-spin h-8 w-8 mx-auto mb-2" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      <span className="text-xs">Đang tải...</span>
                    </div>
                  </div>
                )}

                {/* Media Type Badge */}
                {img.mediaType === 'VIDEO_360' && (
                  <span className="absolute bottom-2 left-2 bg-purple-500 text-white text-xs px-2 py-1 rounded font-semibold">
                    360° VIDEO
                  </span>
                )}
                {img.mediaType === 'VIDEO' && (
                  <span className="absolute bottom-2 left-2 bg-blue-500 text-white text-xs px-2 py-1 rounded">
                    VIDEO
                  </span>
                )}

                {/* Primary Badge */}
                {img.isPrimary && (
                  <span className="absolute top-2 left-2 bg-rose-500 text-white text-xs px-2 py-1 rounded">
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
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
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
                <svg className="w-5 h-5 text-yellow-500 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <div className="text-sm text-yellow-700">
                  <p className="font-medium">⏳ Đang upload {formData.images.filter(img => img.uploading).length} file(s)...</p>
                  <p>Vui lòng đợi upload hoàn tất trước khi submit property.</p>
                </div>
              </div>
            </div>
          )}

          {formData.images.some(img => img.imageUrl.startsWith('blob:')) && !formData.images.some(img => img.uploading) && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <div className="flex">
                <svg className="w-5 h-5 text-orange-500 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <div className="text-sm text-orange-700">
                  <p className="font-medium">⚠️ Một số ảnh chưa được upload lên server</p>
                  <p>Có thể do lỗi mạng hoặc backend chưa chạy. Các ảnh này sẽ không được lưu khi submit.</p>
                  <p className="mt-1 font-medium">Giải pháp: Xóa ảnh lỗi và upload lại, hoặc khởi động backend.</p>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex">
          <svg className="w-5 h-5 text-blue-500 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
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

  // Step 6: Package Selection & Payment Config
  const renderPaymentConfig = () => (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-rose-500 to-orange-500 rounded-full mb-4">
          <Crown className="w-10 h-10 text-white" />
        </div>
        <h3 className="text-3xl font-bold text-gray-900 mb-2">
          Chọn Gói Đăng Tin
        </h3>
        <p className="text-gray-600 text-lg">
          Lựa chọn gói phù hợp để tăng hiệu quả cho thuê
        </p>

        {/* Wallet Balance */}
        <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg">
          <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
          </svg>
          <span className="text-sm text-gray-600">Số dư ví:</span>
          <span className="font-bold text-gray-900">{walletBalance.toLocaleString()} ₫</span>
        </div>
      </div>

      {/* Property Summary Card */}
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl p-6 border border-gray-200">
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
                <MapPin className="w-4 h-4 text-gray-500" />
                <span className="text-gray-700">{formData.city || 'Chưa chọn'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-gray-500" />
                <span className="text-gray-700">{formData.propertyType}</span>
              </div>
              <div className="text-gray-700">
                <span className="font-medium">{formData.bedrooms}</span> phòng ngủ •
                <span className="font-medium ml-1">{formData.bathrooms}</span> phòng tắm
              </div>
              <div className="text-rose-600 font-bold text-lg">
                {rentalType === 'SHORT_TERM'
                  ? `${formData.pricePerNight?.toLocaleString()} ₫/đêm`
                  : `${formData.pricePerMonth?.toLocaleString()} ₫/tháng`
                }
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Packages Grid */}
      {loadingPackages ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-rose-500"></div>
          <p className="text-gray-600 mt-4">Đang tải gói đăng tin...</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-3 gap-6">
          {packages.map((pkg) => (
            <div
              key={pkg.id}
              onClick={() => setSelectedPackage(pkg)}
              className={`relative cursor-pointer rounded-2xl border-2 transition-all duration-300 ${
                selectedPackage?.id === pkg.id
                  ? 'border-rose-500 shadow-xl shadow-rose-500/20 scale-105'
                  : 'border-gray-200 hover:border-rose-300 hover:shadow-lg'
              }`}
            >
              {/* Badge */}
              {pkg.badge && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
                  <div className="bg-gradient-to-r from-rose-500 to-orange-500 text-white px-4 py-1 rounded-full text-xs font-bold shadow-lg">
                    {pkg.badge}
                  </div>
                </div>
              )}

              <div className="p-6">
                {/* Package Icon */}
                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl mb-4 ${
                  pkg.priorityLevel >= 3
                    ? 'bg-gradient-to-br from-yellow-400 to-orange-500'
                    : pkg.priorityLevel >= 2
                    ? 'bg-gradient-to-br from-blue-400 to-blue-600'
                    : 'bg-gradient-to-br from-gray-400 to-gray-600'
                }`}>
                  {pkg.priorityLevel >= 3 ? (
                    <Crown className="w-6 h-6 text-white" />
                  ) : pkg.priorityLevel >= 2 ? (
                    <Star className="w-6 h-6 text-white" />
                  ) : (
                    <Zap className="w-6 h-6 text-white" />
                  )}
                </div>

                {/* Package Name */}
                <h4 className="text-xl font-bold text-gray-900 mb-2">{pkg.name}</h4>

                {/* Price */}
                <div className="mb-4">
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-bold text-gray-900">
                      {pkg.price === 0 ? 'Miễn phí' : pkg.price.toLocaleString()}
                    </span>
                    {pkg.price > 0 && <span className="text-gray-600">₫</span>}
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    Thời hạn {pkg.durationDays} ngày
                  </p>
                </div>

                {/* Features */}
                <div className="space-y-3 mb-4">
                  {pkg.features?.map((feature, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>

                {/* Select Button */}
                {selectedPackage?.id === pkg.id && (
                  <div className="absolute top-4 right-4">
                    <div className="w-8 h-8 bg-rose-500 rounded-full flex items-center justify-center">
                      <Check className="w-5 h-5 text-white" />
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Payment Method Selection */}
      {selectedPackage && selectedPackage.price > 0 && (
        <div className="bg-white rounded-2xl p-6 border-2 border-gray-200">
          <h4 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <DollarSign className="w-6 h-6 text-rose-500" />
            Chọn Phương Thức Thanh Toán
          </h4>

          <div className="grid md:grid-cols-3 gap-4">
            {/* Bank Transfer */}
            <div
              onClick={() => setPaymentMethod('BANK_TRANSFER')}
              className={`cursor-pointer rounded-xl border-2 p-4 transition-all ${
                paymentMethod === 'BANK_TRANSFER'
                  ? 'border-rose-500 bg-rose-50'
                  : 'border-gray-200 hover:border-rose-300'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-gray-900">Chuyển khoản</span>
                {paymentMethod === 'BANK_TRANSFER' && (
                  <Check className="w-5 h-5 text-rose-500" />
                )}
              </div>
              <p className="text-sm text-gray-600">Chuyển khoản ngân hàng</p>
            </div>

            {/* Momo */}
            <div
              onClick={() => setPaymentMethod('MOMO')}
              className={`cursor-pointer rounded-xl border-2 p-4 transition-all ${
                paymentMethod === 'MOMO'
                  ? 'border-rose-500 bg-rose-50'
                  : 'border-gray-200 hover:border-rose-300'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-gray-900">Momo</span>
                {paymentMethod === 'MOMO' && (
                  <Check className="w-5 h-5 text-rose-500" />
                )}
              </div>
              <p className="text-sm text-gray-600">Ví điện tử Momo</p>
            </div>

            {/* VNPay */}
            <div
              onClick={() => setPaymentMethod('VNPAY')}
              className={`cursor-pointer rounded-xl border-2 p-4 transition-all ${
                paymentMethod === 'VNPAY'
                  ? 'border-rose-500 bg-rose-50'
                  : 'border-gray-200 hover:border-rose-300'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-gray-900">VNPay</span>
                {paymentMethod === 'VNPAY' && (
                  <Check className="w-5 h-5 text-rose-500" />
                )}
              </div>
              <p className="text-sm text-gray-600">Cổng thanh toán VNPay</p>
            </div>
          </div>

          {/* Payment Instructions for Bank Transfer */}
          {paymentMethod === 'BANK_TRANSFER' && (
            <div className="mt-4 bg-blue-50 border border-blue-200 rounded-xl p-4">
              <h5 className="font-semibold text-blue-900 mb-2">Thông tin chuyển khoản</h5>
              <div className="space-y-1 text-sm text-blue-800">
                <p><span className="font-medium">Ngân hàng:</span> Vietcombank</p>
                <p><span className="font-medium">Số tài khoản:</span> 1234567890</p>
                <p><span className="font-medium">Chủ tài khoản:</span> STAYEASE COMPANY</p>
                <p><span className="font-medium">Số tiền:</span> {selectedPackage.price.toLocaleString()} ₫</p>
                <p><span className="font-medium">Nội dung:</span> THANHTOAN [Mã giao dịch sẽ được tạo]</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Order Summary */}
      {selectedPackage && (
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-6 border border-gray-200">
          <h4 className="text-xl font-bold text-gray-900 mb-4">Tóm tắt đơn hàng</h4>

          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Gói đã chọn:</span>
              <span className="font-semibold text-gray-900">{selectedPackage.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Thời hạn:</span>
              <span className="font-semibold text-gray-900">{selectedPackage.durationDays} ngày</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Phương thức thanh toán:</span>
              <span className="font-semibold text-gray-900">Ví StayEase</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Số dư hiện tại:</span>
              <span className="font-semibold text-gray-900">{walletBalance.toLocaleString()} ₫</span>
            </div>
            <div className="border-t border-gray-300 pt-3 mt-3">
              <div className="flex justify-between items-baseline">
                <span className="text-lg font-bold text-gray-900">Tổng cộng:</span>
                <div className="text-right">
                  <span className="text-3xl font-bold text-rose-600">
                    {selectedPackage.price === 0 ? 'Miễn phí' : selectedPackage.price.toLocaleString()}
                  </span>
                  {selectedPackage.price > 0 && <span className="text-rose-600 ml-1">₫</span>}
                </div>
              </div>
            </div>
          </div>

          {/* Balance Warning */}
          {selectedPackage.price > 0 && walletBalance < selectedPackage.price && (
            <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <div className="text-sm text-red-700">
                  <p className="font-semibold mb-1">Số dư không đủ!</p>
                  <p>Bạn cần thêm {(selectedPackage.price - walletBalance).toLocaleString()} ₫ vào ví để đăng tin với gói này.</p>
                  <a href="/wallet" className="inline-block mt-2 text-red-800 font-semibold underline hover:text-red-900">
                    → Nạp tiền vào ví
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Info Notice */}
      <div className={`border rounded-xl p-4 ${
        selectedPackage && selectedPackage.price > 0 && walletBalance < selectedPackage.price
          ? 'bg-yellow-50 border-yellow-200'
          : 'bg-green-50 border-green-200'
      }`}>
        <div className="flex gap-3">
          <svg className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
            selectedPackage && selectedPackage.price > 0 && walletBalance < selectedPackage.price
              ? 'text-yellow-500'
              : 'text-green-500'
          }`} fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          <div className={`text-sm ${
            selectedPackage && selectedPackage.price > 0 && walletBalance < selectedPackage.price
              ? 'text-yellow-700'
              : 'text-green-700'
          }`}>
            <p className="font-semibold mb-1">
              {selectedPackage && selectedPackage.price > 0 && walletBalance < selectedPackage.price
                ? 'Cần nạp thêm tiền!'
                : 'Sẵn sàng đăng tin!'
              }
            </p>
            <p>
              {selectedPackage && selectedPackage.price > 0 && walletBalance < selectedPackage.price
                ? `Vui lòng nạp thêm ${(selectedPackage.price - walletBalance).toLocaleString()} ₫ vào ví trước khi đăng tin.`
                : selectedPackage
                ? `Nhấn "Hoàn tất" để tạo tin đăng. ${selectedPackage.price === 0 ? 'Tin sẽ được kích hoạt ngay và xét duyệt trong 24h.' : `Tiền sẽ tự động trừ từ ví (${selectedPackage.price.toLocaleString()} ₫) và tin đăng được kích hoạt ngay lập tức.`}`
                : 'Vui lòng chọn một gói đăng tin để tiếp tục.'
              }
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  const steps = [
    { title: 'Địa chỉ', render: renderLocation },
    { title: 'Thông tin chính', render: renderMainInfo },
    { title: 'Thông tin bổ sung', render: renderAdditionalInfo },
    { title: 'Tiêu đề & Mô tả', render: renderTitleDescription },
    { title: 'Hình ảnh & Video', render: renderImages },
    { title: 'Cấu hình & Thanh toán', render: renderPaymentConfig },
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 0: // Location
        return formData.address && formData.city && formData.country;
      case 1: // Main Info
        return formData.propertyType && formData.areaSqft > 0 &&
               (rentalType === 'SHORT_TERM'
                 ? (formData.pricePerNight !== undefined && formData.pricePerNight > 0)
                 : (formData.pricePerMonth !== undefined && formData.pricePerMonth > 0)) &&
               formData.maxGuests > 0 && formData.bedrooms >= 0 && formData.beds >= 0 && formData.bathrooms >= 0;
      case 2: // Additional Info - always allow
        return true;
      case 3: // Title & Description
        return formData.title && formData.description;
      case 4: // Images - optional
        return true;
      case 5: // Package Selection & Payment
        // Require package selection
        if (!selectedPackage) return false;
        // If package is not free, require payment method
        if (selectedPackage.price > 0 && !paymentMethod) return false;
        return true;
      default:
        return true;
    }
  };

  // Show rental type selection if not selected yet
  if (rentalType === null) {
    return renderRentalTypeSelection();
  }

  // Main step-by-step form
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-white shadow-md sticky top-0 z-50 border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4">
          {/* Success/Error Messages */}
          {successMessage && (
            <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start animate-fade-in">
              <Check className="w-5 h-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-green-800 font-medium">{successMessage}</p>
              </div>
            </div>
          )}

          {errorMessage && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start animate-fade-in">
              <Info className="w-5 h-5 text-red-600 mr-3 mt-0.5 flex-shrink-0" />
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
            <button
              onClick={() => {
                if (currentStep === 0) {
                  setRentalType(null);
                } else {
                  handlePrevious();
                }
              }}
              className="flex items-center text-gray-600 hover:text-gray-900 transition-colors group px-3 py-2 rounded-lg hover:bg-gray-100"
            >
              <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
              <span className="font-medium">Quay lại</span>
            </button>

            <div className="text-center flex-1 mx-4">
              <div className="flex items-center justify-center mb-1">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-2 ${
                  rentalType === 'SHORT_TERM' ? 'bg-rose-100 text-rose-600' : 'bg-blue-100 text-blue-600'
                }`}>
                  <span className="text-sm font-bold">{currentStep + 1}</span>
                </div>
                <h1 className="text-xl font-bold text-gray-900">
                  {steps[currentStep].title}
                </h1>
              </div>
              <p className="text-sm text-gray-500">
                Bước {currentStep + 1} trên tổng {steps.length} bước
              </p>
            </div>

            <button
              onClick={() => {
                if (window.confirm('Bạn có chắc muốn thoát? Dữ liệu chưa lưu sẽ bị mất.')) {
                  navigate('/host');
                }
              }}
              className="text-gray-600 hover:text-red-600 transition-colors px-3 py-2 rounded-lg hover:bg-red-50 font-medium"
            >
              Thoát
            </button>
          </div>

          {/* Enhanced Progress bar with step dots */}
          <div className="relative">
            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
              <div
                className={`h-2 rounded-full transition-all duration-500 ease-out ${
                  rentalType === 'SHORT_TERM' 
                    ? 'bg-gradient-to-r from-rose-400 to-rose-600' 
                    : 'bg-gradient-to-r from-blue-400 to-blue-600'
                }`}
                style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
              />
            </div>

            {/* Step dots */}
            <div className="absolute top-0 left-0 w-full flex justify-between px-1" style={{ marginTop: '-5px' }}>
              {steps.map((step, index) => (
                <div
                  key={index}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    index <= currentStep
                      ? rentalType === 'SHORT_TERM'
                        ? 'bg-rose-500 scale-125 shadow-lg'
                        : 'bg-blue-500 scale-125 shadow-lg'
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
                className={`flex-1 text-center transition-colors ${
                  index === currentStep
                    ? rentalType === 'SHORT_TERM'
                      ? 'text-rose-600 font-semibold'
                      : 'text-blue-600 font-semibold'
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
        <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-10 border border-gray-100 transform transition-all duration-300 hover:shadow-2xl">
          {/* Step icon and description */}
          <div className="mb-6 pb-6 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  rentalType === 'SHORT_TERM' 
                    ? 'bg-gradient-to-br from-rose-100 to-rose-50' 
                    : 'bg-gradient-to-br from-blue-100 to-blue-50'
                }`}>
                  {currentStep === 0 && <MapPin className={`w-6 h-6 ${rentalType === 'SHORT_TERM' ? 'text-rose-600' : 'text-blue-600'}`} />}
                  {currentStep === 1 && <Info className={`w-6 h-6 ${rentalType === 'SHORT_TERM' ? 'text-rose-600' : 'text-blue-600'}`} />}
                  {currentStep === 2 && <Sparkles className={`w-6 h-6 ${rentalType === 'SHORT_TERM' ? 'text-rose-600' : 'text-blue-600'}`} />}
                  {currentStep === 3 && <Info className={`w-6 h-6 ${rentalType === 'SHORT_TERM' ? 'text-rose-600' : 'text-blue-600'}`} />}
                  {currentStep === 4 && <Camera className={`w-6 h-6 ${rentalType === 'SHORT_TERM' ? 'text-rose-600' : 'text-blue-600'}`} />}
                  {currentStep === 5 && <DollarSign className={`w-6 h-6 ${rentalType === 'SHORT_TERM' ? 'text-rose-600' : 'text-blue-600'}`} />}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{steps[currentStep].title}</h2>
                  <p className="text-sm text-gray-500">
                    {currentStep === 0 && 'Cho chúng tôi biết vị trí bất động sản của bạn'}
                    {currentStep === 1 && 'Thông tin cơ bản về căn hộ'}
                    {currentStep === 2 && 'Các tiện ích và chính sách đi kèm'}
                    {currentStep === 3 && 'Tạo tiêu đề hấp dẫn và mô tả chi tiết'}
                    {currentStep === 4 && 'Thêm hình ảnh để thu hút khách hàng'}
                    {currentStep === 5 && 'Xem lại thông tin và hoàn tất'}
                  </p>
                </div>
              </div>
              {!canProceed() && currentStep < 3 && (
                <div className="hidden sm:flex items-center text-orange-600 text-sm">
                  <Info className="w-4 h-4 mr-1" />
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
            className="w-full sm:w-auto px-8 py-3 border-2 border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-50 hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center group"
          >
            <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
            Quay lại
          </button>

          <div className="hidden sm:block text-sm text-gray-500">
            {canProceed() ? (
              <span className="flex items-center text-green-600">
                <Check className="w-4 h-4 mr-1" />
                Sẵn sàng tiếp tục
              </span>
            ) : currentStep < 3 ? (
              <span className="flex items-center text-orange-600">
                <Info className="w-4 h-4 mr-1" />
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
              className={`w-full sm:w-auto px-8 py-3 rounded-xl text-white font-bold shadow-lg transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center group ${
                rentalType === 'SHORT_TERM'
                  ? 'bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700'
                  : 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700'
              }`}
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Đang xử lý...
                </>
              ) : (
                <>
                  <Check className="w-5 h-5 mr-2" />
                  Đăng tin ngay
                  <Sparkles className="w-4 h-4 ml-2 group-hover:rotate-12 transition-transform" />
                </>
              )}
            </button>
          ) : (
            <button
              onClick={handleNext}
              disabled={!canProceed()}
              className={`w-full sm:w-auto px-8 py-3 rounded-xl text-white font-bold shadow-lg transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center group ${
                rentalType === 'SHORT_TERM'
                  ? 'bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700'
                  : 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700'
              }`}
            >
              Tiếp theo
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </button>
          )}
        </div>

        {/* Progress indicator text */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            {currentStep < steps.length - 1 ? (
              <>Còn <span className="font-bold text-gray-700">{steps.length - currentStep - 1}</span> bước nữa để hoàn thành</>
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

