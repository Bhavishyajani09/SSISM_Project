import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/Navbar';
import LoginPage from './pages/auth/LoginPage';
import TeacherDashboard from './pages/TeacherDashboard';
import AddPassedStudents from './pages/AddPassedStudents';

const isAuthenticated = () => !!localStorage.getItem('token');

function ProtectedRoute({ children }) {
  return isAuthenticated() ? children : <Navigate to="/" replace />;
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <div className="min-h-screen bg-gray-50 flex flex-col">
                <Navbar />
                <main className="flex-1 pb-20 sm:pb-0">
                  <TeacherDashboard />
                </main>
              </div>
            </ProtectedRoute>
          }
        />
        <Route
          path="/add-passed-students"
          element={
            <ProtectedRoute>
              <div className="min-h-screen bg-gray-50 flex flex-col">
                <Navbar />
                <main className="flex-1 pb-20 sm:pb-0">
                  <AddPassedStudents />
                </main>
              </div>
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
    </Router>
  );
}

export default App;
