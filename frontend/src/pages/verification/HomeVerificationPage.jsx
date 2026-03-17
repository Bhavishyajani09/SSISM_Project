import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  User, BookOpen, Heart, Users, Home, Tractor, Camera,
  FileText, ChevronDown, ChevronUp, Plus, Trash2, MapPin,
  Clock, CheckCircle, XCircle, Save, Send, AlertCircle, Trophy
} from 'lucide-react';
import ssismLogo from '../../assets/SSISM_Logo.png';

// Helper: Collapsible Card
const SectionCard = ({ icon: Icon, title, color = 'orange', children, defaultOpen = true }) => {
  const [open, setOpen] = useState(defaultOpen);
  const colorMap = {
    orange: 'bg-orange-50 border-orange-200 text-orange-700',
    blue: 'bg-blue-50 border-blue-200 text-blue-700',
    green: 'bg-green-50 border-green-200 text-green-700',
    purple: 'bg-purple-50 border-purple-200 text-purple-700',
    rose: 'bg-rose-50 border-rose-200 text-rose-700',
    teal: 'bg-teal-50 border-teal-200 text-teal-700',
    amber: 'bg-amber-50 border-amber-200 text-amber-700',
    indigo: 'bg-indigo-50 border-indigo-200 text-indigo-700',
  };
  const headerColor = colorMap[color] || colorMap.orange;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className={`w-full flex items-center justify-between px-5 py-4 ${headerColor} border-b transition-all`}
      >
        <div className="flex items-center gap-3">
          <Icon size={20} />
          <h2 className="font-bold text-base sm:text-lg">{title}</h2>
        </div>
        {open ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
      </button>
      {open && <div className="p-5 sm:p-6 space-y-4">{children}</div>}
    </div>
  );
};

// Helper: Form Field
const Field = ({ label, children, required }) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-sm font-semibold text-slate-700">
      {label}{required && <span className="text-red-500 ml-1">*</span>}
    </label>
    {children}
  </div>
);

const inputCls = "w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400/30 focus:border-orange-400 transition-all";
const selectCls = inputCls;
const textareaCls = inputCls + " resize-none";

// Photo Preview Item
const PhotoUpload = ({ label, id, onUpload, previewUrl, studentId }) => {
  const [localPreview, setLocalPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const ref = useRef();

  const displayUrl = localPreview || previewUrl;

  const handleChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setLocalPreview(URL.createObjectURL(file));
      setLoading(true);
      const formData = new FormData();
      formData.append('image', file);
      if (studentId) formData.append('studentId', studentId);
      
      try {
        const res = await fetch('http://localhost:5000/api/upload', {
          method: 'POST',
          body: formData
        });
        const data = await res.json();
        if (data.url && onUpload) {
          onUpload(data.url);
        }
      } catch (err) {
        console.error('Upload error', err);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <span className="text-sm font-medium text-slate-600">{label}</span>
      <div
        onClick={() => ref.current.click()}
        className="relative cursor-pointer border-2 border-dashed border-orange-300 rounded-xl overflow-hidden bg-orange-50 hover:bg-orange-100 transition-all flex items-center justify-center h-36"
      >
        {loading ? (
          <span className="text-xs text-orange-500 font-medium">Uploading...</span>
        ) : displayUrl ? (
          <img src={displayUrl} alt="preview" className="w-full h-full object-cover" />
        ) : (
          <div className="flex flex-col items-center gap-2 text-orange-400">
            <Camera size={28} />
            <span className="text-xs font-medium">Tap to upload</span>
          </div>
        )}
      </div>
      <input ref={ref} id={id} type="file" accept="image/*" className="hidden" onChange={handleChange} />
    </div>
  );
};

// Signature Upload
const SignatureField = ({ label, onUpload, previewUrl, studentId }) => {
  const [localPreview, setLocalPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const ref = useRef();

  const displayUrl = localPreview || previewUrl;

  const handleChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setLocalPreview(URL.createObjectURL(file));
      setLoading(true);
      const formData = new FormData();
      formData.append('image', file);
      if (studentId) formData.append('studentId', studentId);
      
      try {
        const res = await fetch('http://localhost:5000/api/upload', {
          method: 'POST',
          body: formData
        });
        const data = await res.json();
        if (data.url && onUpload) {
          onUpload(data.url);
        }
      } catch (err) {
        console.error('Upload error', err);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <span className="text-sm font-semibold text-slate-700">{label}</span>
      <div
        onClick={() => ref.current.click()}
        className="cursor-pointer border-2 border-dashed border-slate-300 rounded-xl bg-slate-50 hover:bg-slate-100 h-24 flex items-center justify-center"
      >
        {loading ? (
          <span className="text-xs text-slate-500 font-medium">Uploading...</span>
        ) : displayUrl
          ? <img src={displayUrl} alt="signature" className="h-20 object-contain" />
          : <span className="text-xs text-slate-400 font-medium">Tap to upload signature</span>
        }
      </div>
      <input ref={ref} type="file" accept="image/*" className="hidden" onChange={handleChange} />
    </div>
  );
};

const API_URL = 'http://localhost:5000/api/verifications';

const HomeVerificationPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    scholarshipType: '', studentId: '', studentName: '', mobile: '',
    verificationDate: new Date().toISOString().split('T')[0], verifierName: '',
    marks10: '', marks11: '', marks12: '', collegeExamMarks: '', homeVisitMarks: '',
    fatherName: '', schoolName: '', classFees12: '', subject12: '', address: '',
    village: '', tehsil: '', district: '', pincode: '', track: '', futureGoal: '',
    attendance12: '', hasIllness: 'no', illnessName: '', symptoms: '',
    totalIncome: '', incomeSources: [], incomeOther: '', challenges: '',
    houseType: '', numRooms: '', houseBuilder: '', houseSchemeName: '',
    appliances: [], numVehicles: '', vehicleTypes: [],
    totalLand: '', landUnit: 'Acre', landOwnership: '', landType: '', irrigationSource: '',
    livestock: [], supervisorRemarks: '',
    hasAchievements: 'no', achievements: '',
    photos: [],
    studentSignatureUrl: '',
    fatherSignatureUrl: '',
    motherSignatureUrl: '',
    supervisorSignatureUrl: '',
  });

  const [familyMembers, setFamilyMembers] = useState([
    { name: '', relation: '', occupation: '', income: '', mobile: '' }
  ]);
  const [status, setStatus] = useState(null);
  const [verificationId, setVerificationId] = useState(null);
  const [isApiLoading, setIsApiLoading] = useState(false);
  const [apiMsg, setApiMsg] = useState('');
  const [gpsCoords, setGpsCoords] = useState(null);

  // Load data if ID exists
  useEffect(() => {
    if (id) {
      setVerificationId(id);
      fetch(`${API_URL}/${id}`)
        .then(res => res.json())
        .then(data => {
          if (data.verification) {
            const { familyMembers: fm, ...formData } = data.verification;
            // Clean up Mongo metadata
            delete formData._id;
            delete formData.__v;
            delete formData.createdAt;
            delete formData.updatedAt;

            setForm(prev => ({ ...prev, ...formData }));
            if (fm) setFamilyMembers(fm);
            setStatus(data.verification.status);
            if (data.verification.gpsLat && data.verification.gpsLng) {
              setGpsCoords({ lat: data.verification.gpsLat, lng: data.verification.gpsLng });
            }
          }
        })
        .catch(err => setApiMsg('Error loading draft: ' + err.message));
    }
  }, [id]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === 'checkbox') {
      setForm(prev => {
        const arr = prev[name] ? [...prev[name]] : [];
        return { ...prev, [name]: checked ? [...arr, value] : arr.filter(v => v !== value) };
      });
    } else {
      setForm(prev => ({ ...prev, [name]: value }));
    }
  };

  const addFamilyMember = () => setFamilyMembers(prev => [...prev, { name: '', relation: '', occupation: '', income: '', mobile: '' }]);
  const removeFamilyMember = (i) => setFamilyMembers(prev => prev.filter((_, idx) => idx !== i));
  const updateMember = (i, field, value) => setFamilyMembers(prev => prev.map((m, idx) => idx === i ? { ...m, [field]: value } : m));

  const captureGPS = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(pos => {
        setGpsCoords({ lat: pos.coords.latitude.toFixed(6), lng: pos.coords.longitude.toFixed(6) });
      });
    }
  };

  const handlePhotoUpload = (label, url) => {
    setForm(prev => {
      const photos = prev.photos || [];
      const existingIdx = photos.findIndex(p => p.label === label);
      if (existingIdx >= 0) {
        const updated = [...photos];
        updated[existingIdx] = { label, url };
        return { ...prev, photos: updated };
      }
      return { ...prev, photos: [...photos, { label, url }] };
    });
  };

  const getPhotoPreview = (label) => {
    const photo = form.photos?.find(p => p.label === label);
    return photo ? photo.url : null;
  };

  // Build the payload to send to backend
  const buildPayload = () => ({
    ...form,
    familyMembers,
    totalAnnualIncome: form.totalIncome,
    familyChallenges: form.challenges,
    hasIllness: form.hasIllness === 'yes',
    achievements: form.hasAchievements === 'yes' ? form.achievements : '',
    gpsLat: gpsCoords?.lat,
    gpsLng: gpsCoords?.lng,
  });

  const handleSave = async () => {
    setIsApiLoading(true); setApiMsg('');
    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(buildPayload()),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Save failed');
      setVerificationId(data.verification._id);
      setStatus('saved');
      setApiMsg('Draft saved successfully!');
      // Update URL without refreshing if it's a new record
      if (!id) {
        navigate(`/verification/home/${data.verification._id}`, { replace: true });
      }
    } catch (err) {
      setApiMsg('Error: ' + err.message);
    } finally { setIsApiLoading(false); }
  };

  const handleSubmit = async () => {
    setIsApiLoading(true); setApiMsg('');
    try {
      let res, data;
      if (verificationId) {
        res = await fetch(`${API_URL}/${verificationId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...buildPayload(), status: 'submitted' }),
        });
      } else {
        res = await fetch(API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...buildPayload(), status: 'submitted' }),
        });
      }
      data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Submit failed');
      setVerificationId(data.verification._id);
      setStatus('submitted');
      setApiMsg('Verification submitted successfully!');
      if (!id) {
        navigate(`/verification/home/${data.verification._id}`, { replace: true });
      }
    } catch (err) {
      setApiMsg('Error: ' + err.message);
    } finally { setIsApiLoading(false); }
  };

  const handleApprove = async () => {
    if (!verificationId) return setApiMsg('Please save or submit first.');
    setIsApiLoading(true);
    try {
      const res = await fetch(`${API_URL}/${verificationId}/approve`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ remarks: form.supervisorRemarks }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setStatus('approved');
      setApiMsg('Verification approved!');
    } catch (err) {
      setApiMsg('Error: ' + err.message);
    } finally { setIsApiLoading(false); }
  };

  const handleReject = async () => {
    if (!verificationId) return setApiMsg('Please save or submit first.');
    setIsApiLoading(true);
    try {
      const res = await fetch(`${API_URL}/${verificationId}/reject`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ remarks: form.supervisorRemarks }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setStatus('rejected');
      setApiMsg('Verification rejected.');
    } catch (err) {
      setApiMsg('Error: ' + err.message);
    } finally { setIsApiLoading(false); }
  };

  const totalMarks = [form.marks10, form.marks11, form.marks12, form.collegeExamMarks, form.homeVisitMarks]
    .reduce((sum, v) => sum + (parseFloat(v) || 0), 0).toFixed(2);

  const CheckItem = ({ name, value, label }) => (
    <label className="flex items-center gap-2 cursor-pointer text-sm text-slate-700">
      <input type="checkbox" name={name} value={value}
        checked={(form[name] || []).includes(value)}
        onChange={handleChange}
        className="w-4 h-4 accent-blue-600" />
      {label}
    </label>
  );

  const RadioItem = ({ name, value, label }) => (
    <label className="flex items-center gap-2 cursor-pointer text-sm text-slate-700">
      <input type="radio" name={name} value={value}
        checked={form[name] === value}
        onChange={handleChange}
        className="w-4 h-4 accent-blue-600" />
      {label}
    </label>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-slate-50 font-sans">

      {/* Slim Sticky Navbar */}
      <div className="sticky top-0 z-30 bg-white border-b border-orange-100 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-2.5 flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-orange-500 flex items-center justify-center overflow-hidden border-2 border-orange-400 shrink-0">
            <img src={ssismLogo} alt="SSISM" className="w-full h-full object-cover" />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-sm font-bold text-slate-800 leading-tight truncate">Home Visit Verification</h1>
            <p className="text-xs text-slate-400 leading-tight">SSISM • Scholarship Portal</p>
          </div>
          {status && (
            <span className={`text-xs font-bold px-2.5 py-1 rounded-full shrink-0 ${status === 'approved' ? 'bg-green-100 text-green-700' :
                status === 'rejected' ? 'bg-red-100 text-red-700' :
                  status === 'submitted' ? 'bg-blue-100 text-blue-700' :
                    'bg-orange-100 text-orange-700'
              }`}>
              {status === 'saved' || status === 'draft' ? '✓ Draft' : status === 'submitted' ? '✓ Submitted' : status === 'approved' ? '✓ Approved' : '✗ Rejected'}
            </span>
          )}
        </div>
      </div>

      {/* Form Sections */}
      <div className="max-w-4xl mx-auto px-4 py-5 space-y-5 pb-32">

        {/* GPS + Timestamp info bar */}
        <div className="flex flex-wrap gap-2 text-xs text-slate-500">
          <button onClick={captureGPS}
            className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-lg px-3 py-1.5 hover:bg-orange-50 hover:text-orange-600 transition-all font-medium">
            <MapPin size={12} className="text-orange-400" />
            {gpsCoords ? `${gpsCoords.lat}, ${gpsCoords.lng}` : 'Capture GPS Location'}
          </button>
          <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-lg px-3 py-1.5 font-medium">
            <Clock size={12} className="text-slate-400" />
            {new Date().toLocaleString('en-IN')}
          </div>
        </div>

        {/* 1. STUDENT INFORMATION */}
        <SectionCard icon={User} title="Student Information" color="orange">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Scholarship Type" required>
              <select name="scholarshipType" value={form.scholarshipType} onChange={handleChange} className={selectCls}>
                <option value="">Select Type</option>
                <option value="SNS">SNS – Singaji Nivedita Scholarship</option>
                <option value="SVS">SVS – Singaji Vivekananda Scholarship</option>
              </select>
            </Field>
            <Field label="Student ID" required>
              <input name="studentId" value={form.studentId} onChange={handleChange} placeholder="e.g. SSISM-2024-001" className={inputCls} />
            </Field>
            <Field label="Student Name" required>
              <input name="studentName" value={form.studentName} onChange={handleChange} placeholder="Full name" className={inputCls} />
            </Field>
            <Field label="Mobile Number" required>
              <input name="mobile" value={form.mobile} onChange={handleChange} placeholder="10-digit number" className={inputCls} type="tel" />
            </Field>
            <Field label="Verification Date" required>
              <input name="verificationDate" value={form.verificationDate} onChange={handleChange} type="date" className={inputCls} />
            </Field>
            <Field label="Verifier Name" required>
              <input name="verifierName" value={form.verifierName} onChange={handleChange} placeholder="Officer / Teacher name" className={inputCls} />
            </Field>
          </div>
        </SectionCard>

        {/* 2. ACADEMIC DETAILS */}
        <SectionCard icon={BookOpen} title="Academic Details" color="blue">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {[
              { label: '10th Percentage', name: 'marks10' },
              { label: '11th Percentage', name: 'marks11' },
              { label: '12th Percentage', name: 'marks12' },
              { label: 'College Exam Marks', name: 'collegeExamMarks' },
              { label: 'Home Visit Marks', name: 'homeVisitMarks' },
            ].map(f => (
              <Field key={f.name} label={f.label}>
                <input name={f.name} value={form[f.name]} onChange={handleChange} type="number" min="0" max="100" placeholder="0" className={inputCls} />
              </Field>
            ))}
            <Field label="Total Marks">
              <div className="px-4 py-2.5 rounded-xl border-2 border-orange-300 bg-orange-50 text-orange-700 font-bold text-sm">
                {totalMarks}
              </div>
            </Field>
          </div>
        </SectionCard>

        {/* 3. PERSONAL INFORMATION */}
        <SectionCard icon={User} title="Personal Information" color="purple">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Father Name" required>
              <input name="fatherName" value={form.fatherName} onChange={handleChange} placeholder="Father's full name" className={inputCls} />
            </Field>
            <Field label="12th School Name">
              <input name="schoolName" value={form.schoolName} onChange={handleChange} placeholder="School name" className={inputCls} />
            </Field>
            <Field label="12th Class Fees (₹)">
              <input name="classFees12" value={form.classFees12} onChange={handleChange} type="number" placeholder="Annual fees" className={inputCls} />
            </Field>
            <Field label="Subject in 12th">
              <input name="subject12" value={form.subject12} onChange={handleChange} placeholder="e.g. Science, Commerce" className={inputCls} />
            </Field>
            <div className="sm:col-span-2">
              <Field label="Full Address" required>
                <textarea name="address" value={form.address} onChange={handleChange} rows={2} placeholder="House No., Street, Area..." className={textareaCls} />
              </Field>
            </div>
            <Field label="Village">
              <input name="village" value={form.village} onChange={handleChange} placeholder="Village name" className={inputCls} />
            </Field>
            <Field label="Tehsil">
              <input name="tehsil" value={form.tehsil} onChange={handleChange} placeholder="Tehsil" className={inputCls} />
            </Field>
            <Field label="District">
              <input name="district" value={form.district} onChange={handleChange} placeholder="District" className={inputCls} />
            </Field>
            <Field label="Pincode">
              <input name="pincode" value={form.pincode} onChange={handleChange} placeholder="6-digit pincode" type="number" className={inputCls} />
            </Field>
            <Field label="Track">
              <input name="track" value={form.track} onChange={handleChange} placeholder="Track / Stream" className={inputCls} />
            </Field>
            <Field label="Future Goal">
              <input name="futureGoal" value={form.futureGoal} onChange={handleChange} placeholder="Career goal" className={inputCls} />
            </Field>
            <div className="sm:col-span-2">
              <label className="text-sm font-semibold text-slate-700 block mb-2">
                <div className="flex items-center gap-1.5"><Trophy size={14} className="text-amber-500" /> Any Special Achievements / Awards?</div>
              </label>
              <div className="flex gap-6 mb-3">
                <RadioItem name="hasAchievements" value="yes" label="Yes" />
                <RadioItem name="hasAchievements" value="no" label="No" />
              </div>
              {form.hasAchievements === 'yes' && (
                <Field label="Describe Achievements">
                  <textarea
                    name="achievements"
                    value={form.achievements}
                    onChange={handleChange}
                    rows={2}
                    placeholder="E.g. Sports, Academic awards..."
                    className={textareaCls}
                  />
                </Field>
              )}
            </div>
          </div>
        </SectionCard>

        {/* 4. HEALTH INFORMATION */}
        <SectionCard icon={Heart} title="Health Information" color="rose">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Attendance in 12th (%)">
              <input name="attendance12" value={form.attendance12} onChange={handleChange} type="number" min="0" max="100" placeholder="e.g. 85" className={inputCls} />
            </Field>
            <Field label="Do you have any illness?">
              <div className="flex gap-6 pt-1">
                <RadioItem name="hasIllness" value="yes" label="Yes" />
                <RadioItem name="hasIllness" value="no" label="No" />
              </div>
            </Field>
            {form.hasIllness === 'yes' && (
              <>
                <Field label="Illness Name">
                  <input name="illnessName" value={form.illnessName} onChange={handleChange} placeholder="Name of illness" className={inputCls} />
                </Field>
                <Field label="Symptoms">
                  <input name="symptoms" value={form.symptoms} onChange={handleChange} placeholder="Describe symptoms" className={inputCls} />
                </Field>
              </>
            )}
          </div>
        </SectionCard>

        {/* 5. FAMILY INFORMATION */}
        <SectionCard icon={Users} title="Family Information" color="teal">
          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-sm min-w-[600px]">
              <thead>
                <tr className="bg-teal-50 text-teal-700">
                  {['Name', 'Relation', 'Occupation', 'Income (₹)', 'Mobile', ''].map(h => (
                    <th key={h} className="px-3 py-2.5 text-left font-semibold text-xs">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {familyMembers.map((m, i) => (
                  <tr key={i} className="border-t border-slate-100">
                    {['name', 'relation', 'occupation', 'income', 'mobile'].map(f => (
                      <td key={f} className="px-2 py-2">
                        <input value={m[f]} onChange={e => updateMember(i, f, e.target.value)}
                          placeholder={f.charAt(0).toUpperCase() + f.slice(1)}
                          className="w-full px-2 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-xs focus:outline-none focus:border-orange-400" />
                      </td>
                    ))}
                    <td className="px-2 py-2">
                      <button onClick={() => removeFamilyMember(i)} className="text-red-400 hover:text-red-600">
                        <Trash2 size={15} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <button onClick={addFamilyMember}
            className="mt-3 flex items-center gap-2 text-sm font-semibold text-teal-600 hover:text-teal-800 bg-teal-50 hover:bg-teal-100 px-4 py-2 rounded-xl transition-all border border-teal-200">
            <Plus size={16} /> Add Family Member
          </button>
        </SectionCard>

        {/* 6. FAMILY INCOME */}
        <SectionCard icon={FileText} title="Family Income" color="amber">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Total Annual Family Income (₹)" required>
              <input name="totalIncome" value={form.totalIncome} onChange={handleChange} type="number" placeholder="e.g. 150000" className={inputCls} />
            </Field>
            <div>
              <label className="text-sm font-semibold text-slate-700 block mb-2">Income Sources</label>
              <div className="grid grid-cols-2 gap-2">
                {['Farming', 'Labor Work', 'Job', 'Business', 'Government Pension', 'Other'].map(src => (
                  <CheckItem key={src} name="incomeSources" value={src} label={src} />
                ))}
              </div>
            </div>
            {(form.incomeSources || []).includes('Other') && (
              <Field label="Specify Other Income Source">
                <input name="incomeOther" value={form.incomeOther} onChange={handleChange} placeholder="Describe" className={inputCls} />
              </Field>
            )}
            <div className="sm:col-span-2">
              <Field label="Challenges Faced by Family">
                <textarea name="challenges" value={form.challenges} onChange={handleChange} rows={3} placeholder="Describe any major challenges..." className={textareaCls} />
              </Field>
            </div>
          </div>
        </SectionCard>

        {/* 7. HOUSING CONDITION */}
        <SectionCard icon={Home} title="Housing Condition" color="orange">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-semibold text-slate-700 block mb-2">Type of House</label>
              <div className="flex flex-wrap gap-4">
                {['Pucca', 'Kaccha', 'Semi Pucca'].map(t => <RadioItem key={t} name="houseType" value={t} label={t} />)}
              </div>
            </div>
            <Field label="Number of Rooms">
              <input name="numRooms" value={form.numRooms} onChange={handleChange} type="number" min="1" placeholder="e.g. 3" className={inputCls} />
            </Field>
            <div>
              <label className="text-sm font-semibold text-slate-700 block mb-2">Who Built the House?</label>
              <div className="flex flex-wrap gap-x-6 gap-y-2 mb-3">
                <RadioItem name="houseBuilder" value="Self" label="Self" />
                <RadioItem name="houseBuilder" value="Government Scheme" label="Government Scheme" />
              </div>
              {form.houseBuilder === 'Government Scheme' && (
                <div className="mt-3">
                  <Field label="Scheme Name">
                    <input 
                      name="houseSchemeName" 
                      value={form.houseSchemeName} 
                      onChange={handleChange} 
                      placeholder="e.g. PM Awas Yojana" 
                      className={inputCls} 
                    />
                  </Field>
                </div>
              )}
            </div>
          </div>
        </SectionCard>

        {/* 8. HOUSEHOLD RESOURCES & VEHICLES */}
        <SectionCard icon={Home} title="Household Resources & Vehicles" color="indigo">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="text-sm font-semibold text-slate-700 block mb-2">Appliances</label>
              <div className="flex flex-col gap-2">
                {['Refrigerator', 'Washing Machine', 'Air Conditioner'].map(a => (
                  <CheckItem key={a} name="appliances" value={a} label={a} />
                ))}
              </div>
            </div>
            <div>
              <Field label="Number of Vehicles">
                <input name="numVehicles" value={form.numVehicles} onChange={handleChange} type="number" min="0" placeholder="0" className={inputCls} />
              </Field>
              <label className="text-sm font-semibold text-slate-700 block mt-3 mb-2">Vehicle Types</label>
              <div className="grid grid-cols-2 gap-2">
                {['Bicycle', 'Bike', 'Car', 'Tractor', 'Other'].map(v => (
                  <CheckItem key={v} name="vehicleTypes" value={v} label={v} />
                ))}
              </div>
            </div>
          </div>
        </SectionCard>

        {/* 9. LAND & FARMING DETAILS */}
        <SectionCard icon={Tractor} title="Land & Farming Details" color="green">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex gap-2">
              <div className="flex-1">
                <Field label="Total Land">
                  <input name="totalLand" value={form.totalLand} onChange={handleChange} type="number" placeholder="Amount" className={inputCls} />
                </Field>
              </div>
              <div className="w-28 mt-auto">
                <select name="landUnit" value={form.landUnit} onChange={handleChange} className={selectCls}>
                  <option>Acre</option>
                  <option>Bigha</option>
                </select>
              </div>
            </div>
            <div>
              <label className="text-sm font-semibold text-slate-700 block mb-2">Ownership</label>
              <div className="flex gap-5">
                <RadioItem name="landOwnership" value="Personal Land" label="Personal" />
                <RadioItem name="landOwnership" value="Family Land" label="Family" />
              </div>
            </div>
            <div>
              <label className="text-sm font-semibold text-slate-700 block mb-2">Land Type</label>
              <div className="flex gap-5">
                <RadioItem name="landType" value="Irrigated" label="Irrigated" />
                <RadioItem name="landType" value="Non Irrigated" label="Non Irrigated" />
              </div>
            </div>
            <div>
              <label className="text-sm font-semibold text-slate-700 block mb-2">Irrigation Source</label>
              <div className="grid grid-cols-2 gap-1">
                {['Tube Well', 'Canal', 'Rain Based', 'Well', 'Other'].map(s => (
                  <RadioItem key={s} name="irrigationSource" value={s} label={s} />
                ))}
              </div>
            </div>
            <div className="sm:col-span-2">
              <label className="text-sm font-semibold text-slate-700 block mb-2">Livestock</label>
              <div className="flex flex-wrap gap-5">
                {['Cow', 'Buffalo', 'Goat', 'Other'].map(l => (
                  <CheckItem key={l} name="livestock" value={l} label={l} />
                ))}
              </div>
            </div>
          </div>
        </SectionCard>

        {/* 10. PHOTO DOCUMENTATION */}
        <SectionCard icon={Camera} title="Photo Documentation" color="purple">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <PhotoUpload studentId={form.studentId} id="photo1" label="1. Passport size photo" onUpload={(url) => handlePhotoUpload("1. Passport size photo", url)} previewUrl={getPhotoPreview("1. Passport size photo")} />
            <PhotoUpload studentId={form.studentId} id="photo2" label="2. Student with interviewer" onUpload={(url) => handlePhotoUpload("2. Student with interviewer", url)} previewUrl={getPhotoPreview("2. Student with interviewer")} />
            <PhotoUpload studentId={form.studentId} id="photo3" label="3. With parents & supervisor" onUpload={(url) => handlePhotoUpload("3. With parents & supervisor", url)} previewUrl={getPhotoPreview("3. With parents & supervisor")} />
            <PhotoUpload studentId={form.studentId} id="photo4" label="4. With parents at house" onUpload={(url) => handlePhotoUpload("4. With parents at house", url)} previewUrl={getPhotoPreview("4. With parents at house")} />
            <PhotoUpload studentId={form.studentId} id="photo5" label="5. In front of house" onUpload={(url) => handlePhotoUpload("5. In front of house", url)} previewUrl={getPhotoPreview("5. In front of house")} />
            <PhotoUpload studentId={form.studentId} id="photo6" label="6. Full house photo" onUpload={(url) => handlePhotoUpload("6. Full house photo", url)} previewUrl={getPhotoPreview("6. Full house photo")} />
            <div className="col-span-2 sm:col-span-3">
              <PhotoUpload studentId={form.studentId} id="photo7" label="7. Other photos" onUpload={(url) => handlePhotoUpload("7. Other photos", url)} previewUrl={getPhotoPreview("7. Other photos")} />
            </div>
          </div>
        </SectionCard>

        {/* 11. DECLARATION */}
        <SectionCard icon={FileText} title="Declaration" color="orange">
          <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 text-sm text-slate-700 leading-relaxed italic mb-4">
            "I hereby declare that the information provided above is true and correct to the best of my knowledge. If any information is found incorrect or false, the scholarship may be cancelled."
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <SignatureField studentId={form.studentId} label="Student Signature" onUpload={url => handleChange({ target: { name: 'studentSignatureUrl', value: url }})} previewUrl={form.studentSignatureUrl} />
            <SignatureField studentId={form.studentId} label="Father Signature" onUpload={url => handleChange({ target: { name: 'fatherSignatureUrl', value: url }})} previewUrl={form.fatherSignatureUrl} />
            <SignatureField studentId={form.studentId} label="Mother Signature" onUpload={url => handleChange({ target: { name: 'motherSignatureUrl', value: url }})} previewUrl={form.motherSignatureUrl} />
            <SignatureField studentId={form.studentId} label="Supervisor Signature" onUpload={url => handleChange({ target: { name: 'supervisorSignatureUrl', value: url }})} previewUrl={form.supervisorSignatureUrl} />
          </div>
        </SectionCard>

        {/* 12. SUPERVISOR REMARKS */}
        <SectionCard icon={AlertCircle} title="Supervisor Remarks" color="blue">
          <Field label="Remarks">
            <textarea name="supervisorRemarks" value={form.supervisorRemarks} onChange={handleChange}
              rows={4} placeholder="e.g. Home verification accepted. Family conditions verified..." className={textareaCls} />
          </Field>
        </SectionCard>

        {/* Action Buttons — at end of form */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-3">
          <h3 className="text-sm font-bold text-slate-700">Form Actions</h3>
          {apiMsg && (
            <p className={`text-xs font-semibold text-center py-2 px-3 rounded-xl ${apiMsg.startsWith('Error') ? 'text-red-600 bg-red-50 border border-red-100' : 'text-green-700 bg-green-50 border border-green-100'
              }`}>{apiMsg}</p>
          )}
          <div className="grid grid-cols-2 gap-3">

            {/* Save Draft */}
            <button onClick={handleSave} disabled={isApiLoading}
              className="group flex items-center gap-2.5 px-3 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 transition-all active:scale-95 disabled:opacity-50 shadow-sm">
              <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-500 shrink-0 border border-slate-100 group-hover:bg-slate-800 group-hover:text-white transition-all">
                <Save size={16} />
              </div>
              <div className="text-left leading-tight">
                <div className="text-[9px] font-bold uppercase tracking-widest text-slate-400">{isApiLoading ? '...' : 'Save Draft'}</div>
                <div className="text-xs font-bold text-slate-800">Draft</div>
              </div>
            </button>

            {/* Submit */}
            <button onClick={handleSubmit} disabled={isApiLoading}
              className="group flex items-center gap-2.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 border border-slate-800 text-white transition-all active:scale-95 disabled:opacity-50 shadow-md">
              <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                <Send size={16} />
              </div>
              <div className="text-left leading-tight">
                <div className="text-[9px] font-bold uppercase tracking-widest text-slate-400">{isApiLoading ? '...' : 'Final Send'}</div>
                <div className="text-xs font-bold">Submit</div>
              </div>
            </button>

            {/* Approve */}
            <button onClick={handleApprove} disabled={isApiLoading}
              className="group flex items-center gap-2.5 px-3 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-800 text-slate-800 transition-all active:scale-95 disabled:opacity-50 shadow-sm">
              <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600 shrink-0 border border-slate-200 group-hover:bg-slate-800 group-hover:text-white transition-all">
                <CheckCircle size={16} />
              </div>
              <div className="text-left leading-tight">
                <div className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Review</div>
                <div className="text-xs font-bold">Approve</div>
              </div>
            </button>

            {/* Reject */}
            <button onClick={handleReject} disabled={isApiLoading}
              className="group flex items-center gap-2.5 px-3 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-500 transition-all active:scale-95 disabled:opacity-50">
              <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 shrink-0 border border-slate-100 group-hover:bg-slate-200 transition-all">
                <XCircle size={16} />
              </div>
              <div className="text-left leading-tight">
                <div className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Review</div>
                <div className="text-xs font-bold">Reject</div>
              </div>
            </button>

          </div>
        </div>

      </div>
    </div>
  );
};

export default HomeVerificationPage;
