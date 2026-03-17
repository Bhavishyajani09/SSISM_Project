import React, { useState } from 'react';
import { Eye, EyeOff, LogIn, Loader2, Mail, Lock, AlertTriangle } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import ssismLogo from '../../assets/SSISM_Logo.png';

const LoginPage = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email, password: formData.password }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Login failed. Please try again.');
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row text-slate-800 font-sans overflow-x-hidden selection:bg-orange-100 selection:text-orange-900">
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-up {
          animation: fadeUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .glass-card {
          background: rgba(255, 255, 255, 0.9);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.3);
        }
        @keyframes shine {
          0% { left: -100%; }
          20% { left: 100%; }
          100% { left: 100%; }
        }
        .btn-premium {
          position: relative;
          overflow: hidden;
          background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .btn-premium::after {
          content: '';
          position: absolute;
          top: -50%;
          left: -100%;
          width: 60%;
          height: 200%;
          background: linear-gradient(
            to right,
            rgba(255, 255, 255, 0) 0%,
            rgba(255, 255, 255, 0.4) 50%,
            rgba(255, 255, 255, 0) 100%
          );
          transform: rotate(25deg);
          animation: shine 4s infinite ease-in-out;
        }
        .btn-premium:hover {
          transform: translateY(-2px);
          box-shadow: 0 15px 30px rgba(234, 88, 12, 0.4);
          filter: brightness(1.1);
        }
        .btn-premium:active {
          transform: translateY(0);
          scale: 0.98;
        }
      `}</style>

      {/* Left Side */}
      <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-orange-500 to-orange-400 p-12 pr-20 flex-col justify-between text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-20 -mr-20 w-80 h-80 bg-white opacity-10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-80 h-80 bg-orange-600 opacity-20 rounded-full blur-3xl"></div>

        <div className="z-10 text-center flex flex-col items-center mt-12">
          <div className="bg-white/20 p-4 rounded-2xl backdrop-blur-sm mb-8 inline-flex items-center justify-center">
            <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center overflow-hidden shadow-inner border-4 border-white">
              <img src={ssismLogo} alt="Institute Logo" className="w-full h-full object-cover" />
            </div>
          </div>
          <h1 className="text-4xl lg:text-5xl font-extrabold mb-4 leading-tight tracking-tight drop-shadow-sm">
            Scholarship <br /> Verification Portal
          </h1>
          <h2 className="text-xl lg:text-2xl font-semibold text-orange-50 mb-8 border-b border-orange-300 pb-4 inline-block drop-shadow-sm">
            Sant Singaji Institute, Sandalpur
          </h2>
          <p className="text-base lg:text-lg text-orange-50/90 max-w-lg mx-auto leading-relaxed font-normal tracking-wide bg-white/5 p-4 rounded-xl border border-white/10 backdrop-blur-sm shadow-sm">
            Empowering education through transparent field verifications. Log in to manage your assigned students and submit crucial home visit reports directly from the field.
          </p>
        </div>
      </div>

      {/* Right Side */}
      <div className="w-full lg:w-1/2 flex-1 flex items-center justify-center p-4 sm:p-12 bg-[#f8fafc] lg:bg-white relative min-h-screen lg:min-h-0">
        {/* Animated Background Blobs for Mobile */}
        <div className="absolute inset-0 lg:hidden overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-orange-200/30 rounded-full blur-[80px]"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-orange-100/40 rounded-full blur-[80px]"></div>
        </div>

        <div className="w-full max-w-md glass-card rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.05)] p-8 sm:p-10 z-10 lg:mt-0 relative pt-20 sm:pt-10 animate-fade-up">
          
          {/* Mobile Logo - Centered and Floating */}
          <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 lg:hidden flex flex-col items-center w-full">
            <div className="w-24 h-24 rounded-full flex items-center justify-center overflow-hidden shadow-2xl border-[6px] border-white bg-white">
              <img src={ssismLogo} alt="Institute Logo" className="w-full h-full object-cover" />
            </div>
          </div>

          <div className="text-center mb-5 sm:mb-8">
            <h2 className="text-xl sm:text-3xl font-extrabold text-slate-800 mb-1 sm:mb-2">Teacher Login</h2>
            <p className="text-slate-400 text-[10px] sm:text-sm font-medium uppercase tracking-widest">Secure Access Portal</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl text-sm border border-red-100 flex items-start gap-3">
              <AlertTriangle size={16} className="shrink-0 mt-0.5" />
              <p>{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 block tracking-wide text-left">Email Address</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-orange-500 transition-colors">
                  <Mail size={20} />
                </div>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="teacher@ssism.org"
                  className="w-full pl-10 pr-4 py-3 sm:py-4 bg-white/50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 transition-all placeholder:text-slate-400 font-medium shadow-sm hover:border-slate-300"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-semibold text-slate-700 block tracking-wide">Password</label>
                <Link to="/forgot-password" className="text-sm font-semibold text-orange-600 hover:text-orange-500 transition-colors">
                  Forgot password?
                </Link>
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-orange-500 transition-colors">
                  <Lock size={20} className="stroke-[2.5]" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-12 py-3 sm:py-4 bg-white/50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 transition-all placeholder:text-slate-400 font-medium tracking-widest shadow-sm hover:border-slate-300"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors focus:outline-none p-1 rounded-md hover:bg-slate-100"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>


            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-[48px] sm:h-[60px] flex items-center justify-center gap-2.5 btn-premium text-white rounded-xl font-bold text-sm sm:text-lg disabled:opacity-70 disabled:cursor-not-allowed shadow-lg shadow-orange-500/20"
            >
              {isLoading ? (
                <><Loader2 className="animate-spin" size={22} /><span>Authenticating...</span></>
              ) : (
                <><LogIn size={22} /><span>Login to Dashboard</span></>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
