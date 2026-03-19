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
      icon: (
        <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
        </svg>
      )
    },
    {
      to: '/home-verification',
      label: 'Home Verification',
      icon: (
        <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      )
    },
    {
      to: '/admin-verification',
      label: 'Admin Verifications',
      icon: (
        <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12a4 4 0 100-8 4 4 0 000 8z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l5 5m0 0l-5 5m5-5H9m0 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2V9a2 2 0 012-2h4a2 2 0 012 2v5" />
        </svg>
      )
    }
  ];

  return (
    <>
      {/* ─── Global Slim Header (Mobile) ─── */}
      <div className="lg:hidden flex items-center justify-between bg-white border-b border-orange-100 px-4 py-2.5 sticky top-0 z-30 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-orange-500 flex items-center justify-center overflow-hidden border-2 border-orange-400 shrink-0 shadow-sm">
            <img src={ssismLogo} alt="SSISM" className="w-full h-full object-cover" />
          </div>
          <div>
            <p className="font-bold text-gray-900 text-[13px] leading-tight tracking-tight uppercase">
              {getPageTitle()}
            </p>
            <p className="text-[10px] text-orange-400 font-medium uppercase tracking-widest leading-tight mt-0.5">
              SSISM SCHOLARSHIP portal
            </p>
          </div>
        </div>
        <button 
          onClick={() => setIsMobileOpen(true)} 
          className="p-1.5 text-gray-400 hover:text-brand-600 focus:outline-none rounded-lg hover:bg-orange-50 transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      {/* ─── Mobile Backdrop ─── */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-40 lg:hidden transition-opacity"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* ─── Sidebar (Desktop Always, Mobile Drawer) ─── */}
      <aside 
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-white border-r border-gray-100 flex flex-col shadow-2xl lg:shadow-none transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Sidebar Header */}
        <div className="h-[72px] shrink-0 flex items-center px-6 border-b border-gray-50 relative bg-orange-50/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-orange-500 flex items-center justify-center overflow-hidden border-2 border-orange-400 shadow-sm">
              <img src={ssismLogo} alt="SSISM" className="w-full h-full object-cover" />
            </div>
            <div>
              <p className="text-gray-900 font-bold text-[14px] leading-tight tracking-tight">SSISM PORTAL</p>
              <p className="text-orange-400 font-medium text-[9px] uppercase tracking-widest mt-1">Scholarship System</p>
            </div>
          </div>
          {/* Mobile Close Button */}
          <button 
            onClick={() => setIsMobileOpen(false)} 
            className="absolute right-4 top-1/2 -translate-y-1/2 lg:hidden p-1.5 text-gray-400 hover:text-gray-700 bg-white hover:bg-gray-100 rounded-lg transition-colors border shadow-sm"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-2.5">
          <div className="px-2 mb-5">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Main Menu</p>
            <div className="h-0.5 w-8 bg-orange-400 rounded-full" />
          </div>
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === '/dashboard'}
              onClick={() => setIsMobileOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-3 rounded-xl text-[13px] font-semibold transition-all duration-200 border ${
                  isActive 
                    ? 'bg-orange-50 border-orange-100 text-orange-600 shadow-[0_2px_10px_-3px_rgba(249,115,22,0.1)]' 
                    : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50 border-transparent'
                }`
              }
            >
              <span className="shrink-0">{link.icon}</span>
              {link.label}
            </NavLink>
          ))}
        </nav>

        {/* Bottom Profile & Logout area */}
        <div className="p-4 border-t border-gray-100 m-4 mt-0 bg-gray-50 rounded-2xl border">
          <button
            onClick={handleLogout}
            className="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-xl text-sm font-semibold text-gray-600 hover:text-white hover:bg-red-500 hover:shadow-md hover:shadow-red-200 transition-all duration-300"
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
