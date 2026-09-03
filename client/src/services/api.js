import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const getProducts = async () => {
  const response = await api.get('/products');
  return response.data;
};

export const createProduct = async (productData) => {
  const response = await api.post('/products', productData);
  return response.data;
};

export const getOrders = async () => {
  const response = await api.get('/orders');
  return response.data;
};

export const getStoreStats = async () => {
  const response = await api.get('/orders/stats');
  return response.data;
};

export const getCartRecommendation = async (cartItems) => {
  const response = await api.post('/recommend', { cartItems });
  return response.data;
};

export const getMerchantInsight = async (question = '') => {
  const response = await api.post('/insight', { question });
  return response.data;
};

export const createPaymentOrder = async (orderPayload) => {
  const response = await api.post('/create-order', orderPayload);
  return response.data;
};

export const verifyPayment = async (verificationPayload) => {
  const response = await api.post('/verify-payment', verificationPayload);
  return response.data;
};

export default api;
