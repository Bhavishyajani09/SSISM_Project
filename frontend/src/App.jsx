import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
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
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';

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
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
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
        position="bottom-center"
        toastOptions={{
          duration: 1800,
          style: {
            background: '#fff',
            color: '#1e293b',
            border: '1px solid #f3f4f6',
            borderRadius: '10px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
            fontFamily: 'Inter, sans-serif',
            fontSize: '0.75rem',
            padding: '8px 12px',
            maxWidth: '280px',
          },
          success: { iconTheme: { primary: '#f97316', secondary: '#fff' } },
          error: { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
        }}
      />
      </Suspense>
    </Router>
  );
}

export default App;
