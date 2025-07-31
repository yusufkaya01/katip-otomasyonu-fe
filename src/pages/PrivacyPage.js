import React, { useState } from 'react';
import PageLoadingSpinner from '../components/PageLoadingSpinner';
import { useContract } from '../hooks/useContracts';

function PrivacyPage() {
  const [loading] = useState(false);
  const { contract, loading: contractLoading, error } = useContract('privacy_policy');

  // Show loading while contract is being fetched
  if (contractLoading) {
    return (
      <>
        <PageLoadingSpinner show={true} fullscreen />
        <div className="container py-5">
          <div className="text-center">
            <div className="spinner-border text-danger" role="status">
              <span className="visually-hidden">Yükleniyor...</span>
            </div>
            <p className="mt-2">Gizlilik Sözleşmesi yükleniyor...</p>
          </div>
        </div>
      </>
    );
  }

  // Show error if contract failed to load
  if (error) {
    return (
      <>
        <PageLoadingSpinner show={loading} fullscreen />
        <div className="container py-5">
          <h2 className="mb-4">Gizlilik Sözleşmesi</h2>
          <div className="alert alert-warning">
            <h5>Sözleşme yüklenemedi</h5>
            <p>{error}</p>
            <button className="btn btn-outline-danger" onClick={() => window.location.reload()}>
              Tekrar Dene
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <PageLoadingSpinner show={loading} fullscreen />
      <div className="container py-5">
        {contract?.version && contract?.effectiveDate && (
          <div className="contract-meta mb-4 p-3 bg-light rounded">
            <h2 className="mb-3">{contract.title}</h2>
            <small className="text-muted">
              <strong>Versiyon:</strong> {contract.version} | {' '}
              <strong>Yürürlük Tarihi:</strong> {new Date(contract.effectiveDate).toLocaleDateString('tr-TR')}
            </small>
          </div>
        )}
        
        {(!contract?.version || !contract?.effectiveDate) && (
          <h2 className="mb-4">{contract?.title || 'Gizlilik Sözleşmesi'}</h2>
        )}
        
        <div className="contract-content" style={{whiteSpace: 'pre-line', lineHeight: '1.6'}}>
          {contract?.content || `Katip Otomasyonu web sitesi ve Chrome uzantısı, Arkaya Arge Yazılım İnşaat Ticaret Ltd.Şti. tarafından işletilmektedir. Kayıt (üye olma) işlemi sırasında sizden şirket adı, e-posta, telefon, OSGB-ID, adres, vergi numarası ve benzeri bilgiler yalnızca lisans doğrulama ve müşteri kaydı amacıyla alınır ve güvenli şekilde saklanır. Bu bilgiler hiçbir şekilde üçüncü şahıslarla paylaşılmaz, satılmaz veya ticari amaçla kullanılmaz.

Uzantı (Chrome eklentisi) ile web sitesi (katipotomasyonu.com) birbirinden bağımsız çalışır. Uzantı üzerinden yalnızca lisans anahtarınız doğrulama amacıyla sunucularımıza iletilir. İSG Katip web sitesinden veya uzantıdan, lisans anahtarı dışında herhangi bir ek bilgi veya veri sunucularımıza gönderilmez. Uzantı, İSG Katip platformunda işlem yaparken, kişisel verilerinizi harici olarak saklamaz ve yalnızca geçici olarak kullanır.

Kayıt ve lisanslama sürecinde alınan bilgiler (şirket adı, e-posta, telefon, OSGB-ID, adres, vergi numarası vb.) yalnızca lisans doğrulama ve müşteri kaydı amacıyla işlenir ve saklanır. Bu bilgiler, yasal yükümlülükler dışında hiçbir şekilde üçüncü şahıslarla paylaşılmaz.

Katip Otomasyonu, 6698 sayılı Kişisel Verilerin Korunması Kanunu'na (KVKK) tam uyumlu olarak geliştirilmiştir. Kişisel verileriniz, yalnızca açık rızanız ile işlenir ve saklanır. Kullanıcı, dilediği zaman verilerinin silinmesini talep edebilir. info@arkaya.com.tr adresine başvurarak bu hakkını kullanabilir.

Uzantı ve web sitesi üzerinden alınan hiçbir kişisel veri, üçüncü şahıslarla paylaşılmaz, satılmaz veya ticari amaçla kullanılmaz. Tüm verilerinizin güvenliği için gerekli teknik ve idari tedbirler alınır.

Detaylı bilgi ve başvuru için: info@arkaya.com.tr`}
        </div>
      </div>
    </>
  );
}

export default PrivacyPage;
