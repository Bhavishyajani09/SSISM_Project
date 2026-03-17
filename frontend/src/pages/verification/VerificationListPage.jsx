import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Search, MapPin, User, ChevronRight, Loader2 } from 'lucide-react';

const API_BASE = 'http://localhost:5000/api';

export default function VerificationListPage() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const navigate = useNavigate();

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const res = await axios.get(`${API_BASE}/passed-students`);
      setStudents(res.data.data || []);
    } catch (err) {
      console.error('Error fetching students:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredStudents = students.filter(s =>
    s.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.rollNumber.toString().includes(searchTerm)
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredStudents.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);

  const handleStartVerification = (student) => {
    // Navigate to form with student data in state
    navigate('/verification/home', { state: { studentData: student } });
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Home Verification</h1>
        <p className="text-gray-500 mt-1">Select a student to start their home verification process.</p>
      </div>

      {/* Search Bar */}
      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
        <input
          type="text"
          placeholder="Search by name or roll number..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all text-gray-700"
        />
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm">
          <Loader2 className="w-10 h-10 text-brand-500 animate-spin transition-all" />
          <span className="mt-4 text-gray-500 font-medium">Loading students...</span>
        </div>
      ) : filteredStudents.length === 0 ? (
        <div className="py-20 bg-white rounded-3xl border border-gray-100 shadow-sm text-center">
          <p className="text-gray-400 font-medium">No students found matching your search.</p>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between mb-3 sm:mb-5">
            <h2 className="text-sm sm:text-base font-semibold text-gray-700">Verification List</h2>
            <span className="px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-semibold bg-brand-50 text-brand-600">
              {filteredStudents.length} records
            </span>
          </div>

          {/* Mobile Cards */}
          <div className="grid grid-cols-1 md:hidden gap-4">
            {currentItems.map((student) => (
              <div
                key={student._id}
                onClick={() => handleStartVerification(student)}
                className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-brand-200 cursor-pointer transition-all group relative overflow-hidden"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-center text-brand-600 group-hover:bg-brand-500 group-hover:text-white transition-colors">
                      <User size={24} />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 group-hover:text-brand-600 transition-colors">
                        {student.studentName}
                      </h3>
                      <p className="text-xs font-semibold text-brand-500 uppercase tracking-wider">
                        Roll: {student.rollNumber}
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="text-gray-300 group-hover:text-brand-500 transition-colors" size={20} />
                </div>

                <div className="mt-4 space-y-2">
                  <div className="flex items-center gap-2 text-gray-500 text-sm">
                    <MapPin size={14} />
                    <span className="truncate">{student.villageTown || '—'}, {student.district || '—'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-500 text-sm">
                    <span className="font-semibold text-gray-700">Mobile:</span>
                    <span>{student.mobileNumber || '—'}</span>
                  </div>
                </div>

                {/* Decorative background element */}
                <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-brand-50 rounded-full opacity-20 group-hover:scale-150 transition-transform duration-500" />
              </div>
            ))}
          </div>

          {/* Desktop Table (Hidden on small screens) */}
          <div className="hidden sm:block bg-white rounded-2xl border border-gray-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  {['S.No', 'Student Name', 'Father Name', 'Roll No', 'Location', 'Mobile', 'Action'].map(h => (
                    <th key={h} className="px-5 py-3.5 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {currentItems.map((s, i) => (
                  <tr key={s._id} onClick={() => handleStartVerification(s)} className="hover:bg-gray-50 transition-colors cursor-pointer group">
                    <td className="px-5 py-4 text-gray-400 text-xs text-left">{(currentPage - 1) * itemsPerPage + i + 1}</td>
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
                    <td className="px-5 py-4 text-gray-400">
                      <span className="text-xs text-brand-500 font-semibold flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        Start <ChevronRight size={14} />
                      </span>
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
                Showing {(currentPage - 1) * itemsPerPage + 1}–{Math.min(currentPage * itemsPerPage, filteredStudents.length)} of {filteredStudents.length} results
              </p>
              <div className="flex flex-wrap items-center justify-center gap-1">
                <button
                  onClick={(e) => { e.stopPropagation(); setCurrentPage(p => Math.max(1, p - 1))}}
                  disabled={currentPage === 1}
                  className="px-3 py-1.5 rounded-lg text-sm font-medium border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >← Prev</button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
                  <button
                    key={n}
                    onClick={(e) => { e.stopPropagation(); setCurrentPage(n)}}
                    className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${n === currentPage ? 'bg-brand-500 text-white' : 'border border-gray-200 text-gray-500 hover:bg-gray-50'
                      }`}
                  >{n}</button>
                ))}
                <button
                  onClick={(e) => { e.stopPropagation(); setCurrentPage(p => Math.min(totalPages, p + 1))}}
                  disabled={currentPage === totalPages}
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
