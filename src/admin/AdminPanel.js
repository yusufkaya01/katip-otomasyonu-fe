import React, { useState, useEffect } from 'react';
import AdminNavbar from './AdminNavbar';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || '';
const ADMIN_API_KEY = process.env.REACT_APP_ADMIN_API_KEY || '';

export default function AdminPanel({ token, onLogout }) {
  const [pendingOrders, setPendingOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [confirmLoading, setConfirmLoading] = useState(false);

  useEffect(() => {
    fetchPendingOrders();
    // eslint-disable-next-line
  }, [token]);

  async function fetchPendingOrders() {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_BASE_URL}/admin/orders/pending`, {
        headers: {
          'Content-Type': 'application/json',
          'x-admin-api-key': ADMIN_API_KEY,
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (res.ok && data.orders) {
        setPendingOrders(data.orders);
      } else {
        setError(data.error || 'Siparişler alınamadı.');
      }
    } catch (err) {
      setError('Sunucuya ulaşılamadı.');
    }
    setLoading(false);
  }

  const handleConfirm = async (orderId) => {
    setConfirmLoading(orderId);
    try {
      const res = await fetch(`${API_BASE_URL}/admin/orders/${orderId}/confirm`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-api-key': ADMIN_API_KEY,
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (res.ok) {
        fetchPendingOrders();
      } else {
        alert(data.error || 'Sipariş onaylanamadı.');
      }
    } catch (err) {
      alert('Sunucuya ulaşılamadı.');
    }
    setConfirmLoading(false);
  };

  return (
    <div className="container-fluid px-0">
      <AdminNavbar onLogout={onLogout} />
      <div className="container py-4">
        <h4 className="mb-3">Bekleyen Siparişler</h4>
        {loading && <div className="alert alert-info">Yükleniyor...</div>}
        {error && <div className="alert alert-danger">{error}</div>}
        {pendingOrders.length === 0 && !loading && <div className="alert alert-success">Bekleyen sipariş yok.</div>}
        {pendingOrders.length > 0 && (
          <table className="table table-bordered">
            <thead>
              <tr>
                <th>Sipariş ID</th>
                <th>Müşteri</th>
                <th>Şirket Ünvanı</th>
                <th>Tutar</th>
                <th>Oluşturulma</th>
                <th>Durum</th>
                <th>İşlemler</th>
              </tr>
            </thead>
            <tbody>
              {pendingOrders.map(order => (
                <tr key={order.order_id}>
                  <td>{order.order_id}</td>
                  <td>{order.customer_name || order.customer_id}</td>
                  <td>{order.company_name || '-'}</td>
                  <td>{order.amount} TL</td>
                  <td>{order.created_at ? new Date(order.created_at).toLocaleString('tr-TR') : ''}</td>
                  <td>{order.is_confirmed ? 'Onaylandı' : 'Bekliyor'}</td>
                  <td>
                    <button className="btn btn-success btn-sm" onClick={() => handleConfirm(order.order_id)} disabled={confirmLoading===order.order_id}>
                      {confirmLoading===order.order_id ? 'Onaylanıyor...' : 'Onayla'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
