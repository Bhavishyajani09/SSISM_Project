import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../../api';
import { Search, MapPin, User, ChevronRight, FileText, CheckCircle, XCircle, Clock, LayoutGrid, Send, AlertCircle, Pencil, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import Loader from '../../components/Loader';
import { TableRowSkeleton, CardSkeleton } from '../../components/Skeleton';
import { confirmAction } from '../../utils/notifications';



const STATUS_CONFIG = {
  draft: { label: 'Draft', bg: 'bg-orange-100 text-orange-700 border-orange-200', dot: 'bg-orange-400', Icon: FileText },
  submitted: { label: 'Submitted', bg: 'bg-blue-100 text-blue-700 border-blue-200', dot: 'bg-blue-400', Icon: Clock },
  approved: { label: 'Approved', bg: 'bg-green-100 text-green-700 border-green-200', dot: 'bg-green-400', Icon: CheckCircle },
  rejected: { label: 'Admin Rejected', bg: 'bg-red-100 text-red-700 border-red-200', dot: 'bg-red-400', Icon: XCircle },
  teacher_rejected: { label: 'Teacher Rejected', bg: 'bg-red-100 text-red-700 border-red-200', dot: 'bg-red-400', Icon: XCircle },
  student_rejected: { label: 'Student Rejected', bg: 'bg-red-100 text-red-700 border-red-200', dot: 'bg-red-400', Icon: XCircle },
  hold: { label: 'On Hold', bg: 'bg-amber-100 text-amber-700 border-amber-200', dot: 'bg-amber-400', Icon: Clock },
  pending: { label: 'Pending', bg: 'bg-gray-100 text-gray-500 border-gray-200', dot: 'bg-gray-300', Icon: Clock },
};

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${cfg.bg}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}

export default function VerificationListPage() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [districtFilter, setDistrictFilter] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const initialFilter = location.state?.filter || 'pending';
  
  const [statusFilter, setStatusFilter] = useState(initialFilter);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const itemsPerPage = 10;

  // Search Debounce
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchTerm), 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const fetchStudents = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page: currentPage,
        limit: itemsPerPage,
        search: debouncedSearch,
        district: districtFilter,
        status: statusFilter
      };
      const res = await api.get('/passed-students', { params });
      setStudents(res.data.data || []);
      setTotalRecords(res.data.total || 0);
      setTotalPages(res.data.totalPages || 0);
    } catch (err) {
      console.error('Error fetching students:', err);
      toast.error('Failed to load students');
    } finally {
      setLoading(false);
    }
  }, [currentPage, debouncedSearch, districtFilter, statusFilter]);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  // Reset to page 1 on filter change
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, districtFilter, statusFilter]);

  const STATUS_TABS = [
    { key: 'all', label: 'All', icon: LayoutGrid },
    { key: 'pending', label: 'Pending', icon: Clock },
    { key: 'draft', label: 'Draft', icon: FileText },
    { key: 'hold', label: 'Hold', icon: Clock },
    { key: 'submitted', label: 'Submitted', icon: Send },
    { key: 'student_rejected', label: 'Student Rejected', icon: XCircle },
    { key: 'teacher_rejected', label: 'Teacher Rejected', icon: AlertCircle },
    { key: 'approved', label: 'Approved', icon: CheckCircle },
  ];

  const handleOpen = (student) => {
    const v = student.verification;
    if (v?._id) {
      navigate(`/verification/home/${v._id}`);
    } else {
      navigate('/verification/home', { state: { studentData: student } });
    }
  };

  const handleEdit = (student) => handleOpen(student); // Edit is same as Open for now

  const handleDelete = async (id) => {
    confirmAction(
      "Delete this student record?",
      async () => {
        try {
          await api.delete(`/passed-students/${id}`);
          toast.success('Student record deleted');
          fetchStudents();
        } catch (err) {
          console.error('Delete error:', err);
          toast.error('Failed to delete student');
        }
      }
    );
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 leading-tight">Home Verification</h1>
        <p className="text-xs sm:text-sm text-gray-500 mt-1">Select a student to start or continue their home verification.</p>
      </div>

      {/* Status Tabs */}
      <div className="flex overflow-x-auto gap-1 sm:gap-1.5 mb-6 bg-gray-50 border border-gray-100 p-1 sm:p-1.5 rounded-2xl w-full sm:w-fit thin-scrollbar shadow-sm">
        {STATUS_TABS.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setStatusFilter(key)}
            className={`flex-shrink-0 flex items-center gap-1.5 sm:gap-2.5 px-3 sm:px-4 py-2 sm:py-2.5 text-[10px] sm:text-xs font-bold rounded-xl capitalize transition-all duration-300 ${statusFilter === key
              ? 'bg-white text-brand-600 shadow-md ring-1 ring-black/5 scale-[1.02]'
              : 'text-gray-500 hover:text-gray-700 hover:bg-white/50'
              }`}
          >
            <Icon size={13} className={`sm:w-[15px] sm:h-[15px] ${statusFilter === key ? 'text-brand-500' : 'text-gray-400'}`} />
            {label}
          </button>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input
            type="text"
            placeholder="Search by name or roll..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all text-gray-700 text-xs sm:text-sm"
          />
        </div>
        <div className="w-full sm:w-52">
          <select
            value={districtFilter}
            onChange={e => setDistrictFilter(e.target.value)}
            className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all text-gray-700 text-xs sm:text-sm"
          >
            <option value="">All Districts</option>
            {['Barwani', 'Dhar', 'Khargone', 'Jhabua', 'Alirajpur'].map(d => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <>
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <div className="h-6 w-32 bg-gray-200 animate-pulse rounded-lg" />
            <div className="h-5 w-20 bg-gray-100 animate-pulse rounded-full" />
          </div>

          {/* Mobile Skeletons */}
          <div className="grid grid-cols-1 md:hidden gap-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="bg-white border border-gray-100 rounded-xl p-3 shadow-sm">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-lg bg-gray-100 animate-pulse" />
                    <div>
                      <div className="h-3 w-24 bg-gray-200 animate-pulse rounded mb-1" />
                      <div className="h-2 w-16 bg-gray-100 animate-pulse rounded" />
                    </div>
                  </div>
                  <div className="h-5 w-16 bg-gray-100 animate-pulse rounded-full" />
                </div>
                <div className="space-y-2">
                  <div className="h-2 w-full bg-gray-50 animate-pulse rounded" />
                  <div className="h-2 w-2/3 bg-gray-50 animate-pulse rounded" />
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Skeletons */}
          <div className="hidden sm:block bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
            <table className="w-full text-xs">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  {['S.No', 'Student Name', 'Father Name', 'Roll No', 'Location', 'Mobile', 'Status', 'Action'].map(h => (
                    <th key={h} className="px-4 py-3 text-left font-bold text-gray-300 border-none uppercase tracking-widest whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                <TableRowSkeleton rows={8} cols={8} />
              </tbody>
            </table>
          </div>
        </>
      ) : students.length === 0 ? (
        <div className="py-20 bg-white rounded-3xl border border-gray-100 shadow-sm text-center">
          <p className="text-gray-400 font-medium">No students found matching your criteria.</p>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <h2 className="text-sm sm:text-base font-semibold text-gray-700">Verification List</h2>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-semibold bg-brand-50 text-brand-600">
              {totalRecords} records
            </span>
          </div>

          {/* Mobile Cards */}
          <div className="grid grid-cols-1 md:hidden gap-3">
            {students.map(student => (
              <div
                key={student._id}
                onClick={() => handleOpen(student)}
                className="bg-white border border-gray-100 rounded-xl p-3 shadow-sm hover:shadow-md hover:border-brand-200 cursor-pointer transition-all group"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-lg bg-orange-50 border border-orange-100 flex items-center justify-center text-brand-600 group-hover:bg-brand-500 group-hover:text-white transition-colors">
                      <User size={20} />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 group-hover:text-brand-600 transition-colors text-xs">
                        {student.studentName}
                      </h3>
                      <p className="text-[10px] text-gray-400 font-medium">ROLL: {student.rollNumber}</p>
                    </div>
                  </div>
                  <StatusBadge status={student.currentStatus || 'pending'} />
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-center gap-1.5 text-gray-500 text-[11px]">
                    <MapPin size={11} className="text-gray-400" />
                    <span className="truncate">{student.villageTown || '—'}, {student.district || '—'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-gray-500 text-[11px]">
                      <span className="font-semibold text-gray-600">Mobile:</span>
                      <span>{student.mobileNumber || '—'}</span>
                    </div>
                    <span className="text-[10px] font-bold text-brand-500 flex items-center gap-0.5">
                      Verify <ChevronRight size={12} />
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* ── Desktop Table ── */}
          <div className="hidden sm:block bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
            <table className="w-full text-xs">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  {['S.No', 'Student Name', 'Father Name', 'Roll No', 'Location', 'Mobile', 'Status', 'Action'].map(h => (
                    <th key={h} className="px-4 py-3 text-left font-bold text-gray-400 border-none uppercase tracking-widest whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {students.map((s, i) => (
                  <tr
                    key={s._id}
                    onClick={() => handleOpen(s)}
                    className="hover:bg-gray-50 transition-colors cursor-pointer group"
                  >
                    <td className="px-5 py-4 text-gray-400 text-xs">{(currentPage - 1) * itemsPerPage + i + 1}</td>
                    <td className="px-5 py-4 font-semibold text-gray-800 group-hover:text-brand-600 transition-colors">{s.studentName}</td>
                    <td className="px-5 py-4 text-gray-500">{s.fatherName}</td>
                    <td className="px-5 py-4">
                      <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-brand-50 text-brand-600">{s.rollNumber}</span>
                    </td>
                    <td className="px-5 py-4 text-gray-500">
                      <div className="flex items-center gap-1">
                        <MapPin size={12} className="text-gray-400" />
                        <span className="truncate">{s.villageTown || '—'}, {s.district || '—'}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-gray-500">{s.mobileNumber || '—'}</td>
                    <td className="px-5 py-4">
                      <StatusBadge status={s.currentStatus} />
                    </td>
                    <td className="px-5 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <span className="text-xs font-semibold text-brand-500 opacity-0 group-hover:opacity-100 transition-all transform group-hover:translate-x-1 flex items-center gap-0.5">
                          {s.currentStatus === 'pending' ? 'Verify' : 'Open'} <ChevronRight size={14} />
                        </span>
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
                Showing {(currentPage - 1) * itemsPerPage + 1}–{Math.min(currentPage * itemsPerPage, totalRecords)} of {totalRecords} results
              </p>
              <div className="flex flex-wrap items-center justify-center gap-2">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 rounded-xl text-sm font-bold border border-gray-200 text-gray-600 bg-white hover:bg-gray-50 disabled:opacity-40 shadow-sm active:scale-95 transition-all"
                >← Previous</button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
                  <button
                    key={n}
                    onClick={() => setCurrentPage(n)}
                    className={`w-10 h-10 rounded-xl text-sm font-bold shadow-sm transition-all active:scale-90 ${n === currentPage ? 'bg-brand-500 text-white ring-2 ring-brand-500/20' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                  >{n}</button>
                ))}
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 rounded-xl text-sm font-bold border border-gray-200 text-gray-600 bg-white hover:bg-gray-50 disabled:opacity-40 shadow-sm active:scale-95 transition-all"
                >Next →</button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
