import React, { useState } from 'react';
import PageLoadingSpinner from '../components/PageLoadingSpinner';

function FeaturesPage() {
  const [loading] = useState(false);

  return (
    <>
      <PageLoadingSpinner show={loading} fullscreen />
      <div className="filigran-bg position-relative">
        <div className="container py-5">
          <h1 className="mb-4 text-center">Özellikler</h1>
          <ul className="list-group list-group-flush feature-list-animated mx-auto" style={{ maxWidth: 700 }}>
            <li className="list-group-item mb-3 feature-bounce" style={{ animationDelay: '0.1s' }}>
              <strong>7 Gün Ücretsiz Deneme</strong><br />
              Tüm özelliklerimizi 7 gün boyunca ücretsiz olarak deneyebilir, sistemi test edebilirsiniz.
            </li>
            <li className="list-group-item mb-3 feature-bounce" style={{ animationDelay: '0.2s' }}>
              <strong>Sözleşme Sürelerini Otomatik Güncelleme</strong><br />
              İSG-Katip platformundaki iş güvenliği sözleşmelerinizin sürelerini tek tıkla toplu ve otomatik olarak güncelleyebilirsiniz. Manuel işlem ihtiyacını ortadan kaldırır, zamandan tasarruf sağlar.
            </li>
            <li className="list-group-item mb-3 feature-bounce" style={{ animationDelay: '0.3s' }}>
              <strong>Sözleşme Uyum Kontrolü ve Güncellenmesi Gerekenler</strong><br />
              Mevzuata uygun olmayan sözleşmeleri tespit eder, eksik veya hatalı olanları listeler ve toplu güncelleme imkanı sunar. Hatalı işlemler için detaylı hata raporu sağlar.
            </li>
            <li className="list-group-item mb-3 feature-bounce" style={{ animationDelay: '0.4s' }}>
              <strong>Firma İş Güvenliği Uzmanı, İşyeri Hekimi ve Diğer Sağlık Personeli Atama Durumu Raporu</strong><br />
              Çalıştığınız firmalarda İş Güvenliği Uzmanı, İşyeri Hekimi ve Diğer Sağlık Personeli atamalarının yapılıp yapılmadığını ve onay durumlarını otomatik olarak raporlar. Raporlar renkli ve kolay anlaşılır şekilde sunulur.
            </li>
            <li className="list-group-item mb-3 feature-bounce" style={{ animationDelay: '0.5s' }}>
              <strong>Kalan Personel Çalışma Dakikalarını Görüntüleme</strong><br />
              Tüm İş Güvenliği Uzmanı, İşyeri Hekimi ve Diğer Sağlık Personellerinizin kalan çalışma dakikalarını ve uzmanlık sınıflarını anlık olarak listeleyebilirsiniz. Eksik veya fazla süreleri kolayca takip edebilirsiniz.
            </li>
            <li className="list-group-item mb-3 feature-bounce" style={{ animationDelay: '0.6s' }}>
              <strong>Renkli ve İndirilebilir Raporlar</strong><br />
              Tüm raporlar Excel (XLSX) formatında, kolayca indirilebilir ve paylaşılabilir şekilde hazırlanır. Raporlarda önemli durumlar renklerle vurgulanır.
            </li>
            <li className="list-group-item mb-3 feature-bounce" style={{ animationDelay: '0.7s' }}>
              <strong>Lisans ve Kullanıcı Yönetimi</strong><br />
              Lisans anahtarı ile güvenli kullanım, sözleşme sayısına göre esnek lisanslama ve şirket bazlı yetkilendirme desteği sunar.
            </li>
            <li className="list-group-item mb-3 feature-bounce" style={{ animationDelay: '0.8s' }}>
              <strong>Tam Otomasyon ve Kolay Kullanım</strong><br />
              Tüm işlemler tek tıkla, kullanıcıdan ekstra dosya yüklemesi veya manuel işlem gerektirmeden otomatik olarak gerçekleştirilir. Kullanıcı dostu arayüz ile hızlı ve pratik kullanım sağlar.
            </li>
          </ul>
          
          {/* YouTube Channel Link */}
          <div className="text-center mt-4">
            <a 
              href="https://youtube.com/@katipotomasyonu" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-decoration-none"
              title="YouTube Kanalımız"
            >
              <div className="btn btn-danger btn-lg rounded-circle p-3 mb-2"
                   style={{ 
                     width: '100px', 
                     height: '100px', 
                     display: 'inline-flex', 
                     alignItems: 'center', 
                     justifyContent: 'center',
                     fontSize: '48px'
                   }}>
                <i className="bi bi-youtube"></i>
              </div>
              <div style={{ color: '#dc3545', fontWeight: '500', fontSize: '16px' }}>
                YouTube Kanalımız
              </div>
            </a>
          </div>
        </div>
      </div>
    </>
  );
}

export default FeaturesPage;
