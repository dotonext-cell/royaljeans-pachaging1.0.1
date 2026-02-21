import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ordersService from '../../services/orders.service';

// ─── ثابت‌های وضعیت ──────────────────────────────────────────
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
      display: 'inline-block', padding: '3px 10px', borderRadius: 20,
      fontSize: 12, fontWeight: 600, color: s.color, background: s.bg,
    }}>{s.label}</span>
  );
};

// ─── کامپوننت InfoRow ─────────────────────────────────────────
const InfoRow = ({ label, value }) => (
  <div>
    <div style={{ color: '#64748b', fontSize: 12, marginBottom: 4 }}>{label}</div>
    <div style={{ color: '#f1f5f9', fontWeight: 500 }}>{value || '—'}</div>
  </div>
);

// ─── Section Card ─────────────────────────────────────────────
const Section = ({ title, children }) => (
  <div className="card" style={{ marginBottom: 16 }}>
    <div className="card-header">
      <h3 className="card-title">{title}</h3>
    </div>
    <div style={{ padding: '12px 4px' }}>{children}</div>
  </div>
);

// ─── Size Grid ────────────────────────────────────────────────
const SizeGrid = ({ label, color, data }) => {
  const sizes = [30, 31, 32, 33, 34, 36, 38, 40];
  const hasData = sizes.some(s => data[s]);
  if (!hasData) return null;
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ color, fontWeight: 600, marginBottom: 8, fontSize: 13 }}>{label}</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: 6 }}>
        {sizes.map(s => (
          <div key={s} style={{
            textAlign: 'center', padding: '6px 4px',
            background: `${color}15`, borderRadius: 8,
            border: `1px solid ${color}33`,
          }}>
            <div style={{ fontSize: 11, color: '#94a3b8' }}>سایز {s}</div>
            <div style={{ fontWeight: 700, color, fontSize: 14 }}>{data[s] || 0}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ─── صفحه اصلی ───────────────────────────────────────────────
const OrderDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchOrderDetails = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await ordersService.getById(id);
      setOrder(response.order);
    } catch (err) {
      setError('خطا در دریافت جزئیات سفارش');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchOrderDetails();
  }, [fetchOrderDetails]);

  const handleDelete = async () => {
    if (!window.confirm('آیا از حذف این سفارش اطمینان دارید؟')) return;
    try {
      setDeleting(true);
      await ordersService.delete(id);
      navigate('/orders');
    } catch (err) {
      alert('خطا در حذف سفارش');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-spinner">
        <div className="spinner" />
        <p>در حال بارگذاری...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="page-container">
        <div style={{ background: 'rgba(239,68,68,.15)', border: '1px solid #ef4444',
          borderRadius: 12, padding: '12px 18px', color: '#f87171' }}>
          ⚠️ {error || 'سفارش یافت نشد'}
          <button onClick={() => navigate('/orders')}
            style={{ marginRight: 12, color: '#f59e0b', background: 'none', border: 'none', cursor: 'pointer' }}>
            بازگشت به لیست
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      {/* هدر */}
      <div className="page-header">
        <div>
          <button className="btn btn-ghost" onClick={() => navigate('/orders')}
            style={{ marginBottom: 8 }}>
            ← بازگشت
          </button>
          <h1 className="page-title">
            جزئیات سفارش &nbsp;
            <span style={{ color: '#f59e0b', fontFamily: 'monospace' }}>{order.code}</span>
          </h1>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-ghost" onClick={() => navigate(`/orders/${id}/edit`)}>
            ✏️ ویرایش
          </button>
          <button className="btn btn-ghost" onClick={() => navigate(`/workflow/${id}`)}>
            🔄 گردش کار
          </button>
          <button
            style={{
              background: 'rgba(239,68,68,.15)', color: '#f87171',
              border: '1px solid rgba(239,68,68,.3)', borderRadius: 8, padding: '8px 16px',
              cursor: 'pointer', fontFamily: 'inherit', fontSize: 14,
            }}
            disabled={deleting}
            onClick={handleDelete}>
            {deleting ? 'در حال حذف...' : '🗑️ حذف'}
          </button>
        </div>
      </div>

      {/* اطلاعات پایه */}
      <Section title="📋 اطلاعات پایه">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 16 }}>
          <InfoRow label="کد سفارش" value={<span style={{ color: '#f59e0b', fontFamily: 'monospace', fontWeight: 700 }}>{order.code}</span>} />
          <InfoRow label="نام سفارش" value={order.name} />
          <InfoRow label="وضعیت" value={<StatusBadge status={order.status} />} />
          <InfoRow label="تاریخ" value={order.date ? new Date(order.date).toLocaleDateString('fa-IR') : '—'} />
          <InfoRow label="کل تعداد" value={(order.totalCount || 0).toLocaleString('fa-IR')} />
          <InfoRow label="تعداد بسته‌بندی" value={(order.packingCount || 0).toLocaleString('fa-IR')} />
        </div>
      </Section>

      {/* مشخصات محصول */}
      <Section title="🧵 مشخصات محصول">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 16 }}>
          <InfoRow label="نوع پارچه" value={order.fabric} />
          <InfoRow label="شستشو" value={order.stoneWash} />
          <InfoRow label="استایل" value={order.style} />
          <InfoRow label="تأمین‌کننده پارچه" value={order.fabricSupplier} />
          <InfoRow label="تأمین‌کننده تولید" value={order.productionSupplier} />
          <InfoRow label="نام بسته‌بندی" value={order.packingName} />
          <InfoRow label="نوع سفارش (BU)" value={order.bu} />
          <InfoRow label="سطح سفارش (BV)" value={order.bv} />
        </div>
      </Section>

      {/* توزیع سایزها */}
      <Section title="📐 توزیع سایزها">
        <SizeGrid label="سالم" color="#10b981" data={{
          30: order.size30_healthy, 31: order.size31_healthy, 32: order.size32_healthy,
          33: order.size33_healthy, 34: order.size34_healthy, 36: order.size36_healthy,
          38: order.size38_healthy, 40: order.size40_healthy,
        }} />
        <SizeGrid label="اقتصادی 1" color="#3b82f6" data={{
          30: order.size30_economy, 31: order.size31_economy, 32: order.size32_economy,
          33: order.size33_economy, 34: order.size34_economy, 36: order.size36_economy,
          38: order.size38_economy, 40: order.size40_economy,
        }} />
        <SizeGrid label="اقتصادی 2" color="#6366f1" data={{
          30: order.size30_economy2, 31: order.size31_economy2, 32: order.size32_economy2,
          33: order.size33_economy2, 34: order.size34_economy2, 36: order.size36_economy2,
          38: order.size38_economy2, 40: order.size40_economy2,
        }} />
        <SizeGrid label="اقتصادی 3" color="#8b5cf6" data={{
          30: order.size30_economy3, 31: order.size31_economy3, 32: order.size32_economy3,
          33: order.size33_economy3, 34: order.size34_economy3, 36: order.size36_economy3,
          38: order.size38_economy3, 40: order.size40_economy3,
        }} />
        <SizeGrid label="نمونه" color="#f59e0b" data={{
          30: order.size30_sample, 31: order.size31_sample, 32: order.size32_sample,
          33: order.size33_sample, 34: order.size34_sample, 36: order.size36_sample,
          38: order.size38_sample, 40: order.size40_sample,
        }} />
        <SizeGrid label="استوک" color="#94a3b8" data={{
          30: order.size30_stock, 31: order.size31_stock, 32: order.size32_stock,
          33: order.size33_stock, 34: order.size34_stock, 36: order.size36_stock,
          38: order.size38_stock, 40: order.size40_stock,
        }} />
      </Section>

      {/* اطلاعات موجودی */}
      <Section title="📦 اطلاعات موجودی">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 16 }}>
          <InfoRow label="موجودی پارچه" value={(order.stockFabric || 0).toLocaleString('fa-IR')} />
          <InfoRow label="موجودی شستشو" value={(order.stockWash || 0).toLocaleString('fa-IR')} />
          <InfoRow label="موجودی تولید" value={(order.stockProduction || 0).toLocaleString('fa-IR')} />
          <InfoRow label="موجودی بسته‌بندی" value={(order.stockPackaging || 0).toLocaleString('fa-IR')} />
          <InfoRow label="قابل فروش" value={(order.saleableCount || 0).toLocaleString('fa-IR')} />
          <InfoRow label="شستشوی متفاوت" value={(order.differentWash || 0).toLocaleString('fa-IR')} />
          <InfoRow label="ضایعات" value={(order.waste || 0).toLocaleString('fa-IR')} />
          <InfoRow label="موجودی منفی" value={(order.stockMinus || 0).toLocaleString('fa-IR')} />
          <InfoRow label="موجودی مثبت" value={(order.stockPlus || 0).toLocaleString('fa-IR')} />
          <InfoRow label="بسته‌بندی منفی" value={(order.stockPackagingMinus || 0).toLocaleString('fa-IR')} />
        </div>
      </Section>

      {/* ملزومات */}
      <Section title="🔩 ملزومات">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 16 }}>
          <InfoRow label="دکمه" value={(order.accessories_button || 0).toLocaleString('fa-IR')} />
          <InfoRow label="پرچ" value={(order.accessories_rivet || 0).toLocaleString('fa-IR')} />
          <InfoRow label="کارت جیب" value={(order.accessories_pocketCard || 0).toLocaleString('fa-IR')} />
          <InfoRow label="کارت سایز" value={(order.accessories_sizeCard || 0).toLocaleString('fa-IR')} />
          <InfoRow label="آویز" value={(order.accessories_hanger || 0).toLocaleString('fa-IR')} />
          <InfoRow label="نوار" value={(order.accessories_band || 0).toLocaleString('fa-IR')} />
          <InfoRow label="چرم" value={(order.accessories_leather || 0).toLocaleString('fa-IR')} />
        </div>
      </Section>

      {/* پرسنل و توضیحات */}
      <Section title="👤 پرسنل و توضیحات">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 16 }}>
          <InfoRow label="تکمیل‌کننده" value={order.finisher} />
          <InfoRow label="کنترل اولیه" value={order.initialControl} />
          <InfoRow label="کنترل‌کننده" value={order.controller} />
          <InfoRow label="ثبت‌کننده" value={order.creator?.displayName || order.creator?.nickname} />
          <InfoRow label="تاریخ ثبت" value={order.createdAt ? new Date(order.createdAt).toLocaleDateString('fa-IR') : '—'} />
        </div>
        {order.description && (
          <div style={{ marginTop: 16 }}>
            <div style={{ color: '#64748b', fontSize: 12, marginBottom: 4 }}>توضیحات</div>
            <div style={{
              color: '#cbd5e1', background: 'rgba(255,255,255,.03)',
              border: '1px solid rgba(255,255,255,.06)', borderRadius: 8,
              padding: '10px 14px', whiteSpace: 'pre-wrap', lineHeight: 1.8,
            }}>
              {order.description}
            </div>
          </div>
        )}
      </Section>
    </div>
  );
};

export default OrderDetails;
