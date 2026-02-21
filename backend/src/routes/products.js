const express = require('express');
const router = express.Router();
const prisma = require('../utils/prisma');
const { authenticateToken, authorize } = require('../middleware/auth');

/**
 * محصولات در سیستم فعلی از فیلدهای name, style, fabric در Order استخراج می‌شوند.
 * این route لیست یکتا از محصولات ثبت‌شده در سفارشات را برمی‌گرداند.
 * پس از migrate به schema جدید، این route مستقیماً به جدول Product وصل می‌شود.
 */

// GET /api/products — لیست محصولات یکتا (از دل سفارشات)
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { search, style, isActive } = req.query;

    // استخراج محصولات یکتا از سفارشات
    const orders = await prisma.order.findMany({
      select: {
        name: true,
        style: true,
        fabric: true,
        stoneWash: true,
        packingName: true,
      },
      orderBy: { name: 'asc' },
    });

    // گروه‌بندی بر اساس نام محصول
    const productMap = {};
    orders.forEach(o => {
      const key = o.name;
      if (!productMap[key]) {
        productMap[key] = {
          id: Buffer.from(key).toString('base64'), // شبیه‌سازی id تا migrate
          code: `P-${Object.keys(productMap).length + 1}`,
          name: o.name,
          category: o.packingName || 'عمومی',
          style: o.style || '—',
          fabric: o.fabric || '—',
          stoneWash: o.stoneWash || '—',
          isActive: true,
          orderCount: 0,
        };
      }
      productMap[key].orderCount += 1;
    });

    let products = Object.values(productMap);

    // فیلتر جستجو
    if (search) {
      const term = search.toLowerCase();
      products = products.filter(p =>
        p.name.toLowerCase().includes(term) ||
        p.code.toLowerCase().includes(term) ||
        (p.style && p.style.toLowerCase().includes(term))
      );
    }
    if (style) {
      products = products.filter(p => p.style === style);
    }

    // لیست استایل‌های یکتا برای فیلتر
    const styles = await prisma.style.findMany({
      where: { isActive: true },
      select: { id: true, name: true }
    });

    res.json({ products, total: products.length, styles });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ message: 'خطا در دریافت محصولات' });
  }
});

// GET /api/products/stats — آمار کلی محصولات
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      select: { name: true, totalCount: true, packingCount: true, style: true }
    });

    const uniqueProducts = new Set(orders.map(o => o.name)).size;
    const totalProduced  = orders.reduce((s, o) => s + (o.totalCount || 0), 0);
    const totalPacked    = orders.reduce((s, o) => s + (o.packingCount || 0), 0);

    const byStyle = orders.reduce((acc, o) => {
      const st = o.style || 'نامشخص';
      acc[st] = (acc[st] || 0) + 1;
      return acc;
    }, {});

    res.json({ uniqueProducts, totalProduced, totalPacked, byStyle });
  } catch (error) {
    console.error('Products stats error:', error);
    res.status(500).json({ message: 'خطا در آمار محصولات' });
  }
});

module.exports = router;
