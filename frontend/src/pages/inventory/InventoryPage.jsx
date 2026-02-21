import React, { useState, useEffect, useCallback } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { inventoryService } from '../../services/inventory.service';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background:'#1e293b', border:'1px solid #334155',
      borderRadius:10, padding:'10px 16px', fontSize:13, direction:'rtl'
    }}>
      <div style={{ color:'#94a3b8', marginBottom:6 }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ color:p.color, display:'flex', gap:8 }}>
          <span>{p.name}:</span>
          <span style={{ fontWeight:700 }}>{(p.value || 0).toLocaleString('fa-IR')}</span>
        </div>
      ))}
    </div>
  );
};

export default function InventoryPage() {
  const [summary, setSummary]         = useState(null);
  const [accessories, setAccessories] = useState([]);
  const [stock, setStock]             = useState([]);
  const [movement, setMovement]       = useState([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState(null);
  const [search, setSearch]           = useState('');
  const [showLowOnly, setShowLowOnly] = useState(false);
  const [activeTab, setActiveTab]     = useState('overview'); // overview, accessories, movement

  const loadInventory = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = { search, lowStock: showLowOnly };
      const [summaryRes, accessoriesRes, stockRes, movementRes] = await Promise.all([
        inventoryService.getSummary(),
        inventoryService.getAccessories(),
        inventoryService.getStock(params),
        inventoryService.getMovement({ limit: 15 }),
      ]);

      setSummary(summaryRes);
      setAccessories(accessoriesRes.accessories || []);
      setStock(stockRes.items || []);
      setMovement(movementRes.movements || []);
    } catch (err) {
      console.error('Inventory load error:', err);
      setError('خطا در دریافت اطلاعات انبار');
    } finally {
      setLoading(false);
    }
  }, [search, showLowOnly]);

  useEffect(() => {
    loadInventory();
  }, [loadInventory]);

  // ساخت داده چارت از موجودی
  const chartData = summary ? [
    { name: 'پارچه',     ورودی: summary.summary?.totalFabric     || 0, خروجی: 0 },
    { name: 'تولید',     ورودی: summary.summary?.totalProduction || 0, خروجی: 0 },
    { name: 'سنگشویی',  ورودی: summary.summary?.totalWash       || 0, خروجی: 0 },
    { name: 'بسته‌بندی',ورودی: summary.summary?.totalPackaging  || 0, خروجی: 0 },
    { name: 'قابل فروش',ورودی: summary.summary?.totalSaleable   || 0, خروجی: 0 },
  ] : [];

  const s = summary?.summary || {};

  return (
    <div className="page-container">

      {/* هدر */}
      <div className="page-header">
        <div>
          <h1 className="page-title">مدیریت انبار</h1>
          <p className="page-subtitle">موجودی و گردش مراحل تولید</p>
        </div>
        <button className="btn btn-ghost" onClick={loadInventory} disabled={loading}>
          ↻ {loading ? 'در حال بارگذاری...' : 'بروزرسانی'}
        </button>
      </div>

      {error && (
        <div style={{ background:'rgba(239,68,68,.15)', border:'1px solid #ef4444',
          borderRadius:12, padding:'12px 18px', marginBottom:20, color:'#f87171' }}>
          ⚠️ {error}
        </div>
      )}

      {/* کارت‌های کلی */}
      <div className="stats-grid" style={{ marginBottom:24 }}>
        <div className="stat-card" style={{ borderTop:'3px solid #f59e0b' }}>
          <div className="stat-label">موجودی پارچه</div>
          <div className="stat-value" style={{ color:'#f59e0b' }}>
            {loading ? '...' : (s.totalFabric || 0).toLocaleString('fa-IR')}
          </div>
        </div>
        <div className="stat-card" style={{ borderTop:'3px solid #3b82f6' }}>
          <div className="stat-label">موجودی تولید</div>
          <div className="stat-value" style={{ color:'3b82f6' }}>
            {loading ? '...' : (s.totalProduction || 0).toLocaleString('fa-IR')}
          </div>
        </div>
        <div className="stat-card" style={{ borderTop:'3px solid #10b981' }}>
          <div className="stat-label">قابل فروش</div>
          <div className="stat-value" style={{ color:'#10b981' }}>
            {loading ? '...' : (s.totalSaleable || 0).toLocaleString('fa-IR')}
          </div>
        </div>
        <div className="stat-card" style={{ borderTop:'3px solid #ef4444' }}>
          <div className="stat-label">ضایعات</div>
          <div className="stat-value" style={{ color:'#ef4444' }}>
            {loading ? '...' : (s.totalWaste || 0).toLocaleString('fa-IR')}
          </div>
          {summary?.lowStockCount > 0 && (
            <div style={{ color:'#f87171', fontSize:12, marginTop:4 }}>
              ⚠️ {summary.lowStockCount} سفارش موجودی کم
            </div>
          )}
        </div>
      </div>

      {/* تب‌ها */}
      <div style={{ display:'flex', gap:8, marginBottom:20 }}>
        {[
          { key:'overview',    label:'📊 نمودار' },
          { key:'stock',       label:'📋 موجودی سفارشات' },
          { key:'accessories', label:'🔩 ملزومات' },
          { key:'movement',    label:'🔄 گردش انبار' },
        ].map(tab => (
          <button key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={activeTab === tab.key ? 'btn btn-primary' : 'btn btn-ghost'}
            style={{ fontSize:13, padding:'6px 14px' }}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* محتوای تب */}
      {activeTab === 'overview' && (
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">توزیع موجودی مراحل</h3>
          </div>
          {loading ? (
            <div className="loading-spinner"><div className="spinner"/><p>در حال بارگذاری...</p></div>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={chartData} margin={{ top:5, right:10, left:-10, bottom:0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,.05)" />
                <XAxis dataKey="name" tick={{ fill:'#64748b', fontSize:12 }} />
                <YAxis tick={{ fill:'#64748b', fontSize:11 }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ color:'#94a3b8', fontSize:12 }} />
                <Bar dataKey="ورودی" fill="#f59e0b" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      )}

      {activeTab === 'stock' && (
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">موجودی بر اساس سفارش</h3>
          </div>

          {/* فیلتر */}
          <div style={{ display:'flex', gap:12, alignItems:'center', marginBottom:16 }}>
            <input className="form-input" style={{ flex:1 }} placeholder="جستجوی کد یا نام..."
              value={search} onChange={e => setSearch(e.target.value)} />
            <label style={{ display:'flex', gap:6, alignItems:'center', color:'#94a3b8', cursor:'pointer', fontSize:13 }}>
              <input type="checkbox" checked={showLowOnly} onChange={e => setShowLowOnly(e.target.checked)} />
              فقط کم‌موجودی
            </label>
          </div>

          {loading ? (
            <div className="loading-spinner"><div className="spinner"/><p>در حال بارگذاری...</p></div>
          ) : stock.length === 0 ? (
            <div className="empty-state"><span>📦</span><p>داده‌ای یافت نشد</p></div>
          ) : (
            <div className="table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>کد</th><th>نام</th><th>پارچه</th><th>تولید</th>
                    <th>سنگشویی</th><th>بسته‌بندی</th><th>قابل فروش</th>
                    <th>ضایعات</th><th>استفاده</th>
                  </tr>
                </thead>
                <tbody>
                  {stock.map(item => (
                    <tr key={item.id}>
                      <td><span style={{ color:'#f59e0b', fontFamily:'monospace', fontSize:12 }}>{item.code}</span></td>
                      <td style={{ fontSize:13 }}>{item.name}</td>
                      <td>{(item.stockFabric     || 0).toLocaleString('fa-IR')}</td>
                      <td>{(item.stockProduction || 0).toLocaleString('fa-IR')}</td>
                      <td>{(item.stockWash       || 0).toLocaleString('fa-IR')}</td>
                      <td>{(item.stockPackaging  || 0).toLocaleString('fa-IR')}</td>
                      <td style={{ color:'#34d399' }}>{(item.saleableCount || 0).toLocaleString('fa-IR')}</td>
                      <td style={{ color:'#f87171' }}>{(item.waste || 0).toLocaleString('fa-IR')}</td>
                      <td>
                        <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                          <div style={{ width:60, height:5, background:'rgba(255,255,255,.1)', borderRadius:3 }}>
                            <div style={{
                              height:'100%', borderRadius:3, background:'#10b981',
                              width:`${item.usagePercent || 0}%`
                            }} />
                          </div>
                          <span style={{ color:'#64748b', fontSize:12 }}>{item.usagePercent || 0}٪</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === 'accessories' && (
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">موجودی ملزومات</h3>
            {summary?.lowStockCount > 0 && (
              <span style={{ background:'rgba(239,68,68,.15)', color:'#f87171',
                padding:'3px 10px', borderRadius:20, fontSize:12 }}>
                ⚠️ {summary.lowStockCount} کم‌موجودی
              </span>
            )}
          </div>
          {loading ? (
            <div className="loading-spinner"><div className="spinner"/><p>در حال بارگذاری...</p></div>
          ) : (
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(180px,1fr))', gap:16, padding:8 }}>
              {accessories.map(acc => (
                <div key={acc.id} style={{
                  background:'rgba(255,255,255,.03)', borderRadius:12,
                  padding:'16px', border:`1px solid ${acc.low ? 'rgba(239,68,68,.3)' : 'rgba(255,255,255,.06)'}`,
                }}>
                  <div style={{ display:'flex', justifyContent:'space-between', marginBottom:8 }}>
                    <span style={{ color:'#94a3b8', fontSize:13 }}>{acc.name}</span>
                    {acc.low && <span style={{ color:'#f87171', fontSize:11 }}>⚠️ کم</span>}
                  </div>
                  <div style={{ color: acc.low ? '#ef4444' : '#f1f5f9', fontSize:24, fontWeight:700 }}>
                    {(acc.quantity || 0).toLocaleString('fa-IR')}
                  </div>
                  <div style={{ color:'#64748b', fontSize:12, marginTop:4 }}>{acc.unit}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'movement' && (
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">تاریخچه گردش انبار</h3>
          </div>
          {loading ? (
            <div className="loading-spinner"><div className="spinner"/><p>در حال بارگذاری...</p></div>
          ) : movement.length === 0 ? (
            <div className="empty-state"><span>🔄</span><p>تاریخچه‌ای ثبت نشده</p></div>
          ) : (
            <div className="table-wrapper">
              <table className="data-table">
                <thead>
                  <tr><th>عملیات</th><th>سفارش</th><th>کاربر</th><th>تاریخ</th></tr>
                </thead>
                <tbody>
                  {movement.map(m => (
                    <tr key={m.id}>
                      <td>
                        <span style={{
                          background:'rgba(245,158,11,.15)', color:'#f59e0b',
                          padding:'2px 8px', borderRadius:6, fontSize:12
                        }}>{m.action}</span>
                      </td>
                      <td style={{ color:'#94a3b8', fontSize:13 }}>
                        {m.order ? `${m.order.code} — ${m.order.name}` : '—'}
                      </td>
                      <td style={{ fontSize:13 }}>{m.user?.displayName || '—'}</td>
                      <td style={{ color:'#64748b', fontSize:12 }}>
                        {new Date(m.createdAt).toLocaleString('fa-IR')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

    </div>
  );
}
