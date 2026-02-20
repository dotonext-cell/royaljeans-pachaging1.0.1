import { useState } from 'react';
import { Eye, EyeOff, LogIn } from 'lucide-react';
import useAuthStore from '../../store/authStore';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [email, setEmail]             = useState('');
  const [password, setPassword]       = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [toast, setToast]             = useState(null);
  const { login, isLoading, error }   = useAuthStore();
  const navigate                       = useNavigate();

  const showToast = (msg, type = 'error') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      showToast('لطفاً ایمیل و رمز عبور را وارد کنید');
      return;
    }
    try {
      await login(email, password);
      showToast('ورود موفقیت‌آمیز! در حال انتقال...', 'success');
      setTimeout(() => navigate('/'), 800);
    } catch {
      showToast(error || 'ایمیل یا رمز عبور اشتباه است');
    }
  };

  return (
    <div className="login-page">
      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', top: 24, left: '50%', transform: 'translateX(-50%)',
          zIndex: 999, padding: '12px 24px', borderRadius: 12,
          background: toast.type === 'success' ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)',
          border: `1px solid ${toast.type === 'success' ? '#10b981' : '#ef4444'}`,
          color: toast.type === 'success' ? '#34d399' : '#f87171',
          fontSize: 13, fontFamily: 'var(--font)',
          boxShadow: 'var(--shadow-lg)',
          animation: 'fadeInUp 0.3s ease both',
        }}>
          {toast.msg}
        </div>
      )}

      <div className="login-card" style={{ animation: 'fadeInUp 0.5s ease both' }}>
        {/* Logo */}
        <div className="login-logo">
          <div className="login-logo-icon">RJ</div>
          <div className="login-title">Royal Jeans</div>
          <div className="login-sub">سیستم مدیریت تولید — نسخه ۱.۰.۱</div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">ایمیل</label>
            <input
              type="email"
              className="form-input form-input-ltr"
              placeholder="example@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
          </div>

          <div className="form-group">
            <label className="form-label">رمز عبور</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                className="form-input form-input-ltr"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ paddingLeft: 44 }}
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: 'var(--text-muted)', display: 'flex', alignItems: 'center',
                }}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary w-full"
            style={{ justifyContent: 'center', padding: '12px 24px', fontSize: 14, marginTop: 8 }}
            disabled={isLoading}
          >
            {isLoading ? (
              <span>در حال ورود...</span>
            ) : (
              <>
                <LogIn size={16} />
                ورود به سیستم
              </>
            )}
          </button>
        </form>

        {/* Footer */}
        <div style={{ marginTop: 24, textAlign: 'center', fontSize: 11, color: 'var(--text-muted)' }}>
          Royal Jeans Management System v1.0.1
        </div>
      </div>
    </div>
  );
};

export default Login;
