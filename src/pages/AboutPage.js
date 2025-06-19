import React from 'react';

function AboutPage() {
  return (
    <div className="container py-5">
      <h2 className="mb-4">Hakkımızda</h2>
      <p>
        <b>Katip Otomasyonu</b>, Arkaya Arge Yazılım İnşaat Ticaret Ltd.Şti. tarafından Isparta'da kurulmuş ve geliştirilmektedir. Şirketimiz, iş sağlığı ve güvenliği alanında dijitalleşmeyi ve otomasyonu destekleyen yenilikçi SaaS (Software as a Service) çözümler üretmeye odaklanmıştır.
      </p>
      <p>
        Amacımız, İSG-Katip kullanıcılarının iş süreçlerini kolaylaştırmak, zamandan tasarruf etmelerini sağlamak ve mevzuata tam uyumlu, güvenli, hızlı ve kullanıcı dostu yazılımlar sunmaktır. Katip Otomasyonu, işyeri hekimi, iş güvenliği uzmanı ve diğer sağlık personeli atamaları, sözleşme yönetimi ve raporlama gibi süreçleri otomatikleştirerek kurumların verimliliğini artırır.
      </p>
      <div className="row g-4 mb-4">
        <div className="col-md-6">
          <div className="card h-100 shadow-sm">
            <div className="card-body d-flex flex-column align-items-center text-center">
              <img src="https://media.licdn.com/dms/image/v2/D4E03AQHOn7ZA7qk13A/profile-displayphoto-shrink_200_200/profile-displayphoto-shrink_200_200/0/1729455741506?e=1755734400&v=beta&t=AgG5fXzQXD9AozvyP9EUoUPvxecPEgmsQUBlMuZRylI" alt="Yusuf Kaya" className="rounded-circle mb-3" style={{ width: 80, height: 80, objectFit: 'cover' }} />
              <h5 className="card-title mb-1">Yusuf Kaya</h5>
              <p className="mb-1">Co-Founder | DevOps Engineer</p>
              <a href="https://www.linkedin.com/in/yusufkayatr96/" target="_blank" rel="noopener noreferrer" className="btn btn-outline-primary btn-sm mb-2">LinkedIn Profili</a>
              <div className="small">E-posta: <a href="mailto:yusuf@katipotomasyonu.com">yusuf@katipotomasyonu.com</a></div>
            </div>
          </div>
        </div>
        <div className="col-md-6">
          <div className="card h-100 shadow-sm">
            <div className="card-body d-flex flex-column align-items-center text-center">
              <img src="https://media.licdn.com/dms/image/D4D03AQF1QnQw1Qw1xA/profile-displayphoto-shrink_200_200/0/1700000000000?e=1721865600&v=beta&t=example2" alt="Mustafa Arslan" className="rounded-circle mb-3" style={{ width: 80, height: 80, objectFit: 'cover' }} />
              <h5 className="card-title mb-1">Mustafa Arslan</h5>
              <p className="mb-1">Co-Founder | İnşaat Mühendisi</p>
              <a href="https://www.linkedin.com/in/mustafa-arslan-bb14b3335/" target="_blank" rel="noopener noreferrer" className="btn btn-outline-primary btn-sm mb-2">LinkedIn Profili</a>
              <div className="small">E-posta: <a href="mailto:mustafa@katipotomasyonu.com">mustafa@katipotomasyonu.com</a></div>
            </div>
          </div>
        </div>
      </div>
      <div className="alert alert-light border mt-4" style={{ maxWidth: 700, margin: '0 auto' }}>
        Genel destek için: <a href="mailto:info@katipotomasyonu.com">info@katipotomasyonu.com</a>
      </div>
    </div>
  );
}

export default AboutPage;
