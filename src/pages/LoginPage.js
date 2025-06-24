import React, { useState } from 'react';
import AuthLayout from '../components/AuthLayout';
import { useAuth } from '../context/AuthContext';

function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('https://customers.katipotomasyonu.com/api/osgb/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.REACT_APP_USER_API_KEY
        },
        body: JSON.stringify({ email: form.email, password: form.password })
      });
      if (res.status === 200) {
        const data = await res.json();
        // Store all login response fields (user, token, and any others) in context
        login({ ...data.user, token: data.token, ...Object.fromEntries(Object.entries(data).filter(([k]) => k !== 'user' && k !== 'token')) });
        window.location.href = '/isletmem';
      } else {
        const data = await res.json();
        setError(data.error === 'INVALID_CREDENTIALS' ? 'E-posta veya şifre hatalı.' : 'Giriş sırasında bir hata oluştu.');
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
            <label htmlFor="email" className="form-label">E-posta</label>
            <input type="email" className="form-control" id="email" name="email" value={form.email} onChange={handleChange} required />
          </div>
          <div className="mb-3">
            <label htmlFor="password" className="form-label">Şifre</label>
            <input type="password" className="form-control" id="password" name="password" value={form.password} onChange={handleChange} required minLength={8} maxLength={16} />
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
