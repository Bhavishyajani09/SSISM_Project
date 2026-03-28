import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
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

// Imported Components
import {
  inputCls,
  selectCls,
  textareaCls
} from './components/FormHelpers';
import {
  StudentInfoSection,
  AcademicSection,
  PersonalSection,
  HealthSection,
  FamilySection,
  IncomeSection,
  HousingSection,
  ResourcesSection,
  LandSection,
  PhotosSection,
  DeclarationSection,
  RemarksSection
} from './components/StepSections';

// Derive the logged-in user's display name from localStorage
const getLoggedInUserName = () => {
  try {
    const stored = localStorage.getItem('user');
    if (!stored) return 'Unknown User';
    const user = JSON.parse(stored);
    return user.name?.trim() || user.email?.split('@')[0] || 'Unknown User';
  } catch {
    return 'Unknown User';
  }
};

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
    livestock: [],
    livestockOther: '',
    livestockOtherCount: '',
    supervisorRemarks: '',
    hasAchievements: 'no', achievements: '',
    photos: [],
    studentSignatureUrl: '',
    fatherSignatureUrl: '',
    motherSignatureUrl: '',
    supervisorSignatureUrl: '',
    rejectReason: '',
  });

  const [familyMembers, setFamilyMembers] = useState([
    { name: '', relation: '', occupation: '', income: '', mobile: '', currentClass: '', isWorking: '', educationLevel: '' }
  ]);
  const [status, setStatus] = useState(null);
  const [verificationId, setVerificationId] = useState(null);
  const [isApiLoading, setIsApiLoading] = useState(!!(id || location.state?.studentData));
  const [apiMsg, setApiMsg] = useState('');
  const [gpsCoords, setGpsCoords] = useState(null);
  const [isLocating, setIsLocating] = useState(false);
  const [locationAddress, setLocationAddress] = useState('');
  const [currentStep, setCurrentStep] = useState(0); // 0-indexed
  const [loadingAction, setLoadingAction] = useState(null);

  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectType, setRejectType] = useState('teacher_rejected');
  const [rejectReason, setRejectReason] = useState('');
  const [rejectReasonError, setRejectReasonError] = useState('');

  const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
  const userRole = storedUser.role || 'teacher';
  const isAdmin = userRole === 'admin';

  const firstLoadDone = useRef(false);
  const subjectRef = useRef(null);
  const trackRef = useRef(null);
  const tabsRef = useRef(null);

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

  // Automatic Horizontal Scroll for Tabs
  useEffect(() => {
    if (tabsRef.current) {
      const activeTab = tabsRef.current.querySelector(`#step-tab-${currentStep}`);
      if (activeTab) {
        const container = tabsRef.current;
        const scrollLeft = activeTab.offsetLeft - (container.offsetWidth / 2) + (activeTab.offsetWidth / 2);
        container.scrollTo({ left: scrollLeft, behavior: 'smooth' });
      }
    }
  }, [currentStep]);

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
  // Admin can edit in 'submitted' state
  const isReadOnly = isAdmin
    ? (status === 'approved' || status === 'rejected')
    : (status === 'submitted' || status === 'teacher_rejected' || status === 'student_rejected' || status === 'rejected' || status === 'approved');

  const handleReverseGeocode = useCallback(async (lat, lng) => {
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`);
      const data = await res.json();
      if (data.address) {
        const a = data.address;
        // Aggressive mapping for Indian addresses
        const village = a.village || a.hamlet || a.suburb || a.locality || a.neighbourhood || a.subdistrict || a.town || a.city || '';
        const district = a.state_district || a.district || a.county || a.city || '';
        const state = a.state || '';

        const districtDisplay = district ? `Dist: ${district}` : '';
        const formatted = [village, districtDisplay, state].filter(Boolean).join(', ');
        setLocationAddress(formatted);

        // Auto-fill form fields
        setForm(prev => ({
          ...prev,
          village: prev.village || village,
          district: prev.district || district,
          state: prev.state || state
        }));
      }
    } catch (err) {
      console.error("Reverse geocoding error:", err);
    }
  }, []);

  const captureGPS = useCallback(() => {
    if (gpsCoords && (verificationId || id)) {
      toast.error("Location is already locked for this record.", { id: 'gps-lock-error' });
      return;
    }

    if (navigator.geolocation) {
      setIsLocating(true);
      const toastId = toast.loading("Capturing precise location...", { position: 'top-center' });

      navigator.geolocation.getCurrentPosition(
        pos => {
          const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          setGpsCoords(coords);
          handleReverseGeocode(coords.lat, coords.lng);
          setIsLocating(false);
          toast.success("Location locked successfully!", { id: toastId });
        },
        err => {
          console.error("GPS Error:", err);
          setIsLocating(false);
          let errorMsg = "Unable to capture location.";
          if (err.code === 1) errorMsg = "Location permission denied. Please enable GPS.";
          else if (err.code === 2) errorMsg = "Location information is unavailable.";
          else if (err.code === 3) errorMsg = "Location capture timed out.";

          toast.error(errorMsg, { id: toastId });
          setApiMsg(errorMsg);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    } else {
      toast.error("Geolocation is not supported by this browser.");
    }
  }, [gpsCoords, verificationId, id, handleReverseGeocode]);

  const fetchExistingVerification = useCallback(async (sid) => {
    if (!sid || id) return;
    setIsApiLoading(true);
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
      console.error('Fetch existing verification error:', err);
      setApiMsg('Error checking existing data: ' + err.message);
    } finally {
      setIsApiLoading(false);
    }
  }, [id, navigate, handleReverseGeocode]);

  // Load student data from location state or ID param
  useEffect(() => {
    if (id) {
      setVerificationId(id);
      setIsApiLoading(true);
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
              const coords = { lat: data.verification.gpsLat, lng: data.verification.gpsLng };
              setGpsCoords(coords);
              if (data.verification.gpsAddress) {
                setLocationAddress(data.verification.gpsAddress);
              } else {
                handleReverseGeocode(coords.lat, coords.lng);
              }
            }
          }
        })
        .catch(err => setApiMsg('Error loading record: ' + err.message))
        .finally(() => setIsApiLoading(false));
    } else if (location.state?.studentData) {
      // Coming from List or Dashboard
      const s = location.state.studentData;
      // Triggers lookup of existing draft OR pre-fills from registration
      fetchExistingVerification(s.rollNumber);
    }
  }, [id, location.state]);

  // Auto-capture GPS ONLY on very first load of a COMPLETELY NEW form.
  // If it's a draft, submitted, or admin view, we DO NOT auto-capture.
  useEffect(() => {
    // Wait until initial API check/load is completely finished
    if (!isApiLoading && !firstLoadDone.current) {
      firstLoadDone.current = true;

      // Only auto-capture for Teachers on a brand new (null status) record
      if (!isAdmin && status === null && !gpsCoords && !isReadOnly) {
        captureGPS();
      }
    }
  }, [isApiLoading, status, gpsCoords, isReadOnly, isAdmin, captureGPS]);

  // Handlers wrapped in useCallback for performance
  const handleChange = useCallback((e) => {
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
  }, []);

  const addFamilyMember = useCallback(() => setFamilyMembers(prev => [...prev, { name: '', relation: '', occupation: '', income: '', mobile: '', currentClass: '', isWorking: '', educationLevel: '' }]), []);
  const removeFamilyMember = useCallback((i) => setFamilyMembers(prev => prev.filter((_, idx) => idx !== i)), []);
  const updateMember = useCallback((i, field, value) => setFamilyMembers(prev => prev.map((m, idx) => idx === i ? { ...m, [field]: value } : m)), []);

  const handlePhotoUpload = useCallback((label, url) => {
    setForm(prev => {
      const photos = prev.photos || [];
      if (label.includes("Other")) {
        return { ...prev, photos: [...photos, { label, url }] };
      }
      const existingIdx = photos.findIndex(p => p.label === label);
      if (existingIdx >= 0) {
        const updated = [...photos];
        updated[existingIdx] = { label, url };
        return { ...prev, photos: updated };
      }
      return { ...prev, photos: [...photos, { label, url }] };
    });
  }, []);

  const removePhoto = useCallback((url) => {
    setForm(prev => ({
      ...prev,
      photos: (prev.photos || []).filter(p => p.url !== url)
    }));
  }, []);

  const getPhotoPreview = useCallback((label) => {
    const photo = form.photos?.find(p => p.label === label);
    return photo ? photo.url : null;
  }, [form.photos]);

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

      {/* Main Form Container - Restored comfortable spacing */}
      <div className="w-full max-w-4xl lg:max-w-5xl xl:max-w-6xl mx-auto px-4 pt-0 pb-32 transition-all">
        {/* Minimal Sticky Progress Header - Adjusted for "Go Behind" Scroll Effect */}
        <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-md border-b border-x border-slate-100 rounded-b-xl px-4 sm:px-6 pt-5 pb-2 transition-all">
          <div className="flex items-center justify-between gap-4 mb-1">
            <div className="flex items-center gap-3 min-w-0">
              <button
                onClick={() => navigate(-1)}
                className="p-1.5 bg-white hover:bg-slate-50 text-slate-500 hover:text-brand-600 rounded-lg border border-slate-200 transition-all group shrink-0 shadow-sm hover:shadow"
                title="Return to List"
              >
                <ArrowLeft size={18} strokeWidth={2} className="group-hover:-translate-x-0.5 transition-transform" />
              </button>
              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase text-slate-500 tracking-[0.15em] mb-1">Verification Panel</p>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg sm:text-xl font-semibold font-['Outfit'] text-slate-900 tracking-tight leading-none">{form.studentName || 'Student Registry'}</h2>

                  {/* Integrated Metadata (Location/Date) */}
                  <div className="hidden md:flex items-center gap-2 ml-2 pl-2 border-l border-slate-100">
                    <div className="flex items-center gap-1 text-slate-400 font-bold text-[9px] whitespace-nowrap bg-slate-50 border border-slate-100 rounded-md px-1.5 py-0.5">
                      <Clock size={10} strokeWidth={1.5} />
                      {new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </div>

                    {/* GPS Display - Persistent after capture, button only on step 0 if not captured */}
                    {gpsCoords ? (
                      <div className="flex items-center gap-1.5 bg-brand-50 border border-brand-100/50 rounded-md px-2 py-0.5 text-[9px] font-bold text-brand-600 shadow-sm transition-all max-w-[200px] hover:max-w-[400px] cursor-default">
                        <MapPin size={10} strokeWidth={2} className="text-brand-400 shrink-0" />
                        <span className="truncate whitespace-nowrap">{locationAddress || 'Location Locked'}</span>
                      </div>
                    ) : (currentStep === 0 && (
                      <button
                        onClick={captureGPS}
                        disabled={isReadOnly || isLocating}
                        className="flex items-center gap-1.5 bg-brand-50 border border-brand-100/50 rounded-md px-1.5 py-0.5 text-[9px] font-bold text-brand-600 hover:bg-brand-100 transition-all shadow-sm"
                      >
                        <MapPin size={10} strokeWidth={1.5} className={isLocating ? 'animate-pulse text-brand-500' : 'text-brand-400'} />
                        <span>{isLocating ? 'Capturing...' : 'Lock GPS'}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              <div className="w-7 h-7 rounded-full border border-slate-200 flex items-center justify-center p-0.5 shadow-sm">
                <div className="w-full h-full rounded-full bg-slate-50 flex items-center justify-center text-slate-600 font-bold text-[9px]">
                  {currentStep + 1}
                </div>
              </div>
            </div>
          </div>

          <div className="relative h-[2px] w-full bg-slate-100 mt-5 mb-4 overflow-hidden shrink-0">
            <div
              className="absolute top-0 left-0 h-full bg-slate-400 transition-all duration-500 ease-out"
              style={{ width: `${((currentStep + 1) / STEPS.length) * 100}%` }}
            />
          </div>

          {/* Step Dots Indicator */}
          {/* Tabs Row */}
          <div className="mt-6 mb-2">
            <div ref={tabsRef} className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar shrink-0">
              {STEPS.map((step, idx) => (
                <button
                  key={step.id}
                  id={`step-tab-${idx}`}
                  onClick={() => setCurrentStep(idx)}
                  className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all duration-200 border ${idx === currentStep
                    ? 'bg-brand-50 border-brand-100 text-brand-600 shadow-sm'
                    : idx < currentStep
                      ? 'bg-slate-50 border-transparent text-slate-600'
                      : 'bg-white border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                    }`}
                >
                  <step.icon size={11} strokeWidth={1.5} />
                  <span className={`text-[9px] font-bold whitespace-nowrap ${idx === currentStep ? 'block' : 'hidden md:block'}`}>
                    {step.title}
                  </span>
                </button>
              ))}

              {/* Status Badge in Tab Row for mobile visibility */}
              <div className="ml-auto shrink-0 md:hidden">
                {status && (
                  <div className={`px-2 py-0.5 rounded-md border text-[8px] font-black uppercase tracking-wider flex items-center gap-1 ${status === 'approved' ? 'bg-emerald-50 border-emerald-100 text-emerald-700' :
                    status === 'submitted' ? 'bg-blue-50 border-blue-100 text-blue-700' :
                      status.includes('rejected') ? 'bg-red-50 border-red-100 text-red-700' :
                        'bg-slate-50 border-slate-100 text-slate-500'
                    }`}>
                    {status.replace('_', ' ')}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ── Banners Area ── */}
        <div className="pt-2 px-4 sm:px-6">
          {/* ── Hold Reason Banner ── */}
          {status === 'hold' && form.holdReason && (
            <div className="bg-orange-50 border border-orange-100 rounded-2xl p-4 flex items-start gap-3 shadow-sm animate-fade-in mb-3">
              <div className="p-2 bg-white rounded-xl text-orange-600 shadow-sm transition-all">
                <AlertCircle size={18} strokeWidth={1.5} />
              </div>
              <div>
                <p className="text-[10px] font-black text-orange-800 uppercase tracking-widest mb-1">Reason for Hold</p>
                <p className="text-sm text-orange-700 font-semibold leading-relaxed">{form.holdReason}</p>
              </div>
            </div>
          )}

          {/* ── Read-Only Banner ── */}
          {!isAdmin && isReadOnly && (
            <div className={`flex items-start gap-3 px-4 py-3.5 rounded-2xl border text-sm font-semibold mb-3 transition-colors ${status === 'submitted'
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
                  {status === 'teacher_rejected' && 'Rejected by Verifier'}
                  {status === 'student_rejected' && 'Rejected by Student'}
                  {status === 'rejected' && 'Rejected by Admin'}
                  {status === 'approved' && 'Approved by Admin — Read Only'}
                </p>
                {form.rejectReason && status.includes('rejected') && <p className="text-xs text-red-700/80 font-medium mt-1">Reason: {form.rejectReason}</p>}
              </div>
            </div>
          )}
        </div>

        {/* Form Sections Area */}
        <div className={`animate-fade-in-up ${isReadOnly ? 'select-none' : ''} min-h-[65vh] pt-2 px-4 sm:px-6`}>

          {/* Step Sections Rendering */}
          {currentStep === 0 && (
            <StudentInfoSection
              form={form}
              handleChange={handleChange}
              fetchExistingVerification={fetchExistingVerification}
              isReadOnly={isReadOnly}
              isAdmin={isAdmin}
              selectCls={selectCls}
              inputCls={inputCls}
            />
          )}

          {currentStep === 1 && (
            <AcademicSection
              form={form}
              handleChange={handleChange}
              isReadOnly={isReadOnly}
              inputCls={inputCls}
            />
          )}

          {currentStep === 2 && (
            <PersonalSection
              form={form}
              handleChange={handleChange}
              isReadOnly={isReadOnly}
              inputCls={inputCls}
              selectCls={selectCls}
              textareaCls={textareaCls}
              setForm={setForm}
            />
          )}

          {currentStep === 3 && (
            <HealthSection
              form={form}
              handleChange={handleChange}
              isReadOnly={isReadOnly}
              inputCls={inputCls}
              setForm={setForm}
            />
          )}

          {currentStep === 4 && (
            <FamilySection
              familyMembers={familyMembers}
              updateMember={updateMember}
              addFamilyMember={addFamilyMember}
              removeFamilyMember={removeFamilyMember}
              isReadOnly={isReadOnly}
            />
          )}

          {currentStep === 5 && (
            <IncomeSection
              form={form}
              handleChange={handleChange}
              isReadOnly={isReadOnly}
              inputCls={inputCls}
              textareaCls={textareaCls}
              setForm={setForm}
            />
          )}

          {currentStep === 6 && (
            <HousingSection
              form={form}
              handleChange={handleChange}
              isReadOnly={isReadOnly}
              inputCls={inputCls}
              selectCls={selectCls}
              setForm={setForm}
            />
          )}

          {currentStep === 7 && (
            <ResourcesSection
              form={form}
              handleChange={handleChange}
              isReadOnly={isReadOnly}
              inputCls={inputCls}
              setForm={setForm}
            />
          )}

          {currentStep === 8 && (
            <LandSection
              form={form}
              handleChange={handleChange}
              isReadOnly={isReadOnly}
              inputCls={inputCls}
              selectCls={selectCls}
              setForm={setForm}
            />
          )}

          {currentStep === 9 && (
            <PhotosSection
              form={form}
              handlePhotoUpload={handlePhotoUpload}
              removePhoto={removePhoto}
              getPhotoPreview={getPhotoPreview}
              isReadOnly={isReadOnly}
            />
          )}

          {currentStep === 10 && (
            <DeclarationSection
              form={form}
              handleChange={handleChange}
              isReadOnly={isReadOnly}
            />
          )}

          {currentStep === 11 && (
            <>
              <RemarksSection
                form={form}
                handleChange={handleChange}
                isReadOnly={isReadOnly}
                inputCls={inputCls}
                textareaCls={textareaCls}
              />
              
              {/* Location Pill "Outside the box" - Final Confirmation */}
              {gpsCoords && (
                <div className="flex items-center gap-1.5 bg-brand-50 border border-brand-100/50 rounded-full px-3 py-1.5 text-[10px] font-bold text-brand-600 w-fit mt-3 ml-0.5 shadow-sm transition-all animate-in fade-in slide-in-from-left-1 duration-500">
                  <MapPin size={10} strokeWidth={2.5} className="text-brand-400" />
                  <span className="truncate max-w-[280px] uppercase tracking-wide">{locationAddress || 'Location Locked'}</span>
                </div>
              )}
            </>
          )}

        </div>{/* end form sections area */}

        {/* Bottom Navigation */}
        <div className="fixed bottom-0 right-0 left-0 lg:left-64 sm:left-20 bg-white/95 backdrop-blur-md border-t border-slate-200 p-4 z-40 shadow-[0_-10px_30px_rgba(0,0,0,0.05)]">
          <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
            <div className="flex-1 flex justify-start">
              {currentStep > 0 && (
                <button
                  onClick={() => setCurrentStep(prev => prev - 1)}
                  className="flex items-center justify-center h-10 min-w-[80px] sm:min-w-[120px] px-3 sm:px-5 bg-white border border-slate-200 text-slate-500 font-bold rounded-xl hover:bg-slate-50 active:scale-95 transition-all text-[11px] sm:text-sm tracking-tight shadow-sm whitespace-nowrap"
                >
                  Back
                </button>
              )}
            </div>

            <div className="flex-1 flex justify-end">
              {currentStep < STEPS.length - 1 ? (
                <button
                  onClick={() => setCurrentStep(prev => prev + 1)}
                  className="h-10 min-w-[80px] sm:min-w-[120px] px-4 sm:px-10 rounded-xl font-bold text-sm tracking-tight transition-all flex items-center justify-center bg-brand-600 text-white hover:bg-brand-700 active:scale-95 shadow-sm whitespace-nowrap"
                >
                  Next Step
                </button>
              ) : (
                <div className="flex items-center gap-1.5">
                  {isAdmin && (status === 'submitted' || status === 'teacher_rejected' || status === 'student_rejected') ? (
                    <button
                      onClick={() => {
                        const error = validateHomeVerification();
                        if (error) { toast.error(error); return; }
                        const label = status === 'submitted' ? "Save changes and keep as Submitted?" : "Resubmit this record to 'Submitted' status?";
                        confirmAction(label, () => handleSubmit('submitted'));
                      }}
                      disabled={isApiLoading}
                      className="h-10 px-6 bg-brand-600 text-white font-bold rounded-xl hover:bg-brand-700 active:scale-95 transition-all text-sm tracking-tight flex items-center justify-center shadow-sm"
                    >
                      {isApiLoading ? <Loader size="xs" color="white" /> : (status === 'submitted' ? 'Update Record' : 'Shift to Submitted')}
                    </button>
                  ) : (
                    <div className="flex items-center gap-1.5 min-w-0">
                      <button
                        onClick={() => setIsRejectModalOpen(true)}
                        disabled={isApiLoading || isReadOnly}
                        className="h-10 px-2 sm:px-4 bg-red-50 border border-red-100 text-red-600 font-bold rounded-xl hover:bg-red-100 active:scale-95 transition-all text-[11px] sm:text-sm flex items-center justify-center whitespace-nowrap"
                      >
                        {loadingAction === 'teacher_rejected' || loadingAction === 'student_rejected' ? <Loader size="xs" color="red" /> : 'Reject'}
                      </button>
                      <button
                        onClick={handleSave}
                        disabled={isApiLoading || isReadOnly}
                        className="h-10 px-2 sm:px-4 bg-white border border-slate-200 text-slate-500 font-bold rounded-xl hover:bg-slate-50 active:scale-95 transition-all text-[11px] sm:text-sm flex items-center justify-center whitespace-nowrap"
                      >
                        {loadingAction === 'draft' ? <Loader size="xs" color="orange" /> : 'Draft'}
                      </button>
                      <button
                        onClick={() => {
                          const error = validateHomeVerification();
                          if (error) { toast.error(error); return; }
                          confirmAction("Submit for final review?", () => handleSubmit('submitted'));
                        }}
                        disabled={isApiLoading || isReadOnly}
                        className={`h-10 px-3 sm:px-6 rounded-xl font-bold text-[11px] sm:text-sm tracking-tight transition-all flex items-center justify-center shadow-sm whitespace-nowrap
                          ${!isReadOnly
                            ? 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm'
                            : 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed shadow-none'}`}
                      >
                        {loadingAction === 'submitted' ? <Loader size="xs" color="white" /> : 'Submit'}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

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
                      <span className="text-xs font-bold text-slate-700 block text-left">Rejected by Verifier</span>
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
