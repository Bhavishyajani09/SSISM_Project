import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api';
import toast from 'react-hot-toast';
import {
  ChevronRight, Pencil, Trash2, Users, Send, CheckCircle,
  Clock, AlertCircle, TrendingUp, Plus, Play, FileEdit,
  RefreshCcw, MapPin, Calendar, LayoutDashboard, Search, Filter
} from 'lucide-react';
import Loader from '../components/Loader';
import Skeleton, { TableRowSkeleton } from '../components/Skeleton';
import { confirmAction } from '../utils/notifications';


const PAGE_SIZE = 10;

export default function TeacherDashboard() {
  const [studentCount, setStudentCount] = useState(0);
  const [students, setStudents] = useState([]);
  const [vMap, setVMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalRecords, setTotalRecords] = useState(0);
  const [dashboardStats, setDashboardStats] = useState(null);
  const [locStats, setLocStats] = useState([]);
  const [recentAct, setRecentAct] = useState([]);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [locationFilter, setLocationFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const userRole = user.role || 'teacher';
  const userId = user._id || user.id;

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchTerm), 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, statusFilter, locationFilter]);

  useEffect(() => {
    fetchStudents();
  }, [page, debouncedSearch, statusFilter, locationFilter]);

  const fetchDashboardData = async () => {
    setLoading(true);
    await Promise.all([fetchStudents(), fetchStats()]);
    setLoading(false);
  };

  const handleVerify = (student) => {
    navigate('/verification/home', { state: { studentData: student } });
  };

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const res = await api.get('/passed-students', {
        params: {
          page: page,
          limit: PAGE_SIZE,
          search: debouncedSearch,
          status: statusFilter,
          district: locationFilter
        }
      });
      const studentList = res.data.data || [];
      console.log('[Dashboard Debug] Students fetched:', studentList.length);
      setStudents(studentList);
      setTotalPages(res.data.totalPages || 0);
      setTotalRecords(res.data.total || 0);

      const mapping = {};
      studentList.forEach(s => {
        if (s.rollNumber) mapping[s.rollNumber] = s.currentStatus;
      });
      setVMap(mapping);
    } catch (err) {
      console.error('Error fetching students:', err);
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await api.get('/passed-students/stats');
      if (res.data.success) {
        console.log('[Dashboard Debug] Stats fetched:', res.data.stats);
        setDashboardStats(res.data.stats);
        setLocStats(res.data.locationStats || []);
        setRecentAct(res.data.recentActivity || []);
      }
    } catch (err) {
      console.error('Error fetching stats:', err);
      toast.error('Failed to load dashboard statistics');
    }
  };

  // --- Data Logic Helpers ---
  // Use API stats if available, otherwise fallback to local calculation
  const stats = dashboardStats || {
    total: students.length,
    submittedByMe: students.filter(s => s.verification?.verifierId === userId && s.currentStatus === 'submitted').length,
    approved: students.filter(s => s.currentStatus === 'approved').length,
    pending: students.filter(s => s.currentStatus === 'pending' || s.currentStatus === 'draft').length,
    rejected: students.filter(s => ['rejected', 'teacher_rejected', 'student_rejected'].includes(s.currentStatus)).length,
    completionRate: students.length ? Math.round((students.filter(s => s.currentStatus !== 'pending' && s.currentStatus !== 'draft').length / students.length) * 100) : 0,
    approvalRate: students.filter(s => s.currentStatus === 'submitted' || s.currentStatus === 'approved').length ? Math.round((students.filter(s => s.currentStatus === 'approved').length / students.filter(s => s.currentStatus === 'submitted' || s.currentStatus === 'approved').length) * 100) : 0,
    olderThan5Days: students.filter(s => {
      if (s.currentStatus !== 'pending' && s.currentStatus !== 'draft') return false;
      const created = new Date(s.createdAt || s.verification?.createdAt);
      return (new Date() - created) > (5 * 24 * 60 * 60 * 1000);
    }).length,
    drafts: students.filter(s => s.currentStatus === 'draft').length
  };

  const getRecentActivity = () => {
    if (recentAct.length > 0) return recentAct;
    return [...students]
      .filter(s => s.verification?.updatedAt)
      .sort((a, b) => new Date(b.verification.updatedAt) - new Date(a.verification.updatedAt))
      .slice(0, 8);
  };

  const getLocationStats = () => {
    if (locStats.length > 0) return locStats;
    const locMap = {};
    students.forEach(s => {
      const loc = s.district || 'Other';
      locMap[loc] = (locMap[loc] || 0) + 1;
    });
    return Object.entries(locMap).sort((a, b) => b[1] - a[1]).slice(0, 8);
  };

  const getDistricts = () => [...new Set(students.map(s => s.district).filter(Boolean))].sort();

  const getTodayVisits = () => {
    const today = new Date().toDateString();
    return recentAct.filter(a => a.updatedAt && new Date(a.updatedAt).toDateString() === today).length;
  };

  const getLastVisited = () => {
    const sorted = [...students]
      .filter(s => s.verification?.verificationDate)
      .sort((a, b) => new Date(b.verification.verificationDate) - new Date(a.verification.verificationDate));
    return sorted.length ? sorted[0].district || sorted[0].villageTown : 'None';
  };

  const getFilteredStudents = () => {
    return students.filter(s => {
      let matchesDate = true;
      if (dateFilter !== 'all') {
        const date = new Date(s.addedAt);
        const now = new Date();
        if (dateFilter === 'today') matchesDate = date.toDateString() === now.toDateString();
        else if (dateFilter === 'week') matchesDate = (now - date) < (7 * 24 * 60 * 60 * 1000);
        else if (dateFilter === 'month') matchesDate = (now - date) < (30 * 24 * 60 * 60 * 1000);
      }
      return matchesDate;
    });
  };

  const filteredList = getFilteredStudents();
  const paginated = filteredList; // Already limited by server pagination

  const formatTimeAgo = (date) => {
    if (!date) return '';
    const diff = Math.floor((new Date() - new Date(date)) / 60000);
    if (diff < 1) return 'Just now';
    if (diff < 60) return `${diff}m ago`;
    if (diff < 1440) return `${Math.floor(diff / 60)}h ago`;
    return new Date(date).toLocaleDateString();
  };

  const getStatus = (rollNumber) => vMap[rollNumber?.toString()] || 'pending';

  const STATUS_CFG = {
    pending: { label: 'Pending', bg: 'bg-gray-100 text-gray-500 border-gray-200', dot: 'bg-gray-300' },
    draft: { label: 'Draft', bg: 'bg-orange-100 text-orange-700 border-orange-200', dot: 'bg-orange-400' },
    submitted: { label: 'Submitted', bg: 'bg-blue-100 text-blue-700 border-blue-200', dot: 'bg-blue-400' },
    approved: { label: 'Approved', bg: 'bg-green-100 text-green-700 border-green-200', dot: 'bg-green-400' },
    rejected: { label: 'Admin Rejected', bg: 'bg-red-100 text-red-700 border-red-200', dot: 'bg-red-400' },
    teacher_rejected: { label: 'Teacher Rejected', bg: 'bg-red-100 text-red-700 border-red-200', dot: 'bg-red-400' },
    student_rejected: { label: 'Student Rejected', bg: 'bg-red-100 text-red-700 border-red-200', dot: 'bg-red-400' },
  };

  function StatusBadge({ status }) {
    const cfg = STATUS_CFG[status] || STATUS_CFG.pending;
    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${cfg.bg}`}>
        <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
        {cfg.label}
      </span>
    );
  }

  const handleDelete = async (id) => {
    confirmAction(
      "Delete this student?",
      async () => {
        try {
          await api.delete(`/passed-students/${id}`);
          toast.success("Student deleted successfully.");
          fetchDashboardData();
        } catch (err) {
          toast.error("Failed to delete student.");
        }
      }
    );
  };

  const handleEdit = (student) => {
    setEditingStudent({ ...student });
    setEditModalOpen(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/passed-students/${editingStudent._id}`, editingStudent);
      toast.success("Student updated successfully.");
      setEditModalOpen(false);
      setEditingStudent(null);
      fetchDashboardData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update student.");
    }
  };




  const KPICard = ({ title, value, icon: Icon, color, subValue, onClick }) => (
    <div
      onClick={onClick}
      className={`bg-white rounded-xl border border-gray-100 p-6 shadow-sm transition-all flex flex-col justify-between ${onClick ? 'cursor-pointer hover:border-brand-100 hover:bg-slate-50/50' : ''}`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className={`p-2 rounded-lg ${color.bg} ${color.text}`}>
          <Icon size={20} />
        </div>
        {subValue && (
          <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${color.bg} ${color.text}`}>
            {subValue}
          </span>
        )}
      </div>
      <div>
        <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
        <p className={`text-2xl font-bold ${color.text === 'text-brand-600' ? 'text-brand-600' : 'text-slate-900'}`}>{value}</p>
      </div>
    </div>
  );

  const colors = {
    brand: { bg: 'bg-brand-50', text: 'text-brand-600', dot: 'bg-brand-500' },
    green: { bg: 'bg-emerald-50', text: 'text-emerald-600', dot: 'bg-emerald-500' },
    blue: { bg: 'bg-blue-50', text: 'text-blue-600', dot: 'bg-blue-500' },
    orange: { bg: 'bg-orange-50', text: 'text-orange-600', dot: 'bg-orange-500' },
    red: { bg: 'bg-red-50', text: 'text-red-600', dot: 'bg-red-500' },
    slate: { bg: 'bg-slate-50', text: 'text-slate-600', dot: 'bg-slate-500' }
  };

  return (
    <>
      <div className="max-w-7xl mx-auto px-3 sm:px-8 lg:px-10 py-4 sm:py-8 animate-fade-in-up">

        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <LayoutDashboard size={20} className="text-brand-500" />
              <h1 className="text-2xl font-bold text-slate-900">
                {userRole === 'admin' ? 'Admin Portal' : 'Teacher Dashboard'}
              </h1>
            </div>
            <p className="text-slate-500 text-sm font-medium">Welcome back, <span className="text-brand-600">{user.name || 'User'}</span></p>
          </div>
          <div className="flex items-center gap-2 bg-white border border-gray-100 rounded-xl px-4 py-2 shadow-sm">
            <Calendar size={14} className="text-slate-400" />
            <span className="text-xs font-semibold text-slate-800">{new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
          </div>
        </div>

        {/* KPI Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 mb-6 sm:mb-8">
          <KPICard title="Total Students" value={stats.total} icon={Users} color={colors.slate} onClick={() => navigate('/home-verification', { state: { filter: 'all' } })} />
          <KPICard title="Submitted By Me" value={stats.submittedByMe} icon={Send} color={colors.blue} onClick={() => navigate('/home-verification', { state: { filter: 'submitted' } })} />
          <KPICard title="Admin Approved" value={stats.approved} icon={CheckCircle} color={colors.green} onClick={() => navigate('/home-verification', { state: { filter: 'approved' } })} />
          <KPICard title="Pending Cases" value={stats.pending} icon={Clock} color={colors.orange} onClick={() => navigate('/home-verification', { state: { filter: 'pending' } })} />
          <KPICard title="Rejected" value={stats.rejected} icon={AlertCircle} color={colors.red} onClick={() => navigate('/home-verification', { state: { filter: 'rejected' } })} />
          <KPICard title="Completion" value={`${stats.completionRate}%`} icon={TrendingUp} color={colors.brand} />
        </div>

        {/* Analytics & Layout Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">

          {/* Progress & Data - Left (2/3) */}
          <div className="lg:col-span-2 space-y-6">

            {/* Quick Actions Grid */}
            <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
              <h3 className="text-sm font-bold text-slate-800 mb-5">Quick Actions</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <button onClick={() => navigate(userRole === 'admin' ? '/register-teacher' : '/add-passed-students')} className="flex flex-col items-center justify-center gap-2 p-5 rounded-xl bg-brand-50 hover:bg-brand-100 text-brand-700 transition-all border border-brand-100 group">
                  <Plus size={20} className="group-hover:scale-110 transition-transform" />
                  <span className="text-xs font-semibold">{userRole === 'admin' ? 'Add Teacher' : 'Add Student'}</span>
                </button>
                <button onClick={() => navigate(userRole === 'admin' ? '/teachers' : '/home-verification')} className="flex flex-col items-center justify-center gap-2 p-5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 transition-all border border-emerald-100 group">
                  <Users size={20} className="group-hover:scale-110 transition-transform" />
                  <span className="text-xs font-semibold">{userRole === 'admin' ? 'View Teachers' : 'Verification'}</span>
                </button>
                <button onClick={() => navigate('/home-verification', { state: { filter: 'draft' } })} className="flex flex-col items-center justify-center gap-2 p-5 rounded-xl bg-orange-50 hover:bg-orange-100 text-orange-700 transition-all border border-orange-100 group">
                  <FileEdit size={20} className="group-hover:scale-110 transition-transform" />
                  <span className="text-xs font-semibold">Drafts</span>
                </button>
                <button onClick={() => navigate('/home-verification', { state: { filter: 'pending' } })} className="flex flex-col items-center justify-center gap-2 p-5 rounded-xl bg-gray-50 hover:bg-gray-100 text-slate-700 transition-all border border-gray-100 group">
                  <RefreshCcw size={20} className="group-hover:scale-110 transition-transform" />
                  <span className="text-xs font-semibold">Pending</span>
                </button>
              </div>
            </div>

            {/* Performance & Charts */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
                <h3 className="text-sm font-bold text-slate-800 mb-5">Location Statistics</h3>
                <div className="space-y-4">
                  {getLocationStats().map(([loc, count]) => (
                    <div key={loc} className="space-y-1.5">
                      <div className="flex justify-between text-xs font-medium">
                        <span className="text-gray-600">{loc}</span>
                        <span className="text-slate-900">{count} Records</span>
                      </div>
                      <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-brand-500 rounded-full" style={{ width: `${(count / stats.total) * 100}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm flex flex-col items-center justify-center text-center">
                <h3 className="text-sm font-bold text-slate-800 mb-5 w-full text-left">Status Distribution</h3>
                <div className="relative w-32 h-32 flex items-center justify-center">
                  <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
                    <circle cx="18" cy="18" r="16" fill="transparent" stroke="#f1f5f9" strokeWidth="3" />
                    <circle cx="18" cy="18" r="16" fill="transparent" stroke="#10b981" strokeWidth="3"
                      strokeDasharray={`${stats.total ? (stats.approved / stats.total) * 100 : 0} 100`} />
                    <circle cx="18" cy="18" r="16" fill="transparent" stroke="#ef4444" strokeWidth="3"
                      strokeDasharray={`${stats.total ? (stats.rejected / stats.total) * 100 : 0} 100`}
                      strokeDashoffset={stats.total ? -(stats.approved / stats.total) * 100 : 0} />
                    <circle cx="18" cy="18" r="16" fill="transparent" stroke="#f59e0b" strokeWidth="3"
                      strokeDasharray={`${stats.total ? (stats.pending / stats.total) * 100 : 0} 100`}
                      strokeDashoffset={stats.total ? -((stats.approved + stats.rejected) / stats.total) * 100 : 0} />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-2xl font-bold text-slate-900">{stats.completionRate}%</span>
                    <span className="text-[10px] font-medium text-slate-500 uppercase">Complete</span>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4 mt-6 w-full">
                  <div className="flex items-center justify-center gap-1.5"><div className="w-2 h-2 rounded-full bg-emerald-500" /><span className="text-[10px] font-medium text-slate-600">Approved</span></div>
                  <div className="flex items-center justify-center gap-1.5"><div className="w-2 h-2 rounded-full bg-red-500" /><span className="text-[10px] font-medium text-slate-600">Rejected</span></div>
                  <div className="flex items-center justify-center gap-1.5"><div className="w-2 h-2 rounded-full bg-orange-500" /><span className="text-[10px] font-medium text-slate-600">Pending</span></div>
                </div>
              </div>
            </div>
            {/* Performance & Charts - Moved to Main for better 50/50 split */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm h-full">
                <h3 className="text-sm font-bold text-slate-800 mb-5">Quick Metrics</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                    <p className="text-[10px] font-medium text-slate-500 uppercase tracking-wide mb-1">Approval Rate</p>
                    <p className="text-lg font-bold text-slate-900">{stats.approvalRate}%</p>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                    <p className="text-[10px] font-medium text-slate-500 uppercase tracking-wide mb-1">Today's Forms</p>
                    <p className="text-lg font-bold text-slate-900">{getTodayVisits()}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm h-full flex flex-col">
                <h3 className="text-sm font-bold text-slate-800 mb-5">Recent Activity</h3>
                <div className="space-y-4 flex-1">
                  {getRecentActivity().length > 0 ? getRecentActivity().map((activity, idx) => (
                    <div key={idx} className="flex items-start gap-4">
                      <div className={`w-8 h-8 rounded-full shrink-0 flex items-center justify-center text-xs font-bold ${STATUS_CFG[activity.currentStatus]?.bg || 'bg-slate-50 text-slate-400'}`}>
                        {activity.studentName.charAt(0)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex justify-between items-start gap-2">
                          <p className="text-xs font-bold text-slate-900 truncate">{activity.studentName}</p>
                          <span className="text-[10px] font-medium text-slate-400 shrink-0">{formatTimeAgo(activity.verification?.updatedAt)}</span>
                        </div>
                        <p className="text-[10px] text-slate-500 mt-0.5 truncate font-medium">
                          {activity.currentStatus === 'submitted' ? 'Sent for review' : (activity.currentStatus || 'pending').replace('_', ' ')}
                        </p>
                      </div>
                    </div>
                  )) : (
                    <p className="text-center text-xs text-slate-400 py-6 italic">No recent activity</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Activity & Insights - Right (1/3) */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
              <h3 className="text-sm font-bold text-slate-800 mb-5">Insights</h3>
              <div className="space-y-5">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center shrink-0">
                    <MapPin size={20} />
                  </div>
                  <div>
                    <p className="text-[10px] font-medium text-slate-500 uppercase tracking-wide">Last Visited</p>
                    <p className="text-sm font-bold text-slate-900">{getLastVisited()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                    <TrendingUp size={20} />
                  </div>
                  <div>
                    <p className="text-[10px] font-medium text-slate-500 uppercase tracking-wide">Today's Target</p>
                    <p className="text-sm font-bold text-slate-900">{getTodayVisits()} Records</p>
                  </div>
                </div>
              </div>

              {/* Priority Tasks here */}
              <div className="mt-8 pt-8 border-t border-gray-50">
                <div className="flex items-center justify-between mb-5">
                  <h4 className="text-[10px] font-bold text-red-600 uppercase tracking-widest">Priority Actions</h4>
                  {(stats.rejected > 0 || stats.drafts > 0 || stats.olderThan5Days > 0) && (
                    <span className="px-2 py-0.5 rounded-full bg-red-50 text-red-600 text-[10px] font-bold">
                      REQUIRED
                    </span>
                  )}
                </div>

                <div className="space-y-3">
                  <div
                    onClick={() => stats.rejected > 0 && navigate('/home-verification', { state: { filter: 'rejected' } })}
                    className={`p-4 rounded-xl border transition-all flex items-center justify-between group cursor-pointer ${stats.rejected > 0 ? 'bg-white border-red-100 hover:border-red-200' : 'bg-slate-50 border-transparent opacity-60'}`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${stats.rejected > 0 ? 'bg-red-50 text-red-600' : 'bg-slate-100 text-slate-400'}`}>
                        <AlertCircle size={18} />
                      </div>
                      <div>
                        <p className="text-[10px] font-medium text-slate-500 uppercase">Rejected</p>
                        <p className={`text-sm font-bold ${stats.rejected > 0 ? 'text-slate-900' : 'text-slate-400'}`}>{stats.rejected} Records</p>
                      </div>
                    </div>
                    {stats.rejected > 0 && <ChevronRight size={16} className="text-slate-300 group-hover:text-red-500 transition-colors" />}
                  </div>

                  <div
                    onClick={() => stats.drafts > 0 && navigate('/home-verification', { state: { filter: 'draft' } })}
                    className={`p-4 rounded-xl border transition-all flex items-center justify-between group cursor-pointer ${stats.drafts > 0 ? 'bg-white border-orange-100 hover:border-orange-200' : 'bg-slate-50 border-transparent opacity-60'}`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${stats.drafts > 0 ? 'bg-orange-50 text-orange-600' : 'bg-slate-100 text-slate-400'}`}>
                        <FileEdit size={18} />
                      </div>
                      <div>
                        <p className="text-[10px] font-medium text-slate-500 uppercase">Incomplete</p>
                        <p className={`text-sm font-bold ${stats.drafts > 0 ? 'text-slate-900' : 'text-slate-400'}`}>{stats.drafts} Records</p>
                      </div>
                    </div>
                    {stats.drafts > 0 && <ChevronRight size={16} className="text-slate-300 group-hover:text-orange-500 transition-colors" />}
                  </div>

                  <div
                    onClick={() => stats.olderThan5Days > 0 && navigate('/home-verification', { state: { filter: 'pending' } })}
                    className={`p-4 rounded-xl border transition-all flex items-center justify-between group cursor-pointer ${stats.olderThan5Days > 0 ? 'bg-white border-amber-100 hover:border-amber-200' : 'bg-slate-50 border-transparent opacity-60'}`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${stats.olderThan5Days > 0 ? 'bg-amber-50 text-amber-600' : 'bg-slate-100 text-slate-400'}`}>
                        <Clock size={18} />
                      </div>
                      <div>
                        <p className="text-[10px] font-medium text-slate-500 uppercase">Stale Cases</p>
                        <p className={`text-sm font-bold ${stats.olderThan5Days > 0 ? 'text-slate-900' : 'text-slate-400'}`}>{stats.olderThan5Days} Records</p>
                      </div>
                    </div>
                    {stats.olderThan5Days > 0 && <ChevronRight size={16} className="text-slate-300 group-hover:text-amber-500 transition-colors" />}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>


        {/* Filters & Table Header */}
        <div className="bg-white rounded-t-xl border-x border-t border-gray-100 p-6 sticky top-0 z-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <h2 className="text-base font-bold text-slate-900">Verification Registry</h2>
              <span className="px-3 py-0.5 rounded-full text-xs font-semibold bg-brand-50 text-brand-700">
                {totalRecords} Records
              </span>
              <button
                onClick={fetchDashboardData}
                className="p-2 rounded-lg text-slate-400 hover:text-brand-600 hover:bg-brand-50 transition-all"
                title="Refresh Data"
              >
                <RefreshCcw size={16} className={loading ? 'animate-spin' : ''} />
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="relative flex-1 min-w-[240px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input
                  type="text"
                  placeholder="Search students..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 text-sm border border-gray-100 rounded-lg bg-slate-50 focus:bg-white focus:ring-2 focus:ring-brand-500/10 focus:border-brand-300 outline-none transition-all"
                />
              </div>
              <div className="flex items-center gap-3">
                <select
                  className="px-3 py-2 text-xs font-semibold border border-gray-100 rounded-lg bg-slate-50 outline-none focus:ring-2 focus:ring-brand-500/10 transition-all cursor-pointer text-slate-700"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="draft">Draft</option>
                  <option value="submitted">Submitted</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
                <button className="p-2 rounded-lg bg-slate-50 text-slate-400 hover:text-brand-600 transition-colors border border-gray-100">
                  <Filter size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>


        {/* Students List */}
        {loading ? (
          <>
            <div className="flex items-center justify-between mb-3 sm:mb-5">
              <div className="h-5 w-40 bg-gray-200 animate-pulse rounded-lg" />
              <div className="h-5 w-20 bg-gray-100 animate-pulse rounded-full" />
            </div>
            <div className="hidden sm:block bg-white rounded-2xl border border-gray-200 overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    {['S.No', 'Student Name', 'Father Name', 'Roll No', 'Mobile', 'Marks', 'Status', 'Actions'].map(h => (
                      <th key={h} className="px-5 py-3.5 text-left text-[11px] font-medium text-slate-500 uppercase tracking-widest whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <TableRowSkeleton rows={6} cols={8} />
                </tbody>
              </table>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:hidden px-1">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm h-40 animate-pulse" />
              ))}
            </div>
          </>
        ) : students.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-16 text-center">
            <div className="mb-4 flex justify-center opacity-30">
              <svg className="w-14 h-14 text-gray-400" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
            </div>
            <h3 className="text-base font-semibold text-gray-700 mb-1">
              {userRole === 'admin' ? 'No Teachers Yet' : 'No Students Yet'}
            </h3>
            <p className="text-gray-400 text-sm mb-6">
              {userRole === 'admin'
                ? 'Add your first teacher to start managing student records.'
                : 'Add your first batch of passed students to see them here.'}
            </p>
            <Link
              to={userRole === 'admin' ? "/register-teacher" : "/add-passed-students"}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-500 text-white text-sm font-semibold hover:bg-brand-600 transition-colors"
            >
              {userRole === 'admin' ? 'Add Teacher' : 'Add Students'}
            </Link>
          </div>
        ) : (
          <>


            {/* Mobile Cards */}
            {userRole !== 'admin' && (
              <div className="grid grid-cols-1 gap-3 sm:hidden mb-10">
                {paginated.map((s, i) => (
                  <div key={s._id} onClick={() => handleVerify(s)} className="bg-white border border-gray-100 rounded-xl p-3.5 shadow-sm hover:shadow-md transition-all active:scale-[0.98] relative overflow-hidden group cursor-pointer">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-lg bg-brand-50 flex items-center justify-center text-brand-600 font-semibold group-hover:bg-brand-500 group-hover:text-white transition-colors text-[10px]">
                          {i + 1}
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-gray-950 leading-tight">{s.studentName}</p>
                          <p className="text-[10px] font-medium text-brand-600 tracking-tight mt-0.5 uppercase">Roll: {s.rollNumber}</p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1.5">
                        <StatusBadge status={getStatus(s.rollNumber)} />
                        <ChevronRight size={14} className="text-gray-300 group-hover:text-brand-500 transition-transform group-hover:translate-x-0.5" />
                        <div className="flex gap-2 mt-1">
                          <button onClick={(e) => { e.stopPropagation(); handleEdit(s); }} className="p-1.5 rounded-lg bg-white border border-gray-100 text-gray-400 hover:text-brand-500 hover:bg-brand-50 hover:border-brand-200 transition-all shadow-sm">
                            <Pencil size={12} />
                          </button>
                          <button onClick={(e) => { e.stopPropagation(); handleDelete(s._id); }} className="p-1.5 rounded-lg bg-white border border-gray-100 text-gray-400 hover:text-red-500 hover:bg-red-50 hover:border-red-200 transition-all shadow-sm">
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-x-3 gap-y-2 text-[10px]">
                      {[
                        ['Father', s.fatherName],
                        ['Mobile', s.mobileNumber],
                        ['Marks', s.scholarshipExamMarks ?? 0],
                        ['Subject', s.subjectIn12th || '—'],
                        ['Village', s.villageTown || '—'],
                        ['District', s.district || '—'],
                        ['Bus Track', s.busTrack || '—'],
                      ].map(([label, val]) => (
                        <div key={label}>
                          <p className="text-gray-400 leading-tight">{label}</p>
                          <p className="text-gray-700 font-medium truncate leading-tight">{val}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Registry List */}
            <div className={`${userRole === 'admin' ? 'block' : 'hidden sm:block'} bg-white rounded-b-xl border-x border-b border-gray-100 overflow-hidden shadow-sm`}>
              <table className="w-full text-sm">
                <thead className="bg-slate-50 border-b border-gray-100">
                  <tr>
                    {['S.No', 'Student Details', 'Father Name', 'Roll No', 'Location', 'Marks', 'Status', 'Actions'].map(h => (
                      <th key={h} className="px-6 py-4 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {paginated.map((s, i) => (
                    <tr key={s._id} onClick={() => handleVerify(s)} className="hover:bg-slate-50/50 transition-all cursor-pointer group">
                      <td className="px-6 py-4 text-slate-400 text-xs">{(page - 1) * PAGE_SIZE + i + 1}</td>
                      <td className="px-6 py-4">
                        <p className="font-bold text-slate-900 group-hover:text-brand-600 transition-colors text-sm">{s.studentName}</p>
                        <p className="text-[10px] text-slate-500 font-medium mt-0.5">Updated {formatTimeAgo(s.verification?.updatedAt || s.updatedAt)}</p>
                      </td>
                      <td className="px-6 py-4 text-slate-600 text-xs font-medium">{s.fatherName}</td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 rounded-md text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">{s.rollNumber}</span>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-xs font-bold text-slate-800">{s.villageTown || '—'}</p>
                        <p className="text-[10px] font-medium text-slate-500 uppercase mt-0.5">{s.district || '—'}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2.5 py-1 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-100">{s.scholarshipExamMarks ?? 0}</span>
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={getStatus(s.rollNumber)} />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={(e) => { e.stopPropagation(); handleVerify(s); }} className="p-2 rounded-lg bg-white border border-gray-100 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 hover:border-emerald-100 transition-all shadow-sm">
                            <TrendingUp size={14} />
                          </button>
                          <button onClick={(e) => { e.stopPropagation(); handleEdit(s); }} className="p-2 rounded-lg bg-white border border-gray-100 text-slate-400 hover:text-brand-600 hover:bg-brand-50 hover:border-brand-100 transition-all shadow-sm">
                            <Pencil size={14} />
                          </button>
                          <button onClick={(e) => { e.stopPropagation(); handleDelete(s._id); }} className="p-2 rounded-lg bg-white border border-gray-100 text-slate-400 hover:text-red-600 hover:bg-red-50 hover:border-red-100 transition-all shadow-sm">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>


            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-5 px-1">
                <p className="text-xs text-gray-400 text-center sm:text-left">
                  Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, totalRecords)} of {totalRecords} students
                </p>
                <div className="flex flex-wrap items-center justify-center gap-2">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-4 py-2 rounded-xl text-xs font-semibold border border-slate-200 text-slate-700 bg-white hover:bg-slate-50 disabled:opacity-40 shadow-sm active:scale-95 transition-all tracking-wide"
                  >← Previous</button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
                    <button
                      key={n}
                      onClick={() => setPage(n)}
                      className={`w-9 h-9 rounded-xl text-xs font-semibold shadow-sm transition-all active:scale-90 ${n === page ? 'bg-brand-500 text-white ring-4 ring-brand-500/10' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                    >{n}</button>
                  ))}
                  <button
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="px-4 py-2 rounded-xl text-xs font-semibold border border-slate-200 text-slate-700 bg-white hover:bg-slate-50 disabled:opacity-40 shadow-sm active:scale-95 transition-all tracking-wide"
                  >Next →</button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Edit Modal */}
      {editModalOpen && editingStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl w-full max-w-xl shadow-2xl animate-zoom-in max-h-[90vh] flex flex-col overflow-hidden m-auto">
            <div className="px-5 py-4 sm:px-6 sm:py-4 border-b border-gray-100 flex items-center justify-between shrink-0 bg-white">
              <h3 className="font-semibold text-gray-900 text-sm sm:text-base tracking-tight">Edit Student</h3>
              <button type="button" onClick={() => setEditModalOpen(false)} className="text-gray-400 hover:text-gray-600 focus:outline-none">✕</button>
            </div>
            <div className="p-5 sm:p-6 overflow-y-auto flex-1">
              <form onSubmit={handleUpdate} id="edit-form">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label className="text-[10px] sm:text-xs font-semibold text-gray-500">Student Name <span className="text-red-400">*</span></label>
                    <input required value={editingStudent.studentName} onChange={(e) => setEditingStudent({ ...editingStudent, studentName: e.target.value })} className="mt-1 w-full px-2.5 py-2 sm:px-3 sm:py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs sm:text-sm outline-none focus:border-brand-400" />
                  </div>
                  <div>
                    <label className="text-[10px] sm:text-xs font-semibold text-gray-500">Father Name <span className="text-red-400">*</span></label>
                    <input required value={editingStudent.fatherName} onChange={(e) => setEditingStudent({ ...editingStudent, fatherName: e.target.value })} className="mt-1 w-full px-2.5 py-2 sm:px-3 sm:py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs sm:text-sm outline-none focus:border-brand-400" />
                  </div>
                  <div>
                    <label className="text-[10px] sm:text-xs font-semibold text-gray-500">Bus Track</label>
                    <input value={editingStudent.busTrack} onChange={(e) => setEditingStudent({ ...editingStudent, busTrack: e.target.value })} className="mt-1 w-full px-2.5 py-2 sm:px-3 sm:py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs sm:text-sm outline-none focus:border-brand-400" />
                  </div>
                  <div>
                    <label className="text-[10px] sm:text-xs font-semibold text-gray-500">Mobile Number <span className="text-red-400">*</span></label>
                    <input required value={editingStudent.mobileNumber} onChange={(e) => setEditingStudent({ ...editingStudent, mobileNumber: e.target.value })} className="mt-1 w-full px-2.5 py-2 sm:px-3 sm:py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs sm:text-sm outline-none focus:border-brand-400" />
                  </div>
                  <div>
                    <label className="text-[10px] sm:text-xs font-semibold text-gray-500">WhatsApp Number</label>
                    <input value={editingStudent.whatsappNumber} onChange={(e) => setEditingStudent({ ...editingStudent, whatsappNumber: e.target.value })} className="mt-1 w-full px-2.5 py-2 sm:px-3 sm:py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs sm:text-sm outline-none focus:border-brand-400" />
                  </div>
                  <div>
                    <label className="text-[10px] sm:text-xs font-semibold text-gray-500">Subject in 12th</label>
                    <input value={editingStudent.subjectIn12th} onChange={(e) => setEditingStudent({ ...editingStudent, subjectIn12th: e.target.value })} className="mt-1 w-full px-2.5 py-2 sm:px-3 sm:py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs sm:text-sm outline-none focus:border-brand-400" />
                  </div>
                  <div>
                    <label className="text-[10px] sm:text-xs font-semibold text-gray-500">Village / Town</label>
                    <input value={editingStudent.villageTown} onChange={(e) => setEditingStudent({ ...editingStudent, villageTown: e.target.value })} className="mt-1 w-full px-2.5 py-2 sm:px-3 sm:py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs sm:text-sm outline-none focus:border-brand-400" />
                  </div>
                  <div>
                    <label className="text-[10px] sm:text-xs font-semibold text-gray-500">District</label>
                    <input value={editingStudent.district} onChange={(e) => setEditingStudent({ ...editingStudent, district: e.target.value })} className="mt-1 w-full px-2.5 py-2 sm:px-3 sm:py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs sm:text-sm outline-none focus:border-brand-400" />
                  </div>
                  <div>
                    <label className="text-[10px] sm:text-xs font-semibold text-gray-500">Roll Number</label>
                    <input value={editingStudent.rollNumber} onChange={(e) => setEditingStudent({ ...editingStudent, rollNumber: e.target.value })} className="mt-1 w-full px-2.5 py-2 sm:px-3 sm:py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs sm:text-sm outline-none focus:border-brand-400" />
                  </div>
                  <div>
                    <label className="text-[10px] sm:text-xs font-semibold text-gray-500">Scholarship Marks</label>
                    <input type="number" min="0" max="50" value={editingStudent.scholarshipExamMarks} onChange={(e) => setEditingStudent({ ...editingStudent, scholarshipExamMarks: e.target.value })} className="mt-1 w-full px-2.5 py-2 sm:px-3 sm:py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs sm:text-sm outline-none focus:border-brand-400" />
                  </div>
                </div>
              </form>
            </div>
            <div className="px-5 py-4 sm:px-6 border-t border-gray-100 flex justify-end gap-2.5 sm:gap-3 shrink-0 bg-gray-50">
              <button type="button" onClick={() => setEditModalOpen(false)} className="px-4 py-2 sm:px-5 sm:py-2.5 rounded-lg border border-gray-200 text-gray-600 text-xs sm:text-sm font-semibold hover:bg-gray-50 transition-colors flex-1 sm:flex-none">Cancel</button>
              <button type="submit" form="edit-form" className="px-4 py-2 sm:px-5 sm:py-2.5 rounded-lg bg-brand-500 text-white text-xs sm:text-sm font-semibold hover:bg-brand-600 transition-colors flex-1 sm:flex-none">Save Changes</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
