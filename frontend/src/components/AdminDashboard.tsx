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
      
      // Get basic stats
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

      // For demo purposes, we'll use mock user stats
      // In real implementation, this would come from API
      const totalUsers = 5; // mock data
      const activeUsers = 4; // mock data

      setStats({
        totalStudents: students.length,
        totalPayments: payments.length,
        totalAmount,
        totalUsers,
        activeUsers,
        monthlyRevenue
      });
    } catch (error) {
      console.error('Error loading admin stats:', error);
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
                    students: stats.totalStudents,
                    payments: stats.totalPayments,
                    users: stats.totalUsers
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
          </div>

          {/* System Status */}
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
            <h3 className="text-white text-xl font-semibold mb-4">System Status</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-white/80">Database Connection</span>
                <span className="text-green-400 font-semibold">✅ Connected</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white/80">API Status</span>
                <span className="text-green-400 font-semibold">✅ Online</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white/80">Last Backup</span>
                <span className="text-white/60">Manual only</span>
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