import React from 'react';

function FAQPage() {
  return (
    <div>
      <h2 className="mb-4">Sıkça Sorulan Sorular (SSS)</h2>
      <dl>
        <dt>Katip Otomasyonu nedir?</dt>
        <dd>isgkatip platformunda sözleşme güncellemelerini ve yönetimini otomatikleştiren bir Chrome eklentisidir.</dd>
        <dt>Lisans anahtarı nasıl alınır?</dt>
        <dd>info@katipotomasyonu.com adresine e-posta göndererek veya web sitemizden başvurarak lisans anahtarı alabilirsiniz.</dd>
        <dt>Kişisel verilerim güvende mi?</dt>
        <dd>Evet, sadece lisans anahtarınız doğrulama için sunucumuza gönderilir. Başka hiçbir veri paylaşılmaz.</dd>
      </dl>
    </div>
  );
}

export default FAQPage;
