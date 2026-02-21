import React, { useEffect, useState } from 'react';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';

const TYPE_STYLES = {
  success: { bg: 'rgba(16,185,129,.15)', border: 'rgba(16,185,129,.3)', icon: CheckCircle, color: '#34d399' },
  error:   { bg: 'rgba(239,68,68,.15)',  border: 'rgba(239,68,68,.3)',  icon: XCircle,    color: '#f87171' },
  warning: { bg: 'rgba(245,158,11,.15)', border: 'rgba(245,158,11,.3)', icon: AlertTriangle, color: '#fbbf24' },
  info:    { bg: 'rgba(59,130,246,.15)', border: 'rgba(59,130,246,.3)', icon: Info,       color: '#60a5fa' },
};

const Notification = ({
  type = 'info',
  title,
  message,
  isClosable = true,
  onClose,
  autoClose = true,
  autoCloseDuration = 5000,
  persistent = false,
}) => {
  const [visible, setVisible] = useState(true);
  const styles = TYPE_STYLES[type] || TYPE_STYLES.info;
  const IconComponent = styles.icon;

  useEffect(() => {
    if (autoClose && !persistent) {
      const timer = setTimeout(() => {
        setVisible(false);
        onClose?.();
      }, autoCloseDuration);
      return () => clearTimeout(timer);
    }
  }, [autoClose, autoCloseDuration, persistent, onClose]);

  if (!visible) return null;

  return (
    <div style={{
      background: styles.bg,
      border: `1px solid ${styles.border}`,
      borderRadius: 12,
      padding: '12px 16px',
      display: 'flex',
      alignItems: 'flex-start',
      gap: 12,
      position: 'relative',
      overflow: 'hidden',
      marginBottom: 8,
    }}>
      <IconComponent size={18} color={styles.color} style={{ flexShrink: 0, marginTop: 2 }} />
      <div style={{ flex: 1 }}>
        {title && (
          <div style={{ fontWeight: 600, color: styles.color, fontSize: 13, marginBottom: message ? 2 : 0 }}>
            {title}
          </div>
        )}
        {message && (
          <div style={{ color: '#94a3b8', fontSize: 13 }}>{message}</div>
        )}
      </div>
      {isClosable && (
        <button
          onClick={() => { setVisible(false); onClose?.(); }}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: '#64748b', padding: 2, flexShrink: 0,
          }}
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
};

// ─── Container برای نمایش اعلان‌های متعدد ────────────────────
export const NotificationContainer = ({ notifications, onRemove }) => (
  <div style={{
    position: 'fixed', top: 16, left: 16, zIndex: 9999, maxWidth: 400, width: '100%',
  }}>
    {notifications.map(n => (
      <Notification
        key={n.id}
        {...n}
        onClose={() => onRemove(n.id)}
      />
    ))}
  </div>
);

// ─── توابع کمکی ──────────────────────────────────────────────
export const showNotification = (manager, { type = 'info', title, message, autoClose = true, duration = 5000 }) => {
  const id = Date.now();
  manager.add?.({ id, type, title, message, autoClose, autoCloseDuration: duration });
  return id;
};

export const showSuccess = (manager, message, title = 'موفق') =>
  showNotification(manager, { type: 'success', title, message });

export const showError = (manager, message, title = 'خطا') =>
  showNotification(manager, { type: 'error', title, message, autoClose: false });

export const showWarning = (manager, message, title = 'هشدار') =>
  showNotification(manager, { type: 'warning', title, message });

export const showInfo = (manager, message, title = 'اطلاعات') =>
  showNotification(manager, { type: 'info', title, message });

export default Notification;
