import axios from 'axios';

// For development, we assume FastAPI is running on port 8001 locally
const API_URL = import.meta.env.VITE_API_URL || 'https://aienergy-backend-ym356.azurewebsites.net/api';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add a request interceptor to attach the JWT token to every request
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => Promise.reject(error));

// Add a response interceptor to handle 401 Unauthorized errors globally
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            // Token is invalid or expired
            localStorage.removeItem('token');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export const authService = {
    login: async (username, password) => {
        const formData = new URLSearchParams();
        formData.append('username', username);
        formData.append('password', password);
        const response = await api.post('/auth/login', formData, {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        });
        return response.data;
    },
    register: async (username, password) => {
        const response = await api.post('/auth/register', { username, password });
        return response.data;
    }
};

export const analyticsAPI = {
    getSummary: () => api.get('/analytics/summary'),
    getHourly: () => api.get('/analytics/hourly'),
    getAppliances: () => api.get('/analytics/appliances'),
};

export const mlAPI = {
    predictEnergy: (appliance, dateTime) =>
        api.post('/ml/predict', { appliance, target_date: dateTime }),
    checkAnomaly: (appliance, kwhUsage, hour) =>
        api.post('/ml/check-anomaly', { appliance, current_kwh: kwhUsage, hour }),
};

export default api;
