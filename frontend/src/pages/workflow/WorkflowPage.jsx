import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { workflowService } from '../../services/workflow.service';
import api from '../../services/api';

// ─── نگاشت مرحله‌ها ─────────────────────────────────────────
const STAGE_CONFIG = {
  fabric:     { label: 'پارچه',       icon: '🧵', color: '#f59e0b' },
  production: { label: 'دوخت / تولید',icon: '🪡', color: '#3b82f6' },
  wash:       { label: 'سنگ‌شویی',    icon: '💧', color: '#8b5cf6' },
  packaging:  { label: 'بسته‌بندی',   icon: '📦', color: '#10b981' },
};

const STATUS_LABELS = {
  done:    { label: 'تکمیل',       color: '#34d399', icon: '✅' },
  active:  { label: 'در جریان',    color: '#fbbf24', icon: '⚙️' },
  pending: { label: 'در انتظار',   color: '#475569', icon: '⏳' },
};

export default function WorkflowPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [workflow, setWorkflow]       = useState(null);
  const [orders, setOrders]           = useState([]);
  const [selectedOrderId, setSelectedOrderId] = useState(id || '');
  const [loading, setLoading]         = useState(false);
  const [listLoading, setListLoading] = useState(true);
  const [error, setError]             = useState(null);
  const [saving, setSaving]           = useState(false);
  const [editForm, setEditForm]       = useState({});
  const [showEditModal, setShowEditModal] = useState(false);

  // بارگذاری لیست سفارشات
  useEffect(() => {
    (async () => {
      try {
        const res = await workflowService.getList();
        setOrders(res.orders || []);
      } catch (err) {
        console.error('Workflow list error:', err);
      } finally {
        setListLoading(false);
      }
    })();
  }, []);

  // بارگذاری گردش کار سفارش انتخاب شده
  const loadWorkflow = useCallback(async (orderId) => {
    if (!orderId) return;
    try {
      setLoading(true);
      setError(null);
      const data = await workflowService.getByOrder(orderId);
      setWorkflow(data);
      setEditForm({
        stockFabric:      data.order.stockFabric     || 0,
        stockProduction:  data.order.stockProduction || 0,
        stockWash:        data.order.stockWash       || 0,
        stockPackaging:   data.order.stockPackaging  || 0,
        saleableCount:    data.order.saleableCount   || 0,
        waste:            data.order.waste           || 0,
      });
    } catch (err) {
      console.error('Workflow load error:', err);
      setError('خطا در دریافت گردش کار');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (selectedOrderId) loadWorkflow(selectedOrderId);
  }, [selectedOrderId, loadWorkflow]);

  const handleOrderSelect = (orderId) => {
    setSelectedOrderId(orderId);
    navigate(`/workflow/${orderId}`, { replace: true });
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await workflowService.update(selectedOrderId, editForm);
      await loadWorkflow(selectedOrderId);
      setShowEditModal(false);
      alert('گردش کار با موفقیت ذخیره شد');
    } catch (err) {
      alert('خطا در ذخیره‌سازی');
    } finally {
      setSaving(false);
    }
  };

  // اگه هیچ سفارشی انتخاب نشده
  if (!selectedOrderId) {
    return (
      <div className="page-container">
        <div className="page-header">
          <div>
            <h1 className="page-title">گردش کار تولید</h1>
            <p className="page-subtitle">رهگیری مراحل تولید سفارشات</p>
          </div>
        </div>

        {listLoading ? (
          <div className="loading-spinner"><div className="spinner" /><p>در حال بارگذاری...</p></div>
        ) : (
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">انتخاب سفارش</h3>
            </div>
            {orders.length === 0 ? (
              <div className="empty-state">
                <span>📋</span>
                <p>هیچ سفارشی وجود ندارد</p>
              </div>
            ) : (
              <div className="table-wrapper">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>کد</th><th>نام</th><th>وضعیت</th><th>مرحله فعلی</th><th>پیشرفت</th><th>عملیات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map(o => (
                      <tr key={o.id}>
                        <td><span style={{ color:'#f59e0b', fontFamily:'monospace' }}>{o.code}</span></td>
                        <td>{o.name}</td>
                        <td>
                          <span style={{ color:'#94a3b8', fontSize:12 }}>{o.status}</span>
                        </td>
                        <td>
                          {STAGE_CONFIG[o.currentStage] ? (
                            <span style={{ color: STAGE_CONFIG[o.currentStage].color }}>
                              {STAGE_CONFIG[o.currentStage].icon} {STAGE_CONFIG[o.currentStage].label}
                            </span>
                          ) : '—'}
                        </td>
                        <td>
                          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                            <div style={{ flex:1, height:6, background:'rgba(255,255,255,.1)', borderRadius:3, overflow:'hidden' }}>
                              <div style={{
                                height:'100%', borderRadius:3, background:'#f59e0b',
                                width: `${o.progressPercent || 0}%`, transition:'width .3s'
                              }} />
                            </div>
                            <span style={{ color:'#94a3b8', fontSize:12, minWidth:32 }}>{o.progressPercent || 0}٪</span>
                          </div>
                        </td>
                        <td>
                          <button className="btn btn-primary" style={{ padding:'4px 14px', fontSize:13 }}
                            onClick={() => handleOrderSelect(o.id)}>
                            مشاهده
                          </button>
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

  // نمایش گردش کار سفارش انتخاب شده
  return (
    <div className="page-container">

      {/* هدر */}
      <div className="page-header">
        <div>
          <h1 className="page-title">
            گردش کار
            {workflow?.order && (
              <span style={{ color:'#f59e0b', marginRight:10, fontSize:20 }}>
                — {workflow.order.code}
              </span>
            )}
          </h1>
          <p className="page-subtitle">{workflow?.order?.name || 'در حال بارگذاری...'}</p>
        </div>
        <div style={{ display:'flex', gap:10 }}>
          <button className="btn btn-ghost" onClick={() => {
            setSelectedOrderId(''); navigate('/workflow');
          }}>← برگشت</button>
          {workflow && (
            <button className="btn btn-primary" onClick={() => setShowEditModal(true)}>
              ✏️ بروزرسانی مراحل
            </button>
          )}
        </div>
      </div>

      {error && (
        <div style={{ background:'rgba(239,68,68,.15)', border:'1px solid #ef4444',
          borderRadius:12, padding:'12px 18px', marginBottom:20, color:'#f87171' }}>
          ⚠️ {error}
        </div>
      )}

      {loading ? (
        <div className="loading-spinner"><div className="spinner" /><p>در حال بارگذاری گردش کار...</p></div>
      ) : workflow ? (
        <>
          {/* خلاصه سفارش */}
          <div className="card" style={{ marginBottom:20 }}>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(150px,1fr))', gap:16 }}>
              {[
                { label:'کل سفارش',     value: workflow.order.totalCount,  color:'#f59e0b' },
                { label:'پارچه',        value: workflow.order.stockFabric,  color:'#3b82f6' },
                { label:'تولید',        value: workflow.order.stockProduction, color:'#8b5cf6' },
                { label:'سنگشویی',      value: workflow.order.stockWash,    color:'#06b6d4' },
                { label:'بسته‌بندی',   value: workflow.order.stockPackaging, color:'#10b981' },
                { label:'قابل فروش',   value: workflow.order.saleableCount, color:'#34d399' },
                { label:'ضایعات',       value: workflow.order.waste,        color:'#ef4444' },
              ].map((item,i) => (
                <div key={i} style={{
                  background:'rgba(255,255,255,.03)', borderRadius:10,
                  padding:'12px 16px', borderRight:`3px solid ${item.color}`,
                }}>
                  <div style={{ color:'#94a3b8', fontSize:12, marginBottom:4 }}>{item.label}</div>
                  <div style={{ color: item.color, fontSize:22, fontWeight:700 }}>
                    {(item.value || 0).toLocaleString('fa-IR')}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* نوار پیشرفت */}
          <div className="card" style={{ marginBottom:20 }}>
            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:8 }}>
              <span style={{ color:'#94a3b8' }}>پیشرفت کلی</span>
              <span style={{ color:'#f59e0b', fontWeight:700 }}>{workflow.progressPercent}٪</span>
            </div>
            <div style={{ height:10, background:'rgba(255,255,255,.08)', borderRadius:5, overflow:'hidden' }}>
              <div style={{
                height:'100%', background:'linear-gradient(90deg,#f59e0b,#fbbf24)',
                borderRadius:5, width:`${workflow.progressPercent}%`, transition:'width .5s'
              }} />
            </div>
          </div>

          {/* مراحل workflow */}
          <div className="card" style={{ marginBottom:20 }}>
            <div className="card-header">
              <h3 className="card-title">مراحل تولید</h3>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))', gap:16, padding:8 }}>
              {(workflow.stages || []).map((stage, i) => {
                const cfg = STAGE_CONFIG[stage.slug] || { label: stage.name, icon: '⚙️', color: '#94a3b8' };
                const st  = STATUS_LABELS[stage.status] || STATUS_LABELS.pending;
                return (
                  <div key={i} style={{
                    background:'rgba(255,255,255,.03)', borderRadius:12,
                    padding:'16px', border:`1px solid ${cfg.color}33`,
                    position:'relative', overflow:'hidden'
                  }}>
                    <div style={{ fontSize:28, marginBottom:8 }}>{cfg.icon}</div>
                    <div style={{ color: cfg.color, fontWeight:700, marginBottom:4 }}>{cfg.label}</div>
                    <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:8 }}>
                      <span>{st.icon}</span>
                      <span style={{ color: st.color, fontSize:13 }}>{st.label}</span>
                    </div>
                    {stage.contractor && (
                      <div style={{ color:'#94a3b8', fontSize:12 }}>🤝 {stage.contractor}</div>
                    )}
                    <div style={{ display:'flex', justifyContent:'space-between', marginTop:8, fontSize:12, color:'#64748b' }}>
                      <span>ورودی: {(stage.quantityIn || 0).toLocaleString('fa-IR')}</span>
                      <span>خروجی: {(stage.quantityOut || 0).toLocaleString('fa-IR')}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* تاریخچه */}
          {workflow.history?.length > 0 && (
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">تاریخچه تغییرات</h3>
              </div>
              <div style={{ display:'flex', flexDirection:'column', gap:10, padding:8 }}>
                {workflow.history.map((h, i) => (
                  <div key={i} style={{
                    display:'flex', gap:12, alignItems:'flex-start',
                    padding:'10px 14px', background:'rgba(255,255,255,.03)',
                    borderRadius:10, borderRight:'3px solid #334155'
                  }}>
                    <div style={{
                      width:34, height:34, borderRadius:'50%',
                      background:'rgba(245,158,11,.15)', color:'#f59e0b',
                      display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, fontSize:16
                    }}>
                      {h.action === 'CREATE' ? '➕' : h.action === 'DELETE' ? '🗑️' : '✏️'}
                    </div>
                    <div>
                      <div style={{ fontSize:13, fontWeight:500 }}>
                        {h.action} — {h.user?.displayName || 'ناشناس'}
                      </div>
                      <div style={{ color:'#64748b', fontSize:12, marginTop:2 }}>
                        {new Date(h.createdAt).toLocaleString('fa-IR')}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      ) : null}

      {/* Modal بروزرسانی */}
      {showEditModal && (
        <div style={{
          position:'fixed', inset:0, background:'rgba(0,0,0,.7)',
          display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000
        }}>
          <div style={{
            background:'#111827', border:'1px solid #1e293b',
            borderRadius:16, padding:28, width:'90%', maxWidth:500, direction:'rtl'
          }}>
            <h3 style={{ color:'#f1f5f9', marginBottom:20, fontSize:18 }}>بروزرسانی موجودی مراحل</h3>

            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14, marginBottom:20 }}>
              {[
                { key:'stockFabric',     label:'موجودی پارچه' },
                { key:'stockProduction', label:'موجودی تولید' },
                { key:'stockWash',       label:'موجودی سنگشویی' },
                { key:'stockPackaging',  label:'موجودی بسته‌بندی' },
                { key:'saleableCount',   label:'قابل فروش' },
                { key:'waste',           label:'ضایعات' },
              ].map(field => (
                <div key={field.key} className="form-group" style={{ margin:0 }}>
                  <label className="form-label">{field.label}</label>
                  <input className="form-input" type="number" min="0"
                    value={editForm[field.key] || ''}
                    onChange={e => setEditForm(f => ({ ...f, [field.key]: parseInt(e.target.value) || 0 }))}
                  />
                </div>
              ))}
            </div>

            <div style={{ display:'flex', justifyContent:'flex-end', gap:10 }}>
              <button className="btn btn-ghost" onClick={() => setShowEditModal(false)}>انصراف</button>
              <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                {saving ? 'در حال ذخیره...' : 'ذخیره تغییرات'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
