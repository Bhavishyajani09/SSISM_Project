import React, { useState } from 'react';
import { Eye, EyeOff, LogIn, Loader2, Mail, Lock } from 'lucide-react';
import { Link } from 'react-router-dom';
import ssismLogo from '../../assets/SSISM_Logo.png';

const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({ id: '', password: '', rememberMe: false });
  const [error, setError] = useState('');

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Simulate API call for UI testing
    setTimeout(() => {
      setIsLoading(false);
      
      // Basic check for hardcoded emails requested earlier
      const validEmails = ['sourabhk.bca2024@ssism.org', 'bhavishyaj.bca2024@ssism.org'];
      
      if (validEmails.includes(formData.id) && formData.password === 'password123') {
        alert('Login Successful! Redirecting to Dashboard...');
        // window.location.href = '/dashboard';
      } else {
        setError('Invalid email or password. Please use seeded credentials.');
      }
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
             Empowering education through transparent field verifications. Log in to manage your assigned students and submit crucial home visit reports directly from the field.
           </p>
        </div>

      </div>

      {/* Right Side - Login Form Area */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 bg-white relative">
        
        {/* Mobile Logo Header (Visible only on mobile) */}
        <div className="absolute top-8 left-1/2 transform -translate-x-1/2 lg:hidden flex flex-col items-center w-full px-6 text-center">
            <div className="w-20 h-20 rounded-full flex items-center justify-center overflow-hidden shadow-lg mb-3 border-4 border-white bg-white">
               <img src={ssismLogo} alt="Institute Logo" className="w-full h-full object-cover" />
            </div>
            <h2 className="text-xl font-bold text-slate-800">Sant Singaji Institute</h2>
        </div>

        <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-8 sm:p-10 z-10 mt-16 lg:mt-0 border border-slate-100">
          
          <div className="text-center mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-2">Teacher Login</h2>
            <p className="text-slate-500 text-sm sm:text-base">Enter your credentials to access the portal</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl text-sm border border-red-100 flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
               <span className="shrink-0 mt-0.5">⚠️</span>
               <p>{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Email Input */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 block tracking-wide text-left">Email Address</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-orange-500 transition-colors">
                  <Mail size={20} />
                </div>
                <input
                  type="email"
                  name="id"
                  value={formData.id}
                  onChange={handleInputChange}
                  placeholder="teacher@ssism.org"
                  className="w-full pl-11 pr-4 py-3.5 bg-slate-50/50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 transition-all placeholder:text-slate-400 font-medium"
                  required
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                 <label className="text-sm font-semibold text-slate-700 block tracking-wide">Password</label>
                 <Link to="/forgot-password" size="sm" className="text-sm font-semibold text-orange-600 hover:text-orange-500 transition-colors">
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
                  className="w-full pl-11 pr-12 py-3.5 bg-slate-50/50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 transition-all placeholder:text-slate-400 font-medium tracking-widest"
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

            {/* Remember Me */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="rememberMe"
                name="rememberMe"
                checked={formData.rememberMe}
                onChange={handleInputChange}
                className="w-4 h-4 text-orange-500 border-slate-300 rounded focus:ring-orange-500 focus:ring-offset-0 cursor-pointer"
              />
              <label htmlFor="rememberMe" className="ml-2 text-sm text-slate-600 cursor-pointer select-none">
                Remember me for 30 days
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white py-4 rounded-xl font-semibold text-lg transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed shadow-lg shadow-orange-500/30"
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin" size={22} />
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <LogIn size={22} />
                  <span>Login to Dashboard</span>
                </>
              )}
            </button>
          </form>

          {/* Footer */}
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
