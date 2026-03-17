import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Search, MapPin, User, ChevronRight, Loader2 } from 'lucide-react';

const API_BASE = 'http://localhost:5000/api';

export default function VerificationListPage() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredStudents.map((student) => (
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
      )}
    </div>
  );
}
