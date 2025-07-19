import React, { useState } from 'react';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || '';
const ADMIN_API_KEY = process.env.REACT_APP_ADMIN_API_KEY || '';

export default function AdminForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');
    try {
      const res = await fetch(`${API_BASE_URL}/admin/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-api-key': ADMIN_API_KEY,
        },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage('Şifre sıfırlama bağlantısı e-posta adresinize gönderildi.');
      } else {
        setError(data.error || 'İşlem başarısız.');
      }
    } catch (err) {
      setError('Sunucuya ulaşılamadı.');
    }
    setLoading(false);
  };

  return (
    <div className="container py-5" style={{ maxWidth: 400 }}>
      <h2 className="mb-4">Admin Şifre Sıfırlama</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="form-label">E-posta</label>
          <input type="email" className="form-control" value={email} onChange={e => setEmail(e.target.value)} required />
        </div>
        {error && <div className="alert alert-danger py-2">{error}</div>}
        {message && <div className="alert alert-success py-2">{message}</div>}
        <button className="btn btn-danger w-100" type="submit" disabled={loading}>{loading ? 'Gönderiliyor...' : 'Sıfırlama Bağlantısı Gönder'}</button>
      </form>
      <div className="mt-3 text-center">
        <a href="/admin/login">Girişe Dön</a>
      </div>
    </div>
  );
}
