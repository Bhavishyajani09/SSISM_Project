import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
  Camera, Plus, Save, ChevronDown, ChevronUp, ChevronRight, CheckCircle2,
  User, Home, MapPin, LandPlot, ClipboardCheck, Trash2,
  X, RotateCw, Check, ArrowLeft, BookOpen, Heart, Users,
  Tractor, FileText, Clock, CheckCircle, XCircle, Send,
  AlertCircle, Trophy, Image
} from 'lucide-react';
import ssismLogo from '../../assets/SSISM_Logo.png';
import Loader from '../../components/Loader';
import toast from 'react-hot-toast';
import api from '../../api';

// Helper: Collapsible Card (Accordion)
const SectionCard = ({ icon: Icon, title, color = 'orange', children, open, onToggle }) => {
  const cardRef = useRef(null);
  
  const colorMap = {
    indigo:  { iconBg: 'bg-indigo-50',  iconText: 'text-indigo-600' },
    rose:    { iconBg: 'bg-rose-50',    iconText: 'text-rose-600' },
    emerald: { iconBg: 'bg-emerald-50', iconText: 'text-emerald-600' },
    orange:  { iconBg: 'bg-orange-50',  iconText: 'text-orange-600' },
    amber:   { iconBg: 'bg-amber-50',   iconText: 'text-amber-600' },
    blue:    { iconBg: 'bg-blue-50',    iconText: 'text-blue-600' },
    green:   { iconBg: 'bg-green-50',   iconText: 'text-green-600' },
    violet:  { iconBg: 'bg-violet-50',  iconText: 'text-violet-600' },
    slate:   { iconBg: 'bg-slate-50',   iconText: 'text-slate-600' },
    sky:     { iconBg: 'bg-sky-50',     iconText: 'text-sky-600' },
  };
  const cfg = colorMap[color] || colorMap.indigo;

  // Auto-scroll when opened
  useEffect(() => {
    if (open && cardRef.current) {
      setTimeout(() => {
        // Offset: 70px for mobile (main header), ~10px for desktop (no top header)
        const isMobile = window.innerWidth < 1024;
        const offset = isMobile ? 70 : 20;

        const bodyRect = document.body.getBoundingClientRect().top;
        const elementRect = cardRef.current.getBoundingClientRect().top;
        const elementPosition = elementRect - bodyRect;
        const offsetPosition = elementPosition - offset;

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }, 100);
    }
  }, [open]);

  return (
    <div ref={cardRef} className={`bg-white rounded-2xl shadow-sm border ${open ? 'border-slate-200' : 'border-slate-100'} overflow-hidden transition-all duration-300`}>
      <button
        type="button"
        onClick={onToggle}
        className={`w-full flex items-center justify-between px-4 py-3 sm:px-5 sm:py-4 bg-white transition-all active:brightness-95 hover:bg-slate-50/50 ${open ? 'border-b shadow-sm' : ''}`}
      >
        <div className="flex items-center gap-2.5 sm:gap-4">
          <div className={`p-2.5 rounded-2xl ${cfg.iconBg} ${cfg.iconText} border border-white transition-all shadow-sm`}>
            <Icon size={18} className={`${open ? 'scale-110' : 'scale-100'} transition-transform`} />
          </div>
          <h2 className={`font-bold text-sm sm:text-[15px] leading-tight tracking-tight ${open ? 'text-slate-900' : 'text-slate-700'}`}>{title}</h2>
        </div>
        <div className="flex items-center gap-2">
          {!open && <span className="text-[9px] uppercase font-black opacity-40 hidden sm:inline">Tap to View</span>}
          {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </div>
      </button>
      {open && <div className="p-4 sm:p-5 space-y-4 md:space-y-6 animate-fade-in-up">{children}</div>}
    </div>
  );
};

// Helper: Form Field
const Field = ({ label, children, required }) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-xs sm:text-sm font-semibold text-slate-700">
      {label}{required && <span className="text-red-500 ml-1">*</span>}
    </label>
    {children}
  </div>
);

const inputCls = "w-full px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 text-slate-800 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-orange-400/30 focus:border-orange-400 transition-all";
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
      if (studentId) formData.append('studentId', studentId);
      formData.append('image', file);

      try {
        const res = await api.post('/upload', formData);
        if (res.data.url && onUpload) {
          onUpload(res.data.url);
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
            <Loader color="orange" size="sm" />
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
      if (studentId) formData.append('studentId', studentId);
      formData.append('image', file);

      try {
        const res = await api.post('/upload', formData);
        if (res.data.url && onUpload) {
          onUpload(res.data.url);
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
            <Loader color="orange" size="sm" />
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
    totalAnnualIncome: '', familyChallenges: '', familyMembers: [],
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
  const [isLocating, setIsLocating] = useState(false);
  const [locationAddress, setLocationAddress] = useState('');
  const [activeSection, setActiveSection] = useState('studentInfo');
  const [loadingAction, setLoadingAction] = useState(null); // null | 'draft' | 'submitted' | 'teacher_rejected'


  const toggleSection = (sectionName) => {
    setActiveSection(prev => prev === sectionName ? null : sectionName);
  };

  // Scroll to top on mount or route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id, location]);

  // Form is locked if submitted, teacher_rejected, rejected, or approved
  const isReadOnly = status === 'submitted' || status === 'teacher_rejected' || status === 'rejected' || status === 'approved';

  const handleReverseGeocode = async (lat, lng) => {
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`);
      const data = await res.json();
      if (data.address) {
        const a = data.address;
        const village = a.village || a.suburb || a.city_district || a.town || a.city || '';
        const district = a.district || a.county || '';
        const state = a.state || '';
        const parts = [village, district, state].filter(Boolean);
        setLocationAddress(parts.join(', '));
      }
    } catch (err) {
      console.error("Reverse geocoding error:", err);
    }
  };

  const captureGPS = () => {
    if (navigator.geolocation) {
      setIsLocating(true);
      navigator.geolocation.getCurrentPosition(
        pos => {
          const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          setGpsCoords(coords);
          handleReverseGeocode(coords.lat, coords.lng);
          setIsLocating(false);
        },
        err => {
          console.error("GPS Error:", err);
          setIsLocating(false);
          setApiMsg("Location permission denied. Please enable GPS.");
        }
      );
    }
  };

  const fetchExistingVerification = async (sid) => {
    if (!sid || id) return; // Don't auto-fetch if we're already on a specific record (ID in URL)
    try {
      // 1. First check if a verification record already exists
      const res = await api.get(`/verifications/check/${sid}`);
      if (res.data.verification) {
        const { familyMembers: fm, ...formData } = res.data.verification;
        // Clean up Mongo metadata
        delete formData._id; delete formData.__v; delete formData.createdAt; delete formData.updatedAt;

        formData.hasIllness = formData.hasIllness ? 'yes' : 'no';
        formData.hasAchievements = formData.achievements ? 'yes' : 'no';

        setForm(prev => ({ ...prev, ...formData }));
        if (fm) setFamilyMembers(fm);
        setVerificationId(res.data.verification._id);
        setStatus(res.data.verification.status);
        if (res.data.verification.gpsLat && res.data.verification.gpsLng) {
          setGpsCoords({ lat: res.data.verification.gpsLat, lng: res.data.verification.gpsLng });
        }
        setApiMsg('Found existing draft for this student. Loaded latest data.');
        navigate(`/verification/home/${res.data.verification._id}`, { replace: true });
        return; // Exit if found
      }

      // 2. If no verification found, fetch basic student info from passed-students
      const studentRes = await api.get(`/passed-students/roll/${sid}`);
      if (studentRes.data.data) {
        const s = studentRes.data.data;
        setForm(prev => ({
          ...prev,
          studentId: s.rollNumber || '',
          studentName: s.studentName || '',
          fatherName: s.fatherName || '',
          mobile: s.mobileNumber || '',
          village: s.villageTown || '',
          district: s.district || '',
          collegeExamMarks: s.scholarshipExamMarks || '',
          track: s.busTrack || '',
          subject12: s.subjectIn12th || '',
        }));
        setApiMsg('Loaded student details from registration database.');
      }
    } catch (err) {
      console.error('Error checking existing:', err);
    }
  };


  // Load student data from location state or ID param
  useEffect(() => {
    if (id) {
      setVerificationId(id);
      api.get(`/verifications/${id}`)
        .then(res => {
          const data = res.data;
          if (data.verification) {
            console.log('Loaded Verification Data:', data.verification);
            const { familyMembers: fm, ...formData } = data.verification;
            // Clean up Mongo metadata
            delete formData._id; delete formData.__v; delete formData.createdAt; delete formData.updatedAt;

            // Handle conversions for UI radios
            formData.hasIllness = formData.hasIllness ? 'yes' : 'no';
            formData.hasAchievements = formData.achievements ? 'yes' : 'no';

            setForm(prev => ({ ...prev, ...formData }));
            if (fm) setFamilyMembers(fm);
            setStatus(data.verification.status);
            if (data.verification.gpsLat && data.verification.gpsLng) {
              setGpsCoords({ lat: data.verification.gpsLat, lng: data.verification.gpsLng });
              handleReverseGeocode(data.verification.gpsLat, data.verification.gpsLng);
            }
          }
        })
        .catch(err => setApiMsg('Error loading record: ' + err.message));

    } else if (location.state?.studentData) {
      // Coming from List or Dashboard
      const s = location.state.studentData;
      // Triggers lookup of existing draft OR pre-fills from registration
      fetchExistingVerification(s.rollNumber);
    }
  }, [id, location.state]);

  // Auto-capture GPS on mount if not already set
  useEffect(() => {
    if (!gpsCoords && !id) {
      captureGPS();
    }
  }, []);

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
    console.log('Building payload for backend:', payload);
    return payload;
  };

  // Show success toast then redirect
  const showSuccessAndRedirect = (actionStatus) => {
    const labels = {
      draft: 'Draft Saved Successfully',
      submitted: 'Verification Submitted Successfully',
      teacher_rejected: 'Rejection Recorded'
    };
    toast.success(labels[actionStatus] || 'Success');
    setTimeout(() => navigate('/home-verification'), 1000);
  };


  const handleSave = async () => {
    setIsApiLoading(true); setLoadingAction('draft'); setApiMsg('');

    try {
      let res;
      if (verificationId) {
        res = await api.put(`/verifications/${verificationId}`, { ...buildPayload(), status: 'draft' });
      } else {
        res = await api.post('/verifications', { ...buildPayload(), status: 'draft' });
      }
      const data = res.data;
      console.log('Save Draft Success Response:', data);

      if (data.verification) {
        setVerificationId(data.verification._id);
        setStatus('draft');
        // Sync form with backend data to ensure photo URLs etc are persisted
        const { familyMembers: fm, ...formData } = data.verification;
        formData.hasIllness = formData.hasIllness ? 'yes' : 'no';
        formData.hasAchievements = formData.achievements ? 'yes' : 'no';
        if (formData.verificationDate) formData.verificationDate = new Date(formData.verificationDate).toISOString().split('T')[0];
        
        setForm(prev => ({ ...prev, ...formData }));
        if (fm) setFamilyMembers(fm);
      }
      
      showSuccessAndRedirect('draft');
    } catch (err) {
      console.error('Save Draft Error:', err);
      setApiMsg('Error: ' + (err.response?.data?.error || err.message));
    } finally { setIsApiLoading(false); setLoadingAction(null); }
  };


  const validateHomeVerification = () => {
    const isVal = (v) => v !== '' && v !== null && v !== undefined;

    // 1. Basic Info
    if (!isVal(form.scholarshipType)) return "Scholarship Type is required.";
    if (!isVal(form.studentId)) return "Student ID is required.";
    if (!isVal(form.studentName)) return "Student Name is required.";
    if (!isVal(form.mobile)) return "Mobile Number is required.";
    if (form.mobile && !/^\d{10}$/.test(form.mobile)) return "Mobile Number must be 10 digits.";
    if (!isVal(form.verifierName)) return "Verifier Name is required.";

    // 2. Academic Info
    if (!isVal(form.marks10)) return "10th Percentage is required.";
    if (!isVal(form.marks11)) return "11th Percentage is required.";
    if (!isVal(form.marks12)) return "12th Percentage is required.";
    if (!isVal(form.collegeExamMarks)) return "College Exam Marks are required.";
    if (!isVal(form.homeVisitMarks)) return "Home Visit Marks are required.";

    // 3. Personal Info
    if (!isVal(form.fatherName)) return "Father's Name is required.";
    if (!isVal(form.address)) return "Address is required.";
    if (!isVal(form.village)) return "Village is required.";
    if (!isVal(form.tehsil)) return "Tehsil is required.";
    if (!isVal(form.district)) return "District is required.";
    if (!isVal(form.pincode)) return "Pincode is required.";
    if (form.pincode && !/^\d{6}$/.test(form.pincode)) return "Pincode must be 6 digits.";

    // 4. Family Income
    if (!isVal(form.totalAnnualIncome)) return "Total Annual Income is required.";
    if (!form.incomeSources || form.incomeSources.length === 0) return "At least one Income Source must be selected.";

    // 5. Housing
    if (!isVal(form.houseType)) return "House Type is required.";
    if (!isVal(form.numRooms)) return "Number of Rooms is required.";
    if (!isVal(form.houseBuilder)) return "House Builder Info is required.";

    // 6. Documentation (Photos)
    const requiredPhotos = [
      "1. Passport size photo",
      "2. Student with interviewer",
      "3. With parents & supervisor",
      "4. With parents at house",
      "5. In front of house",
      "6. Full house photo"
    ];
    for (const label of requiredPhotos) {
      const p = form.photos?.find(p => p.label === label);
      if (!p || !p.url) {
        return `Documentation Photo missing: ${label}`;
      }
    }

    // 7. Signatures
    if (!form.studentSignatureUrl) return "Student Signature is required.";
    if (!form.fatherSignatureUrl) return "Father Signature is required.";
    if (!form.motherSignatureUrl) return "Mother Signature is required.";
    if (!form.supervisorSignatureUrl) return "Supervisor Signature is required.";

    return null; // All good
  };


  const handleSubmit = async (targetStatus = 'submitted') => {
    // Strict validation only for final submission
    if (targetStatus === 'submitted') {
      const error = validateHomeVerification();
      if (error) {
        toast.error(`ALL FIELDS REQUIRED: ${error}`, { duration: 5000, position: 'top-center' });
        setApiMsg(''); 
        return;
      }
    }

    setIsApiLoading(true); setLoadingAction(targetStatus); setApiMsg('');

    const payload = { ...buildPayload(), status: targetStatus };
    console.log(`Submitting form with status ${targetStatus}:`, payload);

    try {
      let res;
      if (verificationId) {
        res = await api.put(`/verifications/${verificationId}`, payload);
      } else {
        res = await api.post('/verifications', payload);
      }
      const data = res.data;

      console.log('Final Submit Success Response:', data);
      
      if (data.verification) {
        setVerificationId(data.verification._id);
        setStatus(targetStatus);
        const { familyMembers: fm, ...formData } = data.verification;
        formData.hasIllness = formData.hasIllness ? 'yes' : 'no';
        formData.hasAchievements = formData.achievements ? 'yes' : 'no';
        if (formData.verificationDate) formData.verificationDate = new Date(formData.verificationDate).toISOString().split('T')[0];
        
        setForm(prev => ({ ...prev, ...formData }));
        if (fm) setFamilyMembers(fm);
      }
      
      showSuccessAndRedirect(targetStatus);
    } catch (err) {
      console.error('Submit Error:', err);
      setApiMsg('Error: ' + err.message);
    } finally { setIsApiLoading(false); setLoadingAction(null); }
  };


  const handleReject = () => handleSubmit('rejected');
  // NOTE: handleReject kept for potential future use but NOT exposed in teacher form UI.
  // Only admins can reject via the Admin Verification Portal.

  const totalMarks = [form.marks10, form.marks11, form.marks12, form.collegeExamMarks, form.homeVisitMarks]
    .reduce((sum, v) => sum + (parseFloat(v) || 0), 0).toFixed(2);

  const CheckItem = ({ name, value, label }) => (
    <label className="flex items-center gap-2 cursor-pointer text-sm text-slate-700">
      <input type="checkbox" name={name} value={value}
        checked={(form[name] || []).includes(value)}
        onChange={handleChange}
        className="w-4 h-4 accent-brand-600" />
      {label}
    </label>
  );

  const RadioItem = ({ name, value, label }) => (
    <label className="flex items-center gap-2 cursor-pointer text-sm text-slate-700">
      <input type="radio" name={name} value={value}
        checked={form[name] === value}
        onChange={handleChange}
        className="w-4 h-4 accent-brand-600" />
      {label}
    </label>
  );



  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-slate-50 font-sans">



      {/* Form Sections */}
      <div className="max-w-4xl mx-auto px-4 py-5 space-y-5 pb-32">

        {/* Combined Info & Action Bar */}
        <div className="flex flex-wrap items-center gap-3 text-xs">
          <button
            onClick={() => navigate('/home-verification')}
            className="p-2 bg-white hover:bg-slate-50 text-slate-500 hover:text-brand-600 rounded-xl border border-slate-200 shadow-sm transition-all group flex items-center justify-center"
            title="Return to List"
          >
            <ArrowLeft size={18} className="group-hover:-translate-x-0.5 transition-transform" />
          </button>

          <div className="h-6 w-px bg-slate-200 mx-1 hidden sm:block" />

          <button onClick={captureGPS} disabled={isReadOnly || isLocating}
            className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3 py-1.5 hover:bg-brand-50 hover:text-brand-600 hover:border-brand-200 transition-all font-semibold text-slate-600 disabled:opacity-60 shadow-sm group">
            <MapPin size={12} className={`text-brand-500 ${isLocating ? 'animate-bounce' : 'group-hover:scale-110'}`} />
            <span>{isLocating ? 'Locating...' : (gpsCoords ? `${Number(gpsCoords.lat).toFixed(4)}, ${Number(gpsCoords.lng).toFixed(4)}` : 'Capture GPS')}</span>
          </button>
          
          {locationAddress && !isLocating && (
             <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-100 rounded-xl px-3 py-1.5 text-emerald-700 font-medium shadow-sm animate-fade-in">
               <Home size={12} />
               <span className="truncate max-w-[140px] sm:max-w-[200px]">{locationAddress}</span>
             </div>
          )}

          <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3 py-1.5 font-semibold text-slate-500 shadow-sm lg:ml-auto">
            <Clock size={12} className="text-slate-400" />
            {new Date().toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
          </div>

          {status && (
            <div className={`px-3 py-1.5 rounded-xl border shadow-sm flex items-center gap-1.5 ${
              status === 'approved' ? 'bg-emerald-50 border-emerald-100 text-emerald-700' :
              status === 'submitted' ? 'bg-brand-50 border-brand-100 text-brand-700' :
              status === 'teacher_rejected' ? 'bg-orange-50 border-orange-100 text-orange-700' :
              status === 'rejected' ? 'bg-red-50 border-red-100 text-red-700' :
              'bg-slate-50 border-slate-200 text-slate-600'
            }`}>
              <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${
                status === 'approved' ? 'bg-emerald-500' :
                status === 'submitted' ? 'bg-brand-500' :
                status === 'teacher_rejected' ? 'bg-orange-500' :
                status === 'rejected' ? 'bg-red-500' :
                'bg-slate-400'
              }`} />
              <span className="text-[9px] font-black uppercase tracking-wider">
                {status === 'teacher_rejected' ? 'Teacher Rejected' : status.replace('_', ' ')}
              </span>
            </div>
          )}
        </div>

        {/* ── Read-Only Banner ── */}
        {isReadOnly && (
          <div className={`flex items-start gap-3 px-4 py-3.5 rounded-2xl border text-sm font-semibold ${
            status === 'submitted'
              ? 'bg-blue-50 border-blue-200 text-blue-800'
              : status === 'rejected'
              ? 'bg-red-50 border-red-200 text-red-800'
              : 'bg-green-50 border-green-200 text-green-800'
          }`}>
            <span className="text-xl mt-0.5">
              {status === 'submitted' ? '🔒' : status === 'rejected' ? '🚫' : '✅'}
            </span>
            <div>
              <p className="font-bold">
                {status === 'submitted' && 'Form Submitted — Awaiting Admin Review'}
                {status === 'teacher_rejected' && 'Rejected by Teacher'}
                {status === 'rejected' && 'Rejected by Admin'}
                {status === 'approved' && 'Approved by Admin — Read Only'}
              </p>
              <p className="text-xs font-normal mt-0.5 opacity-80">
                {status === 'submitted' && 'This form has been submitted. You cannot edit it until admin takes action.'}
                {status === 'teacher_rejected' && 'You have rejected this student. Admin can now review it and take final action.'}
                {status === 'rejected' && 'An admin has reviewed and rejected this verification. Contact the admin for further information.'}
                {status === 'approved' && 'This verification has been approved by an admin and is now finalized.'}
              </p>
            </div>
          </div>
        )}

        {/* Form fields — wrapped in pointer-events-none when locked */}
        <div className={isReadOnly ? 'pointer-events-none select-none opacity-75' : ''}>

        {/* 1. STUDENT INFORMATION */}
        <SectionCard 
          icon={User} 
          title="Student Information" 
          color="indigo"
          open={activeSection === 'studentInfo'} 
          onToggle={() => toggleSection('studentInfo')}
        >
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
        <SectionCard 
          icon={BookOpen} 
          title="Academic Details" 
          color="sky"
          open={activeSection === 'academic'} 
          onToggle={() => toggleSection('academic')}
        >
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {[
              { label: '10th Percentage (Max 100)', name: 'marks10', max: 100 },
              { label: '11th Percentage (Max 100)', name: 'marks11', max: 100 },
              { label: '12th Percentage (Max 100)', name: 'marks12', max: 100 },
              { label: 'College Exam Marks (Max 50)', name: 'collegeExamMarks', max: 50 },
              { label: 'Home Visit Marks (Max 50)', name: 'homeVisitMarks', max: 50 },
            ].map(f => (
              <Field key={f.name} label={f.label}>
                <input name={f.name} value={form[f.name]} onChange={handleChange} type="number" min="0" max={f.max} placeholder="0" className={inputCls} />
              </Field>
            ))}
            <div className="col-span-2 sm:col-span-1">
              <Field label="Cumulative Score / Total Marks">
                <div className="relative group/score">
                  <input 
                    readOnly 
                    value={`${totalMarks} / 400`}
                    className={`${inputCls} bg-slate-50 border-slate-200 font-bold text-slate-800 pr-24 sm:pr-28`}
                  />
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1.5 sm:gap-2 bg-white/80 backdrop-blur-sm px-3 py-1.5 rounded-xl border border-slate-200 shadow-sm">
                    <div className="w-12 sm:w-16 h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-brand-500 transition-all duration-700 shadow-[0_0_8px_rgba(249,115,22,0.4)]" 
                        style={{ width: `${Math.min(100, (parseFloat(totalMarks) / 400) * 100)}%` }}
                      />
                    </div>
                    <span className="text-[10px] sm:text-xs font-black text-brand-600 whitespace-nowrap">
                      {Math.round((parseFloat(totalMarks) / 400) * 100)}%
                    </span>
                  </div>
                </div>
              </Field>
            </div>
          </div>
        </SectionCard>

        {/* 3. PERSONAL INFORMATION */}
        <SectionCard 
          icon={User} 
          title="Personal Information" 
          color="indigo"
          open={activeSection === 'personal'} 
          onToggle={() => toggleSection('personal')}
        >
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
        <SectionCard 
          icon={Heart} 
          title="Health Information" 
          color="rose"
          open={activeSection === 'health'} 
          onToggle={() => toggleSection('health')}
        >
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
        <SectionCard 
          icon={Users} 
          title="Family Information" 
          color="emerald"
          open={activeSection === 'family'} 
          onToggle={() => toggleSection('family')}
        >
          <div className="overflow-x-auto rounded-xl border border-slate-200 thin-scrollbar">
            <table className="w-full text-sm min-w-[600px]">
              <thead>
                <tr className="bg-slate-50 text-slate-600">
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
            className="mt-3 flex items-center gap-2 text-sm font-semibold text-brand-600 hover:text-brand-800 bg-brand-50/50 hover:bg-brand-50 px-4 py-2 rounded-xl transition-all border border-brand-100">
            <Plus size={16} /> Add Family Member
          </button>
        </SectionCard>

        {/* 6. FAMILY INCOME */}
        <SectionCard 
          icon={FileText} 
          title="Family Income" 
          color="orange"
          open={activeSection === 'income'} 
          onToggle={() => toggleSection('income')}
        >
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
        <SectionCard 
          icon={Home} 
          title="Housing Condition" 
          color="amber"
          open={activeSection === 'housing'} 
          onToggle={() => toggleSection('housing')}
        >
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
        <SectionCard 
          icon={Home} 
          title="Household Resources & Vehicles" 
          color="blue"
          open={activeSection === 'resources'} 
          onToggle={() => toggleSection('resources')}
        >
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
        <SectionCard 
          icon={Tractor} 
          title="Land & Farming Details" 
          color="green"
          open={activeSection === 'land'} 
          onToggle={() => toggleSection('land')}
        >
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

        <SectionCard 
          icon={Camera} 
          title="Photo Documentation" 
          color="violet"
          open={activeSection === 'photos'} 
          onToggle={() => toggleSection('photos')}
        >
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
        <SectionCard 
          icon={FileText} 
          title="Declaration" 
          color="slate"
          open={activeSection === 'declaration'} 
          onToggle={() => toggleSection('declaration')}
        >
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm text-slate-700 leading-relaxed italic mb-4">
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
        <SectionCard 
          icon={AlertCircle} 
          title="Supervisor Remarks" 
          color="sky"
          open={activeSection === 'remarks'} 
          onToggle={() => toggleSection('remarks')}
        >
          <Field label="Remarks">
            <textarea name="supervisorRemarks" value={form.supervisorRemarks} onChange={handleChange}
              rows={4} placeholder="e.g. Home verification accepted. Family conditions verified..." className={textareaCls} />
          </Field>
        </SectionCard>

        </div>{/* end form fields wrapper */}

        {/* Action Buttons — at end of form */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-3">
          <h3 className="text-sm font-bold text-slate-700">Form Actions</h3>

          {/* Status banner */}
          {status && (
            <div className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold border ${
              status === 'approved' ? 'bg-green-50 text-green-700 border-green-200' :
              status === 'submitted' ? 'bg-blue-50 text-blue-700 border-blue-200' :
              status === 'rejected' ? 'bg-red-50 text-red-700 border-red-200' :
              'bg-orange-50 text-orange-700 border-orange-200'
            }`}>
              <span className={`w-2 h-2 rounded-full ${
                status === 'approved' ? 'bg-green-400' :
                status === 'submitted' ? 'bg-blue-400' :
                status === 'teacher_rejected' || status === 'rejected' ? 'bg-red-400' : 'bg-orange-400'
              }`} />
              {status === 'draft' ? 'Saved as Draft — Editable' :
               status === 'submitted' ? 'Submitted — Awaiting Admin Review' :
               status === 'teacher_rejected' ? 'Rejected by Teacher — Waiting for Admin' :
               status === 'approved' ? 'Approved by Admin ✓' :
               status === 'rejected' ? 'Rejected by Admin — Admin Can Approve' : ''}
            </div>
          )}

          {apiMsg && (
            <p className={`text-xs font-semibold text-center py-2 px-3 rounded-xl ${apiMsg.startsWith('Error') ? 'text-red-600 bg-red-50 border border-red-100' : 'text-green-700 bg-green-50 border border-green-100'
              }`}>{apiMsg}</p>
          )}

          {/* Action buttons — only when form is editable (new or draft) */}
          {!isReadOnly ? (
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button 
                onClick={handleSave} 
                disabled={isApiLoading}
                className="flex-1 flex items-center justify-center gap-2 px-5 py-3 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 font-bold rounded-xl transition-all shadow-sm active:scale-95 disabled:opacity-50"
              >
                {loadingAction === 'draft' ? <Loader size="sm" color="orange" /> : <Save size={18} />}
                Save as Draft
              </button>


              <button 
                onClick={() => {
                  const error = validateHomeVerification();
                  if (error) {
                    toast.error(`ALL FIELDS REQUIRED: ${error}`, { duration: 5000, position: 'top-center' });
                    setApiMsg('');
                    return;
                  }
                  if (window.confirm("ARE YOU SURE? \n\nOnce you submit, this form will be LOCKED for final admin review. You will not be able to edit it again.")) {
                    handleSubmit('submitted');
                  }
                }} 
                disabled={isApiLoading}
                className="flex-1 flex items-center justify-center gap-2 px-5 py-3 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl transition-all shadow-md shadow-brand-100 active:scale-95 disabled:opacity-50"
              >
                {loadingAction === 'submitted' ? <Loader size="sm" color="white" /> : <Send size={18} />}
                Submit Verification
              </button>


              <button 
                onClick={() => {
                   if (window.confirm("Reject this verification?")) {
                      handleSubmit('teacher_rejected');
                   }
                }}
                disabled={isApiLoading}
                className="flex-1 flex items-center justify-center gap-2 px-5 py-3 bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 font-bold rounded-xl transition-all active:scale-95 disabled:opacity-50"
              >
                {loadingAction === 'teacher_rejected' ? <Loader size="sm" color="slate" /> : <XCircle size={18} />}
                Reject
              </button>

            </div>
          ) : (
            // Locked state notice
            <div className={`flex flex-col items-center justify-center gap-3 py-6 px-4 rounded-3xl text-sm font-bold border-2 animate-fade-in ${
              status === 'submitted' ? 'bg-blue-50 border-blue-100 text-blue-800' :
              status === 'teacher_rejected' || status === 'rejected' ? 'bg-red-50 border-red-100 text-red-800' :
              'bg-green-50 border-green-100 text-green-800'
            }`}>
              <div className={`p-3 rounded-2xl ${
                status === 'submitted' ? 'bg-blue-100 text-blue-600' :
                status === 'teacher_rejected' || status === 'rejected' ? 'bg-red-100 text-red-600' :
                'bg-green-100 text-green-600'
              }`}>
                {status === 'submitted' ? <Clock size={24} className="animate-pulse" /> : status === 'approved' ? <CheckCircle size={24} /> : <XCircle size={24} />}
              </div>
              <div className="text-center">
                <p className="uppercase tracking-widest text-[10px] opacity-60 mb-1">Current Record Status</p>
                <p className="text-lg tracking-tight">{
                  status === 'submitted' ? 'Awaiting Admin Review' :
                  status === 'teacher_rejected' ? 'Rejected by Teacher' :
                  status === 'rejected' ? 'Rejected by Administrator' :
                  'Approved & Finalized'
                }</p>
                <p className="text-xs font-medium opacity-60 mt-1">{
                  status === 'submitted' ? 'Form is locked for editing during review.' :
                  status === 'approved' ? 'Record is authorized and completed.' :
                  'This student has been rejected for scholarship.'
                }</p>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default HomeVerificationPage;
