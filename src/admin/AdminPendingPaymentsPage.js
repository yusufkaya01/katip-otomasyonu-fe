import React, { useEffect, useState } from 'react';
import AdminNavbar from './AdminNavbar';
import AdminPagination from '../components/AdminPagination';
import PageLoadingSpinner from '../components/PageLoadingSpinner';
import { useAdminSearch, AdminSearchInput } from '../hooks/useAdminSearch';

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
  const [lowAmountConfirmation, setLowAmountConfirmation] = useState(false);
  const [pendingPaymentData, setPendingPaymentData] = useState(null);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(20);

  // Search functionality
  const { filteredData: filteredOrders, searchProps } = useAdminSearch({
    data: orders,
    searchFields: ['order_id', 'customer_id', 'company_name', 'customer_email'],
    onSearchChange: () => setPage(1) // Reset page when search changes
  });

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
        setOrders(allOrders);
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

    // Check if amount is less than 1000 and show confirmation
    if (Number(paymentAmount) < 1000) {
      setPendingPaymentData({ paymentAmount, paidAt });
      setLowAmountConfirmation(true);
      return;
    }

    // Process payment directly if amount >= 1000
    await processPayment(paymentAmount, paidAt);
  };

  const processPayment = async (amount, date) => {
    setPayLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/admin/orders/${selectedOrder.order_id}/payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-api-key': ADMIN_API_KEY,
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ paymentAmount: Number(amount), paidAt: date }),
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

  const confirmLowAmountPayment = () => {
    if (pendingPaymentData) {
      processPayment(pendingPaymentData.paymentAmount, pendingPaymentData.paidAt);
      setLowAmountConfirmation(false);
      setPendingPaymentData(null);
    }
  };

  const cancelLowAmountPayment = () => {
    setLowAmountConfirmation(false);
    setPendingPaymentData(null);
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

  return (
    <div className="container-fluid px-0">
      <PageLoadingSpinner show={loading} fullscreen />
      <AdminNavbar onLogout={onLogout} />
      <div className="container py-4">
        <h4 className="mb-3">Ödeme Bekleyen Siparişler</h4>
        
        {/* Search Input */}
        <AdminSearchInput 
          searchProps={searchProps}
          placeholder="Sipariş no, müşteri no, şirket adı veya email'e göre ara..."
        />
        
        {error && <div className="alert alert-danger">{error}</div>}
        {filteredOrders.length > 0 && (
          <table className="table table-bordered">
            <thead>
              <tr>
                <th>Sipariş No</th>
                <th>Şirket Ünvanı</th>
                <th>Kalan</th>
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
                  <td>{order.remaining_balance ? `${order.remaining_balance} TL` : '-'}</td>
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
        
        {/* No search results message */}
        {searchProps.searchTerm && filteredOrders.length === 0 && !loading && !error && (
          <div className="alert alert-info">"{searchProps.searchTerm}" araması için sonuç bulunamadı.</div>
        )}
        
        {/* No data message when not searching */}
        {(!loading && !searchProps.searchTerm && orders.length === 0 && !error) && <div className="alert alert-success">Ödeme bekleyen sipariş yok.</div>}
      </div>
      {filteredOrders.length > 0 && (
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
                <h5 className="modal-title">
                  Ödeme Bilgisi Gir<br />
                  <small className="text-muted">{selectedOrder?.company_name || selectedOrder?.customer_name || `Sipariş #${selectedOrder?.order_id}`}</small>
                </h5>
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
                          <strong>İndirimsiz Tutar:</strong><br />
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

      {/* Low Amount Confirmation Modal */}
      {lowAmountConfirmation && (
        <div className="modal show d-block" tabIndex="-1" style={{ background: 'rgba(0,0,0,0.3)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Düşük Tutar Onayı</h5>
                <button type="button" className="btn-close" onClick={cancelLowAmountPayment}></button>
              </div>
              <div className="modal-body">
                <p>
                  <strong>{pendingPaymentData?.paymentAmount} TL</strong> tutarı 1000 TL'den düşüktür. 
                  Bu tutarla ödeme kaydını oluşturmak istediğinizden emin misiniz?
                </p>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={cancelLowAmountPayment}>
                  Hayır
                </button>
                <button type="button" className="btn btn-warning" onClick={confirmLowAmountPayment}>
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
