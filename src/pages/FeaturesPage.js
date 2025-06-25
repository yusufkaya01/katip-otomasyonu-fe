import React from 'react';
import { useNavigate } from 'react-router-dom';

function FeaturesPage() {
  const navigate = useNavigate();

  return (
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
        onClick={() => navigate('/kayit')}
      />
      <div className="container py-5">
        <h1 className="mb-4 text-center">Özellikler</h1>
        <ul className="list-group list-group-flush feature-list-animated mx-auto" style={{ maxWidth: 700 }}>
          <li className="list-group-item mb-3">
            <strong>Sözleşme Sürelerini Otomatik Güncelleme</strong><br />
            İSG-Katip platformundaki iş güvenliği sözleşmelerinizin sürelerini tek tıkla toplu ve otomatik olarak güncelleyebilirsiniz. Manuel işlem ihtiyacını ortadan kaldırır, zamandan tasarruf sağlar.
          </li>
          <li className="list-group-item mb-3">
            <strong>Firma İş Güvenliği Uzmanı, İşyeri Hekimi ve Diğer Sağlık Personeli Atama Durumu Raporu</strong><br />
            Çalıştığınız firmalarda İş Güvenliği Uzmanı, İşyeri Hekimi ve Diğer Sağlık Personeli atamalarının yapılıp yapılmadığını ve onay durumlarını otomatik olarak raporlar. Raporlar renkli ve kolay anlaşılır şekilde sunulur.
          </li>
          <li className="list-group-item mb-3">
            <strong>Kalan Personel Çalışma Dakikalarını Görüntüleme</strong><br />
            Tüm İş Güvenliği Uzmanı, İşyeri Hekimi ve Diğer Sağlık Personellerinizin kalan çalışma dakikalarını ve uzmanlık sınıflarını anlık olarak listeleyebilirsiniz. Eksik veya fazla süreleri kolayca takip edebilirsiniz.
          </li>
          <li className="list-group-item mb-3">
            <strong>Sözleşme Uyum Kontrolü ve Güncellenmesi Gerekenler</strong><br />
            Mevzuata uygun olmayan sözleşmeleri tespit eder, eksik veya hatalı olanları listeler ve toplu güncelleme imkanı sunar. Hatalı işlemler için detaylı hata raporu sağlar.
          </li>
          <li className="list-group-item mb-3">
            <strong>Renkli ve İndirilebilir Raporlar</strong><br />
            Tüm raporlar Excel (XLSX) formatında, kolayca indirilebilir ve paylaşılabilir şekilde hazırlanır. Raporlarda önemli durumlar renklerle vurgulanır.
          </li>
          <li className="list-group-item mb-3">
            <strong>Lisans ve Kullanıcı Yönetimi</strong><br />
            Lisans anahtarı ile güvenli kullanım, sözleşme sayısına göre esnek lisanslama ve şirket bazlı yetkilendirme desteği sunar.
          </li>
          <li className="list-group-item mb-3">
            <strong>Tam Otomasyon ve Kolay Kullanım</strong><br />
            Tüm işlemler tek tıkla, kullanıcıdan ekstra dosya yüklemesi veya manuel işlem gerektirmeden otomatik olarak gerçekleştirilir. Kullanıcı dostu arayüz ile hızlı ve pratik kullanım sağlar.
          </li>
        </ul>
      </div>
    </div>
  );
}

export default FeaturesPage;
