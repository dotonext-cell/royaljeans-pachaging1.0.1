import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

// ─── ثابت‌های وضعیت و اولویت ─────────────────────────────────
const STATUS_MAP = {
  pending:     { label: 'در انتظار',    color: '#94a3b8', bg: 'rgba(148,163,184,.15)' },
  processing:  { label: 'در حال تولید', color: '#fbbf24', bg: 'rgba(251,191,36,.15)'  },
  in_progress: { label: 'در حال تولید', color: '#fbbf24', bg: 'rgba(251,191,36,.15)'  },
  completed:   { label: 'تکمیل شده',    color: '#34d399', bg: 'rgba(52,211,153,.15)'  },
  delivered:   { label: 'تحویل شده',    color: '#34d399', bg: 'rgba(52,211,153,.15)'  },
  cancelled:   { label: 'لغو شده',      color: '#f87171', bg: 'rgba(248,113,113,.15)' },
};

const StatusBadge = ({ status }) => {
  const s = STATUS_MAP[status] || { label: status || '—', color: '#94a3b8', bg: 'rgba(148,163,184,.15)' };
  return (
    <span style={{
      display:'inline-block', padding:'3px 10px', borderRadius:20,
      fontSize:12, fontWeight:600, color:s.color, background:s.bg,
    }}>{s.label}</span>
  );
};

// ─── صفحه اصلی ───────────────────────────────────────────────
export default function OrdersList() {
  const navigate = useNavigate();

  const [orders, setOrders]       = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);

  // فیلترها
  const [search, setSearch]   = useState('');
  const [status, setStatus]   = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo]   = useState('');
  const [page, setPage]       = useState(1);

  // لود سفارشات از API
  const loadOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = { page, limit: 20 };
      if (search)   params.search   = search;
      if (status)   params.status   = status;
      if (dateFrom) params.dateFrom = dateFrom;
      if (dateTo)   params.dateTo   = dateTo;

      const res = await api.get('/orders', { params });
      setOrders(res.data.orders || []);
      setPagination(res.data.pagination || { page: 1, pages: 1, total: 0 });
    } catch (err) {
      console.error('Orders load error:', err);
      setError('خطا در دریافت سفارشات');
    } finally {
      setLoading(false);
    }
  }, [page, search, status, dateFrom, dateTo]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  // Export Excel
  const handleExport = async () => {
    try {
      const params = {};
      if (status)   params.status    = status;
      if (dateFrom) params.startDate = dateFrom;
      if (dateTo)   params.endDate   = dateTo;

      const res = await api.get('/reports/excel/orders', { params });
      if (res.data?.data) {
        const rows  = res.data.data;
        const keys  = Object.keys(rows[0] || {});
        const csv   = [keys.join(','), ...rows.map(r => keys.map(k => `"${r[k] ?? ''}"`).join(','))].join('\n');
        const blob  = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
        const url   = URL.createObjectURL(blob);
        const a     = document.createElement('a');
        a.href = url; a.download = 'orders.csv'; a.click();
        URL.revokeObjectURL(url);
      }
    } catch (err) {
      alert('خطا در خروجی گرفتن');
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    loadOrders();
  };

  const handleReset = () => {
    setSearch(''); setStatus(''); setDateFrom(''); setDateTo('');
    setPage(1);
  };

  return (
    <div className="page-container">

      {/* هدر */}
      <div className="page-header">
        <div>
          <h1 className="page-title">مدیریت سفارشات</h1>
          <p className="page-subtitle">
            {loading ? 'در حال بارگذاری...' : `${pagination.total?.toLocaleString('fa-IR')} سفارش`}
          </p>
        </div>
        <div style={{ display:'flex', gap:10 }}>
          <button className="btn btn-ghost" onClick={handleExport} title="خروجی اکسل">
            📊 خروجی Excel
          </button>
          <button className="btn btn-primary" onClick={() => navigate('/orders/new')}>
            + سفارش جدید
          </button>
        </div>
      </div>

      {/* فیلترها */}
      <div className="card" style={{ marginBottom: 20 }}>
        <form onSubmit={handleSearch}>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr 1fr auto auto', gap:12, alignItems:'end' }}>
            <div className="form-group" style={{ margin:0 }}>
              <label className="form-label">جستجو</label>
              <input className="form-input" placeholder="کد یا نام سفارش..."
                value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <div className="form-group" style={{ margin:0 }}>
              <label className="form-label">وضعیت</label>
              <select className="form-input" value={status} onChange={e => setStatus(e.target.value)}>
                <option value="">همه وضعیت‌ها</option>
                <option value="pending">در انتظار</option>
                <option value="processing">در حال تولید</option>
                <option value="completed">تکمیل شده</option>
                <option value="cancelled">لغو شده</option>
              </select>
            </div>
            <div className="form-group" style={{ margin:0 }}>
              <label className="form-label">از تاریخ</label>
              <input className="form-input" type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} />
            </div>
            <div className="form-group" style={{ margin:0 }}>
              <label className="form-label">تا تاریخ</label>
              <input className="form-input" type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} />
            </div>
            <button type="submit" className="btn btn-primary">🔍 جستجو</button>
            <button type="button" className="btn btn-ghost" onClick={handleReset}>پاک کردن</button>
          </div>
        </form>
      </div>

      {/* خطا */}
      {error && (
        <div style={{ background:'rgba(239,68,68,.15)', border:'1px solid #ef4444',
          borderRadius:12, padding:'12px 18px', marginBottom:20, color:'#f87171' }}>
          ⚠️ {error} &nbsp;
          <button onClick={loadOrders} style={{ color:'#f59e0b', background:'none', border:'none', cursor:'pointer' }}>
            تلاش مجدد
          </button>
        </div>
      )}

      {/* جدول */}
      <div className="card">
        {loading ? (
          <div className="loading-spinner">
            <div className="spinner" />
            <p>در حال دریافت اطلاعات...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="empty-state">
            <span>📋</span>
            <p>هیچ سفارشی یافت نشد</p>
            <button className="btn btn-primary" onClick={() => navigate('/orders/new')}>
              ثبت اولین سفارش
            </button>
          </div>
        ) : (
          <>
            <div className="table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>کد سفارش</th>
                    <th>نام سفارش</th>
                    <th>تعداد کل</th>
                    <th>موجودی بسته‌بندی</th>
                    <th>وضعیت</th>
                    <th>تاریخ</th>
                    <th>ثبت‌کننده</th>
                    <th>عملیات</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order, idx) => (
                    <tr key={order.id}>
                      <td style={{ color:'#475569' }}>
                        {((pagination.page - 1) * 20) + idx + 1}
                      </td>
                      <td>
                        <span style={{ color:'#f59e0b', fontWeight:700, fontFamily:'monospace' }}>
                          {order.code}
                        </span>
                      </td>
                      <td style={{ fontWeight:500 }}>{order.name}</td>
                      <td>{(order.totalCount || 0).toLocaleString('fa-IR')}</td>
                      <td>{(order.stockPackaging || 0).toLocaleString('fa-IR')}</td>
                      <td><StatusBadge status={order.status} /></td>
                      <td style={{ color:'#94a3b8', fontSize:13 }}>
                        {order.date
                          ? new Date(order.date).toLocaleDateString('fa-IR')
                          : new Date(order.createdAt).toLocaleDateString('fa-IR')}
                      </td>
                      <td style={{ color:'#94a3b8' }}>{order.creator?.displayName || '—'}</td>
                      <td>
                        <div style={{ display:'flex', gap:6 }}>
                          <button className="btn-icon" title="مشاهده"
                            onClick={() => navigate(`/orders/${order.id}`)}>👁️</button>
                          <button className="btn-icon" title="ویرایش"
                            onClick={() => navigate(`/orders/${order.id}/edit`)}>✏️</button>
                          <button className="btn-icon" title="گردش کار"
                            onClick={() => navigate(`/workflow/${order.id}`)}>🔄</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* صفحه‌بندی */}
            {pagination.pages > 1 && (
              <div style={{ display:'flex', justifyContent:'center', alignItems:'center', gap:12, padding:'16px 0 4px' }}>
                <button className="btn btn-ghost"
                  disabled={page <= 1} onClick={() => setPage(p => p - 1)}>
                  ← قبلی
                </button>
                <span style={{ color:'#94a3b8', fontSize:13 }}>
                  صفحه {page} از {pagination.pages}
                  &nbsp;({pagination.total?.toLocaleString('fa-IR')} سفارش)
                </span>
                <button className="btn btn-ghost"
                  disabled={page >= pagination.pages} onClick={() => setPage(p => p + 1)}>
                  بعدی →
                </button>
              </div>
            )}
          </>
        )}
      </div>

    </div>
  );
}
