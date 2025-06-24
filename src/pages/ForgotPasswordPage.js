import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [resetSuccess, setResetSuccess] = useState(false);
  const [resetError, setResetError] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const location = useLocation();

  // Parse token from URL
  React.useEffect(() => {
    const params = new URLSearchParams(location.search);
    const t = params.get('token');
    if (t) setToken(t);
  }, [location.search]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);
    try {
      const res = await fetch('https://customers.katipotomasyonu.com/api/osgb/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.REACT_APP_USER_API_KEY
        },
        body: JSON.stringify({ email })
      });
      if (res.status === 200) {
        setSuccess(true);
      } else {
        const data = await res.json();
        setError(data.error || 'Bir hata oluştu.');
      }
    } catch (err) {
      setError('Bir hata oluştu.');
    }
    setLoading(false);
  };

  const handleReset = async (e) => {
    e.preventDefault();
    setResetLoading(true);
    setResetError('');
    setResetSuccess(false);
    try {
      const res = await fetch('https://customers.katipotomasyonu.com/api/osgb/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.REACT_APP_USER_API_KEY
        },
        body: JSON.stringify({ token, new_password: newPassword })
      });
      if (res.status === 200) {
        setResetSuccess(true);
      } else {
        const data = await res.json();
        setResetError(data.error || 'Şifre sıfırlanamadı. Token geçersiz veya süresi dolmuş olabilir.');
      }
    } catch (err) {
      setResetError('Sunucuya ulaşılamadı. Lütfen tekrar deneyin.');
    }
    setResetLoading(false);
  };

  // If token is present, show reset password form
  if (token) {
    return (
      <div className="container py-5" style={{ maxWidth: 400 }}>
        <h2 className="mb-4">Şifre Sıfırla</h2>
        {resetSuccess ? (
          <div className="alert alert-success">Şifreniz başarıyla güncellendi. Artık yeni şifrenizle giriş yapabilirsiniz.</div>
        ) : (
          <form onSubmit={handleReset}>
            <div className="mb-3">
              <label htmlFor="token" className="form-label">E-posta ile gelen Kod</label>
              <input type="text" className="form-control" id="token" value={token} onChange={e => setToken(e.target.value)} required />
              <div className="form-text text-muted" style={{fontSize:'0.95em'}}>
                Şifre sıfırlama e-postasındaki kodu buraya giriniz.
              </div>
            </div>
            <div className="mb-3">
              <label htmlFor="newPassword" className="form-label">Yeni Şifre</label>
              <input type="password" className="form-control" id="newPassword" value={newPassword} onChange={e => setNewPassword(e.target.value)} required minLength={8} maxLength={16} />
              <div className="form-text text-muted" style={{fontSize:'0.95em'}}>
                Şifreniz 8-16 karakter arasında olmalıdır.
              </div>
            </div>
            {resetError && <div className="alert alert-danger py-2">{resetError}</div>}
            <button type="submit" className="btn btn-danger w-100" disabled={resetLoading}>
              {resetLoading ? 'Sıfırlanıyor...' : 'Şifreyi Sıfırla'}
            </button>
          </form>
        )}
      </div>
    );
  }

  return (
    <div className="container py-5" style={{ maxWidth: 400 }}>
      <h2 className="mb-4">Şifremi Unuttum</h2>
      {success ? (
        <>
          <div className="alert alert-success">Şifre sıfırlama bağlantısı e-posta adresinize gönderildi.</div>
          <div className="text-center mt-3">
            <Link to="/sifre-sifirla" className="btn btn-outline-danger">Kodu Girdikten Sonra Şifreyi Sıfırla</Link>
          </div>
        </>
      ) : (
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="email" className="form-label">E-posta Adresiniz</label>
            <input type="email" className="form-control" id="email" value={email} onChange={e => setEmail(e.target.value)} required />
          </div>
          {error && <div className="alert alert-danger py-2">{error}</div>}
          <button type="submit" className="btn btn-danger w-100" disabled={loading}>
            {loading ? 'Gönderiliyor...' : 'Gönder'}
          </button>
          <div className="text-center mt-3">
            <Link to="/sifre-sifirla" className="small text-danger">Elinizde kod var mı? Şifreyi sıfırla</Link>
          </div>
        </form>
      )}
    </div>
  );
}

export default ForgotPasswordPage;
