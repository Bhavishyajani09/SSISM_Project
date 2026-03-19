import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api';
import { Search, MapPin, User, ChevronRight, FileText, CheckCircle, XCircle, Clock, LayoutGrid, Send, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import Loader from '../../components/Loader';


// Maps roll number → verification record
function buildVerificationMap(verifications) {
  const map = {};
  for (const v of verifications) {
    if (v.studentId) {
      // keep most recent per studentId
      if (!map[v.studentId]) map[v.studentId] = v;
    }
  }
  return map;
}

const STATUS_CONFIG = {
  draft: { label: 'Draft', bg: 'bg-orange-100 text-orange-700 border-orange-200', dot: 'bg-orange-400', Icon: FileText },
  submitted: { label: 'Submitted', bg: 'bg-blue-100 text-blue-700 border-blue-200', dot: 'bg-blue-400', Icon: Clock },
  approved: { label: 'Approved', bg: 'bg-green-100 text-green-700 border-green-200', dot: 'bg-green-400', Icon: CheckCircle },
  rejected: { label: 'Admin Rejected', bg: 'bg-red-100 text-red-700 border-red-200', dot: 'bg-red-400', Icon: XCircle },
  teacher_rejected: { label: 'Teacher Rejected', bg: 'bg-orange-100 text-orange-700 border-orange-200', dot: 'bg-orange-400', Icon: AlertCircle },
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
  const [vMap, setVMap] = useState({}); // rollNumber → verification
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [districtFilter, setDistrictFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('pending'); // all | pending | draft | submitted | rejected
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const navigate = useNavigate();

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch students + all verifications in parallel
      const [studentsRes, verificationsRes] = await Promise.all([
        api.get('/passed-students'),
        api.get('/verifications'),
      ]);
      const studentList = studentsRes.data.data || [];
      const verificationList = verificationsRes.data.verifications || [];
      setStudents(studentList);
      setVMap(buildVerificationMap(verificationList));
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  }, []);


  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  // Derive student-level status
  const getStatus = (student) => {
    const v = vMap[student.rollNumber?.toString()];
    return v ? v.status : 'pending';
  };

  const getVerification = (student) => vMap[student.rollNumber?.toString()];

  const uniqueDistricts = [...new Set(students.map(s => s.district).filter(Boolean))].sort();

  const filteredStudents = students.filter(s => {
    const matchesSearch = s.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.rollNumber?.toString().includes(searchTerm);
    const matchesDistrict = districtFilter ? s.district === districtFilter : true;
    const studentStatus = getStatus(s);
    const matchesStatus = statusFilter === 'all' ? true :
      statusFilter === 'rejected' ? (studentStatus === 'rejected' || studentStatus === 'teacher_rejected') :
        studentStatus === statusFilter;
    return matchesSearch && matchesDistrict && matchesStatus;
  });

  useEffect(() => { setCurrentPage(1); }, [searchTerm, districtFilter, statusFilter]);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredStudents.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);

  const STATUS_TABS = [
    { key: 'all', label: 'All', icon: LayoutGrid },
    { key: 'pending', label: 'Pending', icon: Clock },
    { key: 'draft', label: 'Draft', icon: FileText },
    { key: 'submitted', label: 'Submitted', icon: Send },
    { key: 'rejected', label: 'Rejected', icon: XCircle },
    { key: 'approved', label: 'Approved', icon: CheckCircle },
  ];

  const handleOpen = (student) => {
    const v = getVerification(student);
    if (v?._id) {
      // Open existing record
      navigate(`/verification/home/${v._id}`);
    } else {
      // New record pre-filled with student data
      navigate('/verification/home', { state: { studentData: student } });
    }
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
            {uniqueDistricts.map(d => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm">
          <Loader size="xl" />
          <span className="mt-4 text-gray-500 font-medium">Loading students...</span>
        </div>
      ) : filteredStudents.length === 0 ? (
        <div className="py-20 bg-white rounded-3xl border border-gray-100 shadow-sm text-center">
          <p className="text-gray-400 font-medium">No students found matching your criteria.</p>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <h2 className="text-sm sm:text-base font-semibold text-gray-700">Verification List</h2>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-semibold bg-brand-50 text-brand-600">
              {filteredStudents.length} records
            </span>
          </div>

          {/* ── Mobile Cards ── */}
          <div className="grid grid-cols-1 md:hidden gap-3">
            {currentItems.map(student => {
              const st = getStatus(student);
              return (
                <div
                  key={student._id}
                  onClick={() => handleOpen(student)}
                  className="bg-white border border-gray-100 rounded-xl p-3 shadow-sm hover:shadow-md hover:border-brand-200 cursor-pointer transition-all group relative overflow-hidden"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-lg bg-orange-50 border border-orange-100 flex items-center justify-center text-brand-600 group-hover:bg-brand-500 group-hover:text-white transition-colors">
                        <User size={20} />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900 group-hover:text-brand-600 transition-colors text-xs">
                          {student.studentName}
                        </h3>
                        <p className="text-[10px] font-bold text-brand-500 uppercase tracking-tighter">
                          ROLL: {student.rollNumber}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1.5">
                      <StatusBadge status={st} />
                      <ChevronRight className="text-gray-300 group-hover:text-brand-500 transition-colors" size={16} />
                    </div>
                  </div>
                  <div className="mt-2.5 space-y-1">
                    <div className="flex items-center gap-1.5 text-gray-500 text-[11px]">
                      <MapPin size={11} />
                      <span className="truncate">{student.villageTown || '—'}, {student.district || '—'}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-gray-500 text-[11px]">
                      <span className="font-semibold text-gray-600">Mobile:</span>
                      <span>{student.mobileNumber || '—'}</span>
                    </div>
                  </div>
                </div>
              );
            })}
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
                {currentItems.map((s, i) => {
                  const st = getStatus(s);
                  return (
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
                        <StatusBadge status={st} />
                      </td>
                      <td className="px-5 py-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <span className="text-xs font-semibold text-brand-500 opacity-0 group-hover:opacity-100 transition-all transform group-hover:translate-x-1 flex items-center gap-0.5">
                            {st === 'pending' ? 'Verify' : 'Open'} <ChevronRight size={14} />
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-5 px-1">
              <p className="text-xs text-gray-400 text-center sm:text-left">
                Showing {indexOfFirstItem + 1}–{Math.min(indexOfLastItem, filteredStudents.length)} of {filteredStudents.length} results
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
