import React, { useState } from 'react';
import PageLoadingSpinner from '../components/PageLoadingSpinner';
import { useContract } from '../hooks/useContracts';

function TermsPage() {
  const [loading] = useState(false);
  const { contract, loading: contractLoading, error } = useContract('terms_of_use');

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
            <p className="mt-2">Kullanım Koşulları yükleniyor...</p>
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
          <h2 className="mb-4">Kullanım Koşulları</h2>
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
          <h2 className="mb-4">{contract?.title || 'Kullanım Koşulları'}</h2>
        )}
        
        <div className="contract-content" style={{whiteSpace: 'pre-line', lineHeight: '1.6'}}>
          {contract?.content || `Katip Otomasyonu, yalnızca geçerli bir lisans anahtarı ile kullanılabilir. Kullanıcı, uzantıyı ve web sitesini yalnızca yasal amaçlarla ve isgkatip.csgb.gov.tr platformunda kullanmayı kabul eder. Uzantı ve web sitesi, isgkatip.csgb.gov.tr'nin kullanım koşullarına ve Türk mevzuatına aykırı şekilde kullanılamaz.

Kullanıcı, uzantının ve web sitesinin işlevlerini kötüye kullanmayacağını, başkalarının verilerine izinsiz erişmeyeceğini ve uzantıyı sadece kendi kurumunun işlemleri için kullanacağını taahhüt eder. Geliştirici (Arkaya Arge Yazılım İnşaat Ticaret Ltd.Şti.), uzantının yanlış veya izinsiz kullanımından doğacak zararlardan sorumlu değildir.

Lisans anahtarının paylaşılması, çoğaltılması veya izinsiz kullanımı yasaktır. Tespit halinde lisans iptal edilir. Uzantı ve web sitesi, Arkaya Arge Yazılım İnşaat Ticaret Ltd.Şti. tarafından güncellenebilir veya sonlandırılabilir.

Uygulamayı kullanan veya lisans satın alan kullanıcılar, ilk kayıt sırasında talep edilen şirket adı, e-posta adresi, telefon numarası, OSGB Yetki Belgesi No, adres, vergi kimlik numarası, vergi dairesi, şehir ve ilçe bilgilerinin lisans doğrulama ve müşteri kaydı amacıyla saklanmasını kabul etmiş sayılır.

Detaylı bilgi için info@arkaya.com.tr adresine başvurabilirsiniz.`}
        </div>
      </div>
    </>
  );
}

export default TermsPage;
