import React, { useState, useEffect, useCallback } from 'react';
import { productsService } from '../../services/products.service';

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

  return (
    <div className="page-container">

      {/* هدر */}
      <div className="page-header">
        <div>
          <h1 className="page-title">مدیریت محصولات</h1>
          <p className="page-subtitle">
            {loading ? 'در حال بارگذاری...' : `${products.length} محصول یافت شد`}
          </p>
        </div>
      </div>

      {/* کارت‌های آمار */}
      {stats && (
        <div className="stats-grid" style={{ marginBottom: 24 }}>
          <div className="stat-card" style={{ borderTop: '3px solid #f59e0b' }}>
            <div className="stat-label">محصولات یکتا</div>
            <div className="stat-value" style={{ color: '#f59e0b' }}>
              {(stats.uniqueProducts || 0).toLocaleString('fa-IR')}
            </div>
          </div>
          <div className="stat-card" style={{ borderTop: '3px solid #3b82f6' }}>
            <div className="stat-label">کل تولید شده</div>
            <div className="stat-value" style={{ color: '#3b82f6' }}>
              {(stats.totalProduced || 0).toLocaleString('fa-IR')}
            </div>
          </div>
          <div className="stat-card" style={{ borderTop: '3px solid #10b981' }}>
            <div className="stat-label">کل بسته‌بندی شده</div>
            <div className="stat-value" style={{ color: '#10b981' }}>
              {(stats.totalPacked || 0).toLocaleString('fa-IR')}
            </div>
          </div>
        </div>
      )}

      {/* فیلترها */}
      <div className="card" style={{ marginBottom: 20 }}>
        <form onSubmit={handleSearch}>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr auto auto', gap:12, alignItems:'end' }}>
            <div className="form-group" style={{ margin:0 }}>
              <label className="form-label">جستجو</label>
              <input className="form-input" placeholder="نام یا کد محصول..."
                value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <div className="form-group" style={{ margin:0 }}>
              <label className="form-label">استایل</label>
              <select className="form-input" value={styleFilter} onChange={e => setStyleFilter(e.target.value)}>
                <option value="">همه استایل‌ها</option>
                {styles.map(s => (
                  <option key={s.id} value={s.name}>{s.name}</option>
                ))}
              </select>
            </div>
            <button type="submit" className="btn btn-primary">🔍 جستجو</button>
            <button type="button" className="btn btn-ghost"
              onClick={() => { setSearch(''); setStyleFilter(''); }}>
              پاک کردن
            </button>
          </div>
        </form>
      </div>

      {/* خطا */}
      {error && (
        <div style={{ background:'rgba(239,68,68,.15)', border:'1px solid #ef4444',
          borderRadius:12, padding:'12px 18px', marginBottom:20, color:'#f87171' }}>
          ⚠️ {error}
        </div>
      )}

      {/* جدول */}
      <div className="card">
        {loading ? (
          <div className="loading-spinner">
            <div className="spinner" />
            <p>در حال دریافت اطلاعات...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="empty-state">
            <span>🧴</span>
            <p>هیچ محصولی یافت نشد</p>
            <small style={{ color:'#64748b' }}>
              محصولات از سفارشات ثبت‌شده استخراج می‌شوند
            </small>
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>کد</th>
                  <th>نام محصول</th>
                  <th>استایل</th>
                  <th>پارچه</th>
                  <th>سنگشویی</th>
                  <th>تعداد سفارش</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p.id}>
                    <td>
                      <span style={{ color:'#f59e0b', fontFamily:'monospace', fontSize:12 }}>
                        {p.code}
                      </span>
                    </td>
                    <td style={{ fontWeight:500 }}>{p.name}</td>
                    <td>
                      {p.style && p.style !== '—' ? (
                        <span style={{
                          background:'rgba(59,130,246,.15)', color:'#60a5fa',
                          padding:'2px 8px', borderRadius:6, fontSize:12
                        }}>{p.style}</span>
                      ) : <span style={{ color:'#475569' }}>—</span>}
                    </td>
                    <td style={{ color:'#94a3b8', fontSize:13 }}>{p.fabric}</td>
                    <td style={{ color:'#94a3b8', fontSize:13 }}>{p.stoneWash}</td>
                    <td>
                      <span style={{
                        background:'rgba(245,158,11,.15)', color:'#f59e0b',
                        padding:'2px 10px', borderRadius:6, fontSize:13, fontWeight:600
                      }}>{p.orderCount}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* توضیح */}
      <div style={{ marginTop:16, padding:'12px 18px', background:'rgba(59,130,246,.08)',
        border:'1px solid rgba(59,130,246,.2)', borderRadius:10, color:'#94a3b8', fontSize:13 }}>
        💡 محصولات از نام سفارشات ثبت‌شده در دیتابیس استخراج می‌شوند. پس از مهاجرت به ساختار جدید، جدول مستقل محصول ایجاد خواهد شد.
      </div>

    </div>
  );
}
