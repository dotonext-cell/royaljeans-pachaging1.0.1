import axios from 'axios';
import { formatRelativeTime } from '../utils/jalali';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export const notificationService = {
  /**
   * دریافت لیست اعلانات کاربر
   */
  async getAll() {
    try {
      const response = await axios.get(`${API_URL}/notifications`);
      return response.data;
    } catch (error) {
      console.error('Error fetching notifications:', error);
      // Return mock data as fallback
      return this.getMockData();
    }
  },

  /**
   * مارک کردن اعلان به عنوان خوانده شده
   */
  async markAsRead(id) {
    try {
      await axios.put(`${API_URL}/notifications/${id}/read`);
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  },

  /**
   * مارک کردن همه اعلانات به عنوان خوانده شده
   */
  async markAllAsRead() {
    try {
      await axios.put(`${API_URL}/notifications/read-all`);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  },

  /**
   * حذف اعلان
   */
  async delete(id) {
    try {
      await axios.delete(`${API_URL}/notifications/${id}`);
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  },

  /**
   * داده‌های نمونه برای تست (fallback)
   */
  getMockData() {
    return [
      {
        id: 1,
        type: 'warning',
        icon: 'alert',
        title: 'هشدار موجودی',
        message: 'موجودی نخ دوخت زیر حد مجاز رسیده',
        time: new Date(Date.now() - 5 * 60 * 1000),
        read: false,
      },
      {
        id: 2,
        type: 'success',
        icon: 'check',
        title: 'سفارش تکمیل شد',
        message: 'سفارش RJ-1021 با موفقیت تحویل داده شد',
        time: new Date(Date.now() - 30 * 60 * 1000),
        read: false,
      },
      {
        id: 3,
        type: 'info',
        icon: 'clock',
        title: 'یادآوری تحویل',
        message: 'سفارش RJ-1024 تاریخ تحویل امروز است',
        time: new Date(Date.now() - 60 * 60 * 1000),
        read: false,
      },
      {
        id: 4,
        type: 'info',
        icon: 'trending',
        title: 'گزارش آماده',
        message: 'گزارش ماهانه آماده شده است',
        time: new Date(Date.now() - 2 * 60 * 60 * 1000),
        read: false,
      },
    ];
  },

  /**
   * تبدیل داده‌های اعلان به فرمت نمایشی
   */
  formatNotification(notif) {
    const iconMap = {
      alert: { name: 'AlertCircle', color: '#ef4444', bg: 'rgba(239,68,68,0.15)' },
      check: { name: 'CheckCircle', color: '#10b981', bg: 'rgba(16,185,129,0.15)' },
      clock: { name: 'Clock', color: '#f59e0b', bg: 'rgba(245,158,11,0.15)' },
      trending: { name: 'TrendingUp', color: '#3b82f6', bg: 'rgba(59,130,246,0.15)' },
    };

    const icon = iconMap[notif.icon] || iconMap.alert;

    return {
      ...notif,
      icon: icon.name,
      iconColor: icon.color,
      iconBg: icon.bg,
      relativeTime: formatRelativeTime(notif.time),
    };
  },
};
