import React, { useState } from 'react';
import PageLoadingSpinner from '../components/PageLoadingSpinner';


function HomePage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [modalImg, setModalImg] = useState(null);
  const [modalAlt, setModalAlt] = useState('');
  const [hovered, setHovered] = useState('');
  const [loading] = useState(false); // Remove setLoading

  const openModal = (src, alt) => {
    setModalImg(src);
    setModalAlt(alt);
    setModalOpen(true);
  };
  const closeModal = () => setModalOpen(false);

  return (
    <>
      <PageLoadingSpinner show={loading} fullscreen />
      <div className="filigran-bg position-relative">
        {/* GIF fixed to right center, 30% smaller than before, now clickable */}
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
        {/* Centered intro section with h2 restored */}
        <section className="text-center mb-5" style={{ marginTop: '2.5rem' }}>
          <h2 className="mb-4">Katip Otomasyonu Nedir?</h2>
          <div style={{ 
            maxWidth: '650px', 
            margin: '0 auto',
            background: 'rgba(255, 235, 238, 0.7)',
            borderRadius: '12px',
            border: '1px solid rgba(255, 193, 207, 0.6)',
            padding: '20px',
            backdropFilter: 'blur(4px)'
          }}>
            <p className="lead mb-4">
              Katip Otomasyonu, İSG Katip platformunda sözleşme güncellemelerini ve yönetimini otomatikleştiren, güvenli ve hızlı bir Chrome eklentisidir. Tüm işlemlerinizde zaman kazanın ve hatasız yönetim sağlayın.
            </p>
          </div>
        </section>
        
        {/* Google Security Badge */}
        <section className="text-center mb-5">
          <div className="d-flex justify-content-center align-items-center flex-wrap gap-4 p-3" style={{
            background: 'rgba(248, 249, 250, 0.7)',
            borderRadius: '12px',
            border: '1px solid rgba(222, 226, 230, 0.6)',
            maxWidth: '600px',
            margin: '0 auto',
            boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
            backdropFilter: 'blur(4px)'
          }}>
            <div className="d-flex flex-column align-items-center gap-2">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              <span className="fw-bold text-dark">Google</span>
              <span className="text-dark small">tarafından onaylanmış ve düzenli olarak güvenlik denetimlerinden geçiyor</span>
            </div>
            <div className="d-flex flex-column align-items-center gap-2">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="#28a745" strokeWidth="2" fill="#e8f5e8"/>
                <path d="m9 12 2 2 4-4" stroke="#28a745" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span className="fw-bold text-dark">Güvenlik</span>
              <span className="text-dark small text-center">Verileriniz %100 güvende</span>
            </div>
          </div>
        </section>

        {/* Centered slogans */}
        <section className="d-flex justify-content-center align-items-center flex-column mb-5">
          <ul className="list-group mb-0 mx-auto feature-list-animated" style={{ maxWidth: 400, textAlign: 'center' }}>
            <li className="list-group-item feature-bounce" style={{ animationDelay: '0.1s' }}>7 gün ücretsiz deneyin!</li>
            <li className="list-group-item feature-bounce" style={{ animationDelay: '0.3s' }}>Tek tıkla güncellenmesi gereken sözleşmeleri güncelleyin</li>
            <li className="list-group-item feature-bounce" style={{ animationDelay: '0.5s' }}>Tek tıkla asgari süreden fazla atanan sözleşmeleri güncelleyin</li>
            <li className="list-group-item feature-bounce" style={{ animationDelay: '0.7s' }}>Güncel personel dakikalarınızı; devam eden, onay bekleyen, blokeli olan ve atanabilir dakikaları personel bazında; Uzman, Hekim, ve Diğer Sağlık Personeli başlıkları halinde raporları görüntüleyip Excel olarak indirin</li>
            <li className="list-group-item feature-bounce" style={{ animationDelay: '0.9s' }}>Tüm firmalarınızın atama, işyeri onayı ve İSG profesyoneli onay durumlarını renklendirilmiş Excel formatındaki raporu tek tıkla oluşturup, firma bazında kolayca takip edin</li>
          </ul>
        </section>
        <section>
          <h2 className="mb-3 text-center">Ekran Görüntüleri</h2>
          <div className="row justify-content-center g-3">
            <div className="col-12 col-lg-4 col-md-6 text-center position-relative">
              <div
                style={{ position: 'relative', display: 'inline-block', width: '100%', maxWidth: 400 }}
                onMouseEnter={() => setHovered('chrome')}
                onMouseLeave={() => setHovered('')}
              >
                <img
                  src="/screenshots/chrome-extension-store-view.png"
                  alt="Chrome Web Mağazası Görünümü"
                  style={{ width: '100%', borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.08)', cursor: 'pointer' }}
                  onClick={() => openModal('/screenshots/chrome-extension-store-view.png', 'Chrome Web Mağazası Görünümü')}
                />
                {hovered === 'chrome' && (
                  <span style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    background: 'rgba(0,0,0,0.5)',
                    borderRadius: '50%',
                    padding: 16,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    pointerEvents: 'none',
                  }}>
                    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                  </span>
                )}
              </div>
              <div className="small mt-2">Chrome Web Mağazası Görünümü</div>
            </div>
            <div className="col-12 col-lg-4 col-md-6 text-center position-relative">
              <div
                style={{ position: 'relative', display: 'inline-block', width: '100%', maxWidth: 400 }}
                onMouseEnter={() => setHovered('main')}
                onMouseLeave={() => setHovered('')}
              >
                <img
                  src="/screenshots/extension-main-page.png"
                  alt="Eklenti Lisans Girme Ekranı"
                  style={{ width: '100%', borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.08)', cursor: 'pointer' }}
                  onClick={() => openModal('/screenshots/extension-main-page.png', 'Eklenti Lisans Girme Ekranı')}
                />
                {hovered === 'main' && (
                  <span style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    background: 'rgba(0,0,0,0.5)',
                    borderRadius: '50%',
                    padding: 16,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    pointerEvents: 'none',
                  }}>
                    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                  </span>
                )}
              </div>
              <div className="small mt-2">Eklenti Lisans Girme Ekranı</div>
            </div>
            <div className="col-12 col-lg-4 col-md-6 text-center position-relative">
              <div
                style={{ position: 'relative', display: 'inline-block', width: '100%', maxWidth: 400 }}
                onMouseEnter={() => setHovered('main2')}
                onMouseLeave={() => setHovered('')}
              >
                <img
                  src="/screenshots/extension-main-page-2.png"
                  alt="Eklenti Ana Sayfa Görünümü"
                  style={{ width: '100%', borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.08)', cursor: 'pointer' }}
                  onClick={() => openModal('/screenshots/extension-main-page-2.png', 'Eklenti Ana Sayfa Görünümü')}
                />
                {hovered === 'main2' && (
                  <span style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    background: 'rgba(0,0,0,0.5)',
                    borderRadius: '50%',
                    padding: 16,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    pointerEvents: 'none',
                  }}>
                    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                  </span>
                )}
              </div>
              <div className="small mt-2">Eklenti Ana Sayfa Görünümü</div>
            </div>
          </div>
        </section>
        {modalOpen && (
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100vw',
              height: '100vh',
              background: 'rgba(0,0,0,0.85)',
              zIndex: 1050,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            onClick={closeModal}
          >
            <img
              src={modalImg}
              alt={modalAlt}
              style={{
                maxWidth: '90vw',
                maxHeight: '90vh',
                borderRadius: 12,
                boxShadow: '0 4px 32px rgba(0,0,0,0.25)',
                background: '#fff',
                padding: 8,
              }}
              onClick={e => e.stopPropagation()}
            />
            <button
              onClick={closeModal}
              style={{
                position: 'fixed',
                top: 24,
                right: 32,
                fontSize: 32,
                color: '#fff',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                zIndex: 1100,
              }}
              aria-label="Kapat"
            >
              &times;
            </button>
          </div>
        )}
      </div>
    </>
  );
}

export default HomePage;
