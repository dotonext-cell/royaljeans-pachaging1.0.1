import api from './api';

/**
 * Finance Service — اتصال به API مالی
 */
export const financeService = {
  /**
   * خلاصه وضعیت مالی و چارت ماهانه
   */
  getSummary: async () => {
    const response = await api.get('/finance/summary');
    return response.data;
  },

  /**
   * لیست سفارشات برای ماژول مالی
   * @param {Object} params - { page, limit, status, dateFrom, dateTo }
   */
  getOrders: async (params = {}) => {
    const response = await api.get('/finance/orders', { params });
    return response.data;
  },
};

export default financeService;
