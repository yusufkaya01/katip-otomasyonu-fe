import React, { useState } from 'react';
import PageLoadingSpinner from '../components/PageLoadingSpinner';

// Pricing options for both monthly and yearly
const PRICING = {
  monthly: {
    price: '2000₺',
    description: 'Aylık Lisans',
    days: 32,
    popular: false
  },
  yearly: {
    originalPrice: '24000₺',
    discountedPrice: '16000₺',
    description: 'Yıllık Lisans',
    days: 366,
    popular: true,
    discount: '34'
  }
};

function PricingPage() {
  const [loading] = useState(false);

  // Feature list component
  const renderFeatureList = () => (
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
      <div className="d-flex align-items-center mb-2" style={{fontSize: '0.9rem'}}>
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="#198754" viewBox="0 0 16 16" className="me-3">
          <path d="M10.97 4.97a.75.75 0 0 1 1.07 1.05l-3.99 4.99a.75.75 0 0 1-1.08.02L4.324 8.384a.75.75 0 1 1 1.06-1.06l2.094 2.093 3.473-4.425a.267.267 0 0 1 .02-.022z"/>
        </svg>
        <span>Hızlı ve çoklu şekilde atama yapabilme</span>
      </div>
      <div className="d-flex align-items-center mb-2" style={{fontSize: '0.9rem'}}>
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="#198754" viewBox="0 0 16 16" className="me-3">
          <path d="M10.97 4.97a.75.75 0 0 1 1.07 1.05l-3.99 4.99a.75.75 0 0 1-1.08.02L4.324 8.384a.75.75 0 1 1 1.06-1.06l2.094 2.093 3.473-4.425a.267.267 0 0 1 .02-.022z"/>
        </svg>
        <span>Onaylanmadığı için düşen atamaları görüntüleme</span>
      </div>
      <div className="d-flex align-items-center" style={{fontSize: '0.9rem'}}>
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="#198754" viewBox="0 0 16 16" className="me-3">
          <path d="M10.97 4.97a.75.75 0 0 1 1.07 1.05l-3.99 4.99a.75.75 0 0 1-1.08.02L4.324 8.384a.75.75 0 1 1 1.06-1.06l2.094 2.093 3.473-4.425a.267.267 0 0 1 .02-.022z"/>
        </svg>
        <span>Çoklu hizmet sözleşmesi indirme</span>
      </div>
    </div>
  );

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
        
        {/* License type selection notice */}
        <div className="alert alert-info text-center mb-4" style={{background: '#e7f1ff', color: '#084298', borderColor: '#b6d4fe'}}>
          <strong>İki farklı lisans seçeneği:</strong> Aylık veya yıllık lisans seçebilirsiniz. Yıllık lisansta taksit imkanı vardır.
        </div>
        
        {/* Pricing cards */}
        <div className="row justify-content-center mb-4">
          {/* Monthly Plan */}
          <div className="col-md-5 col-lg-4 mb-4">
            <div className="card border-0 shadow text-center" style={{
              background: 'linear-gradient(135deg, #fff 0%, #f8f9fa 100%)',
              borderRadius: 20,
              overflow: 'hidden'
            }}>
              <div className="card-header bg-primary text-white py-3" style={{borderRadius: '20px 20px 0 0'}}>
                <h4 className="mb-0 fw-bold">{PRICING.monthly.description}</h4>
                <p className="mb-0 text-white" style={{fontSize: '0.9rem'}}>
                  {PRICING.monthly.days} gün kullanım
                </p>
              </div>
              <div className="card-body py-4">
                <div className="mb-3">
                  <div className="d-flex align-items-center justify-content-center gap-3 mb-2">
                    <div className="badge bg-success px-2 py-1" style={{
                      borderRadius: '15px',
                      fontWeight: '600',
                      fontSize: '0.75rem'
                    }}>
                      KDV DAHİL
                    </div>
                    <div className="text-primary" style={{fontSize: '2.5rem', fontWeight: '700'}}>
                      {PRICING.monthly.price}
                    </div>
                  </div>
                </div>
                <p className="text-muted mb-3" style={{fontSize: '0.9rem'}}>
                  32 günlük lisans
                </p>
                {renderFeatureList()}
              </div>
            </div>
          </div>

          {/* Yearly Plan */}
          <div className="col-md-5 col-lg-4 mb-4">
            <div className="card border-0 shadow text-center position-relative" style={{
              background: 'linear-gradient(135deg, #fff 0%, #f8f9fa 100%)',
              borderRadius: 20,
              overflow: 'hidden',
              border: '3px solid #dc3545'
            }}>
              {/* Popular badge */}
              <div className="position-absolute top-0 end-0 bg-danger text-white px-3 py-1" style={{
                borderRadius: '0 20px 0 15px',
                fontSize: '0.8rem',
                fontWeight: 'bold',
                zIndex: 1
              }}>
                EN POPÜLER
              </div>
              
              <div className="card-header bg-danger text-white py-3" style={{borderRadius: '20px 20px 0 0'}}>
                <h4 className="mb-0 fw-bold">{PRICING.yearly.description}</h4>
                <p className="mb-0 text-white" style={{fontSize: '0.9rem'}}>
                  {PRICING.yearly.days} gün kullanım
                </p>
              </div>
              <div className="card-body py-4">
                <div className="mb-3">
                  <div className="d-flex align-items-center justify-content-center gap-3 mb-2">
                    <div className="text-muted" style={{
                      fontSize: '1.5rem',
                      textDecoration: 'line-through',
                      fontWeight: '500'
                    }}>
                      24000₺
                    </div>
                  </div>
                  <div className="d-flex align-items-center justify-content-center gap-3 mb-2">
                    <div className="badge bg-success fs-6 px-3 py-2" style={{
                      borderRadius: '20px',
                      fontWeight: '600',
                      fontSize: '0.9rem !important'
                    }}>
                      %34 İNDİRİM
                    </div>
                  </div>
                  <div className="d-flex align-items-center justify-content-center gap-3 mb-2">
                    <div className="badge bg-success px-2 py-1" style={{
                      borderRadius: '15px',
                      fontWeight: '600',
                      fontSize: '0.75rem'
                    }}>
                      KDV DAHİL
                    </div>
                    <div className="text-danger" style={{fontSize: '2.5rem', fontWeight: '700'}}>
                      {PRICING.yearly.discountedPrice}
                    </div>
                  </div>
                </div>
                
                <p className="text-muted mb-3" style={{fontSize: '0.9rem'}}>
                  <span className="text-success fw-bold">6'ya varan taksit seçeneği</span><br />
                  366 günlük lisans
                </p>
                {renderFeatureList()}
              </div>
            </div>
          </div>
        </div>
        
        {/* Information sections */}
        <div className="alert alert-info text-center my-3" style={{background: '#e7f1ff', color: '#084298', borderColor: '#b6d4fe'}}>
          Demo paketi 7 gün boyunca ücretsizdir. Demo süresi sona erdikten sonra, lisansınızın süresini sitemize kayıt olarak uzatabilirsiniz.
        </div>
        
        <div className="alert alert-warning mt-4 text-center" style={{background: '#fffbe6', color: '#664d03', borderColor: '#ffe066'}}>
          <div className="row">
            <div className="col-md-6">
              <b>Aylık lisans:</b> Satın alımdan itibaren 32 gün kullanım sunar.
            </div>
            <div className="col-md-6">
              <b>Yıllık lisans:</b> Satın alımdan itibaren 366 gün kullanım sunar.
            </div>
          </div>
          <small className="d-block mt-2">Süre bitiminde lisansın süresi uzatılmalıdır.</small>
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
