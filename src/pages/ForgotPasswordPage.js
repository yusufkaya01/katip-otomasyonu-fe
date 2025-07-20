import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import PageLoadingSpinner from '../components/PageLoadingSpinner';

function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resetSuccess, setResetSuccess] = useState(false);
  const [resetError, setResetError] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const location = useLocation();

  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://customers.katipotomasyonu.com/api';

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
      const res = await fetch(`${API_BASE_URL}/osgb/forgot-password`, {
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
      const res = await fetch(`${API_BASE_URL}/osgb/reset-password`, {
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
          <div className="alert alert-success">Şifreniz başarıyla sıfırlandı. <Link to="/giris">Giriş yap</Link></div>
        ) : (
          <form onSubmit={handleReset}>
            <div className="mb-3">
              <label htmlFor="newPassword" className="form-label">Yeni Şifre</label>
              <div className="input-group">
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="form-control"
                  id="newPassword"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  minLength={8}
                  maxLength={16}
                  required
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
            </div>
            <div className="mb-3">
              <label htmlFor="confirmPassword" className="form-label">Yeni Şifre (Tekrar)</label>
              <div className="input-group">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  className="form-control"
                  id="confirmPassword"
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
                  onClick={() => setShowConfirmPassword(v => !v)}
                  aria-label={showConfirmPassword ? 'Şifreyi gizle' : 'Şifreyi göster'}
                >
                  <i className={`bi ${showConfirmPassword ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                </button>
              </div>
            </div>
            {resetError && <div className="alert alert-danger">{resetError}</div>}
            <button type="submit" className="btn btn-danger w-100" disabled={resetLoading}>
              {resetLoading ? 'Sıfırlanıyor...' : 'Şifreyi Sıfırla'}
            </button>
          </form>
        )}
      </div>
    );
  }

  return (
    <>
      <PageLoadingSpinner show={loading} fullscreen />
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
    </>
  );
}

export default ForgotPasswordPage;
