import axios from 'axios';

const BASE_URL = 'http://localhost:4000';
const USER_ID = 3;

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    console.error('API Error:', err.message);
    return Promise.reject(err);
  }
);

export const fetchSummary = () =>
  api.get(`/api/dashboard/summary/${USER_ID}`).then((r) => r.data);

export const fetchMonthlyBreakdown = () =>
  api.get(`/api/dashboard/monthly/${USER_ID}`).then((r) => r.data);

export const fetchCategoryBreakdown = () =>
  api.get(`/api/dashboard/categories/${USER_ID}`).then((r) => r.data);

export const fetchRecentTransactions = (limit = 8) =>
  api.get(`/api/transactions/${USER_ID}?limit=${limit}`).then((r) => r.data);

export const fetchAllTransactions = (params = {}) => {
  const query = new URLSearchParams({ ...params, userId: USER_ID }).toString();
  return api.get(`/api/transactions/${USER_ID}?${query}`).then((r) => r.data);
};

export const askAdvisor = (message, conversationHistory = []) =>
  api.post('/api/advisor/chat', {
    userId: USER_ID,
    message,
    conversationHistory,
  }).then((r) => r.data);

export const fetchInsights = () =>
  api.get(`/api/advisor/insights/${USER_ID}`).then((r) => r.data);

export default api;