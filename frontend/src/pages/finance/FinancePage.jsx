import React, { useState, useEffect, useCallback } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { financeService } from '../../services/finance.service';

const STATUS_MAP = {
  pending:     { label:'در انتظار',    color:'#94a3b8' },
  processing:  { label:'در حال تولید', color:'#fbbf24' },
  in_progress: { label:'در حال تولید', color:'#fbbf24' },
  completed:   { label:'تکمیل شده',    color:'#34d399' },
  delivered:   { label:'تحویل شده',    color:'#34d399' },
  cancelled:   { label:'لغو شده',      color:'#f87171' },
};

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background:'#1e293b', border:'1px solid #334155',
      borderRadius:10, padding:'10px 16px', fontSize:13, direction:'rtl'
    }}>
      <div style={{ color:'#94a3b8', marginBottom:6 }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ color:p.color, display:'flex', gap:8 }}>
          <span>{p.name}:</span>
          <span style={{ fontWeight:700 }}>{(p.value || 0).toLocaleString('fa-IR')}</span>
        </div>
      ))}
    </div>
  );
};

export default function FinancePage() {
  const [summaryData, setSummaryData] = useState(null);
  const [orders, setOrders]           = useState([]);
  const [pagination, setPagination]   = useState({ page:1, pages:1, total:0 });
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState(null);
  const [page, setPage]               = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFrom, setDateFrom]       = useState('');
  const [dateTo, setDateTo]           = useState('');

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = { page, limit:20 };
      if (statusFilter) params.status   = statusFilter;
      if (dateFrom)     params.dateFrom = dateFrom;
      if (dateTo)       params.dateTo   = dateTo;

      const [summary, ordersRes] = await Promise.all([
        financeService.getSummary(),
        financeService.getOrders(params),
      ]);

      setSummaryData(summary);
      setOrders(ordersRes.orders || []);
      setPagination(ordersRes.pagination || { page:1, pages:1, total:0 });
    } catch (err) {
      console.error('Finance load error:', err);
      setError('خطا در دریافت اطلاعات مالی');
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter, dateFrom, dateTo]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const s = summaryData?.summary || {};

  return (
    <div className="page-container">

      {/* هدر */}
      <div className="page-header">
        <div>
          <h1 className="page-title">مدیریت مالی</h1>
          <p className="page-subtitle">پیگیری وضعیت مالی سفارشات</p>
        </div>
        <button className="btn btn-ghost" onClick={loadData} disabled={loading}>
          ↻ {loading ? 'در حال بارگذاری...' : 'بروزرسانی'}
        </button>
      </div>

      {error && (
        <div style={{ background:'rgba(239,68,68,.15)', border:'1px solid #ef4444',
          borderRadius:12, padding:'12px 18px', marginBottom:20, color:'#f87171' }}>
          ⚠️ {error}
        </div>
      )}

      {/* کارت‌های آمار */}
      <div className="stats-grid" style={{ marginBottom:24 }}>
        <div className="stat-card" style={{ borderTop:'3px solid #f59e0b' }}>
          <div className="stat-label">کل سفارشات</div>
          <div className="stat-value" style={{ color:'#f59e0b' }}>
            {loading ? '...' : (s.totalOrders || 0).toLocaleString('fa-IR')}
          </div>
          <div style={{ color:'#94a3b8', fontSize:12 }}>
            نرخ تکمیل: {s.completionRate || 0}٪
          </div>
        </div>
        <div className="stat-card" style={{ borderTop:'3px solid #10b981' }}>
          <div className="stat-label">تکمیل شده</div>
          <div className="stat-value" style={{ color:'#10b981' }}>
            {loading ? '...' : (s.completedOrders || 0).toLocaleString('fa-IR')}
          </div>
        </div>
        <div className="stat-card" style={{ borderTop:'3px solid #3b82f6' }}>
          <div className="stat-label">کل تولید</div>
          <div className="stat-value" style={{ color:'#3b82f6' }}>
            {loading ? '...' : (s.totalProduced || 0).toLocaleString('fa-IR')}
          </div>
        </div>
        <div className="stat-card" style={{ borderTop:'3px solid #8b5cf6' }}>
          <div className="stat-label">قابل فروش</div>
          <div className="stat-value" style={{ color:'#8b5cf6' }}>
            {loading ? '...' : (s.totalSaleable || 0).toLocaleString('fa-IR')}
          </div>
          <div style={{ color:'#94a3b8', fontSize:12 }}>
            در انتظار: {s.pendingOrders || 0}
          </div>
        </div>
      </div>

      {/* نمودار ماهانه */}
      <div className="card" style={{ marginBottom:24 }}>
        <div className="card-header">
          <h3 className="card-title">📈 روند ماهانه</h3>
          <span style={{ color:'#94a3b8', fontSize:12 }}>۶ ماه اخیر</span>
        </div>
        {loading ? (
          <div className="loading-spinner"><div className="spinner"/><p>در حال بارگذاری...</p></div>
        ) : !summaryData?.chartData?.length ? (
          <div className="empty-state" style={{ minHeight:180 }}>
            <span>📊</span><p>داده‌ای برای نمایش وجود ندارد</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={summaryData.chartData} margin={{ top:5, right:10, left:-10, bottom:0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,.05)" />
              <XAxis dataKey="name" tick={{ fill:'#64748b', fontSize:12 }} />
              <YAxis tick={{ fill:'#64748b', fontSize:11 }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ color:'#94a3b8', fontSize:12 }} />
              <Bar dataKey="سفارش" fill="#f59e0b" radius={[4,4,0,0]} />
              <Bar dataKey="تولید" fill="#3b82f6" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* فیلترها */}
      <div className="card" style={{ marginBottom:20 }}>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr auto', gap:12, alignItems:'end' }}>
          <div className="form-group" style={{ margin:0 }}>
            <label className="form-label">وضعیت</label>
            <select className="form-input" value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}>
              <option value="">همه</option>
              <option value="pending">در انتظار</option>
              <option value="processing">در حال تولید</option>
              <option value="completed">تکمیل شده</option>
              <option value="cancelled">لغو شده</option>
            </select>
          </div>
          <div className="form-group" style={{ margin:0 }}>
            <label className="form-label">از تاریخ</label>
            <input className="form-input" type="date" value={dateFrom}
              onChange={e => { setDateFrom(e.target.value); setPage(1); }} />
          </div>
          <div className="form-group" style={{ margin:0 }}>
            <label className="form-label">تا تاریخ</label>
            <input className="form-input" type="date" value={dateTo}
              onChange={e => { setDateTo(e.target.value); setPage(1); }} />
          </div>
          <button className="btn btn-ghost" onClick={() => { setStatusFilter(''); setDateFrom(''); setDateTo(''); setPage(1); }}>
            پاک کردن
          </button>
        </div>
      </div>

      {/* جدول سفارشات */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">سفارشات</h3>
          <span style={{ color:'#94a3b8', fontSize:13 }}>
            {pagination.total?.toLocaleString('fa-IR')} مورد
          </span>
        </div>

        {loading ? (
          <div className="loading-spinner"><div className="spinner"/><p>در حال بارگذاری...</p></div>
        ) : orders.length === 0 ? (
          <div className="empty-state"><span>📋</span><p>سفارشی یافت نشد</p></div>
        ) : (
          <>
            <div className="table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>کد</th><th>نام</th><th>وضعیت</th>
                    <th>کل تولید</th><th>بسته‌بندی</th><th>قابل فروش</th>
                    <th>تاریخ</th><th>ثبت‌کننده</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map(o => {
                    const st = STATUS_MAP[o.status] || { label: o.status, color:'#94a3b8' };
                    return (
                      <tr key={o.id}>
                        <td><span style={{ color:'#f59e0b', fontFamily:'monospace', fontSize:12 }}>{o.code}</span></td>
                        <td style={{ fontWeight:500 }}>{o.name}</td>
                        <td>
                          <span style={{
                            background:`${st.color}22`, color:st.color,
                            padding:'2px 8px', borderRadius:12, fontSize:12, fontWeight:600
                          }}>{st.label}</span>
                        </td>
                        <td>{(o.totalCount    || 0).toLocaleString('fa-IR')}</td>
                        <td>{(o.packingCount  || 0).toLocaleString('fa-IR')}</td>
                        <td style={{ color:'#34d399' }}>{(o.saleableCount || 0).toLocaleString('fa-IR')}</td>
                        <td style={{ color:'#94a3b8', fontSize:13 }}>
                          {o.date
                            ? new Date(o.date).toLocaleDateString('fa-IR')
                            : new Date(o.createdAt).toLocaleDateString('fa-IR')}
                        </td>
                        <td style={{ color:'#94a3b8' }}>{o.creator?.displayName || '—'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* صفحه‌بندی */}
            {pagination.pages > 1 && (
              <div style={{ display:'flex', justifyContent:'center', alignItems:'center', gap:12, padding:'16px 0 4px' }}>
                <button className="btn btn-ghost" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>← قبلی</button>
                <span style={{ color:'#94a3b8', fontSize:13 }}>
                  صفحه {page} از {pagination.pages}
                </span>
                <button className="btn btn-ghost" disabled={page >= pagination.pages} onClick={() => setPage(p => p + 1)}>بعدی →</button>
              </div>
            )}
          </>
        )}
      </div>

      {/* یادداشت */}
      <div style={{ marginTop:16, padding:'12px 18px', background:'rgba(59,130,246,.08)',
        border:'1px solid rgba(59,130,246,.2)', borderRadius:10, color:'#94a3b8', fontSize:13 }}>
        💡 پس از مهاجرت به ساختار جدید، جدول پرداخت‌ها (چک، نقدی، انتقال) اضافه خواهد شد.
      </div>

    </div>
  );
}
