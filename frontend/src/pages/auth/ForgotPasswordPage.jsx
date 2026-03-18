import React, { useState } from 'react';
import { Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';
import Loader from '../../components/Loader';
import { Link } from 'react-router-dom';
import ssismLogo from '../../assets/SSISM_Logo.png';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      setIsSent(true);
    }, 1500);
  };

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row text-slate-800 font-sans overflow-x-hidden">
      
      {/* Left Side - Brand & Graphics (Hidden on Mobile) */}
      <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-orange-500 to-orange-400 p-12 pr-20 flex-col justify-between text-white relative overflow-hidden">
        
        {/* Decorative elements */}
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
           <p className="text-base lg:text-lg text-orange-50/90 max-w-lg mx-auto leading-relaxed font-normal tracking-wide bg-white/5 p-4 rounded-xl border border-white/10 backdrop-blur-sm shadow-sm transition-all hover:bg-white/10">
             Ensuring help reaches the right hands. Reset your password to continue your vital work in the field.
           </p>
        </div>
      </div>

      {/* Right Side - Forgot Password Form Area */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 bg-white relative">
        
        {/* Mobile Logo Header (Visible only on mobile) */}
        <div className="absolute top-8 left-1/2 transform -translate-x-1/2 lg:hidden flex flex-col items-center w-full px-6 text-center">
            <div className="w-20 h-20 rounded-full flex items-center justify-center overflow-hidden shadow-lg mb-3 border-4 border-white bg-white">
               <img src={ssismLogo} alt="Institute Logo" className="w-full h-full object-cover" />
            </div>
            <h2 className="text-xl font-bold text-slate-800">Sant Singaji Institute</h2>
        </div>

        <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-8 sm:p-10 z-10 mt-16 lg:mt-0 border border-slate-100">
          
          {!isSent ? (
            <>
              <div className="text-center mb-8">
                <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-2">Reset Password</h2>
                <p className="text-slate-500 text-sm sm:text-base">Enter your email to receive a reset link</p>
              </div>

              {error && (
                <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl text-sm border border-red-100 flex items-start gap-3">
                   <span className="shrink-0 mt-0.5">⚠️</span>
                   <p>{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
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
                      placeholder="teacher@ssism.org"
                      className="w-full pl-11 pr-4 py-3.5 bg-slate-50/50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 transition-all placeholder:text-slate-400 font-medium"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-500 hover:to-orange-400 text-white font-bold py-4 rounded-xl shadow-lg shadow-orange-200 flex items-center justify-center gap-3 active:scale-[0.98] transition-all disabled:opacity-70 disabled:cursor-not-allowed group"
                >
                  {isLoading ? (
                    <Loader color="white" size="sm" />
                  ) : (
                    <>
                      <span>Send reset link</span>
                    </>
                  )}
                </button>
              </form>
            </>
          ) : (
            <div className="text-center py-4">
              <div className="w-20 h-20 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 size={40} />
              </div>
              <h2 className="text-2xl font-bold text-slate-800 mb-2">Check your email</h2>
              <p className="text-slate-500 mb-8">
                We've sent a password reset link to <br />
                <span className="font-semibold text-slate-700">{email}</span>
              </p>
              <button
                onClick={() => setIsSent(false)}
                className="text-orange-600 font-semibold hover:text-orange-500 transition-colors"
              >
                Resend link
              </button>
            </div>
          )}

          <div className="mt-8 pt-8 border-t border-slate-100 text-center">
             <Link 
                to="/"
                className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-800 transition-colors group"
             >
                <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                Back to Login
             </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
