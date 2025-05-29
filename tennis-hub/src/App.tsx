import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ApiProvider } from './context/ApiContext';
import TeamDashboard from './pages/TeamDashboard';
import RefereeDashboard from './pages/RefereeDashboard';
import AdminDashboard from './pages/AdminDashboard';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

const App: React.FC = () => {
  return (
    <ApiProvider>
      <Router>
        <div className="min-h-screen bg-gray-100">
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/team/dashboard" element={<TeamDashboard />} />
            <Route path="/referee/dashboard" element={<RefereeDashboard />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/" element={<Navigate to="/login" replace />} />
          </Routes>
        </div>
      </Router>
    </ApiProvider>
  );
};

export default App;
