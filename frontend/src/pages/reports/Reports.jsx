import React, { useState, useEffect, useCallback } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import api from '../../services/api';

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

export default function Reports() {
  const [stats, setStats]         = useState(null);
  const [orders, setOrders]       = useState([]);
  const [pagination, setPagination] = useState({ page:1, pages:1, total:0 });
  const [loading, setLoading]     = useState(true);
  const [exporting, setExporting] = useState(null);
  const [error, setError]         = useState(null);

  // فیلترها
  const [dateFrom, setDateFrom]   = useState('');
  const [dateTo, setDateTo]       = useState('');
  const [status, setStatus]       = useState('');
  const [page, setPage]           = useState(1);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const orderParams = { page, limit:15 };
      if (status)   orderParams.status   = status;
      if (dateFrom) orderParams.dateFrom = dateFrom;
      if (dateTo)   orderParams.dateTo   = dateTo;

      const [statsRes, ordersRes] = await Promise.all([
        api.get('/reports/statistics'),
        api.get('/orders', { params: orderParams }),
      ]);

      setStats(statsRes.data);
      setOrders(ordersRes.data.orders || []);
      setPagination(ordersRes.data.pagination || { page:1, pages:1, total:0 });
    } catch (err) {
      console.error('Reports load error:', err);
      setError('خطا در دریافت گزارشات');
    } finally {
      setLoading(false);
    }
  }, [page, status, dateFrom, dateTo]);

  useEffect(() => { loadData(); }, [loadData]);

  const handleExport = async (type) => {
    try {
      setExporting(type);
      const params = {};
      if (status)   params.status    = status;
      if (dateFrom) params.startDate = dateFrom;
      if (dateTo)   params.endDate   = dateTo;

      const res = await api.get(`/reports/excel/${type}`, { params });
      const data = res.data?.data;
      if (!data?.length) { alert('داده‌ای برای خروجی وجود ندارد'); return; }

      const keys = Object.keys(data[0]);
      const csv  = [keys.join(','), ...data.map(r => keys.map(k => `"${r[k] ?? ''}"`).join(','))].join('\n');
      const blob = new Blob(['\uFEFF' + csv], { type:'text/csv;charset=utf-8;' });
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement('a');
      a.href = url; a.download = `${type}-report.csv`; a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      alert('خطا در خروجی گرفتن');
    } finally {
      setExporting(null);
    }
  };

  // داده چارت ماهانه از سفارشات
  const chartData = React.useMemo(() => {
    if (!orders.length) return [];
    const map = {};
    const months = ['فروردین','اردیبهشت','خرداد','تیر','مرداد','شهریور','مهر','آبان','آذر','دی','بهمن','اسفند'];
    orders.forEach(o => {
      const d = new Date(o.date || o.createdAt);
      const k = `${d.getFullYear()}-${d.getMonth()}`;
      if (!map[k]) map[k] = { name:months[d.getMonth()], سفارشات:0, تولید:0 };
      map[k].سفارشات += 1;
      map[k].تولید   += o.totalCount || 0;
    });
    return Object.values(map);
  }, [orders]);

  return (
    <div className="page-container">

      {/* هدر */}
      <div className="page-header">
        <div>
          <h1 className="page-title">گزارشات</h1>
          <p className="page-subtitle">تحلیل و خروجی داده‌های سیستم</p>
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
        {[
          { label:'کل سفارشات',   value: stats?.totalOrders,    color:'#f59e0b', icon:'📦' },
          { label:'تکمیل شده',    value: stats?.completedOrders, color:'#10b981', icon:'✅' },
          { label:'کل تولید',     value: stats?.totalQuantity,   color:'#3b82f6', icon:'🏭' },
          { label:'در انتظار',    value: stats?.pendingOrders,   color:'#94a3b8', icon:'⏳' },
        ].map((c, i) => (
          <div key={i} className="stat-card" style={{ borderTop:`3px solid ${c.color}` }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8 }}>
              <div className="stat-label">{c.label}</div>
              <span style={{ fontSize:22 }}>{c.icon}</span>
            </div>
            <div className="stat-value" style={{ color:c.color }}>
              {loading ? '...' : (c.value || 0).toLocaleString('fa-IR')}
            </div>
          </div>
        ))}
      </div>

      {/* نمودار */}
      <div className="card" style={{ marginBottom:24 }}>
        <div className="card-header">
          <h3 className="card-title">📈 نمودار سفارشات و تولید</h3>
        </div>
        {loading ? (
          <div className="loading-spinner"><div className="spinner"/><p>در حال بارگذاری...</p></div>
        ) : chartData.length === 0 ? (
          <div className="empty-state" style={{ minHeight:180 }}>
            <span>📊</span><p>داده‌ای برای نمایش وجود ندارد</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={chartData} margin={{ top:5, right:10, left:-10, bottom:0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,.05)" />
              <XAxis dataKey="name" tick={{ fill:'#64748b', fontSize:12 }} />
              <YAxis tick={{ fill:'#64748b', fontSize:11 }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ color:'#94a3b8', fontSize:12 }} />
              <Bar dataKey="سفارشات" fill="#f59e0b" radius={[4,4,0,0]} />
              <Bar dataKey="تولید"   fill="#3b82f6" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* فیلترها و خروجی */}
      <div className="card" style={{ marginBottom:24 }}>
        <div className="card-header">
          <h3 className="card-title">🔍 فیلتر و خروجی</h3>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr auto', gap:12, marginBottom:16, alignItems:'end' }}>
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
          <div className="form-group" style={{ margin:0 }}>
            <label className="form-label">وضعیت</label>
            <select className="form-input" value={status}
              onChange={e => { setStatus(e.target.value); setPage(1); }}>
              <option value="">همه وضعیت‌ها</option>
              <option value="pending">در انتظار</option>
              <option value="processing">در حال تولید</option>
              <option value="completed">تکمیل شده</option>
              <option value="cancelled">لغو شده</option>
            </select>
          </div>
          <button className="btn btn-ghost"
            onClick={() => { setStatus(''); setDateFrom(''); setDateTo(''); setPage(1); }}>
            پاک کردن
          </button>
        </div>

        {/* دکمه‌های خروجی */}
        <div style={{ borderTop:'1px solid rgba(255,255,255,.06)', paddingTop:16 }}>
          <div style={{ color:'#94a3b8', fontSize:13, marginBottom:12 }}>📥 خروجی Excel:</div>
          <div style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
            {[
              { key:'orders',      label:'خروجی سفارشات' },
              { key:'inventory',   label:'خروجی موجودی' },
              { key:'contractors', label:'خروجی پیمانکاران' },
              { key:'summary',     label:'گزارش خلاصه' },
            ].map(btn => (
              <button key={btn.key} className="btn btn-ghost"
                style={{ fontSize:13 }}
                disabled={exporting === btn.key}
                onClick={() => handleExport(btn.key)}>
                {exporting === btn.key ? '⏳ در حال خروجی...' : `📊 ${btn.label}`}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* جدول سفارشات */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">لیست سفارشات</h3>
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
                    <th>کد</th><th>نام</th><th>تعداد</th><th>بسته‌بندی</th>
                    <th>وضعیت</th><th>تاریخ</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map(o => {
                    const st = STATUS_MAP[o.status] || { label: o.status, color:'#94a3b8' };
                    return (
                      <tr key={o.id}
                        style={{ cursor:'pointer' }}
                        onClick={() => window.location.href = `/orders/${o.id}`}>
                        <td><span style={{ color:'#f59e0b', fontFamily:'monospace', fontSize:12 }}>{o.code}</span></td>
                        <td style={{ fontWeight:500 }}>{o.name}</td>
                        <td>{(o.totalCount   || 0).toLocaleString('fa-IR')}</td>
                        <td>{(o.packingCount || 0).toLocaleString('fa-IR')}</td>
                        <td>
                          <span style={{
                            background:`${st.color}22`, color:st.color,
                            padding:'2px 8px', borderRadius:12, fontSize:12, fontWeight:600
                          }}>{st.label}</span>
                        </td>
                        <td style={{ color:'#94a3b8', fontSize:13 }}>
                          {o.date
                            ? new Date(o.date).toLocaleDateString('fa-IR')
                            : new Date(o.createdAt).toLocaleDateString('fa-IR')}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {pagination.pages > 1 && (
              <div style={{ display:'flex', justifyContent:'center', alignItems:'center', gap:12, padding:'16px 0 4px' }}>
                <button className="btn btn-ghost" disabled={page <= 1} onClick={() => setPage(p => p-1)}>← قبلی</button>
                <span style={{ color:'#94a3b8', fontSize:13 }}>
                  صفحه {page} از {pagination.pages}
                </span>
                <button className="btn btn-ghost" disabled={page >= pagination.pages} onClick={() => setPage(p => p+1)}>بعدی →</button>
              </div>
            )}
          </>
        )}
      </div>

    </div>
  );
}
