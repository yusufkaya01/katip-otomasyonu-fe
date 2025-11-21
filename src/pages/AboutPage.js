import React, { useState } from 'react';
import PageLoadingSpinner from '../components/PageLoadingSpinner';

function AboutPage() {
  const [loading] = useState(false); // Remove setLoading

  return (
    <>
      <PageLoadingSpinner show={loading} fullscreen />
      <div className="container py-5">
        <h2 className="mb-4">Hakkımızda</h2>
        <p>
          <b>Katip Otomasyonu</b>, Arkaya Arge Yazılım İnşaat Ticaret Ltd.Şti. tarafından Isparta'da kurulmuş ve geliştirilmektedir. Şirketimiz, iş sağlığı ve güvenliği alanında dijitalleşmeyi ve otomasyonu destekleyen yenilikçi SaaS (Software as a Service) çözümler üretmeye odaklanmıştır.
        </p>
        <p>
          Amacımız, İSG-Katip kullanıcılarının iş süreçlerini kolaylaştırmak, zamandan tasarruf etmelerini sağlamak ve mevzuata tam uyumlu, güvenli, hızlı ve kullanıcı dostu yazılımlar sunmaktır. Katip Otomasyonu, işyeri hekimi, iş güvenliği uzmanı ve diğer sağlık personeli atamaları, sözleşme yönetimi ve raporlama gibi süreçleri otomatikleştirerek kurumların verimliliğini artırır.
        </p>
        <div className="row g-4 mb-4 justify-content-center">
          <div className="col-md-6">
            <div className="card h-100 shadow-sm">
              <div className="card-body d-flex flex-column align-items-center text-center">
                <img src="/yusuf_kaya.png" alt="Yusuf Kaya" className="rounded-circle mb-3" style={{ width: 80, height: 80, objectFit: 'cover' }} />
                <h5 className="card-title mb-1">Yusuf Kaya</h5>
                <p className="mb-1">Founder | DevOps & Cloud Engineer</p>
                <div className="d-flex justify-content-center align-items-center gap-3 mb-2">
                  <a href="https://www.linkedin.com/in/yusufkayatr96/" target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center' }}>
                    <img src="https://upload.wikimedia.org/wikipedia/commons/8/81/LinkedIn_icon.svg" alt="LinkedIn" style={{ width: 32, height: 32, display: 'block' }} />
                  </a>
                  <a href="https://medium.com/@yusufkayatr96" target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center' }}>
                    <img src="https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/medium.svg" alt="Medium" style={{ width: 32, height: 32, background: '#fff', borderRadius: '50%', padding: 2, display: 'block' }} />
                  </a>
                  <a href="mailto:yusuf@katipotomasyonu.com" target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center' }}>
                    <i className="bi bi-envelope-fill" style={{ fontSize: 32, color: '#0d6efd', verticalAlign: 'middle', display: 'block' }}></i>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="row g-4 justify-content-center">
          <div className="col-md-6">
            <div className="mt-4 p-3 rounded-3" style={{
              background: 'linear-gradient(135deg, #dc3545 0%, #c82333 100%)',
              boxShadow: '0 4px 15px rgba(220, 53, 69, 0.3)'
            }}>
              <p className="mb-0 text-white d-flex align-items-center justify-content-center gap-2" style={{fontSize: '0.95rem', fontWeight: '500'}}>
                <a href="mailto:info@katipotomasyonu.com" className="text-white text-decoration-none" title="E-posta gönder">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16" style={{cursor: 'pointer'}}>
                    <path d="M0 4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V4zm2-1a1 1 0 0 0-1 1v.217l7 4.2 7-4.2V4a1 1 0 0 0-1-1H2zm13 2.383-4.708 2.825L15 11.118V5.383zM14.803 12 10.2 8.911l-1.428.857a.5.5 0 0 1-.544 0L6.8 8.911 2.197 12A1 1 0 0 0 3 13h10a1 1 0 0 0 .803-1zM1 11.118l4.708-2.91L1 5.383v5.735z"/>
                  </svg>
                </a>
                <span>
                  Genel destek için: <strong>info@katipotomasyonu.com</strong>
                </span>
              </p>
            </div>
          </div>
        </div>
        <div className="row g-4 justify-content-center mt-4">
          <div className="col-12 col-md-8 col-lg-6 text-center">
            <a href="https://arkaya.com.tr" target="_blank" rel="noopener noreferrer">
              <img 
                src="/arkaya-logo.png" 
                alt="Arkaya Arge Yazılım" 
                className="img-fluid"
                style={{ 
                  maxWidth: '100%',
                  width: '600px',
                  height: 'auto', 
                  cursor: 'pointer',
                  transition: 'opacity 0.3s ease',
                  opacity: 0.8
                }}
                onMouseEnter={(e) => e.target.style.opacity = 1}
                onMouseLeave={(e) => e.target.style.opacity = 0.8}
              />
            </a>
          </div>
        </div>
      </div>
    </>
  );
}

export default AboutPage;
