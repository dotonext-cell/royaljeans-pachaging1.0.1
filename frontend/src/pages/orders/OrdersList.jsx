import { useEffect, useState } from 'react';
import {
  Eye, Edit2, MoreVertical, Plus, Filter, Download,
  Search, ChevronDown,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ordersService from '../../services/orders.service';

// ─── STATUS & PRIORITY MAPS ───
const statusMap = {
  // new format (UPPERCASE)
  PENDING:     { label: 'در انتظار',    cls: 'badge-gray'   },
  CONFIRMED:   { label: 'تایید شده',   cls: 'badge-blue'   },
  IN_PROGRESS: { label: 'در حال تولید', cls: 'badge-yellow' },
  READY:       { label: 'آماده تحویل', cls: 'badge-purple' },
  DELIVERED:   { label: 'تحویل شده',   cls: 'badge-green'  },
  CANCELLED:   { label: 'لغو شده',     cls: 'badge-red'    },
  // old format (lowercase) for backward compat
  pending:     { label: 'در انتظار',    cls: 'badge-gray'   },
  processing:  { label: 'در حال تولید', cls: 'badge-yellow' },
  in_progress: { label: 'در حال تولید', cls: 'badge-yellow' },
  completed:   { label: 'تحویل شده',   cls: 'badge-green'  },
  cancelled:   { label: 'لغو شده',     cls: 'badge-red'    },
};

const priorityMap = {
  URGENT: { label: 'فوری',  cls: 'priority-urgent' },
  HIGH:   { label: 'بالا',  cls: 'priority-high'   },
  NORMAL: { label: 'عادی',  cls: 'priority-normal' },
  LOW:    { label: 'پایین', cls: 'priority-low'    },
};

// fallback mock data
const MOCK_ORDERS = [
  { id: 'RJ-1024', code: 'RJ-1024', customer: 'بازار بزرگ تهران',       product: 'شلوار جین کلاسیک',   qty: 240, status: 'IN_PROGRESS', priority: 'URGENT',  date: '۱۴۰۳/۰۶/۱۵', amount: '۱۲,۴۰۰,۰۰۰' },
  { id: 'RJ-1023', code: 'RJ-1023', customer: 'فروشگاه مد پارس',        product: 'شلوار اسلیم‌فیت',    qty: 180, status: 'READY',       priority: 'HIGH',    date: '۱۴۰۳/۰۶/۱۴', amount: '۹,۸۰۰,۰۰۰'  },
  { id: 'RJ-1022', code: 'RJ-1022', customer: 'گالری لباس آرمیتا',      product: 'جین استرچ',           qty: 300, status: 'CONFIRMED',   priority: 'NORMAL',  date: '۱۴۰۳/۰۶/۱۳', amount: '۱۶,۵۰۰,۰۰۰' },
  { id: 'RJ-1021', code: 'RJ-1021', customer: 'پوشاک رضایی',            product: 'شلوار جین بگ',        qty: 120, status: 'DELIVERED',   priority: 'NORMAL',  date: '۱۴۰۳/۰۶/۱۲', amount: '۶,۲۰۰,۰۰۰'  },
  { id: 'RJ-1020', code: 'RJ-1020', customer: 'بازار تجریش',            product: 'جین بوت‌کات',         qty: 96,  status: 'PENDING',     priority: 'LOW',     date: '۱۴۰۳/۰۶/۱۱', amount: '۴,۸۰۰,۰۰۰'  },
  { id: 'RJ-1019', code: 'RJ-1019', customer: 'فروشگاه زنجیره‌ای مدرن', product: 'شلوار جین مام‌فیت',  qty: 216, status: 'IN_PROGRESS', priority: 'HIGH',    date: '۱۴۰۳/۰۶/۱۰', amount: '۱۱,۷۰۰,۰۰۰' },
];

const TABS = [
  { v: 'all',     l: 'همه'         },
  { v: 'active',  l: 'فعال'        },
  { v: 'pending', l: 'در انتظار'   },
  { v: 'done',    l: 'تحویل شده'   },
];

const OrdersList = () => {
  const [orders, setOrders]         = useState([]);
  const [loading, setLoading]       = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab]   = useState('all');
  const navigate = useNavigate();

  useEffect(() => { fetchOrders(); }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const data = await ordersService.getAll();
      const raw = data.orders || [];
      // If API returns data, use it; otherwise use mock
      setOrders(raw.length ? raw : MOCK_ORDERS);
    } catch {
      setOrders(MOCK_ORDERS);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('آیا از حذف این سفارش اطمینان دارید؟')) return;
    try {
      await ordersService.delete(id);
      setOrders(orders.filter((o) => o.id !== id));
    } catch {
      alert('خطا در حذف سفارش');
    }
  };

  // filter by tab
  const byTab = (o) => {
    const s = (o.status || '').toUpperCase();
    if (activeTab === 'all') return true;
    if (activeTab === 'active') return ['CONFIRMED', 'IN_PROGRESS'].includes(s);
    if (activeTab === 'pending') return s === 'PENDING';
    if (activeTab === 'done') return s === 'DELIVERED';
    return true;
  };

  // filter by search
  const filtered = orders.filter(byTab).filter((o) => {
    const term = searchTerm.toLowerCase();
    return (
      (o.code || o.id || '').toLowerCase().includes(term) ||
      (o.name || o.customer || '').toLowerCase().includes(term) ||
      (o.product || '').toLowerCase().includes(term)
    );
  });

  const getStatus = (o) => statusMap[(o.status || '').toUpperCase()] || statusMap[o.status] || { label: o.status, cls: 'badge-gray' };
  const getPriority = (o) => priorityMap[(o.priority || '').toUpperCase()] || { label: o.priority || '—', cls: 'priority-normal' };

  return (
    <>
      {/* ─── TOOLBAR ─── */}
      <div className="flex-between mb-16">
        <div className="tabs">
          {TABS.map(({ v, l }) => (
            <div key={v} className={`tab ${activeTab === v ? 'active' : ''}`} onClick={() => setActiveTab(v)}>
              {l}
            </div>
          ))}
        </div>
        <div className="flex gap-8">
          <button className="btn btn-ghost btn-sm"><Filter size={13} /> فیلتر</button>
          <button className="btn btn-ghost btn-sm"><Download size={13} /> اکسل</button>
          <button className="btn btn-primary btn-sm" onClick={() => navigate('/orders/new')}>
            <Plus size={13} /> سفارش جدید
          </button>
        </div>
      </div>

      {/* ─── SEARCH ─── */}
      <div className="card mb-16" style={{ padding: '12px 16px' }}>
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          <Search size={15} style={{ position: 'absolute', right: 12, color: 'var(--text-muted)' }} />
          <input
            className="search-input"
            style={{ width: '100%', paddingRight: 36 }}
            placeholder="جستجو بر اساس کد، مشتری یا محصول..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
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
                  <th>کد سفارش</th>
                  <th>مشتری</th>
                  <th>محصول</th>
                  <th>تعداد</th>
                  <th>مبلغ (تومان)</th>
                  <th>تاریخ</th>
                  <th>وضعیت</th>
                  <th>اولویت</th>
                  <th>عملیات</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={9} style={{ textAlign: 'center', padding: 40 }}>
                      <div style={{ fontSize: 36, marginBottom: 8 }}>📦</div>
                      <div className="text-muted">هیچ سفارشی یافت نشد</div>
                    </td>
                  </tr>
                ) : (
                  filtered.map((o) => {
                    const st = getStatus(o);
                    const pr = getPriority(o);
                    return (
                      <tr key={o.id || o.code} style={{ cursor: 'pointer' }}>
                        <td>
                          <span className="font-bold text-gold">{o.code || o.id}</span>
                        </td>
                        <td className="font-medium text-primary">{o.customer || o.name}</td>
                        <td className="text-secondary">{o.product || o.productName || '—'}</td>
                        <td className="font-bold">{o.qty || o.quantity || o.totalCount || '—'}</td>
                        <td className="font-medium text-green">{o.amount || o.totalAmount || '—'}</td>
                        <td className="text-secondary">
                          {o.date || (o.orderDate ? new Date(o.orderDate).toLocaleDateString('fa-IR') : '—')}
                        </td>
                        <td>
                          <span className={`badge ${st.cls}`}>
                            <span className="badge-dot" style={{ background: 'currentColor' }} />
                            {st.label}
                          </span>
                        </td>
                        <td>
                          <span className={pr.cls}>{pr.label}</span>
                        </td>
                        <td>
                          <div className="flex gap-8">
                            <button
                              className="icon-btn" style={{ width: 28, height: 28, borderRadius: 6 }}
                              onClick={() => navigate(`/orders/${o.id}`)}
                            >
                              <Eye size={12} />
                            </button>
                            <button
                              className="icon-btn" style={{ width: 28, height: 28, borderRadius: 6 }}
                              onClick={() => navigate(`/orders/${o.id}/edit`)}
                            >
                              <Edit2 size={12} />
                            </button>
                            <button className="icon-btn" style={{ width: 28, height: 28, borderRadius: 6 }}>
                              <MoreVertical size={12} />
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

export default OrdersList;
