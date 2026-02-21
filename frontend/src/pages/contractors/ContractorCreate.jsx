import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import contractorsService from '../../services/contractors.service';

const ContractorCreate = () => {
  const [formData, setFormData] = useState({
    name: '',
    type: 'FABRIC',
    phone: '',
    address: '',
    notes: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.name || !formData.type) {
      setError('نام و نوع پیمانکار اجباری است');
      return;
    }

    try {
      setLoading(true);
      await contractorsService.create(formData);
      setSuccess('پیمانکار جدید با موفقیت ایجاد شد');
      setTimeout(() => navigate('/contractors'), 1200);
    } catch (err) {
      setError(err.response?.data?.message || 'خطا در ایجاد پیمانکار');
    } finally {
      setLoading(false);
    }
  };

  const TYPE_DESCRIPTIONS = {
    FABRIC:     'شرکت‌هایی که پارچه و مواد اولیه را تأمین می‌کنند',
    PRODUCTION: 'کارگاه‌ها و کارخانه‌هایی که عملیات تولید را انجام می‌دهند',
    PACKAGING:  'شرکت‌هایی که خدمات بسته‌بندی و آماده‌سازی نهایی را ارائه می‌دهند',
    STONE_WASH: 'مراکز شستشو و آب‌کشی که عملیات شستشوی نهایی را انجام می‌دهند',
  };

  return (
    <div className="page-container">
      {/* هدر */}
      <div className="page-header">
        <div>
          <button className="btn btn-ghost" onClick={() => navigate('/contractors')}
            style={{ marginBottom: 8 }}>
            ← بازگشت
          </button>
          <h1 className="page-title">ثبت پیمانکار جدید</h1>
        </div>
        <button
          className="btn btn-primary"
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? 'در حال ذخیره...' : '💾 ذخیره پیمانکار'}
        </button>
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

      <div style={{ maxWidth: 720 }}>
        <form onSubmit={handleSubmit}>
          {/* اطلاعات پایه */}
          <div className="card" style={{ marginBottom: 20 }}>
            <div className="card-header">
              <h3 className="card-title">اطلاعات پایه</h3>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, padding: '8px 0' }}>
              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label className="form-label">نام پیمانکار *</label>
                <input
                  className="form-input"
                  value={formData.name}
                  onChange={e => handleChange('name', e.target.value)}
                  placeholder="نام کامل پیمانکار"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">نوع پیمانکار *</label>
                <select
                  className="form-input"
                  value={formData.type}
                  onChange={e => handleChange('type', e.target.value)}
                  required
                >
                  <option value="FABRIC">تأمین پارچه</option>
                  <option value="PRODUCTION">تولید</option>
                  <option value="PACKAGING">بسته‌بندی</option>
                  <option value="STONE_WASH">شستشو</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">شماره تماس</label>
                <input
                  className="form-input"
                  value={formData.phone}
                  onChange={e => handleChange('phone', e.target.value)}
                  placeholder="مثال: 09121234567"
                  type="tel"
                />
              </div>

              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label className="form-label">آدرس</label>
                <input
                  className="form-input"
                  value={formData.address}
                  onChange={e => handleChange('address', e.target.value)}
                  placeholder="آدرس کامل"
                />
              </div>
            </div>
          </div>

          {/* اطلاعات تکمیلی */}
          <div className="card" style={{ marginBottom: 20 }}>
            <div className="card-header">
              <h3 className="card-title">اطلاعات تکمیلی</h3>
            </div>
            <div style={{ padding: '8px 0' }}>
              <div className="form-group">
                <label className="form-label">یادداشت‌ها</label>
                <textarea
                  className="form-input"
                  value={formData.notes}
                  onChange={e => handleChange('notes', e.target.value)}
                  placeholder="یادداشت‌ها، توضیحات اضافی، یا نکات مهم..."
                  rows={5}
                  style={{ resize: 'vertical' }}
                />
              </div>
            </div>
          </div>

          {/* راهنما */}
          {formData.type && (
            <div style={{
              background: 'rgba(59,130,246,.1)', border: '1px solid rgba(59,130,246,.2)',
              borderRadius: 12, padding: '14px 18px',
            }}>
              <div style={{ color: '#60a5fa', fontWeight: 600, marginBottom: 6, fontSize: 13 }}>
                💡 راهنمای نوع انتخاب‌شده
              </div>
              <div style={{ color: '#94a3b8', fontSize: 13 }}>
                <strong style={{ color: '#cbd5e1' }}>
                  {formData.type === 'FABRIC' ? 'تأمین پارچه' :
                   formData.type === 'PRODUCTION' ? 'تولید' :
                   formData.type === 'PACKAGING' ? 'بسته‌بندی' : 'شستشو'}:
                </strong>{' '}
                {TYPE_DESCRIPTIONS[formData.type]}
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default ContractorCreate;
