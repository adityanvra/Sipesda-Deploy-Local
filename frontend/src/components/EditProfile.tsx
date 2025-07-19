import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

const EditProfile: React.FC = () => {
  const { user, updateProfile, changePassword } = useAuth();
  const [activeTab, setActiveTab] = useState<'profile' | 'password'>('profile');
  
  // Profile form state
  const [profileData, setProfileData] = useState({
    nama_lengkap: user?.nama_lengkap || '',
    email: user?.email || '',
    no_hp: user?.no_hp || ''
  });

  // Password form state
  const [passwordData, setPasswordData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await updateProfile({
        nama_lengkap: profileData.nama_lengkap,
        email: profileData.email || undefined,
        no_hp: profileData.no_hp || undefined
      });
      setSuccess('Profile berhasil diupdate!');
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('Password baru dan konfirmasi password tidak sama');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setError('Password baru minimal 6 karakter');
      return;
    }

    setLoading(true);

    try {
      await changePassword(passwordData.oldPassword, passwordData.newPassword);
      setSuccess('Password berhasil diubah!');
      setPasswordData({
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleProfileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePasswordInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-white text-3xl font-bold">Edit Profile</h1>
          <p className="text-white/80">Update informasi personal Anda</p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-2">
        <button
          onClick={() => setActiveTab('profile')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            activeTab === 'profile' 
              ? 'bg-blue-600 text-white' 
              : 'bg-white/10 text-white/80 hover:bg-white/20'
          }`}
        >
          📝 Edit Profile
        </button>
        <button
          onClick={() => setActiveTab('password')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            activeTab === 'password' 
              ? 'bg-blue-600 text-white' 
              : 'bg-white/10 text-white/80 hover:bg-white/20'
          }`}
        >
          🔑 Change Password
        </button>
      </div>

      {/* Success/Error Messages */}
      {error && (
        <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 text-red-200">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-green-500/20 border border-green-500/50 rounded-lg p-4 text-green-200">
          {success}
        </div>
      )}

      {/* Content */}
      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
        {activeTab === 'profile' && (
          <div>
            <h3 className="text-white text-xl font-semibold mb-6">Profile Information</h3>
            
            <form onSubmit={handleProfileSubmit} className="space-y-4">
              {/* Username (Read-only) */}
              <div>
                <label className="block text-white/80 text-sm font-medium mb-2">
                  Username
                </label>
                <input
                  type="text"
                  value={user?.username || ''}
                  className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white/60 cursor-not-allowed"
                  disabled
                />
                <p className="text-white/50 text-xs mt-1">Username tidak dapat diubah</p>
              </div>

              {/* Role (Read-only) */}
              <div>
                <label className="block text-white/80 text-sm font-medium mb-2">
                  Role
                </label>
                <input
                  type="text"
                  value={user?.role === 'admin' ? 'Administrator' : 'Operator'}
                  className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white/60 cursor-not-allowed"
                  disabled
                />
              </div>

              {/* Full Name */}
              <div>
                <label className="block text-white/80 text-sm font-medium mb-2">
                  Nama Lengkap *
                </label>
                <input
                  type="text"
                  name="nama_lengkap"
                  value={profileData.nama_lengkap}
                  onChange={handleProfileInputChange}
                  className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-white/80 text-sm font-medium mb-2">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={profileData.email}
                  onChange={handleProfileInputChange}
                  className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="example@email.com"
                />
              </div>

              {/* Phone Number */}
              <div>
                <label className="block text-white/80 text-sm font-medium mb-2">
                  Nomor HP
                </label>
                <input
                  type="text"
                  name="no_hp"
                  value={profileData.no_hp}
                  onChange={handleProfileInputChange}
                  className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="081234567890"
                />
              </div>

              {/* Submit Button */}
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Menyimpan...' : 'Update Profile'}
                </button>
              </div>
            </form>
          </div>
        )}

        {activeTab === 'password' && (
          <div>
            <h3 className="text-white text-xl font-semibold mb-6">Change Password</h3>
            
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              {/* Old Password */}
              <div>
                <label className="block text-white/80 text-sm font-medium mb-2">
                  Password Lama *
                </label>
                <input
                  type="password"
                  name="oldPassword"
                  value={passwordData.oldPassword}
                  onChange={handlePasswordInputChange}
                  className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              {/* New Password */}
              <div>
                <label className="block text-white/80 text-sm font-medium mb-2">
                  Password Baru *
                </label>
                <input
                  type="password"
                  name="newPassword"
                  value={passwordData.newPassword}
                  onChange={handlePasswordInputChange}
                  className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  minLength={6}
                  required
                />
                <p className="text-white/50 text-xs mt-1">Minimal 6 karakter</p>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-white/80 text-sm font-medium mb-2">
                  Konfirmasi Password Baru *
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordInputChange}
                  className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              {/* Submit Button */}
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Mengubah...' : 'Change Password'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      {/* User Info */}
      <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
        <h4 className="text-white/80 text-sm font-medium mb-2">Account Information</h4>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-white/60">Created:</span>
            <span className="text-white/80 ml-2">
              {user?.created_at ? new Date(user.created_at).toLocaleDateString('id-ID') : '-'}
            </span>
          </div>
          <div>
            <span className="text-white/60">Last Login:</span>
            <span className="text-white/80 ml-2">
              {user?.last_login ? new Date(user.last_login).toLocaleDateString('id-ID') : '-'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditProfile; 