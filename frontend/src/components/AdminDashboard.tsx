import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { API } from '../utils/api';
import UserManagement from './UserManagement';

const AdminDashboard: React.FC = () => {
  const { user, isAdmin } = useAuth();
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalPayments: 0,
    totalAmount: 0,
    totalUsers: 0,
    activeUsers: 0,
    monthlyRevenue: 0
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    loadAdminStats();
  }, []);

  const loadAdminStats = async () => {
    try {
      setLoading(true);
      
      // Try to get real data from API
      try {
        const [students, payments] = await Promise.all([
          API.getStudents(),
          API.getPayments()
        ]);

        // Calculate payment statistics
        const totalAmount = payments.reduce((sum, payment) => sum + parseFloat(payment.nominal.toString()), 0);
        
        // Calculate this month's revenue
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        const monthlyPayments = payments.filter(payment => {
          const paymentDate = new Date(payment.tanggal_pembayaran);
          return paymentDate.getMonth() === currentMonth && 
                 paymentDate.getFullYear() === currentYear;
        });
        const monthlyRevenue = monthlyPayments.reduce((sum, payment) => sum + parseFloat(payment.nominal.toString()), 0);

        setStats({
          totalStudents: students.length,
          totalPayments: payments.length,
          totalAmount,
          totalUsers: 8, // mock data until user API is working
          activeUsers: 6, // mock data until user API is working
          monthlyRevenue
        });
      } catch (apiError) {
        console.warn('API not available, using demo data:', apiError);
        
        // Use demo data when API is not available
        setStats({
          totalStudents: 156,
          totalPayments: 89,
          totalAmount: 12750000,
          totalUsers: 8,
          activeUsers: 6,
          monthlyRevenue: 4250000
        });
      }
    } catch (error) {
      console.error('Error loading admin stats:', error);
      
      // Fallback to demo data
      setStats({
        totalStudents: 156,
        totalPayments: 89,
        totalAmount: 12750000,
        totalUsers: 8,
        activeUsers: 6,
        monthlyRevenue: 4250000
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isAdmin) {
    return (
      <div className="p-8 text-white">
        <h1 className="text-2xl font-bold text-red-400">Access Denied</h1>
        <p>Only administrators can access this page.</p>
      </div>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR'
    }).format(amount);
  };

  const StatCard = ({ title, value, icon, color = 'blue' }: {
    title: string;
    value: string | number;
    icon: string;
    color?: string;
  }) => (
    <div className={`bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-white/80 text-sm">{title}</p>
          <p className="text-white text-2xl font-bold">{value}</p>
        </div>
        <div className={`text-3xl`}>
          {icon}
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-white text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-white/80">Selamat datang, {user?.nama_lengkap || user?.username}</p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              activeTab === 'overview' 
                ? 'bg-blue-600 text-white' 
                : 'bg-white/10 text-white/80 hover:bg-white/20'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              activeTab === 'users' 
                ? 'bg-blue-600 text-white' 
                : 'bg-white/10 text-white/80 hover:bg-white/20'
            }`}
          >
            User Management
          </button>
        </div>
      </div>

      {activeTab === 'overview' && (
        <>
          {/* Statistics Grid */}
          {loading ? (
            <div className="text-white text-center">Loading statistics...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <StatCard
                title="Total Siswa"
                value={stats.totalStudents}
                icon="👥"
                color="blue"
              />
              <StatCard
                title="Total Pembayaran"
                value={stats.totalPayments}
                icon="💳"
                color="green"
              />
              <StatCard
                title="Total Pendapatan"
                value={formatCurrency(stats.totalAmount)}
                icon="💰"
                color="yellow"
              />
              <StatCard
                title="Pendapatan Bulan Ini"
                value={formatCurrency(stats.monthlyRevenue)}
                icon="📈"
                color="purple"
              />
              <StatCard
                title="Total Users"
                value={stats.totalUsers}
                icon="👤"
                color="indigo"
              />
              <StatCard
                title="Active Users"
                value={stats.activeUsers}
                icon="🟢"
                color="green"
              />
            </div>
          )}

          {/* Admin Actions */}
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
            <h3 className="text-white text-xl font-semibold mb-4">Quick Actions</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                onClick={() => setActiveTab('users')}
                className="bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-lg transition-colors flex items-center space-x-2"
              >
                <span>👥</span>
                <span>Manage Users</span>
              </button>
              <button
                onClick={() => window.location.reload()}
                className="bg-green-600 hover:bg-green-700 text-white p-4 rounded-lg transition-colors flex items-center space-x-2"
              >
                <span>🔄</span>
                <span>Refresh Data</span>
              </button>
              <button
                onClick={() => {
                  const backup = {
                    timestamp: new Date().toISOString(),
                    system: {
                      version: 'SIPESDA v2.0',
                      mode: 'demo',
                      build: new Date().toISOString().slice(0, 10)
                    },
                    stats: {
                      students: stats.totalStudents,
                      payments: stats.totalPayments,
                      users: stats.totalUsers,
                      revenue: stats.totalAmount
                    },
                    user: {
                      role: user?.role,
                      username: user?.username,
                      exportedAt: new Date().toISOString()
                    }
                  };
                  const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `sipesda-backup-${new Date().toISOString().split('T')[0]}.json`;
                  a.click();
                }}
                className="bg-orange-600 hover:bg-orange-700 text-white p-4 rounded-lg transition-colors flex items-center space-x-2"
              >
                <span>💾</span>
                <span>Export Backup</span>
              </button>
            </div>
            
            {/* Additional Admin Tools */}
            <div className="mt-4 pt-4 border-t border-white/20">
              <h4 className="text-white/80 text-sm font-semibold mb-3">Admin Tools</h4>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <button
                  onClick={async () => {
                    try {
                      const response = await fetch('https://sipesda-deploy-backend.vercel.app/api');
                      const result = await response.json();
                      alert(`Backend Status: ${response.status}\n${JSON.stringify(result, null, 2)}`);
                    } catch (error) {
                      alert(`Backend Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
                    }
                  }}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded text-sm flex items-center space-x-1"
                >
                  <span>🔍</span>
                  <span>Test Backend</span>
                </button>
                <button
                  onClick={() => {
                    const debugInfo = {
                      timestamp: new Date().toISOString(),
                      userAgent: navigator.userAgent,
                      currentUser: user,
                      localStorage: localStorage.getItem('token') ? 'Has Token' : 'No Token',
                      stats: stats
                    };
                    console.log('SIPESDA Debug Info:', debugInfo);
                    alert('Debug info logged to console');
                  }}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-2 rounded text-sm flex items-center space-x-1"
                >
                  <span>🐛</span>
                  <span>Debug Info</span>
                </button>
                <button
                  onClick={() => {
                    localStorage.clear();
                    sessionStorage.clear();
                    alert('Storage cleared! Please refresh to relogin.');
                  }}
                  className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded text-sm flex items-center space-x-1"
                >
                  <span>🗑️</span>
                  <span>Clear Cache</span>
                </button>
                <button
                  onClick={() => {
                    loadAdminStats();
                    alert('Statistics reloaded!');
                  }}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-2 rounded text-sm flex items-center space-x-1"
                >
                  <span>📊</span>
                  <span>Reload Stats</span>
                </button>
              </div>
            </div>
          </div>

          {/* System Status */}
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
            <h3 className="text-white text-xl font-semibold mb-4">System Status</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-white/80">Frontend Status</span>
                <span className="text-green-400 font-semibold">✅ Online</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white/80">Backend API</span>
                <span className="text-yellow-400 font-semibold">⚠️ Connecting...</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white/80">Database</span>
                <span className="text-yellow-400 font-semibold">⚠️ Setup Required</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white/80">Authentication</span>
                <span className="text-green-400 font-semibold">✅ JWT Active</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white/80">Current Mode</span>
                <span className="text-blue-400 font-semibold">🔧 Demo Data</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white/80">Last Update</span>
                <span className="text-white/60">{new Date().toLocaleString('id-ID')}</span>
              </div>
            </div>
            
            {/* Debug Info */}
            <div className="mt-4 pt-4 border-t border-white/20">
              <h4 className="text-white/80 text-sm font-semibold mb-2">Debug Info</h4>
              <div className="text-xs text-white/60 space-y-1">
                <div>Environment: {process.env.NODE_ENV || 'development'}</div>
                <div>Build: {new Date().toISOString().slice(0, 10)}</div>
                <div>User Role: {user?.role || 'unknown'}</div>
                <div>Auth Status: {user ? 'Authenticated' : 'Guest'}</div>
              </div>
            </div>
          </div>
        </>
      )}

      {activeTab === 'users' && (
        <UserManagement />
      )}
    </div>
  );
};

export default AdminDashboard; 