import api from './api';

/**
 * Workflow Service — اتصال به API گردش کار
 */
export const workflowService = {
  /**
   * دریافت لیست سفارشات با وضعیت workflow
   * @param {Object} params - { status }
   */
  getList: async (params = {}) => {
    const response = await api.get('/workflow', { params });
    return response.data;
  },

  /**
   * دریافت گردش کار یک سفارش مشخص
   * @param {number} orderId
   */
  getByOrder: async (orderId) => {
    const response = await api.get(`/workflow/${orderId}`);
    return response.data;
  },

  /**
   * بروزرسانی مرحله گردش کار
   * @param {number} orderId
   * @param {Object} data - { stockFabric, stockProduction, stockWash, stockPackaging, ... }
   */
  update: async (orderId, data) => {
    const response = await api.put(`/workflow/${orderId}`, data);
    return response.data;
  },
};

export default workflowService;
