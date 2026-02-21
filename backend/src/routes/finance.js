const express = require('express');
const router = express.Router();
const prisma = require('../utils/prisma');
const { authenticateToken, authorize } = require('../middleware/auth');

/**
 * Finance — مالی و پرداخت‌ها
 * در Schema فعلی جدول مستقل پرداخت وجود ندارد.
 * این endpoint آمار مالی را از داده‌های Order استخراج می‌کند:
 *   - تعداد سفارشات در هر وضعیت = شاخص درآمد
 *   - totalCount × قیمت فرضی = برآورد مالی
 *
 * پس از migrate به Schema جدید، به جدول Payment وصل می‌شود.
 */

// GET /api/finance/summary — خلاصه وضعیت مالی
router.get('/summary', authenticateToken, async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      select: {
        id: true,
        code: true,
        name: true,
        status: true,
        totalCount: true,
        packingCount: true,
        saleableCount: true,
        createdAt: true,
        date: true,
      }
    });

    const total        = orders.length;
    const completed    = orders.filter(o => ['completed','delivered'].includes(o.status)).length;
    const pending      = orders.filter(o => o.status === 'pending').length;
    const inProgress   = orders.filter(o => ['processing','in_progress'].includes(o.status)).length;
    const cancelled    = orders.filter(o => o.status === 'cancelled').length;

    const totalProduced  = orders.reduce((s, o) => s + (o.totalCount   || 0), 0);
    const totalPacked    = orders.reduce((s, o) => s + (o.packingCount  || 0), 0);
    const totalSaleable  = orders.reduce((s, o) => s + (o.saleableCount || 0), 0);

    // آمار ماهانه ۶ ماه اخیر
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyOrders = await prisma.order.findMany({
      where: { createdAt: { gte: sixMonthsAgo } },
      select: { createdAt: true, totalCount: true, status: true }
    });

    const monthlyMap = {};
    const monthNames = ['فروردین','اردیبهشت','خرداد','تیر','مرداد','شهریور',
                         'مهر','آبان','آذر','دی','بهمن','اسفند'];
    monthlyOrders.forEach(o => {
      const d   = new Date(o.createdAt);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      if (!monthlyMap[key]) {
        monthlyMap[key] = { name: monthNames[d.getMonth()], سفارش: 0, تولید: 0 };
      }
      monthlyMap[key].سفارش += 1;
      monthlyMap[key].تولید += o.totalCount || 0;
    });

    res.json({
      summary: {
        totalOrders: total,
        completedOrders: completed,
        pendingOrders: pending,
        inProgressOrders: inProgress,
        cancelledOrders: cancelled,
        totalProduced,
        totalPacked,
        totalSaleable,
        completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
      },
      chartData: Object.values(monthlyMap).slice(-6),
    });
  } catch (error) {
    console.error('Finance summary error:', error);
    res.status(500).json({ message: 'خطا در دریافت وضعیت مالی' });
  }
});

// GET /api/finance/orders — لیست سفارشات برای ماژول مالی
router.get('/orders', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 20, status, dateFrom, dateTo } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {};
    if (status) where.status = status;
    if (dateFrom || dateTo) {
      where.date = {};
      if (dateFrom) where.date.gte = new Date(dateFrom);
      if (dateTo)   where.date.lte = new Date(dateTo);
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        select: {
          id: true,
          code: true,
          name: true,
          status: true,
          totalCount: true,
          packingCount: true,
          saleableCount: true,
          date: true,
          createdAt: true,
          creator: { select: { id: true, displayName: true } },
        },
        orderBy: { date: 'desc' },
        skip,
        take: parseInt(limit),
      }),
      prisma.order.count({ where }),
    ]);

    res.json({
      orders,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      }
    });
  } catch (error) {
    console.error('Finance orders error:', error);
    res.status(500).json({ message: 'خطا در دریافت سفارشات مالی' });
  }
});

module.exports = router;
