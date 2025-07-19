import React, { useState } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import AdminLoginPage from './AdminLoginPage';
import AdminForgotPasswordPage from './AdminForgotPasswordPage';
import AdminResetPasswordPage from './AdminResetPasswordPage';
import AdminPanel from './AdminPanel';
import AdminCustomersPage from './AdminCustomersPage';
import AdminPendingInvoicesPage from './AdminPendingInvoicesPage';
import AdminPendingPaymentsPage from './AdminPendingPaymentsPage';

export default function AdminRoutes() {
  const [token, setToken] = useState(() => localStorage.getItem('adminToken') || '');
  const navigate = useNavigate();

  const handleLogin = (jwt) => {
    setToken(jwt);
    localStorage.setItem('adminToken', jwt);
    navigate('/admin');
  };

  const handleLogout = () => {
    setToken('');
    localStorage.removeItem('adminToken');
    navigate('/admin/login');
  };

  // Only show navbar on authenticated admin pages
  return (
    <Routes>
      <Route path="/admin/login" element={<AdminLoginPage onLogin={handleLogin} />} />
      <Route path="/admin/forgot-password" element={<AdminForgotPasswordPage />} />
      <Route path="/admin/reset-password" element={<AdminResetPasswordPage />} />
      <Route path="/admin/pending-invoices" element={token ? <AdminPendingInvoicesPage onLogout={handleLogout} token={token} /> : <Navigate to="/admin/login" />} />
      <Route path="/admin/customers" element={token ? <AdminCustomersPage token={token} onLogout={handleLogout} /> : <Navigate to="/admin/login" />} />
      <Route path="/admin/pending-payments" element={token ? <AdminPendingPaymentsPage onLogout={handleLogout} token={token} /> : <Navigate to="/admin/login" />} />
      <Route path="/admin" element={token ? <AdminPanel token={token} onLogout={handleLogout} /> : <Navigate to="/admin/login" />} />
    </Routes>
  );
}
