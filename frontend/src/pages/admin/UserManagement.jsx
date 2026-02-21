import { useState, useEffect } from 'react';
import {
  Search,
  Plus,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  Shield,
  Users,
  Filter,
  Mail,
  Phone,
  Calendar,
  X,
  Save,
  ImagePlus,
  User,
} from 'lucide-react';
import userService from '../../services/user.service';
import { formatJalali } from '../../utils/jalali';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Form state for editing user
  const [editFormData, setEditFormData] = useState({
    displayName: '',
    nickname: '',
    phone: '',
    bio: '',
    avatar: '',
    role: 'USER',
    isActive: true,
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const data = await userService.getAll();
      setUsers(data.users || []);
    } catch (error) {
      showMessage('error', 'خطا در دریافت کاربران');
    } finally {
      setIsLoading(false);
    }
  };

  const showMessage = (type, text, duration = 3000) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), duration);
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.displayName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.nickname?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesRole = !roleFilter || user.role === roleFilter;
    const matchesStatus =
      !statusFilter ||
      (statusFilter === 'active' && user.isActive) ||
      (statusFilter === 'inactive' && !user.isActive);

    return matchesSearch && matchesRole && matchesStatus;
  });

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

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setEditFormData({
      displayName: user.displayName || '',
      nickname: user.nickname || '',
      phone: user.phone || '',
      bio: user.bio || '',
      avatar: user.avatar || '',
      role: user.role || 'USER',
      isActive: user.isActive,
    });
    setIsEditModalOpen(true);
  };

  const handleSaveUser = async () => {
    try {
      await userService.updateUser(selectedUser.id, editFormData);
      showMessage('success', 'کاربر با موفقیت به‌روزرسانی شد');
      setIsEditModalOpen(false);
      fetchUsers();
    } catch (error) {
      showMessage('error', error.response?.data?.message || 'خطا در به‌روزرسانی کاربر');
    }
  };

  const handleDeleteUser = (user) => {
    setSelectedUser(user);
    setIsDeleteModalOpen(true);
  };

  const confirmDeleteUser = async () => {
    try {
      await userService.deleteUser(selectedUser.id);
      showMessage('success', 'کاربر با موفقیت حذف شد');
      setIsDeleteModalOpen(false);
      fetchUsers();
    } catch (error) {
      showMessage('error', error.response?.data?.message || 'خطا در حذف کاربر');
    }
  };

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">مدیریت کاربران</h1>
          <p className="page-subtitle mt-0.5">
            {isLoading ? 'در حال بارگذاری...' : `${filteredUsers.length} کاربر`}
          </p>
        </div>
        <button className="btn btn-primary">
          <Plus size={18} />
          افزودن کاربر جدید
        </button>
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

      {/* Filters */}
      <div className="glass-card p-5 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div>
            <label className="form-label">جستجو</label>
            <div className="relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted" size={16} />
              <input
                value={searchQuery}
                onChange={handleSearch}
                placeholder="نام، ایمیل یا..."
                className="form-input pr-10"
              />
            </div>
          </div>

          <div>
            <label className="form-label">نقش</label>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="form-input"
            >
              <option value="">همه نقش‌ها</option>
              <option value="ADMIN">مدیر سیستم</option>
              <option value="MANAGER">مدیر محصول</option>
              <option value="USER">کاربر</option>
            </select>
          </div>

          <div>
            <label className="form-label">وضعیت</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="form-input"
            >
              <option value="">همه</option>
              <option value="active">فعال</option>
              <option value="inactive">غیرفعال</option>
            </select>
          </div>

          <button
            type="button"
            className="btn btn-ghost"
            onClick={() => {
              setSearchQuery('');
              setRoleFilter('');
              setStatusFilter('');
            }}
          >
            <X size={16} />
            پاک کردن
          </button>
        </div>
      </div>

      {/* Users Table */}
      <div className="glass-card">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-16 gap-4 text-text-muted">
            <div className="spinner"></div>
            <p>در حال دریافت کاربران...</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="empty-state">
            <Users size={48} opacity={0.5} />
            <p>کاربری یافت نشد</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>کاربر</th>
                  <th>ایمیل</th>
                  <th>نقش</th>
                  <th>وضعیت</th>
                  <th>تاریخ عضویت</th>
                  <th className="text-center">عملیات</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id}>
                    <td>
                      <div className="flex items-center gap-3">
                        <div
                          className="w-9 h-9 rounded-lg bg-gradient-to-br from-accent-blue to-accent-purple flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
                          style={{
                            backgroundImage: user.avatar ? `url(${user.avatar})` : undefined,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                          }}
                        >
                          {!user.avatar && (user.displayName || user.email)[0]}
                        </div>
                        <div>
                          <div className="font-semibold text-text-primary text-sm">
                            {user.displayName}
                          </div>
                          {user.nickname && (
                            <div className="text-xs text-text-muted">@{user.nickname}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="text-sm text-text-secondary">
                      {user.email}
                    </td>
                    <td>
                      <span className={`badge ${getRoleBadgeColor(user.role)}`}>
                        {getRoleLabel(user.role)}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${user.isActive ? 'badge-green' : 'badge-gray'}`}>
                        {user.isActive ? 'فعال' : 'غیرفعال'}
                      </span>
                    </td>
                    <td className="text-sm text-text-secondary">
                      {user.createdAt ? formatJalali(user.createdAt, 'short') : '-'}
                    </td>
                    <td>
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => handleEditUser(user)}
                          className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 border border-border-base flex items-center justify-center transition-colors text-text-muted hover:text-text-primary"
                          title="ویرایش"
                        >
                          <Edit size={14} />
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user)}
                          className="w-8 h-8 rounded-lg bg-white/5 hover:bg-red-500/10 border border-border-base flex items-center justify-center transition-colors text-text-muted hover:text-red-400"
                          title="حذف"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-[200] flex items-center justify-center p-4 animate-fade-in">
          <div className="glass-card w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-border-base flex items-center justify-between">
              <h2 className="text-lg font-bold">ویرایش کاربر</h2>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            <div className="p-6">
              <div className="flex flex-col gap-5">
                <div>
                  <label className="form-label">نام نمایشی</label>
                  <div className="relative">
                    <User className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
                    <input
                      value={editFormData.displayName}
                      onChange={(e) =>
                        setEditFormData({ ...editFormData, displayName: e.target.value })
                      }
                      className="form-input pr-10"
                    />
                  </div>
                </div>

                <div>
                  <label className="form-label">نام مستعار</label>
                  <div className="relative">
                    <User className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
                    <input
                      value={editFormData.nickname}
                      onChange={(e) =>
                        setEditFormData({ ...editFormData, nickname: e.target.value })
                      }
                      className="form-input pr-10"
                    />
                  </div>
                </div>

                <div>
                  <label className="form-label">شماره تماس</label>
                  <div className="relative">
                    <Phone className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
                    <input
                      value={editFormData.phone}
                      onChange={(e) =>
                        setEditFormData({ ...editFormData, phone: e.target.value })
                      }
                      className="form-input pr-10"
                    />
                  </div>
                </div>

                <div>
                  <label className="form-label">نقش</label>
                  <select
                    value={editFormData.role}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, role: e.target.value })
                    }
                    className="form-input"
                  >
                    <option value="USER">کاربر</option>
                    <option value="MANAGER">مدیر محصول</option>
                    <option value="ADMIN">مدیر سیستم</option>
                  </select>
                </div>

                <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                  <div>
                    <div className="font-semibold text-text-primary text-sm">وضعیت فعال</div>
                    <div className="text-xs text-text-muted mt-1">
                      کاربر فعال می‌تواند وارد سیستم شود
                    </div>
                  </div>
                  <button
                    onClick={() =>
                      setEditFormData({ ...editFormData, isActive: !editFormData.isActive })
                    }
                    className={`w-12 h-6 rounded-full transition-colors ${editFormData.isActive ? 'bg-accent-green' : 'bg-white/20'}`}
                  >
                    <span
                      className={`block w-5 h-5 rounded-full bg-white transition-transform ${editFormData.isActive ? 'mr-auto' : 'mr-0.5'}`}
                    ></span>
                  </button>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-border-base flex gap-3 justify-end">
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="btn btn-ghost"
              >
                انصراف
              </button>
              <button
                onClick={handleSaveUser}
                className="btn btn-primary"
              >
                <Save size={18} />
                ذخیره تغییرات
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-[200] flex items-center justify-center p-4 animate-fade-in">
          <div className="glass-card w-full max-w-md">
            <div className="p-6 text-center">
              <div className="w-16 h-16 rounded-full bg-red-500/15 flex items-center justify-center mx-auto mb-4">
                <Trash2 size={32} className="text-red-400" />
              </div>
              <h2 className="text-lg font-bold mb-2">حذف کاربر</h2>
              <p className="text-text-secondary text-sm mb-6">
                آیا از حذف کاربر <span className="font-bold text-text-primary">{selectedUser?.displayName}</span> اطمینان دارید؟
                <br />
                این عملیات غیرقابل بازگشت است.
              </p>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="btn btn-ghost"
                >
                  انصراف
                </button>
                <button
                  onClick={confirmDeleteUser}
                  className="btn bg-red-500 hover:bg-red-600 text-white"
                >
                  <Trash2 size={18} />
                  حذف کاربر
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
