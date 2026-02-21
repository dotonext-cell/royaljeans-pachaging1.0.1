import api from './api';

/**
 * Inventory Service — اتصال به API انبارداری
 */
export const inventoryService = {
  /**
   * خلاصه موجودی کل
   */
  getSummary: async () => {
    const response = await api.get('/inventory/summary');
    return response.data;
  },

  /**
   * موجودی هر سفارش (لیست)
   * @param {Object} params - { page, limit, search, lowStock }
   */
  getStock: async (params = {}) => {
    const response = await api.get('/inventory/stock', { params });
    return response.data;
  },

  /**
   * موجودی ملزومات
   */
  getAccessories: async () => {
    const response = await api.get('/inventory/accessories');
    return response.data;
  },

  /**
   * تاریخچه گردش انبار
   * @param {Object} params - { page, limit }
   */
  getMovement: async (params = {}) => {
    const response = await api.get('/inventory/movement', { params });
    return response.data;
  },
};

export default inventoryService;
