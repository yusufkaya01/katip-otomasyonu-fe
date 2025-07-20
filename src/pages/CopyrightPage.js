import React, { useState } from 'react';
import PageLoadingSpinner from '../components/PageLoadingSpinner';

function CopyrightPage() {
  const [loading, setLoading] = useState(false);

  return (
    <>
      <PageLoadingSpinner show={loading} fullscreen />
      <div>
        <h2 className="mb-4">Telif Hakkı</h2>
        <p>
          Katip Otomasyonu uzantısının ve web sitesinin tüm kodları, görselleri, dokümantasyonu ve marka hakları Arkaya Arge Yazılım İnşaat Ticaret Ltd.Şti.'ye aittir. Kodların, görsellerin ve dokümantasyonun izinsiz kopyalanması, dağıtılması veya değiştirilmesi yasaktır.
        </p>
        <p>
          Üçüncü parti kütüphaneler ilgili lisansları ile kullanılır ve bu lisanslara uyulur. Kullanıcılar, uzantıyı ve web sitesini yalnızca kendi kurumları için kullanabilir, ticari olarak satamaz, çoğaltamaz veya dağıtamaz. Katip Otomasyonu'nun marka ve telif hakları Arkaya Arge Yazılım İnşaat Ticaret Ltd.Şti.'nin izni olmadan kullanılamaz.
        </p>
        <p>
          Sitede yer alan ticari unvan, marka, logo, alan adı ve benzeri diğer tüm unsur ve içeriklerin fikrî ve sınai mülkiyet hakları veya kullanım lisansı Arkaya Arge Yazılım İnşaat Ticaret Ltd.Şti.'ye aittir. Kullanıcıya yalnızca şahsi kullanım ile sınırlı, münhasır olmayan, devredilemez ve değiştirilemez bir kullanım lisansı verilmektedir. Sitenin tamamı veya bir kısmı, herhangi bir yöntemle kopyalanamaz, çoğaltılamaz, dağıtılamaz, yayımlanamaz, ödünç verilemez, içeriği değiştirilemez veya tahrip edilemez.
        </p>
        <p>
          Detaylı bilgi için info@arkaya.com.tr adresine başvurabilirsiniz.
        </p>
      </div>
    </>
  );
}

export default CopyrightPage;
