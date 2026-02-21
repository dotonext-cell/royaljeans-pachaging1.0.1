import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ordersService from '../../services/orders.service';
import settingsService from '../../services/settings.service';

// ─── Tab navigation ───────────────────────────────────────────
const TABS = [
  { id: 'basic',        label: 'اطلاعات پایه' },
  { id: 'product',      label: 'مشخصات محصول' },
  { id: 'healthy',      label: 'سایزهای سالم' },
  { id: 'economy',      label: 'سایزهای اقتصادی' },
  { id: 'sample',       label: 'سایزهای نمونه' },
  { id: 'stock',        label: 'موجودی' },
  { id: 'accessories',  label: 'ملزومات' },
  { id: 'personnel',    label: 'پرسنل' },
];

const SIZES = [30, 31, 32, 33, 34, 36, 38, 40];

// ─── کامپوننت ورودی عدد ──────────────────────────────────────
const NumField = ({ label, field, formData, onChange }) => (
  <div className="form-group">
    <label className="form-label" style={{ fontSize: 12 }}>{label}</label>
    <input
      className="form-input"
      type="number"
      min={0}
      value={formData[field] || 0}
      onChange={e => onChange(field, parseInt(e.target.value) || 0)}
      style={{ textAlign: 'center' }}
    />
  </div>
);

// ─── ردیف سایزها ─────────────────────────────────────────────
const SizeRow = ({ label, suffix, formData, onChange }) => (
  <div style={{ marginBottom: 20 }}>
    <div style={{ fontWeight: 600, color: '#94a3b8', marginBottom: 8, fontSize: 13 }}>{label}</div>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: 8 }}>
      {SIZES.map(s => (
        <NumField key={s} label={`سایز ${s}`} field={`size${s}_${suffix}`} formData={formData} onChange={onChange} />
      ))}
    </div>
  </div>
);

// ─── صفحه ویرایش سفارش ──────────────────────────────────────
const OrderEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('basic');
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [settings, setSettings] = useState({
    productionSuppliers: [], fabricSuppliers: [], fabrics: [],
    stoneWashes: [], packingNames: [], styles: [], orderTypes: [], orderLevels: [],
  });

  const [formData, setFormData] = useState({
    code: '', name: '', date: '', status: 'pending',
    totalCount: '', packingCount: '', packingName: '',
    fabricSupplier: '', productionSupplier: '', fabric: '',
    stoneWash: '', style: '', bu: '', bv: '',
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
    size30_stock: 0, size31_stock: 0, size32_stock: 0, size33_stock: 0,
    size34_stock: 0, size36_stock: 0, size38_stock: 0, size40_stock: 0,
    stockFabric: 0, stockWash: 0, stockProduction: 0, stockPackaging: 0,
    saleableCount: 0, differentWash: 0, waste: 0, stockMinus: 0, stockPlus: 0,
    stockPackagingMinus: 0,
    accessories_button: 0, accessories_rivet: 0, accessories_pocketCard: 0,
    accessories_sizeCard: 0, accessories_hanger: 0, accessories_band: 0,
    accessories_leather: 0,
    description: '', finisher: '', initialControl: '', controller: '',
  });

  useEffect(() => {
    fetchOrderData();
    fetchSettings();
  }, [id]);

  const fetchSettings = async () => {
    try {
      const data = await settingsService.getAll();
      setSettings(data);
    } catch (err) {
      console.error('Failed to fetch settings:', err);
    }
  };

  const fetchOrderData = async () => {
    try {
      setFetchLoading(true);
      const response = await ordersService.getById(id);
      const o = response.order;
      setFormData({
        code: o.code || '', name: o.name || '',
        date: o.date ? new Date(o.date).toISOString().split('T')[0] : '',
        status: o.status || 'pending',
        totalCount: o.totalCount || '', packingCount: o.packingCount || '',
        packingName: o.packingName || '', fabricSupplier: o.fabricSupplier || '',
        productionSupplier: o.productionSupplier || '', fabric: o.fabric || '',
        stoneWash: o.stoneWash || '', style: o.style || '',
        bu: o.bu || '', bv: o.bv || '',
        size30_healthy: o.size30_healthy || 0, size31_healthy: o.size31_healthy || 0,
        size32_healthy: o.size32_healthy || 0, size33_healthy: o.size33_healthy || 0,
        size34_healthy: o.size34_healthy || 0, size36_healthy: o.size36_healthy || 0,
        size38_healthy: o.size38_healthy || 0, size40_healthy: o.size40_healthy || 0,
        size30_economy: o.size30_economy || 0, size31_economy: o.size31_economy || 0,
        size32_economy: o.size32_economy || 0, size33_economy: o.size33_economy || 0,
        size34_economy: o.size34_economy || 0, size36_economy: o.size36_economy || 0,
        size38_economy: o.size38_economy || 0, size40_economy: o.size40_economy || 0,
        size30_economy2: o.size30_economy2 || 0, size31_economy2: o.size31_economy2 || 0,
        size32_economy2: o.size32_economy2 || 0, size33_economy2: o.size33_economy2 || 0,
        size34_economy2: o.size34_economy2 || 0, size36_economy2: o.size36_economy2 || 0,
        size38_economy2: o.size38_economy2 || 0, size40_economy2: o.size40_economy2 || 0,
        size30_economy3: o.size30_economy3 || 0, size31_economy3: o.size31_economy3 || 0,
        size32_economy3: o.size32_economy3 || 0, size33_economy3: o.size33_economy3 || 0,
        size34_economy3: o.size34_economy3 || 0, size36_economy3: o.size36_economy3 || 0,
        size38_economy3: o.size38_economy3 || 0, size40_economy3: o.size40_economy3 || 0,
        size30_sample: o.size30_sample || 0, size31_sample: o.size31_sample || 0,
        size32_sample: o.size32_sample || 0, size33_sample: o.size33_sample || 0,
        size34_sample: o.size34_sample || 0, size36_sample: o.size36_sample || 0,
        size38_sample: o.size38_sample || 0, size40_sample: o.size40_sample || 0,
        size30_stock: o.size30_stock || 0, size31_stock: o.size31_stock || 0,
        size32_stock: o.size32_stock || 0, size33_stock: o.size33_stock || 0,
        size34_stock: o.size34_stock || 0, size36_stock: o.size36_stock || 0,
        size38_stock: o.size38_stock || 0, size40_stock: o.size40_stock || 0,
        stockFabric: o.stockFabric || 0, stockWash: o.stockWash || 0,
        stockProduction: o.stockProduction || 0, stockPackaging: o.stockPackaging || 0,
        saleableCount: o.saleableCount || 0, differentWash: o.differentWash || 0,
        waste: o.waste || 0, stockMinus: o.stockMinus || 0, stockPlus: o.stockPlus || 0,
        stockPackagingMinus: o.stockPackagingMinus || 0,
        accessories_button: o.accessories_button || 0, accessories_rivet: o.accessories_rivet || 0,
        accessories_pocketCard: o.accessories_pocketCard || 0, accessories_sizeCard: o.accessories_sizeCard || 0,
        accessories_hanger: o.accessories_hanger || 0, accessories_band: o.accessories_band || 0,
        accessories_leather: o.accessories_leather || 0,
        description: o.description || '', finisher: o.finisher || '',
        initialControl: o.initialControl || '', controller: o.controller || '',
      });
    } catch (err) {
      setError('خطا در دریافت اطلاعات سفارش');
      setTimeout(() => navigate('/orders'), 2000);
    } finally {
      setFetchLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    setError(''); setSuccess('');
    if (!formData.code || !formData.name) {
      setError('کد و نام سفارش اجباری است');
      return;
    }
    try {
      setLoading(true);
      const orderData = {
        ...formData,
        date: formData.date ? new Date(formData.date).toISOString() : null,
        totalCount: formData.totalCount ? parseInt(formData.totalCount) : null,
        packingCount: formData.packingCount ? parseInt(formData.packingCount) : null,
      };
      await ordersService.update(id, orderData);
      setSuccess('سفارش با موفقیت به‌روزرسانی شد');
      setTimeout(() => navigate(`/orders/${id}`), 1200);
    } catch (err) {
      setError(err.response?.data?.message || 'خطا در به‌روزرسانی سفارش');
    } finally {
      setLoading(false);
    }
  };

  if (fetchLoading) {
    return (
      <div className="loading-spinner">
        <div className="spinner" />
        <p>در حال بارگذاری...</p>
      </div>
    );
  }

  return (
    <div className="page-container">
      {/* هدر */}
      <div className="page-header">
        <div>
          <button className="btn btn-ghost" onClick={() => navigate(`/orders/${id}`)}
            style={{ marginBottom: 8 }}>← بازگشت</button>
          <h1 className="page-title">ویرایش سفارش</h1>
        </div>
        <button className="btn btn-primary" onClick={handleSubmit} disabled={loading}>
          {loading ? 'در حال ذخیره...' : '💾 ذخیره تغییرات'}
        </button>
      </div>

      {/* پیام‌ها */}
      {error && (
        <div style={{ background: 'rgba(239,68,68,.15)', border: '1px solid rgba(239,68,68,.3)',
          borderRadius: 12, padding: '12px 18px', marginBottom: 16, color: '#f87171' }}>
          ⚠️ {error}
        </div>
      )}
      {success && (
        <div style={{ background: 'rgba(16,185,129,.15)', border: '1px solid rgba(16,185,129,.3)',
          borderRadius: 12, padding: '12px 18px', marginBottom: 16, color: '#34d399' }}>
          ✅ {success}
        </div>
      )}

      {/* تب‌ها */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 20, overflowX: 'auto', flexWrap: 'nowrap' }}>
        {TABS.map(tab => (
          <button key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '8px 14px', borderRadius: 8, border: 'none',
              background: activeTab === tab.id ? '#f59e0b' : 'rgba(255,255,255,.05)',
              color: activeTab === tab.id ? '#0b0f1a' : '#94a3b8',
              fontFamily: 'inherit', fontWeight: activeTab === tab.id ? 700 : 400,
              cursor: 'pointer', whiteSpace: 'nowrap', fontSize: 13,
            }}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* محتوای تب‌ها */}
      <div className="card">
        <div style={{ padding: '8px 0' }}>

          {/* اطلاعات پایه */}
          {activeTab === 'basic' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
              <div className="form-group">
                <label className="form-label">کد سفارش *</label>
                <input className="form-input" value={formData.code}
                  onChange={e => handleChange('code', e.target.value)} placeholder="RJ-1402-001" />
              </div>
              <div className="form-group" style={{ gridColumn: 'span 2' }}>
                <label className="form-label">نام سفارش *</label>
                <input className="form-input" value={formData.name}
                  onChange={e => handleChange('name', e.target.value)} />
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
                  <option value="cancelled">لغو شده</option>
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
          )}

          {/* مشخصات محصول */}
          {activeTab === 'product' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
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
          )}

          {/* سایزهای سالم */}
          {activeTab === 'healthy' && (
            <SizeRow label="سالم" suffix="healthy" formData={formData} onChange={handleChange} />
          )}

          {/* سایزهای اقتصادی */}
          {activeTab === 'economy' && (
            <div>
              <SizeRow label="اقتصادی 1" suffix="economy" formData={formData} onChange={handleChange} />
              <div style={{ height: 1, background: 'rgba(255,255,255,.06)', margin: '8px 0 20px' }} />
              <SizeRow label="اقتصادی 2" suffix="economy2" formData={formData} onChange={handleChange} />
              <div style={{ height: 1, background: 'rgba(255,255,255,.06)', margin: '8px 0 20px' }} />
              <SizeRow label="اقتصادی 3" suffix="economy3" formData={formData} onChange={handleChange} />
            </div>
          )}

          {/* سایزهای نمونه */}
          {activeTab === 'sample' && (
            <SizeRow label="نمونه" suffix="sample" formData={formData} onChange={handleChange} />
          )}

          {/* موجودی */}
          {activeTab === 'stock' && (
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 16, marginBottom: 20 }}>
                <NumField label="موجودی پارچه" field="stockFabric" formData={formData} onChange={handleChange} />
                <NumField label="موجودی شستشو" field="stockWash" formData={formData} onChange={handleChange} />
                <NumField label="موجودی تولید" field="stockProduction" formData={formData} onChange={handleChange} />
                <NumField label="موجودی بسته‌بندی" field="stockPackaging" formData={formData} onChange={handleChange} />
                <NumField label="قابل فروش" field="saleableCount" formData={formData} onChange={handleChange} />
                <NumField label="شستشوی متفاوت" field="differentWash" formData={formData} onChange={handleChange} />
                <NumField label="ضایعات" field="waste" formData={formData} onChange={handleChange} />
                <NumField label="موجودی منفی" field="stockMinus" formData={formData} onChange={handleChange} />
                <NumField label="موجودی مثبت" field="stockPlus" formData={formData} onChange={handleChange} />
                <NumField label="بسته‌بندی منفی" field="stockPackagingMinus" formData={formData} onChange={handleChange} />
              </div>
              <div style={{ height: 1, background: 'rgba(255,255,255,.06)', margin: '8px 0 16px' }} />
              <SizeRow label="سایزهای موجودی" suffix="stock" formData={formData} onChange={handleChange} />
            </div>
          )}

          {/* ملزومات */}
          {activeTab === 'accessories' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 16 }}>
              <NumField label="دکمه" field="accessories_button" formData={formData} onChange={handleChange} />
              <NumField label="پرچ" field="accessories_rivet" formData={formData} onChange={handleChange} />
              <NumField label="کارت جیب" field="accessories_pocketCard" formData={formData} onChange={handleChange} />
              <NumField label="کارت سایز" field="accessories_sizeCard" formData={formData} onChange={handleChange} />
              <NumField label="آویز" field="accessories_hanger" formData={formData} onChange={handleChange} />
              <NumField label="نوار" field="accessories_band" formData={formData} onChange={handleChange} />
              <NumField label="چرم" field="accessories_leather" formData={formData} onChange={handleChange} />
            </div>
          )}

          {/* پرسنل */}
          {activeTab === 'personnel' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
              <div className="form-group">
                <label className="form-label">تکمیل‌کننده</label>
                <input className="form-input" value={formData.finisher}
                  onChange={e => handleChange('finisher', e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">کنترل اولیه</label>
                <input className="form-input" value={formData.initialControl}
                  onChange={e => handleChange('initialControl', e.target.value)} />
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
          )}

        </div>
      </div>
    </div>
  );
};

export default OrderEdit;
