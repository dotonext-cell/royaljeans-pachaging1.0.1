import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Plus, Edit, Trash2, Search, X, Check, ChevronDown, ChevronUp } from 'lucide-react';
import settingsService from '../../services/settings.service';
import UserManagement from './UserManagement';

// ─── کارت تنظیمات ────────────────────────────────────────────
const SettingCard = ({ title, icon, color, items, onAdd, onEdit, onDelete }) => {
  const [expanded, setExpanded] = useState(true);
  const [search, setSearch] = useState('');
  const [adding, setAdding] = useState(false);
  const [newItem, setNewItem] = useState('');

  const filtered = (items || []).filter(item =>
    (item.name || '').toLowerCase().includes(search.toLowerCase())
  );

  const handleAdd = () => {
    if (newItem.trim()) {
      onAdd(newItem.trim());
      setNewItem('');
      setAdding(false);
    }
  };

  return (
    <div style={{
      background: '#111827', border: '1px solid #1e293b',
      borderRadius: 16, overflow: 'hidden', marginBottom: 0,
    }}>
      {/* هدر */}
      <div
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '14px 18px', cursor: 'pointer',
          background: `${color}15`,
          borderBottom: expanded ? `1px solid ${color}33` : 'none',
        }}
        onClick={() => setExpanded(!expanded)}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 38, height: 38, borderRadius: 10,
            background: color, display: 'flex', alignItems: 'center',
            justifyContent: 'center', fontSize: 18,
          }}>
            {icon}
          </div>
          <div>
            <div style={{ fontWeight: 600, color: '#f1f5f9', fontSize: 14 }}>{title}</div>
            <div style={{ color: '#64748b', fontSize: 12 }}>{items?.length || 0} مورد</div>
          </div>
        </div>
        <div style={{ color: '#94a3b8' }}>
          {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </div>
      </div>

      {/* محتوا */}
      {expanded && (
        <div style={{ padding: 16 }}>
          {/* جستجو و افزودن */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
            <div style={{ flex: 1, position: 'relative' }}>
              <Search style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
                color: '#64748b' }} size={14} />
              <input
                className="form-input"
                style={{ paddingRight: 32, fontSize: 13 }}
                placeholder="جستجو..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <button
              style={{
                padding: '6px 12px', borderRadius: 8, border: 'none',
                background: color, color: '#fff', cursor: 'pointer',
                fontFamily: 'inherit', fontSize: 13, display: 'flex', alignItems: 'center', gap: 4,
              }}
              onClick={() => setAdding(!adding)}
            >
              <Plus size={14} /> افزودن
            </button>
          </div>

          {/* فرم افزودن */}
          {adding && (
            <div style={{
              display: 'flex', gap: 8, marginBottom: 12,
              padding: 10, background: 'rgba(255,255,255,.04)', borderRadius: 8,
            }}>
              <input
                className="form-input"
                style={{ flex: 1, fontSize: 13 }}
                placeholder="مقدار جدید را وارد کنید"
                value={newItem}
                onChange={e => setNewItem(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAdd()}
                autoFocus
              />
              <button onClick={handleAdd}
                style={{ padding: '6px 10px', borderRadius: 6, border: 'none',
                  background: 'rgba(16,185,129,.2)', color: '#34d399', cursor: 'pointer' }}>
                <Check size={14} />
              </button>
              <button onClick={() => { setAdding(false); setNewItem(''); }}
                style={{ padding: '6px 10px', borderRadius: 6, border: 'none',
                  background: 'rgba(255,255,255,.05)', color: '#94a3b8', cursor: 'pointer' }}>
                <X size={14} />
              </button>
            </div>
          )}

          {/* لیست آیتم‌ها */}
          {filtered.length === 0 ? (
            <div style={{ textAlign: 'center', color: '#475569', padding: '16px 0', fontSize: 13 }}>
              موردی یافت نشد
            </div>
          ) : (
            <div style={{ maxHeight: 280, overflowY: 'auto' }}>
              {filtered.map(item => (
                <div key={item.id || item.name}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '8px 12px', borderRadius: 8, marginBottom: 4,
                    background: 'rgba(255,255,255,.03)',
                    border: '1px solid rgba(255,255,255,.04)',
                  }}>
                  <span style={{
                    background: `${color}20`, color: color,
                    padding: '2px 10px', borderRadius: 20, fontSize: 13, fontWeight: 600,
                  }}>
                    {item.name || item.value}
                  </span>
                  <div style={{ display: 'flex', gap: 4 }}>
                    <button
                      onClick={() => onEdit(item)}
                      style={{ padding: '4px 8px', borderRadius: 6, border: 'none',
                        background: 'rgba(255,255,255,.06)', color: '#94a3b8', cursor: 'pointer' }}>
                      <Edit size={12} />
                    </button>
                    <button
                      onClick={() => onDelete(item.id || item.name)}
                      style={{ padding: '4px 8px', borderRadius: 6, border: 'none',
                        background: 'rgba(239,68,68,.1)', color: '#f87171', cursor: 'pointer' }}>
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ─── پنل مدیریت ──────────────────────────────────────────────
const AdminPanel = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    productionSuppliers: [], fabricSuppliers: [], fabrics: [],
    stoneWashes: [], packingNames: [], styles: [], orderTypes: [], orderLevels: [],
  });
  const navigate = useNavigate();
  const location = useLocation();
  const isUsersPage = location.pathname === '/admin/users';

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const data = await settingsService.getAll();
      setSettings(data);
    } catch (err) {
      console.error('Failed to load settings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchSettings(); }, []);

  const handleAdd = async (type, value) => {
    const serviceMap = {
      productionSuppliers: settingsService.createProductionSupplier,
      fabricSuppliers: settingsService.createFabricSupplier,
      fabrics: settingsService.createFabric,
      stoneWashes: settingsService.createStoneWash,
      packingNames: settingsService.createPackingName,
      styles: settingsService.createStyle,
      orderTypes: settingsService.createOrderType,
      orderLevels: settingsService.createOrderLevel,
    };
    try {
      setSaving(true);
      await serviceMap[type]({ name: value, value });
      await fetchSettings();
    } catch (err) {
      alert('خطا در افزودن مورد');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = async (type, item) => {
    const newValue = prompt('مقدار جدید را وارد کنید:', item.name || item.value);
    if (!newValue || newValue === (item.name || item.value)) return;
    const serviceMap = {
      productionSuppliers: settingsService.updateProductionSupplier,
      fabricSuppliers: settingsService.updateFabricSupplier,
      fabrics: settingsService.updateFabric,
      stoneWashes: settingsService.updateStoneWash,
      packingNames: settingsService.updatePackingName,
      styles: settingsService.updateStyle,
      orderTypes: settingsService.updateOrderType,
      orderLevels: settingsService.updateOrderLevel,
    };
    try {
      setSaving(true);
      await serviceMap[type](item.id || item.name, { name: newValue, value: newValue });
      await fetchSettings();
    } catch (err) {
      alert('خطا در ویرایش مورد');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (type, id) => {
    if (!window.confirm('آیا از حذف این مورد اطمینان دارید؟')) return;
    const serviceMap = {
      productionSuppliers: settingsService.deleteProductionSupplier,
      fabricSuppliers: settingsService.deleteFabricSupplier,
      fabrics: settingsService.deleteFabric,
      stoneWashes: settingsService.deleteStoneWash,
      packingNames: settingsService.deletePackingName,
      styles: settingsService.deleteStyle,
      orderTypes: settingsService.deleteOrderType,
      orderLevels: settingsService.deleteOrderLevel,
    };
    try {
      setSaving(true);
      await serviceMap[type](id);
      await fetchSettings();
    } catch (err) {
      alert('خطا در حذف مورد');
    } finally {
      setSaving(false);
    }
  };

  const tabStyle = (active) => ({
    padding: '10px 20px', borderRadius: 10, border: 'none',
    background: active ? '#f59e0b' : 'rgba(255,255,255,.05)',
    color: active ? '#0b0f1a' : '#94a3b8',
    fontFamily: 'inherit', fontWeight: active ? 700 : 400,
    cursor: 'pointer', fontSize: 14, display: 'flex', alignItems: 'center', gap: 8,
  });

  return (
    <div className="page-container">
      {/* تب‌ها */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
        <button style={tabStyle(!isUsersPage)} onClick={() => navigate('/admin')}>
          ⚙️ تنظیمات سیستم
        </button>
        <button style={tabStyle(isUsersPage)} onClick={() => navigate('/admin/users')}>
          👥 مدیریت کاربران
        </button>
      </div>

      {isUsersPage ? (
        <UserManagement />
      ) : (
        <>
          {/* هدر */}
          <div className="page-header">
            <div>
              <h1 className="page-title">پنل مدیریت سیستم</h1>
              <p className="page-subtitle">مدیریت لیست‌های انتخابی و تنظیمات سیستم</p>
            </div>
            <button className="btn btn-ghost" onClick={fetchSettings} disabled={saving}>
              🔄 بروزرسانی
            </button>
          </div>

          {loading ? (
            <div className="loading-spinner">
              <div className="spinner" />
              <p>در حال بارگذاری...</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <SettingCard
                title="نام‌های تولیدی" icon="🏭" color="#10b981"
                items={settings.productionSuppliers}
                onAdd={v => handleAdd('productionSuppliers', v)}
                onEdit={i => handleEdit('productionSuppliers', i)}
                onDelete={id => handleDelete('productionSuppliers', id)}
              />
              <SettingCard
                title="نام‌های بسته‌بندی" icon="📦" color="#8b5cf6"
                items={settings.packingNames}
                onAdd={v => handleAdd('packingNames', v)}
                onEdit={i => handleEdit('packingNames', i)}
                onDelete={id => handleDelete('packingNames', id)}
              />
              <SettingCard
                title="نام‌های شستشو" icon="💧" color="#f59e0b"
                items={settings.stoneWashes}
                onAdd={v => handleAdd('stoneWashes', v)}
                onEdit={i => handleEdit('stoneWashes', i)}
                onDelete={id => handleDelete('stoneWashes', id)}
              />
              <SettingCard
                title="نام‌های پارچه" icon="🧵" color="#3b82f6"
                items={settings.fabrics}
                onAdd={v => handleAdd('fabrics', v)}
                onEdit={i => handleEdit('fabrics', i)}
                onDelete={id => handleDelete('fabrics', id)}
              />
              <SettingCard
                title="استایل‌ها" icon="✂️" color="#06b6d4"
                items={settings.styles}
                onAdd={v => handleAdd('styles', v)}
                onEdit={i => handleEdit('styles', i)}
                onDelete={id => handleDelete('styles', id)}
              />
              <SettingCard
                title="نوع سفارش (BU)" icon="🏷️" color="#ec4899"
                items={settings.orderTypes}
                onAdd={v => handleAdd('orderTypes', v)}
                onEdit={i => handleEdit('orderTypes', i)}
                onDelete={id => handleDelete('orderTypes', id)}
              />
              <SettingCard
                title="سطح سفارش (BV)" icon="📊" color="#f97316"
                items={settings.orderLevels}
                onAdd={v => handleAdd('orderLevels', v)}
                onEdit={i => handleEdit('orderLevels', i)}
                onDelete={id => handleDelete('orderLevels', id)}
              />
              <SettingCard
                title="تأمین‌کنندگان پارچه" icon="🏗️" color="#84cc16"
                items={settings.fabricSuppliers}
                onAdd={v => handleAdd('fabricSuppliers', v)}
                onEdit={i => handleEdit('fabricSuppliers', i)}
                onDelete={id => handleDelete('fabricSuppliers', id)}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AdminPanel;
