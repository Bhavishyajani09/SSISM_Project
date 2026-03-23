import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api';
import { Search, MapPin, User, ChevronRight, CheckCircle, XCircle, Clock, FileText, Send, AlertCircle } from 'lucide-react';
import Loader from '../../components/Loader';
import toast from 'react-hot-toast';
import { confirmAction } from '../../utils/notifications';

const STATUS_CFG = {
  submitted:        { bg: 'bg-blue-100 text-blue-700 border-blue-200',   dot: 'bg-blue-400',   label: 'Submitted' },
  approved:         { bg: 'bg-green-100 text-green-700 border-green-200', dot: 'bg-green-400', label: 'Approved'  },
  rejected:         { bg: 'bg-red-100 text-red-700 border-red-200',       dot: 'bg-red-400',   label: 'Admin Rejected'  },
  teacher_rejected: { bg: 'bg-red-100 text-red-700 border-red-200',     dot: 'bg-red-400',   label: 'Teacher Rejected' },
  student_rejected: { bg: 'bg-red-100 text-red-700 border-red-200',     dot: 'bg-red-400',   label: 'Student Rejected' },
};

function StatusBadge({ status }) {
  const cfg = STATUS_CFG[status] || STATUS_CFG.submitted;
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${cfg.bg}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}

export default function AdminVerificationPage() {
  const [verifications, setVerifications]   = useState([]);
  const [loading, setLoading]               = useState(true);
  const [searchTerm, setSearchTerm]         = useState('');
  const [districtFilter, setDistrictFilter] = useState('');
  const [statusFilter, setStatusFilter]     = useState('submitted');
  const [currentPage, setCurrentPage]       = useState(1);
  const [actionLoading, setActionLoading]   = useState(null); // id of row being actioned
  const itemsPerPage = 10;
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const userRole = user.role || 'teacher';
  const isAdmin = userRole === 'admin';

  const fetchVerifications = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get(`/verifications?status=${statusFilter}`);
      setVerifications(res.data.verifications || []);
    } catch (err) {
      console.error('Error fetching verifications:', err);
      toast.error('Failed to load verifications');
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => { fetchVerifications(); }, [fetchVerifications]);

  const filteredVerifications = verifications.filter(v => {
    const matchesSearch   = v.studentName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            v.studentId?.toString().includes(searchTerm);
    const matchesDistrict = districtFilter ? v.district === districtFilter : true;
    return matchesSearch && matchesDistrict;
  });

  const uniqueDistricts = [...new Set(verifications.map(v => v.district).filter(Boolean))].sort();

  useEffect(() => { setCurrentPage(1); }, [searchTerm, districtFilter, statusFilter]);

  const total          = filteredVerifications.length;
  const indexOfLast    = currentPage * itemsPerPage;
  const indexOfFirst   = indexOfLast - itemsPerPage;
  const currentItems   = filteredVerifications.slice(indexOfFirst, indexOfLast);
  const totalPages     = Math.ceil(total / itemsPerPage);

  const handleAction = async (id, action) => {
    const isReview = action === 'submit-for-review';
    const confirmMsg = action === 'approve' ? 'Approve this verification?' : 
                       action === 'reject' ? 'REJECT this verification?' : 
                       'Move this back to submitted for review?';
    
    confirmAction(confirmMsg, async () => {
      setActionLoading(id + action);
      try {
        const endpoint = isReview ? 'submit-for-review' : action;
  
        await api.patch(`/verifications/${id}/${endpoint}`, { remarks: `Admin ${action}d` });
        toast.success(isReview ? 'Moved to Submitted Successfully' : `Verification ${action === 'approve' ? 'Approved ✅' : 'Rejected ❌'}`);
        fetchVerifications();
      } catch (err) {
        console.error(err);
        toast.error(`Failed to ${action}`);
      } finally {
        setActionLoading(null);
      }
    });
  };


  const STATUS_TABS = [
    { key: 'submitted',        label: 'Submitted',        icon: Send },
    { key: 'student_rejected', label: 'Student Rejected', icon: AlertCircle },
    { key: 'teacher_rejected', label: 'Teacher Rejected', icon: AlertCircle },
    { key: 'approved',         label: 'Approved',         icon: CheckCircle },
    { key: 'rejected',         label: 'Admin Rejected',   icon: XCircle },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Admin Approval Center</h1>
        <p className="text-slate-500 mt-1">Review and process submitted home verification records for final approval.</p>
      </div>

      {/* Status Tabs */}
      <div className="flex overflow-x-auto gap-2 mb-8 bg-slate-50 border border-gray-100 p-1.5 rounded-xl w-full sm:w-fit thin-scrollbar shadow-sm">
        {STATUS_TABS.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setStatusFilter(key)}
            className={`flex-shrink-0 flex items-center gap-2.5 px-4 py-2 text-xs font-semibold rounded-lg transition-all duration-200 ${
              statusFilter === key
                ? 'bg-white text-brand-600 shadow-sm border border-gray-100'
                : 'text-slate-500 hover:text-slate-900 hover:bg-white/50'
            }`}
          >
            <Icon size={14} className={statusFilter === key ? 'text-brand-500' : 'text-slate-400'} />
            {label}
          </button>
        ))}
      </div>

      {/* Search + District */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Search by student name or roll number..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-500/10 focus:border-brand-500/30 transition-all text-slate-700 text-sm"
          />
        </div>
        <div className="w-full sm:w-60">
          <select
            value={districtFilter}
            onChange={e => setDistrictFilter(e.target.value)}
            className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-500/10 focus:border-brand-500/30 transition-all text-slate-700 text-sm cursor-pointer"
          >
            <option value="">Everywhere</option>
            {uniqueDistricts.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm">
          <Loader size="xl" />
          <span className="mt-4 text-gray-500 font-medium">Loading verifications...</span>
        </div>
      ) : filteredVerifications.length === 0 ? (
        <div className="py-20 bg-white rounded-3xl border border-gray-100 shadow-sm text-center">
          <FileText className="mx-auto mb-3 text-gray-300" size={40} />
          <p className="text-gray-400 font-medium">No {statusFilter} verifications found.</p>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-base font-bold text-slate-900">
              {STATUS_CFG[statusFilter]?.label} Records Registry
            </h2>
            <span className="px-3 py-0.5 rounded-full text-xs font-semibold bg-brand-50 text-brand-700">
              {total} records
            </span>
          </div>

          {/* ── Mobile Cards ── */}
          <div className="grid grid-cols-1 sm:hidden gap-3 mb-4">
            {currentItems.map(v => (
              <div key={v._id} className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-center text-brand-600">
                      <User size={20} />
                    </div>
                    <div>
                      <h3
                        className="font-bold text-gray-900 text-sm cursor-pointer hover:text-brand-600 transition-colors"
                        onClick={() => navigate(`/verification/home/${v._id}`)}
                      >
                        {v.studentName}
                      </h3>
                      <p className="text-xs text-brand-500 font-semibold uppercase">ID: {v.studentId}</p>
                    </div>
                  </div>
                  <StatusBadge status={v.status} />
                </div>
                <div className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                  <MapPin size={11} />{v.village || '—'}, {v.district || '—'}
                </div>
                <div className="text-xs text-gray-500 mb-3">
                  📞 {v.mobile || '—'} &nbsp;|&nbsp; Verifier: {v.verifierName || '—'}
                </div>
                {isAdmin && statusFilter === 'submitted' && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleAction(v._id, 'approve')}
                      disabled={actionLoading === v._id + 'approve'}
                      className="flex-1 py-2.5 bg-white text-green-600 border border-green-200 rounded-xl text-xs font-bold flex items-center justify-center gap-2 hover:bg-green-50 hover:border-green-300 shadow-sm active:scale-[0.98] transition-all disabled:opacity-50"
                    >
                      {actionLoading === v._id + 'approve' ? <Loader size="xs" /> : <CheckCircle size={14} />}
                      Approve
                    </button>
                    <button
                      onClick={() => handleAction(v._id, 'reject')}
                      disabled={actionLoading === v._id + 'reject'}
                      className="flex-1 py-2.5 bg-white text-red-600 border border-red-200 rounded-xl text-xs font-bold flex items-center justify-center gap-2 hover:bg-red-50 hover:border-red-300 shadow-sm active:scale-[0.98] transition-all disabled:opacity-50"
                    >
                      {actionLoading === v._id + 'reject' ? <Loader size="xs" /> : <XCircle size={14} />}
                      Reject
                    </button>
                  </div>
                )}
                {isAdmin && statusFilter === 'rejected' && (
                  <button
                    onClick={() => handleAction(v._id, 'approve')}
                    disabled={actionLoading === v._id + 'approve'}
                    className="w-full py-2.5 bg-white text-green-600 border border-green-200 rounded-xl text-xs font-bold flex items-center justify-center gap-2 hover:bg-green-50 hover:border-green-300 shadow-sm active:scale-[0.98] transition-all disabled:opacity-50"
                  >
                    {actionLoading === v._id + 'approve' ? <Loader size="xs" /> : <CheckCircle size={14} />}
                    Approve Anyway
                  </button>
                )}
                {isAdmin && (statusFilter === 'teacher_rejected' || statusFilter === 'student_rejected') && (
                  <button
                    onClick={() => handleAction(v._id, 'submit-for-review')}
                    disabled={actionLoading === v._id + 'submit-for-review'}
                    className="w-full py-2.5 bg-white text-blue-600 border border-blue-200 rounded-xl text-xs font-bold flex items-center justify-center gap-2 hover:bg-blue-50 hover:border-blue-300 shadow-sm active:scale-[0.98] transition-all disabled:opacity-50"
                  >
                    {actionLoading === v._id + 'submit-for-review' ? (
                      <Loader size="xs" />
                    ) : (
                      <Send size={14} />
                    )}
                    Move to Submitted
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* ── Desktop Table ── */}
          <div className="hidden sm:block bg-white rounded-xl border border-gray-100 shadow-sm">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4 text-left text-[11px] font-bold text-slate-500 uppercase tracking-widest w-28">Date</th>
                  <th className="px-6 py-4 text-left text-[11px] font-bold text-slate-500 uppercase tracking-widest">Student Details</th>
                  <th className="px-6 py-4 text-left text-[11px] font-bold text-slate-500 uppercase tracking-widest w-32">Roll / ID</th>
                  <th className="px-6 py-4 text-left text-[11px] font-bold text-slate-500 uppercase tracking-widest w-48">Location</th>
                  <th className="px-6 py-4 text-left text-[11px] font-bold text-slate-500 uppercase tracking-widest w-32">Mobile</th>
                  <th className="px-6 py-4 text-left text-[11px] font-bold text-slate-500 uppercase tracking-widest w-36">Verifier</th>
                  <th className="px-6 py-4 text-left text-[11px] font-bold text-slate-500 uppercase tracking-widest w-32">Status</th>
                  {isAdmin && <th className="px-6 py-4 text-center text-[11px] font-bold text-slate-500 uppercase tracking-widest w-32">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {currentItems.map(v => (
                  <tr key={v._id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4 text-slate-500 text-xs font-medium cursor-pointer" onClick={() => navigate(`/verification/home/${v._id}`)}>
                      {new Date(v.verificationDate).toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                    </td>
                    <td className="px-6 py-4 cursor-pointer" onClick={() => navigate(`/verification/home/${v._id}`)}>
                      <p className="font-bold text-slate-900 group-hover:text-brand-600 transition-colors text-sm">{v.studentName}</p>
                    </td>
                    <td className="px-6 py-4 cursor-pointer" onClick={() => navigate(`/verification/home/${v._id}`)}>
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200">{v.studentId || '—'}</span>
                    </td>
                    <td className="px-6 py-4 text-slate-600 cursor-pointer" onClick={() => navigate(`/verification/home/${v._id}`)}>
                      <div className="flex items-center gap-2">
                        <MapPin size={11} className="text-slate-400 shrink-0" />
                        <span className="truncate max-w-[140px] text-xs font-medium">{v.village || '—'}, {v.district || '—'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-600 text-xs font-semibold cursor-pointer" onClick={() => navigate(`/verification/home/${v._id}`)}>
                      {v.mobile || '—'}
                    </td>
                    <td className="px-6 py-4 text-slate-500 font-medium text-[10px] cursor-pointer" onClick={() => navigate(`/verification/home/${v._id}`)}>
                      {v.verifierName || '—'}
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={v.status} />
                    </td>
                    {isAdmin && (
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2">
                          {statusFilter === 'submitted' && (
                            <>
                              <button
                                onClick={() => handleAction(v._id, 'approve')}
                                disabled={actionLoading === v._id + 'approve'}
                                className="p-2 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded-lg border border-emerald-100 disabled:opacity-50 transition-all active:scale-[0.9] flex items-center justify-center h-8 w-8"
                                title="Approve"
                              >
                                {actionLoading === v._id + 'approve' ? <Loader size="xs" /> : <CheckCircle size={14} />}
                              </button>
                              <button
                                onClick={() => handleAction(v._id, 'reject')}
                                disabled={actionLoading === v._id + 'reject'}
                                className="p-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg border border-red-100 disabled:opacity-50 transition-all active:scale-[0.9] flex items-center justify-center h-8 w-8"
                                title="Reject"
                              >
                                {actionLoading === v._id + 'reject' ? <Loader size="xs" /> : <XCircle size={14} />}
                              </button>
                            </>
                          )}
                          {statusFilter === 'rejected' && (
                            <button
                              onClick={() => handleAction(v._id, 'approve')}
                              className="px-3 py-1.5 bg-white text-green-600 border border-green-200 rounded-lg text-[10px] font-bold hover:bg-green-50 active:scale-95 transition-all flex items-center gap-1.5"
                            >
                              <CheckCircle size={12} /> Approve
                            </button>
                          )}
                          {(statusFilter === 'teacher_rejected' || statusFilter === 'student_rejected') && (
                            <button
                              onClick={() => handleAction(v._id, 'submit-for-review')}
                              className="px-3 py-1.5 bg-white text-blue-600 border border-blue-200 rounded-lg text-[10px] font-bold hover:bg-blue-50 active:scale-95 transition-all flex items-center gap-1.5"
                            >
                              <Send size={12} /> Resubmit
                            </button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-5 px-1">
              <p className="text-xs text-gray-400 text-center sm:text-left">
                Showing {indexOfFirst + 1}–{Math.min(indexOfLast, total)} of {total} results
              </p>
              <div className="flex flex-wrap items-center justify-center gap-2">
                <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}
                  className="px-4 py-2 rounded-xl text-sm font-bold border border-gray-200 text-gray-600 bg-white hover:bg-gray-50 disabled:opacity-40 shadow-sm active:scale-95 transition-all">
                  ← Previous
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
                  <button key={n} onClick={() => setCurrentPage(n)}
                    className={`w-10 h-10 rounded-xl text-sm font-bold shadow-sm transition-all active:scale-90 ${n === currentPage ? 'bg-brand-500 text-white ring-2 ring-brand-500/20' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
                    {n}
                  </button>
                ))}
                <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}
                  className="px-4 py-2 rounded-xl text-sm font-bold border border-gray-200 text-gray-600 bg-white hover:bg-gray-50 disabled:opacity-40 shadow-sm active:scale-95 transition-all">
                  Next →
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
