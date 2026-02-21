import api from './api';

/**
 * Dashboard Service — اتصال به API داشبورد
 * GET /api/dashboard/stats
 */
export const dashboardService = {
  /**
   * دریافت آمار کلی داشبورد از دیتابیس
   */
  getStats: async () => {
    const response = await api.get('/dashboard/stats');
    return response.data;
  },
};

export default dashboardService;
