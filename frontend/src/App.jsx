import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster, ToastBar, toast } from 'react-hot-toast';
import { lazy, Suspense } from 'react';
import Navbar from './components/Navbar';
import Loader from './components/Loader';
import LoginPage from './pages/auth/LoginPage';
import TeacherDashboard from './pages/TeacherDashboard';
import AddPassedStudents from './pages/AddPassedStudents';
import VerificationListPage from './pages/verification/VerificationListPage';
import HomeVerificationPage from './pages/verification/HomeVerificationPage';
import AdminVerificationPage from './pages/verification/AdminVerificationPage';
import RegisterTeacherPage from './pages/auth/RegisterTeacherPage';

const isAuthenticated = () => !!localStorage.getItem('token');
const getUserRole = () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  return user.role || 'teacher';
};

function ProtectedRoute({ children, roles }) {
  if (!isAuthenticated()) return <Navigate to="/" replace />;
  if (roles && !roles.includes(getUserRole())) return <Navigate to="/dashboard" replace />;
  return children;
}

function MainLayout({ children }) {
  return (
    <div className="min-h-screen bg-gray-50 lg:pl-64 flex flex-col">
      <Navbar />
      <main className="flex-1 relative">
        {children}
      </main>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Suspense fallback={
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <Loader size="xl" />
        </div>
      }>
        <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <MainLayout>
                <TeacherDashboard />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/add-passed-students"
          element={
            <ProtectedRoute roles={['admin', 'teacher']}>
              <MainLayout>
                <AddPassedStudents />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/home-verification"
          element={
            <ProtectedRoute roles={['teacher']}>
              <MainLayout>
                <VerificationListPage />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin-verification"
          element={
            <ProtectedRoute roles={['admin', 'teacher']}>
              <MainLayout>
                <AdminVerificationPage />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/register-teacher"
          element={
            <ProtectedRoute roles={['admin']}>
              <MainLayout>
                <RegisterTeacherPage />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/verification/home/:id?"
          element={
            <ProtectedRoute>
              <MainLayout>
                <HomeVerificationPage />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      <Toaster
        position="top-center"
        toastOptions={{
          duration: 2000,
          style: {
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            color: '#1e293b',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '18px',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.02), 0 0 0 1px rgba(0, 0, 0, 0.05)',
            fontFamily: '"Outfit", "Inter", sans-serif',
            fontSize: '14px',
            fontWeight: '600',
            padding: '12px 20px',
            maxWidth: '450px',
            cursor: 'pointer'
          },
          success: { 
            iconTheme: { primary: '#10b981', secondary: '#fff' },
            style: { borderLeft: '5px solid #10b981' }
          },
          error: { 
            iconTheme: { primary: '#ef4444', secondary: '#fff' },
            style: { borderLeft: '5px solid #ef4444' }
          },
        }}
      >
        {(t) => (
          <div onClick={() => toast.dismiss(t.id)} className="transition-all hover:scale-[1.02] active:scale-[0.98]">
            <ToastBar toast={t} />
          </div>
        )}
      </Toaster>
      </Suspense>
    </Router>
  );
}

export default App;
