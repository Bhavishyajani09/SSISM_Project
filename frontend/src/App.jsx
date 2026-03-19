import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { lazy, Suspense } from 'react';
import Navbar from './components/Navbar';
import Loader from './components/Loader';

// Lazy load pages
const LoginPage = lazy(() => import('./pages/auth/LoginPage'));
const TeacherDashboard = lazy(() => import('./pages/TeacherDashboard'));
const AddPassedStudents = lazy(() => import('./pages/AddPassedStudents'));
const VerificationListPage = lazy(() => import('./pages/verification/VerificationListPage'));
const HomeVerificationPage = lazy(() => import('./pages/verification/HomeVerificationPage'));
const AdminVerificationPage = lazy(() => import('./pages/verification/AdminVerificationPage'));

const isAuthenticated = () => !!localStorage.getItem('token');

function ProtectedRoute({ children }) {
  return isAuthenticated() ? children : <Navigate to="/" replace />;
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
            <ProtectedRoute>
              <MainLayout>
                <AddPassedStudents />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/home-verification"
          element={
            <ProtectedRoute>
              <MainLayout>
                <VerificationListPage />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin-verification"
          element={
            <ProtectedRoute>
              <MainLayout>
                <AdminVerificationPage />
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
      </Suspense>
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
    </Router>
  );
}

export default App;
