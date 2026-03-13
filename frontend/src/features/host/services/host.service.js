import axiosClient from '../../../shared/services/axiosClient';
const hostService = {

    getPropertyById: async (id) => {
        const response = await axiosClient.get(`/properties/${id}`);
        return response.data;
    },
    getMyProperties: async (page = 0, size = 12) => {
        const response = await axiosClient.get(`/properties/my?page=${page}&size=${size}`);
        return response.data;
    },
    updatePropertyStatus: async (id, status) => {
        const response = await axiosClient.put(`/properties/${id}/status`, { status });
        return response.data;
    },
    deleteProperty: async (id) => {
        const response = await axiosClient.delete(`/properties/${id}`);
        return response.data;
    },
    createProperty: async (data) => {
        const response = await axiosClient.post('/properties', data);
        return response.data;
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
        return response.data;
    },

    // Amenities API
    getAmenities: async () => {
        const response = await axiosClient.get('/amenities');
        return response.data;
    },
    // File Upload APIs
    uploadImage: async (file, onProgress) => {
        const formData = new FormData();
        formData.append('file', file);

        return this.uploadFileWithProgress('/files/upload-image', formData, onProgress);
    },
    async uploadVideo(file, onProgress) {
        const formData = new FormData();
        formData.append('file', file);

        return this.uploadFileWithProgress('/files/upload-video', formData, onProgress);
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
        return response.data;
    },
    getMonthlyRevenue: async (year) => {
        const queryString = year ? `?year=${year}` : '';
        const response = await axiosClient.get(`/dashboard/monthly-revenue${queryString}`);
        return response.data;
    },
    getDashboardStats: async () => {
        const response = await axiosClient.get('/dashboard/stats');
        return response.data;
    },
    confirmBooking: async (bookingId) => {
        const response = await axiosClient.put(`/bookings/${bookingId}/confirm`);
        return response.data;
    },
    cancelBooking: async (bookingId, reason) => {
        const url = reason
            ? `/bookings/${bookingId}/cancel?reason=${encodeURIComponent(reason)}`
            : `/bookings/${bookingId}/cancel`;
        const response = await axiosClient.put(url);
        return response.data;
    },
    getHostBookingCalendar: async (year, month) => {
        const params = new URLSearchParams();
        if (year) params.append('year', String(year));
        if (month) params.append('month', String(month));
        const queryString = params.toString() ? `?${params.toString()}` : '';
        const response = await axiosClient.get(`/bookings/host-calendar${queryString}`);
        return response.data;
    },
    getHostBookingStats: async () => {
        const response = await axiosClient.get('/bookings/host-stats');
        return response.data;
    }
    


};

export default hostService;