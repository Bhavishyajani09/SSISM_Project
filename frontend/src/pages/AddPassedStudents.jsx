import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import * as XLSX from 'xlsx';

const API_BASE = 'http://localhost:5000/api';

const EMPTY_STUDENT = {
  studentName: '',
  fatherName: '',
  busTrack: '',
  mobileNumber: '',
  whatsappNumber: '',
  subjectIn12th: '',
  villageTown: '',
  district: '',
  rollNumber: '',
  scholarshipExamMarks: '',
};

const FIELDS = [
  { key: 'studentName', label: 'Student Name', type: 'text', required: true, placeholder: 'Full name' },
  { key: 'fatherName', label: 'Father Name', type: 'text', required: true, placeholder: "Father's full name" },
  { key: 'busTrack', label: 'Bus Track', type: 'text', required: false, placeholder: 'e.g. Route A' },
  { key: 'mobileNumber', label: 'Mobile Number', type: 'tel', required: true, placeholder: '10-digit number' },
  { key: 'whatsappNumber', label: 'WhatsApp Number', type: 'tel', required: false, placeholder: 'WhatsApp number' },
  { key: 'subjectIn12th', label: 'Subject in 12th', type: 'text', required: false, placeholder: 'e.g. Science, Commerce' },
  { key: 'villageTown', label: 'Village / Town', type: 'text', required: false, placeholder: 'Village or town name' },
  { key: 'district', label: 'District', type: 'text', required: false, placeholder: 'District name' },
  { key: 'rollNumber', label: 'Roll Number', type: 'text', required: false, placeholder: 'e.g. SCH2024001' },
  { key: 'scholarshipExamMarks', label: 'Scholarship Marks', type: 'number', required: false, placeholder: '0 - 50' },
];

const EXCEL_COL_MAP = {
  'serial number': 'serialNumber',
  'student name': 'studentName',
  'father name': 'fatherName',
  'bus track': 'busTrack',
  'mobile number': 'mobileNumber',
  'whatsapp number': 'whatsappNumber',
  'subject in 12th': 'subjectIn12th',
  'village / town': 'villageTown',
  'village/town': 'villageTown',
  'district': 'district',
  'roll number': 'rollNumber',
  'scholarship exam marks (out of 50)': 'scholarshipExamMarks',
  'scholarship exam marks': 'scholarshipExamMarks',
};

export default function AddPassedStudents() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [activeTab, setActiveTab] = useState('excel');
  const [loading, setLoading] = useState(false);

  // Excel state
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewData, setPreviewData] = useState([]);
  const [dragOver, setDragOver] = useState(false);

  // Manual entry state
  const [students, setStudents] = useState([{ ...EMPTY_STUDENT }]);

  // ────────────────────────────── EXCEL ──────────────────────────────

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  const processFile = (file) => {
    const isValid = file.name.endsWith('.xlsx') || file.name.endsWith('.xls');
    if (!isValid) {
      toast.error('Please upload an Excel file (.xlsx or .xls)');
      return;
    }

    setSelectedFile(file);

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const wb = XLSX.read(evt.target.result, { type: 'array' });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const data = XLSX.utils.sheet_to_json(ws, { defval: '' });

        if (data.length === 0) {
          toast.error('The Excel file is empty.');
          setSelectedFile(null);
          return;
        }

        const headers = Object.keys(data[0]).map(h => h.trim().toLowerCase());
        const requiredHeaders = ['student name', 'father name', 'mobile number', 'roll number'];
        const missing = requiredHeaders.filter(h => !headers.includes(h));

        if (missing.length > 0) {
          toast.error('Wrong format. Expected columns: Serial Number, Student Name, Father Name, Bus Track, Mobile Number, Whatsapp Number, Subject in 12th, Village / Town, District, Roll Number, Scholarship Exam Marks');
          setSelectedFile(null);
          return;
        }

        const mapped = data.map(row => {
          const student = {};
          Object.entries(row).forEach(([key, value]) => {
            const nk = key.trim().toLowerCase();
            const dbField = EXCEL_COL_MAP[nk];
            if (dbField) {
              student[dbField] = typeof value === 'string' ? value.trim() : value;
            }
          });
          return student;
        });

        setPreviewData(mapped);
        toast.success(`${mapped.length} record(s) found in file`);
      } catch {
        toast.error('Error reading file. Please check the format.');
        setSelectedFile(null);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleExcelUpload = async () => {
    if (!selectedFile) {
      toast.error('Please select a file first.');
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const res = await axios.post(`${API_BASE}/passed-students/upload-excel`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success(res.data.message);
      setSelectedFile(null);
      setPreviewData([]);
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const clearFile = () => {
    setSelectedFile(null);
    setPreviewData([]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // ────────────────────────────── MANUAL ──────────────────────────────

  const updateStudent = (index, field, value) => {
    setStudents(prev => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  const addStudentRow = () => {
    setStudents(prev => [...prev, { ...EMPTY_STUDENT }]);
  };

  const removeStudentRow = (index) => {
    if (students.length <= 1) return;
    setStudents(prev => prev.filter((_, i) => i !== index));
  };

  const handleManualSubmit = async () => {
    let firstError = null;

    for (let i = 0; i < students.length; i++) {
      const s = students[i];
      if (!s.studentName?.trim()) { firstError = `Student ${i + 1}: Student Name is required`; break; }
      if (!s.fatherName?.trim()) { firstError = `Student ${i + 1}: Father Name is required`; break; }
      if (!s.mobileNumber?.trim()) { firstError = `Student ${i + 1}: Mobile Number is required`; break; }
      if (s.mobileNumber?.trim() && !/^\d{10}$/.test(s.mobileNumber.trim())) { 
        firstError = `Student ${i + 1}: Mobile Number must be exactly 10 digits`; break; 
      }
      if (s.whatsappNumber?.trim() && !/^\d{10}$/.test(s.whatsappNumber.trim())) { 
        firstError = `Student ${i + 1}: WhatsApp Number must be exactly 10 digits`; break; 
      }
      if (s.scholarshipExamMarks !== '' && s.scholarshipExamMarks !== null && s.scholarshipExamMarks !== undefined) {
        const marks = Number(s.scholarshipExamMarks);
        if (isNaN(marks) || marks < 0 || marks > 50) {
          firstError = `Student ${i + 1}: Scholarship Marks must be between 0 and 50`; break;
        }
      }
    }

    if (firstError) {
      toast.error(firstError);
      return;
    }

    setLoading(true);
    try {
      const payload = students.map((s) => ({
        ...s,
        scholarshipExamMarks: s.scholarshipExamMarks ? Number(s.scholarshipExamMarks) : 0,
      }));

      const res = await axios.post(`${API_BASE}/passed-students/manual`, { students: payload });
      toast.success(res.data.message);
      setStudents([{ ...EMPTY_STUDENT }]);
      navigate('/dashboard');
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to add students.';
      toast.error(msg);
      if (err.response?.data?.errors) {
        err.response.data.errors.forEach(e => toast.error(e));
      }
    } finally {
      setLoading(false);
    }
  };

  // ────────────────────────────── RENDER ──────────────────────────────

  return (
    <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 py-8 animate-fade-in-up">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Add Passed Students</h1>
        <p className="text-gray-500 mt-1 text-sm">Upload an Excel file or add students one by one</p>
      </div>

      {/* Tab Switcher */}
      <div className="flex gap-2 p-1 bg-gray-100 rounded-xl mb-6 sm:mb-8 w-fit mx-auto border border-gray-200">
        <button
          onClick={() => setActiveTab('excel')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === 'excel' ? 'bg-white text-brand-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
        >
          Excel Upload
        </button>
        <button
          onClick={() => setActiveTab('manual')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === 'manual' ? 'bg-white text-brand-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
        >
          Manual Entry
        </button>
      </div>

      {/* ─── Excel Upload Tab ─── */}
      {activeTab === 'excel' && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 animate-slide-in">
          {/* Card Header */}
          <div className="flex items-center gap-3 mb-5">
            <div className="w-11 h-11 rounded-xl bg-green-50 flex items-center justify-center">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
              </div>
            <div>
              <h3 className="font-semibold text-gray-800 text-sm">Upload Excel File</h3>
              <p className="text-xs text-gray-400">
                Required: Student Name, Father Name, Mobile Number, Roll Number
              </p>
            </div>
          </div>

          {/* Dropzone */}
          {!selectedFile ? (
            <div
              className={`relative border-2 border-dashed rounded-2xl p-10 sm:p-16 text-center cursor-pointer transition-all duration-300 ${
                dragOver
                  ? 'border-brand-400 bg-brand-50/50'
                  : 'border-gray-200 bg-gray-50/50 hover:border-brand-300 hover:bg-brand-50/30'
              }`}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileSelect}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
              <div className="mb-3 flex justify-center opacity-60">
                <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" /></svg>
              </div>
              <p className="font-semibold text-gray-900 text-sm sm:text-base">
                Drop your Excel file here or click to browse
              </p>
              <p className="text-gray-400 text-xs sm:text-sm mt-1">
                Supports .xlsx and .xls files
              </p>
            </div>
          ) : (
            <>
              {/* File Info */}
              <div className="flex items-center gap-3 px-4 py-3 bg-brand-50 border border-brand-100 rounded-xl">
                <svg className="w-6 h-6 text-brand-500 shrink-0" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-brand-800 truncate">{selectedFile.name}</p>
                  <p className="text-xs text-brand-500">
                    {(selectedFile.size / 1024).toFixed(1)} KB • {previewData.length} record(s)
                  </p>
                </div>
                <button
                  onClick={clearFile}
                  className="p-1.5 rounded-lg hover:bg-brand-100 text-brand-600 transition-colors"
                  title="Remove file"
                >
                  ✕
                </button>
              </div>

              {/* Preview */}
              {previewData.length > 0 && (
                <div className="mt-5">
                  <h4 className="text-sm font-bold text-gray-500 mb-3">
                    Preview ({previewData.length} records)
                  </h4>

                  {/* Mobile Preview */}
                  <div className="block sm:hidden space-y-3">
                    {previewData.slice(0, 5).map((s, i) => (
                      <div key={i} className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-semibold text-gray-900 text-sm">{s.studentName}</p>
                            <p className="text-xs text-gray-400">S/o {s.fatherName}</p>
                          </div>
                          <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-brand-50 text-brand-700">
                            {s.rollNumber}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-1 mt-2 text-xs">
                          <span className="text-gray-500">{s.mobileNumber}</span>
                          <span className="text-gray-500">{s.scholarshipExamMarks ?? '—'}/50</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Desktop Preview */}
                  <div className="hidden sm:block rounded-xl border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-gray-50 border-b border-gray-100">
                          <tr>
                            <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase">S.No</th>
                            <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase">Student Name</th>
                            <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase">Father Name</th>
                            <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase">Roll No</th>
                            <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase">Mobile</th>
                            <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase">Marks</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                          {previewData.slice(0, 10).map((s, i) => (
                            <tr key={i} className="hover:bg-brand-50/30">
                              <td className="px-4 py-2.5 text-gray-500">{s.serialNumber || i + 1}</td>
                              <td className="px-4 py-2.5 font-semibold text-gray-900">{s.studentName}</td>
                              <td className="px-4 py-2.5 text-gray-600">{s.fatherName}</td>
                              <td className="px-4 py-2.5">
                                <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-brand-50 text-brand-700">
                                  {s.rollNumber}
                                </span>
                              </td>
                              <td className="px-4 py-2.5 text-gray-600">{s.mobileNumber}</td>
                              <td className="px-4 py-2.5 text-gray-600">{s.scholarshipExamMarks ?? '—'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {previewData.length > 10 && (
                    <p className="text-center text-xs text-gray-400 mt-2">
                      Showing 10 of {previewData.length} records
                    </p>
                  )}
                </div>
              )}

              {/* Upload Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 mt-5">
                <button
                  className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-brand-500 to-brand-600 text-white text-sm font-semibold shadow-md shadow-brand-200 hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={handleExcelUpload}
                  disabled={loading}
                >
                  {loading ? (
                    <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> Uploading...</>
                  ) : (
                    <><svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg> Upload {previewData.length} Student(s)</>
                  )}
                </button>
                <button
                  className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl border border-gray-200 text-gray-500 text-sm font-semibold hover:bg-gray-50 transition-all disabled:opacity-50"
                  onClick={clearFile}
                  disabled={loading}
                >
                  Cancel
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {/* ─── Manual Entry Tab ─── */}
      {activeTab === 'manual' && (
        <div className="animate-slide-in">
          {students.map((student, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl border border-gray-200 p-5 sm:p-7 mb-5 animate-slide-in"
            >
              {/* Entry Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 text-sm font-bold text-brand-600">
                  <span className="w-7 h-7 rounded-full bg-brand-50 flex items-center justify-center text-xs font-bold">
                    {idx + 1}
                  </span>
                  Student Entry
                </div>
                {students.length > 1 && (
                  <button
                    onClick={() => removeStudentRow(idx)}
                    className="w-8 h-8 rounded-full flex items-center justify-center text-red-400 hover:bg-red-50 hover:text-red-600 transition-all text-sm"
                    title="Remove"
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* Fields Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {FIELDS.map(f => (
                    <div key={f.key}>
                      <label className="block text-[10px] sm:text-xs font-bold text-gray-500 uppercase tracking-widest mb-1 ml-1">{f.label}</label>
                      <input
                        type={f.type}
                        value={student[f.key]}
                        onChange={e => updateStudent(idx, f.key, e.target.value)}
                        placeholder={f.placeholder}
                        required={f.required}
                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 text-xs sm:text-sm"
                      />
                    </div>
                  ))}
                </div>
            </div>
          ))}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 mt-5">
            <button
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-sm font-semibold hover:bg-gray-50 transition-all"
              onClick={addStudentRow}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
              Add Another Student
            </button>
            <button
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-brand-500 to-brand-600 text-white text-sm font-semibold shadow-md shadow-brand-200 hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={handleManualSubmit}
              disabled={loading}
            >
              {loading ? (
                <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> Saving...</>
              ) : (
                <><svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" /></svg> Save {students.length} Student(s)</>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
