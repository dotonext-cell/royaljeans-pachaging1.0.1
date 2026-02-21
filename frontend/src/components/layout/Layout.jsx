import { useState, useRef, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, ShoppingBag, Package, Users, Truck,
  BarChart2, Settings, Bell, Search, LogOut, Moon,
  Menu, X, Activity, Wallet, Box, AlertCircle,
  CheckCircle, Clock, TrendingUp, ChevronRight,
} from 'lucide-react';
import useAuthStore from '../../store/authStore';

// ─── NAV CONFIG ───
const navItems = [
  { icon: LayoutDashboard, label: 'داشبورد',    path: '/',            badge: null },
  { icon: ShoppingBag,     label: 'سفارشات',    path: '/orders',      badge: '۳'  },
  { icon: Package,         label: 'محصولات',     path: '/products',    badge: null },
  { icon: Activity,        label: 'گردش کار',   path: '/workflow',    badge: null },
  { icon: Box,             label: 'انبارداری',   path: '/inventory',   badge: '!'  },
  { icon: Truck,           label: 'پیمانکاران',  path: '/contractors', badge: null },
  { icon: Wallet,          label: 'مالی',        path: '/finance',     badge: null },
  { icon: BarChart2,       label: 'گزارشات',    path: '/reports',     badge: null },
];

const PAGE_META = {
  '/':            { title: 'داشبورد',     sub: 'خوش آمدید 👋' },
  '/orders':      { title: 'سفارشات',     sub: 'مدیریت و پیگیری سفارشات' },
  '/products':    { title: 'محصولات',      sub: 'کاتالوگ و مدیریت محصولات' },
  '/workflow':    { title: 'گردش کار',    sub: 'رهگیری مراحل تولید' },
  '/inventory':   { title: 'انبارداری',    sub: 'مدیریت موجودی و انبار' },
  '/contractors': { title: 'پیمانکاران',   sub: 'مدیریت و ارزیابی پیمانکاران' },
  '/finance':     { title: 'مالی',         sub: 'مدیریت پرداخت‌ها' },
  '/reports':     { title: 'گزارشات',     sub: 'گزارشات جامع سیستم' },
  '/profile':     { title: 'پروفایل',     sub: 'اطلاعات کاربری' },
  '/admin':       { title: 'مدیریت',      sub: 'پنل مدیریت سیستم' },
  '/admin/users': { title: 'کاربران',     sub: 'مدیریت کاربران سیستم' },
};

const notifications = [
  { icon: AlertCircle, color: '#ef4444', bg: 'rgba(239,68,68,0.15)',   msg: 'موجودی نخ دوخت زیر حد مجاز رسیده',  time: '۵ دقیقه پیش' },
  { icon: CheckCircle, color: '#10b981', bg: 'rgba(16,185,129,0.15)',  msg: 'سفارش RJ-1021 تحویل داده شد',        time: '۳۰ دقیقه پیش' },
  { icon: Clock,       color: '#f59e0b', bg: 'rgba(245,158,11,0.15)',  msg: 'سفارش RJ-1024 تاریخ تحویل امروز است', time: '۱ ساعت پیش' },
  { icon: TrendingUp,  color: '#3b82f6', bg: 'rgba(59,130,246,0.15)',  msg: 'گزارش ماهانه شهریور آماده شد',        time: '۲ ساعت پیش' },
];

// ─── ROLE DISPLAY ───
const roleLabel = (role) => {
  const map = { ADMIN: 'مدیر سیستم', MANAGER: 'مدیر تولید', USER: 'کاربر', PRODUCTION: 'مسئول تولید', WAREHOUSE: 'انباردار', SALES: 'کارشناس فروش', ACCOUNTANT: 'حسابدار' };
  return map[role] || role || 'کاربر';
};

const userInitial = (user) => {
  if (user?.firstName) return user.firstName[0];
  if (user?.displayName) return user.displayName[0];
  if (user?.email) return user.email[0].toUpperCase();
  return 'ک';
};

// ─── LAYOUT COMPONENT ───
const Layout = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [showNotif, setShowNotif] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const notifRef = useRef(null);

  // Close notif on outside click
  useEffect(() => {
    const handler = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotif(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  // Find current page meta
  const currentMeta = (() => {
    // exact match first
    if (PAGE_META[location.pathname]) return PAGE_META[location.pathname];
    // prefix match
    for (const [key, val] of Object.entries(PAGE_META)) {
      if (key !== '/' && location.pathname.startsWith(key)) return val;
    }
    return { title: 'صفحه', sub: '' };
  })();

  return (
    <>
      {/* ─── SIDEBAR ─── */}
      <nav className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-logo">
          <div className="logo-icon">RJ</div>
          <div className="logo-text">
            <div className="logo-title">Royal Jeans</div>
            <div className="logo-sub">v1.0.1 — سیستم مدیریت</div>
          </div>
        </div>

        <div className="sidebar-section" style={{ flex: 1, overflowY: 'auto' }}>
          <span className="sidebar-label">منو اصلی</span>
          {navItems.map((n) => (
            <div
              key={n.path}
              className={`nav-item ${isActive(n.path) ? 'active' : ''}`}
              onClick={() => { navigate(n.path); setSidebarOpen(false); }}
            >
              <n.icon className="nav-icon" />
              {n.label}
              {n.badge && <span className="nav-badge">{n.badge}</span>}
            </div>
          ))}

          <div className="divider" />
          <span className="sidebar-label">مدیریت</span>
          <div
            className={`nav-item ${isActive('/admin') ? 'active' : ''}`}
            onClick={() => { navigate('/admin'); setSidebarOpen(false); }}
          >
            <Settings className="nav-icon" /> تنظیمات سیستم
          </div>
          {user?.role === 'ADMIN' && (
            <div
              className={`nav-item ${isActive('/admin/users') ? 'active' : ''}`}
              onClick={() => { navigate('/admin/users'); setSidebarOpen(false); }}
            >
              <Users className="nav-icon" /> مدیریت کاربران
            </div>
          )}
        </div>

        <div className="sidebar-footer">
          <div className="user-card" onClick={() => { navigate('/profile'); setSidebarOpen(false); }}>
            <div className="user-avatar">{userInitial(user)}</div>
            <div className="user-info">
              <div className="user-name">{user?.displayName || user?.firstName || user?.email || 'کاربر'}</div>
              <div className="user-role">{roleLabel(user?.role)}</div>
            </div>
            <LogOut size={14} style={{ color: 'var(--text-muted)', marginRight: 'auto' }} onClick={(e) => { e.stopPropagation(); handleLogout(); }} />
          </div>
        </div>
      </nav>

      {/* ─── MAIN ─── */}
      <div className="main-wrap">
        {/* HEADER */}
        <header className="header">
          <button
            className="icon-btn"
            style={{ display: 'none' }}
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? <X size={16} /> : <Menu size={16} />}
          </button>

          <div>
            <div className="page-title">{currentMeta.title}</div>
            <div className="page-subtitle">{currentMeta.sub}</div>
          </div>

          <div className="search-wrap">
            <Search className="search-icon" />
            <input className="search-input" placeholder="جستجو در سیستم..." />
          </div>

          <div className="header-actions">
            {/* Notifications */}
            <div style={{ position: 'relative' }} ref={notifRef}>
              <div className="icon-btn" onClick={() => setShowNotif(!showNotif)}>
                <Bell size={16} />
                <div className="notif-dot" />
              </div>
              {showNotif && (
                <div className="notif-panel">
                  <div className="notif-head">
                    <span className="notif-title">اعلان‌ها</span>
                    <span className="badge badge-red">۴</span>
                  </div>
                  {notifications.map((n, i) => (
                    <div key={i} className="notif-item">
                      <div className="notif-item-icon" style={{ background: n.bg }}>
                        <n.icon size={16} color={n.color} />
                      </div>
                      <div className="notif-text">
                        <div className="notif-msg">{n.msg}</div>
                        <div className="notif-time">{n.time}</div>
                      </div>
                    </div>
                  ))}
                  <div style={{ padding: '10px 16px', borderTop: '1px solid var(--border)' }}>
                    <button className="btn btn-ghost btn-sm w-full" style={{ width: '100%', justifyContent: 'center' }}>
                      مشاهده همه اعلان‌ها <ChevronRight size={12} />
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="icon-btn"><Moon size={15} /></div>

            {/* User Avatar */}
            <div
              className="user-avatar"
              style={{ width: 36, height: 36, cursor: 'pointer', borderRadius: 10, flexShrink: 0 }}
              onClick={() => navigate('/profile')}
            >
              {userInitial(user)}
            </div>
          </div>
        </header>

        {/* PAGE CONTENT */}
        <main className="page-content">
          <Outlet />
        </main>
      </div>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 99 }}
        />
      )}
    </>
  );
};

export default Layout;
