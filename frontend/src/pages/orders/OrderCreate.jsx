import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import ordersService from '../../services/orders.service';
import settingsService from '../../services/settings.service';

const SIZES = [30, 31, 32, 33, 34, 36, 38, 40];

const SECTIONS = [
  { id: 'basic',        label: '📦 اطلاعات پایه',            desc: 'کد، نام، تاریخ' },
  { id: 'suppliers',    label: '🏭 تأمین‌کنندگان',            desc: 'پارچه، تولید' },
  { id: 'sizes',        label: '📐 سایزبندی',                 desc: 'سالم، اقتصادی، نمونه' },
  { id: 'stock',        label: '📦 موجودی',                   desc: 'موجودی و ضایعات' },
  { id: 'requirements', label: '🔩 ملزومات',                 desc: 'دکمه، پرچ، کارت' },
  { id: 'personnel',    label: '👤 پرسنل',                    desc: 'تکمیل‌کننده، کنترلر' },
];

// ─── ورودی عدد ────────────────────────────────────────────────
const NumInput = ({ label, field, formData, onChange, small = false }) => (
  <div className="form-group" style={{ margin: 0 }}>
    <label className="form-label" style={{ fontSize: small ? 11 : 13 }}>{label}</label>
    <input
      className="form-input"
      type="number"
      min={0}
      value={formData[field] || 0}
      onChange={e => onChange(field, parseInt(e.target.value) || 0)}
      style={{ textAlign: 'center', padding: small ? '4px 6px' : undefined }}
    />
  </div>
);

// ─── ردیف سایزها ──────────────────────────────────────────────
const SizeRow = ({ label, color, suffix, formData, onChange }) => {
  const total = SIZES.reduce((s, n) => s + (formData[`size${n}_${suffix}`] || 0), 0);
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
        <span style={{ fontWeight: 600, color: color || '#94a3b8', fontSize: 13 }}>{label}</span>
        {total > 0 && (
          <span style={{ background: `${color || '#94a3b8'}22`, color: color || '#94a3b8',
            padding: '1px 8px', borderRadius: 10, fontSize: 12, fontWeight: 700 }}>
            جمع: {total.toLocaleString('fa-IR')}
          </span>
        )}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: 6 }}>
        {SIZES.map(s => (
          <NumInput key={s} label={`${s}`} field={`size${s}_${suffix}`}
            formData={formData} onChange={onChange} small />
        ))}
      </div>
    </div>
  );
};

// ─── صفحه اصلی ───────────────────────────────────────────────
const OrderCreate = () => {
  const navigate = useNavigate();
  const sectionRefs = useRef({});
  const [activeSection, setActiveSection] = useState('basic');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [settings, setSettings] = useState({
    productionSuppliers: [], fabricSuppliers: [], fabrics: [],
    stoneWashes: [], packingNames: [], styles: [], orderTypes: [], orderLevels: [],
  });

  const [formData, setFormData] = useState({
    code: '', name: '', date: new Date().toISOString().split('T')[0],
    status: 'pending', totalCount: '', packingCount: '', packingName: '',
    fabricSupplier: '', productionSupplier: '', fabric: '',
    stoneWash: '', style: '', bu: 'رویال جینز', bv: 'نرمال',
    size30_healthy: 0, size31_healthy: 0, size32_healthy: 0, size33_healthy: 0,
    size34_healthy: 0, size36_healthy: 0, size38_healthy: 0, size40_healthy: 0,
    size30_economy: 0, size31_economy: 0, size32_economy: 0, size33_economy: 0,
    size34_economy: 0, size36_economy: 0, size38_economy: 0, size40_economy: 0,
    size30_economy2: 0, size31_economy2: 0, size32_economy2: 0, size33_economy2: 0,
    size34_economy2: 0, size36_economy2: 0, size38_economy2: 0, size40_economy2: 0,
    size30_economy3: 0, size31_economy3: 0, size32_economy3: 0, size33_economy3: 0,
    size34_economy3: 0, size36_economy3: 0, size38_economy3: 0, size40_economy3: 0,
    size30_sample: 0, size31_sample: 0, size32_sample: 0, size33_sample: 0,
    size34_sample: 0, size36_sample: 0, size38_sample: 0, size40_sample: 0,
    stockFabric: 0, stockWash: 0, stockProduction: 0, stockPackaging: 0,
    saleableCount: 0, differentWash: 0, waste: 0, stockMinus: 0, stockPlus: 0,
    accessories_button: 0, accessories_rivet: 0, accessories_pocketCard: 0,
    accessories_sizeCard: 0, accessories_hanger: 0, accessories_band: 0,
    accessories_leather: 0,
    description: '', finisher: '', controller: '',
  });

  useEffect(() => {
    (async () => {
      try {
        const data = await settingsService.getAll();
        setSettings(data);
      } catch (err) {
        console.error('Failed to fetch settings:', err);
      }
    })();

    // Scroll spy
    const handleScroll = () => {
      for (const section of SECTIONS) {
        const el = sectionRefs.current[section.id];
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= 140 && rect.bottom >= 140) {
            setActiveSection(section.id);
            break;
          }
        }
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const scrollTo = (id) => {
    const el = sectionRefs.current[id];
    if (el) {
      const top = el.getBoundingClientRect().top + window.scrollY - 100;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  };

  const handleSubmit = async () => {
    setError(''); setSuccess('');
    if (!formData.code || !formData.name) {
      setError('کد و نام سفارش اجباری است');
      return;
    }
    try {
      setLoading(true);
      await ordersService.create(formData);
      setSuccess('سفارش با موفقیت ثبت شد! در حال انتقال...');
      setTimeout(() => navigate('/orders'), 1200);
    } catch (err) {
      setError(err.response?.data?.message || 'خطا در ثبت سفارش');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      {/* هدر */}
      <div className="page-header">
        <div>
          <h1 className="page-title">ثبت سفارش جدید</h1>
          <p className="page-subtitle">فرم جامع ثبت اطلاعات سفارش</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-ghost" onClick={() => navigate('/orders')}>← بازگشت</button>
          <button className="btn btn-primary" onClick={handleSubmit} disabled={loading}>
            {loading ? 'در حال ذخیره...' : '💾 ذخیره سفارش'}
          </button>
        </div>
      </div>

      {/* پیام‌ها */}
      {error && (
        <div style={{ background: 'rgba(239,68,68,.15)', border: '1px solid rgba(239,68,68,.3)',
          borderRadius: 12, padding: '12px 18px', marginBottom: 20, color: '#f87171' }}>
          ⚠️ {error}
        </div>
      )}
      {success && (
        <div style={{ background: 'rgba(16,185,129,.15)', border: '1px solid rgba(16,185,129,.3)',
          borderRadius: 12, padding: '12px 18px', marginBottom: 20, color: '#34d399' }}>
          ✅ {success}
        </div>
      )}

      {/* ناوبری بخش‌ها */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 24, flexWrap: 'wrap' }}>
        {SECTIONS.map(s => (
          <button key={s.id} onClick={() => scrollTo(s.id)}
            style={{
              padding: '6px 14px', borderRadius: 20, border: 'none',
              background: activeSection === s.id ? 'rgba(245,158,11,.2)' : 'rgba(255,255,255,.05)',
              color: activeSection === s.id ? '#f59e0b' : '#94a3b8',
              fontFamily: 'inherit', fontSize: 13, cursor: 'pointer',
              fontWeight: activeSection === s.id ? 600 : 400,
              borderWidth: 1, borderStyle: 'solid',
              borderColor: activeSection === s.id ? 'rgba(245,158,11,.4)' : 'rgba(255,255,255,.05)',
            }}>
            {s.label}
          </button>
        ))}
      </div>

      {/* ─── بخش اطلاعات پایه ─── */}
      <div ref={el => sectionRefs.current.basic = el} className="card" style={{ marginBottom: 20 }}>
        <div className="card-header">
          <h3 className="card-title">📦 اطلاعات پایه سفارش</h3>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: 16, padding: '8px 0' }}>
          <div className="form-group">
            <label className="form-label">کد سفارش *</label>
            <input className="form-input" value={formData.code}
              onChange={e => handleChange('code', e.target.value)}
              placeholder="مثال: RJ-1402-001" />
          </div>
          <div className="form-group" style={{ gridColumn: 'span 2' }}>
            <label className="form-label">نام کالا *</label>
            <input className="form-input" value={formData.name}
              onChange={e => handleChange('name', e.target.value)}
              placeholder="نام محصول" />
          </div>
          <div className="form-group">
            <label className="form-label">تاریخ</label>
            <input className="form-input" type="date" value={formData.date}
              onChange={e => handleChange('date', e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">وضعیت</label>
            <select className="form-input" value={formData.status}
              onChange={e => handleChange('status', e.target.value)}>
              <option value="pending">در انتظار</option>
              <option value="processing">در حال تولید</option>
              <option value="completed">تکمیل شده</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">کل تعداد</label>
            <input className="form-input" type="number" value={formData.totalCount}
              onChange={e => handleChange('totalCount', e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">تعداد بسته‌بندی</label>
            <input className="form-input" type="number" value={formData.packingCount}
              onChange={e => handleChange('packingCount', e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">نام بسته‌بندی</label>
            <select className="form-input" value={formData.packingName}
              onChange={e => handleChange('packingName', e.target.value)}>
              <option value="">انتخاب کنید</option>
              {settings.packingNames?.map(p => <option key={p.id} value={p.name}>{p.name}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* ─── تأمین‌کنندگان ─── */}
      <div ref={el => sectionRefs.current.suppliers = el} className="card" style={{ marginBottom: 20 }}>
        <div className="card-header">
          <h3 className="card-title">🏭 اطلاعات تأمین‌کنندگان</h3>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: 16, padding: '8px 0' }}>
          <div className="form-group">
            <label className="form-label">نوع پارچه</label>
            <select className="form-input" value={formData.fabric}
              onChange={e => handleChange('fabric', e.target.value)}>
              <option value="">انتخاب کنید</option>
              {settings.fabrics?.map(f => <option key={f.id} value={f.name}>{f.name}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">شستشو</label>
            <select className="form-input" value={formData.stoneWash}
              onChange={e => handleChange('stoneWash', e.target.value)}>
              <option value="">انتخاب کنید</option>
              {settings.stoneWashes?.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">استایل</label>
            <select className="form-input" value={formData.style}
              onChange={e => handleChange('style', e.target.value)}>
              <option value="">انتخاب کنید</option>
              {settings.styles?.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">تأمین‌کننده پارچه</label>
            <select className="form-input" value={formData.fabricSupplier}
              onChange={e => handleChange('fabricSupplier', e.target.value)}>
              <option value="">انتخاب کنید</option>
              {settings.fabricSuppliers?.map(f => <option key={f.id} value={f.name}>{f.name}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">تأمین‌کننده تولید</label>
            <select className="form-input" value={formData.productionSupplier}
              onChange={e => handleChange('productionSupplier', e.target.value)}>
              <option value="">انتخاب کنید</option>
              {settings.productionSuppliers?.map(p => <option key={p.id} value={p.name}>{p.name}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">نوع سفارش (BU)</label>
            <select className="form-input" value={formData.bu}
              onChange={e => handleChange('bu', e.target.value)}>
              <option value="">انتخاب کنید</option>
              {settings.orderTypes?.map(t => <option key={t.id} value={t.name}>{t.name}</option>)}
              <option value="رویال جینز">رویال جینز</option>
              <option value="بار مشتری">بار مشتری</option>
              <option value="نیوکالکشن">نیوکالکشن</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">سطح سفارش (BV)</label>
            <select className="form-input" value={formData.bv}
              onChange={e => handleChange('bv', e.target.value)}>
              <option value="">انتخاب کنید</option>
              {settings.orderLevels?.map(l => <option key={l.id} value={l.name}>{l.name}</option>)}
              <option value="لارج">لارج</option>
              <option value="نرمال">نرمال</option>
              <option value="ECO">ECO</option>
            </select>
          </div>
        </div>
      </div>

      {/* ─── سایزبندی ─── */}
      <div ref={el => sectionRefs.current.sizes = el} className="card" style={{ marginBottom: 20 }}>
        <div className="card-header">
          <h3 className="card-title">📐 سایزبندی</h3>
        </div>
        <div style={{ padding: '8px 0' }}>
          <SizeRow label="سالم" color="#10b981" suffix="healthy" formData={formData} onChange={handleChange} />
          <div style={{ height: 1, background: 'rgba(255,255,255,.06)', margin: '4px 0 20px' }} />
          <SizeRow label="اقتصادی 1" color="#3b82f6" suffix="economy" formData={formData} onChange={handleChange} />
          <div style={{ height: 1, background: 'rgba(255,255,255,.06)', margin: '4px 0 20px' }} />
          <SizeRow label="اقتصادی 2" color="#6366f1" suffix="economy2" formData={formData} onChange={handleChange} />
          <div style={{ height: 1, background: 'rgba(255,255,255,.06)', margin: '4px 0 20px' }} />
          <SizeRow label="اقتصادی 3" color="#8b5cf6" suffix="economy3" formData={formData} onChange={handleChange} />
          <div style={{ height: 1, background: 'rgba(255,255,255,.06)', margin: '4px 0 20px' }} />
          <SizeRow label="نمونه" color="#f59e0b" suffix="sample" formData={formData} onChange={handleChange} />
        </div>
      </div>

      {/* ─── موجودی ─── */}
      <div ref={el => sectionRefs.current.stock = el} className="card" style={{ marginBottom: 20 }}>
        <div className="card-header">
          <h3 className="card-title">📦 موجودی و مغایرت</h3>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 16, padding: '8px 0' }}>
          <NumInput label="موجودی پارچه" field="stockFabric" formData={formData} onChange={handleChange} />
          <NumInput label="موجودی شستشو" field="stockWash" formData={formData} onChange={handleChange} />
          <NumInput label="موجودی تولید" field="stockProduction" formData={formData} onChange={handleChange} />
          <NumInput label="موجودی بسته‌بندی" field="stockPackaging" formData={formData} onChange={handleChange} />
          <NumInput label="قابل فروش" field="saleableCount" formData={formData} onChange={handleChange} />
          <NumInput label="شستشوی متفاوت" field="differentWash" formData={formData} onChange={handleChange} />
          <NumInput label="ضایعات" field="waste" formData={formData} onChange={handleChange} />
          <NumInput label="موجودی منفی" field="stockMinus" formData={formData} onChange={handleChange} />
          <NumInput label="موجودی مثبت" field="stockPlus" formData={formData} onChange={handleChange} />
        </div>
      </div>

      {/* ─── ملزومات ─── */}
      <div ref={el => sectionRefs.current.requirements = el} className="card" style={{ marginBottom: 20 }}>
        <div className="card-header">
          <h3 className="card-title">🔩 ملزومات</h3>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 16, padding: '8px 0' }}>
          <NumInput label="دکمه" field="accessories_button" formData={formData} onChange={handleChange} />
          <NumInput label="پرچ" field="accessories_rivet" formData={formData} onChange={handleChange} />
          <NumInput label="کارت جیب" field="accessories_pocketCard" formData={formData} onChange={handleChange} />
          <NumInput label="کارت سایز" field="accessories_sizeCard" formData={formData} onChange={handleChange} />
          <NumInput label="آویز" field="accessories_hanger" formData={formData} onChange={handleChange} />
          <NumInput label="نوار" field="accessories_band" formData={formData} onChange={handleChange} />
          <NumInput label="چرم" field="accessories_leather" formData={formData} onChange={handleChange} />
        </div>
      </div>

      {/* ─── پرسنل ─── */}
      <div ref={el => sectionRefs.current.personnel = el} className="card" style={{ marginBottom: 40 }}>
        <div className="card-header">
          <h3 className="card-title">👤 پرسنل و توضیحات</h3>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, padding: '8px 0' }}>
          <div className="form-group">
            <label className="form-label">تکمیل‌کننده</label>
            <input className="form-input" value={formData.finisher}
              onChange={e => handleChange('finisher', e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">کنترل‌کننده</label>
            <input className="form-input" value={formData.controller}
              onChange={e => handleChange('controller', e.target.value)} />
          </div>
          <div className="form-group" style={{ gridColumn: '1 / -1' }}>
            <label className="form-label">توضیحات</label>
            <textarea className="form-input" value={formData.description}
              onChange={e => handleChange('description', e.target.value)}
              rows={4} style={{ resize: 'vertical' }}
              placeholder="توضیحات اضافی..." />
          </div>
        </div>
      </div>

      {/* دکمه ثبت پایین صفحه */}
      <div style={{
        position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)',
        display: 'flex', gap: 12, zIndex: 50,
      }}>
        <button className="btn btn-primary"
          onClick={handleSubmit} disabled={loading}
          style={{ padding: '12px 32px', fontSize: 16, boxShadow: '0 4px 20px rgba(245,158,11,.4)' }}>
          {loading ? '⏳ در حال ذخیره...' : '💾 ذخیره سفارش'}
        </button>
      </div>
    </div>
  );
};

export default OrderCreate;
