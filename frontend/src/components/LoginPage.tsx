import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { useDatabaseContext } from '../contexts/DatabaseContext';

interface LoginPageProps {
  onLogin: (user: User) => void;
  onShowRegister: () => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin, onShowRegister }) => {
  const { db, isLoading: isDbLoading } = useDatabaseContext();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Load saved credentials on component mount
  useEffect(() => {
    const savedCredentials = localStorage.getItem('sipesda_credentials');
    if (savedCredentials) {
      try {
        const { username: savedUsername, password: savedPassword, rememberMe: savedRememberMe } = JSON.parse(savedCredentials);
        setUsername(savedUsername || '');
        setPassword(savedPassword || '');
        setRememberMe(savedRememberMe || false);
        console.log('Loaded saved credentials:', { username: savedUsername, rememberMe: savedRememberMe });
      } catch (error) {
        console.log('Error loading saved credentials:', error);
        // Clear invalid saved credentials
        localStorage.removeItem('sipesda_credentials');
      }
    } else {
      console.log('No saved credentials found');
    }
  }, []);

  // Save credentials when remember me is checked
  const handleRememberMeChange = (checked: boolean) => {
    setRememberMe(checked);
    
    if (checked) {
      // Save credentials
      const credentials = {
        username,
        password,
        rememberMe: true
      };
      localStorage.setItem('sipesda_credentials', JSON.stringify(credentials));
      console.log('Remember Me enabled - credentials saved');
    } else {
      // Remove saved credentials
      localStorage.removeItem('sipesda_credentials');
      console.log('Remember Me disabled - credentials cleared');
    }
  };

  // Update saved credentials when username or password changes
  const handleUsernameChange = (value: string) => {
    setUsername(value);
    if (rememberMe) {
      const credentials = {
        username: value,
        password,
        rememberMe: true
      };
      localStorage.setItem('sipesda_credentials', JSON.stringify(credentials));
    }
  };

  const handlePasswordChange = (value: string) => {
    setPassword(value);
    if (rememberMe) {
      const credentials = {
        username,
        password: value,
        rememberMe: true
      };
      localStorage.setItem('sipesda_credentials', JSON.stringify(credentials));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!db || isDbLoading) return;
    
    setLoading(true);
    setError('');

    try {
      const loginResponse = await db.authenticateUser(username, password, rememberMe);
      if (loginResponse) {
        // Save credentials if remember me is checked
        if (rememberMe) {
          const credentials = {
            username,
            password,
            rememberMe: true
          };
          localStorage.setItem('sipesda_credentials', JSON.stringify(credentials));
          console.log('Credentials saved for Remember Me');
        } else {
          // Clear saved credentials if remember me is unchecked
          localStorage.removeItem('sipesda_credentials');
          console.log('Credentials cleared - Remember Me not checked');
        }
        
        onLogin(loginResponse.user);
      } else {
        setError('Username atau password salah');
      }
    } catch (err) {
      setError('Terjadi kesalahan saat login');
    } finally {
      setLoading(false);
    }
  };

  if (isDbLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#226398] via-[#012246] to-[#254E70] flex items-center justify-center p-4">
        <div className="text-white">Loading...</div>
      </div>
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
              onChange={(e) => handleUsernameChange(e.target.value)}
              placeholder="Username"
              autoComplete="username"
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
              onChange={(e) => handlePasswordChange(e.target.value)}
              placeholder="Password"
              autoComplete="current-password"
              className="w-full pl-10 pr-4 py-3 bg-white/90 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              required
            />
          </div>

          {/* Login Button */}
          <button
            type="submit"
            disabled={loading || !db}
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
                onChange={(e) => handleRememberMeChange(e.target.checked)}
                className="mr-2 rounded"
              />
              Ingat Saya
            </label>
            <button
              type="button"
              onClick={onShowRegister}
              className="text-white/80 hover:text-white underline"
            >
              Daftar Akun
            </button>
          </div>
        </form>

        {/* Session Info */}
        <div className="mt-6 p-3 bg-white/10 rounded-lg">
          <p className="text-white/70 text-xs text-center">
            {rememberMe 
              ? 'Username, password, dan session akan diingat selama 30 hari' 
              : 'Session akan berakhir dalam 1 jam atau setelah tidak aktif 1 menit'
            }
          </p>
        </div>

        {/* Saved Credentials Info */}
        {rememberMe && (
          <div className="mt-3 p-2 bg-green-500/20 border border-green-500/30 rounded-lg">
            <p className="text-green-200 text-xs text-center">
              ✅ Kredensial akan disimpan secara aman di browser Anda
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LoginPage;