import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { fetchTaxOffices } from '../api/taxOffices';

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
  const [taxData, setTaxData] = useState([]);
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [districts, setDistricts] = useState([]);
  const [taxOffices, setTaxOffices] = useState([]);
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

  useEffect(() => {
    fetchTaxOffices(API_KEY)
      .then(data => setTaxData(data.cities || []))
      .catch(() => setTaxData([]));
  }, [API_KEY]);

  useEffect(() => {
    if (selectedCity) {
      const city = taxData.find(c => c.name === selectedCity);
      setDistricts(city ? city.districts : []);
      setSelectedDistrict('');
      setTaxOffices([]);
    } else {
      setDistricts([]);
      setTaxOffices([]);
    }
  }, [selectedCity, taxData]);

  useEffect(() => {
    if (selectedDistrict) {
      const city = taxData.find(c => c.name === selectedCity);
      const district = city?.districts.find(d => d.name === selectedDistrict);
      setTaxOffices(district ? district.taxOffices : []);
    } else {
      setTaxOffices([]);
    }
  }, [selectedDistrict, selectedCity, taxData]);

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
    if (key === 'city') {
      setSelectedCity(user.city || '');
    } else if (key === 'district') {
      setSelectedDistrict(user.district || '');
    } else if (key === 'tax_office') {
      setEditValue(user.tax_office || '');
    } else {
      setEditValue(user[key] || '');
    }
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
    let payload;
    if (editField === 'city') {
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
      if (f !== editField && !(f === 'city' && editField === 'district') && !(f === 'district' && editField === 'city')) payload[f] = user[f];
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
                {key === 'city' ? (
                  <select
                    className="form-select mx-2"
                    style={{ maxWidth: 250 }}
                    value={selectedCity || user.city || ''}
                    onChange={e => setSelectedCity(e.target.value)}
                  >
                    <option value="">Şehir seçiniz</option>
                    {taxData.map(city => (
                      <option key={city.name} value={city.name}>{city.name}</option>
                    ))}
                  </select>
                ) : key === 'district' ? (
                  <select
                    className="form-select mx-2"
                    style={{ maxWidth: 250 }}
                    value={selectedDistrict || user.district || ''}
                    onChange={e => setSelectedDistrict(e.target.value)}
                    disabled={!selectedCity && !user.city}
                  >
                    <option value="">İlçe seçiniz</option>
                    {districts.map(d => (
                      <option key={d.name} value={d.name}>{d.name}</option>
                    ))}
                  </select>
                ) : key === 'tax_office' ? (
                  <select
                    className="form-select mx-2"
                    style={{ maxWidth: 250 }}
                    value={editValue || user.tax_office || ''}
                    onChange={e => setEditValue(e.target.value)}
                    disabled={!selectedDistrict && !user.district}
                  >
                    <option value="">Vergi Dairesi seçiniz</option>
                    {taxOffices.map(office => (
                      <option key={office} value={office}>{office}</option>
                    ))}
                  </select>
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
        <div className="mb-3">
          <strong style={{ minWidth: 140 }}>Şehir:</strong>
          <select
            className="form-select"
            value={selectedCity}
            onChange={e => setSelectedCity(e.target.value)}
          >
            <option value="">Şehir Seçin</option>
            {taxData.map(city => (
              <option key={city.name} value={city.name}>{city.name}</option>
            ))}
          </select>
        </div>
        <div className="mb-3">
          <strong style={{ minWidth: 140 }}>İlçe:</strong>
          <select
            className="form-select"
            value={selectedDistrict}
            onChange={e => setSelectedDistrict(e.target.value)}
            disabled={!selectedCity}
          >
            <option value="">İlçe Seçin</option>
            {districts.map(district => (
              <option key={district.name} value={district.name}>{district.name}</option>
            ))}
          </select>
        </div>
        <div className="mb-3">
          <strong style={{ minWidth: 140 }}>Vergi Dairesi:</strong>
          <select
            className="form-select"
            value={user.tax_office}
            onChange={e => handleEditClick('tax_office', e.target.value)}
            disabled={!selectedDistrict}
          >
            <option value="">Vergi Dairesi Seçin</option>
            {taxOffices.map(office => (
              <option key={office.name} value={office.name}>{office.name}</option>
            ))}
          </select>
        </div>
        {error && <div className="alert alert-danger py-2">{error}</div>}
        {success && <div className="alert alert-success py-2">{success}</div>}
      </div>
    </div>
  );
}

export default IsletmemPage;
