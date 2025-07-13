import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
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
  const navigate = useNavigate();
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

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!user) return null;

  return (
    <div className="container py-5" style={{ maxWidth: 600 }}>
      <h2 className="mb-4">İşletmem</h2>
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
