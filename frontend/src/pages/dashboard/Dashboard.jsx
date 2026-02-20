import { useState, useEffect } from 'react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts';
import {
  ShoppingBag, Package, Truck, Wallet,
  TrendingUp, TrendingDown, Download, ChevronRight, Eye, Edit2,
  CheckCircle, Clock, AlertCircle,
} from 'lucide-react';

// ─── MOCK DATA ───
const chartData = [
  { name: 'فروردین',  سفارشات: 42, تولید: 38 },
  { name: 'اردیبهشت', سفارشات: 58, تولید: 52 },
  { name: 'خرداد',   سفارشات: 47, تولید: 45 },
  { name: 'تیر',     سفارشات: 73, تولید: 65 },
  { name: 'مرداد',   سفارشات: 68, تولید: 70 },
  { name: 'شهریور',  سفارشات: 89, تولید: 82 },
];

const pieData = [
  { name: 'سالم',    value: 52, color: '#10b981' },
  { name: 'اقتصادی', value: 28, color: '#3b82f6' },
  { name: 'نمونه',   value: 12, color: '#8b5cf6' },
  { name: 'استوک',   value: 8,  color: '#f59e0b' },
];

const weeklyBar = [
  { d: 'ش',  v: 820  },
  { d: 'ی',  v: 650  },
  { d: 'د',  v: 910  },
  { d: 'س',  v: 780  },
  { d: 'چ',  v: 1020 },
  { d: 'پ',  v: 880  },
  { d: 'ج',  v: 340  },
];

const recentOrders = [
  { id: 'RJ-1024', customer: 'بازار بزرگ تهران',        status: 'IN_PROGRESS', priority: 'URGENT'  },
  { id: 'RJ-1023', customer: 'فروشگاه مد پارس',         status: 'READY',       priority: 'HIGH'    },
  { id: 'RJ-1022', customer: 'گالری لباس آرمیتا',       status: 'CONFIRMED',   priority: 'NORMAL'  },
  { id: 'RJ-1021', customer: 'پوشاک رضایی',             status: 'DELIVERED',   priority: 'NORMAL'  },
  { id: 'RJ-1020', customer: 'بازار تجریش',             status: 'PENDING',     priority: 'LOW'     },
];

const statusMap = {
  PENDING:     { label: 'در انتظار',    cls: 'badge-gray'   },
  CONFIRMED:   { label: 'تایید شده',   cls: 'badge-blue'   },
  IN_PROGRESS: { label: 'در حال تولید', cls: 'badge-yellow' },
  READY:       { label: 'آماده تحویل', cls: 'badge-purple' },
  DELIVERED:   { label: 'تحویل شده',   cls: 'badge-green'  },
  CANCELLED:   { label: 'لغو شده',     cls: 'badge-red'    },
};

const priorityMap = {
  URGENT: { label: 'فوری',  cls: 'priority-urgent' },
  HIGH:   { label: 'بالا',  cls: 'priority-high'   },
  NORMAL: { label: 'عادی',  cls: 'priority-normal' },
  LOW:    { label: 'پایین', cls: 'priority-low'    },
};

// ─── CUSTOM TOOLTIP ───
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="custom-tooltip">
      <div className="tooltip-label">{label}</div>
      {payload.map((p, i) => (
        <div key={i} className="tooltip-val" style={{ color: p.color }}>
          {p.name}: {p.value}
        </div>
      ))}
    </div>
  );
};

// ─── DASHBOARD ───
const Dashboard = () => {
  const [progWidths, setProgWidths] = useState([0, 0, 0, 0]);

  useEffect(() => {
    const t = setTimeout(() => setProgWidths([78, 62, 91, 45]), 300);
    return () => clearTimeout(t);
  }, []);

  const stats = [
    {
      cls: 'stat-card-1', icon: ShoppingBag,
      iconBg: 'rgba(59,130,246,0.2)', iconColor: '#60a5fa',
      value: '۱,۲۴۷', label: 'کل سفارشات', change: '+۱۲٪', up: true,
    },
    {
      cls: 'stat-card-2', icon: Package,
      iconBg: 'rgba(16,185,129,0.2)', iconColor: '#34d399',
      value: '۸۴,۳۲۰', label: 'محصول تولید شده', change: '+۸٪', up: true,
    },
    {
      cls: 'stat-card-3', icon: Truck,
      iconBg: 'rgba(139,92,246,0.2)', iconColor: '#a78bfa',
      value: '۴۲', label: 'پیمانکار فعال', change: '-۲', up: false,
    },
    {
      cls: 'stat-card-4', icon: Wallet,
      iconBg: 'rgba(245,158,11,0.2)', iconColor: '#fbbf24',
      value: '۴.۸B', label: 'درآمد شهریور (ت)', change: '+۲۳٪', up: true,
    },
  ];

  return (
    <>
      {/* ─── STAT CARDS ─── */}
      <div className="stat-grid">
        {stats.map((s, i) => (
          <div key={i} className={`stat-card ${s.cls} animate-fadeUp delay-${i + 1}`}>
            <div className="stat-icon-wrap" style={{ background: s.iconBg }}>
              <s.icon size={20} color={s.iconColor} />
            </div>
            <div className="stat-value">{s.value}</div>
            <div className="stat-label">{s.label}</div>
            <div className={`stat-change ${s.up ? 'up' : 'down'}`}>
              {s.up ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
              {s.change} نسبت به ماه گذشته
            </div>
          </div>
        ))}
      </div>

      {/* ─── CHARTS ROW ─── */}
      <div className="grid-3-1 mb-20 animate-fadeUp delay-3">
        {/* Area Chart */}
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">روند سفارشات و تولید</div>
              <div className="card-sub">۶ ماه گذشته</div>
            </div>
            <div className="flex gap-8">
              <div className="date-chip">ماهانه</div>
              <button className="btn btn-ghost btn-sm"><Download size={13} /></button>
            </div>
          </div>
          <div className="card-body" style={{ paddingTop: 8 }}>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="gSfr" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%"   stopColor="#f59e0b" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#f59e0b" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gTol" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%"   stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 11, fontFamily: 'Vazirmatn' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="سفارشات" stroke="#f59e0b" strokeWidth={2} fill="url(#gSfr)" />
                <Area type="monotone" dataKey="تولید"   stroke="#3b82f6" strokeWidth={2} fill="url(#gTol)" />
              </AreaChart>
            </ResponsiveContainer>
            <div className="flex gap-12 mt-8">
              {[['#f59e0b', 'سفارشات'], ['#3b82f6', 'تولید']].map(([c, l]) => (
                <div key={l} className="flex-center gap-8 text-xs text-secondary">
                  <div style={{ width: 10, height: 10, borderRadius: 3, background: c }} />
                  {l}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Pie Chart */}
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">توزیع دسته‌بندی</div>
              <div className="card-sub">کیفیت محصولات</div>
            </div>
          </div>
          <div className="card-body" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <PieChart width={160} height={160}>
              <Pie data={pieData} cx={75} cy={75} innerRadius={50} outerRadius={72} dataKey="value" paddingAngle={3}>
                {pieData.map((e, i) => <Cell key={i} fill={e.color} />)}
              </Pie>
            </PieChart>
            <div style={{ width: '100%', marginTop: 8 }}>
              {pieData.map((d, i) => (
                <div key={i} className="flex-between text-xs mb-8">
                  <div className="flex-center gap-8">
                    <div style={{ width: 8, height: 8, borderRadius: 2, background: d.color }} />
                    <span className="text-secondary">{d.name}</span>
                  </div>
                  <span className="font-bold" style={{ color: d.color }}>{d.value}٪</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ─── BOTTOM ROW ─── */}
      <div className="grid-2 animate-fadeUp delay-4">
        {/* Recent Orders */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">سفارشات اخیر</div>
            <button className="btn btn-ghost btn-sm">
              مشاهده همه <ChevronRight size={12} />
            </button>
          </div>
          <div className="card-body" style={{ padding: '8px 0 0' }}>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>کد</th>
                    <th>مشتری</th>
                    <th>وضعیت</th>
                    <th>اولویت</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((o) => (
                    <tr key={o.id}>
                      <td><span className="font-bold text-gold">{o.id}</span></td>
                      <td className="text-primary font-medium">
                        {o.customer.substring(0, 14)}{o.customer.length > 14 ? '…' : ''}
                      </td>
                      <td>
                        <span className={`badge ${statusMap[o.status].cls}`}>
                          <span className="badge-dot" style={{ background: 'currentColor' }} />
                          {statusMap[o.status].label}
                        </span>
                      </td>
                      <td>
                        <span className={priorityMap[o.priority].cls}>
                          {priorityMap[o.priority].label}
                        </span>
                      </td>
                      <td>
                        <div className="flex gap-8">
                          <button className="icon-btn" style={{ width: 26, height: 26, borderRadius: 6 }}>
                            <Eye size={11} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Progress + Weekly Bar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Production Lines Progress */}
          <div className="card" style={{ flex: 1 }}>
            <div className="card-header">
              <div className="card-title">پیشرفت خطوط تولید</div>
            </div>
            <div className="card-body">
              {[
                { name: 'خط تولید A', pct: progWidths[0], color: '#f59e0b' },
                { name: 'خط تولید B', pct: progWidths[1], color: '#3b82f6' },
                { name: 'خط تولید C', pct: progWidths[2], color: '#10b981' },
                { name: 'خط تولید D', pct: progWidths[3], color: '#8b5cf6' },
              ].map((p) => (
                <div key={p.name} className="progress-wrap">
                  <div className="progress-head">
                    <span className="progress-name">{p.name}</span>
                    <span className="progress-pct" style={{ color: p.color }}>{p.pct}٪</span>
                  </div>
                  <div className="progress-bg">
                    <div
                      className="progress-fill"
                      style={{ width: `${p.pct}%`, background: `linear-gradient(to left, ${p.color}, ${p.color}88)` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Weekly Bar Chart */}
          <div className="card" style={{ flex: 1 }}>
            <div className="card-header">
              <div className="card-title">تولید هفتگی</div>
              <div className="card-sub">این هفته</div>
            </div>
            <div style={{ padding: '8px 16px 16px' }}>
              <ResponsiveContainer width="100%" height={110}>
                <BarChart data={weeklyBar}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                  <XAxis dataKey="d" tick={{ fill: '#64748b', fontSize: 11, fontFamily: 'Vazirmatn' }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="v" name="تعداد" fill="#f59e0b" radius={[4, 4, 0, 0]}
                    background={{ fill: 'rgba(255,255,255,0.02)', radius: [4, 4, 0, 0] }} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Dashboard;
