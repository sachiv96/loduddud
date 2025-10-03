import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import PublicPortal from './pages/PublicPortal';
import Login from './components/admin/Login';
import AdminLayout from './pages/AdminLayout';
import Dashboard from './components/admin/Dashboard';
import RegisterCase from './components/admin/RegisterCase';
import MatchesList from './components/admin/MatchesList';
import CasesList from './components/admin/CasesList';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<PublicPortal />} />
          <Route path="/admin/login" element={<Login />} />

          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="register" element={<RegisterCase />} />
            <Route path="matches" element={<MatchesList />} />
            <Route path="cases" element={<CasesList />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
