import React, { useState } from 'react';
import PageLoadingSpinner from '../components/PageLoadingSpinner';

function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const form = e.target;
    const data = new FormData(form);
    try {
      const res = await fetch('https://formspree.io/f/xwpbnejl', {
        method: 'POST',
        body: data,
        headers: {
          Accept: 'application/json',
        },
      });
      if (res.ok) {
        setSubmitted(true);
      } else {
        setError('Mesaj gönderilemedi. Lütfen tekrar deneyin.');
      }
    } catch {
      setError('Sunucuya ulaşılamıyor. Lütfen tekrar deneyin.');
    }
    setLoading(false);
  };

  return (
    <>
      <PageLoadingSpinner show={loading} fullscreen />
      <div className="container py-5">
        <h2 className="mb-4 text-center">İletişim</h2>
        <div className="row justify-content-center">
          <div className="col-md-7">
            <div className="p-4 rounded-3 mb-4" style={{ background: '#fff0f3', boxShadow: '0 2px 12px rgba(220,53,69,0.04)' }}>
              {submitted ? (
                <div className="alert alert-success" role="alert">
                  Mesajınız başarıyla gönderildi. En kısa sürede sizinle iletişime geçeceğiz.
                </div>
              ) : (
                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label htmlFor="name" className="form-label">Adınız Soyadınız</label>
                    <input type="text" className="form-control" id="name" name="name" required style={{ background: '#fff' }} />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="company" className="form-label">Şirket İsmi</label>
                    <input type="text" className="form-control" id="company" name="company" required style={{ background: '#fff' }} />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="email" className="form-label">E-posta Adresiniz</label>
                    <input type="email" className="form-control" id="email" name="email" required style={{ background: '#fff' }} />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="topic" className="form-label">Konu</label>
                    <select className="form-control" id="topic" name="topic" required style={{ background: '#fff' }}>
                      <option value="">Konu seçiniz</option>
                      <option value="Lisans">Lisans</option>
                      <option value="Google Chrome Eklentisi">Google Chrome Eklentisi</option>
                      <option value="Teknik Destek">Teknik Destek</option>
                      <option value="Diğer">Diğer</option>
                    </select>
                  </div>
                  <div className="mb-3">
                    <label htmlFor="message" className="form-label">Mesajınız</label>
                    <textarea className="form-control" id="message" name="message" rows="5" required style={{ background: '#fff' }}></textarea>
                  </div>
                  {error && <div className="alert alert-danger py-2">{error}</div>}
                  <button type="submit" className="btn btn-danger w-100" disabled={loading}>
                    {loading ? 'Gönderiliyor...' : 'Gönder'}
                  </button>
                </form>
              )}
            </div>
            <p className="mt-4 text-muted small">
              <a href="mailto:info@katipotomasyonu.com" className="text-danger text-decoration-none d-inline-flex align-items-center gap-1">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 16 16" style={{marginRight: 4}}>
                  <path d="M0 4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V4zm2-1a1 1 0 0 0-1 1v.217l7 4.2 7-4.2V4a1 1 0 0 0-1-1H2zm13 2.383-4.708 2.825L15 11.118V5.383zM14.803 12 10.2 8.911l-1.428.857a.5.5 0 0 1-.544 0L6.8 8.911 2.197 12A1 1 0 0 0 3 13h10a1 1 0 0 0 .803-1zM1 11.118l4.708-2.91L1 5.383v5.735z"/>
                </svg>
                info@katipotomasyonu.com adresine e-posta gönderebilirsiniz.
              </a>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

export default ContactPage;
