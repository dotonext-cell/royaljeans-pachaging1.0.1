import React, { useState, useEffect, useCallback } from 'react';
import { Package, Tag, Box, Search, X } from 'lucide-react';
import { productsService } from '../../services/products.service';
import { toPersianNumbers } from '../../utils/jalali';

export default function ProductsPage() {
  const [products, setProducts]     = useState([]);
  const [styles, setStyles]         = useState([]);
  const [stats, setStats]           = useState(null);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState(null);
  const [search, setSearch]         = useState('');
  const [styleFilter, setStyleFilter] = useState('');

  const loadProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const params = {};
      if (search)      params.search = search;
      if (styleFilter) params.style  = styleFilter;

      const [productsRes, statsRes] = await Promise.all([
        productsService.getAll(params),
        productsService.getStats(),
      ]);

      setProducts(productsRes.products || []);
      setStyles(productsRes.styles || []);
      setStats(statsRes);
    } catch (err) {
      console.error('Products load error:', err);
      setError('خطا در دریافت محصولات');
    } finally {
      setLoading(false);
    }
  }, [search, styleFilter]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const handleSearch = (e) => {
    e.preventDefault();
    loadProducts();
  };

  const getProductIdentifier = (product) => {
    // محاسبه شناسه محصول از کد سفارش و نام کالا
    const orderCode = product.orderCode || product.code || 'N/A';
    const productName = product.name || product.productName || 'بدون نام';

    return {
      code: orderCode,
      name: productName,
      display: `${orderCode} - ${productName}`,
    };
  };

  return (
    <div className="page-container">

      {/* هدر */}
      <div className="page-header">
        <div>
          <h1 className="page-title">مدیریت محصولات</h1>
          <p className="page-subtitle mt-0.5">
            {loading ? 'در حال بارگذاری...' : `${toPersianNumbers(products.length.toString())} محصول یافت شد`}
          </p>
        </div>
      </div>

      {/* کارت‌های آمار */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="stat-card" style={{ borderTop: '3px solid #f59e0b' }}>
            <div className="flex items-center justify-between mb-4">
              <div className="stat-label">محصولات یکتا</div>
              <div className="w-11 h-11 rounded-xl bg-accent-gold/15 flex items-center justify-center">
                <Package size={20} className="text-accent-gold" />
              </div>
            </div>
            <div className="stat-value" style={{ color: '#f59e0b' }}>
              {toPersianNumbers((stats.uniqueProducts || 0).toString())}
            </div>
          </div>
          <div className="stat-card" style={{ borderTop: '3px solid #3b82f6' }}>
            <div className="flex items-center justify-between mb-4">
              <div className="stat-label">کل تولید شده</div>
              <div className="w-11 h-11 rounded-xl bg-accent-blue/15 flex items-center justify-center">
                <Box size={20} className="text-accent-blue" />
              </div>
            </div>
            <div className="stat-value" style={{ color: '#3b82f6' }}>
              {toPersianNumbers((stats.totalProduced || 0).toString())}
            </div>
          </div>
          <div className="stat-card" style={{ borderTop: '3px solid #10b981' }}>
            <div className="flex items-center justify-between mb-4">
              <div className="stat-label">کل بسته‌بندی شده</div>
              <div className="w-11 h-11 rounded-xl bg-accent-green/15 flex items-center justify-center">
                <Tag size={20} className="text-accent-green" />
              </div>
            </div>
            <div className="stat-value" style={{ color: '#10b981' }}>
              {toPersianNumbers((stats.totalPacked || 0).toString())}
            </div>
          </div>
          <div className="stat-card" style={{ borderTop: '3px solid #8b5cf6' }}>
            <div className="flex items-center justify-between mb-4">
              <div className="stat-label">در انتظار تولید</div>
              <div className="w-11 h-11 rounded-xl bg-accent-purple/15 flex items-center justify-center">
                <Search size={20} className="text-accent-purple" />
              </div>
            </div>
            <div className="stat-value" style={{ color: '#8b5cf6' }}>
              {toPersianNumbers(((stats.uniqueProducts || 0) - (stats.totalProduced || 0)).toString())}
            </div>
          </div>
        </div>
      )}

      {/* فیلترها */}
      <div className="glass-card p-5 mb-5">
        <form onSubmit={handleSearch}>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div>
              <label className="form-label">جستجو</label>
              <div className="relative">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted" size={16} />
                <input
                  className="form-input pr-10"
                  placeholder="کد سفارش یا نام محصول..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>
            </div>
            <div>
              <label className="form-label">استایل</label>
              <select
                className="form-input"
                value={styleFilter}
                onChange={e => setStyleFilter(e.target.value)}
              >
                <option value="">همه استایل‌ها</option>
                {styles.map(s => (
                  <option key={s.id} value={s.name}>{s.name}</option>
                ))}
              </select>
            </div>
            <button type="submit" className="btn btn-primary">
              <Search size={18} />
              جستجو
            </button>
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => { setSearch(''); setStyleFilter(''); }}
            >
              <X size={16} />
              پاک کردن
            </button>
          </div>
        </form>
      </div>

      {/* خطا */}
      {error && (
        <div className="mb-5 p-4 rounded-xl border border-red-500/30 bg-red-500/15 text-red-400 flex items-center gap-3">
          <span className="text-xl">⚠️</span>
          {error}
        </div>
      )}

      {/* جدول */}
      <div className="glass-card">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 gap-4 text-text-muted">
            <div className="spinner"></div>
            <p>در حال دریافت اطلاعات...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="empty-state">
            <Package size={48} opacity={0.5} />
            <p>هیچ محصولی یافت نشد</p>
            <small className="text-text-muted text-sm">
              محصولات از کد سفارش و نام کالا شناسایی می‌شوند
            </small>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>شناسه محصول</th>
                  <th>کد سفارش</th>
                  <th>نام کالا</th>
                  <th>استایل</th>
                  <th>پارچه</th>
                  <th>سنگشویی</th>
                  <th>تعداد سفارش</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => {
                  const identifier = getProductIdentifier(p);
                  return (
                    <tr key={p.id}>
                      <td>
                        <span className="text-accent-gold font-mono text-xs bg-accent-gold/10 px-2 py-1 rounded">
                          {identifier.code}
                        </span>
                      </td>
                      <td>
                        <span className="font-semibold text-text-primary text-sm">
                          {identifier.code}
                        </span>
                      </td>
                      <td style={{ fontWeight: 500 }}>
                        {identifier.name}
                      </td>
                      <td>
                        {p.style && p.style !== '—' ? (
                          <span className="badge badge-blue text-xs px-2 py-1">
                            {p.style}
                          </span>
                        ) : <span className="text-text-muted">—</span>}
                      </td>
                      <td className="text-text-muted text-sm">{p.fabric}</td>
                      <td className="text-text-muted text-sm">{p.stoneWash}</td>
                      <td>
                        <span className="badge badge-yellow text-sm px-2.5 py-1 font-semibold">
                          {toPersianNumbers(p.orderCount?.toString() || '0')}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* توضیح */}
      <div className="mt-4 p-4 rounded-xl border border-accent-blue/20 bg-accent-blue/8 text-text-muted text-sm flex items-start gap-3">
        <span className="text-lg">💡</span>
        <p className="leading-relaxed">
          محصولات از <strong className="text-text-primary">کد سفارش</strong> و <strong className="text-text-primary">نام کالا</strong> شناسایی می‌شوند.
          هر ترکیب منحصر به فرد کد سفارش و نام کالا، یک محصول یکتا محسوب می‌شود.
        </p>
      </div>

    </div>
  );
}
