const express = require('express');
const router = express.Router();
const prisma = require('../utils/prisma');
const { authenticateToken } = require('../middleware/auth');

/**
 * Workflow — گردش کار سفارشات
 * در Schema فعلی، مراحل تولید با فیلدهای stock در Order ردیابی می‌شوند:
 *   stockFabric → مرحله پارچه
 *   stockWash   → مرحله سنگ‌شویی
 *   stockProduction → مرحله دوخت/تولید
 *   stockPackaging  → مرحله بسته‌بندی
 *   fabricSupplier, productionSupplier → پیمانکاران
 *
 * پس از migrate به schema جدید این route به OrderItemWorkflow وصل می‌شود.
 */

// GET /api/workflow/:orderId — گردش کار یک سفارش
router.get('/:orderId', authenticateToken, async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await prisma.order.findUnique({
      where: { id: parseInt(orderId) },
      include: {
        creator: { select: { id: true, displayName: true } }
      }
    });

    if (!order) {
      return res.status(404).json({ message: 'سفارش یافت نشد' });
    }

    // ساخت مراحل workflow از فیلدهای موجودی
    const totalCount = order.totalCount || 0;

    const stages = [
      {
        id: 1,
        name: 'پارچه',
        slug: 'fabric',
        contractor: order.fabricSupplier || null,
        quantityIn: totalCount,
        quantityOut: order.stockFabric || 0,
        status: (order.stockFabric || 0) > 0 ? 'done' : 'pending',
      },
      {
        id: 2,
        name: 'دوخت / تولید',
        slug: 'production',
        contractor: order.productionSupplier || null,
        quantityIn: order.stockFabric || 0,
        quantityOut: order.stockProduction || 0,
        status: (order.stockProduction || 0) > 0 ? 'done'
               : (order.stockFabric || 0) > 0 ? 'active'
               : 'pending',
      },
      {
        id: 3,
        name: 'سنگ‌شویی',
        slug: 'wash',
        contractor: order.stoneWash || null,
        quantityIn: order.stockProduction || 0,
        quantityOut: order.stockWash || 0,
        status: (order.stockWash || 0) > 0 ? 'done'
               : (order.stockProduction || 0) > 0 ? 'active'
               : 'pending',
      },
      {
        id: 4,
        name: 'بسته‌بندی',
        slug: 'packaging',
        contractor: order.packingName || null,
        quantityIn: order.stockWash || 0,
        quantityOut: order.stockPackaging || 0,
        status: (order.stockPackaging || 0) > 0 ? 'done'
               : (order.stockWash || 0) > 0 ? 'active'
               : 'pending',
      },
    ];

    // محاسبه درصد پیشرفت کلی
    const done = stages.filter(s => s.status === 'done').length;
    const progressPercent = Math.round((done / stages.length) * 100);

    // تاریخچه از AuditLogs
    const history = await prisma.auditLog.findMany({
      where: { orderId: parseInt(orderId) },
      orderBy: { createdAt: 'desc' },
      take: 10,
      include: {
        user: { select: { id: true, displayName: true } }
      }
    });

    res.json({
      order: {
        id: order.id,
        code: order.code,
        name: order.name,
        status: order.status,
        totalCount: order.totalCount,
        date: order.date,
        saleableCount: order.saleableCount,
        waste: order.waste,
      },
      stages,
      progressPercent,
      history,
    });
  } catch (error) {
    console.error('Get workflow error:', error);
    res.status(500).json({ message: 'خطا در دریافت گردش کار' });
  }
});

// PUT /api/workflow/:orderId — بروزرسانی مرحله‌ای از گردش کار
router.put('/:orderId', authenticateToken, async (req, res) => {
  try {
    const { orderId } = req.params;
    const {
      stockFabric, stockProduction, stockWash, stockPackaging,
      fabricSupplier, productionSupplier, stoneWash,
      saleableCount, waste, notes
    } = req.body;

    const existing = await prisma.order.findUnique({
      where: { id: parseInt(orderId) }
    });
    if (!existing) {
      return res.status(404).json({ message: 'سفارش یافت نشد' });
    }

    // فقط فیلدهایی که ارسال شده‌اند را آپدیت می‌کنیم
    const updateData = {};
    if (stockFabric     !== undefined) updateData.stockFabric     = stockFabric;
    if (stockProduction !== undefined) updateData.stockProduction = stockProduction;
    if (stockWash       !== undefined) updateData.stockWash       = stockWash;
    if (stockPackaging  !== undefined) updateData.stockPackaging  = stockPackaging;
    if (fabricSupplier  !== undefined) updateData.fabricSupplier  = fabricSupplier;
    if (productionSupplier !== undefined) updateData.productionSupplier = productionSupplier;
    if (stoneWash       !== undefined) updateData.stoneWash       = stoneWash;
    if (saleableCount   !== undefined) updateData.saleableCount   = saleableCount;
    if (waste           !== undefined) updateData.waste           = waste;

    // بروزرسانی وضعیت اتوماتیک بر اساس مراحل
    if (stockPackaging && stockPackaging > 0) {
      updateData.status = 'completed';
    } else if (stockWash && stockWash > 0) {
      updateData.status = 'processing';
    } else if (stockProduction && stockProduction > 0) {
      updateData.status = 'processing';
    } else if (stockFabric && stockFabric > 0) {
      updateData.status = 'processing';
    }

    const order = await prisma.order.update({
      where: { id: parseInt(orderId) },
      data: updateData,
    });

    // ثبت audit log
    await prisma.auditLog.create({
      data: {
        userId: req.user.id,
        orderId: parseInt(orderId),
        action: 'WORKFLOW_UPDATE',
        entity: 'Order',
        changes: JSON.stringify({ ...updateData, notes }),
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
      }
    });

    res.json({ message: 'گردش کار با موفقیت بروزرسانی شد', order });
  } catch (error) {
    console.error('Update workflow error:', error);
    res.status(500).json({ message: 'خطا در بروزرسانی گردش کار' });
  }
});

// GET /api/workflow — لیست همه سفارشات با وضعیت workflow
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { status } = req.query;

    const where = {};
    if (status) where.status = status;

    const orders = await prisma.order.findMany({
      where,
      select: {
        id: true,
        code: true,
        name: true,
        status: true,
        totalCount: true,
        stockFabric: true,
        stockProduction: true,
        stockWash: true,
        stockPackaging: true,
        saleableCount: true,
        waste: true,
        fabricSupplier: true,
        productionSupplier: true,
        date: true,
        createdAt: true,
        creator: { select: { id: true, displayName: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    // اضافه کردن مرحله فعلی به هر سفارش
    const ordersWithStage = orders.map(o => {
      let currentStage = 'fabric';
      if ((o.stockPackaging || 0) > 0) currentStage = 'packaging';
      else if ((o.stockWash || 0) > 0) currentStage = 'wash';
      else if ((o.stockProduction || 0) > 0) currentStage = 'production';
      else if ((o.stockFabric || 0) > 0) currentStage = 'production';

      const total = o.totalCount || 1;
      const done  = o.stockPackaging || o.stockWash || o.stockProduction || o.stockFabric || 0;
      const progressPercent = Math.min(100, Math.round((done / total) * 100));

      return { ...o, currentStage, progressPercent };
    });

    res.json({ orders: ordersWithStage, total: ordersWithStage.length });
  } catch (error) {
    console.error('Get workflow list error:', error);
    res.status(500).json({ message: 'خطا در دریافت لیست گردش کار' });
  }
});

module.exports = router;
