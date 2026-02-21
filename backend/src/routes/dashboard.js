const express = require('express');
const router = express.Router();
const prisma = require('../utils/prisma');
const { authenticateToken } = require('../middleware/auth');

// ─── GET DASHBOARD STATISTICS (واقعی از دیتابیس) ───
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    const [
      totalOrders,
      pendingOrders,
      processingOrders,
      completedOrders,
      cancelledOrders,
      totalContractors,
      activeContractors,
      recentOrders,
      ordersByMonth,
    ] = await Promise.all([
      // کل سفارشات
      prisma.order.count(),

      // در انتظار
      prisma.order.count({ where: { status: 'pending' } }),

      // در حال انجام
      prisma.order.count({ where: { status: { in: ['processing', 'in_progress'] } } }),

      // تکمیل شده
      prisma.order.count({ where: { status: { in: ['completed', 'delivered'] } } }),

      // لغو شده
      prisma.order.count({ where: { status: 'cancelled' } }),

      // کل پیمانکاران
      prisma.contractor.count(),

      // پیمانکاران فعال
      prisma.contractor.count({ where: { isActive: true } }),

      // ۵ سفارش اخیر
      prisma.order.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          creator: {
            select: { id: true, displayName: true }
          }
        }
      }),

      // آمار ماهانه ۶ ماه گذشته
      prisma.order.findMany({
        where: {
          createdAt: {
            gte: new Date(new Date().setMonth(new Date().getMonth() - 6))
          }
        },
        select: {
          createdAt: true,
          totalCount: true,
          status: true,
        }
      }),
    ]);

    // محاسبه کل تولید
    const allOrders = await prisma.order.findMany({
      select: { totalCount: true, packingCount: true }
    });
    const totalProduced = allOrders.reduce((s, o) => s + (o.totalCount || 0), 0);
    const totalPacked   = allOrders.reduce((s, o) => s + (o.packingCount || 0), 0);

    // آمار ماهانه — گروه‌بندی بر اساس ماه
    const monthlyMap = {};
    const monthNames = ['فروردین','اردیبهشت','خرداد','تیر','مرداد','شهریور','مهر','آبان','آذر','دی','بهمن','اسفند'];
    ordersByMonth.forEach(o => {
      const d = new Date(o.createdAt);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      if (!monthlyMap[key]) {
        monthlyMap[key] = { name: monthNames[d.getMonth()], سفارشات: 0, تولید: 0 };
      }
      monthlyMap[key].سفارشات += 1;
      monthlyMap[key].تولید   += o.totalCount || 0;
    });
    const chartData = Object.values(monthlyMap).slice(-6);

    // توزیع موجودی (بر اساس فیلدهای stock در order)
    const stockData = await prisma.order.findMany({
      select: {
        stockFabric: true,
        stockWash: true,
        stockProduction: true,
        stockPackaging: true,
        saleableCount: true,
      }
    });
    const totalFabric     = stockData.reduce((s, o) => s + (o.stockFabric || 0), 0);
    const totalWash       = stockData.reduce((s, o) => s + (o.stockWash || 0), 0);
    const totalProduction = stockData.reduce((s, o) => s + (o.stockProduction || 0), 0);
    const totalPackaging  = stockData.reduce((s, o) => s + (o.stockPackaging || 0), 0);
    const totalSaleable   = stockData.reduce((s, o) => s + (o.saleableCount || 0), 0);

    // نرخ تکمیل
    const completionRate = totalOrders > 0
      ? Math.round((completedOrders / totalOrders) * 100)
      : 0;

    res.json({
      orders: {
        total: totalOrders,
        pending: pendingOrders,
        processing: processingOrders,
        completed: completedOrders,
        cancelled: cancelledOrders,
        completionRate,
        totalProduced,
        totalPacked,
      },
      contractors: {
        total: totalContractors,
        active: activeContractors,
      },
      inventory: {
        fabric: totalFabric,
        wash: totalWash,
        production: totalProduction,
        packaging: totalPackaging,
        saleable: totalSaleable,
      },
      recentOrders,
      chartData: chartData.length > 0 ? chartData : [
        { name: 'ماه ۱', سفارشات: 0, تولید: 0 }
      ],
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ message: 'خطا در دریافت آمار داشبورد' });
  }
});

module.exports = router;
