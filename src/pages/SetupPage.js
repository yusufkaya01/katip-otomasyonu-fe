import React, { useState } from 'react';
import PageLoadingSpinner from '../components/PageLoadingSpinner';

function SetupPage() {
  const [loading] = useState(false);

  return (
    <>
      <PageLoadingSpinner show={loading} fullscreen />
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
        <div className="alert alert-info" style={{ maxWidth: 700, margin: '0 auto' }}>
          <b>Ek Bilgi:</b> Uzantıyı sabitlemek (raptiye simgesiyle) uzantıya hızlı erişim sağlar ve her zaman tarayıcıda görünür olmasını kolaylaştırır.
        </div>
      </div>
    </>
  );
}

export default SetupPage;
