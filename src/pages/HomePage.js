import React from 'react';

function HomePage() {
  return (
    <div>
      <section className="text-center mb-5">
        <img src="/logo192.png" alt="Katip Otomasyonu Logo" style={{ width: 96, height: 96 }} className="mb-3" />
        <h1 className="mb-3">Katip Otomasyonu</h1>
        <h2 className="mb-4">Katip Otomasyonu Nedir?</h2>
        <p className="lead mb-4">
          Katip Otomasyonu, isgkatip platformunda sözleşme güncellemelerini ve yönetimini otomatikleştiren, güvenli ve hızlı bir Chrome eklentisidir. Tüm işlemlerinizde zaman kazanın ve hatasız yönetim sağlayın.
        </p>
        <ul className="list-group mb-4 mx-auto" style={{ maxWidth: 400 }}>
          <li className="list-group-item">isgkatip ile tam uyumlu</li>
          <li className="list-group-item">Kullanıcı dostu yan panel arayüzü</li>
          <li className="list-group-item">Gelişmiş lisans ve güvenlik kontrolleri</li>
          <li className="list-group-item">Verileriniz güvende, sadece lisans anahtarınız doğrulanır</li>
        </ul>
      </section>
      <section>
        <h2 className="mb-3">Ekran Görüntüleri</h2>
        <div className="text-center">
          <img src="/logo192.png" alt="Katip Otomasyonu Logo" style={{ width: 96, height: 96 }} />
        </div>
      </section>
    </div>
  );
}

export default HomePage;
