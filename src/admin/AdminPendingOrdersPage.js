import React, { useState, useEffect } from 'react';
import AdminNavbar from './AdminNavbar';
import AdminPagination from '../components/AdminPagination';
import PageLoadingSpinner from '../components/PageLoadingSpinner';
import { useAdminSearch, AdminSearchInput } from '../hooks/useAdminSearch';

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
  const [confirmationModal, setConfirmationModal] = useState(false);
  const [orderToConfirm, setOrderToConfirm] = useState(null);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(20);

  // Search functionality
  const { filteredData: filteredOrders, searchProps } = useAdminSearch({
    data: pendingOrders,
    searchFields: ['order_id', 'customer_id', 'company_name', 'customer_email'],
    onSearchChange: () => setPage(1) // Reset page when search changes
  });

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
        setPendingOrders(allOrders);
      } else {
        setError(data.error || 'Siparişler alınamadı.');
      }
    } catch (err) {
      setError('Sunucuya ulaşılamadı.');
    }
    setLoading(false);
  }

  // Reset page when search changes
  const [prevSearchTerm, setPrevSearchTerm] = useState('');
  useEffect(() => {
    if (searchProps.value !== prevSearchTerm) {
      setPage(1);
      setPrevSearchTerm(searchProps.value);
    }
  }, [searchProps.value, prevSearchTerm]);

  const total = filteredOrders.length;
  const paginatedOrders = filteredOrders.slice((page - 1) * perPage, page * perPage);

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

  const showConfirmationModal = (order) => {
    setOrderToConfirm(order);
    setConfirmationModal(true);
  };

  const closeConfirmationModal = () => {
    setConfirmationModal(false);
    setOrderToConfirm(null);
  };

  const confirmLicenseStart = () => {
    if (orderToConfirm) {
      handleConfirm(orderToConfirm.order_id);
      closeConfirmationModal();
    }
  };

  const openDiscountModal = (order) => {
    setDiscountOrder(order);
    setDiscountPercent(''); // Start empty instead of showing existing discount
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
        <h4 className="mb-3">Ödeme Almadan Lisans Onayı</h4>
        
        {/* Search Input */}
        <AdminSearchInput 
          searchProps={searchProps}
          placeholder="Sipariş no, müşteri no, şirket adı veya email'e göre ara..."
        />
        
        {loading && <div className="alert alert-info">Yükleniyor...</div>}
        {error && <div className="alert alert-danger">{error}</div>}
        {pendingOrders.length === 0 && !loading && <div className="alert alert-success">Bekleyen sipariş yok.</div>}
        {filteredOrders.length > 0 && (
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
                {paginatedOrders.map(order => (
                  <tr key={order.order_id}>
                    <td>{order.order_id}</td>
                    <td>{order.customer_name || order.customer_id}</td>
                    <td>{order.company_name || '-'}</td>
                    <td>{order.amount_due ? `${order.amount_due} TL` : order.amount ? `${order.amount} TL` : '-'}</td>
                    <td>{order.created_at ? new Date(order.created_at).toLocaleString('tr-TR') : ''}</td>
                    <td>{order.is_confirmed ? 'Onaylandı' : 'Bekliyor'}</td>
                    <td>
                      <button className="btn btn-success btn-sm" onClick={() => showConfirmationModal(order)} disabled={confirmLoading===order.order_id}>
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
        {(!loading && pendingOrders.length > 0 && filteredOrders.length === 0 && searchProps.value) && (
          <div className="alert alert-info">
            Arama kriterinize uygun sipariş bulunamadı. <strong>"{searchProps.value}"</strong> için sonuç yok.
          </div>
        )}
      </div>
      {/* Discount Modal */}
      {discountModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ background: 'rgba(0,0,0,0.3)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  İndirim Bilgisi<br />
                  <small className="text-muted">{discountOrder?.company_name || discountOrder?.customer_name || `Sipariş #${discountOrder?.order_id}`}</small>
                </h5>
                <button type="button" className="btn-close" onClick={closeDiscountModal}></button>
              </div>
              <form onSubmit={handleDiscountSubmit}>
                <div className="modal-body">
                  {discountOrder && (
                    <div className="mb-3 p-3 bg-light rounded">
                      <div className="row">
                        <div className="col-6">
                          <strong>Orijinal Tutar:</strong><br />
                          <span className="text-muted">{discountOrder.amount || discountOrder.remaining_balance || '18.000'} TL</span>
                        </div>
                        <div className="col-6">
                          <strong>İndirimli Tutar:</strong><br />
                          <span className="text-success fw-bold">
                            {discountPercent && !isNaN(discountPercent) && Number(discountPercent) >= 0 && Number(discountPercent) <= 100
                              ? ((Number(discountOrder.amount || discountOrder.remaining_balance || 18000) * (100 - Number(discountPercent)) / 100).toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' TL')
                              : '0,00 TL'
                            }
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                  <div className="mb-3">
                    <label className="form-label">İndirim Oranı (%)</label>
                    <input 
                      type="number" 
                      className="form-control" 
                      value={discountPercent} 
                      onChange={e => setDiscountPercent(e.target.value)} 
                      min={0} 
                      max={100} 
                      placeholder="İndirim oranını giriniz"
                      required 
                    />
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

      {/* License Start Confirmation Modal */}
      {confirmationModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ background: 'rgba(0,0,0,0.3)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Lisans Uzatma Onayı</h5>
                <button type="button" className="btn-close" onClick={closeConfirmationModal}></button>
              </div>
              <div className="modal-body">
                <p>
                  <strong>{orderToConfirm?.company_name || orderToConfirm?.customer_name || `Sipariş #${orderToConfirm?.order_id}`}</strong> için 
                  ödeme alınmadan lisans süresi uzatılacaktır. Bu işlemi onaylıyor musunuz?
                </p>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={closeConfirmationModal}>
                  Hayır
                </button>
                <button type="button" className="btn btn-success" onClick={confirmLicenseStart}>
                  Evet
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
