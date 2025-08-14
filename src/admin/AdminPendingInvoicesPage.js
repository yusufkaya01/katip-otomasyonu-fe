import React, { useEffect, useState } from 'react';
import AdminNavbar from './AdminNavbar';
import AdminPagination from '../components/AdminPagination';
import PageLoadingSpinner from '../components/PageLoadingSpinner';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || '';
const ADMIN_API_KEY = process.env.REACT_APP_ADMIN_API_KEY || '';

export default function AdminPendingInvoicesPage({ onLogout, token }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copyFeedback, setCopyFeedback] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [invoiceId, setInvoiceId] = useState('');
  const [invoiceDate, setInvoiceDate] = useState('');
  const [modalError, setModalError] = useState('');
  const [modalLoading, setModalLoading] = useState(false);
  const [modalSuccess, setModalSuccess] = useState('');
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(20);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    fetchOrders();
    // eslint-disable-next-line
  }, [token]); // Only fetch once, FE paginates

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
      if (res.ok && (data.orders || data.items)) {
        const allOrders = data.orders || data.items || [];
        setTotal(allOrders.length);
        setOrders(allOrders);
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

  // Slice orders for current page
  const paginatedOrders = orders.slice((page - 1) * perPage, page * perPage);

  // Fallback copy using a hidden textarea (works on non-secure contexts)
  const copyTextFallback = (text) => {
    try {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.setAttribute('readonly', '');
      ta.style.position = 'fixed';
      ta.style.top = '-9999px';
      document.body.appendChild(ta);
      ta.focus();
      ta.select();
      ta.setSelectionRange(0, ta.value.length);
      const ok = document.execCommand('copy');
      document.body.removeChild(ta);
      return !!ok;
    } catch (_) {
      return false;
    }
  };

  // Copy helper for clipboard with secure and fallback strategies
  const handleCopy = async (text, label = 'Bilgi') => {
    if (!text) return;
    const done = (success) => {
      setCopyFeedback({ success, message: success ? `${label} kopyalandı.` : `${label} kopyalanamadı.` });
      setTimeout(() => setCopyFeedback(null), 1600);
    };
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
        return done(true);
      }
      // Not secure or API missing: try fallback
      const ok = copyTextFallback(text);
      return done(ok);
    } catch (_) {
      const ok = copyTextFallback(text);
      return done(ok);
    }
  };

  return (
    <div className="container-fluid px-0">
      {copyFeedback && (
        <div 
          className="position-fixed top-50 start-50 translate-middle" 
          style={{zIndex: 10000}}
        >
          <div className={`toast show border-0 shadow-lg ${copyFeedback.success ? 'bg-success text-white' : 'bg-danger text-white'}`} role="alert" style={{minWidth: '280px'}}>
            <div className="toast-body d-flex align-items-center justify-content-center py-2">
              <i className={`me-2 ${copyFeedback.success ? 'bi bi-check-circle-fill' : 'bi bi-x-circle-fill'}`} style={{fontSize: '1.05em'}}></i>
              <span className="fw-semibold">{copyFeedback.message}</span>
            </div>
          </div>
        </div>
      )}
      <PageLoadingSpinner show={loading} fullscreen />
      <AdminNavbar onLogout={onLogout} />
      <div className="container py-4">
        <h4 className="mb-3">Fatura Bekleyen Siparişler</h4>
        {error && <div className="alert alert-danger">{error}</div>}
        {orders.length > 0 && (
          <table className="table table-bordered">
            <thead>
              <tr>
                <th>Sipariş No</th>
                <th>Şirket Ünvanı</th>
                <th>Ödeme Yöntemi</th>
                <th>Vergi Dairesi</th>
                <th>Vergi Kimlik No</th>
                <th>Tutar</th>
                <th>Oluşturulma</th>
                <th>Durum</th>
                <th>Fatura</th>
              </tr>
            </thead>
            <tbody>
              {paginatedOrders.map(order => (
                <tr key={order.order_id}>
                  <td>{order.order_id}</td>
                  <td>{order.company_name || '-'}</td>
                  <td>{order.payment_method === 'cash' ? 'EFT/Havale' : 'Kredi Kartı'}</td>
      <td>
                    <span>{order.tax_office || '-'}</span>
                    {order.tax_office && (
                      <button
                        type="button"
                        className="btn btn-link p-0 ms-2 text-primary"
                        title="Kopyala"
        onClick={() => handleCopy(order.tax_office, 'Vergi Dairesi')}
                      >
                        <i className="bi bi-copy" />
                      </button>
                    )}
                  </td>
      <td>
                    <span style={{ fontFamily: 'monospace' }}>{order.tax_number || '-'}</span>
                    {order.tax_number && (
                      <button
                        type="button"
                        className="btn btn-link p-0 ms-2 text-primary"
                        title="Kopyala"
        onClick={() => handleCopy(order.tax_number, 'Vergi Kimlik No')}
                      >
                        <i className="bi bi-copy" />
                      </button>
                    )}
                  </td>
                  <td>{
                    order.payment_method === 'card' && order.payment_amount 
                      ? `${order.payment_amount} TL` 
                      : order.amount_due 
                        ? `${order.amount_due} TL` 
                        : order.amount 
                          ? `${order.amount} TL` 
                          : '-'
                  }</td>
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
        {orders.length > 0 && (
          <AdminPagination
            page={page}
            perPage={perPage}
            total={total}
            onPageChange={setPage}
            onPerPageChange={v => { setPerPage(v); setPage(1); }}
          />
        )}
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
