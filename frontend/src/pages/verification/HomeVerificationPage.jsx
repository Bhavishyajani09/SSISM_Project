import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
  Camera, Plus, Save, ChevronDown, ChevronUp, CheckCircle2,
  User, Home, MapPin, LandPlot, ClipboardCheck, Trash2,
  X, RotateCw, Check, ArrowLeft, BookOpen, Heart, Users,
  Tractor, FileText, Clock, CheckCircle, XCircle, Send,
  AlertCircle, Trophy, Image
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

const CameraCaptureModal = ({ isOpen, onClose, onCapture }) => {
  const videoRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [facingMode, setFacingMode] = useState('environment');
  const [capturedImg, setCapturedImg] = useState(null);

  const startCamera = async () => {
    try {
      const newStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: facingMode } }
      });
      setStream(newStream);
      if (videoRef.current) videoRef.current.srcObject = newStream;
    } catch (err) {
      console.error("Camera error:", err);
      onClose();
    }
  };

  useEffect(() => {
    if (isOpen) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => stopCamera();
  }, [isOpen, facingMode]);

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  const capturePhoto = () => {
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(videoRef.current, 0, 0);
    setCapturedImg(canvas.toDataURL('image/jpeg', 0.8));
  };

  const handleConfirm = () => {
    fetch(capturedImg)
      .then(res => res.blob())
      .then(blob => {
        const file = new File([blob], `capture_${Date.now()}.jpg`, { type: "image/jpeg" });
        onCapture(file);
        setCapturedImg(null);
        onClose();
      });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-4">
      <div className="relative w-full max-w-sm aspect-[3/4] bg-slate-900 rounded-[2.5rem] overflow-hidden shadow-2xl border-4 border-slate-800">
        {!capturedImg ? (
          <>
            <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
            <div className="absolute inset-x-0 bottom-10 flex items-center justify-center gap-10">
              <button 
                onClick={() => setFacingMode(prev => prev === 'user' ? 'environment' : 'user')}
                className="p-4 bg-white/10 backdrop-blur-xl rounded-full text-white active:scale-95 transition-all"
              >
                <RotateCw size={24} />
              </button>
              <button 
                onClick={capturePhoto}
                className="w-20 h-20 bg-white rounded-full border-[6px] border-white/30 active:scale-90 transition-all p-1"
              >
                <div className="w-full h-full rounded-full border-2 border-slate-900" />
              </button>
              <button 
                onClick={onClose} 
                className="p-4 bg-white/10 backdrop-blur-xl rounded-full text-white active:scale-95 transition-all"
              >
                <X size={24} />
              </button>
            </div>
          </>
        ) : (
          <>
            <img src={capturedImg} className="w-full h-full object-cover" />
            <div className="absolute inset-x-0 bottom-10 flex items-center justify-center gap-12">
              <button 
                onClick={() => setCapturedImg(null)}
                className="p-5 bg-white/10 backdrop-blur-xl rounded-full text-white active:scale-95 transition-all"
              >
                <RotateCw size={28} />
              </button>
              <button 
                onClick={handleConfirm}
                className="p-5 bg-emerald-500 rounded-full text-white shadow-lg shadow-emerald-500/30 active:scale-95 transition-all"
              >
                <Check size={28} />
              </button>
            </div>
          </>
        )}
      </div>
      <p className="mt-6 text-slate-400 text-sm font-medium uppercase tracking-widest leading-tight">Click photo for verification</p>
    </div>
  );
};

// Photo Preview Item
const PhotoUpload = ({ label, id, onUpload, previewUrl, studentId }) => {
  const [localPreview, setLocalPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const galleryRef = useRef();

  const displayUrl = localPreview || previewUrl;

  const handleFile = async (file) => {
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
    <div className="flex flex-col gap-1 w-full mx-auto">
      <span className="text-[10px] font-bold text-slate-500 truncate px-1 uppercase tracking-wider">{label}</span>
      <div
        className="relative border-2 border-dashed border-slate-200 rounded-2xl overflow-hidden bg-slate-50/50 hover:bg-slate-50 hover:border-orange-300 transition-all flex items-center justify-center h-32 group"
      >
        {loading ? (
          <div className="flex flex-col items-center gap-2">
            <div className="w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-[10px] text-orange-600 font-bold uppercase tracking-tight">Uploading</span>
          </div>
        ) : displayUrl ? (
          <div className="relative w-full h-full">
            <img src={displayUrl} alt="preview" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-3">
              <button
                onClick={() => setIsCameraOpen(true)}
                className="w-full py-2 bg-white rounded-lg text-slate-800 hover:bg-slate-50 flex items-center justify-center transition-all shadow-sm"
                title="Retake Photo"
              >
                <Camera size={18} />
              </button>
              <button
                onClick={() => galleryRef.current.click()}
                className="w-full py-2 bg-white/20 backdrop-blur-md border border-white/30 rounded-lg text-white hover:bg-white/30 flex items-center justify-center transition-all shadow-sm"
                title="Replace from Gallery"
              >
                <Image size={18} />
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4 w-full px-4">
            <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-slate-300 group-hover:text-orange-400 group-hover:scale-110 transition-all duration-300 border border-slate-100">
              <Camera size={18} />
            </div>
            <div className="flex gap-2 w-full">
              <button
                type="button"
                onClick={() => setIsCameraOpen(true)}
                className="flex-1 flex items-center justify-center py-2 bg-slate-800 text-white rounded-xl hover:bg-slate-900 active:scale-95 transition-all shadow-md shadow-slate-200"
                title="Capture Photo"
              >
                <Camera size={14} />
              </button>
              <button
                type="button"
                onClick={() => galleryRef.current.click()}
                className="flex-1 flex items-center justify-center py-2 bg-white border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 active:scale-95 transition-all shadow-sm"
                title="Add from Gallery"
              >
                <Image size={14} />
              </button>
            </div>
          </div>
        )}
      </div>
      <input ref={galleryRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleFile(e.target.files[0])} />
      <CameraCaptureModal isOpen={isCameraOpen} onClose={() => setIsCameraOpen(false)} onCapture={handleFile} />
    </div>
  );
};



// Signature Upload
const SignatureField = ({ label, onUpload, previewUrl, studentId }) => {
  const [localPreview, setLocalPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const galleryRef = useRef();

  const displayUrl = localPreview || previewUrl;

  const handleFile = async (file) => {
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
    <div className="flex flex-col gap-1 w-full mx-auto">
      <span className="text-[10px] font-bold text-slate-500 truncate px-1 uppercase tracking-wider">{label}</span>
      <div
        className="relative border-2 border-dashed border-slate-200 rounded-2xl overflow-hidden bg-slate-50/50 hover:bg-slate-50 hover:border-orange-300 transition-all flex items-center justify-center h-28 group"
      >
        {loading ? (
          <div className="flex flex-col items-center gap-2">
            <div className="w-5 h-5 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-[9px] text-orange-600 font-bold uppercase tracking-tight">Uploading</span>
          </div>
        ) : displayUrl ? (
          <div className="relative w-full h-full">
            <img src={displayUrl} alt="signature" className="w-full h-full object-contain p-2" />
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-2">
              <button
                onClick={() => setIsCameraOpen(true)}
                className="w-full py-1.5 bg-white rounded-lg text-slate-800 flex items-center justify-center shadow-sm transition-all"
                title="Retake Signature"
              >
                <Camera size={16} />
              </button>
              <button
                onClick={() => galleryRef.current.click()}
                className="w-full py-1.5 bg-white/20 backdrop-blur-md border border-white/30 rounded-lg text-white flex items-center justify-center shadow-sm transition-all"
                title="Replace from Gallery"
              >
                <Image size={16} />
              </button>
            </div>
          </div>
        ) : (
          <div className="flex gap-2 w-full px-3">
            <button
              type="button"
              onClick={() => setIsCameraOpen(true)}
              className="flex-1 flex items-center justify-center py-2 bg-slate-800 text-white rounded-xl active:scale-95 transition-all shadow-md shadow-slate-200"
              title="Capture Signature"
            >
              <Camera size={14} />
            </button>
            <button
              type="button"
              onClick={() => galleryRef.current.click()}
              className="flex-1 flex items-center justify-center py-2 bg-white border border-slate-200 text-slate-600 rounded-xl active:scale-95 transition-all shadow-sm"
              title="Add from Gallery"
            >
              <Image size={14} />
            </button>
          </div>
        )}
      </div>
      <input ref={galleryRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleFile(e.target.files[0])} />
      <CameraCaptureModal isOpen={isCameraOpen} onClose={() => setIsCameraOpen(false)} onCapture={handleFile} />
    </div>
  );
};



const API_URL = 'http://localhost:5000/api/verifications';

const HomeVerificationPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [form, setForm] = useState({
    scholarshipType: '', studentId: '', studentName: '', mobile: '',
    verificationDate: new Date().toISOString().split('T')[0], verifierName: '',
    marks10: '', marks11: '', marks12: '', collegeExamMarks: '', homeVisitMarks: '',
    fatherName: '', schoolName: '', classFees12: '', subject12: '', address: '',
    village: '', tehsil: '', district: '', pincode: '', track: '', futureGoal: '',
    attendance12: '', hasIllness: 'no', illnessName: '', symptoms: '',
    totalAnnualIncome: '', incomeSources: [], incomeOther: '', familyChallenges: '',
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

            // Handle conversions for UI radios
            formData.hasIllness = formData.hasIllness ? 'yes' : 'no';
            formData.hasAchievements = formData.achievements ? 'yes' : 'no';

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

  const fetchExistingVerification = async (sid) => {
    if (!sid || id) return; // Don't auto-fetch if we're already on a specific record (ID in URL)
    try {
      const res = await fetch(`${API_URL}/check/${sid}`);
      if (res.ok) {
        const data = await res.json();
        if (data.verification) {
          const { familyMembers: fm, ...formData } = data.verification;
          // Clean up Mongo metadata
          delete formData._id;
          delete formData.__v;
          delete formData.createdAt;
          delete formData.updatedAt;

          // Handle conversions for UI radios
          formData.hasIllness = formData.hasIllness ? 'yes' : 'no';
          formData.hasAchievements = formData.achievements ? 'yes' : 'no';

          setForm(prev => ({ ...prev, ...formData }));
          if (fm) setFamilyMembers(fm);
          setVerificationId(data.verification._id);
          setStatus(data.verification.status);
          if (data.verification.gpsLat && data.verification.gpsLng) {
            setGpsCoords({ lat: data.verification.gpsLat, lng: data.verification.gpsLng });
          }
          setApiMsg('Found existing draft for this student. Loaded latest data.');
          // Update URL without refresh
          navigate(`/verification/home/${data.verification._id}`, { replace: true });
        }
      }
    } catch (err) {
      console.error('Error checking existing:', err);
    }
  };

  // Pre-fill student data from location state if available
  useEffect(() => {
    if (location.state?.studentData) {
      const s = location.state.studentData;
      setForm(prev => ({
        ...prev,
        studentId: s.rollNumber?.toString() || '',
        studentName: s.studentName || '',
        mobile: s.mobileNumber || '',
        fatherName: s.fatherName || '',
        village: s.villageTown || '',
        district: s.district || '',
        subject12: s.subjectIn12th || '',
        track: s.busTrack || '',
      }));
      // Check if a verification already exists for this roll number
      if (s.rollNumber) fetchExistingVerification(s.rollNumber.toString());
    }
  }, [location.state]);

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
  const buildPayload = () => {
    const payload = {
      ...form,
      familyMembers,
      hasIllness: form.hasIllness === 'yes',
      achievements: form.hasAchievements === 'yes' ? form.achievements : '',
      gpsLat: gpsCoords?.lat,
      gpsLng: gpsCoords?.lng,
    };
    return payload;
  };

  const handleSave = async () => {
    setIsApiLoading(true); setApiMsg('');
    try {
      const payload = buildPayload();
      console.log('Saving draft with payload:', payload);

      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Save failed');
      
      setVerificationId(data.verification._id);
      setStatus('saved');
      setApiMsg('Draft saved successfully!');
      
      // Update URL if it's a new or switched record
      if (id !== data.verification._id) {
        navigate(`/verification/home/${data.verification._id}`, { replace: true });
      }
    } catch (err) {
      console.error('Save error:', err);
      setApiMsg('Error: ' + err.message);
    } finally { setIsApiLoading(false); }
  };

  const handleSubmit = async () => {
    setIsApiLoading(true); setApiMsg('');
    try {
      // For submission, we can use PUT if we have an ID, or POST (which will upsert)
      const payload = { ...buildPayload(), status: 'submitted' };
      let res;
      
      if (verificationId) {
        res = await fetch(`${API_URL}/${verificationId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch(API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Submit failed');
      
      setVerificationId(data.verification._id);
      setStatus('submitted');
      setApiMsg('Verification submitted successfully!');
      
      if (id !== data.verification._id) {
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
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-500 mr-1"
            title="Go Back"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="w-9 h-9 rounded-full bg-orange-500 flex items-center justify-center overflow-hidden border-2 border-orange-400 shrink-0">
            <img src={ssismLogo} alt="SSISM" className="w-full h-full object-cover" />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-[13px] font-bold text-gray-900 leading-tight uppercase tracking-tight">Home Visit Verification</h1>
            <p className="text-[10px] text-orange-400 font-medium uppercase tracking-widest leading-tight mt-0.5">SSISM SCHOLARSHIP PORTAL</p>
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
            <Field label="Student ID (Roll Number)" required>
              <input 
                name="studentId" 
                value={form.studentId} 
                onChange={handleChange} 
                onBlur={(e) => fetchExistingVerification(e.target.value)}
                placeholder="e.g. 21001" 
                className={inputCls} 
              />
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
              <input name="totalAnnualIncome" value={form.totalAnnualIncome} onChange={handleChange} type="number" placeholder="e.g. 150000" className={inputCls} />
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
                <textarea name="familyChallenges" value={form.familyChallenges} onChange={handleChange} rows={3} placeholder="Describe any major challenges..." className={textareaCls} />
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

        <SectionCard icon={Camera} title="Photo Documentation" color="purple">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
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
            <SignatureField studentId={form.studentId} label="Student Signature" onUpload={url => handleChange({ target: { name: 'studentSignatureUrl', value: url } })} previewUrl={form.studentSignatureUrl} />
            <SignatureField studentId={form.studentId} label="Father Signature" onUpload={url => handleChange({ target: { name: 'fatherSignatureUrl', value: url } })} previewUrl={form.fatherSignatureUrl} />
            <SignatureField studentId={form.studentId} label="Mother Signature" onUpload={url => handleChange({ target: { name: 'motherSignatureUrl', value: url } })} previewUrl={form.motherSignatureUrl} />
            <SignatureField studentId={form.studentId} label="Supervisor Signature" onUpload={url => handleChange({ target: { name: 'supervisorSignatureUrl', value: url } })} previewUrl={form.supervisorSignatureUrl} />
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
