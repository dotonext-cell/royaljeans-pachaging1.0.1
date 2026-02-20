import { Package, Scissors, Shirt, Wind, Box, RefreshCw } from 'lucide-react';

const workflowStages = [
  { id: 1, name: 'پارچه',    icon: Package,  status: 'done',   qty: 300 },
  { id: 2, name: 'برش',      icon: Scissors, status: 'done',   qty: 295 },
  { id: 3, name: 'دوخت',     icon: Shirt,    status: 'active', qty: 280 },
  { id: 4, name: 'سنگ‌شویی', icon: Wind,     status: 'pending',qty: 0   },
  { id: 5, name: 'بسته‌بندی',icon: Box,      status: 'pending',qty: 0   },
];

const WorkflowPage = () => (
  <>
    {/* ─── ORDER HEADER ─── */}
    <div className="order-detail-header animate-fadeUp">
      <div style={{ flex: 1 }}>
        <div className="order-num">RJ-1024</div>
        <div className="text-secondary font-medium" style={{ marginTop: 4 }}>
          بازار بزرگ تهران — شلوار جین کلاسیک
        </div>
        <div className="order-meta">
          <div className="order-meta-item">تعداد: <span>۲۴۰ عدد</span></div>
          <div className="order-meta-item">تاریخ سفارش: <span>۱۴۰۳/۰۶/۱۵</span></div>
          <div className="order-meta-item">تحویل: <span className="text-red">۱۴۰۳/۰۶/۲۵</span></div>
        </div>
      </div>
      <span className="badge badge-yellow active-pulse" style={{ fontSize: 13, padding: '8px 16px' }}>
        <span className="badge-dot" style={{ background: 'currentColor' }} />
        در حال تولید
      </span>
    </div>

    {/* ─── WORKFLOW STEPS ─── */}
    <div className="card animate-fadeUp delay-1 mb-20">
      <div className="card-header">
        <div className="card-title">مراحل گردش کار</div>
        <button className="btn btn-primary btn-sm">
          <RefreshCw size={12} /> بروزرسانی مرحله
        </button>
      </div>
      <div className="workflow-wrap">
        <div className="workflow-steps">
          {workflowStages.map((s, i) => (
            <div key={s.id} className="wf-step">
              {i > 0 && (
                <div className={`wf-line ${
                  workflowStages[i - 1].status === 'done'
                    ? s.status !== 'pending' ? 'active' : 'done'
                    : 'pending'
                }`} />
              )}
              <div className={`wf-circle ${s.status}`}>
                <s.icon size={16} />
              </div>
              <div className={`wf-label ${s.status}`}>{s.name}</div>
              <div className="wf-qty">{s.qty > 0 ? `${s.qty} عدد` : '—'}</div>
            </div>
          ))}
        </div>
      </div>
    </div>

    {/* ─── DETAILS ─── */}
    <div className="grid-2 animate-fadeUp delay-2">
      {/* Stage Detail */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">جزئیات مرحله فعلی: دوخت</div>
        </div>
        <div className="card-body">
          {[
            ['پیمانکار',        'تولیدی برادران احمدی'],
            ['تاریخ شروع',      '۱۴۰۳/۰۶/۱۷'],
            ['تاریخ پیش‌بینی',  '۱۴۰۳/۰۶/۲۱'],
            ['ورودی',           '۲۹۵ عدد'],
            ['خروجی تا کنون',   '۱۸۰ عدد'],
            ['ضایعات',          '۳ عدد (۱٪)'],
          ].map(([k, v]) => (
            <div key={k} className="flex-between" style={{ padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
              <span className="text-secondary text-sm">{k}</span>
              <span className="font-medium text-primary">{v}</span>
            </div>
          ))}
          <div style={{ marginTop: 16 }}>
            <div className="progress-head">
              <span className="progress-name">پیشرفت کلی سفارش</span>
              <span className="progress-pct" style={{ color: 'var(--accent-gold)' }}>۶۱٪</span>
            </div>
            <div className="progress-bg">
              <div className="progress-fill" style={{ width: '61%', background: 'linear-gradient(to left, #f59e0b, #ef4444)' }} />
            </div>
          </div>
        </div>
      </div>

      {/* History */}
      <div className="card">
        <div className="card-header"><div className="card-title">تاریخچه تغییرات</div></div>
        <div className="card-body" style={{ padding: '8px 20px 16px' }}>
          {[
            { color: '#10b981', action: 'تکمیل مرحله برش',  detail: 'خروجی: ۲۹۵ عدد | ضایعات: ۵',       time: 'دیروز ۱۴:۳۰'  },
            { color: '#10b981', action: 'تکمیل مرحله پارچه', detail: 'پیمانکار: پارچه‌فروشی رضوی',        time: '۳ روز پیش'     },
            { color: '#f59e0b', action: 'شروع مرحله برش',    detail: 'پیمانکار: تولیدی شریفی',            time: '۴ روز پیش'     },
            { color: '#3b82f6', action: 'تایید سفارش',        detail: 'توسط مدیر تولید',                   time: '۵ روز پیش'     },
          ].map((h, i, arr) => (
            <div key={i} className="flex gap-12" style={{ marginBottom: 14 }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: 4 }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: h.color, flexShrink: 0 }} />
                {i < arr.length - 1 && (
                  <div style={{ width: 1, flex: 1, background: 'var(--border)', marginTop: 4 }} />
                )}
              </div>
              <div style={{ flex: 1 }}>
                <div className="font-semibold text-sm text-primary">{h.action}</div>
                <div className="text-xs text-secondary mt-4">{h.detail}</div>
                <div className="text-xs text-muted">{h.time}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </>
);

export default WorkflowPage;
