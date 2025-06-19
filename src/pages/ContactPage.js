import React, { useState } from 'react';

function ContactPage() {
  const [submitted, setSubmitted] = useState(false);

  return (
    <div className="container py-5" style={{ maxWidth: 500 }}>
      <h2 className="mb-4">İletişim</h2>
      {submitted ? (
        <div className="alert alert-success" role="alert">
          Mesajınız başarıyla gönderildi. En kısa sürede sizinle iletişime geçeceğiz.
        </div>
      ) : (
        <form
          action="https://formspree.io/f/xwpbnejl"
          method="POST"
          onSubmit={() => setSubmitted(true)}
        >
          <div className="mb-3">
            <label htmlFor="name" className="form-label">Adınız Soyadınız</label>
            <input type="text" className="form-control" id="name" name="name" required />
          </div>
          <div className="mb-3">
            <label htmlFor="email" className="form-label">E-posta Adresiniz</label>
            <input type="email" className="form-control" id="email" name="email" required />
          </div>
          <div className="mb-3">
            <label htmlFor="message" className="form-label">Mesajınız</label>
            <textarea className="form-control" id="message" name="message" rows="5" required></textarea>
          </div>
          <button type="submit" className="btn btn-danger w-100">Gönder</button>
        </form>
      )}
      <p className="mt-4 text-muted small">
        <a href="mailto:info@katipotomasyonu.com" className="text-danger text-decoration-none d-inline-flex align-items-center gap-1">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 16 16" style={{marginRight: 4}}>
            <path d="M0 4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V4zm2-1a1 1 0 0 0-1 1v.217l7 4.2 7-4.2V4a1 1 0 0 0-1-1H2zm13 2.383-4.708 2.825L15 11.118V5.383zM14.803 12 10.2 8.911l-1.428.857a.5.5 0 0 1-.544 0L6.8 8.911 2.197 12A1 1 0 0 0 3 13h10a1 1 0 0 0 .803-1zM1 11.118l4.708-2.91L1 5.383v5.735z"/>
          </svg>
          info@katipotomasyonu.com adresine e-posta gönderebilirsiniz.
        </a>
      </p>
    </div>
  );
}

export default ContactPage;
