import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { useAuth } from '../context/AuthContext';
import authFetch from '../api/authFetch';
import PageLoadingSpinner from '../components/PageLoadingSpinner';

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
  const [resendLoading, setResendLoading] = useState(false);
  const [resendMessage, setResendMessage] = useState('');
  const [showExtendModal, setShowExtendModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('card');
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
  const [paymentIframeUrl, setPaymentIframeUrl] = useState('');
  const [copyFeedback, setCopyFeedback] = useState('');
  const [countdownSeconds, setCountdownSeconds] = useState(5);
  const navigate = useNavigate();
  const location = useLocation();
  const API_KEY = process.env.REACT_APP_USER_API_KEY;
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://customers.katipotomasyonu.com/api';
  const didFetchRef = useRef(false);

  useEffect(() => {
    // Wait for AuthContext to finish loading
    if (loading) return;
    
    // If no user after loading is complete, redirect to login
    if (!user || !user.accessToken) {
      navigate('/giris', { replace: true });
      return;
    }
    
    // Set email verification status based on existing user data
    if (user.email_verified !== undefined) {
      setEmailVerified(user.email_verified);
    }
    
    // Prevent multiple fetches
    if (didFetchRef.current) return;
    didFetchRef.current = true;
    
    // Optional profile fetch to get latest data - completely safe, never causes logout
    authFetch(`${API_BASE_URL}/osgb/profile`, { method: 'GET' }, { accessToken: user.accessToken })
      .then(res => {
        if (res.ok) {
          return res.json();
        } else {
          // For any error, just continue with existing data - NEVER logout
          return null;
        }
      })
      .then(data => {
        if (data && data.user) {
          const updatedUser = { ...user, ...data.user, accessToken: user.accessToken };
          updateUser(updatedUser);
          setEmailVerified(data.user.email_verified);
        }
        // If no data, continue with existing user (graceful degradation)
      })
      .catch((err) => {
        // For any network/fetch errors, just continue - NEVER logout
        // Silently fail to keep console clean in production
      });
  }, [navigate, user, loading, API_BASE_URL, API_KEY, updateUser]);

  // Map backend error to Turkish for pending order
  const getOrderErrorMessage = (msg) => {
    if (msg === 'You already have a pending order. Please complete payment or wait for invoice.') {
      return 'Zaten bekleyen bir siparişiniz var. Lütfen mevcut siparişinizin ödemesini tamamlayın veya fatura bekleyin.';
    }
    return msg;
  };

  // Helper: fetch pending orders (reusable)
  async function fetchPendingOrdersApi({ apiBaseUrl, apiKey, accessToken }) {
    const res = await fetch(`${apiBaseUrl}/osgb/orders/pending`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'Authorization': accessToken ? `Bearer ${accessToken}` : ''
      }
    });
    return res.json();
  }

  // Helper: fetch pending orders
  const fetchPendingOrders = useCallback(() => {
    setPendingLoading(true);
    setPendingError('');
    fetchPendingOrdersApi({
      apiBaseUrl: API_BASE_URL,
      apiKey: API_KEY,
      accessToken: user?.accessToken
    })
      .then(data => {
        if (data && Array.isArray(data.pendingOrders)) {
          setPendingOrders(data.pendingOrders);
        } else {
          setPendingOrders([]);
        }
      })
      .catch(() => setPendingError('Bekleyen siparişler alınamadı.'))
      .finally(() => setPendingLoading(false));
  }, [API_BASE_URL, API_KEY, user]);

  // Initial fetch on mount
  useEffect(() => {
    if (!user || !user.accessToken) return;
    fetchPendingOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.accessToken]); // Only depend on accessToken, not the full user object

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
        // After successful update, try to fetch latest profile (optional)
        try {
          const profileRes = await authFetch(`${API_BASE_URL}/osgb/profile`, { method: 'GET', headers: { 'x-api-key': API_KEY } }, { accessToken: user.accessToken });
          if (profileRes.ok) {
            const profileData = await profileRes.json();
            const updatedUser = { ...user, ...profileData.user, accessToken: user.accessToken };
            updateUser(updatedUser);
            setEmailVerified(profileData.user.email_verified);
            setSuccess('Bilgileriniz başarıyla güncellendi.');
            setConfirming(false);
          } else {
            // Don't logout for profile fetch failures after successful update
            setSuccess('Bilgileriniz başarıyla güncellendi. Yeni bilgileri görmek için sayfayı yenileyebilirsiniz.');
            setConfirming(false);
          }
        } catch (err) {
          // Don't logout for profile fetch errors after successful update
          setSuccess('Bilgileriniz başarıyla güncellendi. Yeni bilgileri görmek için sayfayı yenileyebilirsiniz.');
          setConfirming(false);
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

  // Helper function for copy operations with feedback
  const handleCopy = async (text, label) => {
    try {
      // Check if the clipboard API is available
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
      } else {
        // Fallback for older browsers or non-secure contexts
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        const successful = document.execCommand('copy');
        document.body.removeChild(textArea);
        if (!successful) {
          throw new Error('Copy command failed');
        }
      }
      setCopyFeedback({ 
        message: `${label} kopyalandı!`, 
        success: true 
      });
      setTimeout(() => setCopyFeedback(''), 2000);
    } catch (err) {
      console.error('Copy failed:', err);
      setCopyFeedback({ 
        message: 'Kopyalama başarısız!', 
        success: false 
      });
      setTimeout(() => setCopyFeedback(''), 2000);
    }
  };

  // License extension order handler
  const handleCreateOrder = async () => {
    setOrderLoading(true);
    setOrderError('');
    setOrderResult(null);
    setBankIbans([]);
    setCardOrderId(null);
    setCardStatus(null);
    setCardStatusError('');
    setPaymentIframeUrl('');
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
        // Card payment: embed iyzico in modal iframe and poll for status
        if (paymentMethod === 'card' && data.iyzico && data.iyzico.paymentPageUrl) {
          const orderId = data.order?.order_id || data.order_id || data.iyzico.orderId || null;
          setCardOrderId(orderId);
          setShowPaymentResult(true);
          setShowExtendModal(false); // Close the order modal for best UX
          setPaymentResultStatus('waiting');
          setPaymentResultMsg('Ödeme formu yükleniyor...');
          // Set payment URL for iframe
          setPaymentIframeUrl(data.iyzico.paymentPageUrl);
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
                    setPaymentIframeUrl('');
                    return;
                  } else if (data.status === 'failed') {
                    setPaymentResultStatus('error');
                    setPaymentResultMsg(data.failureReason || 'Ödeme işlemi başarısız oldu. Lütfen kart bilgilerinizi ve bakiyenizi kontrol edin veya bankanız ile iletişime geçin.');
                    setPaymentIframeUrl('');
                    return;
                  } // else pending: continue polling
                } else if (res.ok && data.order && data.order.is_paid) {
                  setPaymentResultStatus('success');
                  setPaymentResultMsg('Ödemeniz başarıyla tamamlandı!');
                  setPaymentIframeUrl('');
                  return;
                } else if (res.status === 404) {
                  setPaymentResultStatus('error');
                  setPaymentResultMsg('Sipariş bulunamadı. Lütfen destek ile iletişime geçin.');
                  setPaymentIframeUrl('');
                  return;
                }
              } catch (err) {
                setPaymentResultStatus('error');
                setPaymentResultMsg('Sunucuya ulaşılamadı. Lütfen tekrar deneyin.');
                setPaymentIframeUrl('');
                return;
              }
              attempts++;
              await new Promise(r => setTimeout(r, 3000));
            }
            if (!stopped) {
              setPaymentResultStatus('timeout');
              setPaymentResultMsg('Ödeme tamamlanmadı veya zaman aşımına uğradı. Lütfen tekrar deneyin veya destek ile iletişime geçin.');
              setPaymentIframeUrl('');
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
              else if (ibanData.bankIbans && Array.isArray(ibanData.bankIbans)) setBankIbans(ibanData.bankIbans);
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
                setPaymentIframeUrl('');
                return;
              } else if (data.status === 'failed') {
                setPaymentResultStatus('error');
                setPaymentResultMsg(data.failureReason || 'Ödeme işlemi başarısız oldu. Lütfen kart bilgilerinizi ve bakiyenizi kontrol edin veya bankanız ile iletişime geçin.');
                setPaymentIframeUrl('');
                return;
              } // else pending: continue polling
            } else if (res.ok && data.order && data.order.is_paid) {
              setPaymentResultStatus('success');
              setPaymentResultMsg('Ödemeniz başarıyla tamamlandı!');
              setPaymentIframeUrl('');
              return;
            } else if (res.status === 404) {
              setPaymentResultStatus('error');
              setPaymentResultMsg('Sipariş bulunamadı. Lütfen destek ile iletişime geçin.');
              setPaymentIframeUrl('');
              return;
            }
          } catch (err) {
            setPaymentResultStatus('error');
            setPaymentResultMsg('Sunucuya ulaşılamadı. Lütfen tekrar deneyin.');
            setPaymentIframeUrl('');
            return;
          }
          attempts++;
          await new Promise(r => setTimeout(r, 3000));
        }
        if (!stopped) {
          setPaymentResultStatus('timeout');
          setPaymentResultMsg('Ödeme tamamlanmadı veya zaman aşımına uğradı. Lütfen tekrar deneyin veya destek ile iletişime geçin.');
          setPaymentIframeUrl('');
        }
      }
      poll();
      return () => { stopped = true; };
    }
  }, [location.search, API_BASE_URL, API_KEY, user]);

  // Auto-redirect to payment page after 5 seconds
  useEffect(() => {
    if (paymentResultStatus === 'waiting' && paymentIframeUrl) {
      setCountdownSeconds(5); // Reset countdown
      const timer = setTimeout(() => {
        window.location.href = paymentIframeUrl;
      }, 5000);
      
      // Update countdown every second
      const countdownInterval = setInterval(() => {
        setCountdownSeconds(prev => {
          if (prev <= 1) {
            clearInterval(countdownInterval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
      return () => {
        clearTimeout(timer);
        clearInterval(countdownInterval);
      };
    }
  }, [paymentResultStatus, paymentIframeUrl]);

  // Fetch bank IBANs when showing pending bank details modal, if not already loaded
  useEffect(() => {
    if (showPendingBankDetails && bankIbans.length === 0 && user && user.accessToken) {
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
          else if (ibanData.bankIbans && Array.isArray(ibanData.bankIbans)) setBankIbans(ibanData.bankIbans);
          else if (ibanData.ibans && Array.isArray(ibanData.ibans)) setBankIbans(ibanData.ibans);
          else if (ibanData.banks && Array.isArray(ibanData.banks)) setBankIbans(ibanData.banks);
        });
    }
  }, [showPendingBankDetails, bankIbans.length, user, API_KEY, API_BASE_URL]);

  // Re-fetch after EFT/Havale order created
  useEffect(() => {
    if (orderStep === 3 && orderResult && paymentMethod === 'cash') {
      fetchPendingOrders();
    }
    // eslint-disable-next-line
  }, [orderStep, orderResult, paymentMethod]);

  // Re-fetch after card payment success
  useEffect(() => {
    if (paymentResultStatus === 'success') {
      fetchPendingOrders();
    }
    // eslint-disable-next-line
  }, [paymentResultStatus]);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!user) return null;

  return (
    <>
      <PageLoadingSpinner show={loading} fullscreen />
      {/* Copy Feedback Toast */}
      {copyFeedback && (
        <div 
          className="position-fixed top-50 start-50 translate-middle" 
          style={{zIndex: 10000}}
        >
          <div className={`toast show border-0 shadow-lg ${copyFeedback.success ? 'bg-success text-white' : 'bg-danger text-white'}`} role="alert" style={{minWidth: '300px'}}>
            <div className="toast-body d-flex align-items-center justify-content-center py-3">
              <i className={`me-2 ${copyFeedback.success ? 'bi bi-check-circle-fill' : 'bi bi-x-circle-fill'}`} style={{fontSize: '1.2em'}}></i>
              <span className="fw-semibold">{copyFeedback.message}</span>
            </div>
          </div>
        </div>
      )}
      <div className="container py-5" style={{ maxWidth: 600 }}>
        {/* Payment Result Modal */}
        {showPaymentResult && (
          <div className="modal show d-block" tabIndex="-1" style={{ background: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-dialog-centered modal-lg">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Ödeme</h5>
                  <button type="button" className="btn-close" onClick={() => {
                    setShowPaymentResult(false);
                    setPaymentIframeUrl('');
                  }}></button>
                </div>
                <div className="modal-body text-center">
                  {paymentResultStatus === 'waiting' && paymentIframeUrl && (
                    <>
                      <div className="mb-3">
                        <div className="alert alert-info text-center">
                          <div className="d-flex align-items-center justify-content-center mb-3">
                            <i className="bi bi-shield-check me-2 text-primary" style={{fontSize: '1.2rem'}}></i>
                            <strong>Güvenli Ödeme Sayfasına Yönlendiriliyorsunuz</strong>
                          </div>
                          
                          <div className="d-flex align-items-center justify-content-center mb-3">
                            <img 
                              src="/iyzico-logo.svg" 
                              alt="iyzico" 
                              style={{height: '32px', opacity: 0.8}}
                              className="me-2"
                            />
                            <span className="small" style={{color: '#0c5460', fontWeight: '500'}}>
                              güvenli ödeme sistemi
                            </span>
                          </div>
                          
                          <div className="small mb-4" style={{color: '#0c5460'}}>
                            Ödemeniz iyzico'nun güvenli sunucularında işlenir. Kart bilgileriniz tamamen korunur.
                          </div>
                          <div className="d-flex align-items-center justify-content-center mb-2">
                            <div className="spinner-border text-primary me-3" role="status" style={{width: '1.5rem', height: '1.5rem'}}>
                              <span className="visually-hidden">Yükleniyor...</span>
                            </div>
                            <span className="fw-semibold">{countdownSeconds} saniye içinde yönlendirileceksiniz...</span>
                          </div>
                        </div>
                        
                        <div className="alert alert-warning text-center">
                          <div className="d-flex align-items-center justify-content-center">
                            <i className="bi bi-info-circle me-2 text-warning" style={{fontSize: '1.1rem'}}></i>
                          </div>
                          <div className="small mt-2" style={{color: '#664d03'}}>
                            Ödeme tamamlandıktan sonra bu sayfaya otomatik olarak geri döneceksiniz.
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                  {paymentResultStatus === 'waiting' && !paymentIframeUrl && (
                    <>
                      <div className="mb-3">
                        <div className="spinner-border text-danger" role="status">
                          <span className="visually-hidden">Yükleniyor...</span>
                        </div>
                      </div>
                      <div>{paymentResultMsg}</div>
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
            <div className="fw-bold mb-3">Bekleyen Lisans Uzatma Siparişiniz Var</div>
            {pendingOrders.map((order, i) => (
              <div key={order.order_id || i} className="mb-3 p-3 bg-light rounded border">
                <div className="row">
                  <div className="col-md-6">
                    <div className="d-flex justify-content-between">
                      <span className="fw-semibold">Sipariş No:</span>
                      <span>{order.order_id || '-'}</span>
                    </div>
                    <div className="d-flex justify-content-between">
                      <span className="fw-semibold">Ödeme Yöntemi:</span>
                      <span>{order.payment_method === 'cash' ? 'EFT/Havale' : 'Kredi Kartı'}</span>
                    </div>
                    <div className="d-flex justify-content-between">
                      <span className="fw-semibold">Tarih:</span>
                      <span>{order.created_at ? new Date(order.created_at).toLocaleDateString('tr-TR') : '-'}</span>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="d-flex justify-content-between">
                      <span className="fw-semibold">Ödeme Bekleyen Tutar:</span>
                      <span className="text-danger fw-bold">{order.remaining_balance ? `${order.remaining_balance} TL` : (order.amount_due ? `${order.amount_due} TL` : order.amount ? `${order.amount} TL` : '12.000 TL')}</span>
                    </div>
                  </div>
                </div>
                <div className="mt-2 text-center">
                  <span className="badge bg-warning text-dark">Ödeme Bekliyor</span>
                </div>
              </div>
            ))}
            <div className="d-flex gap-2 mb-2">
              <button className="btn btn-primary btn-sm" onClick={() => setShowPendingBankDetails(true)}>
                Banka Bilgilerini Göster
              </button>
              {pendingOrders.some(order => !order.is_paid && order.status !== 'cancelled' && order.status !== 'failed' && (!order.paid_amount || order.paid_amount === 0)) && (
                <button
                  className="btn btn-success btn-sm"
                  style={{whiteSpace:'nowrap'}}
                  onClick={async () => {
                    const order = pendingOrders.find(o => !o.is_paid && o.status !== 'cancelled' && o.status !== 'failed' && (!o.paid_amount || o.paid_amount === 0));
                    if (!order) return;
                    try {
                      const res = await fetch(`${API_BASE_URL}/osgb/orders/${order.order_id}/pay-with-card`, {
                        method: 'POST',
                        headers: {
                          'Content-Type': 'application/json',
                          'x-api-key': API_KEY,
                          'Authorization': user?.accessToken ? `Bearer ${user.accessToken}` : ''
                        },
                        body: JSON.stringify({})
                      });
                      const data = await res.json();
                      if (res.ok && data.success && data.iyzico && data.iyzico.paymentPageUrl) {
                        // Show payment modal with iframe and start polling for status
                        setCardOrderId(order.order_id);
                        setShowPaymentResult(true);
                        setPaymentResultStatus('waiting');
                        setPaymentResultMsg('Ödeme formu yükleniyor...');
                        setPaymentIframeUrl(data.iyzico.paymentPageUrl);
                        let attempts = 0;
                        const maxAttempts = 40; // ~2 minutes
                        let stopped = false;
                        async function poll() {
                          while (attempts < maxAttempts && !stopped) {
                            try {
                              const pollRes = await fetch(`${API_BASE_URL}/osgb/orders/${order.order_id}`, {
                                method: 'GET',
                                headers: {
                                  'Content-Type': 'application/json',
                                  'x-api-key': API_KEY,
                                  'Authorization': user?.accessToken ? `Bearer ${user.accessToken}` : ''
                                }
                              });
                              const pollData = await pollRes.json();
                              if (pollRes.ok && pollData.order) {
                                if (pollData.order.is_paid) {
                                  setPaymentResultStatus('success');
                                  setPaymentResultMsg('Ödeme başarıyla tamamlandı. Lisansınız uzatıldı.');
                                  setPaymentIframeUrl('');
                                  stopped = true;
                                  fetchPendingOrders(); // Refresh orders
                                }
                              }
                            } catch (err) {
                              // ignore poll errors
                            }
                            attempts++;
                            await new Promise(r => setTimeout(r, 3000));
                          }
                          if (!stopped) {
                            setPaymentResultStatus('timeout');
                            setPaymentResultMsg('Ödeme tamamlanmadı veya zaman aşımına uğradı. Lütfen tekrar deneyin veya destek ile iletişime geçin.');
                            setPaymentIframeUrl('');
                          }
                        }
                        poll();
                      } else {
                        alert(data.message || 'Kart ile ödeme başlatılamadı. Sipariş zaten ödenmiş veya iptal edilmiş olabilir.');
                      }
                    } catch (err) {
                      alert('Sunucuya ulaşılamadı. Lütfen tekrar deneyin.');
                    }
                  }}
                >
                  Kart İle Öde
                </button>
              )}
            </div>
            {/* Modal for pending bank details */}
            {showPendingBankDetails && (
              <div className="modal show d-block" tabIndex="-1" style={{ background: 'rgba(0,0,0,0.3)' }}>
                <div className="modal-dialog modal-dialog-centered">
                  <div className="modal-content">
                    <div className="modal-header">
                      <h5 className="modal-title">Banka Bilgileri</h5>
                      <button type="button" className="btn-close" onClick={() => setShowPendingBankDetails(false)}></button>
                    </div>
                    <div className="modal-body">
                      <div className="mb-3 text-center" style={{fontWeight:'bold'}}>
                        Lütfen EFT/havale ödemelerinde alıcı adı ve açıklamasını aşağıdaki şekilde yazınız:
                      </div>
                      <div className="mb-2 text-center fw-bold d-flex align-items-center justify-content-center gap-2" style={{fontSize:'0.9em'}}>
                        <span className="text-danger">Alıcı Adı:</span> <span className="text-primary">Arkaya Arge Yazılım İnşaat Ticaret Ltd.Şti.</span>
                        <button
                          className="btn btn-link p-0 text-danger ms-1"
                          title="Kopyala"
                          style={{fontSize:'1.1em'}}
                          onClick={() => handleCopy('Arkaya Arge Yazılım İnşaat Ticaret Ltd.Şti.', 'Alıcı adı')}
                        >
                          <i className="bi bi-copy"></i>
                        </button>
                      </div>
                      <div className="mb-3 text-center fw-bold d-flex align-items-center justify-content-center gap-2" style={{fontSize:'0.9em'}}>
                        <span className="text-danger">EFT/havale açıklaması:</span> 
                        <span className="text-primary" style={{fontFamily:'monospace'}}>Katip Otomasyonu {user.customer_id}</span>
                        <button
                          className="btn btn-link p-0 text-danger ms-1"
                          title="Kopyala"
                          style={{fontSize:'1.1em'}}
                          onClick={() => handleCopy(`Katip Otomasyonu ${user.customer_id}`, 'EFT/havale açıklaması')}
                        >
                          <i className="bi bi-copy"></i>
                        </button>
                      </div>
                      <div className="mb-2" style={{fontSize:'0.9em'}}>Aşağıdaki banka hesaplarına EFT/Havale ile ödeme yapabilirsiniz:</div>
                      <div>
                        {bankIbans.length > 0 ? (
                          bankIbans.map((iban, i, arr) => (
                            <React.Fragment key={i}>
                              <div className="d-flex align-items-center justify-content-between flex-wrap" style={{gap:8}}>
                                <div>
                                  <span className="fw-bold">{iban.bank}:</span> <span style={{fontFamily:'monospace'}}>{iban.iban}</span>
                                </div>
                                <button
                                  className="btn btn-link p-0 text-danger ms-2"
                                  title="Kopyala"
                                  style={{fontSize:'1.1em'}}
                                  onClick={() => handleCopy(iban.iban, `${iban.bank} IBAN`)}
                                >
                                  <i className="bi bi-copy"></i>
                                </button>
                              </div>
                              {i < arr.length - 1 && (
                                <hr className="my-2" style={{width:'60%',margin:'8px auto',borderTop:'1px solid #bbb'}} />
                              )}
                            </React.Fragment>
                          ))
                        ) : (
                          <div className="text-muted">Banka bilgileri yükleniyor veya bulunamadı.</div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div className="small d-flex align-items-center">
              <i className="bi bi-info-circle me-2 text-primary"></i>
              Yeni bir sipariş oluşturmak için önce mevcut siparişi tamamlayın.
            </div>
          </div>
        )}
        <div className="d-flex align-items-center justify-content-between mb-4">
          <h2 className="mb-0">İşletmem</h2>
          <button 
            className="btn" 
            style={{
              background: 'linear-gradient(135deg, #dc3545 0%, #c82333 50%, #dc3545 100%)',
              backgroundSize: '200% 200%',
              border: 'none',
              color: 'white',
              fontWeight: '600',
              fontSize: '0.95rem',
              padding: '12px 28px',
              borderRadius: '12px',
              boxShadow: '0 8px 25px rgba(220, 53, 69, 0.3), 0 4px 12px rgba(0, 0, 0, 0.1)',
              transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
              position: 'relative',
              overflow: 'hidden',
              textTransform: 'none',
              letterSpacing: '0.3px',
              animation: 'shimmer 2.5s ease-in-out infinite, pulse 2s ease-in-out infinite'
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-3px) scale(1.02)';
              e.target.style.boxShadow = '0 15px 35px rgba(220, 53, 69, 0.4), 0 8px 20px rgba(0, 0, 0, 0.15)';
              e.target.style.backgroundPosition = '100% 0%';
              e.target.style.filter = 'brightness(1.1)';
              e.target.style.animation = 'shimmer 1s ease-in-out infinite';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0) scale(1)';
              e.target.style.boxShadow = '0 8px 25px rgba(220, 53, 69, 0.3), 0 4px 12px rgba(0, 0, 0, 0.1)';
              e.target.style.backgroundPosition = '0% 50%';
              e.target.style.filter = 'brightness(1)';
              e.target.style.animation = 'shimmer 2.5s ease-in-out infinite, pulse 2s ease-in-out infinite';
            }}
            onMouseDown={(e) => {
              e.target.style.transform = 'translateY(-1px) scale(0.98)';
            }}
            onMouseUp={(e) => {
              e.target.style.transform = 'translateY(-3px) scale(1.02)';
            }}
            onClick={() => { setShowExtendModal(true); setOrderStep(1); setOrderError(''); setOrderResult(null); setPaymentMethod('card'); }} 
            disabled={pendingOrders.length > 0}
          >
            <span style={{
              position: 'relative',
              zIndex: 2
            }}>
              Satın Al - Lisans Süremi Uzat
            </span>
            <span style={{
              position: 'absolute',
              top: 0,
              left: '-100%',
              width: '100%',
              height: '100%',
              background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
              animation: 'beam 3s ease-in-out infinite',
              zIndex: 1
            }}></span>
          </button>
        </div>
        <style>{`
          @keyframes shimmer {
            0%, 100% { 
              background-position: 0% 50%;
              box-shadow: 0 8px 25px rgba(220, 53, 69, 0.3), 0 4px 12px rgba(0, 0, 0, 0.1);
            }
            50% { 
              background-position: 100% 50%;
              box-shadow: 0 10px 30px rgba(220, 53, 69, 0.4), 0 6px 16px rgba(0, 0, 0, 0.12);
            }
          }
          @keyframes beam {
            0% { 
              left: -100%;
              opacity: 0;
            }
            50% { 
              opacity: 1;
            }
            100% { 
              left: 100%;
              opacity: 0;
            }
          }
          @keyframes pulse {
            0%, 100% { 
              transform: scale(1);
            }
            50% { 
              transform: scale(1.1);
            }
          }
          
          /* Payment iframe specific styles */
          #payment-iframe-container {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
          }
          
          /* Clean iframe styling without global scaling */
          #payment-iframe-container iframe {
            border-radius: 8px !important;
          }
          
          /* Try to prevent Bootstrap/parent CSS from affecting iframe */
          .modal-body #payment-iframe-container * {
            font-family: inherit !important;
          }
        `}</style>
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
                            <input className="form-check-input" type="radio" id="pay-card" name="paymentMethod" value="card" checked={paymentMethod==='card'} onChange={()=>setPaymentMethod('card')} />
                            <label className="form-check-label" htmlFor="pay-card">Kredi Kartı</label>
                          </div>
                          <div className="form-check">
                            <input className="form-check-input" type="radio" id="pay-cash" name="paymentMethod" value="cash" checked={paymentMethod==='cash'} onChange={()=>setPaymentMethod('cash')} />
                            <label className="form-check-label" htmlFor="pay-cash">EFT/Havale</label>
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
                        {paymentMethod === 'card' ? (
                          <div className="alert alert-warning small">Siparişi onayladığınızda ödeme adımına yönlendirileceksiniz.</div>
                        ) : (
                          <div className="alert alert-info small">Siparişi onayladığınızda banka bilgileri gösterilecektir.</div>
                        )}
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
                            <div className="mb-3 text-center" style={{fontWeight:'bold'}}>
                              Lütfen EFT/havale ödemelerinde alıcı adı ve açıklamasını aşağıdaki şekilde yazınız:
                            </div>
                            <div className="mb-2 text-center fw-bold d-flex align-items-center justify-content-center gap-2" style={{fontSize:'0.9em'}}>
                              <span className="text-danger">Alıcı Adı:</span> <span className="text-primary">Arkaya Arge Yazılım İnşaat Ticaret Ltd.Şti.</span>
                              <button
                                className="btn btn-link p-0 text-danger ms-1"
                                title="Kopyala"
                                style={{fontSize:'1.1em'}}
                                onClick={() => handleCopy('Arkaya Arge Yazılım İnşaat Ticaret Ltd.Şti.', 'Alıcı adı')}
                              >
                                <i className="bi bi-copy"></i>
                              </button>
                            </div>
                            <div className="mb-3 text-center fw-bold d-flex align-items-center justify-content-center gap-2" style={{fontSize:'0.9em'}}>
                              <span className="text-danger">EFT/havale açıklaması:</span> 
                              <span className="text-primary" style={{fontFamily:'monospace'}}>Katip Otomasyonu {user.customer_id}</span>
                              <button
                                className="btn btn-link p-0 text-danger ms-1"
                                title="Kopyala"
                                style={{fontSize:'1.1em'}}
                                onClick={() => handleCopy(`Katip Otomasyonu ${user.customer_id}`, 'EFT/havale açıklaması')}
                              >
                                <i className="bi bi-copy"></i>
                              </button>
                            </div>
                            <div className="mb-2" style={{fontSize:'0.9em'}}>Aşağıdaki banka hesaplarına EFT/Havale ile ödeme yapabilirsiniz:</div>
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
                                      onClick={() => handleCopy(iban.iban, `${iban.bank} IBAN`)}
                                    >
                                      <i className="bi bi-copy"></i>
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
            <div className="mb-2 d-flex align-items-start flex-column flex-md-row">
              <strong className="mb-1 mb-md-0" style={{ minWidth: 140 }}>Müşteri Numarası:</strong>
              <span className="mx-md-2 d-flex align-items-center" style={{ fontFamily: 'monospace', letterSpacing: '1px', wordBreak: 'break-all', overflowWrap: 'break-word' }}>
                <span style={{ marginRight: '8px' }}>{user.customer_id}</span>
                <button
                  className="btn btn-link p-0 text-danger"
                  title="Kopyala"
                  onClick={() => handleCopy(user.customer_id, 'Müşteri numarası')}
                >
                  <i className="bi bi-copy"></i>
                </button>
              </span>
            </div>
          )}
          {/* License Key Display */}
          {user.licenseKey && (
            <div className="mb-2 d-flex align-items-start flex-column flex-md-row">
              <strong className="mb-1 mb-md-0" style={{ minWidth: 140 }}>Lisans Anahtarı:</strong>
              <span className="mx-md-2 d-flex align-items-center" style={{ letterSpacing: '1px', fontFamily: 'monospace', wordBreak: 'break-all', overflowWrap: 'break-word' }}>
                <span style={{ marginRight: '8px' }}>{user.licenseKey}</span>
                <button
                  className="btn btn-link p-0 text-danger"
                  title="Kopyala"
                  onClick={() => handleCopy(user.licenseKey, 'Lisans anahtarı')}
                >
                  <i className="bi bi-copy"></i>
                </button>
              </span>
            </div>
          )}
          {/* License Expiration Date Display */}
          {user.licenseExpirationDate && (
            <div className="mb-2 d-flex align-items-start flex-column flex-md-row">
              <strong className="mb-1 mb-md-0" style={{ minWidth: 140 }}>Lisans Bitiş Tarihi:</strong>
              <span className="mx-md-2" style={{ fontFamily: 'monospace', wordBreak: 'break-word', overflowWrap: 'break-word' }}>
                {new Date(user.licenseExpirationDate).toLocaleString('tr-TR', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          )}
          {/* Şirket Ünvanı */}
          <div className="mb-2 d-flex align-items-start flex-column flex-md-row">
            <strong className="mb-1 mb-md-0" style={{ minWidth: 140 }}>Şirket Ünvanı:</strong>
            <span className="mx-md-2" style={{ wordBreak: 'break-word', overflowWrap: 'break-word' }}>{user.company_name}</span>
          </div>
          {/* Şehir */}
          <div className="mb-2 d-flex align-items-start flex-column flex-md-row">
            <strong className="mb-1 mb-md-0" style={{ minWidth: 140 }}>Şehir:</strong>
            <span className="mx-md-2" style={{ wordBreak: 'break-word', overflowWrap: 'break-word' }}>{user.city}</span>
          </div>
          {/* İlçe */}
          <div className="mb-2 d-flex align-items-start flex-column flex-md-row">
            <strong className="mb-1 mb-md-0" style={{ minWidth: 140 }}>İlçe:</strong>
            <span className="mx-md-2" style={{ wordBreak: 'break-word', overflowWrap: 'break-word' }}>{user.district}</span>
          </div>
          {/* Adres */}
          <div className="mb-2 d-flex align-items-start flex-column flex-md-row">
            <strong className="mb-1 mb-md-0" style={{ minWidth: 140 }}>Adres:</strong>
            <span className="mx-md-2" style={{ wordBreak: 'break-word', overflowWrap: 'break-word' }}>{user.address}</span>
          </div>
          {/* Only show edit for phone and email */}
          {['phone', 'email'].map(key => (
            <div key={key} className="mb-3 d-flex align-items-start flex-column flex-md-row">
              <strong className="mb-1 mb-md-0" style={{ minWidth: 140 }}>{key === 'phone' ? 'Telefon' : 'E-posta'}:</strong>
              {editField === key && confirming ? (
                <>
                  {key === 'phone' ? (
                    <div style={{ width: '100%', maxWidth: 250 }}>
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
                      className="form-control mx-md-2"
                      value={editValue}
                      onChange={e => setEditValue(e.target.value)}
                      style={{ maxWidth: 250, width: '100%' }}
                    />
                  )}
                  <div className="d-flex gap-1 mt-2 mt-md-0">
                    <button className="btn btn-success btn-sm mx-1" onClick={handleConfirm}>Evet</button>
                    <button className="btn btn-secondary btn-sm" onClick={() => { setEditField(null); setConfirming(false); }}>Hayır</button>
                  </div>
                </>
              ) : (
                <>
                  <span className="mx-md-2 d-flex align-items-center" style={{ wordBreak: 'break-all', overflowWrap: 'break-word', width: '100%' }}>
                    <span style={{ marginRight: '8px' }}>{key === 'phone' ? `+90${user[key]}` : user[key]}</span>
                    <button className="btn btn-link p-0 text-danger" onClick={() => handleEditClick(key)} title="Düzenle">
                      <i className="bi bi-pencil"></i>
                    </button>
                  </span>
                </>
              )}
            </div>
          ))}
          {/* Only Vergi Dairesi and Vergi Kimlik No in the red box, now at the bottom */}
          {user.tax_office && user.tax_number ? (
            <div className="mb-3 p-3 rounded border border-2 border-danger position-relative" style={{borderStyle:'dashed', minHeight: 80}}>
              <div className="fw-bold mb-3 text-danger" style={{fontSize: '1.05rem'}}>
                Fatura Bilgileriniz
              </div>
              {/* Vergi Dairesi */}
              <div className="mb-2 d-flex align-items-start flex-column flex-md-row">
                <strong className="mb-1 mb-md-0" style={{ minWidth: 140 }}>Vergi Dairesi:</strong>
                <span className="mx-md-2" style={{ wordBreak: 'break-word', overflowWrap: 'break-word' }}>{user.tax_office}</span>
              </div>
              {/* Vergi Kimlik No */}
              <div className="mb-2 d-flex align-items-start flex-column flex-md-row">
                <strong className="mb-1 mb-md-0" style={{ minWidth: 140 }}>Vergi Kimlik No:</strong>
                <span className="mx-md-2" style={{ fontFamily: 'monospace', wordBreak: 'break-all', overflowWrap: 'break-word' }}>{user.tax_number}</span>
              </div>
            </div>
          ) : (
            <div className="mb-3 p-3 rounded" style={{backgroundColor: '#fffbf0', border: '1px solid #f7e98e', color: '#6c5d03'}}>
              <div className="d-flex align-items-center">
                <i className="bi bi-clock me-2" style={{color: '#e6ac00'}}></i>
                <div>
                  <strong>Belgeleriniz İnceleniyor</strong>
                  <div className="mt-1" style={{fontSize: '0.9em'}}>
                    Kayıt aşamasında gönderdiğiniz belgeleriniz kontrol ediliyor. Kontrol tamamlandıktan sonra fatura bilgileriniz burada görüntülenecektir.
                  </div>
                </div>
              </div>
            </div>
          )}
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
    </>
  );
}

export default IsletmemPage;
