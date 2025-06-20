import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import 'bootstrap-icons/font/bootstrap-icons.css';

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
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editField, setEditField] = useState(null); // which field is being edited
  const [editValue, setEditValue] = useState('');
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showLicense, setShowLicense] = useState(false);
  const navigate = useNavigate();

  const API_KEY = process.env.REACT_APP_USER_API_KEY;

  useEffect(() => {
    const userData = localStorage.getItem('osgbUser');
    if (!userData) {
      navigate('/giris', { replace: true });
      return;
    }
    const parsed = JSON.parse(userData);
    // If token is missing, try to get it from a separate key (for backward compatibility)
    let token = parsed.token;
    if (!token) {
      const tokenFromStorage = localStorage.getItem('osgbToken');
      if (tokenFromStorage) token = tokenFromStorage;
    }
    setUser({ ...parsed, token });
    setLoading(false);
  }, [navigate]);

  const fields = [
    { key: 'company_name', label: 'Şirket Ünvanı' },
    { key: 'city', label: 'Şehir' },
    { key: 'district', label: 'İlçe' },
    { key: 'tax_number', label: 'Vergi Kimlik No' },
    { key: 'address', label: 'Adres' },
    { key: 'tax_office', label: 'Vergi Dairesi' },
    { key: 'osgb_id', label: 'OSGB Yetki Belgesi No' },
    { key: 'phone', label: 'Telefon' },
    { key: 'email', label: 'E-posta' },
    { key: 'password', label: 'Şifre' },
  ];

  const handleEditClick = (key) => {
    setEditField(key);
    setEditValue(user[key] || '');
    setConfirming(true);
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
    if (!user.token) {
      setError('Kimlik doğrulama hatası: Lütfen tekrar giriş yapın.');
      return;
    }
    // Prepare PATCH payload (only the edited field)
    const payload = { [editField]: editValue };
    // Required fields for PATCH: must send all required fields except password (unless changing password)
    const required = ['company_name', 'tax_number', 'address', 'tax_office', 'osgb_id', 'phone', 'email'];
    required.forEach(f => {
      if (f !== editField) payload[f] = user[f];
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
        const data = await res.json();
        // Preserve token and licenseKey in updated user object
        const updatedUser = { ...data.user, token: user.token, licenseKey: user.licenseKey };
        setUser(updatedUser);
        localStorage.setItem('osgbUser', JSON.stringify(updatedUser));
        setSuccess('Bilgi başarıyla güncellendi.');
        setEditField(null);
        setConfirming(false);
      } else {
        const data = await res.json();
        setError(data.error || 'Güncelleme sırasında bir hata oluştu.');
      }
    } catch (err) {
      setError('Sunucuya bağlanılamadı.');
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!user) return null;

  return (
    <div className="container py-5" style={{ maxWidth: 600 }}>
      <h2 className="mb-4">İşletmem</h2>
      <div className="card p-4 shadow-sm">
        {/* License Key Display */}
        {user.licenseKey && (
          <>
            <div className="mb-1 d-flex align-items-center">
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
            <div className="mb-3 p-2 rounded bg-primary bg-opacity-10 text-primary small">
              Bu lisans anahtarı Katip Otomasyonu eklentisini kullanabilmek için gereklidir.<br />
              <span className="fw-bold">Bu anahtarı doğru kopyaladığınızdan emin olmalısınız, aksi durumda eklenti çalışmaz ve lisans geçersiz hatası alırsınız.</span>
            </div>
          </>
        )}
        {fields.map(({ key, label }) => (
          <div key={key} className="mb-3 d-flex align-items-center">
            <strong style={{ minWidth: 140 }}>{label}:</strong>
            {editField === key && confirming ? (
              <>
                <input
                  type={key === 'password' ? 'password' : 'text'}
                  className="form-control mx-2"
                  value={editValue}
                  onChange={e => setEditValue(e.target.value)}
                  style={{ maxWidth: 250 }}
                />
                <button className="btn btn-success btn-sm mx-1" onClick={handleConfirm}>Evet</button>
                <button className="btn btn-secondary btn-sm" onClick={() => { setEditField(null); setConfirming(false); }}>Hayır</button>
              </>
            ) : (
              <>
                <span className="mx-2">{key === 'password' ? '********' : user[key]}</span>
                <button className="btn btn-link p-0 text-danger" onClick={() => handleEditClick(key)} title="Düzenle">
                  <i className="bi bi-pencil"></i>
                </button>
              </>
            )}
          </div>
        ))}
        {error && <div className="alert alert-danger py-2">{error}</div>}
        {success && <div className="alert alert-success py-2">{success}</div>}
      </div>
    </div>
  );
}

export default IsletmemPage;
