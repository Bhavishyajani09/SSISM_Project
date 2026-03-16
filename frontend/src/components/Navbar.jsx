import { NavLink } from 'react-router-dom';

export default function Navbar() {
  return (
    <>
      {/* Top Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 h-16 flex items-center gap-4">
          <img src="/logo.png" alt="SSISM" className="h-10 w-10 rounded-xl object-cover" />
          <div>
            <p className="text-gray-900 font-bold text-base leading-tight">Sant Singaji Portal</p>
            <p className="text-gray-500 text-xs">Student Management System</p>
          </div>
        </div>
      </header>

      {/* Bottom Tab Bar — mobile only */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 sm:hidden">
        <div className="flex">
          <NavLink to="/" end className={({ isActive }) =>
            `flex-1 flex flex-col items-center justify-center py-3 gap-1 text-xs font-semibold transition-colors ${isActive ? 'text-brand-600' : 'text-gray-400'}`
          }>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            Dashboard
          </NavLink>
          <NavLink to="/add-passed-students" className={({ isActive }) =>
            `flex-1 flex flex-col items-center justify-center py-3 gap-1 text-xs font-semibold transition-colors ${isActive ? 'text-brand-600' : 'text-gray-400'}`
          }>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Add Students
          </NavLink>
        </div>
      </nav>

      {/* Desktop side nav links in header */}
      <div className="hidden sm:flex sticky top-0 z-40 bg-white border-b border-gray-200 -mt-px">
        <div className="max-w-7xl mx-auto px-8 lg:px-10 flex gap-1 w-full">
          <NavLink to="/" end className={({ isActive }) =>
            `px-4 py-3 text-sm font-medium border-b-2 transition-colors ${isActive ? 'border-brand-500 text-brand-600' : 'border-transparent text-gray-500 hover:text-gray-800'}`
          }>Dashboard</NavLink>
          <NavLink to="/add-passed-students" className={({ isActive }) =>
            `px-4 py-3 text-sm font-medium border-b-2 transition-colors ${isActive ? 'border-brand-500 text-brand-600' : 'border-transparent text-gray-500 hover:text-gray-800'}`
          }>Add Students</NavLink>
        </div>
      </div>
    </>
  );
}
