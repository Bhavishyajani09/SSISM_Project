import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { ChevronRight } from 'lucide-react';
import Loader from '../components/Loader';


const API_BASE = 'http://localhost:5000/api';
const PAGE_SIZE = 10;

export default function TeacherDashboard() {
  const [studentCount, setStudentCount] = useState(0);
  const [students, setStudents] = useState([]);
  const [vMap, setVMap] = useState({}); // rollNumber → verification
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const navigate = useNavigate();

  useEffect(() => { fetchStudents(); }, []);

  const handleVerify = (student) => {
    navigate('/verification/home', { state: { studentData: student } });
  };

  const fetchStudents = async () => {
    try {
      const [studentsRes, verificationsRes] = await Promise.all([
        axios.get(`${API_BASE}/passed-students`),
        axios.get(`${API_BASE}/verifications`),
      ]);
      setStudents(studentsRes.data.data || []);
      setStudentCount(studentsRes.data.count || 0);

      // Build status mapping
      const mapping = {};
      (verificationsRes.data.verifications || []).forEach(v => {
        if (v.studentId) mapping[v.studentId] = v.status;
      });
      setVMap(mapping);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setStudents([]);
      setStudentCount(0);
    } finally {
      setLoading(false);
    }
  };

  const getStatus = (rollNumber) => vMap[rollNumber?.toString()] || 'pending';

  const STATUS_CFG = {
    pending:          { label: 'Pending',          bg: 'bg-gray-100 text-gray-500 border-gray-200',        dot: 'bg-gray-300' },
    draft:            { label: 'Draft',            bg: 'bg-orange-100 text-orange-700 border-orange-200',  dot: 'bg-orange-400' },
    submitted:        { label: 'Submitted',        bg: 'bg-blue-100 text-blue-700 border-blue-200',        dot: 'bg-blue-400' },
    approved:         { label: 'Approved',         bg: 'bg-green-100 text-green-700 border-green-200',     dot: 'bg-green-400' },
    rejected:         { label: 'Admin Rejected',   bg: 'bg-red-100 text-red-700 border-red-200',           dot: 'bg-red-400' },
    teacher_rejected: { label: 'Teacher Rejected', bg: 'bg-orange-100 text-orange-700 border-orange-200', dot: 'bg-orange-400' },
  };

  function StatusBadge({ status }) {
    const cfg = STATUS_CFG[status] || STATUS_CFG.pending;
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] sm:text-xs font-bold border ${cfg.bg}`}>
        <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
        {cfg.label}
      </span>
    );
  }

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this student?")) return;
    try {
      await axios.delete(`${API_BASE}/passed-students/${id}`);
      toast.success("Student deleted successfully.");
      fetchStudents();
    } catch (err) {
      toast.error("Failed to delete student.");
    }
  };

  const handleEdit = (student) => {
    setEditingStudent({ ...student });
    setEditModalOpen(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`${API_BASE}/passed-students/${editingStudent._id}`, editingStudent);
      toast.success("Student updated successfully.");
      setEditModalOpen(false);
      setEditingStudent(null);
      fetchStudents();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update student.");
    }
  };

  const totalPages = Math.ceil(students.length / PAGE_SIZE);
  const paginated = students.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <>
      <div className="max-w-7xl mx-auto px-3 sm:px-8 lg:px-10 py-4 sm:py-8 animate-fade-in-up">

      {/* Page Header */}
      <div className="mb-4 sm:mb-8">
        <h1 className="text-lg sm:text-2xl font-bold text-gray-800">Teacher Dashboard</h1>
        <p className="text-gray-500 mt-0.5 text-xs sm:text-sm">Manage and oversee passed student records</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-5 mb-6 sm:mb-10">
        <div className="bg-white rounded-xl border border-gray-200 px-3.5 py-3 sm:p-6 shadow-sm">
          <p className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-widest mb-1 sm:mb-3">Total Students</p>
          <p className="text-2xl sm:text-4xl font-black text-brand-500">{loading ? '—' : studentCount}</p>
          <p className="text-gray-400 text-[9px] sm:text-xs mt-1">All records in database</p>
        </div>

        <Link to="/add-passed-students" className="bg-white rounded-xl border border-brand-200 px-3.5 py-3 sm:p-6 no-underline group hover:border-brand-400 hover:shadow-sm transition-all shadow-sm">
          <p className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-widest mb-1 sm:mb-3">Quick Action</p>
          <p className="text-gray-800 font-bold text-sm sm:text-lg leading-snug">Add Passed Students</p>
          <span className="inline-flex items-center gap-1 mt-2.5 px-3 py-1.5 rounded-lg bg-brand-500 text-white text-[11px] sm:text-sm font-bold group-hover:bg-brand-600 transition-colors shadow-sm shadow-brand-100">
            Add Students →
          </span>
        </Link>

        <div className="bg-white rounded-xl border border-gray-200 px-3.5 py-3 sm:p-6 shadow-sm">
          <p className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-widest mb-1 sm:mb-3">Status</p>
          <div className="flex items-center gap-2 mt-1">
            <span className="w-2 h-2 rounded-full bg-green-400 inline-block"></span>
            <span className="text-gray-700 font-bold text-sm sm:text-lg">System Live</span>
          </div>
          <p className="text-gray-400 text-[9px] sm:text-xs mt-1">Ready for verification</p>
        </div>
      </div>

      {/* Students List */}
      {loading ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-16 flex flex-col items-center gap-3">
          <Loader size="lg" />
          <span className="text-gray-400 text-sm">Loading students...</span>
        </div>
      ) : students.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-16 text-center">
          <div className="mb-4 flex justify-center opacity-30">
            <svg className="w-14 h-14 text-gray-400" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
          </div>
          <h3 className="text-base font-semibold text-gray-700 mb-1">No Students Yet</h3>
          <p className="text-gray-400 text-sm mb-6">Add your first batch of passed students to see them here.</p>
          <Link to="/add-passed-students"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-500 text-white text-sm font-semibold hover:bg-brand-600 transition-colors">
            Add Students
          </Link>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between mb-3 sm:mb-5">
            <h2 className="text-sm sm:text-base font-semibold text-gray-700">All Passed Students</h2>
            <span className="px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-semibold bg-brand-50 text-brand-600">
              {students.length} records
            </span>
          </div>

          {/* Mobile Cards */}
          <div className="grid grid-cols-1 gap-3 sm:hidden mb-10">
            {paginated.map((s, i) => (
              <div key={s._id} onClick={() => handleVerify(s)} className="bg-white border border-gray-100 rounded-xl p-3.5 shadow-sm hover:shadow-md transition-all active:scale-[0.98] relative overflow-hidden group cursor-pointer">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-lg bg-brand-50 flex items-center justify-center text-brand-500 font-bold group-hover:bg-brand-500 group-hover:text-white transition-colors text-xs">
                      {i + 1}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-900 leading-tight">{s.studentName}</p>
                      <p className="text-[10px] font-bold text-brand-500 tracking-tighter uppercase mt-0.5">ROLL: {s.rollNumber}</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1.5">
                    <StatusBadge status={getStatus(s.rollNumber)} />
                    <ChevronRight size={14} className="text-gray-300 group-hover:text-brand-500 transition-transform group-hover:translate-x-0.5" />
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
                <div className="flex items-center justify-end gap-2 mt-3 pt-3 border-t border-gray-100">
                   <button onClick={(e) => { e.stopPropagation(); handleEdit(s); }} className="p-1.5 text-blue-500 hover:bg-blue-50 rounded transition-colors" title="Edit">
                     <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                   </button>
                   <button onClick={(e) => { e.stopPropagation(); handleDelete(s._id); }} className="p-1.5 text-red-500 hover:bg-red-50 rounded transition-colors" title="Delete">
                     <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                   </button>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Table */}
          <div className="hidden sm:block bg-white rounded-2xl border border-gray-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  {['S.No', 'Student Name', 'Father Name', 'Roll No', 'Mobile', 'Marks', 'Status', 'Actions'].map(h => (
                    <th key={h} className="px-5 py-3.5 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {paginated.map((s, i) => (
                  <tr key={s._id} onClick={() => handleVerify(s)} className="hover:bg-gray-50 transition-colors cursor-pointer group">
                    <td className="px-5 py-4 text-gray-400 text-xs">{(page - 1) * PAGE_SIZE + i + 1}</td>
                    <td className="px-5 py-4 font-semibold text-gray-800">{s.studentName}</td>
                    <td className="px-5 py-4 text-gray-500">{s.fatherName}</td>
                    <td className="px-5 py-4">
                      <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-brand-50 text-brand-600">{s.rollNumber}</span>
                    </td>
                    <td className="px-5 py-4 text-gray-500">{s.mobileNumber}</td>
                    <td className="px-5 py-4">
                      <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-green-50 text-green-600">{s.scholarshipExamMarks ?? 0}</span>
                    </td>
                    <td className="px-5 py-4">
                      <StatusBadge status={getStatus(s.rollNumber)} />
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">

                        <button onClick={(e) => { e.stopPropagation(); handleEdit(s); }} className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors" title="Edit">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); handleDelete(s._id); }} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Delete">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
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
                Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, students.length)} of {students.length} students
              </p>
              <div className="flex flex-wrap items-center justify-center gap-2">
                <button 
                  onClick={() => setPage(p => Math.max(1, p - 1))} 
                  disabled={page === 1}
                  className="px-4 py-2 rounded-xl text-sm font-bold border border-gray-200 text-gray-600 bg-white hover:bg-gray-50 disabled:opacity-40 shadow-sm active:scale-95 transition-all"
                >← Previous</button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
                  <button 
                    key={n} 
                    onClick={() => setPage(n)}
                    className={`w-10 h-10 rounded-xl text-sm font-bold shadow-sm transition-all active:scale-90 ${n === page ? 'bg-brand-500 text-white ring-2 ring-brand-500/20' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                  >{n}</button>
                ))}
                <button 
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))} 
                  disabled={page === totalPages}
                  className="px-4 py-2 rounded-xl text-sm font-bold border border-gray-200 text-gray-600 bg-white hover:bg-gray-50 disabled:opacity-40 shadow-sm active:scale-95 transition-all"
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
              <h3 className="font-bold text-gray-800 text-sm sm:text-base">Edit Student</h3>
              <button type="button" onClick={() => setEditModalOpen(false)} className="text-gray-400 hover:text-gray-600 focus:outline-none">✕</button>
            </div>
            <div className="p-5 sm:p-6 overflow-y-auto flex-1">
              <form onSubmit={handleUpdate} id="edit-form">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label className="text-[10px] sm:text-xs font-semibold text-gray-500">Student Name <span className="text-red-400">*</span></label>
                    <input required value={editingStudent.studentName} onChange={(e) => setEditingStudent({...editingStudent, studentName: e.target.value})} className="mt-1 w-full px-2.5 py-2 sm:px-3 sm:py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs sm:text-sm outline-none focus:border-brand-400" />
                  </div>
                  <div>
                    <label className="text-[10px] sm:text-xs font-semibold text-gray-500">Father Name <span className="text-red-400">*</span></label>
                    <input required value={editingStudent.fatherName} onChange={(e) => setEditingStudent({...editingStudent, fatherName: e.target.value})} className="mt-1 w-full px-2.5 py-2 sm:px-3 sm:py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs sm:text-sm outline-none focus:border-brand-400" />
                  </div>
                  <div>
                    <label className="text-[10px] sm:text-xs font-semibold text-gray-500">Bus Track</label>
                    <input value={editingStudent.busTrack} onChange={(e) => setEditingStudent({...editingStudent, busTrack: e.target.value})} className="mt-1 w-full px-2.5 py-2 sm:px-3 sm:py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs sm:text-sm outline-none focus:border-brand-400" />
                  </div>
                  <div>
                    <label className="text-[10px] sm:text-xs font-semibold text-gray-500">Mobile Number <span className="text-red-400">*</span></label>
                    <input required value={editingStudent.mobileNumber} onChange={(e) => setEditingStudent({...editingStudent, mobileNumber: e.target.value})} className="mt-1 w-full px-2.5 py-2 sm:px-3 sm:py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs sm:text-sm outline-none focus:border-brand-400" />
                  </div>
                  <div>
                    <label className="text-[10px] sm:text-xs font-semibold text-gray-500">WhatsApp Number</label>
                    <input value={editingStudent.whatsappNumber} onChange={(e) => setEditingStudent({...editingStudent, whatsappNumber: e.target.value})} className="mt-1 w-full px-2.5 py-2 sm:px-3 sm:py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs sm:text-sm outline-none focus:border-brand-400" />
                  </div>
                  <div>
                    <label className="text-[10px] sm:text-xs font-semibold text-gray-500">Subject in 12th</label>
                    <input value={editingStudent.subjectIn12th} onChange={(e) => setEditingStudent({...editingStudent, subjectIn12th: e.target.value})} className="mt-1 w-full px-2.5 py-2 sm:px-3 sm:py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs sm:text-sm outline-none focus:border-brand-400" />
                  </div>
                  <div>
                    <label className="text-[10px] sm:text-xs font-semibold text-gray-500">Village / Town</label>
                    <input value={editingStudent.villageTown} onChange={(e) => setEditingStudent({...editingStudent, villageTown: e.target.value})} className="mt-1 w-full px-2.5 py-2 sm:px-3 sm:py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs sm:text-sm outline-none focus:border-brand-400" />
                  </div>
                  <div>
                    <label className="text-[10px] sm:text-xs font-semibold text-gray-500">District</label>
                    <input value={editingStudent.district} onChange={(e) => setEditingStudent({...editingStudent, district: e.target.value})} className="mt-1 w-full px-2.5 py-2 sm:px-3 sm:py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs sm:text-sm outline-none focus:border-brand-400" />
                  </div>
                  <div>
                    <label className="text-[10px] sm:text-xs font-semibold text-gray-500">Roll Number</label>
                    <input value={editingStudent.rollNumber} onChange={(e) => setEditingStudent({...editingStudent, rollNumber: e.target.value})} className="mt-1 w-full px-2.5 py-2 sm:px-3 sm:py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs sm:text-sm outline-none focus:border-brand-400" />
                  </div>
                  <div>
                    <label className="text-[10px] sm:text-xs font-semibold text-gray-500">Scholarship Marks</label>
                    <input type="number" min="0" max="50" value={editingStudent.scholarshipExamMarks} onChange={(e) => setEditingStudent({...editingStudent, scholarshipExamMarks: e.target.value})} className="mt-1 w-full px-2.5 py-2 sm:px-3 sm:py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs sm:text-sm outline-none focus:border-brand-400" />
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
