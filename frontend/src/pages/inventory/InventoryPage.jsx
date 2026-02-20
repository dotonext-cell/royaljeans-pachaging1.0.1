import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { Box, Package, Plus } from 'lucide-react';

const inventoryItems = [
  { name: 'پارچه دنیم ۱۴ اونس', cat: 'پارچه',    qty: 2840,  unit: 'متر',    color: '#3b82f6', bg: 'rgba(59,130,246,0.15)',  low: false },
  { name: 'دکمه فلزی طلایی',     cat: 'اتصالات', qty: 18500, unit: 'عدد',    color: '#f59e0b', bg: 'rgba(245,158,11,0.15)',  low: false },
  { name: 'نخ دوخت آبی',          cat: 'ملزومات', qty: 42,    unit: 'قرقره', color: '#8b5cf6', bg: 'rgba(139,92,246,0.15)',  low: true  },
  { name: 'پارچه دنیم ۱۲ اونس', cat: 'پارچه',    qty: 1200,  unit: 'متر',    color: '#10b981', bg: 'rgba(16,185,129,0.15)', low: false },
];

const weeklyData = [
  { d: 'شنبه',      ورود: 1200, خروج: 800  },
  { d: 'یکشنبه',   ورود: 900,  خروج: 1100 },
  { d: 'دوشنبه',   ورود: 1500, خروج: 700  },
  { d: 'سه‌شنبه',  ورود: 600,  خروج: 1300 },
  { d: 'چهارشنبه', ورود: 1100, خروج: 900  },
  { d: 'پنجشنبه',  ورود: 800,  خروج: 600  },
];

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

const InventoryPage = () => (
  <>
    {/* ─── STAT CARDS ─── */}
    <div className="stat-grid" style={{ gridTemplateColumns: 'repeat(3,1fr)' }}>
      {[
        { label: 'کل موجودی پارچه',   val: '۴,۰۴۰ متر',    color: '#3b82f6', bg: 'rgba(59,130,246,0.15)'  },
        { label: 'اقلام زیر حد مجاز', val: '۳ قلم',         color: '#ef4444', bg: 'rgba(239,68,68,0.15)'   },
        { label: 'ارزش کل انبار',      val: '۲.۱B تومان',   color: '#10b981', bg: 'rgba(16,185,129,0.15)' },
      ].map((s, i) => (
        <div key={i} className={`card animate-fadeUp delay-${i + 1}`}>
          <div className="card-body" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ width: 50, height: 50, borderRadius: 14, background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Box size={22} color={s.color} />
            </div>
            <div>
              <div style={{ fontSize: 22, fontWeight: 800, color: s.color }}>{s.val}</div>
              <div className="text-secondary text-sm">{s.label}</div>
            </div>
          </div>
        </div>
      ))}
    </div>

    {/* ─── MAIN CONTENT ─── */}
    <div className="grid-2 animate-fadeUp delay-2">
      {/* Material List */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">موجودی مواد اولیه</div>
          <button className="btn btn-primary btn-sm"><Plus size={12} /> ورود کالا</button>
        </div>
        <div className="card-body">
          {inventoryItems.map((item, i) => (
            <div key={i} className="inv-item">
              <div className="inv-icon" style={{ background: item.bg }}>
                <Package size={16} color={item.color} />
              </div>
              <div className="inv-info">
                <div className="inv-name">{item.name}</div>
                <div className="inv-cat">{item.cat}</div>
              </div>
              {item.low && (
                <span className="badge badge-red text-xs">کم موجود</span>
              )}
              <div className="inv-stock">
                <div className="inv-qty" style={{ color: item.low ? 'var(--accent-red)' : 'var(--text-primary)' }}>
                  {item.qty.toLocaleString()}
                </div>
                <div className="inv-unit">{item.unit}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Movement Chart */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">گردش انبار — هفته جاری</div>
        </div>
        <div style={{ padding: '8px 16px 16px' }}>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
              <XAxis dataKey="d" tick={{ fill: '#64748b', fontSize: 11, fontFamily: 'Vazirmatn' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="ورود" fill="#10b981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="خروج" fill="#ef4444" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
          <div className="flex gap-12 mt-8">
            {[['#10b981', 'ورود'], ['#ef4444', 'خروج']].map(([c, l]) => (
              <div key={l} className="flex-center gap-8 text-xs text-secondary">
                <div style={{ width: 10, height: 10, borderRadius: 3, background: c }} />
                {l}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  </>
);

export default InventoryPage;
