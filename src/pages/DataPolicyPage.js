import React, { useState } from 'react';
import PageLoadingSpinner from '../components/PageLoadingSpinner';
import { useContract } from '../hooks/useContracts';

function DataPolicyPage() {
  const [loading] = useState(false); // Remove setLoading
  const { contract, loading: contractLoading, error } = useContract('kvkk_consent');

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
            <p className="mt-2">KVKK Politikası yükleniyor...</p>
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
          <h2 className="mb-4">Kişisel Verilerin Korunması Politikası (KVKK)</h2>
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
          <h2 className="mb-4">{contract?.title || 'Kişisel Verilerin Korunması Politikası (KVKK)'}</h2>
        )}
        
        <div className="contract-content" style={{whiteSpace: 'pre-line', lineHeight: '1.6'}}>
          {contract?.content || `Katip Otomasyonu, 6698 sayılı Kişisel Verilerin Korunması Kanunu'na (KVKK) tam uyumlu olarak geliştirilmiştir. Kişisel veriler, yalnızca uzantının ve web sitesinin işlevlerini yerine getirmek için ve kullanıcının açık rızası ile işlenir. Kişisel veriler, uzantı tarafından harici bir sunucuda saklanmaz, sadece geçici olarak kullanılır.

Lisans doğrulama sırasında iletilen lisans anahtarı, lisans kontrolü amacıyla işlenir ve Arkaya Arge Yazılım İnşaat Ticaret Ltd.Şti. kontrolündeki harici bir sunucuda (ör. AWS) saklanır. Kullanıcı, dilediği zaman verilerinin silinmesini talep edebilir. info@arkaya.com.tr adresine başvurarak bu hakkını kullanabilir. Kişisel veriler, üçüncü şahıslarla paylaşılmaz. Veri güvenliği için gerekli tüm teknik ve idari tedbirler alınır.

Veri sorumlusu: Arkaya Arge Yazılım İnşaat Ticaret Ltd.Şti. | info@arkaya.com.tr

Kayıt ve lisanslama sürecinde alınan telefon numarası, şirket adı ve OSGB-ID bilgileri, yalnızca lisans doğrulama ve müşteri kaydı amacıyla işlenir ve saklanır.

Haklarınız ve başvuru yöntemleriniz için lütfen Gizlilik Sözleşmesi sayfasını inceleyiniz.`}
        </div>
      </div>
    </>
  );
}

export default DataPolicyPage;
