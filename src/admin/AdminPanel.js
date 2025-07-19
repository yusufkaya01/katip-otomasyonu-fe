import React from 'react';
import AdminPendingOrdersPage from './AdminPendingOrdersPage';

// Wrapper for backward compatibility; renders the pending orders page
export default function AdminPanel(props) {
  return <AdminPendingOrdersPage {...props} />;
}
