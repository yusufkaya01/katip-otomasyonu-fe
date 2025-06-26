import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { fetchTaxOffices } from '../api/taxOffices';
import { useAuth } from '../context/AuthContext';

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
  const { user, updateUser, logout, loading } = useAuth(); // get loading from context
  const [emailVerified, setEmailVerified] = useState(null);
  const [editField, setEditField] = useState(null); // which field is being edited
  const [editValue, setEditValue] = useState('');
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showLicense, setShowLicense] = useState(false);
  const [taxData, setTaxData] = useState([]);
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [districts, setDistricts] = useState([]);
  const [taxOffices, setTaxOffices] = useState([]);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendMessage, setResendMessage] = useState('');
  const [mssEnabled, setMssEnabled] = useState(false);
  const [mssLoading, setMssLoading] = useState(false);
  const [mssModalOpen, setMssModalOpen] = useState(false);
  const [mssAgreementHtml, setMssAgreementHtml] = useState('');
  const [mssError, setMssError] = useState('');
  const [mssSuccess, setMssSuccess] = useState('');
  const [mssConfirm, setMssConfirm] = useState(false);
  const [mssModalMode, setMssModalMode] = useState('confirm'); // 'confirm' or 'view'
  const [showMssDisableModal, setShowMssDisableModal] = useState(false);
  const [mssDisableInput, setMssDisableInput] = useState('');
  const navigate = useNavigate();
  const API_KEY = process.env.REACT_APP_USER_API_KEY;
  const didFetchRef = useRef(false); // <-- add this ref
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    if (loading) return; // Wait for auth restoration
    if (!user || !user.token) {
      navigate('/giris', { replace: true });
      return;
    }
    if (didFetchRef.current) return; // Prevent multiple fetches
    didFetchRef.current = true;
    // Fetch latest user info from backend (only once after login/session restore)
    fetch('https://customers.katipotomasyonu.com/api/osgb/profile', {
      method: 'GET',
      headers: {
        'x-api-key': API_KEY,
        'Authorization': `Bearer ${user.token}`
      }
    })
      .then(res => {
        if (!res.ok) throw new Error('Kullanıcı oturumu geçersiz veya süresi dolmuş.');
        return res.json();
      })
      .then(data => {
        const updatedUser = { ...user, ...data.user, token: user.token };
        updateUser(updatedUser);
        setEmailVerified(data.user.email_verified);
      })
      .catch(() => {
        logout();
        navigate('/giris', { replace: true });
      });
  }, [navigate, API_KEY, user, updateUser, logout, loading]);

  // Remove this useEffect:
  // useEffect(() => {
  //   fetchTaxOffices(API_KEY)
  //     .then(data => setTaxData(data.cities || []))
  //     .catch(() => setTaxData([]));
  // }, [API_KEY]);

  // Fetch tax offices only when editing city/district/tax_office
  const handleEditClick = (key) => {
    if (["city", "district", "tax_office", "tax_number"].includes(key)) {
      if (taxData.length === 0) {
        fetchTaxOffices(API_KEY)
          .then(data => setTaxData(data.cities || []))
          .catch(() => setTaxData([]));
      }
    }
    setEditField(key);
    setEditValue(user[key] || '');
    setError('');
    setSuccess('');
  };

  const handleConfirm = async () => {
    setError('');
    setSuccess('');
    if (!editValue || (editField === 'password' && editValue.length < 8)) {
      setError('Geçerli bir değer giriniz.');
      return;
    }
    // Password confirmation check (FE only)
    if (editField === 'password' && editValue !== confirmPassword) {
      setError('Şifreler eşleşmiyor.');
      return;
    }
    if (!user.token) {
      setError('Kimlik doğrulama hatası: Lütfen tekrar giriş yapın.');
      return;
    }
    // Prepare PATCH payload (only the edited field)
    let payload;
    if (editField === 'tax_group') {
      payload = {
        city: selectedCity,
        district: selectedDistrict,
        tax_office: editValue,
        tax_number: user.tax_number // You may want to use a separate state for tax_number if you want to allow editing it
      };
    } else if (editField === 'city') {
      payload = { city: selectedCity };
    } else if (editField === 'district') {
      payload = { district: selectedDistrict };
    } else if (editField === 'tax_office') {
      payload = { tax_office: editValue };
    } else {
      payload = { [editField]: editValue };
    }
    // Required fields for PATCH: must send all required fields except password (unless changing password)
    const required = ['company_name', 'tax_number', 'address', 'tax_office', 'osgb_id', 'phone', 'email', 'city', 'district'];
    required.forEach(f => {
      if (!(editField === 'tax_group' && ['city','district','tax_office','tax_number'].includes(f)) && f !== editField) payload[f] = user[f];
    });
    if (editField !== 'password') delete payload.password;
    try {
      const res = await fetch('https://customers.katipotomasyonu.com/api/osgb/update-osgb-info', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': API_KEY,
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify(payload)
      });
      if (res.status === 200) {
        // After successful update, fetch latest profile from backend
        const profileRes = await fetch('https://customers.katipotomasyonu.com/api/osgb/profile', {
          method: 'GET',
          headers: {
            'x-api-key': API_KEY,
            'Authorization': `Bearer ${user.token}`
          }
        });
        if (profileRes.ok) {
          const profileData = await profileRes.json();
          const updatedUser = { ...user, ...profileData.user, token: user.token };
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
        // Handle new validation errors for osgb_id, company_name, city, district
        if (
          [
            'INVALID_OSGB_ID',
            'INVALID_COMPANY_NAME',
            'INVALID_CITY',
            'INVALID_DISTRICT'
          ].includes(data.error) && data.message
        ) {
          let msg = data.message;
          if (data.error === 'INVALID_CITY') {
            msg = 'Seçilen şehir resmi kayıtlardaki ile eşleşmiyor.';
          } else if (data.error === 'INVALID_DISTRICT') {
            msg = 'Seçilen ilçe resmi kayıtlardaki ile eşleşmiyor.';
          } else if (data.error === 'INVALID_COMPANY_NAME') {
            msg = 'Şirket ünvanı resmi kayıtlardaki ile eşleşmiyor.';
          } else if (data.error === 'INVALID_OSGB_ID') {
            msg = 'OSGB Yetki Belgesi No resmi kayıtlarda bulunamadı.';
          }
          setError(msg);
        } else {
          setError(data.error || 'Güncelleme sırasında bir hata oluştu.');
        }
      }
    } catch (err) {
      setError('Sunucuya bağlanılamadı.');
    }
  };

  const handleResendVerification = async () => {
    setResendLoading(true);
    setResendMessage('');
    try {
      const res = await fetch('https://customers.katipotomasyonu.com/api/osgb/resend-verification', {
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

  useEffect(() => {
    if (user && typeof user.distance_sales_agreement_enabled !== 'undefined') {
      setMssEnabled(!!user.distance_sales_agreement_enabled);
    }
  }, [user]);

  // Add a state to distinguish modal mode
  const fetchMssAgreement = async (mode = 'confirm') => {
    setMssLoading(true);
    setMssAgreementHtml('');
    setMssError('');
    try {
      const res = await fetch('https://customers.katipotomasyonu.com/api/osgb/distance-sales-agreement', {
        method: 'GET',
        headers: {
          'x-api-key': API_KEY,
          'Authorization': `Bearer ${user.token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setMssAgreementHtml(data.agreementHtml || '');
        setMssModalMode(mode);
        setMssModalOpen(true);
      } else {
        setMssError('Sözleşme içeriği alınamadı.');
      }
    } catch {
      setMssError('Sunucuya ulaşılamıyor.');
    }
    setMssLoading(false);
  };

  const handleMssEnable = async () => {
    setMssLoading(true);
    setMssError('');
    setMssSuccess('');
    try {
      const res = await fetch('https://customers.katipotomasyonu.com/api/osgb/distance-sales-agreement', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': API_KEY,
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify({ enabled: true })
      });
      if (res.ok) {
        setMssEnabled(true);
        updateUser({ ...user, distance_sales_agreement_enabled: true });
        setMssModalOpen(false);
      } else {
        setMssError('Sözleşme onaylanamadı.');
      }
    } catch {
      setMssError('Sunucuya ulaşılamıyor.');
    }
    setMssLoading(false);
  };

  const handleMssDisable = async () => {
    setMssLoading(true);
    setMssError('');
    setMssSuccess('');
    try {
      const res = await fetch('https://customers.katipotomasyonu.com/api/osgb/distance-sales-agreement', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': API_KEY,
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify({ enabled: false })
      });
      if (res.ok) {
        setMssEnabled(false);
        updateUser({ ...user, distance_sales_agreement_enabled: false });
        setMssSuccess('Mesafeli Satış Sözleşmesi devre dışı bırakıldı.');
      } else {
        setMssError('Sözleşme devre dışı bırakılamadı.');
      }
    } catch {
      setMssError('Sunucuya ulaşılamıyor.');
    }
    setMssLoading(false);
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
        {fields.map(({ key, label }) => (
          <div key={key} className="mb-3 d-flex align-items-center">
            <strong style={{ minWidth: 140 }}>{label}:</strong>
            {editField === key && confirming ? (
              <>
                {key === 'password' ? (
                  <div style={{ width: 250 }}>
                    <div className="input-group">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        className="form-control"
                        value={editValue}
                        onChange={e => setEditValue(e.target.value)}
                        minLength={8}
                        maxLength={16}
                        required
                        placeholder="Yeni Şifre"
                      />
                      <button
                        type="button"
                        className="btn btn-outline-secondary"
                        tabIndex={-1}
                        onClick={() => setShowPassword(v => !v)}
                        aria-label={showPassword ? 'Şifreyi gizle' : 'Şifreyi göster'}
                      >
                        <i className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                      </button>
                    </div>
                    <div className="input-group mt-2">
                      <input
                        type={showPasswordConfirm ? 'text' : 'password'}
                        className="form-control"
                        placeholder="Yeni Şifre (Tekrar)"
                        value={confirmPassword}
                        onChange={e => setConfirmPassword(e.target.value)}
                        minLength={8}
                        maxLength={16}
                        required
                      />
                      <button
                        type="button"
                        className="btn btn-outline-secondary"
                        tabIndex={-1}
                        onClick={() => setShowPasswordConfirm(v => !v)}
                        aria-label={showPasswordConfirm ? 'Şifreyi gizle' : 'Şifreyi göster'}
                      >
                        <i className={`bi ${showPasswordConfirm ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                      </button>
                    </div>
                  </div>
                ) : (
                  <input
                    type={key === 'password' ? 'password' : 'text'}
                    className="form-control mx-2"
                    value={editValue}
                    onChange={e => setEditValue(e.target.value)}
                    style={{ maxWidth: 250 }}
                  />
                )}
                <button className="btn btn-success btn-sm mx-1" onClick={handleConfirm}>Evet</button>
                <button className="btn btn-secondary btn-sm" onClick={() => { setEditField(null); setConfirming(false); setConfirmPassword(''); }}>Hayır</button>
              </>
            ) : (
              <>
                <span className="mx-2">{key === 'password' ? '********' : user[key]}</span>
                <button className="btn btn-link p-0 text-danger" onClick={() => { handleEditClick(key); setConfirmPassword(''); }} title="Düzenle">
                  <i className="bi bi-pencil"></i>
                </button>
              </>
            )}
          </div>
        ))}
        {/* Grouped editable fields: Şehir, İlçe, Vergi Dairesi, Vergi Kimlik No */}
        <div className="mb-3 p-3 rounded border border-2 border-danger position-relative" style={{borderStyle:'dashed', minHeight: 80}}>
          <div className="d-flex align-items-center mb-2">
            <strong style={{ minWidth: 140 }}>Şehir:</strong>
            <span className="mx-2">{user.city}</span>
          </div>
          <div className="d-flex align-items-center mb-2">
            <strong style={{ minWidth: 140 }}>İlçe:</strong>
            <span className="mx-2">{user.district}</span>
          </div>
          <div className="d-flex align-items-center mb-2">
            <strong style={{ minWidth: 140 }}>Vergi Dairesi:</strong>
            <span className="mx-2">{user.tax_office}</span>
          </div>
          <div className="d-flex align-items-center mb-2">
            <strong style={{ minWidth: 140 }}>Vergi Kimlik No:</strong>
            <span className="mx-2">{user.tax_number}</span>
          </div>
          {/* Pencil icon for group edit */}
          <button
            className="btn btn-link p-0 text-danger position-absolute"
            style={{ top: 8, right: 8 }}
            onClick={() => handleEditClick('tax_group')}
            title="Düzenle"
          >
            <i className="bi bi-pencil"></i>
          </button>
          {/* Group edit mode */}
          {editField === 'tax_group' && confirming && (
            <div className="mt-3">
              <div className="row g-2">
                <div className="col-md-6">
                  <label className="form-label">Şehir</label>
                  <select
                    className="form-select"
                    value={selectedCity || user.city || ''}
                    onChange={e => setSelectedCity(e.target.value)}
                  >
                    <option value="">Şehir seçiniz</option>
                    {taxData.map(city => (
                      <option key={city.name} value={city.name}>{city.name}</option>
                    ))}
                  </select>
                </div>
                <div className="col-md-6">
                  <label className="form-label">İlçe</label>
                  <select
                    className="form-select"
                    value={selectedDistrict || user.district || ''}
                    onChange={e => setSelectedDistrict(e.target.value)}
                    disabled={!selectedCity && !user.city}
                  >
                    <option value="">İlçe seçiniz</option>
                    {districts.map(d => (
                      <option key={d.name} value={d.name}>{d.name}</option>
                    ))}
                  </select>
                </div>
                <div className="col-md-6">
                  <label className="form-label">Vergi Dairesi</label>
                  <select
                    className="form-select"
                    value={editValue || user.tax_office || ''}
                    onChange={e => setEditValue(e.target.value)}
                    disabled={!selectedDistrict && !user.district}
                  >
                    <option value="">Vergi Dairesi seçiniz</option>
                    {taxOffices.map(office => (
                      <option key={office} value={office}>{office}</option>
                    ))}
                  </select>
                </div>
                <div className="col-md-6">
                  <label className="form-label">Vergi Kimlik No</label>
                  <input
                    type="text"
                    className="form-control"
                    value={user.tax_number}
                    onChange={e => setEditValue(e.target.value)}
                    maxLength={10}
                    minLength={10}
                    pattern="[0-9]{10}"
                  />
                </div>
              </div>
              <div className="mt-2">
                <button className="btn btn-success btn-sm mx-1" onClick={handleConfirm}>Evet</button>
                <button className="btn btn-secondary btn-sm" onClick={() => { setEditField(null); setConfirming(false); }}>Hayır</button>
              </div>
            </div>
          )}
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
      {/* MSS Toggle Section */}
      <div className="card p-4 shadow-sm mt-4">
        <div className="d-flex align-items-center mb-2">
          <strong style={{ minWidth: 200 }}>Mesafeli Satış Sözleşmesi:</strong>
          <span className={`badge ${mssEnabled ? 'bg-success' : 'bg-secondary'}`}>{mssEnabled ? 'Onaylandı' : 'Onaylanmadı'}</span>
        </div>
        <div className="mb-2 d-flex gap-2">
          {mssEnabled ? (
            <>
              <button
                className="btn btn-outline-danger btn-sm"
                onClick={() => setShowMssDisableModal(true)}
                disabled={mssLoading}
              >
                {mssLoading ? 'İşleniyor...' : 'Sözleşmeyi İptal Et'}
              </button>
              <button className="btn btn-outline-primary btn-sm" onClick={() => fetchMssAgreement('view')} disabled={mssLoading}>
                Sözleşmeyi Görüntüle
              </button>
            </>
          ) : (
            <button className="btn btn-outline-success btn-sm" onClick={() => fetchMssAgreement('confirm')} disabled={mssLoading}>
              {mssLoading ? 'Yükleniyor...' : 'Sözleşmeyi Onayla'}
            </button>
          )}
        </div>
        {!mssEnabled && (
          <div className="alert alert-warning mt-2">
            Mesafeli Satış Sözleşmesi'ni iptal ettiğiniz takdirde satın alma, paket yenileme vb işlemlerinizi yapamazsınız. Bu gibi işlemleri yapabilmek için lütfen MSS'i onaylayınız.
          </div>
        )}
        {mssError && <div className="alert alert-danger py-2 mt-2">{mssError}</div>}
        {mssSuccess && <div className="alert alert-success py-2 mt-2">{mssSuccess}</div>}
      </div>
      {/* MSS Modal (for view or confirm) */}
      {mssModalOpen && (
        <div className="modal show d-block" tabIndex="-1" style={{ background: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Mesafeli Satış Sözleşmesi</h5>
                <button type="button" className="btn-close" onClick={() => setMssModalOpen(false)}></button>
              </div>
              <div className="modal-body" style={{ maxHeight: 400, overflowY: 'auto' }}>
                <div dangerouslySetInnerHTML={{ __html: mssAgreementHtml }} />
                {/* Only show confirmation checkbox and enable button if in 'confirm' mode */}
                {mssModalMode === 'confirm' && (
                  <div className="form-check mt-3">
                    <input className="form-check-input" type="checkbox" id="mssConfirm" checked={mssConfirm} onChange={e => setMssConfirm(e.target.checked)} />
                    <label className="form-check-label" htmlFor="mssConfirm">
                      Sözleşme içeriğini okudum ve onaylıyorum.
                    </label>
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setMssModalOpen(false)}>Kapat</button>
                {/* Only show enable button if in 'confirm' mode */}
                {mssModalMode === 'confirm' && (
                  <button className="btn btn-success" onClick={handleMssEnable} disabled={!mssConfirm || mssLoading}>
                    {mssLoading ? 'Onaylanıyor...' : 'Onayla ve E-posta Gönder'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      {/* MSS Disable Confirmation Modal */}
      {showMssDisableModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ background: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Sözleşmeyi İptal Et</h5>
                <button type="button" className="btn-close" onClick={() => { setShowMssDisableModal(false); setMssDisableInput(''); }}></button>
              </div>
              <div className="modal-body">
                <div className="alert alert-warning">
                  Mesafeli Satış Sözleşmesi'ni iptal ettiğiniz takdirde satın alma, paket yenileme vb işlemlerinizi yapamazsınız.<br />
                  İşlemi onaylıyorsanız aşağıdaki kutuya <b>onaylıyorum</b> yazınız, büyük/küçük harf kullanımına dikkat ediniz.
                </div>
                <input
                  type="text"
                  className="form-control"
                  placeholder="onaylıyorum"
                  value={mssDisableInput}
                  onChange={e => setMssDisableInput(e.target.value)}
                  autoFocus
                />
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => { setShowMssDisableModal(false); setMssDisableInput(''); }}>Vazgeç</button>
                <button
                  className="btn btn-danger"
                  disabled={mssDisableInput !== 'onaylıyorum' || mssLoading}
                  onClick={async () => {
                    if (mssDisableInput === 'onaylıyorum') {
                      await handleMssDisable();
                      setShowMssDisableModal(false);
                      setMssDisableInput('');
                    }
                  }}
                >
                  {mssLoading ? 'İşleniyor...' : 'İptal Et'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default IsletmemPage;
