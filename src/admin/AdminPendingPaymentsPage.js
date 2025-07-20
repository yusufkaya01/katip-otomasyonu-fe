import React, { useEffect, useState } from 'react';
import AdminNavbar from './AdminNavbar';
import AdminPagination from '../components/AdminPagination';
import PageLoadingSpinner from '../components/PageLoadingSpinner';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || '';
const ADMIN_API_KEY = process.env.REACT_APP_ADMIN_API_KEY || '';

export default function AdminPendingPaymentsPage({ onLogout, token }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [payModal, setPayModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paidAt, setPaidAt] = useState('');
  const [payError, setPayError] = useState('');
  const [payLoading, setPayLoading] = useState(false);
  const [paySuccess, setPaySuccess] = useState('');
  const [discountModal, setDiscountModal] = useState(false);
  const [discountOrder, setDiscountOrder] = useState(null);
  const [discountPercent, setDiscountPercent] = useState('');
  const [discountReason, setDiscountReason] = useState('');
  const [discountError, setDiscountError] = useState('');
  const [discountLoading, setDiscountLoading] = useState(false);
  const [discountSuccess, setDiscountSuccess] = useState('');
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
      const res = await fetch(`${API_BASE_URL}/admin/orders/pending-payment`, {
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

  const openPayModal = (order) => {
    setSelectedOrder(order);
    setPaymentAmount('');
    setPaidAt('');
    setPayError('');
    setPaySuccess('');
    setPayModal(true);
  };

  const closePayModal = () => {
    setPayModal(false);
    setSelectedOrder(null);
    setPaymentAmount('');
    setPaidAt('');
    setPayError('');
    setPaySuccess('');
  };

  const handlePaySubmit = async (e) => {
    e.preventDefault();
    setPayError('');
    setPaySuccess('');
    if (!paymentAmount || isNaN(paymentAmount) || Number(paymentAmount) <= 0) {
      setPayError('Geçerli bir ödeme tutarı giriniz.');
      return;
    }
    if (!paidAt) {
      setPayError('Ödeme tarihi ve saati zorunludur.');
      return;
    }
    setPayLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/admin/orders/${selectedOrder.order_id}/payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-api-key': ADMIN_API_KEY,
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ paymentAmount: Number(paymentAmount), paidAt }),
      });
      const data = await res.json();
      if (res.ok) {
        setPaySuccess('Ödeme başarıyla kaydedildi.');
        fetchOrders();
        setTimeout(() => {
          closePayModal();
        }, 1200);
      } else {
        setPayError(data.error || 'Ödeme kaydedilemedi.');
      }
    } catch (err) {
      setPayError('Sunucuya ulaşılamadı.');
    }
    setPayLoading(false);
  };

  const openDiscountModal = (order) => {
    setDiscountOrder(order);
    setDiscountPercent(order.discount_percent || '');
    setDiscountReason(order.discount_reason || '');
    setDiscountError('');
    setDiscountSuccess('');
    setDiscountModal(true);
  };

  const closeDiscountModal = () => {
    setDiscountModal(false);
    setDiscountOrder(null);
    setDiscountPercent('');
    setDiscountReason('');
    setDiscountError('');
    setDiscountSuccess('');
  };

  const handleDiscountSubmit = async (e) => {
    e.preventDefault();
    setDiscountError('');
    setDiscountSuccess('');
    if (!discountPercent || isNaN(discountPercent) || Number(discountPercent) < 0 || Number(discountPercent) > 100) {
      setDiscountError('Geçerli bir indirim oranı giriniz (0-100).');
      return;
    }
    setDiscountLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/admin/orders/${discountOrder.order_id}/discount`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-api-key': ADMIN_API_KEY,
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ discountPercent: Number(discountPercent), discountReason }),
      });
      const data = await res.json();
      if (res.ok) {
        setDiscountSuccess('İndirim başarıyla kaydedildi.');
        fetchOrders();
        setTimeout(() => {
          closeDiscountModal();
        }, 1200);
      } else {
        setDiscountError(data.error || 'İndirim kaydedilemedi.');
      }
    } catch (err) {
      setDiscountError('Sunucuya ulaşılamadı.');
    }
    setDiscountLoading(false);
  };

  // Slice the orders array to get only the items for the current page
  const paginatedOrders = orders.slice((page - 1) * perPage, page * perPage);

  return (
    <div className="container-fluid px-0">
      <PageLoadingSpinner show={loading} fullscreen />
      <AdminNavbar onLogout={onLogout} />
      <div className="container py-4">
        <h4 className="mb-3">Ödeme Bekleyen Siparişler</h4>
        {error && <div className="alert alert-danger">{error}</div>}
        {orders.length > 0 && (
          <table className="table table-bordered">
            <thead>
              <tr>
                <th>Sipariş No</th>
                <th>Şirket Ünvanı</th>
                <th>Tutar</th>
                <th>Oluşturulma</th>
                <th>Durum</th>
                <th>İşlem</th>
              </tr>
            </thead>
            <tbody>
              {paginatedOrders.map(order => (
                <tr key={order.order_id}>
                  <td>{order.order_id}</td>
                  <td>{order.company_name || '-'}</td>
                  <td>{order.amount_due ? `${order.amount_due} TL` : order.amount ? `${order.amount} TL` : '-'}</td>
                  <td>{order.created_at ? new Date(order.created_at).toLocaleString('tr-TR') : ''}</td>
                  <td>{order.is_paid ? 'Ödendi' : 'Ödeme Bekliyor'}</td>
                  <td>
                    <button className="btn btn-warning btn-sm" onClick={() => openPayModal(order)}>
                      Ödeme Bilgisi Ekle
                    </button>
                    <button className="btn btn-outline-info btn-sm ms-2" onClick={() => openDiscountModal(order)}>
                      İndirim Ekle/Güncelle
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {(!loading && orders.length === 0 && !error) && <div className="alert alert-success">Ödeme bekleyen sipariş yok.</div>}
      </div>
      {orders.length > 0 && (
        <AdminPagination
          page={page}
          perPage={perPage}
          total={total}
          onPageChange={setPage}
          onPerPageChange={v => { setPerPage(v); setPage(1); }}
        />
      )}
      {/* Modal for payment entry */}
      {payModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ background: 'rgba(0,0,0,0.3)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Ödeme Bilgisi Gir</h5>
                <button type="button" className="btn-close" onClick={closePayModal}></button>
              </div>
              <form onSubmit={handlePaySubmit}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Ödeme Tutarı</label>
                    <input type="number" className="form-control" value={paymentAmount} onChange={e => setPaymentAmount(e.target.value)} min={1} required />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Ödeme Tarihi ve Saati</label>
                    <input type="datetime-local" className="form-control" value={paidAt} onChange={e => setPaidAt(e.target.value)} required />
                  </div>
                  {payError && <div className="alert alert-danger py-2">{payError}</div>}
                  {paySuccess && <div className="alert alert-success py-2">{paySuccess}</div>}
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={closePayModal} disabled={payLoading}>Kapat</button>
                  <button type="submit" className="btn btn-primary" disabled={payLoading}>{payLoading ? 'Kaydediliyor...' : 'Kaydet'}</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
      {/* Discount Modal */}
      {discountModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ background: 'rgba(0,0,0,0.3)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">İndirim Bilgisi</h5>
                <button type="button" className="btn-close" onClick={closeDiscountModal}></button>
              </div>
              <form onSubmit={handleDiscountSubmit}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">İndirim Oranı (%)</label>
                    <input type="number" className="form-control" value={discountPercent} onChange={e => setDiscountPercent(e.target.value)} min={0} max={100} required />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">İndirim Nedeni (isteğe bağlı)</label>
                    <input type="text" className="form-control" value={discountReason} onChange={e => setDiscountReason(e.target.value)} />
                  </div>
                  {discountError && <div className="alert alert-danger py-2">{discountError}</div>}
                  {discountSuccess && <div className="alert alert-success py-2">{discountSuccess}</div>}
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={closeDiscountModal} disabled={discountLoading}>Kapat</button>
                  <button type="submit" className="btn btn-primary" disabled={discountLoading}>{discountLoading ? 'Kaydediliyor...' : 'Kaydet'}</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
