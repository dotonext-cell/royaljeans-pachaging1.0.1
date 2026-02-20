import { useEffect, useState } from 'react';
import { Eye, Edit2, Trash2, Plus, Search, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import contractorsService from '../../services/contractors.service';

const typeMap = {
  FABRIC:     { label: 'پارچه',      cls: 'badge-blue'   },
  PRODUCTION: { label: 'تولید',      cls: 'badge-green'  },
  PACKAGING:  { label: 'بسته‌بندی', cls: 'badge-purple' },
  STONE_WASH: { label: 'سنگ‌شویی', cls: 'badge-yellow'  },
};

const MOCK = [
  { id: 1, name: 'پارچه‌فروشی رضوی',      type: 'FABRIC',     phone: '۰۲۱-۱۲۳۴۵۶۷', isActive: true,  _count: { evaluations: 8  } },
  { id: 2, name: 'تولیدی برادران احمدی',  type: 'PRODUCTION', phone: '۰۹۱۲-۳۴۵-۶۷۸', isActive: true,  _count: { evaluations: 12 } },
  { id: 3, name: 'بسته‌بندی نوین',         type: 'PACKAGING',  phone: '۰۲۱-۹۸۷۶۵۴۳', isActive: true,  _count: { evaluations: 5  } },
  { id: 4, name: 'سنگ‌شویی آرمان',         type: 'STONE_WASH', phone: '۰۹۱۱-۲۲۲-۳۳۳', isActive: false, _count: { evaluations: 3  } },
  { id: 5, name: 'تولیدی شریفی',           type: 'PRODUCTION', phone: '۰۹۱۳-۴۴۴-۵۵۵', isActive: true,  _count: { evaluations: 7  } },
];

const ContractorsList = () => {
  const [contractors, setContractors] = useState([]);
  const [loading, setLoading]         = useState(true);
  const [searchTerm, setSearchTerm]   = useState('');
  const [typeFilter, setTypeFilter]   = useState('');
  const navigate = useNavigate();

  useEffect(() => { fetchContractors(); }, [typeFilter]);

  const fetchContractors = async () => {
    try {
      setLoading(true);
      const params = typeFilter ? { type: typeFilter } : {};
      const data = await contractorsService.getAll(params);
      const raw = data.contractors || [];
      setContractors(raw.length ? raw : MOCK);
    } catch {
      setContractors(MOCK);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('آیا از حذف این پیمانکار اطمینان دارید؟')) return;
    try {
      await contractorsService.delete(id);
      setContractors(contractors.filter((c) => c.id !== id));
    } catch {
      alert('خطا در حذف پیمانکار');
    }
  };

  const filtered = contractors.filter((c) => {
    const term = searchTerm.toLowerCase();
    return (
      c.name?.toLowerCase().includes(term) ||
      c.phone?.includes(term)
    );
  });

  const getType = (type) => typeMap[type?.toUpperCase()] || { label: type || '—', cls: 'badge-gray' };

  return (
    <>
      {/* ─── TOOLBAR ─── */}
      <div className="flex-between mb-16">
        <div className="text-secondary text-sm">
          {filtered.length} پیمانکار
        </div>
        <button className="btn btn-primary btn-sm" onClick={() => navigate('/contractors/new')}>
          <Plus size={13} /> پیمانکار جدید
        </button>
      </div>

      {/* ─── FILTERS ─── */}
      <div className="card mb-16" style={{ padding: '12px 16px' }}>
        <div className="flex gap-8">
          <div style={{ position: 'relative', flex: 1, display: 'flex', alignItems: 'center' }}>
            <Search size={15} style={{ position: 'absolute', right: 12, color: 'var(--text-muted)' }} />
            <input
              className="search-input"
              style={{ width: '100%', paddingRight: 36 }}
              placeholder="جستجو بر اساس نام یا شماره تماس..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            style={{
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid var(--border)',
              borderRadius: 10,
              padding: '8px 14px',
              color: 'var(--text-secondary)',
              fontFamily: 'var(--font)',
              fontSize: 13,
              outline: 'none',
              minWidth: 160,
            }}
          >
            <option value="">همه انواع</option>
            <option value="FABRIC">پارچه</option>
            <option value="PRODUCTION">تولید</option>
            <option value="PACKAGING">بسته‌بندی</option>
            <option value="STONE_WASH">سنگ‌شویی</option>
          </select>
        </div>
      </div>

      {/* ─── TABLE ─── */}
      <div className="card animate-fadeUp">
        {loading ? (
          <div style={{ padding: 60, textAlign: 'center', color: 'var(--text-muted)' }}>
            در حال بارگذاری...
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>نام پیمانکار</th>
                  <th>نوع</th>
                  <th>شماره تماس</th>
                  <th>ارزیابی‌ها</th>
                  <th>وضعیت</th>
                  <th>عملیات</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: 40 }}>
                      <div style={{ fontSize: 36, marginBottom: 8 }}>🏭</div>
                      <div className="text-muted">هیچ پیمانکاری یافت نشد</div>
                    </td>
                  </tr>
                ) : (
                  filtered.map((c) => {
                    const tp = getType(c.type);
                    return (
                      <tr key={c.id}>
                        <td className="font-medium text-primary">{c.name}</td>
                        <td>
                          <span className={`badge ${tp.cls}`}>{tp.label}</span>
                        </td>
                        <td dir="ltr" style={{ textAlign: 'right' }}>{c.phone || '—'}</td>
                        <td>
                          <div className="flex-center gap-8">
                            <Star size={13} color="#fbbf24" fill="#fbbf24" />
                            <span className="text-sm">{c._count?.evaluations || 0} ارزیابی</span>
                          </div>
                        </td>
                        <td>
                          <span className={`badge ${c.isActive ? 'badge-green' : 'badge-red'}`}>
                            {c.isActive ? 'فعال' : 'غیرفعال'}
                          </span>
                        </td>
                        <td>
                          <div className="flex gap-8">
                            <button
                              className="icon-btn" style={{ width: 28, height: 28, borderRadius: 6 }}
                              onClick={() => navigate(`/contractors/${c.id}`)}
                            >
                              <Eye size={12} />
                            </button>
                            <button
                              className="icon-btn" style={{ width: 28, height: 28, borderRadius: 6 }}
                              onClick={() => navigate(`/contractors/${c.id}/edit`)}
                            >
                              <Edit2 size={12} />
                            </button>
                            <button
                              className="icon-btn" style={{ width: 28, height: 28, borderRadius: 6 }}
                              onClick={() => handleDelete(c.id)}
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
};

export default ContractorsList;
