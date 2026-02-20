import { useState } from 'react';
import { Eye, Edit2, Plus, Search, Package } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const MOCK_PRODUCTS = [
  { id: 1, code: 'RJ-P001', name: 'شلوار جین کلاسیک',  category: 'جین مردانه',  style: 'اسلیم‌فیت',  isActive: true  },
  { id: 2, code: 'RJ-P002', name: 'جین استرچ بانوان',   category: 'جین زنانه',   style: 'اسکینی',     isActive: true  },
  { id: 3, code: 'RJ-P003', name: 'شلوار جین بگ',       category: 'جین مردانه',  style: 'بگ‌فیت',    isActive: true  },
  { id: 4, code: 'RJ-P004', name: 'جین مام‌فیت',         category: 'جین زنانه',   style: 'مام‌فیت',   isActive: false },
  { id: 5, code: 'RJ-P005', name: 'شلوار جین بوت‌کات',  category: 'جین مردانه',  style: 'بوت‌کات',   isActive: true  },
];

const ProductsPage = () => {
  const [products]      = useState(MOCK_PRODUCTS);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  const filtered = products.filter((p) => {
    const t = searchTerm.toLowerCase();
    return p.name.toLowerCase().includes(t) || p.code.toLowerCase().includes(t);
  });

  return (
    <>
      {/* ─── TOOLBAR ─── */}
      <div className="flex-between mb-16">
        <div className="text-secondary text-sm">{filtered.length} محصول</div>
        <button className="btn btn-primary btn-sm">
          <Plus size={13} /> محصول جدید
        </button>
      </div>

      {/* ─── SEARCH ─── */}
      <div className="card mb-16" style={{ padding: '12px 16px' }}>
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          <Search size={15} style={{ position: 'absolute', right: 12, color: 'var(--text-muted)' }} />
          <input
            className="search-input"
            style={{ width: '100%', paddingRight: 36 }}
            placeholder="جستجو در محصولات..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* ─── TABLE ─── */}
      <div className="card animate-fadeUp">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>کد محصول</th>
                <th>نام محصول</th>
                <th>دسته‌بندی</th>
                <th>استایل</th>
                <th>وضعیت</th>
                <th>عملیات</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: 40 }}>
                    <Package size={40} color="var(--text-muted)" />
                    <div className="text-muted mt-8">هیچ محصولی یافت نشد</div>
                  </td>
                </tr>
              ) : (
                filtered.map((p) => (
                  <tr key={p.id}>
                    <td><span className="font-bold text-gold">{p.code}</span></td>
                    <td className="font-medium text-primary">{p.name}</td>
                    <td className="text-secondary">{p.category}</td>
                    <td>
                      <span className="badge badge-blue">{p.style}</span>
                    </td>
                    <td>
                      <span className={`badge ${p.isActive ? 'badge-green' : 'badge-red'}`}>
                        {p.isActive ? 'فعال' : 'غیرفعال'}
                      </span>
                    </td>
                    <td>
                      <div className="flex gap-8">
                        <button className="icon-btn" style={{ width: 28, height: 28, borderRadius: 6 }}>
                          <Eye size={12} />
                        </button>
                        <button className="icon-btn" style={{ width: 28, height: 28, borderRadius: 6 }}>
                          <Edit2 size={12} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

export default ProductsPage;
