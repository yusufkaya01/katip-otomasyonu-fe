import React, { useState, useEffect } from 'react';
import AdminNavbar from './AdminNavbar';
import AdminPagination from '../components/AdminPagination';
import PageLoadingSpinner from '../components/PageLoadingSpinner';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || '';
const ADMIN_API_KEY = process.env.REACT_APP_ADMIN_API_KEY || '';

export default function AdminPendingOrdersPage({ token, onLogout }) {
  const [pendingOrders, setPendingOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [confirmLoading, setConfirmLoading] = useState(false);
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
    fetchPendingOrders();
    // eslint-disable-next-line
  }, [token]); // Only fetch once, FE paginates

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
      if (res.ok && (data.orders || data.items)) {
        const allOrders = data.orders || data.items || [];
        setTotal(allOrders.length);
        setPendingOrders(allOrders);
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
        fetchPendingOrders();
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

  return (
    <div className="container-fluid px-0">
      <PageLoadingSpinner show={loading} fullscreen />
      <AdminNavbar onLogout={onLogout} />
      <div className="container py-4">
        <h4 className="mb-3">Bekleyen Siparişler</h4>
        {loading && <div className="alert alert-info">Yükleniyor...</div>}
        {error && <div className="alert alert-danger">{error}</div>}
        {pendingOrders.length === 0 && !loading && <div className="alert alert-success">Bekleyen sipariş yok.</div>}
        {pendingOrders.length > 0 && (
          <>
            <table className="table table-bordered">
              <thead>
                <tr>
                  <th>Sipariş No</th>
                  <th>Müşteri No</th>
                  <th>Şirket Ünvanı</th>
                  <th>Tutar</th>
                  <th>Oluşturulma</th>
                  <th>Durum</th>
                  <th>İşlemler</th>
                </tr>
              </thead>
              <tbody>
                {pendingOrders.slice((page - 1) * perPage, page * perPage).map(order => (
                  <tr key={order.order_id}>
                    <td>{order.order_id}</td>
                    <td>{order.customer_name || order.customer_id}</td>
                    <td>{order.company_name || '-'}</td>
                    <td>{order.amount_due ? `${order.amount_due} TL` : order.amount ? `${order.amount} TL` : '-'}</td>
                    <td>{order.created_at ? new Date(order.created_at).toLocaleString('tr-TR') : ''}</td>
                    <td>{order.is_confirmed ? 'Onaylandı' : 'Bekliyor'}</td>
                    <td>
                      <button className="btn btn-success btn-sm" onClick={() => handleConfirm(order.order_id)} disabled={confirmLoading===order.order_id}>
                        {confirmLoading===order.order_id ? 'Lisans Başlatılıyor...' : 'Lisansı Başlat'}
                      </button>
                      <button className="btn btn-outline-info btn-sm ms-2" onClick={() => openDiscountModal(order)}>
                        İndirim Ekle/Güncelle
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <AdminPagination
              page={page}
              perPage={perPage}
              total={total}
              onPageChange={setPage}
              onPerPageChange={v => { setPerPage(v); setPage(1); }}
            />
          </>
        )}
      </div>
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
