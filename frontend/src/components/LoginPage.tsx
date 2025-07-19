import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import RegisterPage from './RegisterPage';

interface LoginPageProps {
  onLogin?: () => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const { login, loading: authLoading } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showRegister, setShowRegister] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setLoading(true);
    setError('');

    try {
      await login(username, password);
      
      // Call optional onLogin callback
      if (onLogin) {
        onLogin();
      }
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan saat login');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#226398] via-[#012246] to-[#254E70] flex items-center justify-center p-4">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  // Show register page if showRegister is true
  if (showRegister) {
    return (
      <RegisterPage 
        onBack={() => setShowRegister(false)}
        onSuccess={() => {
          setShowRegister(false);
          setError('');
          // Show success message on login page
          setTimeout(() => {
            setError('');
          }, 3000);
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#226398] via-[#012246] to-[#254E70] flex items-center justify-center p-4">
      <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 w-full max-w-md shadow-2xl border border-white/20">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-24 h-24 mx-auto mb-4">
            <img src="/image.png" alt="SIPESDA Logo" className="w-full h-full object-contain" />
          </div>
          <h2 className="text-white text-2xl font-bold">SIPESDA</h2>
          <p className="text-white/80 text-sm">Sistem Pembayaran Sekolah Dasar</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Username Field */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-400">👤</span>
            </div>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Username"
              className="w-full pl-10 pr-4 py-3 bg-white/90 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              required
            />
          </div>

          {/* Password Field */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-400">🔑</span>
            </div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full pl-10 pr-4 py-3 bg-white/90 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              required
            />
          </div>

          {/* Login Button */}
          <button
            type="submit"
            disabled={loading || authLoading}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 transition-all transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Masuk...' : 'Login'}
          </button>

          {/* Remember Me & Register */}
          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center text-white/80">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="mr-2 rounded"
              />
              Ingat Saya
            </label>
            <button
              type="button"
              onClick={() => setShowRegister(true)}
              className="text-white/80 hover:text-white underline"
            >
              Daftar Akun
            </button>
          </div>
        </form>

        {/* Registration Info */}
        <div className="mt-6 text-center">
          <p className="text-white/60 text-xs mb-2">
            Belum punya akun?
          </p>
          <button
            type="button"
            onClick={() => setShowRegister(true)}
            className="text-blue-300 hover:text-blue-200 text-sm font-semibold underline"
          >
            Daftar sebagai User Baru
          </button>
        </div>

        {/* System Info */}
        <div className="mt-4 text-center">
          <p className="text-white/40 text-xs">
            SIPESDA v2.0 • Role-Based Access Control
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;