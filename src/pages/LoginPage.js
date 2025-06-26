import React, { useState, useEffect } from 'react';
import AuthLayout from '../components/AuthLayout';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

function LoginPage() {
  const [form, setForm] = useState({ identifier: '', password: '' }); // 'identifier' can be email or customer_id
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/isletmem', { replace: true });
    }
  }, [user, navigate]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      // Determine if identifier is email or customer_id
      const isEmail = form.identifier.includes('@');
      const isCustomerId = /^\d+$/.test(form.identifier);
      let body;
      if (isEmail) {
        body = { email: form.identifier, password: form.password };
      } else if (isCustomerId) {
        body = { customer_id: Number(form.identifier), password: form.password };
      } else {
        setError('Geçerli bir e-posta adresi veya müşteri numarası giriniz.');
        setLoading(false);
        return;
      }
      const res = await fetch('https://customers.katipotomasyonu.com/api/osgb/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.REACT_APP_USER_API_KEY
        },
        body: JSON.stringify(body)
      });
      if (res.status === 200) {
        const data = await res.json();
        // Store licenseKey in user if present
        const userWithLicense = data.licenseKey ? { ...data.user, licenseKey: data.licenseKey } : data.user;
        login({ user: userWithLicense, accessToken: data.accessToken, refreshToken: data.refreshToken });
        navigate('/isletmem', { replace: true });
      } else {
        const data = await res.json();
        setError(data.error === 'INVALID_CREDENTIALS' ? 'E-posta/Müşteri No veya şifre hatalı.' : 'Giriş sırasında bir hata oluştu.');
      }
    } catch (err) {
      setError('Sunucuya bağlanılamadı. Lütfen tekrar deneyin.');
    }
    setLoading(false);
  };

  return (
    <AuthLayout>
      <div style={{display:'flex',justifyContent:'center',alignItems:'flex-start',minHeight:'100vh',paddingTop:32}}>
        <form onSubmit={handleSubmit} style={{ minWidth: 320, maxWidth: 400, width: '100%', margin: 0 }}>
          <h2 className="mb-4">Giriş Yap</h2>
          <div className="mb-3">
            <label htmlFor="identifier" className="form-label">E-posta veya Müşteri Numarası</label>
            <input type="text" className="form-control" id="identifier" name="identifier" value={form.identifier} onChange={handleChange} required autoComplete="username" />
            <div className="form-text text-muted" style={{fontSize:'0.95em'}}>
              Giriş için e-posta adresinizi <b>veya</b> müşteri numaranızı kullanabilirsiniz.
            </div>
          </div>
          <div className="mb-3">
            <label htmlFor="password" className="form-label">Şifre</label>
            <input type="password" className="form-control" id="password" name="password" value={form.password} onChange={handleChange} required minLength={8} maxLength={16} autoComplete="current-password" />
          </div>
          {error && <div className="alert alert-danger py-2">{error}</div>}
          <button type="submit" className="btn btn-danger w-100" disabled={loading}>
            {loading ? 'Giriş Yapılıyor...' : 'Giriş Yap'}
          </button>
          <div className="text-center mt-3">
            <a href="/sifremi-unuttum" className="small text-danger">Şifremi Unuttum</a>
          </div>
        </form>
      </div>
    </AuthLayout>
  );
}

export default LoginPage;
