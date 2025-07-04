import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { fetchTaxOffices } from '../api/taxOffices';
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
  const [taxData, setTaxData] = useState([]);
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [taxOfficeList, setTaxOfficeList] = useState([]); // <-- fix: for tax offices
  const [taxNumber, setTaxNumber] = useState(''); // <-- fix: for tax number
  const navigate = useNavigate();
  const API_KEY = process.env.REACT_APP_USER_API_KEY;
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://customers.katipotomasyonu.com/api';
  const didFetchRef = useRef(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resendLoading, setResendLoading] = useState(false);
  const [resendMessage, setResendMessage] = useState('');

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

  // Editable fields for the profile
  const fields = [
    { key: 'company_name', label: 'Şirket Ünvanı' },
    { key: 'address', label: 'Adres' },
    { key: 'osgb_id', label: 'OSGB Yetki Belgesi No' },
    { key: 'phone', label: 'Telefon' },
    { key: 'email', label: 'E-posta' },
    { key: 'password', label: 'Şifre' },
    // Add city, district, tax_office, tax_number if you want them editable
  ];

  // Group edit: always fetch tax offices and set initial values
  const handleEditClick = (key) => {
    if (["city", "district", "tax_office", "tax_number", "tax_group"].includes(key)) {
      fetchTaxOffices(API_KEY)
        .then(data => {
          setTaxData(data.cities || []);
          // Set initial city/district/tax office/tax number from user
          setSelectedCity(user.city || '');
          setSelectedDistrict(user.district || '');
          setTaxNumber(user.tax_number || '');
          // Set tax offices for current city/district
          const cityObj = data.cities.find(c => c.name === (user.city || ''));
          const districtObj = cityObj?.districts.find(d => d.name === (user.district || ''));
          setTaxOfficeList(districtObj?.taxOffices || []);
        })
        .catch(() => setTaxData([]));
    }
    setEditField(key);
    setEditValue(user[key] || '');
    setError('');
    setSuccess('');
  };

  // Update districts and tax offices when city/district changes
  useEffect(() => {
    if (!selectedCity || !taxData.length) return;
    const cityObj = taxData.find(c => c.name === selectedCity);
    if (cityObj) {
      // If selectedDistrict is not in new city, reset
      if (!cityObj.districts.some(d => d.name === selectedDistrict)) {
        setSelectedDistrict('');
        setTaxOfficeList([]);
      }
    }
  }, [selectedCity, selectedDistrict, taxData]);

  useEffect(() => {
    if (!selectedCity || !selectedDistrict || !taxData.length) return;
    const cityObj = taxData.find(c => c.name === selectedCity);
    const districtObj = cityObj?.districts.find(d => d.name === selectedDistrict);
    setTaxOfficeList(districtObj?.taxOffices || []);
  }, [selectedDistrict, selectedCity, taxData]);

  // Remove this useEffect:
  // useEffect(() => {
  //   fetchTaxOffices(API_KEY)
  //     .then(data => setTaxData(data.cities || []))
  //     .catch(() => setTaxData([]));
  // }, [API_KEY]);

  const handleConfirm = async () => {
    setError('');
    setSuccess('');
    if (!editValue && editField !== 'tax_group') {
      setError('Geçerli bir değer giriniz.');
      return;
    }
    if (editField === 'password' && editValue.length < 8) {
      setError('Şifre en az 8 karakter olmalı.');
      return;
    }
    if (editField === 'password' && editValue !== confirmPassword) {
      setError('Şifreler eşleşmiyor.');
      return;
    }
    if (!user.accessToken) {
      setError('Kimlik doğrulama hatası: Lütfen tekrar giriş yapın.');
      return;
    }
    let payload;
    if (editField === 'tax_group') {
      payload = {
        city: selectedCity,
        district: selectedDistrict,
        tax_office: editValue,
        tax_number: taxNumber
      };
    } else if (editField === 'city') {
      payload = { city: selectedCity };
    } else if (editField === 'district') {
      payload = { district: selectedDistrict };
    } else if (editField === 'tax_office') {
      payload = { tax_office: editValue };
    } else if (editField === 'phone') {
      payload = { phone: `+90${editValue}` };
    } else {
      payload = { [editField]: editValue };
    }
    // Required fields for PATCH
    const required = ['company_name', 'tax_number', 'address', 'tax_office', 'osgb_id', 'phone', 'email', 'city', 'district'];
    required.forEach(f => {
      if (!(editField === 'tax_group' && ['city','district','tax_office','tax_number'].includes(f)) && f !== editField) payload[f] = user[f];
    });
    if (editField !== 'password') delete payload.password;
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
        if ([
          'INVALID_OSGB_ID',
          'INVALID_COMPANY_NAME',
          'INVALID_CITY',
          'INVALID_DISTRICT'
        ].includes(data.error) && data.message) {
          let msg = data.message;
          if (data.error === 'INVALID_CITY') msg = 'Seçilen şehir resmi kayıtlardaki ile eşleşmiyor.';
          else if (data.error === 'INVALID_DISTRICT') msg = 'Seçilen ilçe resmi kayıtlardaki ile eşleşmiyor.';
          else if (data.error === 'INVALID_COMPANY_NAME') msg = 'Şirket ünvanı resmi kayıtlardaki ile eşleşmiyor.';
          else if (data.error === 'INVALID_OSGB_ID') msg = 'OSGB Yetki Belgesi No resmi kayıtlarda bulunamadı.';
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
                ) : key === 'phone' ? (
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
                <span className="mx-2">{key === 'password' ? '********' : (key === 'phone' ? `+90${user[key]}` : user[key])}</span>
                <button className="btn btn-link p-0 text-danger" onClick={() => { setEditField(key); setEditValue(user[key] || ''); setConfirming(true); setError(''); setSuccess(''); }} title="Düzenle">
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
            onClick={() => { handleEditClick('tax_group'); setConfirming(true); }}
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
                    value={selectedCity}
                    onChange={e => { setSelectedCity(e.target.value); setSelectedDistrict(''); setTaxOfficeList([]); }}
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
                    value={selectedDistrict}
                    onChange={e => setSelectedDistrict(e.target.value)}
                    disabled={!selectedCity}
                  >
                    <option value="">İlçe seçiniz</option>
                    {taxData.find(city => city.name === selectedCity)?.districts.map(d => (
                      <option key={d.name} value={d.name}>{d.name}</option>
                    ))}
                  </select>
                </div>
                <div className="col-md-6">
                  <label className="form-label">Vergi Dairesi</label>
                  <select
                    className="form-select"
                    value={editValue}
                    onChange={e => setEditValue(e.target.value)}
                    disabled={!selectedDistrict}
                  >
                    <option value="">Vergi Dairesi seçiniz</option>
                    {taxOfficeList.map(office => (
                      <option key={office} value={office}>{office}</option>
                    ))}
                  </select>
                </div>
                <div className="col-md-6">
                  <label className="form-label">Vergi Kimlik No</label>
                  <input
                    type="text"
                    className="form-control"
                    value={taxNumber}
                    onChange={e => setTaxNumber(e.target.value.replace(/[^0-9]/g, ''))}
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
    </div>
  );
}

export default IsletmemPage;
