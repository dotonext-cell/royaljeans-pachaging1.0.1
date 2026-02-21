const express = require('express');
const router = express.Router();
const prisma = require('../utils/prisma');
const { authenticateToken } = require('../middleware/auth');

/**
 * Inventory — انبارداری
 * در Schema فعلی، موجودی هر مرحله در جدول Order ذخیره می‌شود:
 *   stockFabric, stockWash, stockProduction, stockPackaging, saleableCount
 *   accessories_button, accessories_rivet, ...
 *
 * این endpoint موجودی کل را از مجموع همه سفارشات محاسبه می‌کند.
 * پس از migrate به Schema جدید، به جدول‌های ProductInventory و MaterialInventory وصل می‌شود.
 */

// GET /api/inventory/summary — خلاصه موجودی کل
router.get('/summary', authenticateToken, async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      select: {
        id: true,
        code: true,
        name: true,
        totalCount: true,
        stockFabric: true,
        stockWash: true,
        stockProduction: true,
        stockPackaging: true,
        saleableCount: true,
        differentWash: true,
        waste: true,
        stockMinus: true,
        stockPlus: true,
        stockPackagingMinus: true,
        accessories_button: true,
        accessories_rivet: true,
        accessories_pocketCard: true,
        accessories_sizeCard: true,
        accessories_hanger: true,
        accessories_band: true,
        accessories_leather: true,
      }
    });

    // محاسبه مجموع موجودی‌ها
    const summary = orders.reduce((acc, o) => {
      acc.totalFabric       += o.stockFabric     || 0;
      acc.totalWash         += o.stockWash       || 0;
      acc.totalProduction   += o.stockProduction || 0;
      acc.totalPackaging    += o.stockPackaging  || 0;
      acc.totalSaleable     += o.saleableCount   || 0;
      acc.totalWaste        += o.waste           || 0;
      acc.totalDiffWash     += o.differentWash   || 0;
      acc.totalMinus        += o.stockMinus      || 0;
      acc.totalPlus         += o.stockPlus       || 0;
      // ملزومات
      acc.acc_button        += o.accessories_button     || 0;
      acc.acc_rivet         += o.accessories_rivet      || 0;
      acc.acc_pocketCard    += o.accessories_pocketCard || 0;
      acc.acc_sizeCard      += o.accessories_sizeCard   || 0;
      acc.acc_hanger        += o.accessories_hanger     || 0;
      acc.acc_band          += o.accessories_band       || 0;
      acc.acc_leather       += o.accessories_leather    || 0;
      return acc;
    }, {
      totalFabric: 0, totalWash: 0, totalProduction: 0, totalPackaging: 0,
      totalSaleable: 0, totalWaste: 0, totalDiffWash: 0, totalMinus: 0, totalPlus: 0,
      acc_button: 0, acc_rivet: 0, acc_pocketCard: 0, acc_sizeCard: 0,
      acc_hanger: 0, acc_band: 0, acc_leather: 0,
    });

    // سفارشاتی که موجودی پایینی دارند (کمتر از ۱۰۰)
    const lowStockOrders = orders.filter(o =>
      (o.stockFabric || 0) < 100 && (o.totalCount || 0) > 0
    );

    res.json({
      summary,
      lowStockCount: lowStockOrders.length,
      totalOrders: orders.length,
    });
  } catch (error) {
    console.error('Inventory summary error:', error);
    res.status(500).json({ message: 'خطا در دریافت خلاصه موجودی' });
  }
});

// GET /api/inventory/stock — موجودی هر سفارش
router.get('/stock', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 20, search, lowStock } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    let where = {};
    if (search) {
      where.OR = [
        { code: { contains: search } },
        { name: { contains: search } },
      ];
    }

    const orders = await prisma.order.findMany({
      where,
      select: {
        id: true,
        code: true,
        name: true,
        totalCount: true,
        stockFabric: true,
        stockWash: true,
        stockProduction: true,
        stockPackaging: true,
        saleableCount: true,
        waste: true,
        differentWash: true,
        status: true,
        date: true,
      },
      orderBy: { date: 'desc' },
      skip,
      take: parseInt(limit),
    });

    const total = await prisma.order.count({ where });

    // اگه فیلتر low stock فعاله
    let result = orders;
    if (lowStock === 'true') {
      result = orders.filter(o => (o.stockFabric || 0) < 100);
    }

    // اضافه کردن درصد استفاده
    const enriched = result.map(o => ({
      ...o,
      usagePercent: o.totalCount
        ? Math.round(((o.saleableCount || 0) / o.totalCount) * 100)
        : 0,
    }));

    res.json({
      items: enriched,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      }
    });
  } catch (error) {
    console.error('Inventory stock error:', error);
    res.status(500).json({ message: 'خطا در دریافت موجودی' });
  }
});

// GET /api/inventory/accessories — موجودی ملزومات
router.get('/accessories', authenticateToken, async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      select: {
        accessories_button: true,
        accessories_rivet: true,
        accessories_pocketCard: true,
        accessories_sizeCard: true,
        accessories_hanger: true,
        accessories_band: true,
        accessories_leather: true,
      }
    });

    const totals = orders.reduce((acc, o) => {
      acc.button     += o.accessories_button     || 0;
      acc.rivet      += o.accessories_rivet      || 0;
      acc.pocketCard += o.accessories_pocketCard || 0;
      acc.sizeCard   += o.accessories_sizeCard   || 0;
      acc.hanger     += o.accessories_hanger     || 0;
      acc.band       += o.accessories_band       || 0;
      acc.leather    += o.accessories_leather    || 0;
      return acc;
    }, { button:0, rivet:0, pocketCard:0, sizeCard:0, hanger:0, band:0, leather:0 });

    const accessories = [
      { id: 1, name: 'دکمه',       unit: 'عدد', quantity: totals.button,     low: totals.button     < 1000 },
      { id: 2, name: 'پرچ',        unit: 'عدد', quantity: totals.rivet,      low: totals.rivet      < 500  },
      { id: 3, name: 'کارت جیب',   unit: 'عدد', quantity: totals.pocketCard, low: totals.pocketCard < 200  },
      { id: 4, name: 'کارت سایز',  unit: 'عدد', quantity: totals.sizeCard,   low: totals.sizeCard   < 500  },
      { id: 5, name: 'هانگر',      unit: 'عدد', quantity: totals.hanger,     low: totals.hanger     < 300  },
      { id: 6, name: 'باند',       unit: 'متر', quantity: totals.band,       low: totals.band       < 100  },
      { id: 7, name: 'چرم',        unit: 'متر', quantity: totals.leather,    low: totals.leather    < 50   },
    ];

    const lowCount = accessories.filter(a => a.low).length;

    res.json({ accessories, lowCount });
  } catch (error) {
    console.error('Inventory accessories error:', error);
    res.status(500).json({ message: 'خطا در دریافت ملزومات' });
  }
});

// GET /api/inventory/movement — گردش انبار (تاریخچه تغییرات)
router.get('/movement', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where: {
          action: { in: ['CREATE', 'UPDATE', 'WORKFLOW_UPDATE'] },
          entity: 'Order',
        },
        include: {
          user: { select: { id: true, displayName: true } },
          order: { select: { id: true, code: true, name: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: parseInt(limit),
      }),
      prisma.auditLog.count({
        where: {
          action: { in: ['CREATE', 'UPDATE', 'WORKFLOW_UPDATE'] },
          entity: 'Order',
        }
      })
    ]);

    res.json({
      movements: logs,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      }
    });
  } catch (error) {
    console.error('Inventory movement error:', error);
    res.status(500).json({ message: 'خطا در دریافت گردش انبار' });
  }
});

module.exports = router;
