import React, { useState } from 'react';
import PageLoadingSpinner from '../components/PageLoadingSpinner';

function SetupPage() {
  const [loading] = useState(false);

  return (
    <>
      <PageLoadingSpinner show={loading} fullscreen />
      
      {/* Fixed Chrome Web Store Link */}
      <div 
        style={{
          position: 'fixed',
          right: '15px',
          top: '50%',
          transform: 'translateY(-50%)',
          zIndex: 1000,
          backgroundColor: '#fff',
          border: '2px solid #e0e0e0',
          borderRadius: '12px',
          padding: '16px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
          textAlign: 'center',
          transition: 'all 0.3s ease'
        }}
        className="chrome-store-sidebar"
      >
        <a 
          href="https://chromewebstore.google.com/detail/fclcdignmmaofcbgmjcdielmohplopem?utm_source=item-share-cb"
          target="_blank"
          rel="noopener noreferrer"
          style={{ textDecoration: 'none', color: 'inherit' }}
          onMouseEnter={(e) => {
            e.currentTarget.parentElement.style.transform = 'translateY(-50%) scale(1.05)';
            e.currentTarget.parentElement.style.boxShadow = '0 6px 25px rgba(0,0,0,0.2)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.parentElement.style.transform = 'translateY(-50%) scale(1)';
            e.currentTarget.parentElement.style.boxShadow = '0 4px 20px rgba(0,0,0,0.15)';
          }}
        >
          <div className="mb-2">
            <img 
              src="/chrome-web-store-96.svg" 
              alt="Chrome Web Store" 
              className="chrome-store-icon"
              style={{ display: 'block', margin: '0 auto' }}
            />
          </div>
          <div className="chrome-store-title">
            Chrome Web Store
          </div>
          <div className="chrome-store-subtitle">
            Buradan indirebilirsiniz
          </div>
        </a>
      </div>

      <style>{`
        /* Large screens (desktop) */
        .chrome-store-sidebar {
          max-width: 280px;
          padding: 32px;
        }
        
        .chrome-store-icon {
          width: 80px;
          height: 80px;
        }
        
        .chrome-store-title {
          font-size: 18px;
          font-weight: 600;
          color: #1a73e8;
          margin-bottom: 10px;
          line-height: 1.2;
        }
        
        .chrome-store-subtitle {
          font-size: 16px;
          color: #5f6368;
          line-height: 1.3;
        }
        
        /* Extra large screens (1400px+) */
        @media (min-width: 1400px) {
          .chrome-store-sidebar {
            max-width: 320px;
            padding: 40px;
          }
          
          .chrome-store-icon {
            width: 96px;
            height: 96px;
          }
          
          .chrome-store-title {
            font-size: 20px;
            margin-bottom: 12px;
          }
          
          .chrome-store-subtitle {
            font-size: 18px;
          }
        }
        
        /* Medium screens (tablets) */
        @media (max-width: 992px) {
          .chrome-store-sidebar {
            max-width: 180px;
            padding: 20px;
            right: 12px;
          }
          
          .chrome-store-icon {
            width: 52px;
            height: 52px;
          }
          
          .chrome-store-title {
            font-size: 14px;
            margin-bottom: 6px;
          }
          
          .chrome-store-subtitle {
            font-size: 12px;
          }
        }
        
        /* Small screens (mobile) */
        @media (max-width: 576px) {
          .chrome-store-sidebar {
            max-width: 140px;
            padding: 16px;
            right: 10px;
          }
          
          .chrome-store-icon {
            width: 40px;
            height: 40px;
          }
          
          .chrome-store-title {
            font-size: 12px;
            margin-bottom: 4px;
          }
          
          .chrome-store-subtitle {
            font-size: 10px;
          }
        }
        
        /* Very small screens */
        @media (max-width: 400px) {
          .chrome-store-sidebar {
            max-width: 120px;
            padding: 12px;
            right: 8px;
          }
          
          .chrome-store-icon {
            width: 36px;
            height: 36px;
          }
          
          .chrome-store-title {
            font-size: 11px;
            margin-bottom: 3px;
          }
          
          .chrome-store-subtitle {
            font-size: 9px;
          }
        }
      `}</style>

      <div className="container py-5">
        <h1 className="mb-4 text-center">Kurulum ve Kullanım Talimatları</h1>
        <ol className="mb-4" style={{ maxWidth: 700, margin: '0 auto', fontSize: '1.1rem' }}>
          <li>Chrome internet tarayıcısını açın. Arama motorundan <b>Chrome Web Mağazası</b>’na girin. Çıkan sayfadan arama kısmına “Katip Otomasyonu” yazarak arayın. Çıkan sayfada <b>‘Katip Otomasyonu’</b> eklentisini <b>“Chrome’a Ekle”</b> butonuna tıklayarak yükleyin.</li>
          <li>Yükleme tamamlandıktan sonra, tarayıcınızın sağ üst köşesindeki uzantılar simgesine (<b>puzzle</b> şeklindeki ikon) tıklayın. Açılan listede “Katip Otomasyonu” uzantısını bulup yanındaki <b>raptiye simgesine</b> tıklayarak uzantıyı sabitleyebilirsiniz. Böylece uzantıya her zaman kolayca erişebilirsiniz.</li>
          <li>Sabitlediğiniz <b>‘Katip Otomasyonu’</b> ikonuna tıklayarak otomasyonu başlatabilirsiniz.</li>
          <li>Açılan ekranda, size verilen geçerli <b>lisans anahtarınızı</b> girin ve <b>“Gönder"</b> butonuna tıklayın.</li>
          <li>Lisans doğrulama işlemi tamamlandığında, yan paneldeki menüden kullanmak istediğiniz özelliği seçebilirsiniz. Tüm raporlar ve işlemler, İş Güvenliği Uzmanı, İşyeri Hekimi ve Diğer Sağlık Personeli atamaları dahil olmak üzere, ilgili başlıklar altında sunulmaktadır.</li>
          <li>
            Uzantıyı kullanabilmek için geçerli bir lisans anahtarınızın olması gerekmektedir. Lisans anahtarınız yoksa, 
            <button 
              type="button" 
              className="btn btn-link p-0 align-baseline" 
              style={{ textDecoration: 'underline', color: '#c82333', fontWeight: 600, fontSize: '1em' }}
              onClick={() => window.location.href = '/iletisim'}
            >
              buraya tıklayın
            </button> 
          </li>
        </ol>
        
        <div className="alert alert-info" style={{ maxWidth: 700, margin: '0 auto 20px auto' }}>
          <b>Ek Bilgi:</b> Uzantıyı sabitlemek (raptiye simgesiyle) uzantıya hızlı erişim sağlar ve her zaman tarayıcıda görünür olmasını kolaylaştırır.
        </div>
        
        <div className="alert alert-primary" style={{ maxWidth: 700, margin: '0 auto' }}>
          <h5 className="mb-3">
            <i className="bi bi-play-circle me-2"></i>
            Kullanım ve Kurulum Videoları
          </h5>
          <p className="mb-2">
            Katip Otomasyonu'nun kurulumu, lisans anahtarı ile aktive edilmesi ve kullanımına dair detaylı videolar için YouTube kanalımızı ziyaret edebilirsiniz:
          </p>
          <a 
            href="https://youtube.com/@katipotomasyonu" 
            target="_blank" 
            rel="noopener noreferrer"
            className="btn btn-danger btn-lg"
            style={{ textDecoration: 'none' }}
          >
            <i className="bi bi-youtube me-2"></i>
            YouTube Kanalımız
          </a>
        </div>
      </div>
    </>
  );
}

export default SetupPage;
