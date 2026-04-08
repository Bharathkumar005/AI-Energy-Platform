import axios from 'axios';

// For development, we assume FastAPI is running on port 8001 locally
const API_URL = import.meta.env.VITE_API_URL || 'https://ai-energy-backend-e6g3h8a2eqckeph2.southeastasia-01.azurewebsites.net/api';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

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
