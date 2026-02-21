import api from './api';

/**
 * Products Service — اتصال به API محصولات
 */
export const productsService = {
  /**
   * دریافت لیست محصولات
   * @param {Object} params - { search, style, isActive, page, limit }
   */
  getAll: async (params = {}) => {
    const response = await api.get('/products', { params });
    return response.data;
  },

  /**
   * آمار کلی محصولات
   */
  getStats: async () => {
    const response = await api.get('/products/stats');
    return response.data;
  },
};

export default productsService;
