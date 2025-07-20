import React, { useState } from 'react';
import PageLoadingSpinner from '../components/PageLoadingSpinner';

function AboutPage() {
  const [loading] = useState(false); // Remove setLoading

  return (
    <>
      <PageLoadingSpinner show={loading} fullscreen />
      <div className="container py-5">
        <h2 className="mb-4">Hakkımızda</h2>
        <p>
          <b>Katip Otomasyonu</b>, Arkaya Arge Yazılım İnşaat Ticaret Ltd.Şti. tarafından Isparta'da kurulmuş ve geliştirilmektedir. Şirketimiz, iş sağlığı ve güvenliği alanında dijitalleşmeyi ve otomasyonu destekleyen yenilikçi SaaS (Software as a Service) çözümler üretmeye odaklanmıştır.
        </p>
        <p>
          Amacımız, İSG-Katip kullanıcılarının iş süreçlerini kolaylaştırmak, zamandan tasarruf etmelerini sağlamak ve mevzuata tam uyumlu, güvenli, hızlı ve kullanıcı dostu yazılımlar sunmaktır. Katip Otomasyonu, işyeri hekimi, iş güvenliği uzmanı ve diğer sağlık personeli atamaları, sözleşme yönetimi ve raporlama gibi süreçleri otomatikleştirerek kurumların verimliliğini artırır.
        </p>
        <div className="row g-4 mb-4 justify-content-center">
          <div className="col-md-6">
            <div className="card h-100 shadow-sm">
              <div className="card-body d-flex flex-column align-items-center text-center">
                <img src="https://media.licdn.com/dms/image/v2/D4E03AQHOn7ZA7qk13A/profile-displayphoto-shrink_200_200/profile-displayphoto-shrink_200_200/0/1729455741506?e=1755734400&v=beta&t=AgG5fXzQXD9AozvyP9EUoUPvxecPEgmsQUBlMuZRylI" alt="Yusuf Kaya" className="rounded-circle mb-3" style={{ width: 80, height: 80, objectFit: 'cover' }} />
                <h5 className="card-title mb-1">Yusuf Kaya</h5>
                <p className="mb-1">Co-Founder | DevOps Engineer</p>
                <div className="d-flex justify-content-center align-items-center gap-3 mb-2">
                  <a href="https://www.linkedin.com/in/yusufkayatr96/" target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center' }}>
                    <img src="https://upload.wikimedia.org/wikipedia/commons/8/81/LinkedIn_icon.svg" alt="LinkedIn" style={{ width: 32, height: 32, display: 'block' }} />
                  </a>
                  <a href="https://medium.com/@yusufkayatr96" target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center' }}>
                    <img src="https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/medium.svg" alt="Medium" style={{ width: 32, height: 32, background: '#fff', borderRadius: '50%', padding: 2, display: 'block' }} />
                  </a>
                  <a href="mailto:yusuf@katipotomasyonu.com" target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center' }}>
                    <i className="bi bi-envelope-fill" style={{ fontSize: 32, color: '#0d6efd', verticalAlign: 'middle', display: 'block' }}></i>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="alert alert-light border mt-4" style={{ maxWidth: 400, margin: '0 auto' }}>
          Genel destek için: <a href="mailto:info@katipotomasyonu.com">info@katipotomasyonu.com</a>
        </div>
      </div>
    </>
  );
}

export default AboutPage;
