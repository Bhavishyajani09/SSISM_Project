import { useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import ssismLogo from '../assets/SSISM_Logo.png';

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const getPageTitle = () => {
    const p = location.pathname;
    if (p.startsWith('/dashboard')) return 'Dashboard';
    if (p.startsWith('/add-passed-students')) return 'Add Students';
    if (p.startsWith('/home-verification') || p.startsWith('/verification/home')) return 'Home Verification';
    if (p.startsWith('/admin-verification')) return 'Admin Portal';
    return 'SSISM Portal';
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const userRole = user.role || 'teacher';

  const navLinks = [
    {
      to: '/dashboard',
      label: 'Dashboard',
      icon: (
        <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      )
    },
    {
      to: '/add-passed-students',
      label: 'Add Students',
      roles: ['teacher'],
      icon: (
        <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
        </svg>
      )
    },
    {
      to: '/home-verification',
      label: 'Home Verification',
      roles: ['teacher'],
      icon: (
        <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      )
    },
    {
      to: '/admin-verification',
      label: 'Admin Verifications',
      roles: ['admin', 'teacher'],
      icon: (
        <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12a4 4 0 100-8 4 4 0 000 8z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l5 5m0 0l-5 5m5-5H9m0 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2V9a2 2 0 012-2h4a2 2 0 012 2v5" />
        </svg>
      )
    },
    {
       to: '/register-teacher',
       label: 'Add Teacher',
       roles: ['admin'],
       icon: (
         <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
           <path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
         </svg>
       )
    }
  ].filter(link => !link.roles || link.roles.includes(userRole));


  return (
    <>
      {/* ─── Global Slim Header (Mobile) ─── */}
      <div className="lg:hidden flex items-center justify-between bg-white border-b border-gray-100 px-4 py-3 sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-brand-500 flex items-center justify-center overflow-hidden border border-brand-400 shrink-0">
            <img src={ssismLogo} alt="SSISM" className="w-full h-full object-cover" />
          </div>
          <div>
            <p className="font-bold text-slate-900 text-xs leading-tight tracking-tight">
              {getPageTitle()}
            </p>
            <p className="text-[9px] text-slate-400 font-medium uppercase tracking-widest leading-tight mt-0.5">
              SSISM Portal
            </p>
          </div>
        </div>
        <button 
          onClick={() => setIsMobileOpen(true)} 
          className="p-1.5 text-slate-400 hover:text-brand-600 focus:outline-none rounded-lg hover:bg-slate-50 transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      {/* ─── Mobile Backdrop ─── */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-40 lg:hidden transition-opacity"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* ─── Sidebar (Desktop Always, Mobile Drawer) ─── */}
      <aside 
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-white border-r border-gray-100 flex flex-col transition-transform duration-300 ease-in-out ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Sidebar Header */}
        <div className="h-[72px] shrink-0 flex items-center px-6 border-b border-gray-50 bg-white">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-brand-500 flex items-center justify-center overflow-hidden border border-brand-400 shadow-sm">
              <img src={ssismLogo} alt="SSISM" className="w-full h-full object-cover" />
            </div>
            <div>
              <p className="text-slate-900 font-bold text-sm tracking-tight">SSISM Portal</p>
              <p className="text-slate-400 font-medium text-[10px] uppercase tracking-wider mt-0.5">Scholarship System</p>
            </div>
          </div>
          {/* Mobile Close Button */}
          <button 
            onClick={() => setIsMobileOpen(false)} 
            className="absolute right-4 top-1/2 -translate-y-1/2 lg:hidden p-1.5 text-slate-400 hover:text-slate-600 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors border border-gray-100"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 overflow-y-auto px-4 py-8 space-y-1">
          <div className="px-3 mb-6">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Main Menu</p>
          </div>
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === '/dashboard'}
              onClick={() => setIsMobileOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
                  isActive 
                    ? 'bg-brand-50 text-brand-600' 
                    : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                }`
              }
            >
              <span className="shrink-0">{link.icon}</span>
              {link.label}
            </NavLink>
          ))}
        </nav>

        {/* Bottom Profile & Logout area */}
        <div className="p-4 mt-auto">
          <button
            onClick={handleLogout}
            className="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-lg text-sm font-semibold text-slate-500 hover:text-red-600 hover:bg-red-50 transition-all duration-200"
            title="Log out of panel"
          >
            <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Logout
          </button>
        </div>
      </aside>
    </>
  );
}
