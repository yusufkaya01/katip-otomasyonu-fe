import React, { useEffect, useRef, useState } from 'react';
import PageLoadingSpinner from '../components/PageLoadingSpinner';


function HomePage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [modalImg, setModalImg] = useState(null);
  const [modalAlt, setModalAlt] = useState('');
  const [hovered, setHovered] = useState('');
  const [loading] = useState(false); // Remove setLoading
  const [references, setReferences] = useState([]);
  const [slideIndex, setSlideIndex] = useState(0);
  const trackRef = useRef(null);
  const [enableTransition, setEnableTransition] = useState(true);

  // Load references from optional manifest; fallback to known files
  useEffect(() => {
    let cancelled = false;
    const toBasename = (path) => {
      try {
        const q = path.split('?')[0].split('#')[0];
        return q.substring(q.lastIndexOf('/') + 1);
      } catch (_) { return path; }
    };
    const stripExt = (name) => name.replace(/\.[^.]+$/, '');
    const encodeRefUrl = (path) => {
      if (!path) return path;
      // ensure path starts with /references/
      let p = path.startsWith('/references/') ? path : `/references/${path.replace(/^\/?references\//, '')}`;
      const parts = p.split('/');
      const file = parts.pop();
      const isEncoded = (s) => {
        try { return s !== decodeURIComponent(s); } catch (_) { return true; }
      };
      const safeFile = isEncoded(file) ? file : encodeURIComponent(file);
      return `${parts.join('/')}/${safeFile}`;
    };
    const parseFromUrl = (url) => {
      const base = decodeURIComponent(toBasename(url));
      const noExt = stripExt(base);
      const idx = noExt.indexOf('_');
      let city = '';
      let company = noExt;
      if (idx > -1) {
        city = noExt.slice(0, idx);
        company = noExt.slice(idx + 1);
      }
      return { url, city, name: company };
    };
    const normalizeList = (list) => {
      return list.map((f) => {
        if (typeof f === 'string') {
          const url = encodeRefUrl(f);
          return parseFromUrl(url);
        }
        if (f && typeof f === 'object') {
          const raw = f.url ? f.url : (f.file ? f.file : '');
          const url = encodeRefUrl(raw);
          if (!url) return null;
          const parsed = parseFromUrl(url);
          return {
            url,
            city: f.city || parsed.city,
            name: f.name || f.company || parsed.name,
          };
        }
        return null;
      }).filter(Boolean);
    };
    // Shuffle function to randomize array order
    const shuffle = (array) => {
      const shuffled = [...array];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      return shuffled;
    };
  async function load() {
      try {
        const res = await fetch('/references/manifest.json', { cache: 'no-cache' });
        if (res.ok) {
          const list = await res.json();
          if (!cancelled && Array.isArray(list) && list.length > 0) {
            // Only shuffle if we don't have references yet (initial load)
            const normalized = normalizeList(list);
            setReferences(prev => prev.length === 0 ? shuffle(normalized) : prev); 
            return;
          }
        }
      } catch (_) { /* ignore */ }
      if (!cancelled) {
        // No hardcoded fallback - only show references from manifest.json
        setReferences(prev => prev.length === 0 ? [] : prev);
      }
    }
  load();
  // in dev, poll for updates every 5s to catch new files
  const dev = !process.env.NODE_ENV || process.env.NODE_ENV === 'development';
  const pollId = dev ? setInterval(() => load(), 5000) : null;
  return () => { cancelled = true; if (pollId) clearInterval(pollId); };
  }, []);

  // Auto-slide every 1.5s. Show 3 at once, move by one.
  useEffect(() => {
    if (!references || references.length === 0) return;
    const id = setInterval(() => {
      setEnableTransition(true);
      setSlideIndex((prev) => prev + 1);
    }, 1500);
    return () => clearInterval(id);
  }, [references]);

  // Seamless loop: when we reach the cloned tail, jump back without transition
  useEffect(() => {
    if (!references || references.length === 0) return;
    const total = references.length;
    if (slideIndex >= total) {
      // after transition ends, disable transition and reset index
      const t = setTimeout(() => {
        setEnableTransition(false);
        setSlideIndex(0);
      }, 350);
      return () => clearTimeout(t);
    }
  }, [slideIndex, references]);

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
        
        {/* Centered slogans */}
        <section className="d-flex justify-content-center align-items-center flex-column mb-5">
          <ul className="list-group mb-0 mx-auto feature-list-animated" style={{ maxWidth: 400, textAlign: 'center' }}>
            <li className="list-group-item feature-bounce" style={{ animationDelay: '0.1s' }}>7 gün ücretsiz deneyin!</li>
            <li className="list-group-item feature-bounce" style={{ animationDelay: '0.3s' }}>Tek tıkla güncellenmesi gereken sözleşmeleri güncelleyin</li>
            <li className="list-group-item feature-bounce" style={{ animationDelay: '0.5s' }}>Tek tıkla asgari süreden fazla atanan sözleşmeleri güncelleyin</li>
            <li className="list-group-item feature-bounce" style={{ animationDelay: '0.7s' }}>Güncel personel dakikalarınızı; devam eden, onay bekleyen, blokeli olan ve atanabilir dakikaları personel bazında; Uzman, Hekim, ve Diğer Sağlık Personeli başlıkları halinde raporları görüntüleyip Excel olarak indirin</li>
            <li className="list-group-item feature-bounce" style={{ animationDelay: '0.9s' }}>Tüm firmalarınızın atama, işyeri onayı ve İSG profesyoneli onay durumlarını renklendirilmiş Excel formatındaki raporu tek tıkla oluşturup, firma bazında kolayca takip edin</li>
            <li className="list-group-item feature-bounce" style={{ animationDelay: '1.1s' }}>Hızlı Atama Asistanı ile ataması düşen sözleşmelerinizi hangi personelinizi atayacağınızı planlayarak tek tuşla hepsini aynı anda asgari sürelerilerine göre yeniden oluşturun.</li>
          </ul>
        </section>

        {/* Google Security Badge moved below the features list */}
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
              <span className="fw-bold text-dark mt-2">Ödeme</span>
              <div className="d-flex align-items-center justify-content-center gap-2 mt-2">
                <img src="/iyzico-logo.svg" alt="iyzico" style={{ height: 26, opacity: 0.9 }} />
                <img src="/mc_symbol.svg" alt="Mastercard" style={{ height: 24, opacity: 0.8 }} />
                <img src="/Visa_Blue.png" alt="Visa" style={{ height: 20, opacity: 0.85 }} />
              </div>
              <span className="text-muted small">Güvenli ödeme altyapısı</span>
            </div>
          </div>
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
        {/* Referanslarımız (References) */}
        <section className="mb-5">
          <h2 className="mb-3 text-center">Referanslarımız</h2>
          <div className="d-flex justify-content-center">
            <div style={{ width: '100%', maxWidth: 960, overflow: 'hidden' }}>
              <div
                ref={trackRef}
                style={{
                  display: 'flex',
                  transition: enableTransition ? 'transform 0.35s ease' : 'none',
                  transform: `translateX(-${(slideIndex) * (100/3)}%)`,
                }}
              >
                {(() => {
                  const items = references && references.length > 0 ? references : [];
                  const clones = items.slice(0, 3);
                  const display = [...items, ...clones];
                  const itemStyle = { flex: '0 0 33.3333%', padding: '8px' };
                  const imgBoxStyle = {
                    height: 112,
                    borderRadius: 8,
                    background: 'rgba(255,255,255,0.85)',
                    border: '1px solid rgba(220, 53, 69, 0.25)', // subtle red border
                    boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  };
                  const cityStyle = { textAlign: 'center', fontSize: 16, color: '#343a40', marginBottom: 4, fontWeight: 600 };
                  const nameStyle = { textAlign: 'center', fontSize: 13.8, color: '#343a40', marginTop: 6, fontWeight: 600 };
                  return display.map((item, i) => (
                    <div key={`${item.url}-${i}`} style={itemStyle}>
                      {item.city ? <div style={cityStyle}>{item.city}</div> : null}
                      <div style={imgBoxStyle}>
                        <img
                          src={item.url}
                          alt={item.name || 'referans'}
                          style={{ maxHeight: 88, maxWidth: '90%', objectFit: 'contain' }}
                          onError={(e) => { e.currentTarget.style.display = 'none'; }}
                        />
                      </div>
                      {item.name ? <div style={nameStyle}>{item.name}</div> : null}
                    </div>
                  ));
                })()}
              </div>
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
