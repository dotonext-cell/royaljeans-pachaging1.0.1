import { Wallet, CreditCard, CheckSquare, ArrowUpRight, ArrowDownRight, Plus } from 'lucide-react';

const MOCK_PAYMENTS = [
  { id: 1, order: 'RJ-1021', amount: '۶,۲۰۰,۰۰۰', type: 'CHECK',    status: 'PAID',    date: '۱۴۰۳/۰۶/۱۲', due: '۱۴۰۳/۰۶/۲۰' },
  { id: 2, order: 'RJ-1020', amount: '۴,۸۰۰,۰۰۰', type: 'TRANSFER', status: 'PENDING', date: '۱۴۰۳/۰۶/۱۱', due: '—'            },
  { id: 3, order: 'RJ-1022', amount: '۸,۲۵۰,۰۰۰', type: 'CHECK',    status: 'PENDING', date: '۱۴۰۳/۰۶/۱۳', due: '۱۴۰۳/۰۷/۰۱'  },
  { id: 4, order: 'RJ-1019', amount: '۵,۸۵۰,۰۰۰', type: 'CASH',     status: 'PAID',    date: '۱۴۰۳/۰۶/۱۰', due: '—'            },
];

const typeMap = {
  CASH:     { label: 'نقدی',        cls: 'badge-green'  },
  CHECK:    { label: 'چک',          cls: 'badge-purple' },
  TRANSFER: { label: 'واریز',       cls: 'badge-blue'   },
  CARD:     { label: 'کارتخوان',   cls: 'badge-gray'   },
  CREDIT:   { label: 'اعتباری',    cls: 'badge-yellow' },
};

const statusMap = {
  PENDING: { label: 'در انتظار', cls: 'badge-yellow' },
  PAID:    { label: 'پرداخت شده', cls: 'badge-green' },
  BOUNCED: { label: 'برگشتی',    cls: 'badge-red'    },
};

const FinancePage = () => (
  <>
    {/* ─── STATS ─── */}
    <div className="stat-grid animate-fadeUp">
      {[
        { label: 'کل دریافتی‌ها',  val: '۴۹,۲۰۰,۰۰۰', color: '#10b981', bg: 'rgba(16,185,129,0.15)',  icon: ArrowUpRight  },
        { label: 'در انتظار',      val: '۱۳,۰۵۰,۰۰۰', color: '#f59e0b', bg: 'rgba(245,158,11,0.15)',  icon: CreditCard    },
        { label: 'چک‌های سررسید',  val: '۲ چک',         color: '#ef4444', bg: 'rgba(239,68,68,0.15)',   icon: CheckSquare   },
        { label: 'کل پرداخت‌ها',   val: '۳۶,۱۵۰,۰۰۰', color: '#8b5cf6', bg: 'rgba(139,92,246,0.15)', icon: ArrowDownRight },
      ].map((s, i) => (
        <div key={i} className={`stat-card stat-card-${i + 1} animate-fadeUp delay-${i + 1}`}>
          <div className="stat-icon-wrap" style={{ background: s.bg }}>
            <s.icon size={20} color={s.color} />
          </div>
          <div className="stat-value" style={{ fontSize: 18 }}>{s.val}</div>
          <div className="stat-label">{s.label}</div>
        </div>
      ))}
    </div>

    {/* ─── PAYMENTS TABLE ─── */}
    <div className="card animate-fadeUp delay-2">
      <div className="card-header">
        <div className="card-title">تراکنش‌های اخیر</div>
        <button className="btn btn-primary btn-sm"><Plus size={13} /> ثبت پرداخت</button>
      </div>
      <div className="card-body" style={{ padding: '8px 0 0' }}>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>سفارش</th>
                <th>مبلغ (تومان)</th>
                <th>نوع</th>
                <th>وضعیت</th>
                <th>تاریخ ثبت</th>
                <th>سررسید</th>
              </tr>
            </thead>
            <tbody>
              {MOCK_PAYMENTS.map((p) => {
                const tp = typeMap[p.type]   || { label: p.type, cls: 'badge-gray'   };
                const st = statusMap[p.status]|| { label: p.status, cls: 'badge-gray' };
                return (
                  <tr key={p.id}>
                    <td><span className="font-bold text-gold">{p.order}</span></td>
                    <td className="font-semibold text-green">{p.amount}</td>
                    <td><span className={`badge ${tp.cls}`}>{tp.label}</span></td>
                    <td>
                      <span className={`badge ${st.cls}`}>
                        <span className="badge-dot" style={{ background: 'currentColor' }} />
                        {st.label}
                      </span>
                    </td>
                    <td className="text-secondary">{p.date}</td>
                    <td className="text-secondary">{p.due}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </>
);

export default FinancePage;
