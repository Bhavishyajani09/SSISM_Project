import React, { useState } from 'react';
import { Mail, ArrowLeft, CheckCircle2, Lock, ShieldCheck, Eye, EyeOff } from 'lucide-react';
import Loader from '../../components/Loader';
import { Link, useNavigate } from 'react-router-dom';
import ssismLogo from '../../assets/SSISM_Logo.png';
import api from '../../api';
import toast from 'react-hot-toast';

const ForgotPasswordPage = () => {
  const [step, setStep] = useState(1); // 1: Email, 2: OTP & New Password
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleRequestOTP = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      const response = await api.post('/auth/forgot-password', { email });
      setStep(2);
      toast.success(response.data.message || 'OTP sent to your email');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to send OTP. Please try again.');
      toast.error(err.response?.data?.error || 'Failed to send OTP');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    setIsLoading(true);
    setError('');

    try {
      const response = await api.post('/auth/reset-password', { 
        email, 
        otp, 
        newPassword 
      });
      toast.success(response.data.message || 'Password reset successfully!');
      setStep(3); // Success Step
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid or expired OTP');
      toast.error(err.response?.data?.error || 'Password reset failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row text-slate-800 font-sans overflow-x-hidden">
      
      {/* Left Side - Brand & Graphics */}
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
             Sant Singaji Educational Society, Sandalpur
           </h2>
           <p className="text-base lg:text-lg text-orange-50/90 max-w-lg mx-auto leading-relaxed font-normal tracking-wide bg-white/5 p-4 rounded-xl border border-white/10 backdrop-blur-sm shadow-sm">
             {step === 1 ? 'Ensuring help reaches the right hands. Reset your password to continue your vital work.' : 'Verify your identity using the OTP sent to your registered email.'}
           </p>
        </div>
      </div>

      {/* Right Side - Form Area */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 bg-white relative">
        <div className="absolute top-8 left-1/2 transform -translate-x-1/2 lg:hidden flex flex-col items-center w-full px-6 text-center">
            <div className="w-20 h-20 rounded-full flex items-center justify-center overflow-hidden shadow-lg mb-3 border-4 border-white bg-white">
               <img src={ssismLogo} alt="Institute Logo" className="w-full h-full object-cover" />
            </div>
            <h2 className="text-xl font-bold text-slate-800">Sant Singaji Educational Society</h2>
        </div>

        <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-8 sm:p-10 z-10 mt-16 lg:mt-0 border border-slate-100">
          
          {step === 1 && (
            <>
              <div className="text-center mb-8">
                <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-2">Forgot Password?</h2>
                <p className="text-slate-500 text-sm sm:text-base">Enter your email and we'll send you an OTP</p>
              </div>

              {error && (
                <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl text-sm border border-red-100 flex items-start gap-3">
                   <p>{error}</p>
                </div>
              )}

              <form onSubmit={handleRequestOTP} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700 block tracking-wide">Email Address</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-orange-500 transition-colors">
                      <Mail size={20} />
                    </div>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="verifier@ssism.org"
                      className="w-full pl-11 pr-4 py-3.5 bg-slate-50/50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 transition-all font-medium"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-500 hover:to-orange-400 text-white font-bold py-4 rounded-xl shadow-lg shadow-orange-200 flex items-center justify-center gap-3 active:scale-[0.98] transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isLoading ? <Loader color="white" size="sm" /> : <span>Send OTP</span>}
                </button>
              </form>
            </>
          )}

          {step === 2 && (
            <>
              <div className="text-center mb-8">
                <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-2">Reset Password</h2>
                <p className="text-slate-500 text-sm sm:text-base">We've sent an OTP to {email}</p>
              </div>

              {error && (
                <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl text-sm border border-red-100">
                   <p>{error}</p>
                </div>
              )}

              <form onSubmit={handleResetPassword} className="space-y-5">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700 block">6-Digit OTP</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-orange-500">
                      <ShieldCheck size={20} />
                    </div>
                    <input
                      type="text"
                      maxLength="6"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      placeholder="Enter 6-digit OTP"
                      className="w-full pl-11 pr-4 py-3.5 bg-slate-50/50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 transition-all font-medium tracking-widest text-center"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700 block">New Password</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-orange-500">
                      <Lock size={20} />
                    </div>
                    <input
                      type={showPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-11 pr-12 py-3.5 bg-slate-50/50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 transition-all"
                      required
                    />
                    <button 
                      type="button" 
                      className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700 block">Confirm Password</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-orange-500">
                      <Lock size={20} />
                    </div>
                    <input
                      type={showPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-11 pr-12 py-3.5 bg-slate-50/50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 transition-all"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-500 hover:to-orange-400 text-white font-bold py-4 rounded-xl shadow-lg shadow-orange-200 flex items-center justify-center gap-3 active:scale-[0.98] transition-all disabled:opacity-70"
                >
                  {isLoading ? <Loader color="white" size="sm" /> : <span>Reset Password</span>}
                </button>
              </form>
            </>
          )}

          {step === 3 && (
            <div className="text-center py-4">
              <div className="w-20 h-20 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 size={40} />
              </div>
              <h2 className="text-2xl font-bold text-slate-800 mb-2">Success!</h2>
              <p className="text-slate-500 mb-8">
                Your password has been reset successfully. You can now login with your new password.
              </p>
              <Link
                to="/"
                className="w-full bg-orange-600 hover:bg-orange-500 text-white font-bold py-4 rounded-xl shadow-lg block transition-all"
              >
                Go to Login
              </Link>
            </div>
          )}

          {step !== 3 && (
            <div className="mt-8 pt-8 border-t border-slate-100 text-center">
               <Link 
                  to="/"
                  className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-800 transition-colors group"
               >
                  <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                  Back to Login
               </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;

