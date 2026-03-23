import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
  Camera, Plus, Save, ChevronDown, ChevronUp, ChevronRight, CheckCircle2,
  User, Home, MapPin, LandPlot, ClipboardCheck, Trash2,
  X, RotateCw, Check, ArrowLeft, BookOpen, Heart, Users,
  Tractor, FileText, Clock, CheckCircle, XCircle, Send,
  AlertCircle, Trophy, Image as ImageIcon, Lock, Download
} from 'lucide-react';
import ssismLogo from '../../assets/SSISM_Logo.png';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import Loader from '../../components/Loader';
import toast from 'react-hot-toast';
import api from '../../api';
import { confirmAction } from '../../utils/notifications';

// Helper: Collapsible Card (Accordion)
const SectionCard = ({ icon: Icon, title, color = 'orange', children, open, onToggle, locked }) => {
  const cardRef = useRef(null);

  const colorMap = {
    indigo: { iconBg: 'bg-indigo-50', iconText: 'text-indigo-600' },
    rose: { iconBg: 'bg-rose-50', iconText: 'text-rose-600' },
    emerald: { iconBg: 'bg-emerald-50', iconText: 'text-emerald-600' },
    orange: { iconBg: 'bg-[#f8fbff]', iconText: 'text-brand-600' },
    amber: { iconBg: 'bg-[#f8fbff]', iconText: 'text-amber-600' },
    blue: { iconBg: 'bg-[#f8fbff]', iconText: 'text-blue-600' },
    green: { iconBg: 'bg-green-50', iconText: 'text-green-600' },
    violet: { iconBg: 'bg-violet-50', iconText: 'text-violet-600' },
    slate: { iconBg: 'bg-slate-50', iconText: 'text-slate-600' },
    sky: { iconBg: 'bg-sky-50', iconText: 'text-sky-600' },
  };
  const cfg = colorMap[color] || colorMap.indigo;

  // User-friendly smart Auto-scroll when opened
  useEffect(() => {
    if (open && cardRef.current) {
      setTimeout(() => {
        // The mobile layout possesses multiple stacked sticky/fixed navigation sections (app header + progress tracker). 
        // We apply a mathematically guaranteed safe padding offset to prevent aggressive over-scroll jumping.
        const isMobile = window.innerWidth < 1024;
        const safeOffset = isMobile ? 240 : 180; // High safe buffer exactly clears all combined sticky header heights.

        const bodyRect = document.body.getBoundingClientRect().top;
        const elementRect = cardRef.current.getBoundingClientRect().top;
        const elementPosition = elementRect - bodyRect;

        // Do not jump to negatives. Gently glide into clear view beneath headers.
        const offsetPosition = Math.max(0, elementPosition - safeOffset);

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }, 50); // Fast enough to avoid visual delay, slow enough for DOM flush
    }
  }, [open]);

  return (
    <div ref={cardRef} className={`bg-white rounded-xl border ${open ? 'border-slate-200 shadow-sm' : 'border-slate-100'} overflow-hidden transition-all duration-300`}>
      <button
        type="button"
        onClick={onToggle}
        className={`group w-full flex items-center justify-between p-3 sm:p-4 text-left transition-all duration-300 ${open ? 'bg-white border-b' : 'bg-slate-50/30 hover:bg-white'}`}
      >
        <div className="flex items-center gap-2 sm:gap-3">
          <div className={`p-2 rounded-lg ${cfg.iconBg} ${cfg.iconText} transition-all`}>
            <Icon size={18} className={`${open ? 'scale-110' : 'scale-100'} transition-transform`} />
          </div>
          <h2 className={`font-bold text-xs sm:text-sm tracking-tight ${open ? 'text-slate-900' : 'text-slate-700'}`}>{title}</h2>
        </div>
        <div className="flex items-center gap-2">
          {!open && (
            <span className="hidden sm:inline-block px-1.5 py-0.5 rounded-md bg-slate-50 border border-slate-100/50 text-[9px] font-bold text-slate-400 uppercase tracking-wider group-hover:text-brand-600 group-hover:bg-brand-50 transition-all">
              Manage
            </span>
          )}
          {open ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
        </div>
      </button>
      {open && (
        <div className={`p-4 sm:p-5 space-y-4 animate-fade-in-up ${locked ? 'pointer-events-none opacity-80' : ''}`}>
          {children}
        </div>
      )}
    </div>
  );
};

// Helper: Form Field
const Field = ({ label, children, required }) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-[11px] sm:text-xs font-semibold text-slate-700">
      {label}{required && <span className="text-red-500 ml-1">*</span>}
    </label>
    {children}
  </div>
);

const inputCls = "w-full px-3 py-1.5 sm:py-2.5 rounded-lg border border-slate-200 bg-white text-slate-800 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/10 focus:border-brand-500/30 transition-all placeholder:text-slate-400";
const selectCls = inputCls + " cursor-pointer";
const textareaCls = inputCls + " resize-none min-h-[80px] sm:min-h-[120px]";

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
const PhotoUpload = ({ label, id, onUpload, previewUrl, studentId, required, isMissing }) => {
  const [localPreview, setLocalPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const galleryRef = useRef();

  const displayUrl = localPreview || previewUrl;

  const uploadFile = async (file) => {
    setLoading(true);
    const formData = new FormData();
    if (studentId) formData.append('studentId', studentId);
    formData.append('image', file);

    try {
      const res = await fetch('http://localhost:5000/api/upload', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (data.url && onUpload) {
        onUpload(data.url);
      }
      return data.url;
    } catch (err) {
      console.error('Upload error', err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const handleFile = async (file) => {
    if (file) {
      setLocalPreview(URL.createObjectURL(file));
      await uploadFile(file);
      if (label.includes("Other")) setLocalPreview(null);
    }
  };

  const handleMultipleFiles = async (files) => {
    if (!files || files.length === 0) return;

    // Convert FileList to Array
    const fileArray = Array.from(files);

    for (const file of fileArray) {
      await uploadFile(file);
    }
  };

  return (
    <div className="flex flex-col gap-0.5 w-full mx-auto" id={id}>
      <span className="text-[9px] sm:text-[10px] font-bold text-slate-500 truncate px-1 uppercase tracking-wider">{label} {required && <span className="text-red-500 ml-1">*</span>}</span>
      <div
        className={`relative border-2 border-dashed rounded-xl overflow-hidden transition-all flex items-center justify-center h-24 sm:h-32 group ${isMissing && required ?
          'border-red-400 bg-red-50/50 hover:bg-red-50 hover:border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.15)]' :
          'border-slate-200 bg-slate-50/50 hover:bg-slate-50 hover:border-orange-300'}`}
      >
        {loading ? (
          <div className="flex flex-col items-center gap-1.5">
            <Loader color="orange" size="xs" />
            <span className="text-[9px] sm:text-[10px] text-orange-600 font-bold uppercase tracking-tight">Uploading</span>
          </div>
        ) : displayUrl ? (
          <div className="relative w-full h-full">
            <img src={displayUrl} alt="preview" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1.5 sm:gap-2 p-2">
              <button
                onClick={() => setIsCameraOpen(true)}
                className="w-full py-1.5 sm:py-2 bg-white rounded-md text-slate-800 hover:bg-slate-50 flex items-center justify-center transition-all shadow-sm"
                title="Retake Photo"
              >
                <Camera size={14} />
              </button>
              <button
                onClick={() => galleryRef.current.click()}
                className="w-full py-1.5 sm:py-2 bg-white/20 backdrop-blur-md border border-white/30 rounded-md text-white hover:bg-white/30 flex items-center justify-center transition-all shadow-sm"
                title="Replace from Gallery"
              >
                <ImageIcon size={14} />
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 w-full px-4 mt-2 sm:mt-0">
            <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white shadow-sm flex items-center justify-center transition-all duration-300 border ${label.includes("Other") ? 'text-orange-500 border-orange-100 scale-110 shadow-orange-100' : 'text-slate-300 border-slate-100'}`}>
              {label.includes("Other") ? <Plus size={20} strokeWidth={3} /> : <Camera size={18} sm:size={20} />}
            </div>
            {label.includes("Other") && <span className="text-[9px] sm:text-[10px] font-black text-orange-600 uppercase tracking-tight mt-1">Add Multiple</span>}
            <div className="flex gap-2 w-full mt-1">
              <button
                type="button"
                onClick={() => setIsCameraOpen(true)}
                className="flex-1 flex items-center justify-center py-2 sm:py-2.5 bg-slate-800 text-white rounded-xl hover:bg-slate-900 active:scale-95 transition-all shadow-md shadow-slate-200"
                title="Capture Photo"
              >
                <Camera size={14} sm:size={16} />
              </button>
              <button
                type="button"
                onClick={() => galleryRef.current.click()}
                className="flex-1 flex items-center justify-center py-2 sm:py-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 active:scale-95 transition-all shadow-sm"
                title="Add from Gallery"
              >
                <ImageIcon size={14} sm:size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
      <input
        ref={galleryRef}
        type="file"
        accept="image/*"
        multiple={label.includes("Other")}
        className="hidden"
        onChange={(e) => {
          if (label.includes("Other")) {
            handleMultipleFiles(e.target.files);
          } else {
            handleFile(e.target.files[0]);
          }
        }}
      />
      <CameraCaptureModal isOpen={isCameraOpen} onClose={() => setIsCameraOpen(false)} onCapture={handleFile} />
      {isMissing && required && <p className="text-[10px] font-bold text-red-500 mt-1 px-1 flex items-center gap-1"><AlertCircle size={10} /> * Required</p>}
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
    <div className="flex flex-col gap-0.5 w-full mx-auto">
      <span className="text-[9px] sm:text-[10px] font-bold text-slate-500 truncate px-1 uppercase tracking-wider">{label}</span>
      <div
        className="relative border-2 border-dashed border-slate-200 rounded-xl overflow-hidden bg-slate-50/50 hover:bg-slate-50 hover:border-orange-300 transition-all flex items-center justify-center h-20 sm:h-28 group"
      >
        {loading ? (
          <div className="flex flex-col items-center gap-1.5">
            <Loader color="orange" size="xs" />
            <span className="text-[9px] sm:text-[10px] text-orange-600 font-bold uppercase tracking-tight">Uploading</span>
          </div>
        ) : displayUrl ? (
          <div className="relative w-full h-full">
            <img src={displayUrl} alt="signature" className="w-full h-full object-contain p-1.5" />
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1.5 sm:gap-2 p-1.5">
              <button
                onClick={() => setIsCameraOpen(true)}
                className="w-full py-1 sm:py-1.5 bg-white rounded-md text-slate-800 flex items-center justify-center shadow-sm transition-all text-xs"
                title="Retake Signature"
              >
                <Camera size={14} />
              </button>
              <button
                onClick={() => galleryRef.current.click()}
                className="w-full py-1 sm:py-1.5 bg-white/20 backdrop-blur-md border border-white/30 rounded-md text-white flex items-center justify-center shadow-sm transition-all text-xs"
                title="Replace from Gallery"
              >
                <ImageIcon size={14} />
              </button>
            </div>
          </div>
        ) : (
          <div className="flex gap-1.5 sm:gap-2.5 w-full px-2 sm:px-5">
            <button
              type="button"
              onClick={() => setIsCameraOpen(true)}
              className="flex-1 flex items-center justify-center py-1.5 sm:py-2 bg-slate-800 text-white rounded-lg active:scale-95 transition-all shadow-md shadow-slate-200"
              title="Capture Signature"
            >
              <Camera size={12} sm:size={16} />
            </button>
            <button
              type="button"
              onClick={() => galleryRef.current.click()}
              className="flex-1 flex items-center justify-center py-1.5 sm:py-2 bg-white border border-slate-200 text-slate-600 rounded-lg active:scale-95 transition-all shadow-sm"
              title="Add from Gallery"
            >
              <ImageIcon size={12} sm:size={16} />
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

// Derive the logged-in user's display name from localStorage
const getLoggedInUserName = () => {
  try {
    const stored = localStorage.getItem('user');
    if (!stored) return 'Unknown User';
    const user = JSON.parse(stored);
    // Prefer a real name; fall back to the part of the email before '@'
    return user.name?.trim() || user.email?.split('@')[0] || 'Unknown User';
  } catch {
    return 'Unknown User';
  }
};

// confirmAction utility is now imported from utils/notifications.jsx

// --- Step Definitions ---
const STEPS = [
  { id: 'studentInfo', title: 'Student Info', icon: User, color: 'indigo' },
  { id: 'academic', title: 'Academic', icon: BookOpen, color: 'sky' },
  { id: 'personal', title: 'Personal', icon: User, color: 'indigo' },
  { id: 'health', title: 'Health', icon: Heart, color: 'rose' },
  { id: 'family', title: 'Family', icon: Users, color: 'emerald' },
  { id: 'income', title: 'Income', icon: FileText, color: 'orange' },
  { id: 'housing', title: 'Housing', icon: Home, color: 'amber' },
  { id: 'resources', title: 'Resources', icon: Home, color: 'blue' },
  { id: 'land', title: 'Land', icon: Tractor, color: 'green' },
  { id: 'photos', title: 'Photos', icon: Camera, color: 'violet' },
  { id: 'declaration', title: 'Declaration', icon: FileText, color: 'slate' },
  { id: 'remarks', title: 'Remarks', icon: AlertCircle, color: 'sky' },
];

const CheckItem = ({ name, value, label, form, setForm }) => {
  const isSelected = Array.isArray(form[name]) ? form[name].includes(value) : form[name] === value;
  return (
    <label className={`flex items-center gap-2 p-1.5 sm:p-2.5 rounded-lg border transition-all cursor-pointer ${isSelected ? 'border-brand-500 bg-brand-50/30' : 'border-slate-100 bg-slate-50/30 hover:bg-white'}`}>
      <input
        type="checkbox"
        checked={isSelected}
        onChange={() => {
          setForm(prev => {
            const list = Array.isArray(prev[name]) ? [...prev[name]] : [];
            return {
              ...prev,
              [name]: list.includes(value) ? list.filter(v => v !== value) : [...list, value]
            };
          });
        }}
        className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
      />
      <span className="text-[11px] sm:text-sm font-medium text-slate-700">{label}</span>
    </label>
  );
};

const RadioItem = ({ name, value, label, form, setForm }) => {
  const isSelected = form[name] === value;
  return (
    <label className={`flex items-center gap-2 p-1.5 sm:p-2.5 rounded-lg border transition-all cursor-pointer ${isSelected ? 'border-brand-500 bg-brand-50/30 shadow-sm' : 'border-slate-100 bg-slate-50/30 hover:bg-white'}`}>
      <input
        type="radio"
        name={name}
        value={value}
        checked={isSelected}
        onChange={() => setForm(prev => ({ ...prev, [name]: value }))}
        className="w-3.5 h-3.5 sm:w-4 sm:h-4 border-slate-300 text-brand-600 focus:ring-brand-500"
      />
      <span className="text-[11px] sm:text-sm font-medium text-slate-700">{label}</span>
    </label>
  );
};

const HomeVerificationPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [form, setForm] = useState({
    scholarshipType: '', studentId: '', studentName: '', mobile: '',
    verificationDate: new Date().toISOString().split('T')[0], verifierName: getLoggedInUserName(),
    marks10: '', marks11: '', collegeExamMarks: '', homeVisitMarks: '',
    fatherName: '', schoolName: '', classFees12: '', subject12: '', subject12Custom: '', address: '',
    village: '', tehsil: '', district: '', pincode: '', track: '', trackCustom: '', futureGoal: '',
    attendance12: '', hasIllness: 'no', illnessName: '', symptoms: '',
    totalAnnualIncome: '', familyChallenges: '', familyMembers: [],
    houseType: '', numRooms: '', houseBuilder: '', houseBuilderOther: '', houseSchemeName: '',
    appliances: [], numVehicles: '', vehicleTypes: [], vehicleTypesOther: '',
    totalLand: '', landUnit: 'Acre', landOwnership: '', landType: '', irrigationSource: '', irrigationSourceOther: '',
    livestock: [
      { name: 'Cow', count: '' },
      { name: 'Buffalo', count: '' },
      { name: 'Goat', count: '' }
    ],
    livestockOther: '',
    livestockOtherCount: '',
    supervisorRemarks: '',
    hasAchievements: 'no', achievements: '',
    photos: [],
    studentSignatureUrl: '',
    fatherSignatureUrl: '',
    motherSignatureUrl: '',
    supervisorSignatureUrl: '',
    holdReason: '',
    rejectReason: '',
  });

  const [familyMembers, setFamilyMembers] = useState([
    { name: '', relation: '', occupation: '', income: '', mobile: '', currentClass: '', isWorking: '', educationLevel: '' }
  ]);
  const [status, setStatus] = useState(null);
  const [verificationId, setVerificationId] = useState(null);
  const [isApiLoading, setIsApiLoading] = useState(false);
  const [apiMsg, setApiMsg] = useState('');
  const [gpsCoords, setGpsCoords] = useState(null);
  const [isLocating, setIsLocating] = useState(false);
  const [locationAddress, setLocationAddress] = useState('');
  const [currentStep, setCurrentStep] = useState(0); // 0-indexed
  const [loadingAction, setLoadingAction] = useState(null);
  const [isHoldModalOpen, setIsHoldModalOpen] = useState(false);
  const [holdReason, setHoldReason] = useState('');
  const [holdReasonError, setHoldReasonError] = useState('');

  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectType, setRejectType] = useState('teacher_rejected');
  const [rejectReason, setRejectReason] = useState('');
  const [rejectReasonError, setRejectReasonError] = useState('');

  const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
  const userRole = storedUser.role || 'teacher';
  const isAdmin = userRole === 'admin';

  const subjectRef = useRef(null);
  const trackRef = useRef(null);

  useEffect(() => {
    if (form.subject12 === 'Other' && subjectRef.current) subjectRef.current.focus();
  }, [form.subject12]);

  useEffect(() => {
    if (form.track === 'Other' && trackRef.current) trackRef.current.focus();
  }, [form.track]);


  // Navigation logic
  const nextStep = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const canGoNext = () => {
    const isVal = (v) => v !== '' && v !== null && v !== undefined;
    const stepId = STEPS[currentStep].id;

    switch (stepId) {
      case 'studentInfo':
        return isVal(form.scholarshipType) && isVal(form.studentId) && isVal(form.studentName) && isVal(form.mobile) && isVal(form.verifierName) && /^\d{10}$/.test(form.mobile);
      case 'academic':
        return isVal(form.marks10) && parseFloat(form.marks10) <= 100 &&
               isVal(form.marks11) && parseFloat(form.marks11) <= 100 &&
               isVal(form.collegeExamMarks) && parseFloat(form.collegeExamMarks) <= 50 &&
               isVal(form.attendance12) && parseFloat(form.attendance12) <= 100;
      case 'personal':
        return isVal(form.fatherName) && isVal(form.address) && isVal(form.village) && isVal(form.tehsil) && isVal(form.district) && isVal(form.pincode) && /^\d{6}$/.test(form.pincode) && (form.subject12 !== 'Other' || isVal(form.subject12Custom));
      case 'health':
        return true;
      case 'family':
        return true;
      case 'income':
        return isVal(form.totalAnnualIncome) && form.incomeSources && form.incomeSources.length > 0;
      case 'housing':
        return isVal(form.houseType) && isVal(form.numRooms) && isVal(form.houseBuilder);
      case 'resources':
        return true;
      case 'land':
        return true;
      case 'photos':
        const requiredPhotos = ["1. Passport size photo", "2. Photo with supervisor", "3. Photo with family", "4. Photo of House"];
        return requiredPhotos.every(label => form.photos?.some(p => p.label === label && p.url));
      case 'declaration':
        return form.studentSignatureUrl && form.supervisorSignatureUrl && (form.fatherSignatureUrl || form.motherSignatureUrl);
      case 'remarks':
        return isVal(form.homeVisitMarks) && parseFloat(form.homeVisitMarks) <= 50 && isVal(form.supervisorRemarks);
      default:
        return true;
    }
  };

  // Ensure the page drops user gently near top if completely reloading standard
  useEffect(() => {
    if (location && location.state && location.state.isNew) {
      window.scrollTo({ top: 0, behavior: 'instant' });
    }
  }, [id, location]);

  // Form is locked if submitted, teacher_rejected, student_rejected, rejected, or approved
  const isReadOnly = status === 'submitted' || status === 'teacher_rejected' || status === 'student_rejected' || status === 'rejected' || status === 'approved';

  const handleReverseGeocode = async (lat, lng) => {
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`);
      const data = await res.json();
      if (data.address) {
        const a = data.address;
        const main = a.neighbourhood || a.suburb || a.city_district || a.village || a.hamlet || a.town || a.city || '';
        const district = a.district || a.county || '';
        const state = a.state || '';
        const parts = [main, district, state].filter(Boolean);
        setLocationAddress(parts.join(', '));
      }
    } catch (err) {
      console.error("Reverse geocoding error:", err);
    }
  };

  const captureGPS = () => {
    if (gpsCoords && verificationId) {
      toast.error("Location is already locked for this record.");
      return;
    }
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
    if (!sid || id) return;
    try {
      const res = await api.get(`/verifications/check/${sid}`);
      if (res.data.verification) {
        const { familyMembers: fm, ...formData } = res.data.verification;
        delete formData._id; delete formData.__v; delete formData.createdAt; delete formData.updatedAt;
        formData.hasIllness = formData.hasIllness ? 'yes' : 'no';
        formData.hasAchievements = formData.achievements ? 'yes' : 'no';
        if (formData.pincode === -1 || formData.pincode === '-1') formData.pincode = '';
        setForm(prev => ({ ...prev, ...formData }));
        if (fm) setFamilyMembers(fm);
        setVerificationId(res.data.verification._id);
        setStatus(res.data.verification.status);
        if (res.data.verification.gpsLat && res.data.verification.gpsLng) {
          setGpsCoords({ lat: res.data.verification.gpsLat, lng: res.data.verification.gpsLng });
          if (res.data.verification.gpsAddress) {
            setLocationAddress(res.data.verification.gpsAddress);
          } else {
            handleReverseGeocode(res.data.verification.gpsLat, res.data.verification.gpsLng);
          }
        }
        setApiMsg('');
        navigate(`/verification/home/${res.data.verification._id}`, { replace: true });
        return;
      }

      const studentRes = await api.get(`/passed-students/roll/${sid}`);
      const s = studentRes.data.data;
      if (s) {
        setForm(prev => ({
          ...prev,
          studentId: s.rollNumber || '',
          studentName: s.studentName || '',
          fatherName: s.fatherName || '',
          mobile: s.mobileNumber || '',
          village: s.villageTown || '',
          district: s.district || '',
          collegeExamMarks: s.scholarshipExamMarks || '',
          schoolName: s.schoolName12th || '',
          classFees12: (s.classFees12th !== undefined && s.classFees12th !== null) ? s.classFees12th : '',
          marks10: (s.marks10 !== undefined && s.marks10 !== null) ? s.marks10 : '',
          marks11: (s.marks11 !== undefined && s.marks11 !== null) ? s.marks11 : '',
        }));

        const streamOptions = ['Maths', 'Commerce', 'Biology', 'Arts', 'Science'];
        const trackOptions = ['Khategaon', 'Kannod', 'Satwas', 'Gopalpur', 'Narsullaganj', 'Nemawar', 'Harda', 'Timarni', 'Narmadapuram'];

        const rawStream = (s.stream12th || s.subjectIn12th || '').trim();
        const streamMatch = streamOptions.find(opt => opt.toLowerCase() === rawStream.toLowerCase());
        if (streamMatch) {
          setForm(prev => ({ ...prev, subject12: streamMatch, subject12Custom: '' }));
        } else if (rawStream) {
          setForm(prev => ({ ...prev, subject12: 'Other', subject12Custom: rawStream }));
        } else {
          setForm(prev => ({ ...prev, subject12: '', subject12Custom: '' }));
        }

        const rawTrack = (s.busTrack || '').trim();
        const trackCorrections = { 'khategoar': 'Khategaon', 'khategoan': 'Khategaon' };
        const currentTrack = trackCorrections[rawTrack.toLowerCase()] || rawTrack;
        const trackMatch = trackOptions.find(opt => opt.toLowerCase() === currentTrack.toLowerCase());
        if (trackMatch) {
          setForm(prev => ({ ...prev, track: trackMatch, trackCustom: '' }));
        } else if (rawTrack) {
          setForm(prev => ({ ...prev, track: 'Other', trackCustom: rawTrack }));
        } else {
          setForm(prev => ({ ...prev, track: '', trackCustom: '' }));
        }

        setApiMsg('');
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

            if (formData.pincode === -1 || formData.pincode === '-1') formData.pincode = '';
            setForm(prev => ({ ...prev, ...formData }));
            const streamOptions = ['Maths', 'Commerce', 'Biology', 'Arts', 'Science'];
            const rawStream = (formData.subject12 || '').trim();
            const streamMatch = streamOptions.find(opt => opt.toLowerCase() === rawStream.toLowerCase());
            if (streamMatch) {
              setForm(prev => ({ ...prev, subject12: streamMatch, subject12Custom: '' }));
            } else if (rawStream) {
              setForm(prev => ({ ...prev, subject12: 'Other', subject12Custom: rawStream }));
            }

            const trackOptions = ['Khategaon', 'Kannod', 'Satwas', 'Gopalpur', 'Narsullaganj', 'Nemawar', 'Harda', 'Timarni', 'Narmadapuram'];
            const rawTrack = (formData.track || '').trim();
            const trackCorrections = { 'khategoar': 'Khategaon', 'khategoan': 'Khategaon' };
            const currentTrack = trackCorrections[rawTrack.toLowerCase()] || rawTrack;
            const trackMatch = trackOptions.find(opt => opt.toLowerCase() === currentTrack.toLowerCase());
            if (trackMatch) {
              setForm(prev => ({ ...prev, track: trackMatch, trackCustom: '' }));
            } else if (rawTrack) {
              setForm(prev => ({ ...prev, track: 'Other', trackCustom: rawTrack }));
            }
            if (fm) setFamilyMembers(fm);
            setStatus(data.verification.status);
            if (data.verification.gpsLat && data.verification.gpsLng) {
              setGpsCoords({ lat: data.verification.gpsLat, lng: data.verification.gpsLng });
              if (data.verification.gpsAddress) {
                setLocationAddress(data.verification.gpsAddress);
              } else {
                handleReverseGeocode(data.verification.gpsLat, data.verification.gpsLng);
              }
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

  // Auto-capture GPS on mount if not already set (replaces older logic to capture only on new)
  useEffect(() => {
    if (!gpsCoords) {
      captureGPS();
    }
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked, min, max } = e.target;
    if (type === 'checkbox') {
      setForm(prev => {
        const arr = prev[name] ? [...prev[name]] : [];
        return { ...prev, [name]: checked ? [...arr, value] : arr.filter(v => v !== value) };
      });
    } else if (type === 'number') {
      let val = value;
      if (val !== '') {
        const num = parseFloat(val);
        const minVal = parseFloat(min);
        const maxVal = parseFloat(max);
        
        if (!isNaN(minVal) && num < minVal) val = min;
        if (!isNaN(maxVal) && num > maxVal) val = max;
      }
      setForm(prev => ({ ...prev, [name]: val }));
    } else {
      setForm(prev => ({ ...prev, [name]: value }));
    }
  };

  const addFamilyMember = () => setFamilyMembers(prev => [...prev, { name: '', relation: '', occupation: '', income: '', mobile: '', currentClass: '', isWorking: '', educationLevel: '' }]);
  const removeFamilyMember = (i) => setFamilyMembers(prev => prev.filter((_, idx) => idx !== i));
  const updateMember = (i, field, value) => setFamilyMembers(prev => prev.map((m, idx) => idx === i ? { ...m, [field]: value } : m));



  const handlePhotoUpload = (label, url) => {
    setForm(prev => {
      const photos = prev.photos || [];
      // For "Other photos", always append new entry
      if (label.includes("Other")) {
        return { ...prev, photos: [...photos, { label, url }] };
      }
      // For standard photos, replace existing entry with same label
      const existingIdx = photos.findIndex(p => p.label === label);
      if (existingIdx >= 0) {
        const updated = [...photos];
        updated[existingIdx] = { label, url };
        return { ...prev, photos: updated };
      }
      return { ...prev, photos: [...photos, { label, url }] };
    });
  };

  const removePhoto = (url) => {
    setForm(prev => ({
      ...prev,
      photos: (prev.photos || []).filter(p => p.url !== url)
    }));
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
      subject12: form.subject12 === 'Other' ? form.subject12Custom : form.subject12,
      track: form.track === 'Other' ? form.trackCustom : form.track,
      gpsLat: gpsCoords?.lat,
      gpsLng: gpsCoords?.lng,
      gpsAddress: locationAddress,
      rejectReason: form.rejectReason,
      verifierId: (JSON.parse(localStorage.getItem('user') || '{}')).id,
    };
    console.log('Building payload for backend:', payload);
    return payload;
  };

  // Show success toast then redirect
  const showSuccessAndRedirect = (actionStatus) => {
    const labels = {
      draft: 'Draft Saved Successfully',
      submitted: 'Verification Submitted Successfully',
      teacher_rejected: 'Rejection Recorded',
      student_rejected: 'Student Rejection Recorded',
      hold: 'Verification On Hold'
    };
    toast.success(labels[actionStatus] || 'Success');
    setTimeout(() => navigate('/home-verification'), 1000);
  };


  const handleSave = async () => {
    // Required for drafts: House Photo and Supervisor Signature
    const housePhoto = form.photos?.find(p => p.label === "4. Photo of House");
    if (!housePhoto || !housePhoto.url) {
      toast.error("Photo of House is required.", { position: 'top-center', duration: 4000 });
      setCurrentStep(9); // Step 10 is Photos
      setTimeout(() => {
        const photoSection = document.getElementById('photo4');
        if (photoSection) photoSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
      return;
    }

    if (!form.supervisorSignatureUrl) {
      toast.error("Supervisor Signature is required before saving.", { position: 'top-center', duration: 4000 });
      setCurrentStep(10); // Step 11 is Declaration (where signatures are)
      return;
    }

    setIsApiLoading(true); setLoadingAction('draft'); setApiMsg('');

    try {
      let res;
      const path = verificationId ? `/verifications/${verificationId}` : `/verifications`;
      const payload = { ...buildPayload(), status: 'draft' };

      if (verificationId) {
        res = await api.put(path, payload);
      } else {
        res = await api.post(path, payload);
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
      setApiMsg('Error: ' + err.message);
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
    if (form.subject12 === 'Other' && !isVal(form.subject12Custom)) return "Please specify the 12th Stream name.";

    // 4. Family Income
    if (!isVal(form.totalAnnualIncome)) return "Total Annual Income is required.";
    if (!form.incomeSources || form.incomeSources.length === 0) return "At least one Income Source must be selected.";

    // 5. Housing
    if (!isVal(form.houseType)) return "House Type is required.";
    if (!isVal(form.numRooms)) return "Number of Rooms is required.";
    if (!isVal(form.houseBuilder)) return "House Builder Info is required.";

    // 6. Documentation (House Photo only)
    const requiredPhotos = [
      "4. Photo of House"
    ];
    for (const label of requiredPhotos) {
      const p = form.photos?.find(p => p.label === label);
      if (!p || !p.url) {
        return `Documentation Photo missing: ${label}`;
      }
    }

    // 7. Signatures (ONLY Supervisor Signature required)
    if (!form.supervisorSignatureUrl) return "Supervisor Signature is required.";

    // 8. Evaluation & Remarks
    if (!isVal(form.attendance12)) return "Attendance in 12th is required.";
    if (!isVal(form.supervisorRemarks)) return "Supervisor Remarks are required.";

    return null; // All good
  };


  const handleSubmit = async (targetStatus = 'submitted') => {
    // Strict validation only for final submission
    if (targetStatus === 'submitted') {
      const error = validateHomeVerification();
      if (error) {
        toast.error(`Please complete all fields: ${error}`);
        setApiMsg('');
        return;
      }
    }

    setIsApiLoading(true); setLoadingAction(targetStatus); setApiMsg('');

    const payload = { ...buildPayload(), status: targetStatus };
    console.log(`Submitting form with status ${targetStatus}:`, payload);

    try {
      let res;
      const path = verificationId ? `/verifications/${verificationId}` : `/verifications`;

      if (verificationId) {
        res = await api.put(path, payload);
      } else {
        res = await api.post(path, payload);
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

  const handleHold = async () => {
    if (!holdReason.trim()) {
      setHoldReasonError('Reason is mandatory for putting verification on hold.');
      return;
    }
    setIsApiLoading(true); setLoadingAction('hold'); setApiMsg('');

    // Update the main form state so it's included in buildPayload() and future saves
    setForm(prev => ({ ...prev, holdReason }));
    const payload = { ...buildPayload(), status: 'hold', holdReason };

    try {
      const path = verificationId ? `/verifications/${verificationId}` : `/verifications`;
      if (verificationId) {
        await api.put(path, payload);
      } else {
        const res = await api.post(path, payload);
        if (res.data.verification) setVerificationId(res.data.verification._id);
      }
      toast.success('Verification put on Hold');
      setIsHoldModalOpen(false);
      setTimeout(() => navigate('/home-verification'), 1000);
    } catch (err) {
      setApiMsg('Error: ' + err.message);
    } finally { setIsApiLoading(false); setLoadingAction(null); }
  };

  const handleConfirmReject = async () => {
    if (!rejectReason.trim()) {
      setRejectReasonError('Reason is mandatory for rejecting verification.');
      return;
    }
    setIsApiLoading(true); setLoadingAction(rejectType); setApiMsg('');

    setForm(prev => ({ ...prev, rejectReason }));
    const payload = { ...buildPayload(), status: rejectType, rejectReason };

    try {
      const path = verificationId ? `/verifications/${verificationId}` : `/verifications`;
      let res;
      if (verificationId) {
        res = await api.put(path, payload);
      } else {
        res = await api.post(path, payload);
      }
      if (res.data.verification) {
        setVerificationId(res.data.verification._id);
        setStatus(rejectType);
      }
      showSuccessAndRedirect(rejectType);
      setIsRejectModalOpen(false);
    } catch (err) {
      setApiMsg('Error: ' + err.message);
    } finally { setIsApiLoading(false); setLoadingAction(null); }
  };

  const handleReject = () => handleSubmit('rejected');
  // NOTE: handleReject kept for potential future use but NOT exposed in teacher form UI.
  // Only admins can reject via the Admin Verification Portal.

  const totalMarks = [form.marks10, form.marks11, form.collegeExamMarks, form.homeVisitMarks]
    .reduce((sum, v) => sum + (parseFloat(v) || 0), 0).toFixed(2);

  const generatePDF = async () => {
    toast.loading('Finalizing professional layout...', { id: 'pdf-gen' });

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    const footerReserved = 25; // Space for "Generated by..."
    const contentWidth = pageWidth - (margin * 2);
    const contentLimitY = pageHeight - footerReserved;

    const colors = {
      primary: [249, 115, 22],
      border: [241, 245, 249],
      text: [15, 23, 42],
      muted: [100, 116, 139],
      divider: [226, 232, 240]
    };

    let y = margin;

    // Helper: Ensure Space for a whole section
    const ensureSpace = (h) => {
      if (y + h > contentLimitY) {
        doc.addPage();
        y = margin;
        return true;
      }
      return false;
    };

    const drawCard = (h, title) => {
      ensureSpace(h);
      doc.setDrawColor(...colors.border);
      doc.setFillColor(255, 255, 255);
      doc.roundedRect(margin, y, contentWidth, h, 2, 2, 'FD');

      doc.setFillColor(...colors.primary);
      doc.rect(margin + 6, y + 6, 2.5, 6, 'F');

      doc.setFontSize(13);
      doc.setTextColor(...colors.text);
      doc.setFont('helvetica', 'bold');
      doc.text(String(title).toUpperCase(), margin + 11, y + 11);

      const startY = y + 18;
      y += h + 15; // Move cursor for NEXT block
      return startY;
    };

    const labelW = 40;
    const drawGridRow = (cy, l1, v1, l2, v2) => {
      const col1X = margin + 10;
      const col2X = margin + (contentWidth / 2) + 5;

      doc.setFontSize(10);
      doc.setTextColor(...colors.muted);
      doc.setFont('helvetica', 'normal');
      doc.text(String(l1), col1X, cy);
      doc.setFontSize(11);
      doc.setTextColor(...colors.text);
      doc.text(String(v1 || 'N/A'), col1X + labelW, cy);

      if (l2) {
        doc.setFontSize(10);
        doc.setTextColor(...colors.muted);
        doc.text(String(l2), col2X, cy);
        doc.setFontSize(11);
        doc.setTextColor(...colors.text);
        doc.text(String(v2 || 'N/A'), col2X + labelW, cy);
      }
      return cy + 10;
    };

    const loadImage = (url) => {
      return new Promise((resolve) => {
        if (!url) return resolve(null);
        const img = new Image();
        img.crossOrigin = 'Anonymous';
        img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = img.width; canvas.height = img.height;
          canvas.getContext('2d').drawImage(img, 0, 0);
          resolve(canvas.toDataURL('image/jpeg', 0.8));
        };
        img.onerror = () => resolve(null);
        img.src = url;
        setTimeout(() => resolve(null), 5000);
      });
    };

    const addFooter = (doc, i, total) => {
      doc.setPage(i);
      doc.setDrawColor(...colors.divider);
      doc.setLineWidth(0.2);
      doc.line(margin, pageHeight - 15, pageWidth - margin, pageHeight - 15);
      doc.setFontSize(9);
      doc.setTextColor(...colors.muted);
      doc.text('© SSISM Scholarship System - Official Documentation', margin, pageHeight - 10);
      doc.text(`Page ${i} of ${total}`, pageWidth - margin - 20, pageHeight - 10);
    };

    const addWatermark = (doc) => {
      if (status === 'draft') {
        doc.saveGraphicsState();
        doc.setGState(new doc.GState({ opacity: 0.08 }));
        doc.setFontSize(80);
        doc.setTextColor(...colors.primary);
        doc.text('DRAFT', pageWidth / 2, pageHeight / 2, { align: 'center', angle: 45 });
        doc.restoreGraphicsState();
      }
    };

    try {
      // 1. Header Area
      const logoData = await loadImage(ssismLogo);
      if (logoData) doc.addImage(logoData, 'PNG', margin, y, 15, 15);
      doc.setFontSize(18);
      doc.setTextColor(...colors.text);
      doc.setFont('helvetica', 'bold');
      doc.text('HOME VERIFICATION REPORT', margin + 20, y + 11);

      const statusTag = (status || 'Draft').toUpperCase();
      const badgeW = statusTag.length * 3 + 10;
      doc.setFillColor(...(status === 'submitted' ? [34, 197, 94] : colors.primary));
      doc.roundedRect(pageWidth - margin - badgeW, y + 6, badgeW, 7, 1, 1, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(8);
      doc.text(statusTag, pageWidth - margin - (badgeW / 2), y + 11, { align: 'center' });

      y += 28;
      doc.setDrawColor(...colors.divider);
      doc.line(margin, y, pageWidth - margin, y);
      y += 15;

      // 2. Student Information
      let cy = drawCard(45, 'Student Information');
      cy = drawGridRow(cy, 'Student Name:', form.studentName, 'Roll Number:', form.studentId);
      cy = drawGridRow(cy, 'Father Name:', form.fatherName, 'Contact No:', form.mobile || form.mobileNumber);
      cy = drawGridRow(cy, 'Sch. Type:', form.scholarshipType, 'Bus Track:', form.track);

      // 3. Academic Details
      const marksH = 65;
      ensureSpace(marksH);
      let contentY = drawCard(marksH, 'Academic Details');
      autoTable(doc, {
        startY: contentY + 2,
        margin: { left: margin + 10, right: margin + 10, bottom: footerReserved },
        body: [
          ['10th %', `${form.marks10 || 0}%`, '11th %', `${form.marks11 || 0}%`],
          ['College Exam', form.collegeExamMarks || '0', '12th Att.', `${form.attendance12 || 0}%`],
          ['Visit Marks', form.homeVisitMarks || '0', 'Total Score', totalMarks],
          ['School', form.schoolName || 'N/A', '12th Fees', `Rs. ${form.classFees12 || 0}`]
        ],
        theme: 'grid',
        styles: { fontSize: 10, cellPadding: 6 },
        alternateRowStyles: { fillColor: [255, 247, 237] },
        columnStyles: { 0: { textColor: colors.muted }, 2: { textColor: colors.muted } }
      });

      // 4. Personal & Family (Separate sections)
      let py = drawCard(45, 'Personal & Health Info');
      py = drawGridRow(py, 'Address:', String(form.address || '').substring(0, 35), 'Tehsil/Dist:', `${form.tehsil || ''}/${form.district || ''}`);
      py = drawGridRow(py, 'Future Goal:', form.futureGoal, 'Pincode:', form.pincode);
      py = drawGridRow(py, 'Condition:', form.hasIllness === 'yes' ? `Illness: ${form.illnessName}` : 'Healthy', 'Symptoms:', form.symptoms || 'N/A');

      const famH = 25 + (familyMembers.length * 10);
      ensureSpace(famH);
      let fcy = drawCard(famH, 'Family Details');
      autoTable(doc, {
        startY: fcy + 2,
        margin: { left: margin + 10, right: margin + 10, bottom: footerReserved },
        head: [['Member Name', 'Relation', 'Occupation', 'Income', 'Class', 'Edu']],
        headStyles: { fillColor: [255, 255, 255], textColor: colors.muted },
        body: (familyMembers || []).map(m => [m.name, m.relation, m.occupation, `Rs. ${m.income}`, m.currentClass || '-', m.educationLevel || '-']),
        styles: { fontSize: 9, cellPadding: 4 },
        alternateRowStyles: { fillColor: [255, 247, 237] }
      });

      // 5. Housing & Land
      let hy = drawCard(40, 'Housing Condition');
      hy = drawGridRow(hy, 'House Type:', form.houseType, 'Rooms:', form.numRooms);
      hy = drawGridRow(hy, 'Built By:', form.houseBuilder, 'Scheme:', form.houseSchemeName || 'None');
      hy = drawGridRow(hy, 'Vehicles:', `${form.numVehicles || 0}`, 'Appliances:', (form.appliances || []).slice(0, 2).join(', '));

      let ly = drawCard(35, 'Land & Farming');
      ly = drawGridRow(ly, 'Total Land:', `${form.totalLand || 0} ${form.landUnit}`, 'Ownership:', form.landOwnership);
      const otherStr = form.livestockOther ? `${form.livestockOther}${form.livestockOtherCount ? `(${form.livestockOtherCount})` : ''}` : '';
      const liveStr = [...(form.livestock || []).filter(l => l.count > 0).map(l => `${l.name}(${l.count})`), otherStr].filter(Boolean).join(', ');
      ly = drawGridRow(ly, 'Irrigation:', form.irrigationSource === 'Other' ? form.irrigationSourceOther : form.irrigationSource, 'Livestock:', liveStr || 'None');

      // 6. Supervisor Remarks (Protected Section)
      const sigH = 60; // Keep space for signatures too
      const remarksH = 45;
      ensureSpace(remarksH + sigH + 20); // PROTECT: Ensure Remarks + Signatures stay together or on same flow

      let ry = drawCard(remarksH, 'Supervisor Evaluation');
      doc.setFontSize(11); doc.setTextColor(...colors.text); doc.setFont('helvetica', 'normal');
      const remText = form.supervisorRemarks || 'No formal remarks noted.';
      const splitRem = doc.splitTextToSize(remText, contentWidth - 30);
      doc.text(splitRem, margin + 15, ry + 4);

      // 7. Signature Block (Strictly Kept Together)
      const sigData = await Promise.all([
        loadImage(form.studentSignatureUrl),
        loadImage(form.fatherSignatureUrl || form.motherSignatureUrl),
        loadImage(form.supervisorSignatureUrl)
      ]);

      const [sS, sP, sV] = sigData;
      const sW = 35;
      const sHi = 12;
      const colW = contentWidth / 3;

      const dS = (x, lab, img) => {
        const cX = x + (colW / 2);
        if (img) doc.addImage(img, 'JPEG', cX - (sW / 2), y - 25, sW, sHi);
        doc.setDrawColor(...colors.divider);
        doc.line(cX - (sW / 2), y - 10, cX + (sW / 2), y - 10);
        doc.setFontSize(9); doc.setTextColor(...colors.muted);
        doc.text(lab, cX, y - 4, { align: 'center' });
      };

      y += 30; // Spacing logic for signature relative to remarks
      dS(margin, 'Student Signature', sS);
      dS(margin + colW, 'Parent Signature', sP);
      dS(margin + (2 * colW), 'Supervisor Signature', sV);

      // 8. Photos (Always starts on New Page if exists)
      if (form.photos?.length > 0) {
        doc.addPage(); y = margin;
        drawCard(20, 'Field Documentation Photos');
        y -= 5;
        const pW = (contentWidth / 2) - 10;
        const pH = 50;
        let px = margin + 5;
        let py = y;

        const pData = await Promise.all(form.photos.map(p => loadImage(p.url).then(img => ({ img, lab: p.label }))));
        for (let i = 0; i < pData.length; i++) {
          const { img, lab } = pData[i];
          if (!img) continue;
          if (py + pH + 25 > contentLimitY) { doc.addPage(); py = margin + 10; }
          doc.setDrawColor(...colors.border);
          doc.rect(px - 1, py - 1, pW + 2, pH + 10, 'S');
          doc.addImage(img, 'JPEG', px, py, pW, pH);
          doc.setFontSize(8); doc.text(String(lab).toUpperCase(), px + (pW / 2), py + pH + 7, { align: 'center' });
          if (i % 2 === 0) { px = margin + contentWidth / 2 + 5; } else { px = margin + 5; py += pH + 20; }
        }
      }

      // Final Render
      const totalPages = doc.internal.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        addFooter(doc, i, totalPages);
        if (i === 1) addWatermark(doc);
      }

      doc.save(`${(form.studentName || 'Report').replace(/\s+/g, '_')}_Verification.pdf`);
      toast.success('Document Layout Corrected', { id: 'pdf-gen' });
    } catch (err) {
      console.error(err);
      toast.error('Pagination Error: ' + err.message, { id: 'pdf-gen' });
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fbff] bg-gradient-to-br from-[#f8fbff] to-white font-sans">

      {/* Main Form Container */}
      <div className="w-full max-w-4xl lg:max-w-5xl xl:max-w-6xl mx-auto px-4 pt-5 pb-32 transition-all">
        {/* Minimal Sticky Progress Header */}
        <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-100 -mx-4 px-6 pt-3 pb-2 mb-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate(-1)}
                className="p-2 bg-white hover:bg-slate-50 text-slate-500 hover:text-brand-600 rounded-lg border border-slate-200 transition-all group"
                title="Return to List"
              >
                <ArrowLeft size={18} className="group-hover:-translate-x-0.5 transition-transform" />
              </button>
              <div>
                <p className="text-[10px] font-black uppercase text-slate-400 tracking-[0.1em]">Verification Panel</p>
                <h2 className="text-sm font-bold text-slate-900">{form.studentName || 'Student Registry'}</h2>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-[10px] font-black text-brand-500 uppercase tracking-widest">Step {currentStep + 1} of {STEPS.length}</p>
                <p className="text-[10px] font-bold text-slate-400">{Math.round(((currentStep + 1) / STEPS.length) * 100)}% Complete</p>
              </div>
              <div className="h-8 w-[1px] bg-slate-100 hidden sm:block" />
              <div className="w-10 h-10 rounded-full border-2 border-brand-500/20 flex items-center justify-center p-0.5">
                <div className="w-full h-full rounded-full bg-brand-50 flex items-center justify-center text-brand-600 font-bold text-xs">
                  {currentStep + 1}
                </div>
              </div>
            </div>
          </div>

          {/* Truly Ultra-Thin Modern Progress Line */}
          <div className="relative h-1 w-full bg-slate-100 rounded-full mb-6 overflow-hidden">
            <div
              className="absolute top-0 left-0 h-full bg-brand-500 transition-all duration-500 ease-out rounded-full"
              style={{ width: `${((currentStep + 1) / STEPS.length) * 100}%` }}
            />
          </div>

          {/* Step Dots Indicator */}
          <div className="flex items-center gap-3 overflow-x-auto pb-2 -mx-2 px-2 thin-scrollbar">
            {STEPS.map((step, idx) => (
              <button
                key={step.id}
                onClick={() => setCurrentStep(idx)}
                className={`flex-shrink-0 flex items-center gap-2 px-2 py-1.5 rounded-lg transition-all duration-200 border ${idx === currentStep
                  ? 'bg-brand-50 border-brand-100 text-brand-600 shadow-sm'
                  : idx < currentStep
                    ? 'bg-slate-50 border-transparent text-slate-400'
                    : 'bg-white border-transparent text-slate-300 hover:text-slate-500 hover:bg-slate-50'
                  }`}
              >
                <step.icon size={12} strokeWidth={idx === currentStep ? 2.5 : 2} />
                <span className={`text-[10px] font-bold whitespace-nowrap ${idx === currentStep ? 'block' : 'hidden md:block'}`}>
                  {step.title}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Info & Action Bar - Only on first page as per user request */}
        {currentStep === 0 && (
          <div className="flex flex-wrap items-center gap-3 text-[10px] sm:text-xs mb-4 px-1 animate-fade-in">
            <button
              onClick={captureGPS}
              disabled={isReadOnly || isLocating || (gpsCoords && (verificationId || id))}
              className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 sm:px-4 sm:py-2.5 hover:bg-slate-50 hover:text-brand-600 transition-all font-bold text-slate-600 disabled:opacity-50 shadow-sm disabled:cursor-not-allowed"
            >
              <MapPin size={12} sm:size={14} className={isLocating ? 'animate-pulse text-brand-500' : 'text-slate-400'} />
              <span>{isLocating ? 'Capturing...' : (gpsCoords ? `Location Locked` : 'Lock GPS')}</span>
              {(gpsCoords && (verificationId || id)) && <Lock size={10} sm:size={12} className="text-slate-300 ml-1" />}
            </button>

            {locationAddress && !isLocating && (
              <div className="flex items-center gap-2 bg-slate-50 border border-slate-100 rounded-lg px-2.5 py-1.5 sm:px-4 sm:py-2.5 text-slate-600 font-bold shadow-sm">
                <Home size={12} sm:size={14} className="text-slate-400" />
                <span className="truncate max-w-[150px] sm:max-w-[300px]">{locationAddress}</span>
              </div>
            )}

            <div className="flex items-center gap-4 ml-auto">
              <div className="hidden lg:flex items-center gap-2 text-slate-400 font-medium">
                <Clock size={14} />
                {new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
              </div>

              {status && (
                <div className={`px-4 py-2 rounded-lg border shadow-sm flex items-center gap-2 ${status === 'approved' ? 'bg-emerald-50 border-emerald-100 text-emerald-700' :
                  status === 'submitted' ? 'bg-blue-50 border-blue-100 text-blue-700' :
                    status.includes('rejected') ? 'bg-red-50 border-red-100 text-red-700' :
                      status === 'hold' ? 'bg-amber-50 border-amber-100 text-amber-700' :
                        'bg-slate-50 border-slate-100 text-slate-600'
                  }`}>
                  <div className={`w-2 h-2 rounded-full ${status === 'approved' ? 'bg-emerald-500' :
                    status === 'submitted' ? 'bg-blue-500' :
                      status.includes('rejected') ? 'bg-red-500' :
                        status === 'hold' ? 'bg-amber-500' :
                          'bg-slate-400'
                    }`} />
                  <span className="text-[10px] sm:text-xs font-black uppercase tracking-wider">
                    {status.replace('_', ' ')}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── Hold Reason Banner ── */}
        {status === 'hold' && form.holdReason && (
          <div className="bg-orange-50 border border-orange-100 rounded-2xl p-4 flex items-start gap-3 shadow-sm animate-fade-in mb-6">
            <div className="p-2 bg-white rounded-xl text-orange-600 shadow-sm">
              <AlertCircle size={18} />
            </div>
            <div>
              <p className="text-[10px] font-black text-orange-800 uppercase tracking-widest mb-1">Reason for Hold</p>
              <p className="text-sm text-orange-700 font-semibold leading-relaxed">{form.holdReason}</p>
            </div>
          </div>
        )}

        {/* ── Read-Only Banner ── */}
        {!isAdmin && isReadOnly && (
          <div className={`flex items-start gap-3 px-4 py-3.5 rounded-2xl border text-sm font-semibold mb-6 ${status === 'submitted'
            ? 'bg-blue-50 border-blue-200 text-blue-800'
            : status === 'rejected' || status === 'teacher_rejected' || status === 'student_rejected'
              ? 'bg-red-50 border-red-200 text-red-800'
              : 'bg-green-50 border-green-200 text-green-800'
            }`}>
            <span className="text-xl mt-0.5">
              {status === 'submitted' ? '🔒' : status === 'rejected' || status === 'teacher_rejected' || status === 'student_rejected' ? '🚫' : '✅'}
            </span>
            <div>
              <p className="font-bold">
                {status === 'submitted' && 'Form Submitted — Awaiting Admin Review'}
                {status === 'teacher_rejected' && 'Rejected by Teacher'}
                {status === 'student_rejected' && 'Rejected by Student'}
                {status === 'rejected' && 'Rejected by Admin'}
                {status === 'approved' && 'Approved by Admin — Read Only'}
              </p>
              {form.rejectReason && status.includes('rejected') && <p className="text-xs text-red-700/80 font-medium mt-1">Reason: {form.rejectReason}</p>}
            </div>
          </div>
        )}

        {/* Form Sections Area */}
        <div className={`animate-fade-in-up ${isReadOnly ? 'select-none' : ''} min-h-[65vh]`}>

          {/* 1. STUDENT INFORMATION */}
          {currentStep === 0 && (
            <SectionCard
              icon={User}
              title="Student Information"
              color="indigo"
              open={true}
              onToggle={() => { }}
              locked={isReadOnly}
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 xl:gap-6">
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
                  <div className="relative">
                    <input
                      name="verifierName"
                      value={form.verifierName}
                      readOnly
                      placeholder="Auto-filled from login"
                      className={`${inputCls} pr-9 bg-slate-100 cursor-not-allowed text-slate-600`}
                      title="Auto-filled from your logged-in account"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" title="Read-only">
                      <Lock size={16} />
                    </span>
                  </div>
                </Field>
              </div>
            </SectionCard>
          )}

          {/* 2. ACADEMIC DETAILS */}
          {currentStep === 1 && (
            <SectionCard
              icon={BookOpen}
              title="Academic Details"
              color="sky"
              open={true}
              onToggle={() => { }}
              locked={isReadOnly}
            >
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 xl:gap-6">
                {[
                  { label: '10th Percentage (Max 100)', name: 'marks10', max: 100 },
                  { label: '11th Percentage (Max 100)', name: 'marks11', max: 100 },
                  { label: 'College Exam Marks (Max 50)', name: 'collegeExamMarks', max: 50 },
                  { label: 'Attendance in 12th (Max 100 %)', name: 'attendance12', max: 100 },
                ].map(f => (
                  <Field key={f.name} label={f.label}>
                    <input name={f.name} value={form[f.name]} onChange={handleChange} type="number" min="0" max={f.max} placeholder="0" className={inputCls} />
                  </Field>
                ))}
              </div>
            </SectionCard>
          )}

          {/* 3. PERSONAL INFORMATION */}
          {currentStep === 2 && (
            <SectionCard
              icon={User}
              title="Personal Information"
              color="indigo"
              open={true}
              onToggle={() => { }}
              locked={isReadOnly}
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 xl:gap-6">
                <Field label="Father Name" required>
                  <input name="fatherName" value={form.fatherName} onChange={handleChange} placeholder="Father's full name" className={inputCls} />
                </Field>
                <Field label="12th School Name">
                  <input name="schoolName" value={form.schoolName} onChange={handleChange} placeholder="School name" className={inputCls} />
                </Field>
                <Field label="12th Class Fees (₹)">
                  <input name="classFees12" value={form.classFees12} onChange={handleChange} type="number" min="0" placeholder="Annual fees" className={inputCls} />
                </Field>
                <Field label="12th Stream">
                  <select
                    name="subject12"
                    value={form.subject12}
                    onChange={handleChange}
                    className={`${selectCls} ${form.subject12 === 'Other' ? 'focus:ring-0 focus:border-slate-200 opacity-70' : ''}`}
                  >
                    <option value="">Select Stream</option>
                    <option value="Maths">Maths</option>
                    <option value="Commerce">Commerce</option>
                    <option value="Biology">Biology</option>
                    <option value="Arts">Arts</option>
                    <option value="Science">Science</option>
                    <option value="Other">Other</option>
                  </select>
                  {form.subject12 === 'Other' && (
                    <input
                      ref={subjectRef}
                      name="subject12Custom"
                      value={form.subject12Custom || ''}
                      onChange={handleChange}
                      placeholder="Enter your stream"
                      className={`${inputCls} mt-2 border-orange-400 ring-2 ring-orange-400/30 shadow-[0_0_10px_rgba(251,146,60,0.2)]`}
                    />
                  )}
                </Field>
                <div className="sm:col-span-2 lg:col-span-3">
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
                  <input
                    name="pincode"
                    value={form.pincode}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '').slice(0, 6);
                      setForm(prev => ({ ...prev, pincode: val }));
                    }}
                    placeholder="6-digit pincode"
                    type="text"
                    inputMode="numeric"
                    className={inputCls}
                  />
                </Field>
                <Field label="Track Name">
                  <select
                    name="track"
                    value={form.track}
                    onChange={handleChange}
                    className={`${selectCls} ${form.track === 'Other' ? 'focus:ring-0 focus:border-slate-200 opacity-70' : ''}`}
                  >
                    <option value="">Select Track</option>
                    <option value="Khategaon">Khategaon</option>
                    <option value="Kannod">Kannod</option>
                    <option value="Satwas">Satwas</option>
                    <option value="Gopalpur">Gopalpur</option>
                    <option value="Narsullaganj">Narsullaganj</option>
                    <option value="Nemawar">Nemawar</option>
                    <option value="Harda">Harda</option>
                    <option value="Timarni">Timarni</option>
                    <option value="Narmadapuram">Narmadapuram</option>
                    <option value="Other">Other</option>
                  </select>
                  {form.track === 'Other' && (
                    <input
                      ref={trackRef}
                      name="trackCustom"
                      value={form.trackCustom || ''}
                      onChange={handleChange}
                      placeholder="Enter track name"
                      className={`${inputCls} mt-2 border-orange-400 ring-2 ring-orange-400/30 shadow-[0_0_10px_rgba(251,146,60,0.2)]`}
                    />
                  )}
                </Field>
                <Field label="Future Goal">
                  <input name="futureGoal" value={form.futureGoal} onChange={handleChange} placeholder="Career goal" className={inputCls} />
                </Field>
                <div className="sm:col-span-2 lg:col-span-3">
                  <label className="text-sm font-semibold text-slate-700 block mb-2">
                    <div className="flex items-center gap-1.5"><Trophy size={14} className="text-amber-500" /> Any Special Achievements / Awards?</div>
                  </label>
                  <div className="flex gap-4 sm:gap-6 mb-3">
                    <RadioItem name="hasAchievements" value="yes" label="Yes" form={form} setForm={setForm} />
                    <RadioItem name="hasAchievements" value="no" label="No" form={form} setForm={setForm} />
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
          )}

          {/* 4. HEALTH INFORMATION */}
          {currentStep === 3 && (
            <SectionCard
              icon={Heart}
              title="Health Information"
              color="rose"
              open={true}
              onToggle={() => { }}
              locked={isReadOnly}
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 xl:gap-6">
                <Field label="Do you have any illness?">
                  <div className="flex gap-4 sm:gap-6 pt-1">
                    <RadioItem name="hasIllness" value="yes" label="Yes" form={form} setForm={setForm} />
                    <RadioItem name="hasIllness" value="no" label="No" form={form} setForm={setForm} />
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
          )}

          {/* 5. FAMILY INFORMATION */}
          {currentStep === 4 && (
            <SectionCard
              icon={Users}
              title="Family Members Details"
              color="emerald"
              open={true}
              onToggle={() => { }}
              locked={isReadOnly}
            >
              <div className="overflow-x-auto rounded-xl border border-slate-200 thin-scrollbar">
                <table className="w-full text-sm min-w-[600px]">
                  <thead>
                    <tr className="bg-slate-50 text-slate-600 uppercase tracking-tight text-[9px] sm:text-[10px]">
                      {['Name', 'Relation', 'Occupation', 'Qualification', 'Income (₹)', 'Mobile', ''].map(h => (
                        <th key={h} className="px-2 py-2 sm:px-4 sm:py-3 text-left font-bold">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {familyMembers.map((m, i) => (
                      <tr key={i} className="border-t border-slate-100/60 hover:bg-slate-50/50 transition-colors">
                        <td className="px-1.5 py-1.5 sm:px-3 sm:py-2.5">
                          <input value={m.name} onChange={e => updateMember(i, 'name', e.target.value)}
                            placeholder="Name"
                            className="w-full px-1.5 py-1 rounded-md border border-slate-200 bg-white text-[11px] sm:text-sm focus:outline-none focus:border-brand-500 transition-all font-medium" />
                        </td>
                        <td className="px-1.5 py-1.5 sm:px-3 sm:py-2.5">
                          {['Father', 'Mother', 'Sister', 'Brother', ''].includes(m.relation) ? (
                            <select value={m.relation} onChange={e => updateMember(i, 'relation', e.target.value)}
                              className="w-full px-1.5 py-1 rounded-md border border-slate-200 bg-white text-[11px] sm:text-sm focus:outline-none focus:border-brand-500 cursor-pointer font-medium">
                              <option value="">Select</option>
                              <option value="Father">Father</option>
                              <option value="Mother">Mother</option>
                              <option value="Sister">Sister</option>
                              <option value="Brother">Brother</option>
                              <option value="Other">Other</option>
                            </select>
                          ) : (
                            <div className="relative group">
                              <input
                                value={m.relation === 'Other' ? '' : m.relation}
                                onChange={e => updateMember(i, 'relation', e.target.value)}
                                autoFocus
                                placeholder="Relation"
                                className="w-full pl-1.5 pr-5 py-1 rounded-md border border-orange-400 bg-white text-[11px] sm:text-sm focus:outline-none font-bold text-orange-600"
                              />
                              <button
                                onClick={() => updateMember(i, 'relation', '')}
                                className="absolute right-1 top-1/2 -translate-y-1/2 text-slate-300 hover:text-orange-500"
                              >
                                <X size={10} />
                              </button>
                            </div>
                          )}
                        </td>
                        <td className="px-1.5 py-1.5 sm:px-3 sm:py-2.5">
                          {['Labour', 'Farmer', 'Job', 'Student', ''].includes(m.occupation) ? (
                            <select value={m.occupation} onChange={e => updateMember(i, 'occupation', e.target.value)}
                              className="w-full px-1.5 py-1 rounded-md border border-slate-200 bg-white text-[11px] sm:text-sm focus:outline-none focus:border-brand-500 cursor-pointer font-medium">
                              <option value="">Select</option>
                              <option value="Labour">Labour</option>
                              <option value="Farmer">Farmer</option>
                              <option value="Job">Job</option>
                              <option value="Student">Student</option>
                              <option value="Other">Other</option>
                            </select>
                          ) : (
                            <div className="relative group">
                              <input
                                value={m.occupation === 'Other' ? '' : m.occupation}
                                onChange={e => updateMember(i, 'occupation', e.target.value)}
                                autoFocus
                                placeholder="Occupation"
                                className="w-full pl-1.5 pr-5 py-1 rounded-md border border-orange-400 bg-white text-[11px] sm:text-sm focus:outline-none font-bold text-orange-600"
                              />
                              <button
                                onClick={() => updateMember(i, 'occupation', '')}
                                className="absolute right-1 top-1/2 -translate-y-1/2 text-slate-300 hover:text-orange-500"
                              >
                                <X size={10} />
                              </button>
                            </div>
                          )}
                        </td>
                        <td className="px-1.5 py-1.5 sm:px-3 sm:py-2.5">
                          <input value={m.educationLevel || ''} onChange={e => updateMember(i, 'educationLevel', e.target.value)}
                            placeholder="Qualification"
                            className="w-full px-1.5 py-1 rounded-md border border-slate-200 bg-white text-[11px] sm:text-sm focus:outline-none focus:border-brand-500 transition-all font-medium" />
                        </td>
                        <td className="px-1.5 py-1.5 sm:px-3 sm:py-2.5">
                          <input value={m.income} onChange={e => updateMember(i, 'income', e.target.value)}
                            type="number" placeholder="Income"
                            className="w-full px-1.5 py-1 rounded-md border border-slate-200 bg-slate-50 text-[11px] sm:text-sm focus:outline-none focus:border-brand-500" />
                        </td>
                        <td className="px-1.5 py-1.5 sm:px-3 sm:py-2.5">
                          <input value={m.mobile} onChange={e => updateMember(i, 'mobile', e.target.value)}
                            placeholder="Mobile"
                            className="w-full px-1.5 py-1 rounded-md border border-slate-200 bg-slate-50 text-[11px] sm:text-sm focus:outline-none focus:border-brand-500" />
                        </td>
                        <td className="px-1.5 py-1.5">
                          <button onClick={() => removeFamilyMember(i)} className="text-red-400 hover:text-red-600">
                            <Trash2 size={14} />
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
          )}

          {/* 6. FAMILY INCOME */}
          {currentStep === 5 && (
            <SectionCard
              icon={FileText}
              title="Family Income"
              color="orange"
              open={true}
              onToggle={() => { }}
              locked={isReadOnly}
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 xl:gap-6">
                <Field label="Total Annual Family Income (₹)" required>
                  <input name="totalAnnualIncome" value={form.totalAnnualIncome} onChange={handleChange} type="number" min="0" placeholder="e.g. 150000" className={inputCls} />
                </Field>
                <div>
                  <label className="text-sm font-semibold text-slate-700 block mb-2">Income Sources</label>
                  <div className="grid grid-cols-2 gap-2">
                    {['Farming', 'Labor Work', 'Job', 'Business', 'Government Pension', 'Other'].map(src => (
                      <CheckItem key={src} name="incomeSources" value={src} label={src} form={form} setForm={setForm} />
                    ))}
                  </div>
                </div>
                {(form.incomeSources || []).includes('Other') && (
                  <Field label="Specify Other Income Source">
                    <input name="incomeOther" value={form.incomeOther} onChange={handleChange} placeholder="Describe" className={inputCls} />
                  </Field>
                )}
                <div className="sm:col-span-2 lg:col-span-3">
                  <Field label="Challenges Faced by Family">
                    <textarea name="familyChallenges" value={form.familyChallenges} onChange={handleChange} rows={3} placeholder="Describe any major challenges..." className={textareaCls} />
                  </Field>
                </div>
              </div>
            </SectionCard>
          )}

          {/* 7. HOUSING CONDITION */}
          {currentStep === 6 && (
            <SectionCard
              icon={Home}
              title="Housing Condition"
              color="amber"
              open={true}
              onToggle={() => { }}
              locked={isReadOnly}
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 xl:gap-6">
                <div>
                  <label className="text-[11px] sm:text-sm font-semibold text-slate-700 block mb-2">Type of House</label>
                  <div className="flex flex-wrap gap-2.5 sm:gap-4">
                    {['Pucca', 'Kaccha', 'Semi Pucca'].map(t => <RadioItem key={t} name="houseType" value={t} label={t} form={form} setForm={setForm} />)}
                  </div>
                </div>
                <Field label="Number of Rooms">
                  <input name="numRooms" value={form.numRooms} onChange={handleChange} type="number" min="1" placeholder="e.g. 3" className={inputCls} />
                </Field>
                <div>
                  <label className="text-[11px] sm:text-sm font-semibold text-slate-700 block mb-2">Who Built the House?</label>
                  <div className="flex flex-wrap gap-x-4 sm:gap-x-6 gap-y-2 mb-3">
                    <RadioItem name="houseBuilder" value="Self" label="Self" form={form} setForm={setForm} />
                    <RadioItem name="houseBuilder" value="Government Scheme" label="Government Scheme" form={form} setForm={setForm} />
                    <RadioItem name="houseBuilder" value="Loan" label="Loan" form={form} setForm={setForm} />
                  </div>
                  {form.houseBuilder === 'Government Scheme' && (
                    <div className="mt-3">
                      <Field label="Scheme Name">
                        {['PM Awas Yojana', ''].includes(form.houseSchemeName) ? (
                          <select
                            name="houseSchemeName"
                            value={form.houseSchemeName}
                            onChange={handleChange}
                            className={selectCls}
                          >
                            <option value="">Select Scheme</option>
                            <option value="PM Awas Yojana">PM Awas Yojana</option>
                            <option value="Other">Other</option>
                          </select>
                        ) : (
                          <div className="relative group">
                            <input
                              name="houseSchemeName"
                              value={form.houseSchemeName === 'Other' ? '' : form.houseSchemeName}
                              onChange={handleChange}
                              autoFocus
                              placeholder="Enter Scheme Name"
                              className={`${inputCls} pr-8 border-orange-400 font-semibold text-orange-700 shadow-[0_0_15px_rgba(251,146,60,0.1)]`}
                            />
                            <button
                              onClick={() => setForm(prev => ({ ...prev, houseSchemeName: '' }))}
                              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-orange-500 transition-colors"
                              title="Back to options"
                            >
                              <X size={14} strokeWidth={3} />
                            </button>
                          </div>
                        )}
                      </Field>
                    </div>
                  )}
                </div>
              </div>
            </SectionCard>
          )}

          {/* 8. HOUSEHOLD RESOURCES & VEHICLES */}
          {currentStep === 7 && (
            <SectionCard
              icon={Home}
              title="Household Resources & Vehicles"
              color="blue"
              open={true}
              onToggle={() => { }}
              locked={isReadOnly}
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 xl:gap-6">
                <div>
                  <label className="text-[11px] sm:text-sm font-semibold text-slate-700 block mb-2">Appliances</label>
                  <div className="flex flex-col gap-2">
                    {['Refrigerator', 'Washing Machine', 'Air Conditioner'].map(a => (
                      <CheckItem key={a} name="appliances" value={a} label={a} form={form} setForm={setForm} />
                    ))}
                  </div>
                </div>
                <div>
                  <Field label="Number of Vehicles">
                    <input name="numVehicles" value={form.numVehicles} onChange={handleChange} type="number" min="0" placeholder="0" className={inputCls} />
                  </Field>
                  <label className="text-[11px] sm:text-xs font-semibold text-slate-700 block mt-2 mb-1.5">Vehicle Types</label>
                  <div className="grid grid-cols-2 gap-1.5 sm:gap-2">
                    {['Bicycle', 'Bike', 'Car', 'Tractor', 'Other'].map(v => (
                      <CheckItem key={v} name="vehicleTypes" value={v} label={v} form={form} setForm={setForm} />
                    ))}
                  </div>
                  {(form.vehicleTypes || []).includes('Other') && (
                    <div className="mt-3 animate-fade-in">
                      <Field label="Specify Vehicle Name">
                        <input
                          name="vehicleTypesOther"
                          value={form.vehicleTypesOther || ''}
                          onChange={handleChange}
                          placeholder="e.g. Bull Cart"
                          className={`${inputCls} border-orange-400 font-semibold text-orange-700 shadow-[0_0_15px_rgba(251,146,60,0.1)]`}
                        />
                      </Field>
                    </div>
                  )}
                </div>
              </div>
            </SectionCard>
          )}

          {/* 9. LAND & FARMING DETAILS */}
          {currentStep === 8 && (
            <SectionCard
              icon={Tractor}
              title="Land & Farming Details"
              color="green"
              open={true}
              onToggle={() => { }}
              locked={isReadOnly}
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 xl:gap-6">
                <div className="sm:col-span-1 lg:col-span-1">
                  <Field label="Total Land Area" required>
                    <div className="flex items-center gap-2">
                      <input
                        name="totalLand"
                        value={form.totalLand}
                        onChange={handleChange}
                        type="number"
                        min="0"
                        placeholder="0"
                        className={`${inputCls} w-24`}
                      />
                      <select
                        name="landUnit"
                        value={form.landUnit}
                        onChange={handleChange}
                        className={`${selectCls} w-24`}
                      >
                        <option value="Acre">Acre</option>
                        <option value="Bigha">Bigha</option>
                      </select>
                    </div>
                  </Field>
                </div>
                <div>
                  <label className="text-[11px] sm:text-xs font-semibold text-slate-700 block mb-1.5">Ownership</label>
                  <div className="flex gap-4">
                    <RadioItem name="landOwnership" value="Personal Land" label="Personal" form={form} setForm={setForm} />
                    <RadioItem name="landOwnership" value="Family Land" label="Family" form={form} setForm={setForm} />
                  </div>
                </div>
                <div>
                  <label className="text-[11px] sm:text-xs font-semibold text-slate-700 block mb-1.5">Land Type</label>
                  <div className="flex gap-4">
                    <RadioItem name="landType" value="Irrigated" label="Irrigated" form={form} setForm={setForm} />
                    <RadioItem name="landType" value="Non Irrigated" label="Non Irrigated" form={form} setForm={setForm} />
                  </div>
                </div>
                <div>
                  <label className="text-[11px] sm:text-xs font-semibold text-slate-700 block mb-1.5">Irrigation Source</label>
                  <div className="grid grid-cols-2 gap-1.5 mb-1.5">
                    {['Tube Well', 'Canal', 'Rain Based', 'Well', 'Other'].map(s => (
                      <RadioItem key={s} name="irrigationSource" value={s} label={s} form={form} setForm={setForm} />
                    ))}
                  </div>
                  {form.irrigationSource === 'Other' && (
                    <div className="animate-fade-in">
                      <Field label="Specify Source">
                        <input
                          name="irrigationSourceOther"
                          value={form.irrigationSourceOther || ''}
                          onChange={handleChange}
                          placeholder="e.g. River"
                          className={`${inputCls} border-orange-400 font-semibold text-orange-700 shadow-[0_0_15px_rgba(251,146,60,0.1)]`}
                        />
                      </Field>
                    </div>
                  )}
                </div>
                <div className="sm:col-span-2 lg:col-span-4">
                  <label className="text-[11px] font-bold text-slate-800 flex items-center gap-2 mb-3">
                    <Users size={14} className="text-emerald-500" /> Livestock Details
                  </label>
                  <div className="flex flex-wrap items-start gap-x-8 gap-y-6">
                    {['Cow', 'Buffalo', 'Goat', 'Other'].map(l => {
                      const isSelected = form.livestock?.some(ls => ls.name === l);
                      const currentItem = form.livestock?.find(ls => ls.name === l);

                      return (
                        <div key={l} className="flex flex-col gap-1.5 min-w-[110px]">
                          <div className="flex items-center gap-1.5 group">
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={(e) => {
                                  const checked = e.target.checked;
                                  setForm(prev => {
                                    const list = prev.livestock ? [...prev.livestock] : [];
                                    if (checked) {
                                      return { ...prev, livestock: [...list, { name: l, count: '0' }] };
                                    } else {
                                      const updated = list.filter(ls => ls.name !== l);
                                      const extra = l === 'Other' ? { livestockOther: '', livestockOtherCount: '' } : {};
                                      return { ...prev, livestock: updated, ...extra };
                                    }
                                  });
                                }}
                                className="w-3.5 h-3.5 rounded border-slate-300 text-orange-600 focus:ring-orange-500 transition-all cursor-pointer"
                              />
                              <span className={`text-xs font-semibold transition-all ${isSelected ? 'text-slate-900 border-b-2 border-slate-900/10' : 'text-slate-600 group-hover:text-slate-900'}`}>{l}</span>
                            </label>

                            {isSelected && (
                              <div className="flex items-center animate-fade-in text-[10px] sm:text-xs text-slate-400 font-normal">
                                (
                                <input
                                  type="number"
                                  min="1"
                                  value={l === 'Other' ? form.livestockOtherCount : (currentItem?.count || '')}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    if (l === 'Other') {
                                      setForm(prev => ({ ...prev, livestockOtherCount: val }));
                                    } else {
                                      setForm(prev => ({
                                        ...prev,
                                        livestock: prev.livestock.map(ls => ls.name === l ? { ...ls, count: val } : ls)
                                      }));
                                    }
                                  }}
                                  placeholder="0"
                                  className="w-8 sm:w-10 px-1 py-0 bg-transparent text-center border-b border-slate-300 text-slate-900 font-bold focus:outline-none focus:border-slate-500 placeholder:text-slate-200 text-xs sm:text-sm"
                                />
                                )
                              </div>
                            )}
                          </div>

                          {isSelected && l === 'Other' && (
                            <div className="animate-fade-in ml-1 mt-0.5">
                              <input
                                value={form.livestockOther || ''}
                                onChange={(e) => setForm(prev => ({ ...prev, livestockOther: e.target.value }))}
                                placeholder="Specify Name"
                                className="w-full px-1.5 py-1 sm:py-2 rounded-md border border-orange-100 bg-white text-[9px] sm:text-xs font-bold text-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-400/30 shadow-sm"
                                autoFocus
                              />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </SectionCard>
          )}

          {/* 10. PHOTO DOCUMENTATION */}
          {currentStep === 9 && (
            <SectionCard
              icon={Camera}
              title="Photo Documentation"
              color="violet"
              open={true}
              onToggle={() => { }}
              locked={isReadOnly}
            >
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 sm:gap-6">
                <PhotoUpload studentId={form.studentId} id="photo1" label="1. Passport size photo" onUpload={(url) => handlePhotoUpload("1. Passport size photo", url)} previewUrl={getPhotoPreview("1. Passport size photo")} />
                <PhotoUpload studentId={form.studentId} id="photo2" label="2. Photo with supervisor" onUpload={(url) => handlePhotoUpload("2. Photo with supervisor", url)} previewUrl={getPhotoPreview("2. Photo with supervisor")} />
                <PhotoUpload studentId={form.studentId} id="photo3" label="3. Photo with family" onUpload={(url) => handlePhotoUpload("3. Photo with family", url)} previewUrl={getPhotoPreview("3. Photo with family")} />
                <PhotoUpload
                  studentId={form.studentId}
                  id="photo4"
                  label="4. Photo of House"
                  required={true}
                  isMissing={!getPhotoPreview("4. Photo of House")}
                  onUpload={(url) => handlePhotoUpload("4. Photo of House", url)}
                  previewUrl={getPhotoPreview("4. Photo of House")}
                />
                <PhotoUpload studentId={form.studentId} id="photo-add-more" label="5. Other photos" onUpload={(url) => handlePhotoUpload("Other photos", url)} previewUrl={null} />
              </div>

              {/* Display list of uploaded "Other photos" */}
              {(form.photos || []).filter(p => p.label.includes("Other")).length > 0 && (
                <div className="mt-4 border-t border-slate-100 pt-4">
                  <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider px-1 block mb-2">Uploaded Other Photos</span>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                    {(form.photos || []).filter(p => p.label.includes("Other")).map((p, idx) => (
                      <div key={idx} className="relative group aspect-square rounded-xl overflow-hidden border-2 border-slate-100 shadow-sm bg-slate-50">
                        <img src={p.url} alt="Other document" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => removePhoto(p.url)}
                          className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center hover:bg-red-600 active:scale-95"
                          title="Delete Photo"
                        >
                          <Trash2 size={10} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </SectionCard>
          )}

          {/* 11. DECLARATION */}
          {currentStep === 10 && (
            <SectionCard
              icon={FileText}
              title="Declaration"
              color="slate"
              open={true}
              onToggle={() => { }}
              locked={isReadOnly}
            >
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs text-slate-700 leading-relaxed italic mb-3">
                "I hereby declare that the information provided above is true and correct to the best of my knowledge. If any information is found incorrect or false, the scholarship may be cancelled."
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <SignatureField studentId={form.studentId} label="Student Signature" onUpload={url => handleChange({ target: { name: 'studentSignatureUrl', value: url } })} previewUrl={form.studentSignatureUrl} />
                <SignatureField studentId={form.studentId} label="Father Signature" onUpload={url => handleChange({ target: { name: 'fatherSignatureUrl', value: url } })} previewUrl={form.fatherSignatureUrl} />
                <SignatureField studentId={form.studentId} label="Mother Signature" onUpload={url => handleChange({ target: { name: 'motherSignatureUrl', value: url } })} previewUrl={form.motherSignatureUrl} />
                <SignatureField studentId={form.studentId} label="Supervisor Signature" onUpload={url => handleChange({ target: { name: 'supervisorSignatureUrl', value: url } })} previewUrl={form.supervisorSignatureUrl} />
              </div>
            </SectionCard>
          )}

          {/* 12. EVALUATION & REMARKS */}
          {currentStep === 11 && (
            <SectionCard
              icon={AlertCircle}
              title="Evaluation & Remarks"
              color="sky"
              open={true}
              onToggle={() => { }}
              locked={isReadOnly}
            >
              <div className="grid grid-cols-1 gap-5">
                <Field label="Home Visit Marks (Max 50)">
                  <div className="flex items-center gap-3">
                    <input
                      name="homeVisitMarks"
                      value={form.homeVisitMarks}
                      onChange={handleChange}
                      type="number"
                      min="0"
                      max="50"
                      placeholder="0"
                      className={`${inputCls} max-w-[80px] sm:max-w-[100px] font-bold text-brand-600 text-sm sm:text-base`}
                    />
                    <span className="text-xs sm:text-sm font-medium text-slate-500 bg-slate-100 px-2 py-1 sm:px-3 sm:py-2 rounded-md border border-slate-200">/ 50 Points</span>
                  </div>
                </Field>

                <Field label="Supervisor Remarks">
                  <textarea name="supervisorRemarks" value={form.supervisorRemarks} onChange={handleChange}
                    rows={4} placeholder="e.g. Home verification accepted. Family conditions verified..." className={textareaCls} />
                </Field>
              </div>
            </SectionCard>
          )}

        </div>{/* end form sections area */}

        {/* Persistent Bottom Navigation */}
        <div className="fixed bottom-0 left-0 w-full bg-white/95 backdrop-blur-md border-t border-slate-200 p-2.5 sm:p-4 z-40 shadow-[0_-10px_30px_rgba(0,0,0,0.05)]">
          <div className="w-full max-w-4xl lg:max-w-5xl xl:max-w-6xl mx-auto flex gap-2 sm:gap-4 transition-all pb-2">
            {currentStep > 0 && (
              <button
                onClick={() => {
                  setCurrentStep(prev => prev - 1);
                }}
                className={`flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 py-1 sm:py-2 bg-slate-100/80 text-slate-500 font-bold rounded-xl hover:bg-slate-200 active:scale-95 transition-all text-[8px] sm:text-[10px] uppercase tracking-wider shrink-0 ${currentStep === STEPS.length - 1 ? 'w-10 sm:w-auto px-1 sm:px-4' : 'flex-1'}`}
              >
                <ArrowLeft size={14} sm:size={16} />
                <span>Back</span>
              </button>
            )}

            {currentStep < STEPS.length - 1 ? (
              <button
                onClick={() => {
                  setCurrentStep(prev => prev + 1);
                }}
                className="flex-1 py-2 sm:py-2.5 rounded-xl font-black text-[10px] sm:text-xs uppercase tracking-[0.2em] transition-all shadow-md flex items-center justify-center gap-2 bg-gradient-to-r from-orange-500 to-rose-500 text-white shadow-orange-200 hover:shadow-orange-300 active:scale-95"
              >
                Next Step
                <ChevronRight size={14} sm:size={16} />
              </button>
            ) : (
              <div className="flex-[3] flex gap-2 w-full">
                <button
                  onClick={() => setIsRejectModalOpen(true)}
                  disabled={isApiLoading || isReadOnly}
                  className="flex-1 py-1 sm:py-2 px-0.5 bg-red-50 border border-red-100 text-red-600 font-bold rounded-xl hover:bg-red-100 active:scale-95 transition-all text-[8px] sm:text-[9px] uppercase flex flex-col sm:flex-row items-center justify-center gap-1"
                >
                  {(loadingAction === 'teacher_rejected' || loadingAction === 'student_rejected') ? <Loader size="xs" color="red" /> : <XCircle size={12} sm:size={14} />}
                  <span>Reject</span>
                </button>
                <button
                  onClick={handleSave}
                  disabled={isApiLoading || isReadOnly}
                  className="flex-1 py-1 sm:py-2 px-0.5 bg-white border border-slate-200 text-slate-500 font-bold rounded-xl hover:bg-slate-50 active:scale-95 transition-all text-[8px] sm:text-[9px] uppercase flex flex-col sm:flex-row items-center justify-center gap-1"
                >
                  {loadingAction === 'draft' ? <Loader size="xs" color="orange" /> : <Save size={12} sm:size={14} />}
                  <span>Draft</span>
                </button>
                <button
                  onClick={() => {
                    const error = validateHomeVerification();
                    if (error) { toast.error(error); return; }
                    confirmAction("Submit for final review?", () => handleSubmit('submitted'));
                  }}
                  disabled={isApiLoading || isReadOnly}
                  className={`flex-[1.5] py-1 sm:py-2 px-0.5 rounded-xl font-black text-[8px] sm:text-[10px] uppercase tracking-wider transition-all shadow-md flex flex-col sm:flex-row items-center justify-center gap-1
                    ${!isReadOnly
                      ? 'bg-emerald-500 text-white shadow-emerald-200 hover:bg-emerald-600'
                      : 'bg-slate-100 text-slate-400 cursor-not-allowed shadow-none'}`}
                >
                  {loadingAction === 'submitted' ? <Loader size="xs" color="white" /> : <CheckCircle size={12} sm:size={14} />}
                  <span>Submit</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ── Hold Reason Modal ── */}
        {isHoldModalOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-scale-in">
              <div className="px-4 py-3.5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <h3 className="font-black text-slate-800 flex items-center gap-2 text-xs">
                  <Clock size={16} className="text-orange-500" />
                  Put Verification on Hold
                </h3>
                <button onClick={() => setIsHoldModalOpen(false)} className="p-1.5 hover:bg-slate-100 rounded-full transition-colors">
                  <X size={18} className="text-slate-400" />
                </button>
              </div>
              <div className="p-4">
                <p className="text-[11px] text-slate-500 mb-3 font-medium leading-relaxed">
                  Please provide a reason for putting this student's verification on hold.
                </p>
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Reason for Hold</label>
                <textarea
                  value={holdReason}
                  onChange={(e) => {
                    setHoldReason(e.target.value);
                    if (e.target.value.trim()) setHoldReasonError('');
                  }}
                  placeholder="E.g. Missing documents..."
                  className={`w-full p-3 rounded-xl border ${holdReasonError ? 'border-red-300 ring-4 ring-red-50' : 'border-slate-200 focus:border-orange-400 focus:ring-4 focus:ring-orange-50'} transition-all text-xs min-h-[80px] outline-none font-medium text-slate-700`}
                />
                {holdReasonError && <p className="text-red-500 text-[9px] mt-1.5 font-bold flex items-center gap-1"><AlertCircle size={12} /> {holdReasonError}</p>}
              </div>
              <div className="px-4 py-3 bg-slate-50 flex gap-2.5 justify-end border-t border-slate-100">
                <button onClick={() => setIsHoldModalOpen(false)} className="px-4 py-2 text-[11px] font-bold text-slate-500 hover:bg-white rounded-xl transition-all border border-transparent hover:border-slate-200">
                  Cancel
                </button>
                <button
                  onClick={handleHold}
                  disabled={isApiLoading}
                  className="px-5 py-2 bg-orange-500 hover:bg-orange-600 text-white text-[11px] font-black rounded-xl shadow-lg shadow-orange-200 transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isApiLoading && loadingAction === 'hold' ? <Loader size="xs" color="white" /> : 'Confirm Hold'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── Reject Reason Modal ── */}
        {isRejectModalOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-scale-in">
              <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-red-50/50">
                <h3 className="font-black text-slate-800 flex items-center gap-2 text-sm">
                  <XCircle size={18} className="text-red-500" />
                  Reject Verification
                </h3>
                <button onClick={() => setIsRejectModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                  <X size={20} className="text-slate-400" />
                </button>
              </div>
              <div className="p-6">
                <p className="text-xs text-slate-500 mb-4 font-medium leading-relaxed">
                  Select who opted to reject/cancel this application and provide a short reason.
                </p>
                <div className="flex flex-col gap-2 mb-4">
                  <label className={`flex items-center gap-2.5 p-2 rounded-xl border cursor-pointer transition-all ${rejectType === 'student_rejected' ? 'border-red-400 bg-red-50 ring-2 ring-red-500/20' : 'border-slate-200 hover:border-red-200'}`}>
                    <input type="radio" value="student_rejected" checked={rejectType === 'student_rejected'} onChange={(e) => setRejectType(e.target.value)} className="w-3.5 h-3.5 accent-red-500" />
                    <div className="flex-1">
                      <span className="text-xs font-bold text-slate-700 block text-left">Rejected by Student</span>
                      <span className="text-[9px] text-slate-500 font-medium block text-left mt-0.5">Student no longer wants to proceed.</span>
                    </div>
                  </label>
                  <label className={`flex items-center gap-2.5 p-2 rounded-xl border cursor-pointer transition-all ${rejectType === 'teacher_rejected' ? 'border-red-400 bg-red-50 ring-2 ring-red-500/20' : 'border-slate-200 hover:border-red-200'}`}>
                    <input type="radio" value="teacher_rejected" checked={rejectType === 'teacher_rejected'} onChange={(e) => setRejectType(e.target.value)} className="w-3.5 h-3.5 accent-red-500" />
                    <div className="flex-1">
                      <span className="text-xs font-bold text-slate-700 block text-left">Rejected by Teacher</span>
                      <span className="text-[9px] text-slate-500 font-medium block text-left mt-0.5">Form invalid or unverified conditions.</span>
                    </div>
                  </label>
                </div>

                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block text-left">Reason for Rejection *</label>
                <textarea
                  value={rejectReason}
                  onChange={(e) => {
                    setRejectReason(e.target.value);
                    if (e.target.value.trim()) setRejectReasonError('');
                  }}
                  placeholder="Type specific reason here..."
                  className={`w-full p-3 rounded-xl border ${rejectReasonError ? 'border-red-300 ring-4 ring-red-50' : 'border-slate-200 focus:border-red-400 focus:ring-4 focus:ring-red-50'} transition-all text-xs min-h-[80px] outline-none font-medium text-slate-700`}
                />
                {rejectReasonError && <p className="text-red-500 text-[9px] mt-1.5 font-bold flex items-center gap-1 justify-start"><AlertCircle size={12} /> {rejectReasonError}</p>}
              </div>
              <div className="px-6 py-4 bg-slate-50 flex gap-3 justify-end border-t border-slate-100">
                <button onClick={() => setIsRejectModalOpen(false)} className="px-5 py-2.5 text-xs font-bold text-slate-500 hover:bg-white rounded-xl transition-all border border-transparent hover:border-slate-200">
                  Cancel
                </button>
                <button
                  onClick={handleConfirmReject}
                  disabled={isApiLoading}
                  className="px-6 py-2.5 bg-red-500 hover:bg-red-600 text-white text-xs font-black rounded-xl shadow-lg shadow-red-200 transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {(isApiLoading && (loadingAction === 'teacher_rejected' || loadingAction === 'student_rejected')) ? <Loader size="sm" color="white" /> : 'Confirm Reject'}
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default HomeVerificationPage;
