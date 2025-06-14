import React from 'react';

function SetupPage() {
  return (
    <div>
      <h2 className="mb-4">Kurulum ve Kullanım</h2>
      <ol className="mb-4">
        <li>Chrome Web Mağazası'ndan Otomasyon Katibi eklentisini yükleyin.</li>
        <li>Eklentiyi açın ve lisans anahtarınızı girin.</li>
        <li>İstediğiniz özelliği yan panelden seçin ve kullanmaya başlayın.</li>
      </ol>
      <div className="alert alert-warning" role="alert">
        Eklentiyi kullanabilmek için geçerli bir lisans anahtarı gereklidir.
      </div>
    </div>
  );
}

export default SetupPage;
