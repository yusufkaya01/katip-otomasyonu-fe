import React, { useState } from 'react';
import PageLoadingSpinner from '../components/PageLoadingSpinner';

function FAQPage() {
  const [loading] = useState(false); // Remove setLoading

  return (
    <>
      <PageLoadingSpinner show={loading} fullscreen />
      <div className="container py-5">
        <h1 className="mb-4 text-center">Sıkça Sorulan Sorular (SSS)</h1>
        <div className="accordion" id="faqAccordion" style={{ maxWidth: 800, margin: '0 auto' }}>
          <div className="accordion-item">
            <h2 className="accordion-header" id="heading1">
              <button className="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#collapse1" aria-expanded="true" aria-controls="collapse1">
                Katip Otomasyonu uzantısı nedir ve ne işe yarar?
              </button>
            </h2>
            <div id="collapse1" className="accordion-collapse collapse show" aria-labelledby="heading1" data-bs-parent="#faqAccordion">
              <div className="accordion-body">
                Katip Otomasyonu, isgkatip.csgb.gov.tr platformunda İş Güvenliği Uzmanı, İşyeri Hekimi ve Diğer Sağlık Personeli atamalarını ve ilgili raporları otomatikleştirmenize yardımcı olan bir Chrome uzantısıdır.
              </div>
            </div>
          </div>
          <div className="accordion-item">
            <h2 className="accordion-header" id="heading2">
              <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapse2" aria-expanded="false" aria-controls="collapse2">
                Uzantıyı kullanmak için neye ihtiyacım var?
              </button>
            </h2>
            <div id="collapse2" className="accordion-collapse collapse" aria-labelledby="heading2" data-bs-parent="#faqAccordion">
              <div className="accordion-body">
                Uzantıyı kullanabilmek için geçerli bir lisans anahtarınızın olması gerekmektedir. Lisans anahtarınızı Arkaya Arge Yazılım İnşaat Ticaret Ltd.Şti. üzerinden temin edebilirsiniz.
              </div>
            </div>
          </div>
          <div className="accordion-item">
            <h2 className="accordion-header" id="heading3">
              <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapse3" aria-expanded="false" aria-controls="collapse3">
                Lisans anahtarımı nasıl girerim?
              </button>
            </h2>
            <div id="collapse3" className="accordion-collapse collapse" aria-labelledby="heading3" data-bs-parent="#faqAccordion">
              <div className="accordion-body">
                Uzantıyı yükledikten sonra açılan ekranda size verilen lisans anahtarınızı girip “Gönder” butonuna tıklamanız yeterlidir.
              </div>
            </div>
          </div>
          <div className="accordion-item">
            <h2 className="accordion-header" id="heading4">
              <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapse4" aria-expanded="false" aria-controls="collapse4">
                Hangi verilerim saklanıyor?
              </button>
            </h2>
            <div id="collapse4" className="accordion-collapse collapse" aria-labelledby="heading4" data-bs-parent="#faqAccordion">
              <div className="accordion-body">
                Sadece lisans anahtarınız ve kayıt sırasında verdiğiniz telefon numarası, şirket adı ve OSGB bilgileri güvenli şekilde saklanır. Kişisel verileriniz, KVKK kapsamında korunur ve üçüncü kişilerle paylaşılmaz.
              </div>
            </div>
          </div>
          <div className="accordion-item">
            <h2 className="accordion-header" id="heading5">
              <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapse5" aria-expanded="false" aria-controls="collapse5">
                Uzantı verilerimi saklıyor mu veya bir yere gönderiyor mu?
              </button>
            </h2>
            <div id="collapse5" className="accordion-collapse collapse" aria-labelledby="heading5" data-bs-parent="#faqAccordion">
              <div className="accordion-body">
                Uzantı hiçbir verinizi kaydetmez ve başka bir sunucu ile paylaşmaz. Katip Otomasyonu uygulaması yalnızca elle yaptığınız işlemleri daha hızlı yapmanızı sağlar. Yalnızca lisans anahtarı, son kullanım tarihi gibi bilgilerin teyiti için lisans doğrulaması yapılır.
              </div>
            </div>
          </div>
          <div className="accordion-item">
            <h2 className="accordion-header" id="heading6">
              <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapse6" aria-expanded="false" aria-controls="collapse6">
                Uzantı hangi işlemleri otomatikleştirir?
              </button>
            </h2>
            <div id="collapse6" className="accordion-collapse collapse" aria-labelledby="heading6" data-bs-parent="#faqAccordion">
              <div className="accordion-body">
                İş Güvenliği Uzmanı, İşyeri Hekimi ve Diğer Sağlık Personeli atama raporlarını, sözleşme kontrollerini ve ilgili raporların indirilmesini otomatikleştirir.
              </div>
            </div>
          </div>
          <div className="accordion-item">
            <h2 className="accordion-header" id="heading7">
              <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapse7" aria-expanded="false" aria-controls="collapse7">
                Uzantı güvenli mi?
              </button>
            </h2>
            <div id="collapse7" className="accordion-collapse collapse" aria-labelledby="heading7" data-bs-parent="#faqAccordion">
              <div className="accordion-body">
                Evet. Tüm verileriniz güvenli sunucularda saklanır ve hiçbir şekilde üçüncü şahıslarla paylaşılmaz.
              </div>
            </div>
          </div>
          <div className="accordion-item">
            <h2 className="accordion-header" id="heading8">
              <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapse8" aria-expanded="false" aria-controls="collapse8">
                Destek veya yardım almak için nereye başvurabilirim?
              </button>
            </h2>
            <div id="collapse8" className="accordion-collapse collapse" aria-labelledby="heading8" data-bs-parent="#faqAccordion">
              <div className="accordion-body">
                Her türlü soru ve destek talepleriniz için <a href="mailto:info@katipotomasyonu.com">info@katipotomasyonu.com</a> adresine e-posta gönderebilirsiniz.
              </div>
            </div>
          </div>
          <div className="accordion-item">
            <h2 className="accordion-header" id="heading9">
              <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapse9" aria-expanded="false" aria-controls="collapse9">
                Ürün ile ilgili fatura alabilir miyim?
              </button>
            </h2>
            <div id="collapse9" className="accordion-collapse collapse" aria-labelledby="heading9" data-bs-parent="#faqAccordion">
              <div className="accordion-body">
                Tüm müşterilerimize satın alımlarından sonra fatura kesmekteyiz, kayıt esnasında fatura bilgilerinizi doğru yazdığınızdan emin olunuz. Kayıt sırasında hatalı bir bilgi girdiyseniz 'İşletmem' sayfasından bilgilerinizi güncelleyebilirsiniz.
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default FAQPage;
