import React, { useState, useEffect } from 'react';
import { UserPlus, Mail, Lock, Shield, Users, Activity, Clock, Trash2 } from 'lucide-react';
import api from '../../api';
import toast from 'react-hot-toast';
import Loader from '../../components/Loader';

const RegisterTeacherPage = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: 'teacher'
  });
  const [isLoading, setIsLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [isUsersLoading, setIsUsersLoading] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setIsUsersLoading(true);
    try {
      const res = await api.get('/auth/users');
      // Sort: most active first
      const sorted = (res.data.users || []).sort((a, b) => b.verificationCount - a.verificationCount);
      setUsers(sorted);
    } catch (err) {
      console.error('Fetch users error:', err);
    } finally {
      setIsUsersLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await api.post('/auth/register', formData);
      toast.success('User registered successfully!');
      setFormData({ email: '', password: '', role: 'teacher' });
      fetchUsers(); // Refresh list
    } catch (err) {
      console.error('Registration error:', err);
      toast.error(err.response?.data?.error || 'Failed to register user');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteUser = async (id, email) => {
    if (!window.confirm(`Are you sure you want to delete user ${email}?`)) return;
    
    try {
      await api.delete(`/auth/users/${id}`);
      toast.success('User deleted successfully!');
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to delete user');
    }
  };


  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 sm:px-6 lg:px-8 animate-fade-in pb-20">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
          <UserPlus className="text-brand-500" />
          User Management
        </h1>
        <p className="text-gray-500 mt-1">Manage system accounts and monitor teacher activity.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Registration Form */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 overflow-hidden">
            <h2 className="text-lg font-bold text-gray-800 mb-4">Register New User</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase mb-1 block">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 text-gray-400" size={16} />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-brand-500 transition-all font-medium"
                    placeholder="email@ssism.org"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase mb-1 block">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 text-gray-400" size={16} />
                  <input
                    type="text"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-brand-500 transition-all font-medium"
                    placeholder="Initial password"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase mb-1 block">Role</label>
                <div className="relative">
                  <Shield className="absolute left-3 top-2.5 text-gray-400" size={16} />
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-brand-500 transition-all font-medium appearance-none"
                  >
                    <option value="teacher">Teacher</option>
                    <option value="admin">Administrator</option>
                  </select>
                </div>
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 bg-brand-500 text-white rounded-xl font-bold text-sm hover:bg-brand-600 transition-all active:scale-[0.98] disabled:opacity-50"
              >
                {isLoading ? 'Creating...' : 'Register Account'}
              </button>
            </form>
          </div>
        </div>

        {/* Activity Table */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden min-h-[400px]">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="font-bold text-gray-800 flex items-center gap-2">
                <Users size={18} className="text-brand-500" />
                Active Staff
              </h2>
              <button onClick={fetchUsers} className="p-2 rounded-lg hover:bg-gray-50 text-gray-400 hover:text-brand-500 transition-all">
                <Activity size={16} className={isUsersLoading ? 'animate-spin' : ''} />
              </button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead className="bg-gray-50 text-gray-500 uppercase text-[10px] font-black tracking-widest border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-4">S.No</th>
                    <th className="px-6 py-4">User Email</th>
                    <th className="px-6 py-4">Role</th>
                    <th className="px-6 py-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {isUsersLoading ? (
                    <tr>
                      <td colSpan="4" className="px-6 py-20 text-center text-gray-400">
                        <Loader size="sm" />
                        <span className="ml-2 font-bold animate-pulse">SYNCHRONIZING USERS...</span>
                      </td>
                    </tr>
                  ) : users.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="px-6 py-20 text-center text-gray-400 italic">No system users found.</td>
                    </tr>
                  ) : (
                    users.map((u, i) => (
                      <tr key={u.id} className="group hover:bg-gray-50/50 transition-colors">
                        <td className="px-6 py-4 text-gray-400 font-medium">{i + 1}</td>
                        <td className="px-6 py-4 font-bold text-gray-700">{u.email}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase ${u.role === 'admin' ? 'bg-indigo-50 text-indigo-600' : 'bg-brand-50 text-brand-600'}`}>
                            {u.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button 
                            onClick={() => handleDeleteUser(u.id, u.email)}
                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                            title="Delete User"
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterTeacherPage;
