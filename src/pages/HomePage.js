import React, { useEffect, useRef, useState } from 'react';
import PageLoadingSpinner from '../components/PageLoadingSpinner';

// Add enhanced CSS animations and styles
const homePageStyles = `
  @keyframes pulse {
    0%, 100% { transform: scale(1); opacity: 1; }
    50% { transform: scale(1.05); opacity: 0.8; }
  }
  
  @keyframes fadeIn {
    from { opacity: 0; transform: scale(0.9); }
    to { opacity: 1; transform: scale(1); }
  }
  
  @keyframes slideUp {
    from { opacity: 0; transform: translateY(30px); }
    to { opacity: 1; transform: translateY(0); }
  }
  
  @keyframes borderPulse {
    0% { 
      border-color: currentColor;
      opacity: 0.1;
    }
    50% { 
      border-color: currentColor;
      opacity: 0.9;
    }
    100% { 
      border-color: currentColor;
      opacity: 0.1;
    }
  }
  
  .filigran-bg .feature-bounce {
    animation: slideUp 0.8s ease forwards;
    opacity: 0;
    position: relative;
    overflow: visible;
  }
  
  .filigran-bg .feature-bounce::before {
    content: '';
    position: absolute;
    top: -3px;
    left: -3px;
    right: -3px;
    bottom: -3px;
    border: 3px solid currentColor;
    border-radius: 25px;
    z-index: -1;
    animation: borderPulse 3s ease-in-out infinite;
  }
  
  .filigran-bg .feature-bounce:nth-child(1) { color: #3498db; }
  .filigran-bg .feature-bounce:nth-child(1)::before { animation-delay: 0s; }
  
  .filigran-bg .feature-bounce:nth-child(2) { color: #2ecc71; }
  .filigran-bg .feature-bounce:nth-child(2)::before { animation-delay: 0.2s; }
  
  .filigran-bg .feature-bounce:nth-child(3) { color: #e67e22; }
  .filigran-bg .feature-bounce:nth-child(3)::before { animation-delay: 0.4s; }
  
  .filigran-bg .feature-bounce:nth-child(4) { color: #e74c3c; }
  .filigran-bg .feature-bounce:nth-child(4)::before { animation-delay: 0.6s; }
  
  .filigran-bg .feature-bounce:nth-child(5) { color: #6c5ce7; }
  .filigran-bg .feature-bounce:nth-child(5)::before { animation-delay: 0.8s; }
  
  .filigran-bg .feature-bounce:nth-child(6) { color: #20c997; }
  .filigran-bg .feature-bounce:nth-child(6)::before { animation-delay: 1s; }
  
  .filigran-bg .feature-bounce:nth-child(7) { color: #ffc107; }
  .filigran-bg .feature-bounce:nth-child(7)::before { animation-delay: 1.2s; }
  
  .filigran-bg .feature-bounce:nth-child(8) { color: #ab47bc; }
  .filigran-bg .feature-bounce:nth-child(8)::before { animation-delay: 1.4s; }
  
  .filigran-bg .feature-bounce:nth-child(9) { color: #4caf50; }
  .filigran-bg .feature-bounce:nth-child(9)::before { animation-delay: 1.6s; }
  
  .filigran-bg .feature-bounce:nth-child(10) { color: #2196f3; }
  .filigran-bg .feature-bounce:nth-child(10)::before { animation-delay: 1.8s; }
  
  .filigran-bg .feature-bounce:hover {
    transform: translateY(-4px) !important;
    box-shadow: 0 12px 28px rgba(0,0,0,0.15) !important;
  }
  
  /* Smooth scroll behavior - keep global as it's beneficial */
  html {
    scroll-behavior: smooth;
  }
  
  /* Enhanced text selection - scope to homepage only */
  .filigran-bg ::selection {
    background: rgba(52, 152, 219, 0.2);
    color: #2c3e50;
  }
  
  /* Custom scrollbar for webkit browsers - scope to homepage only */
  .filigran-bg::-webkit-scrollbar {
    width: 8px;
  }
  
  .filigran-bg::-webkit-scrollbar-track {
    background: rgba(0,0,0,0.05);
  }
  
  .filigran-bg::-webkit-scrollbar-thumb {
    background: linear-gradient(135deg, #3498db, #9b59b6);
    border-radius: 4px;
  }
  
  .filigran-bg::-webkit-scrollbar-thumb:hover {
    background: linear-gradient(135deg, #2980b9, #8e44ad);
  }
  
  /* Responsive design enhancements - only for homepage content */
  @media (max-width: 768px) {
    .filigran-bg .feature-bounce {
      margin-bottom: 0.5rem !important;
    }
    
    .filigran-bg .display-4 {
      font-size: 2.5rem !important;
    }
    
    .filigran-bg .h3 {
      font-size: 1.5rem !important;
    }
    
    .filigran-bg .lead {
      font-size: 1rem !important;
    }
  }
  
  @media (max-width: 576px) {
    .filigran-bg .display-4 {
      font-size: 2rem !important;
    }
    
    .filigran-bg .container-fluid {
      padding-left: 1rem !important;
      padding-right: 1rem !important;
    }
  }
  
  /* Enhanced focus states for accessibility - only for homepage content */
  .filigran-bg button:focus,
  .filigran-bg .btn:focus {
    outline: 2px solid #3498db;
    outline-offset: 2px;
  }
  
  /* Improved hover states - only for homepage content */
  .filigran-bg .shadow-lg:hover {
    box-shadow: 0 1rem 3rem rgba(0,0,0,.175) !important;
  }
`;

function HomePage() {
  // Inject custom styles
  useEffect(() => {
    const styleElement = document.createElement('style');
    styleElement.textContent = homePageStyles;
    document.head.appendChild(styleElement);
    
    return () => {
      // Cleanup on unmount
      if (document.head.contains(styleElement)) {
        document.head.removeChild(styleElement);
      }
    };
  }, []);

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

  // Auto-slide every 2s. Show 3 at once, move by one.
  useEffect(() => {
    if (!references || references.length === 0) return;
    const id = setInterval(() => {
      setEnableTransition(true);
      setSlideIndex((prev) => prev + 1);
    }, 2000);
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
      }, 1500);
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
        {/* Demo GIF - simplified */}
        <img
          src="/gifs/demo-promotion.gif"
          alt="3 Gün Ücretsiz Deneyin Demo"
          style={{
            position: 'fixed',
            top: '50%',
            right: 15,
            transform: 'translateY(-50%)',
            maxWidth: 420,
            width: '26vw',
            minWidth: 160,
            height: 'auto',
            margin: 0,
            zIndex: 100,
            pointerEvents: 'auto',
            cursor: 'pointer'
          }}
          onClick={() => {
            const message = "Merhaba, Katip Otomasyonu için demo talebinde bulunmak istiyorum. Bilgi verebilir misiniz?";
            const phoneNumber = "905015448544";
            const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
            window.open(whatsappUrl, '_blank');
          }}
        />
        {/* Hero intro section with enhanced typography */}
        <section className="text-center mb-5" style={{ 
          marginTop: '3rem',
          padding: '0 1rem'
        }}>
          <h1 className="display-4 fw-bold mb-4" style={{
            background: 'linear-gradient(135deg, #2c3e50, #3498db)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            textShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}>
            Katip Otomasyonu
          </h1>
          <h2 className="h4 mb-4 text-muted fw-normal">
            İSG Katip platformundaki işlemlerinizi çok daha hızlı ve kolay yönetin
          </h2>
          <div style={{ 
            maxWidth: '750px', 
            margin: '0 auto',
            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(248, 249, 250, 0.9))',
            borderRadius: '20px',
            border: '1px solid rgba(255, 193, 207, 0.4)',
            padding: '2.5rem 2rem',
            backdropFilter: 'blur(8px)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
            position: 'relative',
            overflow: 'hidden'
          }}>
            {/* Decorative corner elements */}
            <div style={{
              position: 'absolute',
              top: '-10px',
              right: '-10px',
              width: '40px',
              height: '40px',
              background: 'linear-gradient(135deg, rgba(52, 152, 219, 0.2), rgba(155, 89, 182, 0.2))',
              borderRadius: '50%',
              filter: 'blur(8px)'
            }}></div>
            <div style={{
              position: 'absolute',
              bottom: '-15px',
              left: '-15px',
              width: '60px',
              height: '60px',
              background: 'linear-gradient(135deg, rgba(231, 76, 60, 0.15), rgba(230, 126, 34, 0.15))',
              borderRadius: '50%',
              filter: 'blur(10px)'
            }}></div>
            
            <p className="lead mb-0 lh-lg" style={{
              fontSize: '1.1rem',
              color: '#2c3e50',
              fontWeight: '400',
              lineHeight: '1.7'
            }}>
              İSG Katip platformundaki tüm işlemlerinizi çok daha hızlı ve kolay yönetin. Tek tuşla süre güncellemeleri yapın, detaylı raporlar alın, personel takibinizi kolaylaştırın ve atama işlemlerinizi otomatikleştirin. 
              <strong className="text-primary"> Günlük işlerinizi otomatikleştirin</strong> ve 
              <strong className="text-success"> zamandan tasarruf ederken hatasız yönetim sağlayın</strong>.
            </p>
          </div>
        </section>
        
        {/* Enhanced features section with better visual hierarchy */}
        <section className="mb-5">
          <div className="container-fluid px-3">
            <div className="text-center mb-5">
              <h2 className="h3 fw-bold mb-3" style={{
                color: '#2c3e50',
                position: 'relative'
              }}>
                Öne Çıkan Özellikler
                <div style={{
                  position: 'absolute',
                  bottom: '-8px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: '80px',
                  height: '3px',
                  background: 'linear-gradient(90deg, #3498db, #9b59b6)',
                  borderRadius: '2px'
                }}></div>
              </h2>
              <p className="text-muted mb-0">Hemen deneyin ve farkı görün!</p>
            </div>
            
            <div className="row justify-content-center">
              <div className="col-12 col-lg-10 col-xl-9">
                <div className="row g-4">
                  <div className="col-12 col-md-6">
                    <div className="feature-bounce h-100 p-4 rounded-4 border-0 shadow-sm" style={{ 
                      animationDelay: '0.1s',
                      background: 'linear-gradient(135deg, #ebf3fd, #ddeafe)',
                      border: '1px solid #3498db',
                      transition: 'all 0.3s ease',
                      color: '#3498db'
                    }}>
                      <div className="d-flex align-items-center mb-3">
                        <div className="p-2 rounded-circle me-3" style={{
                          background: 'linear-gradient(135deg, #3498db, #2980b9)',
                          color: 'white',
                          fontSize: '1.2rem'
                        }}></div>
                        <h5 className="mb-0 fw-bold text-primary">7 Gün Ücretsiz Deneme</h5>
                      </div>
                      <p className="text-muted mb-0 lh-lg">Risk almadan tüm özelliklerini keşfedin</p>
                    </div>
                  </div>
                  
                  <div className="col-12 col-md-6">
                    <div className="feature-bounce h-100 p-4 rounded-4 border-0 shadow-sm" style={{ 
                      animationDelay: '0.2s',
                      background: 'linear-gradient(135deg, #e8f5e8, #d4edd4)',
                      border: '1px solid #2ecc71',
                      transition: 'all 0.3s ease',
                      color: '#2ecc71'
                    }}>
                      <div className="d-flex align-items-center mb-3">
                        <div className="p-2 rounded-circle me-3" style={{
                          background: 'linear-gradient(135deg, #2ecc71, #27ae60)',
                          color: 'white',
                          fontSize: '1.2rem'
                        }}></div>
                        <h5 className="mb-0 fw-bold text-success">Tek Tuşla Süre Güncellemeleri</h5>
                      </div>
                      <p className="text-muted mb-0 lh-lg">Güncellemesi gereken sözleşmeleri anında güncelleyin, asgari süreden fazla atanan sözleşmeleri otomatik güncelleyini. Sözleşme süre güncellemelerini hem sorumlu müdürden hem de işverenden yapabilirsiniz</p>
                    </div>
                  </div>
                  
                  <div className="col-12 col-md-6">
                    <div className="feature-bounce h-100 p-4 rounded-4 border-0 shadow-sm" style={{ 
                      animationDelay: '0.3s',
                      background: 'linear-gradient(135deg, #fdf2e9, #f8e7d1)',
                      border: '1px solid #e67e22',
                      transition: 'all 0.3s ease',
                      color: '#e67e22'
                    }}>
                      <div className="d-flex align-items-center mb-3">
                        <div className="p-2 rounded-circle me-3" style={{
                          background: 'linear-gradient(135deg, #e67e22, #d35400)',
                          color: 'white',
                          fontSize: '1.2rem'
                        }}></div>
                        <h5 className="mb-0 fw-bold" style={{color: '#e67e22'}}>Detaylı Raporlama</h5>
                      </div>
                      <p className="text-muted mb-0 lh-lg">Personel dakikalarını ve firma durumlarını Excel ile takip edin</p>
                    </div>
                  </div>
                  
                  <div className="col-12 col-md-6">
                    <div className="feature-bounce h-100 p-4 rounded-4 border-0 shadow-sm" style={{ 
                      animationDelay: '0.5s',
                      background: 'linear-gradient(135deg, #fdebeb, #f8d7d7)',
                      border: '1px solid #e74c3c',
                      transition: 'all 0.3s ease',
                      color: '#e74c3c'
                    }}>
                      <div className="d-flex align-items-center mb-3">
                        <div className="p-2 rounded-circle me-3" style={{
                          background: 'linear-gradient(135deg, #e74c3c, #c0392b)',
                          color: 'white',
                          fontSize: '1.2rem'
                        }}></div>
                        <h5 className="mb-0 fw-bold" style={{color: '#e74c3c'}}>Hızlı Atama Asistanı</h5>
                      </div>
                      <p className="text-muted mb-0 lh-lg">Ataması düşen sözleşmeleri planlayarak tek tuşla asgari sürelerine göre yeniden oluşturun</p>
                    </div>
                  </div>
                  
                  <div className="col-12 col-md-6">
                    <div className="feature-bounce h-100 p-4 rounded-4 border-0 shadow-sm" style={{ 
                      animationDelay: '0.6s',
                      background: 'linear-gradient(135deg, #f0f8ff, #e6f3ff)',
                      border: '1px solid #6c5ce7',
                      transition: 'all 0.3s ease',
                      color: '#6c5ce7'
                    }}>
                      <div className="d-flex align-items-center mb-3">
                        <div className="p-2 rounded-circle me-3" style={{
                          background: 'linear-gradient(135deg, #6c5ce7, #5f3dc4)',
                          color: 'white',
                          fontSize: '1.2rem'
                        }}></div>
                        <h5 className="mb-0 fw-bold" style={{color: '#6c5ce7'}}>Çoklu Atama Yapabilme</h5>
                      </div>
                      <p className="text-muted mb-0 lh-lg">Tehlike sınıfı ve çalışan sayısı görüntüleme, planlama yaparak çoklu şekilde atama yapabilme</p>
                    </div>
                  </div>
                  
                  <div className="col-12 col-md-6">
                    <div className="feature-bounce h-100 p-4 rounded-4 border-0 shadow-sm" style={{ 
                      animationDelay: '0.7s',
                      background: 'linear-gradient(135deg, #f0fff4, #e6fffa)',
                      border: '1px solid #20c997',
                      transition: 'all 0.3s ease',
                      color: '#20c997'
                    }}>
                      <div className="d-flex align-items-center mb-3">
                        <div className="p-2 rounded-circle me-3" style={{
                          background: 'linear-gradient(135deg, #20c997, #1ba587)',
                          color: 'white',
                          fontSize: '1.2rem'
                        }}></div>
                        <h5 className="mb-0 fw-bold" style={{color: '#20c997'}}>Personel Dakika Takibi</h5>
                      </div>
                      <p className="text-muted mb-0 lh-lg">Personellerinizin blokeli kaç dakikası olduğunu, atanabilir dakikalarınızı ve birçok detayı kolayca görüntüleyebilirsiniz</p>
                    </div>
                  </div>
                  
                  <div className="col-12 col-md-6">
                    <div className="feature-bounce h-100 p-4 rounded-4 border-0 shadow-sm" style={{ 
                      animationDelay: '0.8s',
                      background: 'linear-gradient(135deg, #fff8e1, #ffecb3)',
                      border: '1px solid #ffc107',
                      transition: 'all 0.3s ease',
                      color: '#ffc107'
                    }}>
                      <div className="d-flex align-items-center mb-3">
                        <div className="p-2 rounded-circle me-3" style={{
                          background: 'linear-gradient(135deg, #ffc107, #e0a800)',
                          color: 'white',
                          fontSize: '1.2rem'
                        }}></div>
                        <h5 className="mb-0 fw-bold" style={{color: '#ffc107'}}>Düşen Atama Yönetimi</h5>
                      </div>
                      <p className="text-muted mb-0 lh-lg">Onaylanmadığı için düşen atamalarınızı görüntüleyip çok daha hızlı yeniden atama yapabilirsiniz</p>
                    </div>
                  </div>
                  
                  <div className="col-12 col-md-6">
                    <div className="feature-bounce h-100 p-4 rounded-4 border-0 shadow-sm" style={{ 
                      animationDelay: '0.9s',
                      background: 'linear-gradient(135deg, #f3e5f5, #e1bee7)',
                      border: '1px solid #ab47bc',
                      transition: 'all 0.3s ease',
                      color: '#ab47bc'
                    }}>
                      <div className="d-flex align-items-center mb-3">
                        <div className="p-2 rounded-circle me-3" style={{
                          background: 'linear-gradient(135deg, #ab47bc, #8e24aa)',
                          color: 'white',
                          fontSize: '1.2rem'
                        }}></div>
                        <h5 className="mb-0 fw-bold" style={{color: '#ab47bc'}}>Firma Durumu Takibi</h5>
                      </div>
                      <p className="text-muted mb-0 lh-lg">Çalışan sayısı 0'a düşen firmalarınızı kolayca görüntüleyebilirsiniz</p>
                    </div>
                  </div>
                  
                  <div className="col-12 col-md-6">
                    <div className="feature-bounce h-100 p-4 rounded-4 border-0 shadow-sm" style={{ 
                      animationDelay: '1.0s',
                      background: 'linear-gradient(135deg, #e8f5e9, #c8e6c9)',
                      border: '1px solid #4caf50',
                      transition: 'all 0.3s ease',
                      color: '#4caf50'
                    }}>
                      <div className="d-flex align-items-center mb-3">
                        <div className="p-2 rounded-circle me-3" style={{
                          background: 'linear-gradient(135deg, #4caf50, #388e3c)',
                          color: 'white',
                          fontSize: '1.2rem'
                        }}></div>
                        <h5 className="mb-0 fw-bold" style={{color: '#4caf50'}}>Atama Durumu Analizi</h5>
                      </div>
                      <p className="text-muted mb-0 lh-lg">Firmalarınızdaki atamaların durumunu ve eksik atamalarınızı detaylı şekilde görüntüleyebilirsiniz</p>
                    </div>
                  </div>
                  
                  <div className="col-12 col-md-6">
                    <div className="feature-bounce h-100 p-4 rounded-4 border-0 shadow-sm" style={{ 
                      animationDelay: '1.1s',
                      background: 'linear-gradient(135deg, #e3f2fd, #bbdefb)',
                      border: '1px solid #2196f3',
                      transition: 'all 0.3s ease',
                      color: '#2196f3'
                    }}>
                      <div className="d-flex align-items-center mb-3">
                        <div className="p-2 rounded-circle me-3" style={{
                          background: 'linear-gradient(135deg, #2196f3, #1976d2)',
                          color: 'white',
                          fontSize: '1.2rem'
                        }}></div>
                        <h5 className="mb-0 fw-bold" style={{color: '#2196f3'}}>Çoklu Sözleşme İndirme</h5>
                      </div>
                      <p className="text-muted mb-0 lh-lg">Çoklu şekilde hizmet sözleşmelerini tek seferde indirebilirsiniz</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Enhanced Google Security Badge */}
        <section className="mb-5">
          <div className="container-fluid px-3">
            <div className="text-center mb-4">
              <h3 className="h4 fw-bold mb-2" style={{ color: '#2c3e50' }}>Güvenlik & Ödeme</h3>
              <p className="text-muted small">Verileriniz güvende, ödemeleriniz korunuyor</p>
            </div>
            
            <div className="d-flex justify-content-center">
              <div className="row g-4 align-items-center" style={{
                background: 'linear-gradient(135deg, rgba(248, 249, 250, 0.95), rgba(255, 255, 255, 0.9))',
                borderRadius: '20px',
                border: '1px solid rgba(222, 226, 230, 0.4)',
                maxWidth: '800px',
                padding: '2rem',
                boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
                backdropFilter: 'blur(8px)',
                position: 'relative',
                overflow: 'hidden'
              }}>
                {/* Decorative background elements */}
                <div style={{
                  position: 'absolute',
                  top: '10px',
                  left: '10px',
                  width: '30px',
                  height: '30px',
                  background: 'linear-gradient(135deg, rgba(66, 133, 244, 0.1), rgba(52, 168, 83, 0.1))',
                  borderRadius: '50%',
                  filter: 'blur(6px)'
                }}></div>
                
                <div className="col-12 col-lg-6">
                  <div className="d-flex flex-column align-items-center text-center p-3 rounded-3" style={{
                    background: 'rgba(66, 133, 244, 0.05)',
                    border: '1px solid rgba(66, 133, 244, 0.1)'
                  }}>
                    <div className="mb-3">
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                      </svg>
                    </div>
                    <h5 className="fw-bold mb-2" style={{ color: '#4285F4' }}>Google Onayı</h5>
                    <p className="text-muted small mb-0 lh-lg">
                      Google tarafından onaylanmış ve düzenli güvenlik denetimlerinden geçiyor
                    </p>
                  </div>
                </div>
                
                <div className="col-12 col-lg-6">
                  <div className="d-flex flex-column align-items-center text-center p-3 rounded-3" style={{
                    background: 'rgba(40, 167, 69, 0.05)',
                    border: '1px solid rgba(40, 167, 69, 0.1)'
                  }}>
                    <div className="mb-3">
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="#28a745" strokeWidth="2" fill="rgba(40, 167, 69, 0.1)"/>
                        <path d="m9 12 2 2 4-4" stroke="#28a745" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    <h5 className="fw-bold mb-2 text-success">%100 Güvenli</h5>
                    <p className="text-muted small mb-3 lh-lg">Verileriniz tamamen güvende</p>
                    
                    <div className="w-100">
                      <h6 className="fw-bold mb-2 text-success">Güvenli Ödeme</h6>
                      <div className="d-flex align-items-center justify-content-center gap-3">
                        <img src="/iyzico-logo.svg" alt="iyzico" style={{ height: 28, opacity: 0.9 }} />
                        <img src="/mc_symbol.svg" alt="Mastercard" style={{ height: 26, opacity: 0.8 }} />
                        <img src="/Visa_Blue.png" alt="Visa" style={{ height: 22, opacity: 0.85 }} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
  <section className="mb-5">
          <div className="container-fluid px-3">
            <div className="text-center mb-5">
              <h2 className="h3 fw-bold mb-3" style={{
                color: '#2c3e50',
                position: 'relative'
              }}>
                Ekran Görüntüleri
                <div style={{
                  position: 'absolute',
                  bottom: '-8px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: '80px',
                  height: '3px',
                  background: 'linear-gradient(90deg, #e74c3c, #f39c12)',
                  borderRadius: '2px'
                }}></div>
              </h2>
              <p className="text-muted">Eklentinin arayüzünü keşfedin</p>
            </div>
            
            <div className="row justify-content-center g-4">
              <div className="col-12 col-lg-4 col-md-6">
                <div
                  className="position-relative overflow-hidden rounded-4 shadow-lg"
                  style={{ 
                    background: 'linear-gradient(135deg, #ebf3fd, #f0e8f3)',
                    border: '1px solid #3498db',
                    transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={(e) => {
                    setHovered('chrome');
                    e.currentTarget.style.transform = 'translateY(-8px) scale(1.02)';
                    e.currentTarget.style.boxShadow = '0 20px 40px rgba(52, 152, 219, 0.2)';
                  }}
                  onMouseLeave={(e) => {
                    setHovered('');
                    e.currentTarget.style.transform = 'translateY(0) scale(1)';
                    e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.1)';
                  }}
                  onClick={() => openModal('/screenshots/chrome-extension-store-view.png', 'Chrome Web Mağazası Görünümü')}
                >
                  <div className="p-3">
                    <img
                      src="/screenshots/chrome-extension-store-view.png"
                      alt="Chrome Web Mağazası Görünümü"
                      style={{ 
                        width: '100%', 
                        borderRadius: '12px',
                        transition: 'all 0.3s ease'
                      }}
                    />
                  </div>
                  {hovered === 'chrome' && (
                    <div style={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                      background: 'rgba(52, 152, 219, 0.9)',
                      borderRadius: '50%',
                      padding: '18px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      pointerEvents: 'none',
                      animation: 'pulse 2s infinite'
                    }}>
                      <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                      </svg>
                    </div>
                  )}
                  <div className="p-3 pt-0">
                    <h5 className="fw-bold mb-2 text-primary">Chrome Web Mağazası</h5>
                  </div>
                </div>
              </div>
              
              <div className="col-12 col-lg-4 col-md-6">
                <div
                  className="position-relative overflow-hidden rounded-4 shadow-lg"
                  style={{ 
                    background: 'linear-gradient(135deg, #e8f5e8, #d4f4f4)',
                    border: '1px solid #2ecc71',
                    transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={(e) => {
                    setHovered('main');
                    e.currentTarget.style.transform = 'translateY(-8px) scale(1.02)';
                    e.currentTarget.style.boxShadow = '0 20px 40px rgba(46, 204, 113, 0.2)';
                  }}
                  onMouseLeave={(e) => {
                    setHovered('');
                    e.currentTarget.style.transform = 'translateY(0) scale(1)';
                    e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.1)';
                  }}
                  onClick={() => openModal('/screenshots/extension-main-page.png', 'Eklenti Lisans Girme Ekranı')}
                >
                  <div className="p-3">
                    <img
                      src="/screenshots/extension-main-page.png"
                      alt="Eklenti Lisans Girme Ekranı"
                      style={{ 
                        width: '100%', 
                        borderRadius: '12px',
                        transition: 'all 0.3s ease'
                      }}
                    />
                  </div>
                  {hovered === 'main' && (
                    <div style={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                      background: 'rgba(46, 204, 113, 0.9)',
                      borderRadius: '50%',
                      padding: '18px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      pointerEvents: 'none',
                      animation: 'pulse 2s infinite'
                    }}>
                      <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                      </svg>
                    </div>
                  )}
                  <div className="p-3 pt-0">
                    <h5 className="fw-bold mb-2 text-success">Lisans Aktivasyonu</h5>
                  </div>
                </div>
              </div>
              
              <div className="col-12 col-lg-4 col-md-6">
                <div
                  className="position-relative overflow-hidden rounded-4 shadow-lg"
                  style={{ 
                    background: 'linear-gradient(135deg, #fdf2e9, #f8e7d1)',
                    border: '1px solid #e67e22',
                    transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={(e) => {
                    setHovered('main2');
                    e.currentTarget.style.transform = 'translateY(-8px) scale(1.02)';
                    e.currentTarget.style.boxShadow = '0 20px 40px rgba(230, 126, 34, 0.2)';
                  }}
                  onMouseLeave={(e) => {
                    setHovered('');
                    e.currentTarget.style.transform = 'translateY(0) scale(1)';
                    e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.1)';
                  }}
                  onClick={() => openModal('/screenshots/extension-main-page-2.png', 'Eklenti Ana Sayfa Görünümü')}
                >
                  <div className="p-3">
                    <img
                      src="/screenshots/extension-main-page-2.png"
                      alt="Eklenti Ana Sayfa Görünümü"
                      style={{ 
                        width: '100%', 
                        borderRadius: '12px',
                        transition: 'all 0.3s ease'
                      }}
                    />
                  </div>
                  {hovered === 'main2' && (
                    <div style={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                      background: 'rgba(230, 126, 34, 0.9)',
                      borderRadius: '50%',
                      padding: '18px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      pointerEvents: 'none',
                      animation: 'pulse 2s infinite'
                    }}>
                      <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                      </svg>
                    </div>
                  )}
                  <div className="p-3 pt-0">
                    <h5 className="fw-bold mb-2" style={{color: '#e67e22'}}>Ana Panel</h5>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        {/* Enhanced Referanslarımız (References) */}
        <section className="mb-5">
          <div className="container-fluid px-3">
            <div className="text-center mb-5">
              <h2 className="h3 fw-bold mb-3" style={{
                color: '#2c3e50',
                position: 'relative'
              }}>
                Referanslarımız
                <div style={{
                  position: 'absolute',
                  bottom: '-8px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: '80px',
                  height: '3px',
                  background: 'linear-gradient(90deg, #9b59b6, #3498db)',
                  borderRadius: '2px'
                }}></div>
              </h2>
              <p className="text-muted">Bize güvenen şirketler</p>
            </div>
            
            <div className="d-flex justify-content-center">
              <div style={{ 
                width: '100%', 
                maxWidth: 1100, 
                overflow: 'hidden',
                background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.8), rgba(248, 249, 250, 0.9))',
                borderRadius: '20px',
                padding: '2rem 1rem',
                border: '1px solid rgba(220, 53, 69, 0.15)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
                backdropFilter: 'blur(8px)'
              }}>
                <div
                  ref={trackRef}
                  style={{
                    display: 'flex',
                    transition: enableTransition ? 'transform 1.5s ease' : 'none',
                    transform: `translateX(-${(slideIndex) * (100/3)}%)`,
                  }}
                >
                  {(() => {
                    const items = references && references.length > 0 ? references : [];
                    const clones = items.slice(0, 3);
                    const display = [...items, ...clones];
                    const itemStyle = { flex: '0 0 33.3333%', padding: '12px' };
                    const imgBoxStyle = {
                      height: 120,
                      borderRadius: 16,
                      background: 'linear-gradient(135deg, rgba(255,255,255,0.95), rgba(248,249,250,0.9))',
                      border: '1px solid rgba(220, 53, 69, 0.2)',
                      boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.3s ease',
                      position: 'relative',
                      overflow: 'hidden'
                    };
                    const cityStyle = { 
                      textAlign: 'center', 
                      fontSize: 17, 
                      color: '#2c3e50', 
                      marginBottom: 8, 
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    };
                    const nameStyle = { 
                      textAlign: 'center', 
                      fontSize: 14.5, 
                      color: '#5a6c7d', 
                      marginTop: 8, 
                      fontWeight: 500,
                      lineHeight: 1.4
                    };
                    return display.map((item, i) => (
                      <div key={`${item.url}-${i}`} style={itemStyle}>
                        {item.city ? <div style={cityStyle}>{item.city}</div> : null}
                        <div 
                          style={imgBoxStyle}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-4px)';
                            e.currentTarget.style.boxShadow = '0 8px 24px rgba(220, 53, 69, 0.15)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.08)';
                          }}
                        >
                          {/* Subtle gradient overlay */}
                          <div style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            background: 'linear-gradient(135deg, rgba(52, 152, 219, 0.02), rgba(155, 89, 182, 0.02))',
                            borderRadius: 16
                          }}></div>
                          <img
                            src={item.url}
                            alt={item.name || 'referans'}
                            style={{ 
                              maxHeight: 96, 
                              maxWidth: '85%', 
                              objectFit: 'contain',
                              filter: 'contrast(1.1) saturate(1.1)',
                              transition: 'all 0.3s ease'
                            }}
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
          </div>
        </section>
        {/* Enhanced Modal with better styling */}
        {modalOpen && (
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100vw',
              height: '100vh',
              background: 'linear-gradient(135deg, rgba(0,0,0,0.9), rgba(44, 62, 80, 0.85))',
              zIndex: 1050,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backdropFilter: 'blur(8px)',
              animation: 'fadeIn 0.3s ease'
            }}
            onClick={closeModal}
          >
            <div
              style={{
                maxWidth: '76.5vw', // 15% smaller than 90vw
                maxHeight: '76.5vh', // 15% smaller than 90vh
                borderRadius: 20,
                overflow: 'hidden',
                boxShadow: '0 25px 50px rgba(0,0,0,0.4)',
                background: 'linear-gradient(135deg, #fff, #f8f9fa)',
                transform: 'scale(1)',
                transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                position: 'relative'
              }}
              onClick={e => e.stopPropagation()}
            >
              <img
                src={modalImg}
                alt={modalAlt}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain',
                  display: 'block'
                }}
              />
              <button
                onClick={closeModal}
                style={{
                  position: 'absolute',
                  top: 15,
                  right: 15,
                  fontSize: 36,
                  color: '#fff',
                  background: 'rgba(231, 76, 60, 0.9)',
                  border: 'none',
                  cursor: 'pointer',
                  zIndex: 1200,
                  borderRadius: '50%',
                  width: 56,
                  height: 56,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 4px 16px rgba(231, 76, 60, 0.5)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(231, 76, 60, 1)';
                  e.currentTarget.style.transform = 'scale(1.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(231, 76, 60, 0.9)';
                  e.currentTarget.style.transform = 'scale(1)';
                }}
                aria-label="Kapat"
              >
                &times;
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default HomePage;
