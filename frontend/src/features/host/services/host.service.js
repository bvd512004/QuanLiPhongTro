import axiosClient from '../../../shared/services/axiosClient';

const asObject = (value) => (value && typeof value === 'object' ? value : {});

const pickData = (response) => {
    if (Array.isArray(response)) return response;
    if (response && typeof response === 'object' && 'data' in response) return response.data;
    return response;
};

const extractItems = (response) => {
    if (Array.isArray(response)) return response;

    const data = pickData(response);
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.items)) return data.items;
    if (Array.isArray(data?.content)) return data.content;

    if (Array.isArray(response?.items)) return response.items;
    if (Array.isArray(response?.content)) return response.content;

    return [];
};

const normalizeBaseResponse = (response) => {
    const hasExplicitSuccess = typeof response?.success === 'boolean';
    return {
        success: hasExplicitSuccess ? response.success : true,
        message: response?.message || '',
        data: pickData(response),
        raw: response,
    };
};

const normalizeListResponse = (response) => {
    const base = normalizeBaseResponse(response);
    return {
        ...base,
        items: extractItems(response),
    };
};

const normalizePagedResponse = (response) => {
    const base = normalizeBaseResponse(response);
    const meta = asObject(base.data);
    const items = extractItems(response);

    const page = Number(meta.page ?? 0);
    const totalItems = Number(meta.totalItems ?? meta.totalElements ?? items.length);

    return {
        ...base,
        items,
        page,
        size: Number(meta.size ?? items.length),
        totalItems,
        totalPages: Number(meta.totalPages ?? (totalItems > 0 ? 1 : 0)),
        first: typeof meta.first === 'boolean' ? meta.first : page <= 0,
        last: typeof meta.last === 'boolean' ? meta.last : true,
    };
};

const hostService = {

    getPropertyById: async (id) => {
        const response = await axiosClient.get(`/properties/my-properties/${id}`);
        return normalizeBaseResponse(response);
    },
    updateProperty: async (id, data) => {
        const response = await axiosClient.put(`/properties/${id}`, data);
        return normalizeBaseResponse(response);
    },
    getMyProperties: async (page = 0, size = 12) => {
        const response = await axiosClient.get(`/properties/my-properties?page=${page}&size=${size}`);
        return normalizePagedResponse(response);
    },
    updatePropertyStatus: async (id, status) => {
        const response = await axiosClient.put(`/properties/${id}/status`, { status });
        return normalizeBaseResponse(response);
    },
    deleteProperty: async (id) => {
        const response = await axiosClient.delete(`/properties/${id}`);
        return normalizeBaseResponse(response);
    },
    createProperty: async (data) => {
        const response = await axiosClient.post('/properties', data);
        return normalizeBaseResponse(response);
    },
    getAllActivePackages: async () => {
        const token = localStorage.getItem('token');
        const response = await fetch(`${axiosClient.defaults.baseURL}/packages`, {
            headers: {
                ...(token && { Authorization: `Bearer ${token}` }),
            },
        });
        if (!response.ok) {
            throw new Error('Failed to fetch packages');
        }
        return normalizeListResponse(await response.json());
    },
    createSubscription: async (request) => {
        const token = localStorage.getItem('token');
        const response = await fetch(`${axiosClient.defaults.baseURL}/packages/subscribe`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...(token && { Authorization: `Bearer ${token}` }),
            },
            body: JSON.stringify(request),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to create subscription');
        }
        return normalizeBaseResponse(await response.json());
    },
    getCategories: async () => {
        const response = await axiosClient.get('/categories');
        return normalizeListResponse(response);
    },

    // Amenities API
    getAmenities: async () => {
        const response = await axiosClient.get('/amenities');
        return normalizeListResponse(response);
    },
    // File Upload APIs
    async uploadFileWithProgress(url, formData, onProgress) {
        const response = await axiosClient.post(url, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
            onUploadProgress: (progressEvent) => {
                if (!onProgress || !progressEvent.total) return;
                const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                onProgress(progress);
            },
        });

        return normalizeBaseResponse(response);
    },
    async uploadImage(file, onProgress) {
        const formData = new FormData();
        formData.append('file', file);

        return this.uploadFileWithProgress('/files/upload-image', formData, onProgress);
    },
    async uploadVideo(file, onProgress) {
        const formData = new FormData();
        formData.append('file', file);

        return this.uploadFileWithProgress('/files/upload-video', formData, onProgress);
    },
    async uploadDocument(file, onProgress) {
        const formData = new FormData();
        formData.append('file', file);

        return this.uploadFileWithProgress('/files/upload-document', formData, onProgress);
    },
    confirmPayment: async (transactionId) => {
        const token = localStorage.getItem('token');
        const response = await fetch(`${axiosClient.defaults.baseURL}/packages/confirm-payment/${transactionId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                ...(token && { Authorization: `Bearer ${token}` }),
            },
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to confirm payment');
        }
        return normalizeBaseResponse(await response.json());
    },
    getHostBookings: async (page = 0, size = 10) => {
        const response = await axiosClient.get(`/bookings/host-bookings?page=${page}&size=${size}`);
        return normalizePagedResponse(response);
    },
    getMonthlyRevenue: async (year) => {
        const queryString = year ? `?year=${year}` : '';
        const response = await axiosClient.get(`/dashboard/monthly-revenue${queryString}`);
        return normalizeListResponse(response);
    },
    getDashboardStats: async () => {
        const response = await axiosClient.get('/dashboard/stats');
        return normalizeBaseResponse(response);
    },
    confirmBooking: async (bookingId) => {
        const response = await axiosClient.put(`/bookings/${bookingId}/confirm`);
        return normalizeBaseResponse(response);
    },
    cancelBooking: async (bookingId, reason) => {
        const url = reason
            ? `/bookings/${bookingId}/cancel?reason=${encodeURIComponent(reason)}`
            : `/bookings/${bookingId}/cancel`;
        const response = await axiosClient.put(url);
        return normalizeBaseResponse(response);
    },
    getHostBookingCalendar: async (year, month) => {
        const params = new URLSearchParams();
        if (year) params.append('year', String(year));
        if (month) params.append('month', String(month));
        const queryString = params.toString() ? `?${params.toString()}` : '';
        const response = await axiosClient.get(`/bookings/host-calendar${queryString}`);
        return normalizeBaseResponse(response);
    },
    getHostBookingStats: async () => {
        const response = await axiosClient.get('/bookings/host-stats');
        return normalizeBaseResponse(response);
    },
    getHostReviews: async ({ page = 0, size = 10, propertyId, rating } = {}) => {
        const params = new URLSearchParams();
        params.append('page', String(page));
        params.append('size', String(size));
        if (propertyId) params.append('propertyId', String(propertyId));
        if (rating) params.append('rating', String(rating));

        const response = await axiosClient.get(`/reviews/my-reviews?${params.toString()}`);
        return normalizePagedResponse(response);
    },
    replyToReview: async (reviewId, hostResponse) => {
        const response = await axiosClient.put(`/reviews/${reviewId}/host-response`, { hostResponse });
        return normalizeBaseResponse(response);
    },


};

export default hostService;

