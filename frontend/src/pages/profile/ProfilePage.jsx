import { useState, useRef } from 'react';
import {
  Camera,
  Mail,
  Phone,
  Calendar,
  Save,
  Lock,
  User,
  Edit3,
  Shield,
  X,
} from 'lucide-react';
import useAuthStore from '../../store/authStore';
import userService from '../../services/user.service';
import { formatJalali } from '../../utils/jalali';

const ProfilePage = () => {
  const { user, updateUser } = useAuthStore();
  const fileInputRef = useRef(null);

  const [isLoading, setIsLoading] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [message, setMessage] = useState({ type: '', text: '' });

  // Form states
  const [profileData, setProfileData] = useState({
    nickname: user?.nickname || '',
    phone: user?.phone || '',
    bio: user?.bio || '',
    avatar: user?.avatar || '',
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const showMessage = (type, text, duration = 3000) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), duration);
  };

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const avatarUrl = reader.result;
        setProfileData((prev) => ({ ...prev, avatar: avatarUrl }));
        handleProfileUpdate({ avatar: avatarUrl });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProfileUpdate = async (data) => {
    setIsLoading(true);
    try {
      const response = await userService.updateProfile(user.id, data);
      updateUser(response.user);
      showMessage('success', 'پروفایل با موفقیت به‌روزرسانی شد');
    } catch (error) {
      showMessage('error', error.response?.data?.message || 'خطا در به‌روزرسانی پروفایل');
    } finally {
      setIsLoading(false);
    }
  };

  const handleProfileSubmit = (e) => {
    e.preventDefault();
    handleProfileUpdate(profileData);
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showMessage('error', 'رمزهای عبور جدید مطابقت ندارند');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      showMessage('error', 'رمز عبور جدید باید حداقل 6 کاراکتر باشد');
      return;
    }

    setIsChangingPassword(true);
    try {
      await userService.changePassword(
        user.id,
        passwordData.currentPassword,
        passwordData.newPassword
      );
      showMessage('success', 'رمز عبور با موفقیت تغییر کرد');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (error) {
      showMessage('error', error.response?.data?.message || 'خطا در تغییر رمز عبور');
    } finally {
      setIsChangingPassword(false);
    }
  };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'ADMIN': return 'badge-red';
      case 'MANAGER': return 'badge-purple';
      default: return 'badge-blue';
    }
  };

  const getRoleLabel = (role) => {
    switch (role) {
      case 'ADMIN': return 'مدیر سیستم';
      case 'MANAGER': return 'مدیر محصول';
      default: return 'کاربر';
    }
  };

  return (
    <div className="page-container">
      {/* Header */}
      <div className="mb-6">
        <h1 className="page-title">پروفایل کاربری</h1>
        <p className="page-subtitle mt-0.5">اطلاعات شخصی خود را مدیریت کنید</p>
      </div>

      {/* Message */}
      {message.text && (
        <div
          className={`mb-6 p-4 rounded-xl border ${message.type === 'success'
            ? 'bg-green-500/15 border-green-500/30 text-green-400'
            : 'bg-red-500/15 border-red-500/30 text-red-400'
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-6">
        {/* Right Sidebar - User Info */}
        <div className="glass-card">
          <div className="p-6">
            <div className="flex flex-col items-center gap-4">
              {/* Avatar */}
              <div className="relative">
                <div
                  className="w-24 h-24 rounded-full bg-gradient-to-br from-accent-blue to-accent-purple flex items-center justify-center text-3xl font-bold text-white overflow-hidden border-4 border-bg-card"
                  style={{
                    backgroundImage: profileData.avatar ? `url(${profileData.avatar})` : undefined,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                  }}
                >
                  {!profileData.avatar && (user?.displayName || 'کاربر')[0]}
                </div>
                <button
                  onClick={handleAvatarClick}
                  className="absolute bottom-0 right-0 w-8 h-8 rounded-lg bg-accent-blue border-2 border-bg-card flex items-center justify-center text-white hover:bg-accent-purple transition-colors cursor-pointer"
                >
                  <Camera size={14} />
                </button>
              </div>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleAvatarChange}
                accept="image/*"
                className="hidden"
              />

              {/* User Info */}
              <div className="flex flex-col items-center gap-1">
                <div className="text-lg font-bold text-text-primary">
                  {user?.displayName || 'کاربر'}
                </div>
                <div className="text-sm text-text-muted">
                  @{profileData.nickname || 'نام مستعار'}
                </div>
                <span className={`badge ${getRoleBadgeColor(user?.role)}`}>
                  {getRoleLabel(user?.role)}
                </span>
              </div>

              <div className="w-full h-px bg-border-base my-2"></div>

              {/* Info Items */}
              <div className="w-full flex flex-col gap-3">
                <div className="flex items-center gap-3 text-sm text-text-secondary">
                  <Mail size={16} className="text-text-muted flex-shrink-0" />
                  <span className="truncate">{user?.email}</span>
                </div>
                {user?.phone && (
                  <div className="flex items-center gap-3 text-sm text-text-secondary">
                    <Phone size={16} className="text-text-muted flex-shrink-0" />
                    <span className="truncate">{user?.phone}</span>
                  </div>
                )}
                {user?.createdAt && (
                  <div className="flex items-center gap-3 text-sm text-text-secondary">
                    <Calendar size={16} className="text-text-muted flex-shrink-0" />
                    <span>عضو از {formatJalali(user.createdAt, 'long')}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Left Content - Forms */}
        <div>
          {/* Tabs */}
          <div className="tabs">
            <button
              className={`tab ${activeTab === 'profile' ? 'active' : ''}`}
              onClick={() => setActiveTab('profile')}
            >
              <Edit3 size={18} />
              <span className="mr-2">اطلاعات شخصی</span>
            </button>
            <button
              className={`tab ${activeTab === 'password' ? 'active' : ''}`}
              onClick={() => setActiveTab('password')}
            >
              <Lock size={18} />
              <span className="mr-2">تغییر رمز عبور</span>
            </button>
          </div>

          {/* Profile Info Tab */}
          {activeTab === 'profile' && (
            <div className="glass-card p-6">
              <form onSubmit={handleProfileSubmit}>
                <div className="flex flex-col gap-6">
                  {/* Names Section */}
                  <div>
                    <h3 className="text-sm font-bold mb-4 text-text-primary">نام‌ها</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="form-label">نام اصلی</label>
                        <div className="relative">
                          <User className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
                          <input
                            value={user?.displayName || ''}
                            readOnly
                            className="form-input pr-10 bg-white/5 cursor-not-allowed"
                          />
                        </div>
                        <p className="text-xs text-text-muted mt-2">
                          فقط مدیر سیستم می‌تواند این فیلد را تغییر دهد
                        </p>
                      </div>

                      <div>
                        <label className="form-label">نام مستعار</label>
                        <div className="relative">
                          <Edit3 className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
                          <input
                            name="nickname"
                            value={profileData.nickname}
                            onChange={handleProfileChange}
                            placeholder="نام مستعار خود را وارد کنید"
                            className="form-input pr-10"
                          />
                        </div>
                        <p className="text-xs text-text-muted mt-2">
                          این نام در سیستم نمایش داده می‌شود
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="h-px bg-border-base"></div>

                  {/* Contact Info Section */}
                  <div>
                    <h3 className="text-sm font-bold mb-4 text-text-primary">اطلاعات تماس</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="form-label">شماره تماس</label>
                        <div className="relative">
                          <Phone className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
                          <input
                            name="phone"
                            value={profileData.phone}
                            onChange={handleProfileChange}
                            placeholder="شماره تماس خود را وارد کنید"
                            className="form-input pr-10"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="form-label">ایمیل</label>
                        <div className="relative">
                          <Mail className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
                          <input
                            value={user?.email || ''}
                            readOnly
                            className="form-input pr-10 bg-white/5 cursor-not-allowed"
                          />
                        </div>
                        <p className="text-xs text-text-muted mt-2">
                          ایمیل قابل تغییر نیست
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="h-px bg-border-base"></div>

                  {/* Bio Section */}
                  <div>
                    <h3 className="text-sm font-bold mb-4 text-text-primary">درباره من</h3>
                    <textarea
                      name="bio"
                      value={profileData.bio}
                      onChange={handleProfileChange}
                      placeholder="توضیحاتی درباره خودتان بنویسید..."
                      rows={4}
                      className="form-input resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="btn btn-primary text-base"
                    disabled={isLoading}
                  >
                    <Save size={20} />
                    {isLoading ? 'در حال ذخیره...' : 'ذخیره تغییرات'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Password Change Tab */}
          {activeTab === 'password' && (
            <div className="glass-card p-6">
              <form onSubmit={handlePasswordChange}>
                <div className="flex flex-col gap-6">
                  <div>
                    <h3 className="text-sm font-bold mb-4 text-text-primary">تغییر رمز عبور</h3>
                    <p className="text-sm text-text-muted mb-4">
                      برای تغییر رمز عبور، رمز عبور فعلی و جدید خود را وارد کنید
                    </p>
                  </div>

                  <div>
                    <label className="form-label">رمز عبور فعلی</label>
                    <div className="relative">
                      <Lock className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
                      <input
                        type="password"
                        value={passwordData.currentPassword}
                        onChange={(e) =>
                          setPasswordData((prev) => ({
                            ...prev,
                            currentPassword: e.target.value,
                          }))
                        }
                        placeholder="رمز عبور فعلی را وارد کنید"
                        className="form-input pr-10"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="form-label">رمز عبور جدید</label>
                    <div className="relative">
                      <Lock className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
                      <input
                        type="password"
                        value={passwordData.newPassword}
                        onChange={(e) =>
                          setPasswordData((prev) => ({
                            ...prev,
                            newPassword: e.target.value,
                          }))
                        }
                        placeholder="رمز عبور جدید را وارد کنید"
                        className="form-input pr-10"
                      />
                    </div>
                    <p className="text-xs text-text-muted mt-2">
                      رمز عبور باید حداقل 6 کاراکتر باشد
                    </p>
                  </div>

                  <div>
                    <label className="form-label">تکرار رمز عبور جدید</label>
                    <div className="relative">
                      <Lock className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
                      <input
                        type="password"
                        value={passwordData.confirmPassword}
                        onChange={(e) =>
                          setPasswordData((prev) => ({
                            ...prev,
                            confirmPassword: e.target.value,
                          }))
                        }
                        placeholder="رمز عبور جدید را دوباره وارد کنید"
                        className="form-input pr-10"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="btn btn-primary text-base"
                    disabled={isChangingPassword}
                  >
                    <Lock size={20} />
                    {isChangingPassword ? 'در حال تغییر...' : 'تغییر رمز عبور'}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
