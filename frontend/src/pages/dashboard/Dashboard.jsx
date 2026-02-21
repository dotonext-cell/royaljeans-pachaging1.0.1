import React, { useState, useEffect, useCallback } from 'react';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { dashboardService } from '../../services/dashboard.service';

// ─── ثابت‌ها ─────────────────────────────────────────────────
const STATUS_MAP = {
  pending:     { label: 'در انتظار',     color: '#94a3b8', bg: 'rgba(148,163,184,0.15)' },
  processing:  { label: 'در حال تولید',  color: '#fbbf24', bg: 'rgba(251,191,36,0.15)'  },
  in_progress: { label: 'در حال تولید',  color: '#fbbf24', bg: 'rgba(251,191,36,0.15)'  },
  completed:   { label: 'تکمیل شده',     color: '#34d399', bg: 'rgba(52,211,153,0.15)'  },
  delivered:   { label: 'تحویل شده',     color: '#34d399', bg: 'rgba(52,211,153,0.15)'  },
  cancelled:   { label: 'لغو شده',       color: '#f87171', bg: 'rgba(248,113,113,0.15)' },
};

const INVENTORY_COLORS = ['#f59e0b', '#3b82f6', '#8b5cf6', '#10b981'];

// ─── کامپوننت‌های کمکی ───────────────────────────────────────
const StatCard = ({ icon, label, value, sub, color, trend, trendValue, loading }) => (
  <div className="stat-card" style={{ borderTop: `3px solid ${color}` }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
      <div>
        <div className="stat-label">{label}</div>
        <div className="stat-value" style={{ color }}>
          {loading ? '...' : (value ?? '—')}
        </div>
        {sub && <div className="stat-sub">{sub}</div>}
      </div>
      <div className="stat-icon" style={{ background: `${color}22`, color }}>
        {icon}
      </div>
    </div>
    {trend !== undefined && (
      <div className={`stat-trend ${trend >= 0 ? 'up' : 'down'}`}>
        {trend >= 0 ? '▲' : '▼'} {Math.abs(trendValue ?? trend)}٪ نسبت به ماه قبل
      </div>
    )}
  </div>
);

const StatusBadge = ({ status }) => {
  const s = STATUS_MAP[status] || { label: status, color: '#94a3b8', bg: 'rgba(148,163,184,0.15)' };
  return (
    <span style={{
      display: 'inline-block', padding: '3px 10px', borderRadius: 20,
      fontSize: 12, fontWeight: 600, color: s.color, background: s.bg,
    }}>
      {s.label}
    </span>
  );
};

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: '#1e293b', border: '1px solid #334155',
      borderRadius: 10, padding: '10px 16px', fontSize: 13, direction: 'rtl'
    }}>
      <div style={{ color: '#94a3b8', marginBottom: 6 }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ color: p.color, display: 'flex', gap: 8 }}>
          <span>{p.name}:</span>
          <span style={{ fontWeight: 700 }}>{p.value?.toLocaleString()}</span>
        </div>
      ))}
    </div>
  );
};

// ─── داشبورد اصلی ────────────────────────────────────────────
export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadDashboard = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await dashboardService.getStats();
      setData(result);
    } catch (err) {
      console.error('Dashboard load error:', err);
      setError('خطا در دریافت اطلاعات. لطفاً صفحه را رفرش کنید.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  // داده پیش‌فرض برای chart هنگام لود
  const chartData  = data?.chartData  || [];
  const orders     = data?.orders     || {};
  const inventory  = data?.inventory  || {};
  const contractors = data?.contractors || {};
  const recentOrders = data?.recentOrders || [];

  // داده‌های پای چارت از موجودی واقعی
  const pieData = [
    { name: 'پارچه',       value: inventory.fabric     || 0 },
    { name: 'دوخت',        value: inventory.production || 0 },
    { name: 'سنگشویی',     value: inventory.wash       || 0 },
    { name: 'بسته‌بندی',   value: inventory.packaging  || 0 },
  ].filter(d => d.value > 0);

  return (
    <div className="page-container" style={{ animation: 'fadeInUp .4s ease' }}>

      {/* هدر */}
      <div className="page-header">
        <div>
          <h1 className="page-title">داشبورد</h1>
          <p className="page-subtitle">خلاصه عملکرد و آمار لحظه‌ای سیستم</p>
        </div>
        <button className="btn btn-ghost" onClick={loadDashboard} disabled={loading} title="رفرش">
          <span style={{ fontSize: 18, display: 'inline-block', animation: loading ? 'spin 1s linear infinite' : 'none' }}>↻</span>
          {loading ? ' در حال بارگذاری...' : ' بروزرسانی'}
        </button>
      </div>

      {/* خطا */}
      {error && (
        <div style={{ background: 'rgba(239,68,68,.15)', border: '1px solid #ef4444',
          borderRadius: 12, padding: '12px 18px', marginBottom: 24, color: '#f87171' }}>
          ⚠️ {error}
        </div>
      )}

      {/* کارت‌های آمار */}
      <div className="stats-grid" style={{ animationDelay: '.1s' }}>
        <StatCard
          icon="📦" label="کل سفارشات" color="#f59e0b"
          value={orders.total?.toLocaleString('fa-IR')}
          sub={`نرخ تکمیل: ${orders.completionRate || 0}٪`}
          loading={loading}
        />
        <StatCard
          icon="⚙️" label="در حال تولید" color="#3b82f6"
          value={orders.processing?.toLocaleString('fa-IR')}
          sub={`تعداد تولید شده: ${(orders.totalProduced || 0).toLocaleString('fa-IR')}`}
          loading={loading}
        />
        <StatCard
          icon="✅" label="تکمیل شده" color="#10b981"
          value={orders.completed?.toLocaleString('fa-IR')}
          sub={`در انتظار: ${orders.pending || 0}`}
          loading={loading}
        />
        <StatCard
          icon="🤝" label="پیمانکاران فعال" color="#8b5cf6"
          value={contractors.active?.toLocaleString('fa-IR')}
          sub={`کل پیمانکاران: ${contractors.total || 0}`}
          loading={loading}
        />
      </div>

      {/* نمودارها */}
      <div className="charts-grid" style={{ animationDelay: '.2s' }}>

        {/* نمودار خطی — روند ماهانه */}
        <div className="card chart-card">
          <div className="card-header">
            <h3 className="card-title">📈 روند ماهانه سفارشات</h3>
            <span style={{ color: '#94a3b8', fontSize: 12 }}>۶ ماه اخیر</span>
          </div>
          {chartData.length === 0 ? (
            <div className="empty-state" style={{ minHeight: 200 }}>
              <span>📊</span>
              <p>{loading ? 'در حال بارگذاری...' : 'داده‌ای برای نمایش وجود ندارد'}</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={chartData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="gradOrders" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gradProd" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,.05)" />
                <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 11 }} />
                <YAxis tick={{ fill: '#64748b', fontSize: 11 }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ color: '#94a3b8', fontSize: 12 }} />
                <Area type="monotone" dataKey="سفارشات" stroke="#f59e0b" fill="url(#gradOrders)" strokeWidth={2} />
                <Area type="monotone" dataKey="تولید"   stroke="#3b82f6" fill="url(#gradProd)"   strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* پای چارت — توزیع موجودی */}
        <div className="card chart-card">
          <div className="card-header">
            <h3 className="card-title">🥧 توزیع موجودی</h3>
          </div>
          {pieData.length === 0 ? (
            <div className="empty-state" style={{ minHeight: 200 }}>
              <span>📦</span>
              <p>{loading ? 'در حال بارگذاری...' : 'موجودی ثبت نشده'}</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={85}
                  paddingAngle={4} dataKey="value" nameKey="name">
                  {pieData.map((_, i) => (
                    <Cell key={i} fill={INVENTORY_COLORS[i % INVENTORY_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v) => v.toLocaleString('fa-IR')} />
                <Legend wrapperStyle={{ color: '#94a3b8', fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* جدول سفارشات اخیر */}
      <div className="card" style={{ animationDelay: '.3s' }}>
        <div className="card-header">
          <h3 className="card-title">🕒 آخرین سفارشات</h3>
          <a href="/orders" style={{ color: '#f59e0b', fontSize: 13, textDecoration: 'none' }}>مشاهده همه ←</a>
        </div>

        {recentOrders.length === 0 ? (
          <div className="empty-state">
            <span>📋</span>
            <p>{loading ? 'در حال بارگذاری...' : 'هیچ سفارشی ثبت نشده است'}</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>کد سفارش</th>
                  <th>نام</th>
                  <th>تعداد</th>
                  <th>وضعیت</th>
                  <th>تاریخ</th>
                  <th>ثبت‌کننده</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map(order => (
                  <tr key={order.id}
                    onClick={() => window.location.href = `/orders/${order.id}`}
                    style={{ cursor: 'pointer' }}>
                    <td>
                      <span style={{ color: '#f59e0b', fontWeight: 700, fontFamily: 'monospace' }}>
                        {order.code}
                      </span>
                    </td>
                    <td style={{ fontWeight: 500 }}>{order.name}</td>
                    <td>{(order.totalCount || 0).toLocaleString('fa-IR')}</td>
                    <td><StatusBadge status={order.status} /></td>
                    <td style={{ color: '#94a3b8', fontSize: 13 }}>
                      {order.date
                        ? new Date(order.date).toLocaleDateString('fa-IR')
                        : new Date(order.createdAt).toLocaleDateString('fa-IR')}
                    </td>
                    <td style={{ color: '#94a3b8' }}>{order.creator?.displayName || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* خلاصه موجودی */}
      {!loading && (inventory.fabric || inventory.production || inventory.wash || inventory.packaging) > 0 && (
        <div className="card" style={{ animationDelay: '.4s' }}>
          <div className="card-header">
            <h3 className="card-title">📊 خلاصه موجودی مراحل</h3>
            <a href="/inventory" style={{ color: '#f59e0b', fontSize: 13, textDecoration: 'none' }}>مدیریت انبار ←</a>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, padding: 8 }}>
            {[
              { label: 'پارچه',       value: inventory.fabric,     color: '#f59e0b', icon: '🧵' },
              { label: 'دوخت',        value: inventory.production, color: '#3b82f6', icon: '🪡' },
              { label: 'سنگشویی',     value: inventory.wash,       color: '#8b5cf6', icon: '💧' },
              { label: 'بسته‌بندی',   value: inventory.packaging,  color: '#10b981', icon: '📦' },
            ].map((item, i) => (
              <div key={i} style={{
                background: 'rgba(255,255,255,.03)', borderRadius: 12,
                padding: '14px 18px', border: `1px solid ${item.color}33`,
                display: 'flex', alignItems: 'center', gap: 12
              }}>
                <span style={{ fontSize: 26 }}>{item.icon}</span>
                <div>
                  <div style={{ color: '#94a3b8', fontSize: 12 }}>{item.label}</div>
                  <div style={{ color: item.color, fontSize: 22, fontWeight: 700 }}>
                    {(item.value || 0).toLocaleString('fa-IR')}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
