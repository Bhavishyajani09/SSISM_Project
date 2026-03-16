import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';

export default function Navbar() {
  const navigate = useNavigate();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  const navLinks = [
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
      to: '/dashboard',
      label: 'Dashboard',
      icon: (
        <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      )
    }
  ];

  return (
    <>
      {/* ─── Mobile Top Header ─── */}
      <div className="lg:hidden flex items-center justify-between bg-white border-b border-gray-200 px-4 py-3 sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <img src="/logo.png" alt="SSISM" className="h-9 w-9 rounded-lg object-cover bg-gray-100" />
          <p className="font-bold text-gray-800 text-lg tracking-tight">SSISM Portal</p>
        </div>
        <button 
          onClick={() => setIsMobileOpen(true)} 
          className="p-2 text-gray-500 hover:text-brand-600 focus:outline-none rounded-lg hover:bg-gray-50 transition-colors"
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
        <div className="h-[60px] shrink-0 flex items-center px-5 border-b border-gray-100 lg:h-[72px] lg:px-6 relative">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="SSISM" className="h-[38px] w-[38px] rounded-xl object-cover bg-gray-100 shadow-sm border border-gray-200" />
            <div>
              <p className="text-gray-900 font-bold text-[15px] leading-tight tracking-tight">SSISM Portal</p>
              <p className="text-gray-400 font-semibold text-[10px] uppercase tracking-widest mt-0.5">Teacher Panel</p>
            </div>
          </div>
          {/* Mobile Close Button */}
          <button 
            onClick={() => setIsMobileOpen(false)} 
            className="absolute right-4 top-1/2 -translate-y-1/2 lg:hidden p-1.5 text-gray-400 hover:text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-1.5 scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
          <div className="px-2 mb-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100 pb-2">
            Main Menu
          </div>
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === '/dashboard'}
              onClick={() => setIsMobileOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-3 rounded-xl text-[14px] font-semibold transition-all duration-200 ${
                  isActive 
                    ? 'bg-gradient-to-r from-brand-50 to-orange-50/50 text-brand-600 shadow-sm border border-brand-100/50' 
                    : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50 border border-transparent'
                }`
              }
            >
              {link.icon}
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
