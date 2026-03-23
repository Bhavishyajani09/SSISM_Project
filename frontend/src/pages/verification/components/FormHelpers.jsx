import React, { useState, useRef, useEffect } from 'react';
import { Camera, Plus, ChevronDown, ChevronUp, X, RotateCw, Check, Image as ImageIcon, AlertCircle, Lock } from 'lucide-react';
import Loader from '../../../components/Loader';
import api from '../../../api';
import toast from 'react-hot-toast';

// Helper: Collapsible Card (Accordion)
export const SectionCard = React.memo(({ icon: Icon, title, color = 'orange', children, open, onToggle, locked }) => {
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

  useEffect(() => {
    if (open && cardRef.current) {
      setTimeout(() => {
        const isMobile = window.innerWidth < 1024;
        const safeOffset = isMobile ? 240 : 180;
        const bodyRect = document.body.getBoundingClientRect().top;
        const elementRect = cardRef.current.getBoundingClientRect().top;
        const elementPosition = elementRect - bodyRect;
        const offsetPosition = Math.max(0, elementPosition - safeOffset);

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }, 50);
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
});

// Helper: Form Field
export const Field = React.memo(({ label, children, required }) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-[11px] sm:text-xs font-semibold text-slate-700">
      {label}{required && <span className="text-red-500 ml-1">*</span>}
    </label>
    {children}
  </div>
));

export const inputCls = "w-full px-3 py-1.5 sm:py-2.5 rounded-lg border border-slate-200 bg-white text-slate-800 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/10 focus:border-brand-500/30 transition-all placeholder:text-slate-400";
export const selectCls = inputCls + " cursor-pointer";
export const textareaCls = inputCls + " resize-none min-h-[80px] sm:min-h-[120px]";

export const CameraCaptureModal = ({ isOpen, onClose, onCapture }) => {
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

export const PhotoUpload = React.memo(({ label, id, onUpload, previewUrl, studentId, required, isMissing }) => {
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
      // Corrected to use authenticated api instance
      const res = await api.post('/upload', formData);
      if (res.data.url && onUpload) {
        onUpload(res.data.url);
      }
      return res.data.url;
    } catch (err) {
      console.error('Upload error', err);
      toast.error('Failed to upload image');
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
              {label.includes("Other") ? <Plus size={20} strokeWidth={3} /> : <Camera size={18} />}
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
});

export const SignatureField = React.memo(({ label, onUpload, previewUrl, studentId }) => {
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
        toast.error('Failed to upload signature');
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
});

export const CheckItem = React.memo(({ name, value, label, checked, onChange }) => {
  return (
    <label className={`flex items-center gap-2 p-1.5 sm:p-2.5 rounded-lg border transition-all cursor-pointer ${checked ? 'border-brand-500 bg-brand-50/30' : 'border-slate-100 bg-slate-50/30 hover:bg-white'}`}>
      <input
        type="checkbox"
        checked={checked}
        onChange={() => onChange(name, value)}
        className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
      />
      <span className="text-[11px] sm:text-sm font-medium text-slate-700">{label}</span>
    </label>
  );
});

export const RadioItem = React.memo(({ name, value, label, checked, onChange }) => {
  return (
    <label className={`flex items-center gap-2 p-1.5 sm:p-2.5 rounded-lg border transition-all cursor-pointer ${checked ? 'border-brand-500 bg-brand-50/30 shadow-sm' : 'border-slate-100 bg-slate-50/30 hover:bg-white'}`}>
      <input
        type="radio"
        name={name}
        value={value}
        checked={checked}
        onChange={() => onChange(name, value)}
        className="w-3.5 h-3.5 sm:w-4 sm:h-4 border-slate-300 text-brand-600 focus:ring-brand-500"
      />
      <span className="text-[11px] sm:text-sm font-medium text-slate-700">{label}</span>
    </label>
  );
});
