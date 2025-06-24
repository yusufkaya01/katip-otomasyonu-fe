import React, { useState } from 'react';
import { Link } from 'react-router-dom';

function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

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
