import React, { useState } from 'react';
import PageLoadingSpinner from '../components/PageLoadingSpinner';

// Single pricing tier
const PRICING = {
  originalPrice: '2.500₺',
  discountedPrice: '2.000₺',
  description: 'Sınırsız Kullanım'
};

function PricingPage() {
  const [loading] = useState(false);

  return (
    <>
      <PageLoadingSpinner show={loading} fullscreen />
      
      {/* Demo GIF fixed to right center, responsive and clickable */}
      <img
        src="/gifs/demo-promotion.gif"
        alt="3 Gün Ücretsiz Deneyin Demo"
        style={{
          position: 'fixed',
          top: '50%',
          right: 0,
          transform: 'translateY(-50%)',
          maxWidth: 448, // 640 * 0.7
          width: '28vw', // 40vw * 0.7
          minWidth: 168, // 240 * 0.7
          height: 'auto',
          margin: 0,
          zIndex: 100,
          pointerEvents: 'auto',
          cursor: 'pointer',
          background: 'transparent',
          boxShadow: 'none',
        }}
        onClick={() => {
          const message = "Merhaba, Katip Otomasyonu için demo talebinde bulunmak istiyorum. Bilgi verebilir misiniz?";
          const phoneNumber = "905015448544";
          const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
          window.open(whatsappUrl, '_blank');
        }}
      />
      
      <div className="container py-5">
        <h2 className="mb-4 text-center">Fiyatlandırma</h2>
        
        {/* Main pricing card */}
        <div className="row justify-content-center mb-4">
          <div className="col-md-5 col-lg-4">
            <div className="card border-0 shadow-lg text-center" style={{
              background: 'linear-gradient(135deg, #fff 0%, #f8f9fa 100%)',
              borderRadius: 20,
              overflow: 'hidden'
            }}>
              <div className="card-header bg-danger text-white py-3" style={{borderRadius: '20px 20px 0 0'}}>
                <h4 className="mb-0 fw-bold">Katip Otomasyonu Lisansı</h4>
                <p className="mb-0 text-white" style={{fontSize: '1rem'}}>
                  <i className="bi bi-box-arrow-up-right me-1" style={{fontSize: '14px'}}></i>
                  <a 
                    href="https://chromewebstore.google.com/detail/fclcdignmmaofcbgmjcdielmohplopem?utm_source=item-share-cb" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-white text-decoration-none"
                    style={{borderBottom: '1px dotted rgba(255,255,255,0.7)', fontSize: '1.2rem', fontWeight: '600'}}
                  >
                    Chrome uzantısı
                  </a> lisans uzatma<br />
                  <span style={{fontSize: '0.85rem'}}>Sınırsız kullanım ile tam kontrol</span>
                </p>
              </div>
              <div className="card-body py-4">
                {/* Limited time pricing notice - business elegant */}
                <div className="mb-3 p-3 rounded-2" style={{
                  background: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)',
                  color: '#1565c0',
                  border: '1px solid #90caf9',
                  position: 'relative',
                  overflow: 'hidden'
                }}>
                  {/* Glowing effect overlay */}
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    left: '-100%',
                    width: '100%',
                    height: '100%',
                    background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.6) 50%, transparent 100%)',
                    animation: 'glowSweep 3s ease-in-out infinite',
                    zIndex: 1
                  }}></div>
                  <div className="text-center" style={{position: 'relative', zIndex: 2}}>
                    <div style={{fontSize: '0.75rem', fontWeight: '500', letterSpacing: '0.5px', opacity: 0.9, marginBottom: '4px'}}>
                      %20 İNDİRİMLİ ÖZEL FİYAT DÖNEMİ
                    </div>
                    <div style={{fontSize: '0.9rem', fontWeight: '600'}}>
                      31 Aralık 2025 tarihine kadar geçerlidir
                    </div>
                  </div>
                </div>
                <style>{`
                  @keyframes glowSweep {
                    0% { left: -100%; }
                    100% { left: 100%; }
                  }
                `}</style>
                <div className="text-danger mb-2" style={{fontSize: '2rem', fontWeight: '600'}}>Aylık Ücret</div>
                
                {/* Pricing with discount */}
                <div className="mb-3">
                  {/* Original price crossed out with discount badge */}
                  <div className="d-flex align-items-center justify-content-center gap-3 mb-2">
                    <div className="text-muted" style={{fontSize: '1.2rem', textDecoration: 'line-through', opacity: 0.7}}>
                      {PRICING.originalPrice}
                    </div>
                    <div className="badge bg-success fs-6 px-3 py-2" style={{
                      borderRadius: '20px',
                      fontWeight: '600',
                      fontSize: '0.9rem !important'
                    }}>
                      20% İNDİRİM
                    </div>
                  </div>
                  
                  {/* Current discounted price */}
                  <div className="d-flex align-items-center justify-content-center gap-3 mb-2">
                    <div className="badge bg-success px-2 py-1" style={{
                      borderRadius: '15px',
                      fontWeight: '600',
                      fontSize: '0.75rem'
                    }}>
                      KDV DAHİL
                    </div>
                    <div className="text-danger" style={{fontSize: '2.5rem', fontWeight: '700'}}>
                      {PRICING.discountedPrice}
                    </div>
                  </div>
                </div>
                <p className="text-muted mb-3" style={{fontSize: '0.9rem'}}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="#fd7e14" viewBox="0 0 16 16" className="me-2">
                    <path d="M8 0a8 8 0 1 0 0 16A8 8 0 0 0 8 0zm0 14.5A6.5 6.5 0 1 1 8 1.5a6.5 6.5 0 0 1 0 13zm0-10a.75.75 0 1 1 0 1.5A.75.75 0 0 1 8 4.5zm1 7.25c0 .414-.336.75-.75.75s-.75-.336-.75-.75V7.75c0-.414.336-.75.75-.75s.75.336.75.75v4z"/>
                  </svg>
                  Satın alımdan itibaren 32 gün kullanım sunar. Süre bitiminde lisansın süresi uzatılmalıdır.
                </p>
                <div className="list-unstyled text-start">
                  <div className="d-flex align-items-center mb-2" style={{fontSize: '0.9rem'}}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="#198754" viewBox="0 0 16 16" className="me-3">
                      <path d="M10.97 4.97a.75.75 0 0 1 1.07 1.05l-3.99 4.99a.75.75 0 0 1-1.08.02L4.324 8.384a.75.75 0 1 1 1.06-1.06l2.094 2.093 3.473-4.425a.267.267 0 0 1 .02-.022z"/>
                    </svg>
                    <span>Tek tuşla sözleşme güncellemeleri</span>
                  </div>
                  <div className="d-flex align-items-center mb-2" style={{fontSize: '0.9rem'}}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="#198754" viewBox="0 0 16 16" className="me-3">
                      <path d="M10.97 4.97a.75.75 0 0 1 1.07 1.05l-3.99 4.99a.75.75 0 0 1-1.08.02L4.324 8.384a.75.75 0 1 1 1.06-1.06l2.094 2.093 3.473-4.425a.267.267 0 0 1 .02-.022z"/>
                    </svg>
                    <span>Asgari süre kontrolü ve otomatik güncelleme</span>
                  </div>
                  <div className="d-flex align-items-center mb-2" style={{fontSize: '0.9rem'}}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="#198754" viewBox="0 0 16 16" className="me-3">
                      <path d="M10.97 4.97a.75.75 0 0 1 1.07 1.05l-3.99 4.99a.75.75 0 0 1-1.08.02L4.324 8.384a.75.75 0 1 1 1.06-1.06l2.094 2.093 3.473-4.425a.267.267 0 0 1 .02-.022z"/>
                    </svg>
                    <span>Personel dakika takibi ve Excel raporu</span>
                  </div>
                  <div className="d-flex align-items-center mb-2" style={{fontSize: '0.9rem'}}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="#198754" viewBox="0 0 16 16" className="me-3">
                      <path d="M10.97 4.97a.75.75 0 0 1 1.07 1.05l-3.99 4.99a.75.75 0 0 1-1.08.02L4.324 8.384a.75.75 0 1 1 1.06-1.06l2.094 2.093 3.473-4.425a.267.267 0 0 1 .02-.022z"/>
                    </svg>
                    <span>Renklendirilmiş durum takibi ve raporlama</span>
                  </div>
                  <div className="d-flex align-items-center" style={{fontSize: '0.9rem'}}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="#198754" viewBox="0 0 16 16" className="me-3">
                      <path d="M10.97 4.97a.75.75 0 0 1 1.07 1.05l-3.99 4.99a.75.75 0 0 1-1.08.02L4.324 8.384a.75.75 0 1 1 1.06-1.06l2.094 2.093 3.473-4.425a.267.267 0 0 1 .02-.022z"/>
                    </svg>
                    <span>Hızlı ve çoklu şekilde atama yapabilme</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="alert alert-info text-center my-3" style={{background: '#e7f1ff', color: '#084298', borderColor: '#b6d4fe'}}>
          Demo paketi 7 gün boyunca ücretsizdir. Demo süresi sona erdikten sonra, lisansınızın süresini sitemize kayıt olarak uzatabilirsiniz.
        </div>
        <div className="alert alert-warning mt-4 text-center" style={{background: '#fffbe6', color: '#664d03', borderColor: '#ffe066'}}>
          <b>Aylık lisans:</b> Satın alımdan itibaren 32 gün kullanım sunar. Süre bitiminde lisansın süresi uzatılmalıdır.
        </div>
        
        {/* Payment logos section for iyzico requirements */}
        <div className="text-center mt-4 mb-4">
          <div className="p-4 rounded-3" style={{
            backgroundColor: '#f8f9fa',
            border: '1px solid #e9ecef',
            maxWidth: '500px',
            margin: '0 auto'
          }}>
            <div className="d-flex justify-content-center align-items-center gap-4 flex-wrap">
              <img 
                src="/iyzico-logo.svg" 
                alt="iyzico ile öde" 
                style={{height: '40px', maxWidth: '120px', objectFit: 'contain'}}
              />
              <img 
                src="/mc_symbol.svg" 
                alt="MasterCard" 
                style={{height: '30px', maxWidth: '50px', objectFit: 'contain'}}
              />
              <img 
                src="/Visa_Blue.png" 
                alt="Visa" 
                style={{height: '30px', maxWidth: '80px', objectFit: 'contain'}}
              />
            </div>
            <div className="text-muted small mt-2" style={{fontSize: '0.8rem'}}>
              Güvenli ödeme altyapısı
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default PricingPage;
