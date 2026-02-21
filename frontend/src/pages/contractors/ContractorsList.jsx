import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

const TYPE_CONFIG = {
  FABRIC:     { label:'تأمین پارچه',  color:'#3b82f6', bg:'rgba(59,130,246,.15)'  },
  PRODUCTION: { label:'تولید',        color:'#10b981', bg:'rgba(16,185,129,.15)'  },
  PACKAGING:  { label:'بسته‌بندی',   color:'#8b5cf6', bg:'rgba(139,92,246,.15)'   },
  STONE_WASH: { label:'سنگ‌شویی',    color:'#f59e0b', bg:'rgba(245,158,11,.15)'   },
};

const TypeBadge = ({ type }) => {
  const t = TYPE_CONFIG[type] || { label:type, color:'#94a3b8', bg:'rgba(148,163,184,.15)' };
  return (
    <span style={{
      display:'inline-block', padding:'3px 10px', borderRadius:20,
      fontSize:12, fontWeight:600, color:t.color, background:t.bg,
    }}>{t.label}</span>
  );
};

export default function ContractorsList() {
  const navigate = useNavigate();

  const [contractors, setContractors] = useState([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState(null);
  const [search, setSearch]           = useState('');
  const [typeFilter, setTypeFilter]   = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting]       = useState(false);

  const loadContractors = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const params = {};
      if (typeFilter) params.type = typeFilter;

      const res = await api.get('/contractors', { params });
      let data = res.data.contractors || [];

      // فیلتر جستجو (client-side)
      if (search) {
        const term = search.toLowerCase();
        data = data.filter(c =>
          c.name.toLowerCase().includes(term) ||
          (c.phone && c.phone.includes(term))
        );
      }

      setContractors(data);
    } catch (err) {
      console.error('Contractors load error:', err);
      setError('خطا در دریافت پیمانکاران');
    } finally {
      setLoading(false);
    }
  }, [typeFilter, search]);

  useEffect(() => {
    loadContractors();
  }, [loadContractors]);

  const handleDelete = async (id) => {
    try {
      setDeleting(true);
      await api.delete(`/contractors/${id}`);
      setDeleteTarget(null);
      await loadContractors();
    } catch (err) {
      alert('خطا در حذف پیمانکار');
    } finally {
      setDeleting(false);
    }
  };

  // محاسبه میانگین امتیاز
  const getAvgRating = (evaluations) => {
    if (!evaluations?.length) return null;
    const avg = evaluations.reduce((s, e) => s + e.rating, 0) / evaluations.length;
    return avg.toFixed(1);
  };

  return (
    <div className="page-container">

      {/* هدر */}
      <div className="page-header">
        <div>
          <h1 className="page-title">پیمانکاران</h1>
          <p className="page-subtitle">
            {loading ? 'در حال بارگذاری...' : `${contractors.length} پیمانکار`}
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/contractors/new')}>
          + پیمانکار جدید
        </button>
      </div>

      {/* فیلترها */}
      <div className="card" style={{ marginBottom:20 }}>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr auto', gap:12, alignItems:'end' }}>
          <div className="form-group" style={{ margin:0 }}>
            <label className="form-label">جستجو</label>
            <input className="form-input" placeholder="نام یا شماره تماس..."
              value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <div className="form-group" style={{ margin:0 }}>
            <label className="form-label">نوع پیمانکار</label>
            <select className="form-input" value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
              <option value="">همه انواع</option>
              <option value="FABRIC">تأمین پارچه</option>
              <option value="PRODUCTION">تولید</option>
              <option value="PACKAGING">بسته‌بندی</option>
              <option value="STONE_WASH">سنگ‌شویی</option>
            </select>
          </div>
          <button className="btn btn-ghost"
            onClick={() => { setSearch(''); setTypeFilter(''); }}>
            پاک کردن
          </button>
        </div>
      </div>

      {/* خطا */}
      {error && (
        <div style={{ background:'rgba(239,68,68,.15)', border:'1px solid #ef4444',
          borderRadius:12, padding:'12px 18px', marginBottom:20, color:'#f87171' }}>
          ⚠️ {error}
        </div>
      )}

      {/* جدول */}
      <div className="card">
        {loading ? (
          <div className="loading-spinner"><div className="spinner"/><p>در حال بارگذاری...</p></div>
        ) : contractors.length === 0 ? (
          <div className="empty-state">
            <span>🤝</span>
            <p>هیچ پیمانکاری یافت نشد</p>
            <button className="btn btn-primary" onClick={() => navigate('/contractors/new')}>
              ثبت اولین پیمانکار
            </button>
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>نام</th>
                  <th>نوع</th>
                  <th>شماره تماس</th>
                  <th>امتیاز میانگین</th>
                  <th>تعداد ارزیابی</th>
                  <th>وضعیت</th>
                  <th>عملیات</th>
                </tr>
              </thead>
              <tbody>
                {contractors.map(c => {
                  const avgRating = getAvgRating(c.evaluations);
                  return (
                    <tr key={c.id}>
                      <td style={{ fontWeight:600 }}>{c.name}</td>
                      <td><TypeBadge type={c.type} /></td>
                      <td style={{ color:'#94a3b8', direction:'ltr', textAlign:'right' }}>
                        {c.phone || '—'}
                      </td>
                      <td>
                        {avgRating ? (
                          <span style={{ color:'#f59e0b', fontWeight:700 }}>
                            ⭐ {avgRating}
                          </span>
                        ) : <span style={{ color:'#475569' }}>—</span>}
                      </td>
                      <td>
                        <span style={{
                          background:'rgba(139,92,246,.15)', color:'#a78bfa',
                          padding:'2px 8px', borderRadius:6, fontSize:13
                        }}>{c._count?.evaluations || 0}</span>
                      </td>
                      <td>
                        <span style={{
                          background: c.isActive ? 'rgba(16,185,129,.15)' : 'rgba(148,163,184,.15)',
                          color: c.isActive ? '#34d399' : '#94a3b8',
                          padding:'2px 10px', borderRadius:20, fontSize:12, fontWeight:600
                        }}>
                          {c.isActive ? 'فعال' : 'غیرفعال'}
                        </span>
                      </td>
                      <td>
                        <div style={{ display:'flex', gap:6 }}>
                          <button className="btn-icon" title="ویرایش"
                            onClick={() => navigate(`/contractors/${c.id}/edit`)}>✏️</button>
                          <button className="btn-icon" title="ارزیابی"
                            onClick={() => navigate(`/contractors/${c.id}`)}>⭐</button>
                          <button className="btn-icon" title="حذف" style={{ color:'#f87171' }}
                            onClick={() => setDeleteTarget(c)}>🗑️</button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal تأیید حذف */}
      {deleteTarget && (
        <div style={{
          position:'fixed', inset:0, background:'rgba(0,0,0,.7)',
          display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000
        }}>
          <div style={{
            background:'#111827', border:'1px solid #1e293b',
            borderRadius:16, padding:28, width:'90%', maxWidth:420, direction:'rtl', textAlign:'center'
          }}>
            <div style={{ fontSize:40, marginBottom:12 }}>⚠️</div>
            <h3 style={{ color:'#f1f5f9', marginBottom:8 }}>حذف پیمانکار</h3>
            <p style={{ color:'#94a3b8', marginBottom:24 }}>
              آیا از حذف «{deleteTarget.name}» مطمئن هستید؟
              <br/><small style={{ color:'#475569' }}>این عمل قابل بازگشت نیست.</small>
            </p>
            <div style={{ display:'flex', justifyContent:'center', gap:12 }}>
              <button className="btn btn-ghost" onClick={() => setDeleteTarget(null)}>انصراف</button>
              <button
                style={{
                  background:'rgba(239,68,68,.2)', color:'#f87171',
                  border:'1px solid rgba(239,68,68,.3)', borderRadius:8, padding:'8px 20px',
                  cursor:'pointer', fontFamily:'inherit'
                }}
                disabled={deleting}
                onClick={() => handleDelete(deleteTarget.id)}>
                {deleting ? 'در حال حذف...' : 'بله، حذف کن'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
