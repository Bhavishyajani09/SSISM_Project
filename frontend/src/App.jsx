import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginPage from './pages/auth/LoginPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import HomeVerificationPage from './pages/verification/HomeVerificationPage';
import './index.css'; 

function App() {
  return (
    <Router>
      <div className="bg-slate-50 min-h-screen">
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/verification/home/:id?" element={<HomeVerificationPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
