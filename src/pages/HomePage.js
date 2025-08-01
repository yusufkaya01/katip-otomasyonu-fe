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
            const phoneNumber = "905555555555"; // Replace with actual WhatsApp number
            const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
            window.open(whatsappUrl, '_blank');
          }}
        />
        {/* Centered intro section with h2 restored */}
        <section className="text-center mb-5" style={{ marginTop: '2.5rem' }}>
          <h2 className="mb-4">Katip Otomasyonu Nedir?</h2>
          <p className="lead mb-4">
            Katip Otomasyonu, İSG Katip platformunda sözleşme güncellemelerini ve yönetimini otomatikleştiren, güvenli ve hızlı bir Chrome eklentisidir. Tüm işlemlerinizde zaman kazanın ve hatasız yönetim sağlayın.
          </p>
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
