import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { useAuth } from '../context/AuthContext';
import authFetch from '../api/authFetch';

function LoadingSpinner() {
  return (
    <div className="d-flex justify-content-center align-items-center" style={{ minHeight: 300 }}>
      <div className="spinner-border text-danger" role="status">
        <span className="visually-hidden">Yükleniyor...</span>
      </div>
    </div>
  );
}

function IsletmemPage() {
  const { user, updateUser, logout, loading } = useAuth();
  const [emailVerified, setEmailVerified] = useState(null);
  const [editField, setEditField] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showLicense, setShowLicense] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendMessage, setResendMessage] = useState('');
  const [showExtendModal, setShowExtendModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [orderStep, setOrderStep] = useState(1); // 1: select, 2: confirm
  const [orderLoading, setOrderLoading] = useState(false);
  const [orderError, setOrderError] = useState('');
  const [orderResult, setOrderResult] = useState(null);
  const [pendingOrders, setPendingOrders] = useState([]);
  const [pendingLoading, setPendingLoading] = useState(false);
  const [pendingError, setPendingError] = useState('');
  const [bankIbans, setBankIbans] = useState([]);
  const [showPendingBankDetails, setShowPendingBankDetails] = useState(false);
  // Card payment status states
  const [cardOrderId, setCardOrderId] = useState(null);
  const [cardStatus, setCardStatus] = useState(null);
  const [cardStatusLoading, setCardStatusLoading] = useState(false);
  const [cardStatusError, setCardStatusError] = useState('');
  // Payment result modal states
  const [showPaymentResult, setShowPaymentResult] = useState(false);
  const [paymentResultStatus, setPaymentResultStatus] = useState('waiting'); // 'waiting', 'success', 'error', 'timeout'
  const [paymentResultMsg, setPaymentResultMsg] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const API_KEY = process.env.REACT_APP_USER_API_KEY;
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://customers.katipotomasyonu.com/api';
  const didFetchRef = useRef(false);

  useEffect(() => {
    if (loading) return;
    if (!user || !user.accessToken) {
      navigate('/giris', { replace: true });
      return;
    }
    if (didFetchRef.current) return;
    didFetchRef.current = true;
    // Use authFetch for profile
    authFetch(`${API_BASE_URL}/osgb/profile`, { method: 'GET' }, { accessToken: user.accessToken })
      .then(res => {
        if (!res.ok) throw new Error('Kullanıcı oturumu geçersiz veya süresi dolmuş.');
        return res.json();
      })
      .then(data => {
        const updatedUser = { ...user, ...data.user, accessToken: user.accessToken };
        updateUser(updatedUser);
        setEmailVerified(data.user.email_verified);
      })
      .catch(() => {
        logout();
        navigate('/giris', { replace: true });
      });
  }, [navigate, API_KEY, user, updateUser, logout, loading, API_BASE_URL]);

  // Map backend error to Turkish for pending order
  const getOrderErrorMessage = (msg) => {
    if (msg === 'You already have a pending order. Please complete payment or wait for invoice.') {
      return 'Zaten bekleyen bir siparişiniz var. Lütfen mevcut siparişinizin ödemesini tamamlayın veya fatura bekleyin.';
    }
    return msg;
  };

  // Fetch pending orders on mount (new logic for new API response)
  useEffect(() => {
    if (!user || !user.accessToken) return;
    setPendingLoading(true);
    setPendingError('');
    fetch(`${API_BASE_URL}/osgb/orders/pending`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': API_KEY,
        'Authorization': `Bearer ${user.accessToken}`
      }
    })
      .then(res => res.json())
      .then(data => {
        if (data && Array.isArray(data.pendingOrders)) {
          setPendingOrders(data.pendingOrders);
        } else {
          setPendingOrders([]);
        }
      })
      .catch(() => setPendingError('Bekleyen siparişler alınamadı.'))
      .finally(() => setPendingLoading(false));
  }, [user, API_KEY, API_BASE_URL]);

  const handleEditClick = (key) => {
    if (!(key === 'phone' || key === 'email')) return;
    setEditField(key);
    setEditValue(user[key] || '');
    setError('');
    setSuccess('');
    setConfirming(true);
  };

  const handleConfirm = async () => {
    setError('');
    setSuccess('');
    if (!editValue) {
      setError('Geçerli bir değer giriniz.');
      return;
    }
    // Remove password checks, since password editing is not allowed
    if (!user.accessToken) {
      setError('Kimlik doğrulama hatası: Lütfen tekrar giriş yapın.');
      return;
    }
    // Only allow PATCH for phone and email
    let payload = {};
    if (editField === 'phone') {
      payload = { phone: `+90${editValue}` };
    } else if (editField === 'email') {
      payload = { email: editValue };
    } else {
      setError('Sadece telefon ve e-posta güncellenebilir.');
      return;
    }
    try {
      const res = await authFetch(`${API_BASE_URL}/osgb/update-osgb-info`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'x-api-key': API_KEY },
        body: JSON.stringify(payload)
      }, { accessToken: user.accessToken, refreshToken: user.refreshToken, updateAccessToken: updateUser, logout });
      if (res.status === 200) {
        // After successful update, fetch latest profile
        const profileRes = await authFetch(`${API_BASE_URL}/osgb/profile`, { method: 'GET', headers: { 'x-api-key': API_KEY } }, { accessToken: user.accessToken });
        if (profileRes.ok) {
          const profileData = await profileRes.json();
          const updatedUser = { ...user, ...profileData.user, accessToken: user.accessToken };
          updateUser(updatedUser);
          setEmailVerified(profileData.user.email_verified);
          setSuccess('Bilgileriniz başarıyla güncellendi.');
          setConfirming(false);
        } else {
          setError('Profil güncellendi ancak tekrar giriş yapmanız gerekiyor.');
          logout();
          navigate('/giris', { replace: true });
        }
      } else {
        const data = await res.json();
        setError(data.error || 'Güncelleme sırasında bir hata oluştu.');
      }
    } catch (err) {
      setError('Sunucuya bağlanılamadı.');
    }
  };

  const handleResendVerification = async () => {
    setResendLoading(true);
    setResendMessage('');
    try {
      const res = await fetch(`${API_BASE_URL}/osgb/resend-verification`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': API_KEY
        },
        body: JSON.stringify({ email: user.email })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setResendMessage('Doğrulama e-postası tekrar gönderildi. Lütfen e-posta kutunuzu kontrol edin.');
      } else if (data.error === 'ALREADY_VERIFIED') {
        setResendMessage('E-posta adresiniz zaten doğrulanmış.');
      } else if (data.error === 'USER_NOT_FOUND') {
        setResendMessage('Kullanıcı bulunamadı.');
      } else {
        setResendMessage('Bir hata oluştu. Lütfen tekrar deneyin.');
      }
    } catch (err) {
      setResendMessage('Sunucuya ulaşılamıyor. Lütfen tekrar deneyin.');
    }
    setResendLoading(false);
  };

  // Helper to get frontend base URL
  function getFrontendBaseUrl() {
    if (typeof window !== 'undefined') {
      return window.location.origin;
    }
    return '';
  }

  // License extension order handler
  const handleCreateOrder = async () => {
    setOrderLoading(true);
    setOrderError('');
    setOrderResult(null);
    setBankIbans([]);
    setCardOrderId(null);
    setCardStatus(null);
    setCardStatusError('');
    try {
      // Build returnUrl for card payments
      let body = { payment_method: paymentMethod };
      if (paymentMethod === 'card') {
        // Use a dedicated payment result page, or fallback to /isletmem
        const baseUrl = getFrontendBaseUrl();
        body.returnUrl = `${baseUrl}/isletmem?orderId=ORDER_ID_PLACEHOLDER`;
      }
      const res = await fetch(`${API_BASE_URL}/osgb/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': API_KEY,
          'Authorization': `Bearer ${user.accessToken}`
        },
        body: JSON.stringify(body)
      });
      const data = await res.json();
      if (res.ok && data.success !== false) {
        // Card payment: open iyzico in new tab and poll for status
        if (paymentMethod === 'card' && data.iyzico && data.iyzico.paymentPageUrl) {
          const orderId = data.order?.order_id || data.order_id || data.iyzico.orderId || null;
          setCardOrderId(orderId);
          setShowPaymentResult(true);
          setShowExtendModal(false); // Close the order modal for best UX
          setPaymentResultStatus('waiting');
          setPaymentResultMsg('Ödeme sayfası yeni sekmede açıldı. Lütfen ödemenizi tamamlayınız...');
          // Open iyzico in new tab
          window.open(data.iyzico.paymentPageUrl, '_blank', 'noopener');
          // Start polling for payment status
          let attempts = 0;
          const maxAttempts = 40; // ~2 minutes
          let stopped = false;
          async function poll() {
            while (attempts < maxAttempts && !stopped) {
              try {
                const res = await fetch(`${API_BASE_URL}/osgb/orders/${orderId}`, {
                  method: 'GET',
                  headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': API_KEY,
                    'Authorization': user?.accessToken ? `Bearer ${user.accessToken}` : ''
                  }
                });
                const data = await res.json();
                // New logic: check status field from BE
                if (res.ok && data.status) {
                  if (data.status === 'paid') {
                    setPaymentResultStatus('success');
                    setPaymentResultMsg('Ödemeniz başarıyla tamamlandı!');
                    return;
                  } else if (data.status === 'failed') {
                    setPaymentResultStatus('error');
                    setPaymentResultMsg(data.failureReason || 'Ödeme işlemi başarısız oldu. Lütfen kart bilgilerinizi ve bakiyenizi kontrol edin veya bankanız ile iletişime geçin.');
                    return;
                  } // else pending: continue polling
                } else if (res.ok && data.order && data.order.is_paid) {
                  setPaymentResultStatus('success');
                  setPaymentResultMsg('Ödemeniz başarıyla tamamlandı!');
                  return;
                } else if (res.status === 404) {
                  setPaymentResultStatus('error');
                  setPaymentResultMsg('Sipariş bulunamadı. Lütfen destek ile iletişime geçin.');
                  return;
                }
              } catch (err) {
                setPaymentResultStatus('error');
                setPaymentResultMsg('Sunucuya ulaşılamadı. Lütfen tekrar deneyin.');
                return;
              }
              attempts++;
              await new Promise(r => setTimeout(r, 3000));
            }
            if (!stopped) {
              setPaymentResultStatus('timeout');
              setPaymentResultMsg('Ödeme tamamlanmadı veya zaman aşımına uğradı. Lütfen tekrar deneyin veya destek ile iletişime geçin.');
            }
          }
          poll();
          return; // Don't continue modal flow, user is polling
        }
        setOrderResult(data);
        setOrderStep(3); // success
        // If payment is cash and no ibans in result, fetch them
        if (paymentMethod === 'cash' && (!data.ibans || !Array.isArray(data.ibans) || data.ibans.length === 0) && (!data.banks || !Array.isArray(data.banks) || data.banks.length === 0)) {
          fetch(`${API_BASE_URL}/osgb/bank-ibans`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'x-api-key': API_KEY,
              'Authorization': `Bearer ${user.accessToken}`
            }
          })
            .then(res => res.json())
            .then(ibanData => {
              if (Array.isArray(ibanData)) setBankIbans(ibanData);
              else if (ibanData.ibans && Array.isArray(ibanData.ibans)) setBankIbans(ibanData.ibans);
              else if (ibanData.banks && Array.isArray(ibanData.banks)) setBankIbans(ibanData.banks);
            });
        } else if (paymentMethod === 'cash' && data.banks && Array.isArray(data.banks)) {
          setBankIbans(data.banks);
        } else if (paymentMethod === 'cash' && data.ibans && Array.isArray(data.ibans)) {
          setBankIbans(data.ibans);
        }
      } else {
        setOrderError(getOrderErrorMessage(data.error || data.message || 'Sipariş oluşturulamadı.'));
      }
    } catch (err) {
      setOrderError('Sunucuya ulaşılamadı.');
    }
    setOrderLoading(false);
  };

  // Card payment: check status handler
  const handleCheckCardStatus = async () => {
    if (!cardOrderId) return;
    setCardStatusLoading(true);
    setCardStatusError('');
    setCardStatus(null);
    try {
      const res = await fetch(`${API_BASE_URL}/osgb/orders/${cardOrderId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': API_KEY,
          'Authorization': `Bearer ${user.accessToken}`
        }
      });
      const data = await res.json();
      if (res.ok && data.order) {
        setCardStatus(data.order.is_paid ? 'success' : 'pending');
      } else {
        setCardStatusError('Sipariş durumu alınamadı.');
      }
    } catch (err) {
      setCardStatusError('Sunucuya ulaşılamadı.');
    }
    setCardStatusLoading(false);
  };

  // On mount, check for orderId in URL and start polling if present
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const orderId = params.get('orderId');
    if (orderId) {
      setShowPaymentResult(true);
      setPaymentResultStatus('waiting');
      setPaymentResultMsg('Ödemeniz işleniyor, lütfen bekleyiniz...');
      // Polling logic
      let attempts = 0;
      const maxAttempts = 40; // ~2 minutes
      let stopped = false;
      async function poll() {
        while (attempts < maxAttempts && !stopped) {
          try {
            const res = await fetch(`${API_BASE_URL}/osgb/orders/${orderId}`, {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
                'x-api-key': API_KEY,
                'Authorization': user?.accessToken ? `Bearer ${user.accessToken}` : ''
              }
            });
            const data = await res.json();
            // New logic: check status field from BE
            if (res.ok && data.status) {
              if (data.status === 'paid') {
                setPaymentResultStatus('success');
                setPaymentResultMsg('Ödemeniz başarıyla tamamlandı!');
                return;
              } else if (data.status === 'failed') {
                setPaymentResultStatus('error');
                setPaymentResultMsg(data.failureReason || 'Ödeme işlemi başarısız oldu. Lütfen kart bilgilerinizi ve bakiyenizi kontrol edin veya bankanız ile iletişime geçin.');
                return;
              } // else pending: continue polling
            } else if (res.ok && data.order && data.order.is_paid) {
              setPaymentResultStatus('success');
              setPaymentResultMsg('Ödemeniz başarıyla tamamlandı!');
              return;
            } else if (res.status === 404) {
              setPaymentResultStatus('error');
              setPaymentResultMsg('Sipariş bulunamadı. Lütfen destek ile iletişime geçin.');
              return;
            }
          } catch (err) {
            setPaymentResultStatus('error');
            setPaymentResultMsg('Sunucuya ulaşılamadı. Lütfen tekrar deneyin.');
            return;
          }
          attempts++;
          await new Promise(r => setTimeout(r, 3000));
        }
        if (!stopped) {
          setPaymentResultStatus('timeout');
          setPaymentResultMsg('Ödeme tamamlanmadı veya zaman aşımına uğradı. Lütfen tekrar deneyin veya destek ile iletişime geçin.');
        }
      }
      poll();
      return () => { stopped = true; };
    }
  }, [location.search, API_BASE_URL, API_KEY, user]);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!user) return null;

  return (
    <div className="container py-5" style={{ maxWidth: 600 }}>
      {/* Payment Result Modal */}
      {showPaymentResult && (
        <div className="modal show d-block" tabIndex="-1" style={{ background: 'rgba(0,0,0,0.3)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Ödeme Sonucu</h5>
                <button type="button" className="btn-close" onClick={() => setShowPaymentResult(false)}></button>
              </div>
              <div className="modal-body text-center">
                {paymentResultStatus === 'waiting' && (
                  <>
                    <div className="mb-3">
                      <div className="spinner-border text-danger" role="status">
                        <span className="visually-hidden">Yükleniyor...</span>
                      </div>
                    </div>
                    <div>{paymentResultMsg}</div>
                    <button className="btn btn-outline-success btn-sm mt-3" onClick={async () => {
                      if (!cardOrderId) return;
                      setPaymentResultMsg('Ödeme durumu kontrol ediliyor...');
                      try {
                        const res = await fetch(`${API_BASE_URL}/osgb/orders/${cardOrderId}`, {
                          method: 'GET',
                          headers: {
                            'Content-Type': 'application/json',
                            'x-api-key': API_KEY,
                            'Authorization': user?.accessToken ? `Bearer ${user.accessToken}` : ''
                          }
                        });
                        const data = await res.json();
                        if (res.ok && data.order) {
                          if (data.order.is_paid) {
                            setPaymentResultStatus('success');
                            setPaymentResultMsg('Ödemeniz başarıyla tamamlandı!');
                          } else {
                            setPaymentResultMsg('Ödeme henüz tamamlanmamış. Lütfen tekrar deneyin.');
                          }
                        } else if (res.status === 404) {
                          setPaymentResultStatus('error');
                          setPaymentResultMsg('Sipariş bulunamadı. Lütfen destek ile iletişime geçin.');
                        } else {
                          setPaymentResultMsg('Ödeme durumu alınamadı. Lütfen tekrar deneyin.');
                        }
                      } catch (err) {
                        setPaymentResultMsg('Sunucuya ulaşılamadı. Lütfen tekrar deneyin.');
                      }
                    }}>
                      Ödeme Durumunu Manuel Kontrol Et
                    </button>
                  </>
                )}
                {paymentResultStatus === 'success' && (
                  <>
                    <div className="mb-3">
                      <i className="bi bi-check-circle-fill text-success" style={{fontSize:'2.5rem'}}></i>
                    </div>
                    <div className="fw-bold text-success mb-2">{paymentResultMsg}</div>
                    <button className="btn btn-success w-100" onClick={() => setShowPaymentResult(false)}>Devam Et</button>
                  </>
                )}
                {(paymentResultStatus === 'error' || paymentResultStatus === 'timeout') && (
                  <>
                    <div className="mb-3">
                      <i className="bi bi-x-circle-fill text-danger" style={{fontSize:'2.5rem'}}></i>
                    </div>
                    <div className="fw-bold text-danger mb-2">{paymentResultMsg}</div>
                    <button className="btn btn-danger w-100" onClick={() => setShowPaymentResult(false)}>Kapat</button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Pending Orders Section */}
      {pendingLoading && <div className="alert alert-info">Bekleyen siparişler yükleniyor...</div>}
      {pendingError && <div className="alert alert-danger">{pendingError}</div>}
      {pendingOrders.length > 0 && (
        <div className="alert alert-warning mb-4">
          <div className="fw-bold mb-2">Bekleyen Lisans Uzatma Siparişiniz Var</div>
          <ul className="mb-2">
            {pendingOrders.map((order, i) => (
              <li key={order.order_id || i}>
                {order.payment_method === 'cash' ? 'EFT/Havale' : 'Kredi Kartı'} ile {order.amount ? `${order.amount} TL` : '12.000 TL'} / {order.created_at ? new Date(order.created_at).toLocaleDateString('tr-TR') : ''} - Bekliyor
              </li>
            ))}
          </ul>
          <button className="btn btn-outline-danger btn-sm mb-2" onClick={() => setShowPendingBankDetails(true)}>
            Banka Bilgilerini Göster
          </button>
          <div className="small">Yeni bir sipariş oluşturmak için önce mevcut siparişi tamamlayın.</div>
        </div>
      )}
      {/* Pending Bank Details Modal */}
      {showPendingBankDetails && (
        <div className="modal show d-block" tabIndex="-1" style={{ background: 'rgba(0,0,0,0.3)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Banka Bilgileri</h5>
                <button type="button" className="btn-close" onClick={() => setShowPendingBankDetails(false)}></button>
              </div>
              <div className="modal-body small">
                <div className="mb-2 text-center fw-bold d-flex align-items-center justify-content-center gap-2">
                  Alıcı Adı: Arkaya Arge Yazılım İnşaat Ticaret Ltd.Şti.
                  <button
                    className="btn btn-link p-0 text-danger ms-1"
                    title="Kopyala"
                    style={{fontSize:'1.1em'}}
                    onClick={() => navigator.clipboard.writeText('Arkaya Arge Yazılım İnşaat Ticaret Ltd.Şti.')}
                  >
                    <i className="bi bi-clipboard"></i>
                  </button>
                </div>
                <div className="mb-2 text-danger text-center" style={{fontWeight:'bold'}}>
                  Lütfen EFT/havale açıklamasına aşağıdakilerden birini yazınız:<br/>
                  <span style={{display:'inline-block',marginTop:6}}>
                    <span className="d-flex align-items-center justify-content-center gap-2 mb-1">
                      Katip Otomasyonu <span style={{fontFamily:'monospace'}}>{user.customer_id}</span>
                      <button
                        className="btn btn-link p-0 text-danger ms-1"
                        title="Kopyala"
                        style={{fontSize:'1.1em'}}
                        onClick={() => navigator.clipboard.writeText(`Katip Otomasyonu ${user.customer_id}`)}
                      >
                        <i className="bi bi-clipboard"></i>
                      </button>
                    </span>
                    <div>veya</div>
                    <span className="d-flex align-items-center justify-content-center gap-2 mt-1">
                      Katip Otomasyonu <span style={{fontFamily:'monospace'}}>{user.licenseKey}</span>
                      <button
                        className="btn btn-link p-0 text-danger ms-1"
                        title="Kopyala"
                        style={{fontSize:'1.1em'}}
                        onClick={() => navigator.clipboard.writeText(`Katip Otomasyonu ${user.licenseKey}`)}
                      >
                        <i className="bi bi-clipboard"></i>
                      </button>
                    </span>
                  </span>
                </div>
                <div className="mb-2">Aşağıdaki banka hesaplarına EFT/Havale ile ödeme yapabilirsiniz:</div>
                <div>
                  {(bankIbans.length > 0 ? bankIbans : [
                    { bank: 'Ziraat Bankası', iban: 'TR00 0001 0000 0000 0000 0000 01' },
                    { bank: 'İş Bankası', iban: 'TR00 0006 4000 0000 0000 0000 02' },
                    { bank: 'Garanti BBVA', iban: 'TR00 0006 2000 0000 0000 0000 03' },
                    { bank: 'Akbank', iban: 'TR00 0004 6000 0000 0000 0000 04' },
                    { bank: 'Yapı Kredi', iban: 'TR00 0006 7000 0000 0000 0000 05' },
                  ]).map((iban, i, arr) => (
                    <React.Fragment key={i}>
                      <div className="d-flex align-items-center justify-content-between flex-wrap" style={{gap:8}}>
                        <div>
                          <span className="fw-bold">{iban.bank}:</span> <span style={{fontFamily:'monospace'}}>{iban.iban}</span>
                        </div>
                        <button
                          className="btn btn-link p-0 text-danger ms-2"
                          title="Kopyala"
                          style={{fontSize:'1.1em'}}
                          onClick={() => navigator.clipboard.writeText(iban.iban)}
                        >
                          <i className="bi bi-clipboard"></i>
                        </button>
                      </div>
                      {i < arr.length - 1 && (
                        <hr className="my-2" style={{width:'60%',margin:'8px auto',borderTop:'1px solid #bbb'}} />
                      )}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      <div className="d-flex align-items-center justify-content-between mb-4">
        <h2 className="mb-0">İşletmem</h2>
        <button className="btn btn-outline-danger" onClick={() => { setShowExtendModal(true); setOrderStep(1); setOrderError(''); setOrderResult(null); setPaymentMethod('cash'); }} disabled={pendingOrders.length > 0}>
          Lisans Süremi Uzat
        </button>
      </div>
      {/* License Extension Modal */}
      {showExtendModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ background: 'rgba(0,0,0,0.3)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Lisans Süresi Uzatma</h5>
                <button type="button" className="btn-close" onClick={() => setShowExtendModal(false)}></button>
              </div>
              <div className="modal-body">
                {orderStep === 1 && (
                  <>
                    <div className="mb-3 text-center">
                      <div className="fw-bold mb-2">Lisansınız <span className="text-danger">12.000 TL</span> karşılığında <span className="text-danger">366 gün</span> daha uzatılacaktır.</div>
                      <div className="text-muted" style={{fontSize:'0.95em'}}>Sipariş sonrası lisansınız otomatik olarak uzatılır.</div>
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Ödeme Yöntemi</label>
                      <div className="d-flex gap-3">
                        <div className="form-check">
                          <input className="form-check-input" type="radio" id="pay-cash" name="paymentMethod" value="cash" checked={paymentMethod==='cash'} onChange={()=>setPaymentMethod('cash')} />
                          <label className="form-check-label" htmlFor="pay-cash">EFT/Havale</label>
                        </div>
                        <div className="form-check">
                          <input className="form-check-input" type="radio" id="pay-card" name="paymentMethod" value="card" checked={paymentMethod==='card'} onChange={()=>setPaymentMethod('card')} />
                          <label className="form-check-label" htmlFor="pay-card">Kredi Kartı</label>
                        </div>
                      </div>
                    </div>
                    {orderError && <div className="alert alert-danger py-2">{orderError}</div>}
                    <button className="btn btn-danger w-100" onClick={()=>setOrderStep(2)} disabled={orderLoading}>Sipariş Oluştur</button>
                  </>
                )}
                {orderStep === 2 && (
                  <>
                    <div className="mb-3">
                      <div className="fw-bold mb-2">Sipariş Özeti</div>
                      <ul className="list-group mb-3">
                        <li className="list-group-item d-flex justify-content-between align-items-center">
                          <span>Lisans Uzatma</span>
                          <span>12.000 TL / 366 gün</span>
                        </li>
                        <li className="list-group-item d-flex justify-content-between align-items-center">
                          <span>Ödeme Yöntemi</span>
                          <span>{paymentMethod === 'cash' ? 'EFT/Havale' : 'Kredi Kartı'}</span>
                        </li>
                      </ul>
                      <div className="alert alert-warning small">Siparişi onayladığınızda ödeme adımına yönlendirileceksiniz.</div>
                    </div>
                    {orderError && <div className="alert alert-danger py-2">{orderError}</div>}
                    <div className="d-flex justify-content-between">
                      <button className="btn btn-secondary" onClick={()=>setOrderStep(1)} disabled={orderLoading}>Geri</button>
                      <button className="btn btn-danger" onClick={handleCreateOrder} disabled={orderLoading}>{orderLoading ? 'Oluşturuluyor...' : 'Siparişi Onayla'}</button>
                    </div>
                  </>
                )}
                {orderStep === 3 && orderResult && (
                  <>
                    <div className="mb-3">
                      <div className="fw-bold mb-2">Siparişiniz başarıyla oluşturuldu.</div>
                      {paymentMethod === 'cash' && (
                        <div className="alert alert-info small">
                          <div className="mb-2 text-center fw-bold d-flex align-items-center justify-content-center gap-2">
                            Alıcı Adı: Arkaya Arge Yazılım İnşaat Ticaret Ltd.Şti.
                            <button
                              className="btn btn-link p-0 text-danger ms-1"
                              title="Kopyala"
                              style={{fontSize:'1.1em'}}
                              onClick={() => navigator.clipboard.writeText('Arkaya Arge Yazılım İnşaat Ticaret Ltd.Şti.')}
                            >
                              <i className="bi bi-clipboard"></i>
                            </button>
                          </div>
                          <div className="mb-2 text-danger text-center" style={{fontWeight:'bold'}}>
                            Lütfen EFT/havale açıklamasına aşağıdakilerden birini yazınız:<br/>
                            <span style={{display:'inline-block',marginTop:6}}>
                              <span className="d-flex align-items-center justify-content-center gap-2 mb-1">
                                Katip Otomasyonu <span style={{fontFamily:'monospace'}}>{user.customer_id}</span>
                                <button
                                  className="btn btn-link p-0 text-danger ms-1"
                                  title="Kopyala"
                                  style={{fontSize:'1.1em'}}
                                  onClick={() => navigator.clipboard.writeText(`Katip Otomasyonu ${user.customer_id}`)}
                                >
                                  <i className="bi bi-clipboard"></i>
                                </button>
                              </span>
                              <div>veya</div>
                              <span className="d-flex align-items-center justify-content-center gap-2 mt-1">
                                Katip Otomasyonu <span style={{fontFamily:'monospace'}}>{user.licenseKey}</span>
                                <button
                                  className="btn btn-link p-0 text-danger ms-1"
                                  title="Kopyala"
                                  style={{fontSize:'1.1em'}}
                                  onClick={() => navigator.clipboard.writeText(`Katip Otomasyonu ${user.licenseKey}`)}
                                >
                                  <i className="bi bi-clipboard"></i>
                                </button>
                              </span>
                            </span>
                          </div>
                          <div className="mb-2">Aşağıdaki banka hesaplarına EFT/Havale ile ödeme yapabilirsiniz:</div>
                          <div>
                            {(orderResult.ibans && orderResult.ibans.length > 0
                              ? orderResult.ibans
                              : orderResult.banks && orderResult.banks.length > 0
                                ? orderResult.banks
                                : bankIbans
                            ).map((iban, i, arr) => (
                              <React.Fragment key={i}>
                                <div className="d-flex align-items-center justify-content-between flex-wrap" style={{gap:8}}>
                                  <div>
                                    <span className="fw-bold">{iban.bank}:</span> <span style={{fontFamily:'monospace'}}>{iban.iban}</span>
                                  </div>
                                  <button
                                    className="btn btn-link p-0 text-danger ms-2"
                                    title="Kopyala"
                                    style={{fontSize:'1.1em'}}
                                    onClick={() => navigator.clipboard.writeText(iban.iban)}
                                  >
                                    <i className="bi bi-clipboard"></i>
                                  </button>
                                </div>
                                {i < arr.length - 1 && (
                                  <hr className="my-2" style={{width:'60%',margin:'8px auto',borderTop:'1px solid #bbb'}} />
                                )}
                              </React.Fragment>
                            ))}
                          </div>
                        </div>
                      )}
                      {paymentMethod === 'card' && (
                        <div className="alert alert-info small">
                          Kredi kartı ile ödeme işlemi başlatıldı.<br />
                          <b>Ödeme sayfasına yönlendirildiniz.</b><br />
                          Eğer ödeme tamamlandıysa, aşağıdan ödeme durumunu kontrol edebilirsiniz.<br />
                          <button className="btn btn-outline-success btn-sm mt-2" onClick={handleCheckCardStatus} disabled={cardStatusLoading}>
                            {cardStatusLoading ? 'Kontrol Ediliyor...' : 'Ödeme Durumunu Kontrol Et'}
                          </button>
                          {cardStatus === 'success' && <div className="alert alert-success mt-2 py-1">Ödeme başarılı! Lisansınız uzatıldı.</div>}
                          {cardStatus === 'pending' && <div className="alert alert-warning mt-2 py-1">Ödeme henüz tamamlanmamış.</div>}
                          {cardStatusError && <div className="alert alert-danger mt-2 py-1">{cardStatusError}</div>}
                        </div>
                      )}
                    </div>
                    <button className="btn btn-success w-100" onClick={()=>setShowExtendModal(false)}>Kapat</button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      <div className="card p-4 shadow-sm">
        {/* Customer ID Display */}
        {user.customer_id && (
          <div className="mb-2 d-flex align-items-center">
            <strong style={{ minWidth: 140 }}>Müşteri Numarası:</strong>
            <span className="mx-2" style={{ fontFamily: 'monospace', letterSpacing: '1px' }}>{user.customer_id}</span>
            <button
              className="btn btn-link p-0 text-danger mx-1"
              title="Kopyala"
              onClick={() => navigator.clipboard.writeText(user.customer_id)}
            >
              <i className="bi bi-clipboard"></i>
            </button>
          </div>
        )}
        {/* License Key Display */}
        {user.licenseKey && (
          <div className="mb-2 d-flex align-items-center">
            <strong style={{ minWidth: 140 }}>Lisans Anahtarı:</strong>
            <span className="mx-2" style={{ letterSpacing: '1px', fontFamily: 'monospace' }}>
              {showLicense ? user.licenseKey : '•'.repeat(user.licenseKey.length)}
            </span>
            <button
              className="btn btn-link p-0 text-danger mx-1"
              title="Kopyala"
              onClick={() => navigator.clipboard.writeText(user.licenseKey)}
            >
              <i className="bi bi-clipboard"></i>
            </button>
            <button
              className="btn btn-link p-0 text-secondary"
              title={showLicense ? 'Gizle' : 'Göster'}
              onClick={() => setShowLicense(v => !v)}
            >
              <i className={`bi bi-eye${showLicense ? '-slash' : ''}`}></i>
            </button>
          </div>
        )}
        {/* Şirket Ünvanı */}
        <div className="mb-2 d-flex align-items-center">
          <strong style={{ minWidth: 140 }}>Şirket Ünvanı:</strong>
          <span className="mx-2">{user.company_name}</span>
        </div>
        {/* Şehir */}
        <div className="mb-2 d-flex align-items-center">
          <strong style={{ minWidth: 140 }}>Şehir:</strong>
          <span className="mx-2">{user.city}</span>
        </div>
        {/* İlçe */}
        <div className="mb-2 d-flex align-items-center">
          <strong style={{ minWidth: 140 }}>İlçe:</strong>
          <span className="mx-2">{user.district}</span>
        </div>
        {/* Adres */}
        <div className="mb-2 d-flex align-items-center">
          <strong style={{ minWidth: 140 }}>Adres:</strong>
          <span className="mx-2">{user.address}</span>
        </div>
        {/* Only show edit for phone and email */}
        {['phone', 'email'].map(key => (
          <div key={key} className="mb-3 d-flex align-items-center">
            <strong style={{ minWidth: 140 }}>{key === 'phone' ? 'Telefon' : 'E-posta'}:</strong>
            {editField === key && confirming ? (
              <>
                {key === 'phone' ? (
                  <div style={{ width: 250 }}>
                    <div className="input-group">
                      <span className="input-group-text">+90</span>
                      <input
                        type="tel"
                        className="form-control"
                        value={editValue}
                        onChange={e => {
                          let value = e.target.value.replace(/\D/g, '');
                          if (value.startsWith('0')) value = value.slice(1);
                          if (value.length > 10) value = value.slice(0, 10);
                          setEditValue(value);
                        }}
                        maxLength={10}
                        minLength={10}
                        pattern="[0-9]{10}"
                        placeholder="5XXXXXXXXX"
                        required
                      />
                    </div>
                    <div className="form-text">Başında 0 olmadan, 10 haneli giriniz. Örn: 5XXXXXXXXX</div>
                  </div>
                ) : (
                  <input
                    type="email"
                    className="form-control mx-2"
                    value={editValue}
                    onChange={e => setEditValue(e.target.value)}
                    style={{ maxWidth: 250 }}
                  />
                )}
                <button className="btn btn-success btn-sm mx-1" onClick={handleConfirm}>Evet</button>
                <button className="btn btn-secondary btn-sm" onClick={() => { setEditField(null); setConfirming(false); }}>Hayır</button>
              </>
            ) : (
              <>
                <span className="mx-2">{key === 'phone' ? `+90${user[key]}` : user[key]}</span>
                <button className="btn btn-link p-0 text-danger" onClick={() => handleEditClick(key)} title="Düzenle">
                  <i className="bi bi-pencil"></i>
                </button>
              </>
            )}
          </div>
        ))}
        {/* Only Vergi Dairesi and Vergi Kimlik No in the red box, now at the bottom */}
        <div className="mb-3 p-3 rounded border border-2 border-danger position-relative" style={{borderStyle:'dashed', minHeight: 80}}>
          {/* Vergi Dairesi */}
          <div className="mb-2 d-flex align-items-center">
            <strong style={{ minWidth: 140 }}>Vergi Dairesi:</strong>
            <span className="mx-2">{user.tax_office}</span>
          </div>
          {/* Vergi Kimlik No */}
          <div className="mb-2 d-flex align-items-center">
            <strong style={{ minWidth: 140 }}>Vergi Kimlik No:</strong>
            <span className="mx-2">{user.tax_number}</span>
          </div>
        </div>
        {error && <div className="alert alert-danger py-2">{error}</div>}
        {success && <div className="alert alert-success py-2">{success}</div>}
        {emailVerified === 0 && (
          <div className="alert alert-warning d-flex align-items-center" role="alert">
            <div>
              E-posta adresiniz henüz doğrulanmadı. Lütfen e-postanızı kontrol edin ve doğrulama linkine tıklayın.
              <br />
              <button
                className="btn btn-outline-danger btn-sm mt-2"
                onClick={handleResendVerification}
                disabled={resendLoading}
              >
                {resendLoading ? 'Gönderiliyor...' : 'Doğrulama E-postasını Tekrar Gönder'}
              </button>
              {resendMessage && <div className="mt-2 small">{resendMessage}</div>}
            </div>
          </div>
        )}
        {emailVerified === 1 && (
          <div className="alert alert-success" role="alert">
            E-posta adresiniz doğrulandı.
          </div>
        )}
      </div>
    </div>
  );
}

export default IsletmemPage;
