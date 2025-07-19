import React, { useEffect, useState } from 'react';
import AdminNavbar from './AdminNavbar';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || '';
const ADMIN_API_KEY = process.env.REACT_APP_ADMIN_API_KEY || '';

export default function AdminPendingInvoicesPage({ onLogout, token }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [invoiceId, setInvoiceId] = useState('');
  const [invoiceDate, setInvoiceDate] = useState('');
  const [modalError, setModalError] = useState('');
  const [modalLoading, setModalLoading] = useState(false);
  const [modalSuccess, setModalSuccess] = useState('');

  useEffect(() => {
    fetchOrders();
    // eslint-disable-next-line
  }, [token]);

  async function fetchOrders() {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_BASE_URL}/admin/orders/pending-invoice`, {
        headers: {
          'Content-Type': 'application/json',
          'x-admin-api-key': ADMIN_API_KEY,
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (res.ok && data.orders) {
        setOrders(data.orders);
      } else {
        setError(data.error || 'Siparişler alınamadı.');
      }
    } catch (err) {
      setError('Sunucuya ulaşılamadı.');
    }
    setLoading(false);
  }

  const openModal = (order) => {
    setSelectedOrder(order);
    setInvoiceId('');
    setInvoiceDate('');
    setModalError('');
    setModalSuccess('');
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedOrder(null);
    setInvoiceId('');
    setInvoiceDate('');
    setModalError('');
    setModalSuccess('');
  };

  const handleInvoiceSubmit = async (e) => {
    e.preventDefault();
    setModalError('');
    setModalSuccess('');
    if (!invoiceId || !invoiceDate) {
      setModalError('Fatura numarası ve tarihi zorunludur.');
      return;
    }
    setModalLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/admin/orders/${selectedOrder.order_id}/invoice`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-api-key': ADMIN_API_KEY,
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ invoiceId, invoiceDate }),
      });
      const data = await res.json();
      if (res.ok) {
        setModalSuccess('Fatura başarıyla kaydedildi.');
        fetchOrders();
        setTimeout(() => {
          closeModal();
        }, 1200);
      } else {
        setModalError(data.error || 'Fatura kaydedilemedi.');
      }
    } catch (err) {
      setModalError('Sunucuya ulaşılamadı.');
    }
    setModalLoading(false);
  };

  return (
    <div className="container-fluid px-0">
      <AdminNavbar onLogout={onLogout} />
      <div className="container py-4">
        <h4 className="mb-3">Fatura Bekleyen Siparişler</h4>
        {loading && <div className="alert alert-info">Yükleniyor...</div>}
        {error && <div className="alert alert-danger">{error}</div>}
        {orders.length > 0 && (
          <table className="table table-bordered">
            <thead>
              <tr>
                <th>Sipariş ID</th>
                <th>Şirket Ünvanı</th>
                <th>Tutar</th>
                <th>Oluşturulma</th>
                <th>Durum</th>
                <th>Fatura</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(order => (
                <tr key={order.order_id}>
                  <td>{order.order_id}</td>
                  <td>{order.company_name || '-'}</td>
                  <td>{order.amount} TL</td>
                  <td>{order.created_at ? new Date(order.created_at).toLocaleString('tr-TR') : ''}</td>
                  <td>{order.is_invoice_created ? 'Fatura Oluşturuldu' : 'Fatura Bekliyor'}</td>
                  <td>
                    <button className="btn btn-outline-primary btn-sm" onClick={() => openModal(order)}>
                      Fatura Gir
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {(!loading && orders.length === 0 && !error) && <div className="alert alert-success">Fatura bekleyen sipariş yok.</div>}
      </div>
      {/* Modal for invoice entry */}
      {showModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ background: 'rgba(0,0,0,0.3)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Fatura Bilgisi Gir</h5>
                <button type="button" className="btn-close" onClick={closeModal}></button>
              </div>
              <form onSubmit={handleInvoiceSubmit}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Fatura Numarası</label>
                    <input type="text" className="form-control" value={invoiceId} onChange={e => setInvoiceId(e.target.value)} required />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Fatura Tarihi</label>
                    <input type="date" className="form-control" value={invoiceDate} onChange={e => setInvoiceDate(e.target.value)} required />
                  </div>
                  {modalError && <div className="alert alert-danger py-2">{modalError}</div>}
                  {modalSuccess && <div className="alert alert-success py-2">{modalSuccess}</div>}
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={closeModal} disabled={modalLoading}>Kapat</button>
                  <button type="submit" className="btn btn-primary" disabled={modalLoading}>{modalLoading ? 'Kaydediliyor...' : 'Kaydet'}</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
