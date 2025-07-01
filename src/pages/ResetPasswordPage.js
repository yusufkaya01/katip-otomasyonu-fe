import React, { useState } from 'react';

function ResetPasswordPage() {
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://customers.katipotomasyonu.com/api';
  const ENVIRONMENT = process.env.REACT_APP_ENVIRONMENT || 'production';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);
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
        setSuccess(true);
      } else {
        const data = await res.json();
        setError(data.error || 'Şifre sıfırlanamadı. Token geçersiz veya süresi dolmuş olabilir.');
      }
    } catch (err) {
      setError('Sunucuya ulaşılamadı. Lütfen tekrar deneyin.');
    }
    setLoading(false);
  };

  return (
    <div className="container py-5" style={{ maxWidth: 400 }}>
      <h2 className="mb-4">Şifre Sıfırla</h2>
      {success ? (
        <div className="alert alert-success">Şifreniz başarıyla güncellendi. Artık yeni şifrenizle giriş yapabilirsiniz.</div>
      ) : (
        <form onSubmit={handleSubmit}>
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
          {error && <div className="alert alert-danger py-2">{error}</div>}
          <button type="submit" className="btn btn-danger w-100" disabled={loading}>
            {loading ? 'Sıfırlanıyor...' : 'Şifreyi Sıfırla'}
          </button>
        </form>
      )}
    </div>
  );
}

export default ResetPasswordPage;
