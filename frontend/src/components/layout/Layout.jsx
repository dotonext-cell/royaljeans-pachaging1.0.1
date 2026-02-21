import { useState, useEffect, useRef } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, ShoppingBag, Package, Users, Truck,
  BarChart2, Settings, Bell, Search, LogOut, Moon,
  Menu, X, Activity, Wallet, Box, AlertCircle,
  CheckCircle, Clock, TrendingUp, ChevronRight,
} from 'lucide-react';
import useAuthStore from '../../store/authStore';
import { notificationService } from '../../services/notification.service';
import { toPersianNumbers } from '../../utils/jalali';

// ─── NAV CONFIG ───
const navItems = [
  { icon: LayoutDashboard, label: 'داشبورد',    path: '/',            badge: null },
  { icon: ShoppingBag,     label: 'سفارشات',    path: '/orders',      badge: null },
  { icon: Package,         label: 'محصولات',     path: '/products',    badge: null },
  { icon: Activity,        label: 'گردش کار',   path: '/workflow',    badge: null },
  { icon: Box,             label: 'انبارداری',   path: '/inventory',   badge: null },
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

// ─── ROLE DISPLAY ───
const roleLabel = (role) => {
  const map = {
    ADMIN: 'مدیر سیستم',
    MANAGER: 'مدیر تولید',
    USER: 'کاربر',
    PRODUCTION: 'مسئول تولید',
    WAREHOUSE: 'انباردار',
    SALES: 'کارشناس فروش',
    ACCOUNTANT: 'حسابدار'
  };
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
  const [notifications, setNotifications] = useState([]);
  const [loadingNotif, setLoadingNotif] = useState(true);
  const notifRef = useRef(null);

  // Load notifications
  useEffect(() => {
    const loadNotifications = async () => {
      setLoadingNotif(true);
      try {
        const data = await notificationService.getAll();
        const formatted = (data.notifications || []).map(n =>
          notificationService.formatNotification(n)
        );
        setNotifications(formatted);
      } catch (error) {
        console.error('Error loading notifications:', error);
      } finally {
        setLoadingNotif(false);
      }
    };

    loadNotifications();
  }, []);

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
    if (PAGE_META[location.pathname]) return PAGE_META[location.pathname];
    for (const [key, val] of Object.entries(PAGE_META)) {
      if (key !== '/' && location.pathname.startsWith(key)) return val;
    }
    return { title: 'صفحه', sub: '' };
  })();

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <>
      {/* ─── SIDEBAR ─── */}
      <nav className={`fixed top-0 right-0 w-[260px] h-screen bg-bg-secondary border-l border-border-base flex flex-col z-100 transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] ${sidebarOpen ? 'translate-x-0' : 'translate-x-full'} md:translate-x-0`}>
        {/* Logo */}
        <div className="px-5 py-6 flex items-center gap-3 border-b border-border-base">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-gold to-accent-red flex items-center justify-center text-lg font-black text-white shadow-lg shadow-accent-gold/35">
            RJ
          </div>
          <div className="flex flex-col">
            <div className="text-[15px] font-extrabold text-text-primary">Royal Jeans</div>
            <div className="text-[11px] text-text-muted mt-0.5">v1.0.1 — سیستم مدیریت</div>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto px-3 py-2">
          <span className="text-[10px] font-bold tracking-wide text-text-muted uppercase block px-2 py-3 pb-1.5">
            منو اصلی
          </span>
          {navItems.map((n) => (
            <div
              key={n.path}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl cursor-pointer transition-all duration-250 text-[13.5px] font-medium mb-0.5 relative
                ${isActive(n.path)
                  ? 'bg-gradient-to-r from-accent-gold/15 to-accent-red/10 text-accent-gold'
                  : 'text-text-secondary hover:bg-bg-hover'
                }`}
              onClick={() => { navigate(n.path); setSidebarOpen(false); }}
            >
              <n.icon className="w-[18px] h-[18px] flex-shrink-0" />
              {n.label}
              {n.badge && (
                <span className="mr-auto bg-accent-gold text-black text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center">
                  {n.badge}
                </span>
              )}
              {isActive(n.path) && (
                <span className="absolute right-0 top-1/2 -translate-y-1/2 w-0.5 h-[60%] rounded-l bg-gradient-to-b from-accent-gold to-accent-red"></span>
              )}
            </div>
          ))}

          <div className="h-px bg-border-base my-2" />
          <span className="text-[10px] font-bold tracking-wide text-text-muted uppercase block px-2 py-3 pb-1.5">
            مدیریت
          </span>
          <div
            className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl cursor-pointer transition-all duration-250 text-[13.5px] font-medium mb-0.5 text-text-secondary hover:bg-bg-hover`}
            onClick={() => { navigate('/admin'); setSidebarOpen(false); }}
          >
            <Settings className="w-[18px] h-[18px]" />
            تنظیمات سیستم
          </div>
          {user?.role === 'ADMIN' && (
            <div
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl cursor-pointer transition-all duration-250 text-[13.5px] font-medium mb-0.5 ${isActive('/admin/users') ? 'bg-gradient-to-r from-accent-gold/15 to-accent-red/10 text-accent-gold' : 'text-text-secondary hover:bg-bg-hover'}`}
              onClick={() => { navigate('/admin/users'); setSidebarOpen(false); }}
            >
              <Users className="w-[18px] h-[18px]" />
              مدیریت کاربران
            </div>
          )}
        </div>

        {/* User Card */}
        <div className="mt-auto px-3 py-4 border-t border-border-base">
          <div
            className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl cursor-pointer transition-all duration-250 hover:bg-bg-hover"
            onClick={() => { navigate('/profile'); setSidebarOpen(false); }}
          >
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-accent-purple to-accent-blue flex items-center justify-center text-[13px] font-bold text-white flex-shrink-0">
              {userInitial(user)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[13px] font-semibold text-text-primary truncate">
                {user?.displayName || user?.firstName || user?.email || 'کاربر'}
              </div>
              <div className="text-[11px] text-text-muted">{roleLabel(user?.role)}</div>
            </div>
            <LogOut
              size={14}
              className="text-text-muted mr-auto"
              onClick={(e) => { e.stopPropagation(); handleLogout(); }}
            />
          </div>
        </div>
      </nav>

      {/* ─── MAIN ─── */}
      <div className="mr-0 md:mr-[260px] min-h-screen flex flex-col">
        {/* HEADER */}
        <header className="h-[70px] bg-bg-primary/80 backdrop-blur-xl border-b border-border-base flex items-center px-6 gap-4 sticky top-0 z-50">
          {/* Mobile menu toggle */}
          <button
            className="md:hidden w-9.5 h-9.5 rounded-xl bg-white/5 border border-border-base flex items-center justify-center cursor-pointer transition-all duration-250"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? <X size={16} /> : <Menu size={16} />}
          </button>

          {/* Page title */}
          <div>
            <div className="text-[18px] font-bold text-text-primary">{currentMeta.title}</div>
            <div className="text-[12px] text-text-muted mt-0.5">{currentMeta.sub}</div>
          </div>

          {/* Search */}
          <div className="mr-auto relative flex items-center">
            <Search className="absolute right-3 text-text-muted w-3.5" />
            <input
              className="bg-white/5 border border-border-base rounded-xl py-2 px-9 text-text-primary font-[13px] w-[220px] outline-none transition-all duration-250 placeholder:text-text-muted focus:border-accent-gold focus:bg-accent-gold/5 focus:w-[260px]"
              placeholder="جستجو در سیستم..."
            />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {/* Notifications */}
            <div className="relative" ref={notifRef}>
              <div
                className="w-9.5 h-9.5 rounded-xl bg-white/5 border border-border-base flex items-center justify-center cursor-pointer transition-all duration-250 hover:bg-white/10 relative"
                onClick={() => setShowNotif(!showNotif)}
              >
                <Bell size={16} />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-accent-red border-2 border-bg-primary" />
                )}
              </div>

              {showNotif && (
                <div className="absolute top-[calc(var(--header-h)+8px)] left-0 md:left-6 w-[320px] bg-bg-secondary border border-border-base rounded-2xl shadow-2xl z-200 overflow-hidden animate-fade-up" style={{ '--header-h': '70px' }}>
                  <div className="px-4 py-3.5 border-b border-border-base flex items-center justify-between">
                    <span className="text-[13px] font-bold">اعلان‌ها</span>
                    {unreadCount > 0 && (
                      <span className="badge badge-red">
                        {toPersianNumbers(unreadCount.toString())}
                      </span>
                    )}
                  </div>

                  <div className="max-h-[400px] overflow-y-auto">
                    {loadingNotif ? (
                      <div className="flex items-center justify-center py-8 text-text-muted text-sm">
                        در حال بارگذاری...
                      </div>
                    ) : notifications.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-8 gap-2 text-text-muted text-sm">
                        <span className="text-3xl opacity-50">🔔</span>
                        <p>اعلانی وجود ندارد</p>
                      </div>
                    ) : (
                      notifications.map((n) => (
                        <div
                          key={n.id}
                          className="flex gap-2.5 px-4 py-3 transition-colors duration-150 cursor-pointer hover:bg-bg-hover"
                          onClick={() => {
                            notificationService.markAsRead(n.id);
                            setNotifications(notifications.map(not =>
                              not.id === n.id ? { ...not, read: true } : not
                            ));
                          }}
                        >
                          <div
                            className="w-[34px] h-[34px] rounded-xl flex items-center justify-center flex-shrink-0"
                            style={{ background: n.iconBg }}
                          >
                            {n.icon === 'AlertCircle' && <AlertCircle size={16} color={n.iconColor} />}
                            {n.icon === 'CheckCircle' && <CheckCircle size={16} color={n.iconColor} />}
                            {n.icon === 'Clock' && <Clock size={16} color={n.iconColor} />}
                            {n.icon === 'TrendingUp' && <TrendingUp size={16} color={n.iconColor} />}
                          </div>
                          <div className="flex-1">
                            <div className="text-[12px] text-text-secondary leading-relaxed">{n.message}</div>
                            <div className="text-[10px] text-text-muted mt-0.5">{n.relativeTime}</div>
                          </div>
                          {!n.read && (
                            <span className="w-1.5 h-1.5 rounded-full bg-accent-gold"></span>
                          )}
                        </div>
                      ))
                    )}
                  </div>

                  <div className="px-4 py-2.5 border-t border-border-base">
                    <button
                      className="btn btn-ghost btn-sm w-full justify-center"
                      onClick={() => {
                        notificationService.markAllAsRead();
                        setNotifications(notifications.map(n => ({ ...n, read: true })));
                      }}
                    >
                      علامت‌گذاری همه به عنوان خوانده شده
                      <ChevronRight size={12} />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Dark mode toggle (placeholder) */}
            <div className="w-9.5 h-9.5 rounded-xl bg-white/5 border border-border-base flex items-center justify-center cursor-pointer transition-all duration-250 hover:bg-white/10">
              <Moon size={15} />
            </div>

            {/* User Avatar */}
            <div
              className="w-9 h-9 rounded-xl bg-gradient-to-br from-accent-purple to-accent-blue flex items-center justify-center text-[13px] font-bold text-white cursor-pointer flex-shrink-0"
              onClick={() => navigate('/profile')}
            >
              {userInitial(user)}
            </div>
          </div>
        </header>

        {/* PAGE CONTENT */}
        <main className="flex-1 px-6 py-7 overflow-y-auto">
          <Outlet />
        </main>
      </div>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-black/50 z-99 md:hidden"
        />
      )}
    </>
  );
};

export default Layout;
