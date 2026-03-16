import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const API_BASE = 'http://localhost:5000/api';
const PAGE_SIZE = 10;

export default function TeacherDashboard() {
  const [studentCount, setStudentCount] = useState(0);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  useEffect(() => { fetchStudents(); }, []);

  const fetchStudents = async () => {
    try {
      const res = await axios.get(`${API_BASE}/passed-students`);
      setStudents(res.data.data || []);
      setStudentCount(res.data.count || 0);
    } catch {
      setStudents([]);
      setStudentCount(0);
    } finally {
      setLoading(false);
    }
  };

  const totalPages = Math.ceil(students.length / PAGE_SIZE);
  const paginated = students.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-8 lg:px-10 py-4 sm:py-8 animate-fade-in-up">

      {/* Page Header */}
      <div className="mb-4 sm:mb-8">
        <h1 className="text-lg sm:text-2xl font-bold text-gray-800">Teacher Dashboard</h1>
        <p className="text-gray-500 mt-0.5 text-xs sm:text-sm">Manage and oversee passed student records</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-5 mb-5 sm:mb-10">
        <div className="bg-white rounded-xl border border-gray-200 px-4 py-3 sm:p-6">
          <p className="text-[10px] sm:text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1 sm:mb-3">Total Students</p>
          <p className="text-3xl sm:text-4xl font-bold text-brand-500">{loading ? '—' : studentCount}</p>
          <p className="text-gray-400 text-[10px] sm:text-xs mt-1 sm:mt-2">All records in database</p>
        </div>

        <Link to="/add-passed-students" className="bg-white rounded-xl border border-brand-200 px-4 py-3 sm:p-6 no-underline group hover:border-brand-400 hover:shadow-sm transition-all">
          <p className="text-[10px] sm:text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1 sm:mb-3">Quick Action</p>
          <p className="text-gray-800 font-bold text-sm sm:text-lg leading-snug">Add Passed Students</p>
          <p className="text-gray-400 text-[10px] sm:text-xs mt-1 sm:mt-2">Upload Excel or manual entry</p>
          <span className="inline-flex items-center gap-1 mt-2 sm:mt-4 px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg bg-brand-500 text-white text-xs sm:text-sm font-semibold group-hover:bg-brand-600 transition-colors">
            Add Students →
          </span>
        </Link>

        <div className="bg-white rounded-xl border border-gray-200 px-4 py-3 sm:p-6">
          <p className="text-[10px] sm:text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1 sm:mb-3">Status</p>
          <div className="flex items-center gap-2 mt-1">
            <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-green-400 inline-block"></span>
            <span className="text-gray-700 font-semibold text-xs sm:text-sm">System Active</span>
          </div>
          <div className="mt-2 sm:mt-4 flex items-center justify-between text-xs sm:text-sm">
            <span className="text-gray-400">Records</span>
            <span className="font-semibold text-gray-700">{loading ? '—' : studentCount}</span>
          </div>
        </div>
      </div>

      {/* Students List */}
      {loading ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-16 flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-brand-200 border-t-brand-500 rounded-full animate-spin"></div>
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
          <div className="sm:hidden space-y-1">
            {paginated.map((s) => (
              <div key={s._id} className="bg-white rounded-lg border border-gray-200 px-2.5 py-1.5">
                <div className="flex items-center justify-between mb-1">
                  <div>
                    <h4 className="font-semibold text-gray-800 text-[11px] leading-tight">{s.studentName}</h4>
                    <p className="text-[9px] text-gray-400">S/o {s.fatherName}</p>
                  </div>
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-semibold bg-brand-50 text-brand-600 shrink-0 ml-2">
                    {s.rollNumber}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-x-2 gap-y-0.5 text-[9px]">
                  {[
                    ['Mobile', s.mobileNumber],
                    ['Subject', s.subjectIn12th || '—'],
                    ['Village', s.villageTown || '—'],
                    ['District', s.district || '—'],
                    ['Marks', s.scholarshipExamMarks ?? 0],
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

          {/* Desktop Table */}
          <div className="hidden sm:block bg-white rounded-2xl border border-gray-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  {['S.No', 'Student Name', 'Father Name', 'Roll No', 'Mobile', 'Subject', 'Village/Town', 'District', 'Marks', 'Bus Track'].map(h => (
                    <th key={h} className="px-5 py-3.5 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {paginated.map((s, i) => (
                  <tr key={s._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-4 text-gray-400 text-xs">{(page - 1) * PAGE_SIZE + i + 1}</td>
                    <td className="px-5 py-4 font-semibold text-gray-800">{s.studentName}</td>
                    <td className="px-5 py-4 text-gray-500">{s.fatherName}</td>
                    <td className="px-5 py-4">
                      <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-brand-50 text-brand-600">{s.rollNumber}</span>
                    </td>
                    <td className="px-5 py-4 text-gray-500">{s.mobileNumber}</td>
                    <td className="px-5 py-4 text-gray-500">{s.subjectIn12th || '—'}</td>
                    <td className="px-5 py-4 text-gray-500">{s.villageTown || '—'}</td>
                    <td className="px-5 py-4 text-gray-500">{s.district || '—'}</td>
                    <td className="px-5 py-4">
                      <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-green-50 text-green-600">{s.scholarshipExamMarks ?? 0}</span>
                    </td>
                    <td className="px-5 py-4 text-gray-500">{s.busTrack || '—'}</td>
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
              <div className="flex flex-wrap items-center justify-center gap-1">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-3 py-1.5 rounded-lg text-sm font-medium border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >← Prev</button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
                  <button
                    key={n}
                    onClick={() => setPage(n)}
                    className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${n === page ? 'bg-brand-500 text-white' : 'border border-gray-200 text-gray-500 hover:bg-gray-50'
                      }`}
                  >{n}</button>
                ))}
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-3 py-1.5 rounded-lg text-sm font-medium border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >Next →</button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
