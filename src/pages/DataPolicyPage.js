import React, { useState } from 'react';
import PageLoadingSpinner from '../components/PageLoadingSpinner';

function DataPolicyPage() {
  const [loading] = useState(false); // Remove setLoading

  return (
    <>
      <PageLoadingSpinner show={loading} fullscreen />
      <div>
        <h2 className="mb-4">Kişisel Verilerin Korunması Politikası (KVKK)</h2>
        <p>
          Katip Otomasyonu, 6698 sayılı Kişisel Verilerin Korunması Kanunu'na (KVKK) tam uyumlu olarak geliştirilmiştir. Kişisel veriler, yalnızca uzantının ve web sitesinin işlevlerini yerine getirmek için ve kullanıcının açık rızası ile işlenir. Kişisel veriler, uzantı tarafından harici bir sunucuda saklanmaz, sadece geçici olarak kullanılır.
        </p>
        <p>
          Lisans doğrulama sırasında iletilen lisans anahtarı, lisans kontrolü amacıyla işlenir ve Arkaya Arge Yazılım İnşaat Ticaret Ltd.Şti. kontrolündeki harici bir sunucuda (ör. AWS) saklanır. Kullanıcı, dilediği zaman verilerinin silinmesini talep edebilir. info@arkaya.com.tr adresine başvurarak bu hakkını kullanabilir. Kişisel veriler, üçüncü şahıslarla paylaşılmaz. Veri güvenliği için gerekli tüm teknik ve idari tedbirler alınır.
        </p>
        <p>
          Veri sorumlusu: Arkaya Arge Yazılım İnşaat Ticaret Ltd.Şti. | info@arkaya.com.tr
        </p>
        <p>
          Kayıt ve lisanslama sürecinde alınan telefon numarası, şirket adı ve OSGB-ID bilgileri, yalnızca lisans doğrulama ve müşteri kaydı amacıyla işlenir ve saklanır.
        </p>
        <p>
          Haklarınız ve başvuru yöntemleriniz için lütfen Gizlilik Sözleşmesi sayfasını inceleyiniz.
        </p>
      </div>
    </>
  );
}

export default DataPolicyPage;
