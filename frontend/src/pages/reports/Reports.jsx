import { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import {
  Download, FileSpreadsheet, Filter, Package, CheckCircle,
  TrendingUp, Clock,
} from 'lucide-react';
import ordersService from '../../services/orders.service';
import api from '../../services/api';

const monthlyData = [
  { name: 'فروردین',  سفارشات: 42 },
  { name: 'اردیبهشت', سفارشات: 58 },
  { name: 'خرداد',   سفارشات: 47 },
  { name: 'تیر',     سفارشات: 73 },
  { name: 'مرداد',   سفارشات: 68 },
  { name: 'شهریور',  سفارشات: 89 },
];

const statusMap = {
  PENDING:     { label: 'در انتظار',    cls: 'badge-gray'   },
  CONFIRMED:   { label: 'تایید شده',   cls: 'badge-blue'   },
  IN_PROGRESS: { label: 'در حال تولید', cls: 'badge-yellow' },
  READY:       { label: 'آماده تحویل', cls: 'badge-purple' },
  DELIVERED:   { label: 'تحویل شده',   cls: 'badge-green'  },
  CANCELLED:   { label: 'لغو شده',     cls: 'badge-red'    },
  pending:     { label: 'در انتظار',    cls: 'badge-gray'   },
  processing:  { label: 'در حال تولید', cls: 'badge-yellow' },
  completed:   { label: 'تحویل شده',   cls: 'badge-green'  },
  cancelled:   { label: 'لغو شده',     cls: 'badge-red'    },
};

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="custom-tooltip">
      <div className="tooltip-label">{label}</div>
      {payload.map((p, i) => (
        <div key={i} className="tooltip-val" style={{ color: p.color }}>{p.name}: {p.value}</div>
      ))}
    </div>
  );
};

const Reports = () => {
  const [loading, setLoading]       = useState(false);
  const [statsLoading, setStatsLoading] = useState(true);
  const [orders, setOrders]         = useState([]);
  const [statistics, setStatistics] = useState({});
  const [filters, setFilters]       = useState({ startDate: '', endDate: '', status: '' });

  useEffect(() => { loadStatistics(); }, []);

  const loadStatistics = async () => {
    try {
      setStatsLoading(true);
      const resp = await ordersService.getAll({ limit: 1000 });
      const raw = resp.orders || [];

      const total     = raw.length;
      const pending   = raw.filter(o => ['pending', 'PENDING'].includes(o.status)).length;
      const completed = raw.filter(o => ['completed', 'DELIVERED'].includes(o.status)).length;
      const qty       = raw.reduce((s, o) => s + (o.totalCount || o.quantity || 0), 0);

      setOrders(raw);
      setStatistics({ total, pending, completed, qty, rate: total ? Math.round((completed / total) * 100) : 0 });
    } catch {
      setStatistics({ total: 0, pending: 0, completed: 0, qty: 0, rate: 0 });
    } finally {
      setStatsLoading(false);
    }
  };

  const exportExcel = async (type) => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate)   params.append('endDate', filters.endDate);
      if (filters.status)    params.append('status', filters.status);

      const response = await api.get(`/reports/excel/${type}?${params}`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const a = document.createElement('a');
      a.href = url;
      a.download = `${type}-${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      alert('خطا در دانلود گزارش');
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = orders.filter((o) => {
    if (filters.startDate && new Date(o.date || o.orderDate) < new Date(filters.startDate)) return false;
    if (filters.endDate   && new Date(o.date || o.orderDate) > new Date(filters.endDate))   return false;
    if (filters.status    && o.status !== filters.status) return false;
    return true;
  });

  const getStatus = (s) => statusMap[s?.toUpperCase()] || statusMap[s] || { label: s, cls: 'badge-gray' };

  const statCards = [
    { icon: Package,      iconColor: '#60a5fa', iconBg: 'rgba(59,130,246,0.15)',  label: 'کل سفارشات',       val: statistics.total     || 0 },
    { icon: CheckCircle,  iconColor: '#34d399', iconBg: 'rgba(16,185,129,0.15)', label: 'تحویل شده',         val: statistics.completed  || 0 },
    { icon: TrendingUp,   iconColor: '#a78bfa', iconBg: 'rgba(139,92,246,0.15)', label: 'کل تولید (عدد)',    val: statistics.qty        || 0 },
    { icon: Clock,        iconColor: '#fbbf24', iconBg: 'rgba(245,158,11,0.15)', label: 'در انتظار',         val: statistics.pending    || 0 },
  ];

  return (
    <>
      {/* ─── STATS ─── */}
      <div className="stat-grid animate-fadeUp">
        {statCards.map((s, i) => (
          <div key={i} className={`stat-card stat-card-${i + 1}`}>
            <div className="stat-icon-wrap" style={{ background: s.iconBg }}>
              <s.icon size={20} color={s.iconColor} />
            </div>
            <div className="stat-value">{s.val.toLocaleString()}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="grid-3-1 mb-20 animate-fadeUp delay-2">
        {/* Monthly Chart */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">روند ماهانه سفارشات</div>
            <button className="btn btn-ghost btn-sm" onClick={() => exportExcel('orders')}>
              <Download size={13} /> خروجی
            </button>
          </div>
          <div style={{ padding: '8px 16px 16px' }}>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 11, fontFamily: 'Vazirmatn' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="سفارشات" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Export Buttons */}
        <div className="card">
          <div className="card-header"><div className="card-title">خروجی گزارشات</div></div>
          <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              { label: 'گزارش سفارشات',   type: 'orders',      color: '#f59e0b' },
              { label: 'گزارش موجودی',    type: 'inventory',   color: '#10b981' },
              { label: 'گزارش پیمانکاران', type: 'contractors', color: '#3b82f6' },
              { label: 'خلاصه عملکرد',    type: 'summary',     color: '#8b5cf6' },
            ].map((e) => (
              <button
                key={e.type}
                className="btn btn-ghost"
                style={{ justifyContent: 'flex-start', borderColor: `${e.color}33` }}
                onClick={() => exportExcel(e.type)}
                disabled={loading}
              >
                <FileSpreadsheet size={14} color={e.color} />
                {e.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ─── FILTERS ─── */}
      <div className="card mb-20 animate-fadeUp delay-3">
        <div className="card-header">
          <div className="flex-center gap-8">
            <Filter size={15} />
            <div className="card-title">فیلترها</div>
          </div>
          <div className="flex gap-8">
            <button className="btn btn-ghost btn-sm" onClick={() => setFilters({ startDate: '', endDate: '', status: '' })}>
              پاک کردن
            </button>
            <button className="btn btn-primary btn-sm" onClick={loadStatistics}>
              اعمال فیلتر
            </button>
          </div>
        </div>
        <div className="card-body">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12 }}>
            {[
              { label: 'تاریخ شروع', key: 'startDate', type: 'date' },
              { label: 'تاریخ پایان', key: 'endDate',   type: 'date' },
            ].map(({ label, key, type }) => (
              <div key={key}>
                <div className="form-label">{label}</div>
                <input
                  type={type}
                  className="form-input form-input-ltr"
                  value={filters[key]}
                  onChange={(e) => setFilters(p => ({ ...p, [key]: e.target.value }))}
                />
              </div>
            ))}
            <div>
              <div className="form-label">وضعیت</div>
              <select
                value={filters.status}
                onChange={(e) => setFilters(p => ({ ...p, status: e.target.value }))}
                style={{
                  width: '100%', background: 'rgba(255,255,255,0.05)',
                  border: '1px solid var(--border-light)', borderRadius: 10,
                  padding: '10px 14px', color: 'var(--text-primary)',
                  fontFamily: 'var(--font)', fontSize: 14, outline: 'none',
                }}
              >
                <option value="">همه وضعیت‌ها</option>
                <option value="PENDING">در انتظار</option>
                <option value="IN_PROGRESS">در حال تولید</option>
                <option value="DELIVERED">تحویل شده</option>
                <option value="CANCELLED">لغو شده</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* ─── ORDERS TABLE ─── */}
      <div className="card animate-fadeUp delay-4">
        <div className="card-header">
          <div className="card-title">آخرین سفارشات</div>
          <div className="text-muted text-sm">{filteredOrders.length} سفارش</div>
        </div>
        <div className="card-body" style={{ padding: '8px 0 0' }}>
          {statsLoading ? (
            <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>
              در حال بارگذاری...
            </div>
          ) : filteredOrders.length === 0 ? (
            <div style={{ padding: 40, textAlign: 'center' }}>
              <Package size={40} color="var(--text-muted)" />
              <div className="text-muted mt-8">هیچ سفارشی یافت نشد</div>
            </div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>کد</th>
                    <th>نام</th>
                    <th>تاریخ</th>
                    <th>تعداد</th>
                    <th>وضعیت</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.slice(0, 10).map((o) => {
                    const st = getStatus(o.status);
                    return (
                      <tr key={o.id}>
                        <td><span className="font-bold text-gold">{o.code || o.id}</span></td>
                        <td className="text-primary">{o.name || o.customer || '—'}</td>
                        <td className="text-secondary">
                          {o.date || (o.orderDate ? new Date(o.orderDate).toLocaleDateString('fa-IR') : '—')}
                        </td>
                        <td>{o.totalCount || o.quantity || 0}</td>
                        <td>
                          <span className={`badge ${st.cls}`}>
                            <span className="badge-dot" style={{ background: 'currentColor' }} />
                            {st.label}
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
      </div>
    </>
  );
};

export default Reports;
