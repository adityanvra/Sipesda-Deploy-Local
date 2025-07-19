import React, { useState, useEffect } from 'react';
import { useAuth, User } from '../contexts/AuthContext';
import axios from 'axios';

interface UserFormData {
  username: string;
  password: string;
  nama_lengkap: string;
  role: 'admin' | 'operator';
  email: string;
  no_hp: string;
}

const UserManagement: React.FC = () => {
  const { user: currentUser, token, isAdmin } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState<UserFormData>({
    username: '',
    password: '',
    nama_lengkap: '',
    role: 'operator',
    email: '',
    no_hp: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // API Base URL
  const API_BASE_URL = process.env.NODE_ENV === 'production' 
    ? 'https://sipesda-deploy-backend.vercel.app/api'
    : 'http://localhost:5000/api';

  useEffect(() => {
    if (isAdmin) {
      loadUsers();
    }
  }, [isAdmin, token]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/users`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(response.data);
    } catch (error: any) {
      setError('Failed to load users: ' + (error.response?.data?.error || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      if (editingUser) {
        // Update user
        await axios.put(
          `${API_BASE_URL}/users/${editingUser.id}`,
          {
            username: formData.username,
            nama_lengkap: formData.nama_lengkap,
            role: formData.role,
            email: formData.email,
            no_hp: formData.no_hp,
            aktif: true
          },
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
        setSuccess('User updated successfully');
      } else {
        // Create new user
        await axios.post(
          `${API_BASE_URL}/users/register`,
          formData,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
        setSuccess('User created successfully');
      }

      // Reset form and reload users
      resetForm();
      loadUsers();
    } catch (error: any) {
      setError(error.response?.data?.error || 'Failed to save user');
    }
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setFormData({
      username: user.username,
      password: '', // Don't populate password for security
      nama_lengkap: user.nama_lengkap,
      role: user.role,
      email: user.email || '',
      no_hp: user.no_hp || ''
    });
    setShowForm(true);
  };

  const handleDelete = async (userId: number) => {
    if (!confirm('Are you sure you want to delete this user?')) return;

    try {
      await axios.delete(`${API_BASE_URL}/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuccess('User deleted successfully');
      loadUsers();
    } catch (error: any) {
      setError('Failed to delete user: ' + (error.response?.data?.error || error.message));
    }
  };

  const resetForm = () => {
    setFormData({
      username: '',
      password: '',
      nama_lengkap: '',
      role: 'operator',
      email: '',
      no_hp: ''
    });
    setEditingUser(null);
    setShowForm(false);
  };

  if (!isAdmin) {
    return (
      <div className="p-8 text-white">
        <h1 className="text-2xl font-bold text-red-400">Access Denied</h1>
        <p>Only administrators can access user management.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-white text-2xl font-bold">User Management</h2>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          Add New User
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

      {/* User Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-bold mb-4">
              {editingUser ? 'Edit User' : 'Add New User'}
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Username
                </label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              {!editingUser && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Password
                  </label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required={!editingUser}
                    minLength={6}
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={formData.nama_lengkap}
                  onChange={(e) => setFormData({ ...formData, nama_lengkap: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Role
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as 'admin' | 'operator' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="operator">Operator</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number
                </label>
                <input
                  type="text"
                  value={formData.no_hp}
                  onChange={(e) => setFormData({ ...formData, no_hp: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors"
                >
                  {editingUser ? 'Update User' : 'Create User'}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Users Table */}
      <div className="bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-white">Loading users...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-white/5">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white/80 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white/80 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white/80 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white/80 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white/80 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-white/5">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-white">
                          {user.nama_lengkap}
                        </div>
                        <div className="text-sm text-white/60">
                          @{user.username}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        user.role === 'admin' 
                          ? 'bg-purple-100 text-purple-800' 
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white/80">
                      {user.email || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        user.aktif 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {user.aktif ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button
                        onClick={() => handleEdit(user)}
                        className="text-blue-400 hover:text-blue-300"
                      >
                        Edit
                      </button>
                      {user.id !== currentUser?.id && (
                        <button
                          onClick={() => handleDelete(user.id)}
                          className="text-red-400 hover:text-red-300"
                        >
                          Delete
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserManagement; 