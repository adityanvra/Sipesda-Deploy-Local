import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

interface RegisterPageProps {
  onBack?: () => void;
  onSuccess?: () => void;
}

const RegisterPage: React.FC<RegisterPageProps> = ({ onBack, onSuccess }) => {
  const { token } = useAuth();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    nama_lengkap: '',
    role: 'operator' as 'admin' | 'operator',
    email: '',
    no_hp: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  // API Base URL
  const API_BASE_URL = process.env.NODE_ENV === 'production' 
    ? 'https://sipesda-deploy-backend.vercel.app/api'
    : 'http://localhost:5000/api';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Password and confirm password do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    try {
      setLoading(true);

      const response = await axios.post(
        `${API_BASE_URL}/users/register`,
        {
          username: formData.username,
          password: formData.password,
          nama_lengkap: formData.nama_lengkap,
          role: formData.role,
          email: formData.email || undefined,
          no_hp: formData.no_hp || undefined
        },
        token ? {
          headers: { Authorization: `Bearer ${token}` }
        } : {}
      );

      setSuccess('User registered successfully!');
      
      // Reset form
      setFormData({
        username: '',
        password: '',
        confirmPassword: '',
        nama_lengkap: '',
        role: 'operator',
        email: '',
        no_hp: ''
      });

      // Call success callback if provided
      if (onSuccess) {
        setTimeout(() => onSuccess(), 2000);
      }

    } catch (error: any) {
      console.error('Registration error:', error);
      setError(error.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#226398] via-[#012246] to-[#254E70] flex items-center justify-center p-4">
      <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 w-full max-w-md shadow-2xl border border-white/20">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-24 h-24 mx-auto mb-4">
            <img src="/image.png" alt="SIPESDA Logo" className="w-full h-full object-contain" />
          </div>
          <h2 className="text-white text-2xl font-bold">Register User</h2>
          <p className="text-white/80 text-sm">Create new account for SIPESDA</p>
        </div>

        {/* Success/Error Messages */}
        {error && (
          <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200 text-sm">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-4 p-3 bg-green-500/20 border border-green-500/50 rounded-lg text-green-200 text-sm">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Username */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-400">👤</span>
            </div>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleInputChange}
              placeholder="Username"
              className="w-full pl-10 pr-4 py-3 bg-white/90 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              required
            />
          </div>

          {/* Full Name */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-400">📝</span>
            </div>
            <input
              type="text"
              name="nama_lengkap"
              value={formData.nama_lengkap}
              onChange={handleInputChange}
              placeholder="Full Name"
              className="w-full pl-10 pr-4 py-3 bg-white/90 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              required
            />
          </div>

          {/* Email */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-400">📧</span>
            </div>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="Email (optional)"
              className="w-full pl-10 pr-4 py-3 bg-white/90 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>

          {/* Phone Number */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-400">📱</span>
            </div>
            <input
              type="text"
              name="no_hp"
              value={formData.no_hp}
              onChange={handleInputChange}
              placeholder="Phone Number (optional)"
              className="w-full pl-10 pr-4 py-3 bg-white/90 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>

          {/* Role Selection */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-400">🏷️</span>
            </div>
            <select
              name="role"
              value={formData.role}
              onChange={handleInputChange}
              className="w-full pl-10 pr-4 py-3 bg-white/90 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all appearance-none"
            >
              <option value="operator">Operator</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          {/* Password */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-400">🔑</span>
            </div>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              placeholder="Password (min. 6 characters)"
              className="w-full pl-10 pr-4 py-3 bg-white/90 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              required
              minLength={6}
            />
          </div>

          {/* Confirm Password */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-400">🔒</span>
            </div>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              placeholder="Confirm Password"
              className="w-full pl-10 pr-4 py-3 bg-white/90 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              required
            />
          </div>

          {/* Register Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white py-3 rounded-xl font-semibold hover:from-green-700 hover:to-green-800 transition-all transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Creating Account...' : 'Register'}
          </button>

          {/* Back Button */}
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="w-full bg-gray-500 hover:bg-gray-600 text-white py-3 rounded-xl font-semibold transition-all"
            >
              Back to Login
            </button>
          )}
        </form>

        {/* Info */}
        <div className="mt-6 text-center">
          <p className="text-white/60 text-xs">
            By registering, you agree to follow SIPESDA guidelines and policies.
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage; 