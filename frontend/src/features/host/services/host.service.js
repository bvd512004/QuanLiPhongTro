import axiosClient from '../../../shared/services/axiosClient';
const hostService = {

    getPropertyById: async (id) => {
        const response = await axiosClient.get(`/properties/${id}`);
        return response;
    },
    updateProperty: async (id, data) => {
        const response = await axiosClient.put(`/properties/${id}`, data);
        return response;
    },
    getMyProperties: async (page = 0, size = 12) => {
        const response = await axiosClient.get(`/properties/my-properties?page=${page}&size=${size}`);
        return response;
    },
    updatePropertyStatus: async (id, status) => {
        const response = await axiosClient.put(`/properties/${id}/status`, { status });
        return response;
    },
    deleteProperty: async (id) => {
        const response = await axiosClient.delete(`/properties/${id}`);
        return response;
    },
    createProperty: async (data) => {
        const response = await axiosClient.post('/properties', data);
        return response;
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
        return response.json();
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
        })

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to create subscription');
        }
        return response.json();
    },
    getCategories: async () => {
        const response = await axiosClient.get('/categories');
        return response;
    },

    // Amenities API
    getAmenities: async () => {
        const response = await axiosClient.get('/amenities');
        return response;
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

        return response;
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
        return response.json();
    },
    getHostBookings: async (page = 0, size = 10) => {
        const response = await axiosClient.get(`/bookings/host-bookings?page=${page}&size=${size}`);
        return response;
    },
    getMonthlyRevenue: async (year) => {
        const queryString = year ? `?year=${year}` : '';
        const response = await axiosClient.get(`/dashboard/monthly-revenue${queryString}`);
        return response;
    },
    getDashboardStats: async () => {
        const response = await axiosClient.get('/dashboard/stats');
        return response;
    },
    confirmBooking: async (bookingId) => {
        const response = await axiosClient.put(`/bookings/${bookingId}/confirm`);
        return response;
    },
    cancelBooking: async (bookingId, reason) => {
        const url = reason
            ? `/bookings/${bookingId}/cancel?reason=${encodeURIComponent(reason)}`
            : `/bookings/${bookingId}/cancel`;
        const response = await axiosClient.put(url);
        return response;
    },
    getHostBookingCalendar: async (year, month) => {
        const params = new URLSearchParams();
        if (year) params.append('year', String(year));
        if (month) params.append('month', String(month));
        const queryString = params.toString() ? `?${params.toString()}` : '';
        const response = await axiosClient.get(`/bookings/host-calendar${queryString}`);
        return response;
    },
    getHostBookingStats: async () => {
        const response = await axiosClient.get('/bookings/host-stats');
        return response;
    },
    getHostReviews: async ({ page = 0, size = 10, propertyId, rating } = {}) => {
        const params = new URLSearchParams();
        params.append('page', String(page));
        params.append('size', String(size));
        if (propertyId) params.append('propertyId', String(propertyId));
        if (rating) params.append('rating', String(rating));

        const response = await axiosClient.get(`/reviews/my-reviews?${params.toString()}`);
        return response;
    },
    replyToReview: async (reviewId, hostResponse) => {
        const response = await axiosClient.put(`/reviews/${reviewId}/host-response`, { hostResponse });
        return response;
    }


};

export default hostService;