import React, { useState, useEffect } from 'react';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { fetchTaxOffices } from '../api/taxOffices';

function RegisterPage() {
  const [form, setForm] = useState({
    company_name: '',
    tax_number: '',
    tax_office: '',
    address: '',
    phone: '',
    email: '',
    osgb_id: '',
    password: '',
    password_confirm: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
  const [taxData, setTaxData] = useState([]);
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [districts, setDistricts] = useState([]);
  const [taxOffices, setTaxOffices] = useState([]);

  const API_KEY = process.env.REACT_APP_USER_API_KEY;

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
      setForm(f => ({ ...f, tax_office: '' }));
    } else {
      setDistricts([]);
      setTaxOffices([]);
      setForm(f => ({ ...f, tax_office: '' }));
    }
  }, [selectedCity, taxData]);

  useEffect(() => {
    if (selectedDistrict) {
      const city = taxData.find(c => c.name === selectedCity);
      const district = city?.districts.find(d => d.name === selectedDistrict);
      setTaxOffices(district ? district.taxOffices : []);
      setForm(f => ({ ...f, tax_office: '' }));
    } else {
      setTaxOffices([]);
      setForm(f => ({ ...f, tax_office: '' }));
    }
  }, [selectedDistrict, selectedCity, taxData]);

  const handleChange = (e) => {
    if (e.target.name === 'phone') {
      let value = e.target.value.replace(/\D/g, '');
      if (value.startsWith('0')) value = value.slice(1);
      if (value.length > 10) value = value.slice(0, 10);
      setForm({ ...form, phone: value });
    } else if (e.target.name === 'osgb_id') {
      let value = e.target.value.replace(/\D/g, '');
      setForm({ ...form, osgb_id: value });
    } else if (e.target.name === 'tax_office') {
      setForm({ ...form, tax_office: e.target.value });
    } else {
      setForm({ ...form, [e.target.name]: e.target.value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Client-side validation: password match
    if (form.password !== form.password_confirm) {
      setError('Şifreler eşleşmiyor.');
      setLoading(false);
      return;
    }

    // Prepare payload for API
    const payload = {
      company_name: form.company_name.trim(),
      tax_number: form.tax_number,
      tax_office: form.tax_office.trim(),
      address: form.address.trim(),
      phone: `+90${form.phone}`,
      email: form.email.trim(),
      osgb_id: `OSGB-${form.osgb_id}`,
      password: form.password,
      city: selectedCity,
      district: selectedDistrict
    };

    try {
      const res = await fetch('https://customers.katipotomasyonu.com/api/osgb/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': API_KEY
        },
        body: JSON.stringify(payload)
      });
      if (res.status === 201) {
        // Registration successful, redirect to login
        window.location.href = '/giris';
      } else {
        const data = await res.json();
        if (data && data.details && Array.isArray(data.details)) {
          setError(data.details.map(d => d.msg).join(' '));
        } else if (data && data.error) {
          // Show backend validation errors for official record mismatches
          if (
            [
              'INVALID_OSGB_ID',
              'INVALID_COMPANY_NAME',
              'INVALID_CITY',
              'INVALID_DISTRICT'
            ].includes(data.error) && data.message
          ) {
            // Translate backend error messages to Turkish
            let msg = data.message;
            if (data.error === 'INVALID_CITY') {
              // Example: "City does not match the official record. Expected: ISPARTA"
              const match = msg.match(/Expected: (.+)$/);
              const expected = match ? match[1] : '';
              msg = `Seçilen şehir resmi kayıtlardaki ile eşleşmiyor.`;
            } else if (data.error === 'INVALID_DISTRICT') {
              const match = msg.match(/Expected: (.+)$/);
              const expected = match ? match[1] : '';
              msg = `Seçilen ilçe resmi kayıtlardaki ile eşleşmiyor.}`;
            } else if (data.error === 'INVALID_COMPANY_NAME') {
              msg = 'Şirket ünvanı resmi kayıtlardaki ile eşleşmiyor.';
            } else if (data.error === 'INVALID_OSGB_ID') {
              msg = 'OSGB Yetki Belgesi No resmi kayıtlarda bulunamadı.';
            }
            setError(msg);
          } else if (data.error === 'EMAIL_EXISTS') {
            setError('Bu e-posta ile zaten kayıtlı bir kullanıcı var.');
          } else if (data.error === 'OSGB_ID_EXISTS') {
            setError('Bu OSGB Yetki Belgesi No ile zaten kayıtlı bir kullanıcı var.');
          } else {
            setError('Kayıt sırasında bir hata oluştu.');
          }
        } else {
          setError('Kayıt sırasında bir hata oluştu.');
        }
      }
    } catch (err) {
      setError('Sunucuya bağlanılamadı. Lütfen tekrar deneyin.');
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: 500, margin: '0 auto' }}>
      <div className="row g-3">
        <div className="col-12">
          <div className="mb-3">
            <label htmlFor="company_name" className="form-label">Şirket Ünvanı</label>
            <input
              type="text"
              className="form-control"
              id="company_name"
              name="company_name"
              value={form.company_name}
              onChange={handleChange}
              required
              maxLength={100}
            />
            <div className="p-2 mt-1 rounded bg-warning bg-opacity-25 text-dark small">
              Lütfen vergi levhanızdaki şirket ünvanını eksiksiz yazınız.
            </div>
          </div>
        </div>
        <div className="col-6">
          <div className="mb-3">
            <label htmlFor="city" className="form-label">Şehir</label>
            <select
              className="form-select"
              id="city"
              name="city"
              value={selectedCity}
              onChange={e => setSelectedCity(e.target.value)}
              required
            >
              <option value="">Şehir seçiniz</option>
              {taxData.map(city => (
                <option key={city.name} value={city.name}>{city.name}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="col-6">
          <div className="mb-3">
            <label htmlFor="district" className="form-label">İlçe</label>
            <select
              className="form-select"
              id="district"
              name="district"
              value={selectedDistrict}
              onChange={e => setSelectedDistrict(e.target.value)}
              required
              disabled={!selectedCity}
            >
              <option value="">İlçe seçiniz</option>
              {districts.map(d => (
                <option key={d.name} value={d.name}>{d.name}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="col-6">
          <div className="mb-3">
            <label htmlFor="tax_office" className="form-label">Vergi Dairesi</label>
            <select
              className="form-select"
              id="tax_office"
              name="tax_office"
              value={form.tax_office}
              onChange={handleChange}
              required
              disabled={!selectedDistrict}
            >
              <option value="">Vergi Dairesi seçiniz</option>
              {taxOffices.map(office => (
                <option key={office} value={office}>{office}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="col-6">
          <div className="mb-3">
            <label htmlFor="tax_number" className="form-label">Vergi Kimlik No</label>
            <input
              type="text"
              className="form-control"
              id="tax_number"
              name="tax_number"
              value={form.tax_number}
              onChange={e => {
                let value = e.target.value.replace(/\D/g, '');
                if (value.length > 10) value = value.slice(0, 10);
                setForm({ ...form, tax_number: value });
              }}
              required
              maxLength={10}
              minLength={10}
              pattern="[0-9]{10}"
              inputMode="numeric"
              autoComplete="off"
            />
            {form.tax_number.length > 0 && form.tax_number.length < 10 && (
              <div className="form-text text-danger">Vergi Kimlik No 10 haneli olmalıdır.</div>
            )}
          </div>
        </div>
        <div className="col-6">
          <div className="mb-3">
            <label htmlFor="osgb_id" className="form-label">OSGB Yetki Belgesi No</label>
            <div className="input-group">
              <span className="input-group-text">OSGB-</span>
              <input type="text" className="form-control" id="osgb_id" name="osgb_id" value={form.osgb_id} onChange={handleChange} required maxLength={10} pattern="[0-9]+" placeholder="123456" />
            </div>
            <div className="form-text">Sadece rakam giriniz. Örn: 123456</div>
          </div>
        </div>
        <div className="col-6">
          <div className="mb-3">
            <label htmlFor="phone" className="form-label">Telefon Numarası</label>
            <div className="input-group">
              <span className="input-group-text">+90</span>
              <input type="tel" className="form-control" id="phone" name="phone" value={form.phone} onChange={handleChange} required maxLength={10} minLength={10} pattern="[0-9]{10}" placeholder="5XXXXXXXXX" />
            </div>
            <div className="form-text">Başında 0 olmadan, 10 haneli giriniz. Örn: 5XXXXXXXXX</div>
          </div>
        </div>
        <div className="col-6">
          <div className="mb-3">
            <label htmlFor="email" className="form-label">E-posta</label>
            <input type="email" className="form-control" id="email" name="email" value={form.email} onChange={handleChange} required maxLength={60} />
          </div>
        </div>
        <div className="col-6">
          <div className="mb-3 position-relative">
            <label htmlFor="password" className="form-label">Şifre</label>
            <div className="input-group">
              <input
                type={showPassword ? 'text' : 'password'}
                className="form-control"
                id="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                required
                minLength={8}
                maxLength={16}
              />
              <span className="input-group-text" style={{cursor:'pointer'}} onClick={() => setShowPassword(v => !v)}>
                <i className={`bi bi-eye${showPassword ? '-slash' : ''}`}></i>
              </span>
            </div>
          </div>
        </div>
        <div className="col-6">
          <div className="mb-3 position-relative">
            <label htmlFor="password_confirm" className="form-label">Şifre (Tekrar)</label>
            <div className="input-group">
              <input
                type={showPasswordConfirm ? 'text' : 'password'}
                className="form-control"
                id="password_confirm"
                name="password_confirm"
                value={form.password_confirm}
                onChange={handleChange}
                required
                minLength={8}
                maxLength={16}
              />
              <span className="input-group-text" style={{cursor:'pointer'}} onClick={() => setShowPasswordConfirm(v => !v)}>
                <i className={`bi bi-eye${showPasswordConfirm ? '-slash' : ''}`}></i>
              </span>
            </div>
            {form.password_confirm.length > 0 && form.password !== form.password_confirm && (
              <div className="form-text text-danger">Şifreler eşleşmiyor.</div>
            )}
          </div>
        </div>
        <div className="col-12">
          <div className="mb-3">
            <label htmlFor="address" className="form-label">Adres</label>
            <textarea className="form-control" id="address" name="address" value={form.address} onChange={handleChange} required rows={3} maxLength={200} style={{resize:'vertical'}} />
          </div>
        </div>
      </div>
      {error && <div className="alert alert-danger py-2">{error}</div>}
      <button type="submit" className="btn btn-danger w-100 mt-2" disabled={loading}>
        {loading ? 'Kayıt Olunuyor...' : 'Kayıt Ol'}
      </button>
    </form>
  );
}

export default RegisterPage;